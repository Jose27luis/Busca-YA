<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

class MediaWikiService
{
    private function client(): PendingRequest
    {
        return Http::withHeaders(['User-Agent' => (string) config('mediawiki.user_agent')])
            ->timeout((int) config('mediawiki.timeout'))
            ->acceptJson();
    }

    private function query(array $params): array
    {
        $response = $this->client()->get((string) config('mediawiki.api_url'), array_merge($params, [
            'format' => 'json',
            'formatversion' => '2',
        ]));
        $response->throw();

        return $response->json() ?? [];
    }

    public function listArticles(int $limit = 50, ?string $continue = null): array
    {
        $params = [
            'action' => 'query',
            'list' => 'allpages',
            'apnamespace' => 0,
            'apfilterredir' => 'nonredirects',
            'aplimit' => $limit,
        ];
        if ($continue !== null) {
            $params['apcontinue'] = $continue;
        }
        $data = $this->query($params);
        $pages = $data['query']['allpages'] ?? [];

        return [
            'articulos' => array_map(static fn (array $page): array => [
                'titulo' => $page['title'],
                'pageid' => $page['pageid'],
            ], $pages),
            'continuar' => $data['continue']['apcontinue'] ?? null,
        ];
    }

    public function getArticle(string $title): ?array
    {
        $data = $this->query([
            'action' => 'parse',
            'page' => $title,
            'prop' => 'text|wikitext|displaytitle|revid',
            'redirects' => 1,
        ]);

        if (isset($data['error']) || ! isset($data['parse'])) {
            return null;
        }
        $parse = $data['parse'];

        return [
            'titulo' => $parse['title'],
            'titulo_html' => $parse['displaytitle'] ?? $parse['title'],
            'revid' => $parse['revid'] ?? null,
            'html' => $parse['text'] ?? '',
            'wikitext' => $parse['wikitext'] ?? '',
        ];
    }

    public function estadisticas(): array
    {
        $data = $this->query([
            'action' => 'query',
            'meta' => 'siteinfo',
            'siprop' => 'statistics',
        ]);
        $stats = $data['query']['statistics'] ?? [];

        return [
            'articulos' => $stats['articles'] ?? 0,
            'paginas' => $stats['pages'] ?? 0,
            'ediciones' => $stats['edits'] ?? 0,
        ];
    }

    public function search(string $query, int $limit = 20): array
    {
        $data = $this->query([
            'action' => 'query',
            'list' => 'search',
            'srsearch' => $query,
            'srnamespace' => 0,
            'srlimit' => $limit,
        ]);
        $results = $data['query']['search'] ?? [];

        return array_map(static fn (array $item): array => [
            'titulo' => $item['title'],
            'pageid' => $item['pageid'],
            'fragmento' => trim(strip_tags((string) ($item['snippet'] ?? ''))),
            'tamano' => $item['size'] ?? null,
            'palabras' => $item['wordcount'] ?? null,
        ], $results);
    }
}
