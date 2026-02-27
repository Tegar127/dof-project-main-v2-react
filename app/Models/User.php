<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'group_name',
        'position',
        'department',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the documents authored by this user.
     */
    public function documents()
    {
        return $this->hasMany(Document::class, 'author_id');
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is reviewer.
     */
    public function isReviewer()
    {
        return $this->role === 'reviewer';
    }

    /**
     * Check if user is regular user.
     */
    public function isUser()
    {
        return $this->role === 'user';
    }

    /**
     * Check if user is Direksi.
     */
    public function isDireksi()
    {
        return $this->position === 'direksi';
    }

    /**
     * Check if user is Kadiv.
     */
    public function isKadiv()
    {
        return $this->position === 'kadiv';
    }

    /**
     * Check if user is Kabid.
     */
    public function isKabid()
    {
        return $this->position === 'kabid';
    }

    /**
     * Check if user is Staff.
     */
    public function isStaff()
    {
        return $this->position === 'staff';
    }

    /**
     * Get hierarchy level (higher number = higher authority).
     */
    public function getHierarchyLevel()
    {
        $levels = [
            'staff' => 1,
            'kabid' => 2,
            'kadiv' => 3,
            'direksi' => 4,
        ];
        
        return $levels[$this->position] ?? 0;
    }

    /**
     * Check if user can approve based on position.
     */
    public function canApprove($requiredPosition)
    {
        $levels = [
            'staff' => 1,
            'kabid' => 2,
            'kadiv' => 3,
            'direksi' => 4,
        ];
        
        $userLevel = $levels[$this->position] ?? 0;
        $requiredLevel = $levels[$requiredPosition] ?? 0;
        
        return $userLevel >= $requiredLevel;
    }

    /**
     * Get document logs created by this user.
     */
    public function documentLogs()
    {
        return $this->hasMany(DocumentLog::class);
    }

    /**
     * Get read receipts for this user.
     */
    public function readReceipts()
    {
        return $this->hasMany(DocumentReadReceipt::class);
    }

    /**
     * Get approvals assigned to this user.
     */
    public function approvals()
    {
        return $this->hasMany(DocumentApproval::class, 'approver_id');
    }

    /**
     * Get the groups this user belongs to.
     */
    public function groups()
    {
        return $this->belongsToMany(Group::class);
    }

    /**
     * Get work logs for this user.
     */
    public function workLogs()
    {
        return $this->hasMany(DocumentWorkLog::class);
    }
}
