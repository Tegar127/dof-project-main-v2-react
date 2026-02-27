<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentReadReceipt extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'document_id',
        'user_id',
        'user_position',
        'ip_address',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
        ];
    }

    /**
     * Get the document that owns the read receipt.
     */
    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    /**
     * Get the user who read the document.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
