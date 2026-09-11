<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_create_project(): void
    {
        $response = $this->postJson(
            '/api/projects',
            $this->validProjectData(),
        );

        $response->assertUnauthorized();

        $this->assertDatabaseCount('projects', 0);
    }

    public function test_authenticated_user_can_create_project(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user);

        $response = $this->postJson(
            '/api/projects',
            $this->validProjectData(),
        );

        $response
            ->assertCreated()
            ->assertJsonPath('title', 'Portfolio System')
            ->assertJsonPath('slug', 'portfolio-system');

        $this->assertDatabaseHas('projects', [
            'title' => 'Portfolio System',
            'slug' => 'portfolio-system',
        ]);
    }

    public function test_duplicate_project_title_receives_unique_slug(): void
    {
        Project::create([
            ...$this->validProjectData(),
            'slug' => 'portfolio-system',
        ]);

        $user = User::factory()->create();

        $this->actingAs($user);

        $response = $this->postJson(
            '/api/projects',
            $this->validProjectData(),
        );

        $response
            ->assertCreated()
            ->assertJsonPath('slug', 'portfolio-system-2');

        $this->assertDatabaseHas('projects', [
            'slug' => 'portfolio-system-2',
        ]);

        $this->assertDatabaseCount('projects', 2);
    }

    public function test_invalid_project_data_is_rejected(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user);

        $response = $this->postJson('/api/projects', [
            'title' => '',
            'short_description' => '',
            'description' => '',
            'tech_stack' => [],
            'github_url' => 'not-a-valid-url',
            'is_published' => 'not-a-boolean',
            'display_order' => -1,
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'title',
                'short_description',
                'description',
                'tech_stack',
                'github_url',
                'is_published',
                'display_order',
            ]);

        $this->assertDatabaseCount('projects', 0);
    }

    public function test_guest_cannot_view_single_project(): void
    {
        $project = Project::create([
            ...$this->validProjectData(),
            'slug' => 'portfolio-system',
        ]);

        $response = $this->getJson("/api/projects/{$project->id}");

        $response->assertUnauthorized();
    }

    public function test_authenticated_user_can_view_single_project(): void
    {
        $project = Project::create([
            ...$this->validProjectData(),
            'slug' => 'portfolio-system',
        ]);

        $user = User::factory()->create();

        $this->actingAs($user);

        $response = $this->getJson("/api/projects/{$project->id}");

        $response
            ->assertOk()
            ->assertJsonPath('id', $project->id)
            ->assertJsonPath('title', 'Portfolio System');
    }

    public function test_authenticated_user_can_view_unpublished_project(): void
    {
        $project = Project::create([
            ...$this->validProjectData(),
            'slug' => 'unpublished-project',
            'is_published' => false,
        ]);

        $user = User::factory()->create();

        $this->actingAs($user);

        $response = $this->getJson("/api/projects/{$project->id}");

        $response->assertOk();
    }

    public function test_viewing_nonexistent_project_returns_not_found(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user);

        $response = $this->getJson('/api/projects/999');

        $response->assertNotFound();
    }

    public function test_guest_cannot_update_project(): void
    {
        $project = Project::create([
            ...$this->validProjectData(),
            'slug' => 'portfolio-system',
        ]);

        $response = $this->putJson(
            "/api/projects/{$project->id}",
            $this->validProjectData(),
        );

        $response->assertUnauthorized();

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'title' => 'Portfolio System',
        ]);
    }

    public function test_authenticated_user_can_update_project(): void
    {
        $project = Project::create([
            ...$this->validProjectData(),
            'slug' => 'portfolio-system',
        ]);

        $user = User::factory()->create();

        $this->actingAs($user);

        $response = $this->putJson("/api/projects/{$project->id}", [
            ...$this->validProjectData(),
            'title' => 'Updated Portfolio System',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('title', 'Updated Portfolio System');

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'title' => 'Updated Portfolio System',
        ]);
    }

    public function test_updating_title_does_not_change_slug(): void
    {
        $project = Project::create([
            ...$this->validProjectData(),
            'slug' => 'portfolio-system',
        ]);

        $user = User::factory()->create();

        $this->actingAs($user);

        $response = $this->putJson("/api/projects/{$project->id}", [
            ...$this->validProjectData(),
            'title' => 'A Completely Different Title',
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'title' => 'A Completely Different Title',
            'slug' => 'portfolio-system',
        ]);
    }

    public function test_invalid_update_data_is_rejected(): void
    {
        $project = Project::create([
            ...$this->validProjectData(),
            'slug' => 'portfolio-system',
        ]);

        $user = User::factory()->create();

        $this->actingAs($user);

        $response = $this->putJson("/api/projects/{$project->id}", [
            'title' => '',
            'short_description' => '',
            'description' => '',
            'tech_stack' => [],
            'github_url' => 'not-a-valid-url',
            'is_published' => 'not-a-boolean',
            'display_order' => -1,
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'title',
                'short_description',
                'description',
                'tech_stack',
                'github_url',
                'is_published',
                'display_order',
            ]);

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'title' => 'Portfolio System',
        ]);
    }

    public function test_updating_nonexistent_project_returns_not_found(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user);

        $response = $this->putJson('/api/projects/999', $this->validProjectData());

        $response->assertNotFound();
    }

    public function test_guest_cannot_delete_project(): void
    {
        $project = Project::create([
            ...$this->validProjectData(),
            'slug' => 'portfolio-system',
        ]);

        $response = $this->deleteJson("/api/projects/{$project->id}");

        $response->assertUnauthorized();

        $this->assertDatabaseHas('projects', ['id' => $project->id]);
    }

    public function test_authenticated_user_can_delete_project(): void
    {
        $project = Project::create([
            ...$this->validProjectData(),
            'slug' => 'portfolio-system',
        ]);

        $user = User::factory()->create();

        $this->actingAs($user);

        $response = $this->deleteJson("/api/projects/{$project->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
    }

    public function test_deleting_one_project_does_not_affect_others(): void
    {
        $projectToDelete = Project::create([
            ...$this->validProjectData(),
            'slug' => 'portfolio-system',
        ]);

        $projectToKeep = Project::create([
            ...$this->validProjectData(),
            'title' => 'Another Project',
            'slug' => 'another-project',
        ]);

        $user = User::factory()->create();

        $this->actingAs($user);

        $this->deleteJson("/api/projects/{$projectToDelete->id}");

        $this->assertDatabaseMissing('projects', ['id' => $projectToDelete->id]);
        $this->assertDatabaseHas('projects', ['id' => $projectToKeep->id]);
    }

    public function test_deleting_nonexistent_project_returns_not_found(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user);

        $response = $this->deleteJson('/api/projects/999');

        $response->assertNotFound();
    }

    private function validProjectData(): array
    {
        return [
            'title' => 'Portfolio System',
            'short_description' => 'A developer portfolio management system.',
            'description' => 'A full-stack portfolio built with Laravel and React.',
            'tech_stack' => ['Laravel', 'React'],
            'github_url' => 'https://github.com/nickos8/developer-portfolio',
            'live_url' => null,
            'is_featured' => true,
            'is_published' => true,
            'display_order' => 1,
        ];
    }
}
