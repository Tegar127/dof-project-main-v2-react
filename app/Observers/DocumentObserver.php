<?php

namespace App\Observers;

use App\Models\Document;
use App\Models\DocumentLog;

class DocumentObserver
{
    /**
     * Handle the Document "updating" event.
     */
    public function updating(Document $document)
    {
        // Detect version increase if needed
        // Logic for auto-incrementing version on specific actions can go here
    }

    /**
     * Handle the Document "updated" event.
     */
    public function updated(Document $document)
    {
        // Check if version was changed
        if ($document->isDirty('version')) {
            // Logic for when version changes
        }
    }
}
