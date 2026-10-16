<?php

$dbPath = __DIR__ . '/database.sqlite';
$backupDbPath = __DIR__ . '/backup_pre_postgres_20261012.sqlite';
$outputDir = __DIR__ . '/backups_json';

if (!file_exists($dbPath)) {
    echo "ERROR: SQLite database not found at $dbPath\n";
    exit(1);
}

// 1. Cold binary backup
echo "Creating cold SQLite binary backup...\n";
if (!copy($dbPath, $backupDbPath)) {
    echo "ERROR: Failed to copy database.sqlite to $backupDbPath\n";
    exit(1);
}
echo "SUCCESS: Cold backup created at $backupDbPath (" . filesize($backupDbPath) . " bytes)\n";

// 2. Structured JSON Export
if (!is_dir($outputDir)) {
    mkdir($outputDir, 0755, true);
}

try {
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $tables = ['users', 'personal_access_tokens', 'tools', 'purchases', 'subscriptions', 'user_entitlements', 'payment_events'];
    $summary = [];

    foreach ($tables as $table) {
        // Check if table exists
        $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='$table'");
        if (!$stmt->fetch()) {
            echo "Notice: Table '$table' does not exist in SQLite DB. Exporting empty array.\n";
            file_put_contents("$outputDir/{$table}.json", json_encode([], JSON_PRETTY_PRINT));
            $summary[$table] = 0;
            continue;
        }

        $stmt = $pdo->query("SELECT * FROM $table ORDER BY id ASC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $count = count($rows);
        $summary[$table] = $count;

        $jsonFile = "$outputDir/{$table}.json";
        file_put_contents($jsonFile, json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        echo "Exported table '$table': $count records to $jsonFile\n";
    }

    $summaryPath = "$outputDir/export_manifest.json";
    $manifest = [
        'timestamp' => date('c'),
        'source_db_size' => filesize($dbPath),
        'backup_db_size' => filesize($backupDbPath),
        'tables' => $summary,
        'sha256_checksum' => hash_file('sha256', $dbPath)
    ];
    file_put_contents($summaryPath, json_encode($manifest, JSON_PRETTY_PRINT));
    echo "SUCCESS: Structured export complete. Manifest saved to $summaryPath\n";

} catch (Exception $e) {
    echo "ERROR during JSON export: " . $e->getMessage() . "\n";
    exit(1);
}
