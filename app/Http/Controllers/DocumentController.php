<?php

namespace App\Http\Controllers;

use App\Enums\DocumentStatus;
use App\Models\Document;
use App\Models\DocumentVersion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DocumentController extends Controller
{
    /**
     * Show the print view for the document.
     */
    public function print(Document $document)
    {
        return view('documents.print', ['document' => $document]);
    }

    /**
     * Display a listing of documents based on user role.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Get documents filtered by user role and search criteria
        $documents = Document::forUser($user)
            ->search($request->all())
            ->with('author')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($documents);
    }

    /**
     * Store a newly created document.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:nota,sppd,perj',
            'status' => 'sometimes|string',
            'content_data' => 'sometimes|array',
            'history_log' => 'sometimes|array',
            'target' => 'sometimes|array',
            'folder_id' => 'nullable|exists:folders,id',
            'deadline' => 'nullable|date',
            'approval_count' => 'nullable|integer|min:0|max:10',
            'approvals' => 'nullable|array',
            'approvals.*.position' => 'nullable|in:direksi,kadiv,kabid,staff',
            'approvals.*.approver_id' => 'nullable|exists:users,id',
        ]);

        $user = Auth::user();

        $contentData = $validated['content_data'] ?? [];
        
        // Ensure defaults for new requirements
        if (!isset($contentData['to'])) $contentData['to'] = [''];
        if (!isset($contentData['from'])) $contentData['from'] = $user->name;
        if (!isset($contentData['signerName'])) $contentData['signerName'] = $user->name;
        if (!isset($contentData['signerPosition'])) $contentData['signerPosition'] = strtoupper($user->position ?? '');
        if (!isset($contentData['paraf'])) $contentData['paraf'] = [['code' => '', 'name' => '', 'signature' => '']];

        $document = Document::create([
            'title' => $validated['title'],
            'type' => $validated['type'],
            'status' => $validated['status'] ?? DocumentStatus::DRAFT,
            'author_id' => $user->id,
            'author_name' => $user->name,
            'content_data' => $contentData,
            'history_log' => $validated['history_log'] ?? [],
            'target_role' => $validated['target']['type'] ?? null,
            'target_value' => $validated['target']['value'] ?? null,
            'folder_id' => $validated['folder_id'] ?? null,
            'version' => '1.0',
            'deadline' => $validated['deadline'] ?? null,
            'approval_count' => $validated['approval_count'] ?? 0,
        ]);

        // Create initial version
        DocumentVersion::create([
            'document_id' => $document->id,
            'version_number' => '1.0',
            'content_data' => $document->content_data,
            'updated_by' => $user->id,
        ]);

        // Create initial log entry
        $document->createLog('created', $user, 'Dokumen dibuat');

        // Create approval records if specified
        if (isset($validated['approvals']) && count($validated['approvals']) > 0) {
            foreach ($validated['approvals'] as $index => $approvalData) {
                $document->approvals()->create([
                    'sequence' => $index + 1,
                    'approver_position' => $approvalData['position'] ?? null,
                    'approver_id' => $approvalData['approver_id'] ?? null,
                    'status' => 'pending',
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'id' => $document->id,
            'document' => $document->load(['logs', 'approvals']),
        ], 201);
    }

    /**
     * Display the specified document.
     */
    public function show(Document $document)
    {
        $user = Auth::user();

        // Mark document as read
        $document->markAsRead($user);

        // Get all groups user belongs to
        $groupNames = $user->groups()->pluck('name')->push($user->group_name)->filter()->unique()->toArray();

        // If opened by receiver group member and status is 'sent', update to 'received'
        if ($document->status === DocumentStatus::SENT && 
            $document->target_role === 'group' && 
            in_array($document->target_value, $groupNames)) {
            $oldStatus = $document->status;
            $document->update(['status' => DocumentStatus::RECEIVED]);
            $document->createLog('received', $user, 'Dokumen diterima oleh ' . $document->target_value, $oldStatus, DocumentStatus::RECEIVED);
        }

        $document->load(['author', 'logs', 'approvals.approver', 'readReceipts.user', 'folder']);
        return response()->json($document);
    }

    /**
     * Update the specified document.
     */
    public function update(Request $request, Document $document)
    {
        $user = Auth::user();

        // Prevent editing final documents
        if ($document->isFinal() && !$request->has('status') && !$request->has('target')) {
            // We allow updating status (e.g. from APPROVED to SENT during distribution) 
            // and target, but NOT content_data
            if ($request->has('content_data')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dokumen final tidak dapat diubah kontennya.',
                ], 422);
            }
        }

        $validated = $request->validate([
            'status' => 'sometimes|string',
            'content_data' => 'sometimes|array',
            'history_log' => 'sometimes|array',
            'feedback' => 'sometimes|string|nullable',
            'forward_note' => 'sometimes|string|nullable',
            'target' => 'sometimes|array',
            'folder_id' => 'nullable|exists:folders,id',
            'deadline' => 'nullable|date',
            'increment_version' => 'sometimes|boolean',
        ]);

        $user = Auth::user();
        $updateData = [];
        $oldStatus = $document->status;

        if (isset($validated['status'])) {
            $updateData['status'] = $validated['status'];
        }

        if (isset($validated['content_data'])) {
            $updateData['content_data'] = $validated['content_data'];
        }

        if (isset($validated['history_log'])) {
            $updateData['history_log'] = $validated['history_log'];
        }

        if (array_key_exists('feedback', $validated)) {
            $updateData['feedback'] = $validated['feedback'];
        }

        if (array_key_exists('forward_note', $validated)) {
            $updateData['forward_note'] = $validated['forward_note'];
        }

        if (isset($validated['target'])) {
            $updateData['target_role'] = $validated['target']['type'];
            $updateData['target_value'] = $validated['target']['value'];
        }

        if (isset($validated['folder_id'])) {
            $updateData['folder_id'] = $validated['folder_id'];
        }

        if (isset($validated['deadline'])) {
            $updateData['deadline'] = $validated['deadline'];
        }

        $document->update($updateData);

        // Update approvals if provided
        if ($request->has('approvals')) {
            $document->approvals()->delete();
            foreach ($request->input('approvals') as $index => $approvalData) {
                $document->approvals()->create([
                    'sequence' => $index + 1,
                    'approver_position' => $approvalData['approver_position'] ?? null,
                    'status' => $approvalData['status'] ?? 'pending',
                ]);
            }
        }

        // Handle Versioning
        $shouldVersion = (isset($validated['content_data']) || (isset($validated['increment_version']) && $validated['increment_version']));
        
        if ($shouldVersion) {
            $changeSummary = null;

            // Calculate Diff if content changed
            if (isset($validated['content_data'])) {
                // Get previous version's content to compare
                $lastVersion = $document->versions()->orderBy('created_at', 'desc')->first();
                $oldContent = $lastVersion ? $lastVersion->content_data : [];
                $newContent = $validated['content_data'];
                
                // Labels mapping
                $labels = [
                    'docNumber' => 'Nomor Dokumen',
                    'to' => 'Kepada',
                    'from' => 'Dari',
                    'subject' => 'Perihal',
                    'content' => 'Isi Paragraf',
                    'date' => 'Tanggal',
                    'location' => 'Lokasi',
                    'attachment' => 'Lampiran',
                    'signerName' => 'Penandatangan',
                    'signerPosition' => 'Jabatan',
                    'division' => 'Divisi',
                    'weigh' => 'Menimbang',
                    'task' => 'Tugas',
                    'destination' => 'Tujuan',
                    'transport' => 'Transportasi',
                    'funding' => 'Pembebanan Biaya',
                    'basis' => 'Dasar',
                    'remembers' => 'Mengingat',
                    'ccs' => 'Tembusan',
                    'about' => 'Tentang',
                    'day' => 'Hari',
                    'dateWritten' => 'Tanggal (Teks)',
                    'party1Name' => 'Pihak 1: Nama',
                    'party1Pos' => 'Pihak 1: Jabatan',
                    'party1Auth' => 'Pihak 1: Dasar Hukum',
                    'party2Name' => 'Pihak 2: Nama',
                    'party2Info' => 'Pihak 2: Info/Alamat',
                    'points' => 'Poin-poin Perjanjian',
                    'paraf' => 'Tabel Paraf'
                ];

                $diffs = [];
                foreach ($newContent as $key => $value) {
                    $label = $labels[$key] ?? $key;
                    
                    // Skip internal fields or empty to empty
                    if (in_array($key, ['signature'])) continue; 
                    if (empty($oldContent[$key]) && empty($value)) continue;

                    if (!isset($oldContent[$key])) {
                        if (!empty($value)) {
                            $val = is_array($value) ? implode(', ', $value) : (is_string($value) ? (strlen($value) > 15 ? substr($value, 0, 15).'...' : $value) : '(data)');
                            $diffs[] = "Isi $label: '$val'";
                        }
                    } elseif ($oldContent[$key] !== $value) {
                        // For arrays (lists), just generic update message
                        if (is_array($value)) {
                            $oldVal = is_array($oldContent[$key]) ? implode(', ', $oldContent[$key]) : '';
                            $newVal = implode(', ', $value);
                            $diffs[] = "Ubah list $label: '$oldVal' ➝ '$newVal'";
                        } else {
                            // String comparison
                            $oldVal = is_string($oldContent[$key]) ? $oldContent[$key] : '';
                            $newVal = is_string($value) ? $value : '';
                            
                            // Truncate for display
                            $oldDisplay = strlen($oldVal) > 15 ? substr($oldVal, 0, 15).'...' : $oldVal;
                            $newDisplay = strlen($newVal) > 15 ? substr($newVal, 0, 15).'...' : $newVal;
                            
                            if (empty($oldVal)) {
                                $diffs[] = "Set $label: '$newDisplay'";
                            } elseif (empty($newVal)) {
                                $diffs[] = "Hapus $label (sebelumnya '$oldDisplay')";
                            } else {
                                $diffs[] = "Ubah $label: '$oldDisplay' ➝ '$newDisplay'";
                            }
                        }
                    }
                }
                
                if (!empty($diffs)) {
                    $changeSummary = implode("\n", array_slice($diffs, 0, 10)); // Limit to 10 lines
                    if (count($diffs) > 10) $changeSummary .= "\n... (dan " . (count($diffs) - 10) . " lainnya)";
                } else {
                    $changeSummary = 'Penyimpanan otomatis (tidak ada perubahan konten signifikan).';
                }
            } else {
                 $changeSummary = 'Versi baru manual.';
            }

            // If explicit increment was requested, or just content update (auto patch increment)
            // We check if version changed in this request (manually passed?) No, it's auto-incremented.
            // If the user didn't request increment but content changed, we should probably increment patch.
            
            if (isset($validated['increment_version']) && $validated['increment_version']) {
                 $document->incrementVersion();
            } elseif (isset($validated['content_data'])) {
                 // Auto-increment patch for content updates if not explicitly requested
                 $document->incrementVersion();
            }
            
            // Create version record
            DocumentVersion::create([
                'document_id' => $document->id,
                'version_number' => $document->version,
                'content_data' => $document->content_data,
                'change_summary' => $changeSummary,
                'updated_by' => $user->id,
            ]);
        }

        // Determine action for logging
        $action = 'updated';
        $notes = 'Dokumen diperbarui';
        
        $statusChanged = isset($validated['status']) && $validated['status'] !== $oldStatus->value;
        $targetChanged = isset($validated['target']);

        if ($statusChanged || $targetChanged) {
            if (isset($validated['status']) && $validated['status'] === DocumentStatus::SENT->value) {
                if ($oldStatus === DocumentStatus::DRAFT || $oldStatus === DocumentStatus::NEEDS_REVISION) {
                    $action = 'sent';
                    $notes = 'Dokumen dikirim ke ' . ($validated['target']['value'] ?? $document->target_value);
                    
                    // Increment version if resending after revision
                    if ($oldStatus === DocumentStatus::NEEDS_REVISION) {
                        $document->incrementVersion();
                        
                        // Create version snapshot for this status change
                        DocumentVersion::create([
                            'document_id' => $document->id,
                            'version_number' => $document->version,
                            'content_data' => $document->content_data,
                            'change_summary' => 'Dokumen dikirim kembali setelah revisi.',
                            'updated_by' => $user->id,
                        ]);
                    }
                } else {
                    $action = 'sent';
                    $notes = 'Dokumen diteruskan ke ' . ($validated['target']['value'] ?? $document->target_value);
                    
                    // Increment version when forwarding
                    $document->incrementVersion(true);

                    // Create version snapshot for forwarding
                    DocumentVersion::create([
                        'document_id' => $document->id,
                        'version_number' => $document->version,
                        'content_data' => $document->content_data,
                        'change_summary' => 'Dokumen diteruskan (Major Version Update).',
                        'updated_by' => $user->id,
                    ]);
                }
            } else if ($statusChanged) {
                $action = $validated['status'] === DocumentStatus::PENDING_REVIEW->value ? 'sent' : $validated['status'];
                $notes = $this->getStatusChangeNote($validated['status']);
                
                if ($validated['status'] === DocumentStatus::PENDING_REVIEW->value) {
                    $notes = 'Dokumen dikirim untuk review';
                }
            } else if ($targetChanged) {
                $notes = 'Tujuan dokumen diubah ke ' . ($validated['target']['value'] ?? $document->target_value);
            }
            
            $document->createLog($action, $user, $notes, $oldStatus, $validated['status'] ?? $oldStatus, $shouldVersion ? $changeSummary : null);
        } else {
            $document->createLog($action, $user, $notes, null, null, $shouldVersion ? $changeSummary : null);
        }

        return response()->json([
            'success' => true,
            'document' => $document->fresh(['logs', 'approvals']),
        ]);
    }

    /**
     * Get human-readable note for status change.
     */
    private function getStatusChangeNote($status)
    {
        $statusValue = $status instanceof DocumentStatus ? $status->value : $status;

        $notes = [
            DocumentStatus::DRAFT->value => 'Dokumen disimpan sebagai draft',
            DocumentStatus::PENDING_REVIEW->value => 'Dokumen dikirim untuk review',
            DocumentStatus::NEEDS_REVISION->value => 'Dokumen memerlukan revisi',
            DocumentStatus::APPROVED->value => 'Dokumen disetujui',
            DocumentStatus::SENT->value => 'Dokumen dikirim',
            DocumentStatus::RECEIVED->value => 'Dokumen diterima',
        ];
        
        return $notes[$statusValue] ?? 'Status dokumen diubah';
    }

    /**
     * Get document logs (delivery history).
     */
    public function logs($id)
    {
        $document = Document::findOrFail($id);
        $logs = $document->logs()->with('user')->orderBy('created_at', 'desc')->orderBy('id', 'desc')->get();
        
        return response()->json($logs);
    }

    /**
     * Get document versions.
     */
    public function versions(Document $document)
    {
        return response()->json($document->versions()->with('updater')->orderBy('created_at', 'desc')->orderBy('id', 'desc')->get());
    }

    /**
     * Restore a document version.
     */
    public function restoreVersion(Request $request, Document $document, $versionId)
    {
        $version = DocumentVersion::where('document_id', $document->id)->findOrFail($versionId);
        $user = Auth::user();

        $document->update([
            'content_data' => $version->content_data,
        ]);
        
        // Increment version to indicate a change (restore is a change)
        $document->incrementVersion();

        // Create a new version record for this restoration state
        DocumentVersion::create([
            'document_id' => $document->id,
            'version_number' => $document->version,
            'content_data' => $document->content_data,
            'change_summary' => 'Dipulihkan dari v' . $version->version_number,
            'updated_by' => $user->id,
        ]);

        $document->createLog('restored', $user, 'Dokumen dipulihkan ke versi ' . $version->version_number);

        return response()->json([
            'success' => true,
            'document' => $document->fresh(),
        ]);
    }

    /**
     * Remove the specified document.
     */
    public function destroy(Document $document)
    {
        $user = Auth::user();

        // Only allow author or admin to delete
        if ($document->author_id !== $user->id && !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Prevent deletion of approved documents
        if ($document->status === DocumentStatus::APPROVED) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete approved documents',
            ], 403);
        }

        // If Admin is deleting, notify the author
        if ($user->isAdmin() && $document->author_id !== $user->id) {
            try {
                $reason = request()->input('reason');
                if (empty($reason)) {
                    $reason = 'Tidak ada alasan yang diberikan.';
                }
                
                if ($document->author) {
                    $document->author->notify(new \App\Notifications\DocumentDeletedNotification($document->title, $reason));
                }
            } catch (\Exception $e) {
                // Log error but continue with deletion
                \Illuminate\Support\Facades\Log::error('Failed to send document deletion notification: ' . $e->getMessage());
            }
        }

        $document->delete();

        return response()->json([
            'success' => true,
            'message' => 'Document deleted successfully',
        ]);
    }
}