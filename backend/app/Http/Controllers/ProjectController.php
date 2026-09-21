<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $projects = Project::query()
            ->where('is_published', true)
            ->orderBy('display_order')
            ->get();

        return response()->json($projects);
    }

    /**
     * Display every project, published or not, for the authenticated admin dashboard.
     */
    public function adminIndex()
    {
        $projects = Project::query()
            ->orderBy('display_order')
            ->get();

        return response()->json($projects);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectRequest $request)
    {
        $validated = $request->validated();
        $validated['slug'] = $this->uniqueSlug($validated['title']);

        $project = Project::create($validated);

        return response()->json($project, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project)
    {
        if (! $project->is_published && $this->guard()->guest()) {
            throw new NotFoundHttpException;
        }

        return response()->json($project);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectRequest $request, Project $project)
    {
        $validated = $request->validated();

        if (isset($validated['title']) && $validated['title'] !== $project->title) {
            $validated['slug'] = $this->uniqueSlug($validated['title'], $project);
        }

        $project->update($validated);

        return response()->json($project);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {
        $project->delete();

        return response()->json(null, 204);
    }

    /**
     * Build a unique slug from the given title, ignoring the project being updated.
     */
    private function uniqueSlug(string $title, ?Project $ignoring = null): string
    {
        $baseSlug = Str::slug($title);
        $slug = $baseSlug;
        $counter = 2;

        while (
            Project::where('slug', $slug)
                ->when($ignoring, fn ($query) => $query->whereKeyNot($ignoring->id))
                ->exists()
        ) {
            $slug = $baseSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * The auth guard used to decide whether an unpublished project may be viewed.
     */
    private function guard()
    {
        return auth('sanctum');
    }
}
