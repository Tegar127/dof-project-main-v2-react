<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    protected $fillable = ['name', 'is_private', 'category', 'parent_id'];

    /**
     * Get the parent group.
     */
    public function parent()
    {
        return $this->belongsTo(Group::class, 'parent_id');
    }

    /**
     * Get the child groups.
     */
    public function children()
    {
        return $this->hasMany(Group::class, 'parent_id');
    }
    public function users()
    {
        return $this->hasMany(User::class, 'group_name', 'name');
    }

    /**
     * Get the users who are members of this group (via pivot).
     */
    public function members()
    {
        return $this->belongsToMany(User::class);
    }
}
