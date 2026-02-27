<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentVersion extends Model
{
    protected $fillable = [
        'document_id',
        'version_number',
        'content_data',
        'change_summary',
        'updated_by',
    ];

    protected $casts = [
        'content_data' => 'array',
    ];

    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
