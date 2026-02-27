<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DocumentWorkLog;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GroupController extends Controller
{
    /**
     * Display a listing of groups.
     */
    public function index()
    {
        $user = Auth::user();
        
        $query = Group::query();

        if ($user && !$user->isAdmin()) {
            $query->where(function($q) use ($user) {
                // User sees public groups
                $q->where('is_private', false)
                  // OR groups where they are the primary member
                  ->orWhere('name', $user->group_name)
                  // OR groups where they are a member via pivot
                  ->orWhereHas('members', function($sq) use ($user) {
                      $sq->where('users.id', $user->id);
                  });
            });
        }

        $groups = $query->get()->map(function($group) {
             $group->total_minutes = DocumentWorkLog::where('group_name', $group->name)->sum('duration_minutes');
             return $group;
        });
        
        return response()->json($groups);
    }

    /**
     * Store a newly created group.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:groups|max:255',
            'is_private' => 'boolean',
            'invited_users' => 'nullable|array',
            'invited_users.*' => 'exists:users,id'
        ]);

        $group = Group::create([
            'name' => $validated['name'],
            'is_private' => $validated['is_private'] ?? false,
        ]);

        if (!empty($validated['invited_users'])) {
            $group->members()->attach($validated['invited_users']);
        }

        return response()->json([
            'success' => true,
            'group' => $group,
        ], 201);
    }

    /**
     * Update the specified group.
     */
    public function update(Request $request, Group $group)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:groups,name,' . $group->id,
            'is_private' => 'sometimes|boolean',
            'invited_users' => 'nullable|array',
            'invited_users.*' => 'exists:users,id'
        ]);

        if (isset($validated['name'])) {
            $group->name = $validated['name'];
        }
        if (isset($validated['is_private'])) {
            $group->is_private = $validated['is_private'];
        }
        
        $group->save();

        if ($request->has('invited_users')) {
            $group->members()->sync($validated['invited_users']);
        }

        return response()->json([
            'success' => true,
            'group' => $group->load('members'),
        ]);
    }

    /**
     * Remove the specified group.
     */
    public function destroy(Group $group)
    {
        $group->delete();

        return response()->json([
            'success' => true,
            'message' => 'Group deleted successfully',
        ]);
    }

    /**
     * Get detailed stats for a group.
     */
    public function showStats($id)
    {
        $group = Group::with('members')->findOrFail($id);
        
        // Calculate total minutes
        $group->total_minutes = DocumentWorkLog::where('group_name', $group->name)->sum('duration_minutes');
        
        // Get documents worked on by this group
        // We aggregate logs by document_id
        $logs = DocumentWorkLog::where('group_name', $group->name)
            ->with('document')
            ->get()
            ->groupBy('document_id');
            
        $documents = [];
        foreach ($logs as $docId => $docLogs) {
            $doc = $docLogs->first()->document;
            if ($doc) {
                $documents[] = [
                    'id' => $doc->id,
                    'title' => $doc->title,
                    'type' => $doc->type,
                    'status' => $doc->status,
                    'total_minutes' => $docLogs->sum('duration_minutes'),
                    'last_worked' => $docLogs->sortByDesc('end_time')->first()->end_time,
                ];
            }
        }
        
        return response()->json([
            'group' => $group,
            'documents' => $documents
        ]);
    }
}
