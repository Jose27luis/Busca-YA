<?php

declare(strict_types=1);

return [
    'api_key' => env('ANTHROPIC_API_KEY'),
    'model' => env('ANTHROPIC_MODEL', 'claude-opus-4-8'),
    'max_tokens' => (int) env('ANTHROPIC_MAX_TOKENS', 2048),
];
