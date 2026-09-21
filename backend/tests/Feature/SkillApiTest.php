<?php

namespace Tests\Feature;

use App\Models\Skill;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SkillApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_list_skills(): void
    {
        Skill::create(['name' => 'Laravel', 'category' => 'Backend', 'display_order' => 1]);
        Skill::create(['name' => 'React', 'category' => 'Frontend', 'display_order' => 2]);

        $response = $this->getJson('/api/skills');

        $response->assertOk();
        $this->assertCount(2, $response->json());
    }

    public function test_guest_cannot_create_a_skill(): void
    {
        $response = $this->postJson('/api/skills', ['name' => 'Laravel']);

        $response->assertUnauthorized();

        $this->assertDatabaseCount('skills', 0);
    }

    public function test_authenticated_user_can_create_a_skill(): void
    {
        $this->actingAs(User::factory()->create());

        $response = $this->postJson('/api/skills', [
            'name' => 'Laravel',
            'category' => 'Backend',
            'display_order' => 1,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('name', 'Laravel');

        $this->assertDatabaseHas('skills', ['name' => 'Laravel']);
    }

    public function test_invalid_skill_data_is_rejected(): void
    {
        $this->actingAs(User::factory()->create());

        $response = $this->postJson('/api/skills', ['name' => '']);

        $response->assertUnprocessable()->assertJsonValidationErrors(['name']);
    }

    public function test_guest_cannot_update_a_skill(): void
    {
        $skill = Skill::create(['name' => 'Laravel']);

        $response = $this->putJson("/api/skills/{$skill->id}", ['name' => 'Updated']);

        $response->assertUnauthorized();

        $this->assertDatabaseHas('skills', ['name' => 'Laravel']);
    }

    public function test_authenticated_user_can_update_a_skill(): void
    {
        $skill = Skill::create(['name' => 'Laravel']);

        $this->actingAs(User::factory()->create());

        $response = $this->putJson("/api/skills/{$skill->id}", ['name' => 'Laravel 13']);

        $response->assertOk()->assertJsonPath('name', 'Laravel 13');

        $this->assertDatabaseHas('skills', ['id' => $skill->id, 'name' => 'Laravel 13']);
    }

    public function test_guest_cannot_delete_a_skill(): void
    {
        $skill = Skill::create(['name' => 'Laravel']);

        $response = $this->deleteJson("/api/skills/{$skill->id}");

        $response->assertUnauthorized();

        $this->assertDatabaseCount('skills', 1);
    }

    public function test_authenticated_user_can_delete_a_skill(): void
    {
        $skill = Skill::create(['name' => 'Laravel']);

        $this->actingAs(User::factory()->create());

        $response = $this->deleteJson("/api/skills/{$skill->id}");

        $response->assertNoContent();

        $this->assertDatabaseCount('skills', 0);
    }
}
