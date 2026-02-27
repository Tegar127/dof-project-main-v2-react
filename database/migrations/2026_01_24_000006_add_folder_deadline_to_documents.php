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
        Schema::table('documents', function (Blueprint $table) {
            $table->foreignId('folder_id')->nullable()->after('author_name')->constrained('folders')->onDelete('set null');
            $table->string('version')->default('1.0')->after('type');
            $table->timestamp('deadline')->nullable()->after('target_value');
            $table->integer('approval_count')->default(0)->after('deadline');
            
            $table->index('folder_id');
            $table->index('deadline');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['folder_id']);
            $table->dropColumn(['folder_id', 'version', 'deadline', 'approval_count']);
        });
    }
};
