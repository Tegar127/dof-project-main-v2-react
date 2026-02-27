<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentDistribution extends Model
{
    protected $fillable = [
        'document_id',
        'recipient_type',
        'recipient_id',
        'notes',
    ];

    /**
     * Get the document that was distributed.
     */
    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    /**
     * Get the recipient (User or Group) based on type.
     */
    public function recipient()
    {
        if ($this->recipient_type === 'user') {
            return $this->belongsTo(User::class, 'recipient_id');
        } elseif ($this->recipient_type === 'group') {
            return $this->belongsTo(Group::class, 'recipient_id');
        }
        return null;
    }
}
