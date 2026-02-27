<?php

namespace App\Http\Controllers;

use App\Enums\DocumentStatus;
use App\Models\Document;
use App\Models\DocumentApproval;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DocumentApprovalController extends Controller
{
    /**
     * Get all approvals for a document.
     */
    public function index($documentId)
    {
        $document = Document::findOrFail($documentId);
        $approvals = $document->approvals()->with('approver')->get();
        
        return response()->json($approvals);
    }

    /**
     * Approve a document approval.
     */
    public function approve(Request $request, $documentId, $approvalId)
    {
        $user = Auth::user();
        $document = Document::findOrFail($documentId);
        $approval = DocumentApproval::where('document_id', $documentId)
            ->where('id', $approvalId)
            ->firstOrFail();

        // Check if user can approve
        if ($approval->approver_id && $approval->approver_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk menyetujui dokumen ini.',
            ], 403);
        }

        if ($approval->approver_position && !$user->canApprove($approval->approver_position)) {
            return response()->json([
                'success' => false,
                'message' => 'Posisi anda tidak memenuhi syarat untuk menyetujui dokumen ini.',
            ], 403);
        }

        // Check if previous approvals are completed
        $previousPending = $document->approvals()
            ->where('sequence', '<', $approval->sequence)
            ->where('status', 'pending')
            ->exists();

        if ($previousPending) {
            return response()->json([
                'success' => false,
                'message' => 'Approval sebelumnya harus diselesaikan terlebih dahulu.',
            ], 400);
        }

        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        // Update approval
        $approval->update([
            'status' => 'approved',
            'approver_id' => $user->id,
            'approver_name' => $user->name,
            'notes' => $validated['notes'] ?? null,
            'approved_at' => now(),
        ]);

        // Create log entry
        $document->createLog('approved', $user, $validated['notes'] ?? 'Dokumen disetujui');

        // Check if all approvals are completed
        $allApproved = !$document->approvals()->where('status', 'pending')->exists();
        
        if ($allApproved && $document->status === DocumentStatus::PENDING_REVIEW) {
            $oldStatus = $document->status;
            $document->update(['status' => DocumentStatus::APPROVED]);
            $document->createLog('updated', $user, 'Semua approval selesai', $oldStatus, DocumentStatus::APPROVED);
        }

        return response()->json([
            'success' => true,
            'approval' => $approval->fresh(),
            'document' => $document->fresh(),
        ]);
    }

    /**
     * Reject a document approval.
     */
    public function reject(Request $request, $documentId, $approvalId)
    {
        $user = Auth::user();
        $document = Document::findOrFail($documentId);
        $approval = DocumentApproval::where('document_id', $documentId)
            ->where('id', $approvalId)
            ->firstOrFail();

        // Check if user can reject
        if ($approval->approver_id && $approval->approver_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk menolak dokumen ini.',
            ], 403);
        }

        if ($approval->approver_position && !$user->canApprove($approval->approver_position)) {
            return response()->json([
                'success' => false,
                'message' => 'Posisi anda tidak memenuhi syarat untuk menolak dokumen ini.',
            ], 403);
        }

        $validated = $request->validate([
            'notes' => 'required|string',
        ]);

        // Update approval
        $approval->update([
            'status' => 'rejected',
            'approver_id' => $user->id,
            'approver_name' => $user->name,
            'notes' => $validated['notes'],
            'approved_at' => now(),
        ]);

        // Update document status
        $oldStatus = $document->status;
        $document->update(['status' => DocumentStatus::NEEDS_REVISION]);
        
        // Create log entry
        $document->createLog('rejected', $user, $validated['notes'], $oldStatus, DocumentStatus::NEEDS_REVISION);

        return response()->json([
            'success' => true,
            'approval' => $approval->fresh(),
            'document' => $document->fresh(),
        ]);
    }

    /**
     * Update approval sequence.
     */
    public function updateSequence(Request $request, $documentId)
    {
        $user = Auth::user();
        $document = Document::findOrFail($documentId);

        // Only author can update sequence
        if ($document->author_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya pembuat dokumen yang dapat mengubah urutan approval.',
            ], 403);
        }

        $validated = $request->validate([
            'approvals' => 'required|array',
            'approvals.*.id' => 'required|exists:document_approvals,id',
            'approvals.*.sequence' => 'required|integer|min:1',
        ]);

        foreach ($validated['approvals'] as $approvalData) {
            DocumentApproval::where('id', $approvalData['id'])
                ->where('document_id', $documentId)
                ->update(['sequence' => $approvalData['sequence']]);
        }

        return response()->json([
            'success' => true,
            'approvals' => $document->approvals()->get(),
        ]);
    }
}
