<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentWorkLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;

class DocumentWorkLogController extends Controller
{
    /**
     * Store a work log entry.
     */
    public function store(Request $request, Document $document)
    {
        $validated = $request->validate([
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
        ]);

        $start = Carbon::parse($validated['start_time']);
        $end = Carbon::parse($validated['end_time']);
        $duration = $end->diffInMinutes($start);

        // Filter out very short sessions (e.g. < 1 minute) if needed, but let's keep all for now.
        // Or if duration is 0, make it 1?
        if ($duration < 1) $duration = 1;

        $user = Auth::user();

        $log = DocumentWorkLog::create([
            'document_id' => $document->id,
            'user_id' => $user->id,
            'group_name' => $user->group_name,
            'start_time' => $start,
            'end_time' => $end,
            'duration_minutes' => $duration,
            'status' => 'finished',
        ]);

        return response()->json([
            'success' => true,
            'log' => $log
        ]);
    }

    /**
     * Get logs for a document.
     */
    public function index(Document $document)
    {
        return response()->json($document->workLogs()->with('user')->get());
    }
}
