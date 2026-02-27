<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DocumentDeletedNotification extends Notification
{
    use Queueable;

    public $documentTitle;
    public $reason;

    /**
     * Create a new notification instance.
     */
    public function __construct($documentTitle, $reason)
    {
        $this->documentTitle = $documentTitle;
        $this->reason = $reason;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Dokumen Dihapus',
            'message' => "Dokumen '{$this->documentTitle}' telah dihapus oleh Admin.",
            'reason' => $this->reason,
            'type' => 'danger'
        ];
    }
}
