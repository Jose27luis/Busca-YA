<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\MediaWikiService;
use App\Services\VectorService;
use Illuminate\Console\Command;

class IndexarCorpus extends Command
{
    protected $signature = 'buscaya:indexar {--limite=0 : Máximo de artículos a indexar (0 = todos)}';

    protected $description = 'Indexa los artículos de MediaWiki en la base vectorial para búsqueda semántica';

    public function handle(MediaWikiService $wiki, VectorService $vector): int
    {
        $limite = (int) $this->option('limite');
        $continuar = null;
        $total = 0;
        $fragmentos = 0;

        do {
            $pagina = $wiki->listArticles(50, $continuar);
            foreach ($pagina['articulos'] as $entrada) {
                $articulo = $wiki->getArticle($entrada['titulo']);
                if ($articulo === null) {
                    continue;
                }
                $texto = $this->htmlATexto($articulo['html']);
                $n = $vector->indexar($entrada['titulo'], $entrada['pageid'], $texto);
                $total++;
                $fragmentos += $n;
                $this->line(sprintf('[%d] %s → %d fragmentos', $total, $entrada['titulo'], $n));
                if ($limite > 0 && $total >= $limite) {
                    return $this->resumen($total, $fragmentos);
                }
            }
            $continuar = $pagina['continuar'];
        } while ($continuar !== null);

        return $this->resumen($total, $fragmentos);
    }

    private function htmlATexto(string $html): string
    {
        $html = preg_replace('#</(p|div|h[1-6]|li|tr|blockquote)>#i', "\n\n", $html) ?? $html;
        $texto = html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8');

        return trim(preg_replace("/\n{3,}/", "\n\n", $texto) ?? $texto);
    }

    private function resumen(int $articulos, int $fragmentos): int
    {
        $this->info(sprintf('Indexación completada: %d artículos, %d fragmentos.', $articulos, $fragmentos));

        return self::SUCCESS;
    }
}
