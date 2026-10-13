<?php

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/');
$filePath = __DIR__ . $uri;

if ($uri !== '/' && is_file($filePath)) {
    $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    $mimeTypes = [
        'js'   => 'application/javascript; charset=UTF-8',
        'mjs'  => 'application/javascript; charset=UTF-8',
        'css'  => 'text/css; charset=UTF-8',
        'json' => 'application/json; charset=UTF-8',
        'xml'  => 'application/xml; charset=UTF-8',
        'txt'  => 'text/plain; charset=UTF-8',
        'svg'  => 'image/svg+xml',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'ico'  => 'image/x-icon',
        'woff' => 'font/woff',
        'woff2'=> 'font/woff2',
    ];
    if (isset($mimeTypes[$ext])) {
        header('Content-Type: ' . $mimeTypes[$ext]);
        header('Cache-Control: public, max-age=31536000, immutable');
        readfile($filePath);
        return true;
    }
    return false;
}

require_once __DIR__ . '/index.php';
