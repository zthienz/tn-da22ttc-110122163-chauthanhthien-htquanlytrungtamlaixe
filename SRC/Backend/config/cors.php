<?php

return [
    'paths'                    => ['api/*', 'uploads/*', 'anh_the/*', 'anh_xe/*'],
    'allowed_methods'          => ['*'],
    'allowed_origins'          => [
        env('FRONTEND_URL',  'http://localhost:5174'),
        env('USER_URL',      'http://localhost:5175'),
        env('ADMIN_URL',     'http://localhost:5173'),
        env('TEACHER_URL',   'http://localhost:5176'),
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers'          => ['*'],
    'exposed_headers'          => [],
    'max_age'                  => 0,
    'supports_credentials'     => false,
];
