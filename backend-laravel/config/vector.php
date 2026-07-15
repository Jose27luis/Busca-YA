<?php

declare(strict_types=1);

return [
    'url' => env('VECTOR_URL', 'http://127.0.0.1:8102'),
    'timeout' => (int) env('VECTOR_TIMEOUT', 30),
];
