<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_sees_null_when_no_profile_exists_yet(): void
    {
        $response = $this->getJson('/api/profile');

        $response->assertOk()->assertJsonPath('profile', null);
    }

    public function test_guest_can_view_the_profile(): void
    {
        Profile::create([
            'name' => 'Nickos Armijo',
            'role' => 'Junior PHP / Laravel Developer',
            'bio' => 'Building full-stack Laravel and React projects.',
        ]);

        $response = $this->getJson('/api/profile');

        $response
            ->assertOk()
            ->assertJsonPath('profile.name', 'Nickos Armijo')
            ->assertJsonPath('profile.role', 'Junior PHP / Laravel Developer');
    }

    public function test_guest_cannot_update_the_profile(): void
    {
        $response = $this->putJson('/api/profile', [
            'name' => 'Someone Else',
        ]);

        $response->assertUnauthorized();

        $this->assertDatabaseCount('profiles', 0);
    }

    public function test_authenticated_user_can_create_the_profile(): void
    {
        $this->actingAs(User::factory()->create());

        $response = $this->putJson('/api/profile', [
            'name' => 'Nickos Armijo',
            'role' => 'Junior PHP / Laravel Developer',
            'bio' => 'Building full-stack Laravel and React projects.',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('name', 'Nickos Armijo');

        $this->assertDatabaseCount('profiles', 1);
        $this->assertDatabaseHas('profiles', ['name' => 'Nickos Armijo']);
    }

    public function test_updating_the_profile_again_replaces_the_single_row(): void
    {
        $this->actingAs(User::factory()->create());

        $this->putJson('/api/profile', ['name' => 'First Name']);
        $response = $this->putJson('/api/profile', ['name' => 'Updated Name']);

        $response->assertOk()->assertJsonPath('name', 'Updated Name');

        $this->assertDatabaseCount('profiles', 1);
        $this->assertDatabaseHas('profiles', ['name' => 'Updated Name']);
    }

    public function test_invalid_profile_data_is_rejected(): void
    {
        $this->actingAs(User::factory()->create());

        $response = $this->putJson('/api/profile', ['name' => '']);

        $response->assertUnprocessable()->assertJsonValidationErrors(['name']);
    }
}
