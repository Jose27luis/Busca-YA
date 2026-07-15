<?php

declare(strict_types=1);

return [
    'api_url' => env('MEDIAWIKI_API_URL', 'http://127.0.0.1:8100/api.php'),
    'user_agent' => env('MEDIAWIKI_USER_AGENT', 'BuscaYA-Portal/0.1 (https://cms.net.pe)'),
    'timeout' => (int) env('MEDIAWIKI_TIMEOUT', 20),
];
