<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileRequest;
use App\Models\Profile;

class ProfileController extends Controller
{
    /**
     * Display the single portfolio profile, if one has been set up yet.
     */
    public function show()
    {
        return response()->json(['profile' => Profile::first()]);
    }

    /**
     * Create or replace the single portfolio profile.
     */
    public function update(UpdateProfileRequest $request)
    {
        $profile = Profile::query()->first()
            ?? new Profile;

        $profile->fill($request->validated());
        $profile->save();

        return response()->json($profile);
    }
}
