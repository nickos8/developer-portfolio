<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'short_description' => ['required', 'string', 'max:300'],
            'description' => ['required', 'string'],
            'tech_stack' => ['required', 'array', 'min:1'],
            'tech_stack.*' => ['required', 'string', 'max:100'],

            'github_url' => ['nullable', 'url', 'max:255'],
            'live_url' => ['nullable', 'url', 'max:255'],

            'is_featured' => ['sometimes', 'boolean'],
            'is_published' => ['sometimes', 'boolean'],

            'display_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
