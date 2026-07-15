<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\MediaWikiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArticuloController extends Controller
{
    public function __construct(private readonly MediaWikiService $wiki)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'limit' => ['sometimes', 'integer', 'min:1', 'max:500'],
            'continuar' => ['sometimes', 'string'],
        ]);

        return response()->json($this->wiki->listArticles(
            (int) ($validated['limit'] ?? 50),
            $validated['continuar'] ?? null,
        ));
    }

    public function show(string $titulo): JsonResponse
    {
        $articulo = $this->wiki->getArticle($titulo);
        if ($articulo === null) {
            return response()->json(['mensaje' => 'Artículo no encontrado'], 404);
        }

        return response()->json($articulo);
    }

    public function buscar(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:1'],
            'limit' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ]);

        return response()->json([
            'resultados' => $this->wiki->search($validated['q'], (int) ($validated['limit'] ?? 20)),
        ]);
    }
}
