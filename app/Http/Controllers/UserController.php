<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display a listing of users for selection.
     */
    public function index()
    {
        $users = User::select('id', 'name', 'position', 'group_name')->get();
        return response()->json($users);
    }
}
