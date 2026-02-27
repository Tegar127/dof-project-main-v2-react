<?php

use App\Http\Controllers\Auth\LoginController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('auth.login');
});

Route::get('/login', function () {
    return view('auth.login');
})->name('login');

Route::get('/dashboard', function () {
    return view('dashboard.index');
})->name('dashboard');

Route::get('/admin', function () {
    return view('admin.index');
})->name('admin');

Route::get('/editor/{id?}', function ($id = 'new') {
    return view('editor.index', ['documentId' => $id]);
})->name('editor');

Route::get('/documents/{id}', function ($id) {
    return view('documents.view', ['documentId' => $id]);
})->name('documents.view');

Route::get('/documents/{document}/print', [App\Http\Controllers\DocumentController::class, 'print'])->name('documents.print');

// Hapus route ini setelah berhasil migrasi di production
Route::get('/migrate-db', function () {
    \Illuminate\Support\Facades\Artisan::call('migrate --force');
    return "Database migrated successfully!";
});