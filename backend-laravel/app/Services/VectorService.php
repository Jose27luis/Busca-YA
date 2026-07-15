<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

class VectorService
{
    private function client(): PendingRequest
    {
        return Http::timeout((int) config('vector.timeout'))->acceptJson();
    }

    private function url(string $ruta): string
    {
        return rtrim((string) config('vector.url'), '/').$ruta;
    }

    public function buscar(string $consulta, int $k = 8): array
    {
        $respuesta = $this->client()->post($this->url('/buscar'), [
            'consulta' => $consulta,
            'k' => $k,
        ]);
        $respuesta->throw();

        return $respuesta->json('resultados') ?? [];
    }

    public function indexar(string $titulo, ?int $pageid, string $texto): int
    {
        $respuesta = $this->client()->post($this->url('/indexar'), [
            'titulo' => $titulo,
            'pageid' => $pageid,
            'texto' => $texto,
        ]);
        $respuesta->throw();

        return (int) $respuesta->json('fragmentos');
    }

    public function salud(): array
    {
        return $this->client()->get($this->url('/salud'))->throw()->json();
    }
}
