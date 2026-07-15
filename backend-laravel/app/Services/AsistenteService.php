<?php

declare(strict_types=1);

namespace App\Services;

use Anthropic\Client;
use Anthropic\Messages\Message;

class AsistenteService
{
    private const INSTRUCCIONES = [
        'redactar' => 'Expande y mejora el siguiente borrador para un artículo de wiki, en español, con tono '
            .'enciclopédico, claro y neutral. Mantén el formato de wikitexto. Devuelve solo el texto sugerido, '
            .'sin comentarios.',
        'resumir' => 'Resume el siguiente texto en 3 o 4 frases en español, conservando lo esencial. Devuelve '
            .'solo el resumen.',
        'corregir' => 'Corrige ortografía, gramática y estilo del siguiente texto en español, manteniendo su '
            .'significado y el formato de wikitexto. Devuelve solo el texto corregido.',
    ];

    public function acciones(): array
    {
        return array_keys(self::INSTRUCCIONES);
    }

    public function procesar(string $accion, string $texto): string
    {
        $instruccion = self::INSTRUCCIONES[$accion];

        $mensaje = $this->cliente()->messages->create(
            maxTokens: (int) config('anthropic.max_tokens'),
            model: (string) config('anthropic.model'),
            messages: [['role' => 'user', 'content' => $instruccion."\n\n---\n".$texto]],
        );

        return trim($this->primerTexto($mensaje));
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
