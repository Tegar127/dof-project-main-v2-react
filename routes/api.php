<?php

use App\Http\Controllers\Admin\GroupController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DocumentApprovalController;
use App\Http\Controllers\DocumentWorkLogController;
use App\Http\Controllers\FolderController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes (no auth required)
Route::post('/login', [LoginController::class, 'login']);

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::get('/user', [LoginController::class, 'user']);
    
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Document routes (all authenticated users)
    Route::apiResource('documents', DocumentController::class);
    Route::get('/users', [App\Http\Controllers\UserController::class, 'index']);
    Route::get('/groups', [GroupController::class, 'index']);
    Route::get('/groups/{group}', [GroupController::class, 'show']);
    
    // Document logs
    Route::get('/documents/{id}/logs', [DocumentController::class, 'logs']);
    Route::post('/documents/{document}/work-logs', [DocumentWorkLogController::class, 'store']);
    Route::get('/documents/{document}/work-logs', [DocumentWorkLogController::class, 'index']);
    Route::get('/documents/{document}/versions', [DocumentController::class, 'versions']);
    Route::post('/documents/{document}/versions/{versionId}/restore', [DocumentController::class, 'restoreVersion']);
    
    // Document approvals
    Route::get('/documents/{id}/approvals', [DocumentApprovalController::class, 'index']);
    Route::post('/documents/{documentId}/approvals/{approvalId}/approve', [DocumentApprovalController::class, 'approve']);
    Route::post('/documents/{documentId}/approvals/{approvalId}/reject', [DocumentApprovalController::class, 'reject']);
    Route::put('/documents/{id}/approvals/sequence', [DocumentApprovalController::class, 'updateSequence']);
    
    // Folders
    Route::apiResource('folders', FolderController::class);
    Route::post('/documents/{id}/move', [FolderController::class, 'moveDocument']);

    // Document Distributions
    Route::get('/distributions', [App\Http\Controllers\DocumentDistributionController::class, 'index']);
    Route::post('/documents/{document}/distribute', [App\Http\Controllers\DocumentDistributionController::class, 'store']);
    Route::get('/distributions/{document}', [App\Http\Controllers\DocumentDistributionController::class, 'show']);

    // Admin only routes
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::apiResource('groups', GroupController::class)->except(['index', 'show']);
        Route::get('/groups-stats/{id}', [GroupController::class, 'showStats']);
    });
});
