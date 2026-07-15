<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\VectorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BusquedaController extends Controller
{
    public function __construct(private readonly VectorService $vector)
    {
    }

    public function semantica(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:1'],
            'k' => ['sometimes', 'integer', 'min:1', 'max:20'],
        ]);

        $fragmentos = $this->vector->buscar($validated['q'], (int) ($validated['k'] ?? 8));

        $porArticulo = [];
        foreach ($fragmentos as $fragmento) {
            $titulo = $fragmento['titulo'];
            if (! isset($porArticulo[$titulo]) || $fragmento['score'] > $porArticulo[$titulo]['score']) {
                $porArticulo[$titulo] = [
                    'titulo' => $titulo,
                    'pageid' => $fragmento['pageid'],
                    'score' => $fragmento['score'],
                    'fragmento' => $fragmento['fragmento'],
                ];
            }
        }

        $resultados = array_values($porArticulo);
        usort($resultados, static fn (array $a, array $b): int => $b['score'] <=> $a['score']);

        return response()->json(['resultados' => $resultados]);
    }
}
