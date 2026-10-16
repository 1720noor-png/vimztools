<?php

$dbUrl = getenv('DATABASE_URL') ?: ($_ENV['DATABASE_URL'] ?? null);

if (!$dbUrl) {
    echo "ERROR: DATABASE_URL is not set in current environment.\n";
    exit(1);
}

// Mask secret for safe output
$maskedUrl = preg_replace('/:[^:@]+@/', ':****@', $dbUrl);
echo "Connecting to Railway Staging PostgreSQL: $maskedUrl\n";

try {
    // Parse URL
    $parsed = parse_url($dbUrl);
    $host = $parsed['host'] ?? '127.0.0.1';
    $port = $parsed['port'] ?? 5432;
    $user = $parsed['user'] ?? 'postgres';
    $pass = $parsed['pass'] ?? '';
    $dbname = ltrim($parsed['path'] ?? 'railway', '/');

    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;sslmode=require";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 10,
    ]);

    $version = $pdo->query("SELECT version()")->fetchColumn();
    echo "SUCCESS: Connected to PostgreSQL! Engine version:\n$version\n";

    // Check existing tables
    $stmt = $pdo->query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Existing tables in public schema (" . count($tables) . "): " . implode(', ', $tables) . "\n";

} catch (Exception $e) {
    echo "ERROR connecting to PostgreSQL: " . $e->getMessage() . "\n";
    exit(1);
}
