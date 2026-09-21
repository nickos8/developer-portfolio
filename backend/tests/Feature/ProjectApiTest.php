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

    public function test_guest_can_view_a_single_published_project(): void
    {
        $project = Project::create([
            ...$this->validProjectData(),
            'slug' => 'portfolio-system',
        ]);

        $response = $this->getJson("/api/projects/{$project->id}");

        $response
            ->assertOk()
            ->assertJsonPath('slug', 'portfolio-system');
    }

    public function test_guest_cannot_view_an_unpublished_project(): void
    {
        $project = Project::create([
            ...$this->validProjectData(),
            'is_published' => false,
            'slug' => 'portfolio-system',
        ]);

        $response = $this->getJson("/api/projects/{$project->id}");

        $response->assertNotFound();
    }

    public function test_authenticated_user_can_view_an_unpublished_project(): void
    {
        $project = Project::create([
            ...$this->validProjectData(),
            'is_published' => false,
            'slug' => 'portfolio-system',
        ]);

        $this->actingAs(User::factory()->create());

        $response = $this->getJson("/api/projects/{$project->id}");

        $response->assertOk();
    }

    public function test_guest_cannot_see_the_admin_project_list(): void
    {
        $response = $this->getJson('/api/admin/projects');

        $response->assertUnauthorized();
    }

    public function test_authenticated_user_sees_every_project_in_the_admin_list(): void
    {
        Project::create([...$this->validProjectData(), 'slug' => 'published-one', 'is_published' => true]);
        Project::create([...$this->validProjectData(), 'slug' => 'unpublished-one', 'is_published' => false]);

        $this->actingAs(User::factory()->create());

        $response = $this->getJson('/api/admin/projects');

        $response->assertOk();
        $this->assertCount(2, $response->json());
    }

    public function test_guest_cannot_update_a_project(): void
    {
        $project = Project::create([
            ...$this->validProjectData(),
            'slug' => 'portfolio-system',
        ]);

        $response = $this->putJson("/api/projects/{$project->id}", [
            'title' => 'Updated Title',
        ]);

        $response->assertUnauthorized();

        $this->assertDatabaseHas('projects', ['title' => 'Portfolio System']);
    }

    public function test_authenticated_user_can_update_a_project(): void
    {
        $project = Project::create([
            ...$this->validProjectData(),
            'slug' => 'portfolio-system',
        ]);

        $this->actingAs(User::factory()->create());

        $response = $this->putJson("/api/projects/{$project->id}", [
            'title' => 'Renamed Portfolio System',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('title', 'Renamed Portfolio System')
            ->assertJsonPath('slug', 'renamed-portfolio-system');

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'title' => 'Renamed Portfolio System',
            'slug' => 'renamed-portfolio-system',
        ]);
    }

    public function test_updating_a_project_without_changing_the_title_keeps_the_slug(): void
    {
        $project = Project::create([
            ...$this->validProjectData(),
            'slug' => 'portfolio-system',
        ]);

        $this->actingAs(User::factory()->create());

        $response = $this->putJson("/api/projects/{$project->id}", [
            'is_featured' => false,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('slug', 'portfolio-system')
            ->assertJsonPath('is_featured', false);
    }

    public function test_invalid_update_data_is_rejected(): void
    {
        $project = Project::create([
            ...$this->validProjectData(),
            'slug' => 'portfolio-system',
        ]);

        $this->actingAs(User::factory()->create());

        $response = $this->putJson("/api/projects/{$project->id}", [
            'title' => '',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['title']);
    }

    public function test_guest_cannot_delete_a_project(): void
    {
        $project = Project::create([
            ...$this->validProjectData(),
            'slug' => 'portfolio-system',
        ]);

        $response = $this->deleteJson("/api/projects/{$project->id}");

        $response->assertUnauthorized();

        $this->assertDatabaseCount('projects', 1);
    }

    public function test_authenticated_user_can_delete_a_project(): void
    {
        $project = Project::create([
            ...$this->validProjectData(),
            'slug' => 'portfolio-system',
        ]);

        $this->actingAs(User::factory()->create());

        $response = $this->deleteJson("/api/projects/{$project->id}");

        $response->assertNoContent();

        $this->assertDatabaseCount('projects', 0);
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
