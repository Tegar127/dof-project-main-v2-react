<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentWorkLog extends Model
{
    protected $fillable = [
        'document_id',
        'user_id',
        'group_name',
        'start_time',
        'end_time',
        'duration_minutes',
        'status',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
