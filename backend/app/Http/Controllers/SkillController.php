<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSkillRequest;
use App\Http\Requests\UpdateSkillRequest;
use App\Models\Skill;

class SkillController extends Controller
{
    /**
     * Display every skill, ordered for display.
     */
    public function index()
    {
        $skills = Skill::query()
            ->orderBy('display_order')
            ->orderBy('name')
            ->get();

        return response()->json($skills);
    }

    /**
     * Store a newly created skill.
     */
    public function store(StoreSkillRequest $request)
    {
        $skill = Skill::create($request->validated());

        return response()->json($skill, 201);
    }

    /**
     * Update the specified skill.
     */
    public function update(UpdateSkillRequest $request, Skill $skill)
    {
        $skill->update($request->validated());

        return response()->json($skill);
    }

    /**
     * Remove the specified skill.
     */
    public function destroy(Skill $skill)
    {
        $skill->delete();

        return response()->json(null, 204);
    }
}
