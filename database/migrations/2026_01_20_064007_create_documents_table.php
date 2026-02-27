<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->enum('type', ['nota', 'sppd']);
            $table->string('status')->default('draft'); // draft, pending_review, needs_revision, approved, received
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade');
            $table->string('author_name');
            $table->json('content_data')->nullable(); // Document form data
            $table->json('history_log')->nullable(); // Workflow history
            $table->text('feedback')->nullable(); // Reviewer feedback
            $table->string('target_role')->nullable(); // 'group' or 'dispo'
            $table->string('target_value')->nullable(); // group name or reviewer id
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
