<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    public function __construct(private readonly ChatbotService $chatbot)
    {
    }

    public function chat(Request $request): JsonResponse
    {
        if (blank(config('anthropic.api_key'))) {
            return response()->json(['mensaje' => 'El servicio de IA no está configurado.'], 503);
        }

        $validated = $request->validate([
            'pregunta' => ['required', 'string', 'min:1'],
        ]);

        return response()->json($this->chatbot->responder($validated['pregunta']));
    }
}
