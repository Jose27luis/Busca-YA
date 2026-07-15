<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\MediaWikiService;
use App\Services\VectorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct(
        private readonly MediaWikiService $wiki,
        private readonly VectorService $vector,
    ) {
    }

    public function estadisticas(Request $request): JsonResponse
    {
        if ($request->user()->rol !== 'admin') {
            return response()->json(['mensaje' => 'Requiere rol Administrador.'], 403);
        }

        $wiki = $this->wiki->estadisticas();
        $salud = $this->vector->salud();

        return response()->json([
            'articulos_wiki' => $wiki['articulos'],
            'ediciones_wiki' => $wiki['ediciones'],
            'articulos_indexados' => $salud['articulos'] ?? 0,
            'fragmentos_vectoriales' => $salud['fragmentos'] ?? 0,
            'modelo_embeddings' => $salud['modelo'] ?? null,
        ]);
    }
}
