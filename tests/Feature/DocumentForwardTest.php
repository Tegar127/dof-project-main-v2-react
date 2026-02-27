<?php

namespace Tests\Feature;

use App\Enums\DocumentStatus;
use App\Models\Document;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DocumentForwardTest extends TestCase
{
    use RefreshDatabase;

    public function test_document_version_increments_when_forwarded()
    {
        // 1. Create a user
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'role' => 'admin', // Ensure user has permission
        ]);

        // 2. Create a document with status SENT (v1.0)
        $document = Document::create([
            'title' => 'Test Document',
            'type' => 'nota',
            'status' => DocumentStatus::SENT,
            'author_id' => $user->id,
            'author_name' => $user->name,
            'version' => '1.0',
            'target_role' => 'group',
            'target_value' => 'Initial Group',
            // Add other required fields if any, based on model fillable
        ]);

        $this->assertEquals('1.0', $document->version);

        // 3. Simulate "forwarding" the document
        // sending status='sent' and a new target
        $response = $this->actingAs($user)
            ->putJson("/api/documents/{$document->id}", [
                'status' => 'sent',
                'target' => [
                    'type' => 'group',
                    'value' => 'Next Group',
                ],
            ]);

        $response->assertStatus(200);

        // 4. Assert version incremented to 2.0
        $document->refresh();
        $this->assertEquals('2.0', $document->version);
        
        // 5. Verify log was created (optional but good)
        $this->assertDatabaseHas('document_logs', [
            'document_id' => $document->id,
            'action' => 'sent',
            'notes' => 'Dokumen diteruskan ke Next Group',
            'version' => '2.0', // Log should record the NEW version
        ]);
    }
}
