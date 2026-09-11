<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

Route::get('/projects', [ProjectController::class, 'index']);

Route::get('/user', [AuthController::class, 'user'])
    ->middleware('auth:sanctum');

Route::post('/projects', [ProjectController::class, 'store'])
    ->middleware('auth:sanctum');

Route::get('/projects/{project}', [ProjectController::class, 'show'])
    ->middleware('auth:sanctum');

Route::put('/projects/{project}', [ProjectController::class, 'update'])
    ->middleware('auth:sanctum');
