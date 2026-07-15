<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\AsistenteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AsistenteController extends Controller
{
    public function __construct(private readonly AsistenteService $asistente)
    {
    }

    public function redaccion(Request $request): JsonResponse
    {
        if (! in_array($request->user()->rol, ['editor', 'admin'], true)) {
            return response()->json(['mensaje' => 'Requiere rol Editor o Administrador.'], 403);
        }

        if (blank(config('anthropic.api_key'))) {
            return response()->json(['mensaje' => 'El servicio de IA no está configurado.'], 503);
        }

        $validated = $request->validate([
            'accion' => ['required', Rule::in($this->asistente->acciones())],
            'texto' => ['required', 'string', 'min:1'],
        ]);

        return response()->json([
            'resultado' => $this->asistente->procesar($validated['accion'], $validated['texto']),
        ]);
    }
}
