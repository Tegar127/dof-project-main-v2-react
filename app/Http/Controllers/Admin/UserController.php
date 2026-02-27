<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index()
    {
        $users = User::with(['groups'])->withSum('workLogs', 'duration_minutes')->get();
        return response()->json($users);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:3',
            'role' => 'required|in:admin,user,reviewer',
            'group_name' => 'nullable|string',
            'position' => 'nullable|in:direksi,kadiv,kabid,staff',
            'extra_groups' => 'nullable|array',
            'extra_groups.*' => 'exists:groups,id'
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);
        
        if (!empty($validated['extra_groups'])) {
            $user->groups()->sync($validated['extra_groups']);
        }

        return response()->json([
            'success' => true,
            'user' => $user->load('groups'),
        ], 201);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        return response()->json($user->load('groups'));
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'password' => 'sometimes|string|min:3',
            'role' => 'sometimes|in:admin,user,reviewer',
            'group_name' => 'nullable|string',
            'position' => 'nullable|in:direksi,kadiv,kabid,staff',
            'extra_groups' => 'nullable|array',
            'extra_groups.*' => 'exists:groups,id'
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        if ($request->has('extra_groups')) {
            $user->groups()->sync($validated['extra_groups']);
        }

        return response()->json([
            'success' => true,
            'user' => $user->load('groups'),
        ]);
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully',
        ]);
    }
}