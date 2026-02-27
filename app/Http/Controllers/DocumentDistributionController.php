<?php

namespace App\Http\Controllers;

use App\Enums\DocumentStatus;
use App\Models\Document;
use App\Models\DocumentDistribution;
use App\Models\User;
use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Notifications\DocumentDistributedNotification;

class DocumentDistributionController extends Controller
{
    /**
     * Display a listing of distributions for monitoring.
     */
    public function index()
    {
        $user = Auth::user();

        // Admin can see all distributions, others see what they authored
        $query = Document::whereIn('status', [DocumentStatus::SENT, DocumentStatus::RECEIVED, DocumentStatus::APPROVED])
            ->with(['author', 'distributions', 'readReceipts']);

        if (!$user->isAdmin()) {
            $query->where('author_id', $user->id);
        }

        $documents = $query->orderBy('updated_at', 'desc')->get();

        $monitoringData = $documents->map(function ($doc) {
            // Calculate unique expected recipients
            $recipientUserIds = collect();
            $isAll = false;

            foreach ($doc->distributions as $dist) {
                if ($dist->recipient_type === 'all') {
                    $isAll = true;
                    break;
                } elseif ($dist->recipient_type === 'group') {
                    $group = Group::find($dist->recipient_id);
                    if ($group) {
                        $recipientUserIds = $recipientUserIds->concat($group->members()->pluck('users.id'));
                    }
                } elseif ($dist->recipient_type === 'user') {
                    $recipientUserIds->push((int)$dist->recipient_id);
                }
            }

            if ($isAll) {
                // For 'all', total expected is all users except the author
                $totalExpected = User::where('id', '!=', $doc->author_id)->count();
                // Filter read receipts to exclude author
                $readCount = $doc->readReceipts->where('user_id', '!=', $doc->author_id)->unique('user_id')->count();
            } else {
                $uniqueRecipients = $recipientUserIds->unique()->values();
                $totalExpected = $uniqueRecipients->count();
                // Filter read receipts to only include those in uniqueRecipients
                $readCount = $doc->readReceipts->whereIn('user_id', $uniqueRecipients)->unique('user_id')->count();
            }

            return [
                'id' => $doc->id,
                'title' => $doc->title,
                'author_name' => $doc->author_name,
                'status' => $doc->status->value,
                'status_label' => $doc->status->label(),
                'distributed_at' => $doc->distributions->max('created_at'),
                'total_expected' => $totalExpected,
                'read_count' => $readCount,
                'percentage' => $totalExpected > 0 ? round(($readCount / $totalExpected) * 100) : 0,
            ];
        });

        return response()->json($monitoringData);
    }

    /**
     * Distribute a final document.
     */
    public function store(Request $request, Document $document)
    {
        $user = Auth::user();
        
        // Only allow admin to distribute
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Admin yang memiliki otorisasi untuk mendistribusikan dokumen final.',
            ], 403);
        }

        $validated = $request->validate([
            'recipients' => 'required|array|min:1',
            'recipients.*.type' => 'required|in:all,group,user',
            'recipients.*.id' => 'nullable|required_unless:recipients.*.type,all',
            'notes' => 'nullable|string',
        ]);

        if ($document->status !== DocumentStatus::APPROVED && $document->status !== DocumentStatus::SENT && $document->status !== DocumentStatus::RECEIVED) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya dokumen yang sudah disetujui yang dapat didistribusikan.',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $oldStatus = $document->status;

            foreach ($validated['recipients'] as $recipient) {
                DocumentDistribution::create([
                    'document_id' => $document->id,
                    'recipient_type' => $recipient['type'],
                    'recipient_id' => $recipient['id'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                ]);

                // Notify recipients
                $this->notifyRecipients($document, $recipient);
            }

            // Update document status to SENT if it was APPROVED
            if ($document->status === DocumentStatus::APPROVED) {
                $document->update(['status' => DocumentStatus::SENT]);
                $document->createLog('distributed', Auth::user(), 'Dokumen didistribusikan', $oldStatus, DocumentStatus::SENT);
            } else {
                $document->createLog('redistributed', Auth::user(), 'Dokumen didistribusikan ulang', $oldStatus, $document->status);
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Dokumen berhasil didistribusikan.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mendistribusikan dokumen: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show distribution details for a document.
     */
    public function show(Document $document)
    {
        $document->load(['distributions', 'readReceipts.user', 'author']);
        
        // Get all users who SHOULD receive it
        $recipientIds = [];
        $sentToAll = false;

        foreach ($document->distributions as $dist) {
            if ($dist->recipient_type === 'all') {
                $sentToAll = true;
                break;
            } elseif ($dist->recipient_type === 'group') {
                $group = Group::find($dist->recipient_id);
                if ($group) {
                    $recipientIds = array_merge($recipientIds, $group->members()->pluck('users.id')->toArray());
                }
            } elseif ($dist->recipient_type === 'user') {
                $recipientIds[] = $dist->recipient_id;
            }
        }

        $recipientIds = array_unique($recipientIds);

        if ($sentToAll) {
            $recipients = User::all();
        } else {
            $recipients = User::whereIn('id', $recipientIds)->get();
        }

        $readUserIds = $document->readReceipts->pluck('user_id')->toArray();

        $details = $recipients->map(function ($user) use ($readUserIds, $document) {
            $receipt = $document->readReceipts->where('user_id', $user->id)->first();
            return [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'user_position' => $user->position,
                'is_read' => in_array($user->id, $readUserIds),
                'read_at' => $receipt ? $receipt->read_at : null,
            ];
        });

        return response()->json([
            'document' => [
                'id' => $document->id,
                'title' => $document->title,
                'status' => $document->status->label(),
            ],
            'recipients' => $details,
        ]);
    }

    /**
     * Notify recipients of the document.
     */
    private function notifyRecipients($document, $recipient)
    {
        $users = collect();

        if ($recipient['type'] === 'all') {
            $users = User::all();
        } elseif ($recipient['type'] === 'group') {
            $group = Group::find($recipient['id']);
            if ($group) {
                $users = $group->members;
            }
        } elseif ($recipient['type'] === 'user') {
            $user = User::find($recipient['id']);
            if ($user) {
                $users->push($user);
            }
        }

        foreach ($users as $user) {
            if ($user->id !== Auth::id()) {
                $user->notify(new DocumentDistributedNotification($document));
            }
        }
    }
}
