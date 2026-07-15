<?php

declare(strict_types=1);

use App\Http\Controllers\ArticuloController;
use App\Http\Controllers\AsistenteController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BusquedaController;
use App\Http\Controllers\ChatbotController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/articulos', [ArticuloController::class, 'index']);
Route::get('/buscar', [ArticuloController::class, 'buscar']);
Route::post('/busqueda-semantica', [BusquedaController::class, 'semantica']);
Route::post('/chat', [ChatbotController::class, 'chat']);
Route::get('/articulos/{titulo}', [ArticuloController::class, 'show']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/asistente/redaccion', [AsistenteController::class, 'redaccion']);
});
