<?php

namespace App\Enums;

enum DocumentStatus: string
{
    case DRAFT = 'draft';
    case PENDING_REVIEW = 'pending_review';
    case NEEDS_REVISION = 'needs_revision';
    case APPROVED = 'approved';
    case SENT = 'sent';
    case RECEIVED = 'received';

    public function label(): string
    {
        return match($this) {
            self::DRAFT => 'Draft',
            self::PENDING_REVIEW => 'Review',
            self::NEEDS_REVISION => 'Revisi',
            self::APPROVED => 'Approved',
            self::SENT => 'Dikirim',
            self::RECEIVED => 'Diterima',
        };
    }
}
