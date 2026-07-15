<?php

declare(strict_types=1);

namespace App\Services;

use Anthropic\Client;
use Anthropic\Messages\Message;

class ChatbotService
{
    public function __construct(private readonly VectorService $vector)
    {
    }

    public function responder(string $pregunta, int $k = 6): array
    {
        $fragmentos = $this->vector->buscar($pregunta, $k);
        $titulos = array_values(array_unique(array_map(
            static fn (array $fragmento): string => $fragmento['titulo'],
            $fragmentos,
        )));

        $sistema = "Eres el asistente RAG de Busca-YA, un portal wiki. Responde ÚNICAMENTE con base en el "
            ."CONTEXTO. Si la respuesta no está en el contexto, dilo con claridad y no inventes. Responde en "
            ."español, claro y conciso (máximo 5 frases). En 'fuentes' incluye solo títulos exactos del "
            ."contexto que hayas usado.\n\nCONTEXTO:\n".$this->contexto($fragmentos);

        $mensaje = $this->cliente()->messages->create(
            maxTokens: (int) config('anthropic.max_tokens'),
            model: (string) config('anthropic.model'),
            system: $sistema,
            outputConfig: [
                'format' => [
                    'type' => 'json_schema',
                    'schema' => [
                        'type' => 'object',
                        'properties' => [
                            'respuesta' => ['type' => 'string'],
                            'fuentes' => ['type' => 'array', 'items' => ['type' => 'string']],
                        ],
                        'required' => ['respuesta', 'fuentes'],
                        'additionalProperties' => false,
                    ],
                ],
            ],
            messages: [['role' => 'user', 'content' => $pregunta]],
        );

        $texto = $this->primerTexto($mensaje);
        $datos = json_decode($texto, true);
        if (! is_array($datos)) {
            $datos = ['respuesta' => $texto, 'fuentes' => []];
        }

        return [
            'respuesta' => $datos['respuesta'] ?? $texto,
            'fuentes' => array_values(array_intersect($titulos, $datos['fuentes'] ?? [])),
        ];
    }

    private function contexto(array $fragmentos): string
    {
        return implode("\n\n", array_map(
            static fn (array $fragmento): string => '### '.$fragmento['titulo']."\n".$fragmento['fragmento'],
            $fragmentos,
        ));
    }

    private function cliente(): Client
    {
        return new Client(apiKey: (string) config('anthropic.api_key'));
    }

    private function primerTexto(Message $mensaje): string
    {
        foreach ($mensaje->content as $bloque) {
            if ($bloque->type === 'text') {
                return $bloque->text;
            }
        }

        return '';
    }
}
