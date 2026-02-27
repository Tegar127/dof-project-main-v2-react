<?php

namespace App\Models;

use App\Enums\DocumentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'type',
        'status',
        'author_id',
        'author_name',
        'folder_id',
        'version',
        'content_data',
        'history_log',
        'feedback',
        'forward_note',
        'target_role',
        'target_value',
        'deadline',
        'approval_count',
    ];

    protected function casts(): array
    {
        return [
            'status' => DocumentStatus::class,
            'content_data' => 'array',
            'history_log' => 'array',
            'deadline' => 'datetime',
        ];
    }

    /**
     * Check if document is in a final state (read-only).
     */
    public function isFinal(): bool
    {
        return in_array($this->status, [
            DocumentStatus::APPROVED,
            DocumentStatus::SENT,
            DocumentStatus::RECEIVED
        ]);
    }

    /**
     * Get the author of the document.
     */
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Scope to get documents by role.
     */
    public function scopeForUser($query, $user)
    {
        if ($user->isAdmin()) {
            return $query; // Admin can see everything
        }

        if ($user->role === 'reviewer') {
            return $query->where('target_role', 'dispo')
                         ->whereIn('status', [DocumentStatus::PENDING_REVIEW, DocumentStatus::APPROVED]); 
        }

        // Get all groups the user belongs to (Primary + Extra)
        $groupNames = $user->groups()->pluck('name')->push($user->group_name)->filter()->unique()->toArray();
        $groupIds = $user->groups()->pluck('groups.id')->toArray();

        return $query->where(function ($q) use ($user, $groupNames, $groupIds) {
            $q->where('author_id', $user->id)
              ->orWhere(function ($sq) use ($groupNames) {
                  $sq->where('target_role', 'group')
                     ->whereIn('target_value', $groupNames)
                     ->whereIn('status', [DocumentStatus::SENT, DocumentStatus::RECEIVED]);
              })
              ->orWhereHas('logs', function ($lq) use ($user) {
                  $lq->where('user_id', $user->id);
              })
              ->orWhereHas('distributions', function ($dq) use ($user, $groupIds) {
                  $dq->where('recipient_type', 'all')
                    ->orWhere(function ($sq) use ($groupIds) {
                        $sq->where('recipient_type', 'group')
                           ->whereIn('recipient_id', $groupIds);
                    })
                    ->orWhere(function ($sq) use ($user) {
                        $sq->where('recipient_type', 'user')
                           ->where('recipient_id', $user->id);
                    });
              });
        });
    }

    /**
     * Scope to filter documents based on search criteria.
     */
    public function scopeSearch($query, $filters)
    {
        return $query->when($filters['search'] ?? null, function ($q, $search) {
            $q->where(function ($sq) use ($search) {
                $sq->where('title', 'like', "%{$search}%")
                  ->orWhere('author_name', 'like', "%{$search}%")
                  ->orWhere('target_value', 'like', "%{$search}%")
                  ->orWhere('content_data->docNumber', 'like', "%{$search}%")
                  ->orWhere('content_data->subject', 'like', "%{$search}%")
                  ->orWhere('content_data->to', 'like', "%{$search}%")
                  ->orWhere('content_data->from', 'like', "%{$search}%");
            });
        })->when($filters['type'] ?? null, function ($q, $type) {
            $q->where('type', $type);
        })->when($filters['status'] ?? null, function ($q, $status) {
            $q->where('status', $status);
        });
    }

    /**
     * Get the folder that contains the document.
     */
    public function folder()
    {
        return $this->belongsTo(Folder::class);
    }

    /**
     * Get all logs for this document.
     */
    public function logs()
    {
        return $this->hasMany(DocumentLog::class)->orderBy('created_at', 'desc');
    }

    /**
     * Get all read receipts for this document.
     */
    public function readReceipts()
    {
        return $this->hasMany(DocumentReadReceipt::class)->orderBy('read_at', 'desc');
    }

    /**
     * Get all approvals for this document.
     */
    public function approvals()
    {
        return $this->hasMany(DocumentApproval::class)->orderBy('sequence');
    }

    /**
     * Get work logs for this document.
     */
    public function workLogs()
    {
        return $this->hasMany(DocumentWorkLog::class)->orderBy('start_time', 'desc');
    }

    /**
     * Get versions for this document.
     */
    public function versions()
    {
        return $this->hasMany(DocumentVersion::class)->orderBy('created_at', 'desc');
    }

    /**
     * Get distributions for this document.
     */
    public function distributions()
    {
        return $this->hasMany(DocumentDistribution::class);
    }

    /**
     * Create a log entry for this document.
     */
    public function createLog($action, $user, $notes = null, $statusFrom = null, $statusTo = null, $changes = null)
    {
        return $this->logs()->create([
            'version' => $this->version ?? '1.0',
            'action' => $action,
            'user_id' => $user->id ?? null,
            'user_name' => $user->name ?? 'System',
            'user_position' => $user->position ?? null,
            'status_from' => $statusFrom,
            'status_to' => $statusTo,
            'notes' => $notes,
            'changes' => $changes,
            'metadata' => ['group' => $user->group_name ?? null],
            'created_at' => now(),
        ]);
    }

    /**
     * Mark document as read by user.
     */
    public function markAsRead($user)
    {
        return $this->readReceipts()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'user_position' => $user->position,
                'ip_address' => request()->ip(),
                'read_at' => now(),
            ]
        );
    }

    /**
     * Get the next pending approver.
     */
    public function getNextApprover()
    {
        return $this->approvals()
            ->where('status', 'pending')
            ->orderBy('sequence')
            ->first();
    }

    /**
     * Check if document is overdue.
     */
    public function isOverdue()
    {
        return $this->deadline && $this->deadline->isPast();
    }

    /**
     * Increment document version.
     */
    public function incrementVersion($major = false)
    {
        // Refresh ONLY the version from DB to avoid race conditions
        $latestDoc = $this->fresh();
        $latestVersion = $latestDoc ? $latestDoc->version : ($this->version ?? '1.0');
        
        $parts = explode('.', $latestVersion);
        
        if ($major) {
            $parts[0] = (int)$parts[0] + 1;
            $parts[1] = 0;
        } else {
            $parts[1] = ((int)($parts[1] ?? 0)) + 1;
        }
        
        $this->version = implode('.', $parts);
        $this->save();
        
        return $this->version;
    }
}