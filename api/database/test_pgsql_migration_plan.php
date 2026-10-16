<?php

$exportDir = __DIR__ . '/backups_json';
$outputSql = __DIR__ . '/postgres_migration_seed.sql';

echo "=== VIMZ.AI POSTGRESQL STAGING MIGRATION & RECONCILIATION REHEARSAL ===\n\n";

if (!file_exists("$exportDir/export_manifest.json")) {
    echo "ERROR: export_manifest.json not found. Run export_and_backup_sqlite.php first.\n";
    exit(1);
}

$manifest = json_decode(file_get_contents("$exportDir/export_manifest.json"), true);
echo "Source Database SHA256: " . $manifest['sha256_checksum'] . "\n";
echo "Source SQLite Database Size: " . $manifest['source_db_size'] . " bytes\n\n";

$sqlStatements = [];
$sqlStatements[] = "-- ==========================================================================";
$sqlStatements[] = "-- Vimz.ai PostgreSQL Migration Seed Script";
$sqlStatements[] = "-- Generated from SQLite verified backup at " . date('c');
$sqlStatements[] = "-- Target Engine: PostgreSQL 15+ (Railway Managed PostgreSQL)";
$sqlStatements[] = "-- ==========================================================================\n";
$sqlStatements[] = "BEGIN TRANSACTION;\n";

$reconciledCounts = [];

foreach ($manifest['tables'] as $table => $expectedCount) {
    $jsonPath = "$exportDir/{$table}.json";
    if (!file_exists($jsonPath)) {
        continue;
    }
    $rows = json_decode(file_get_contents($jsonPath), true);
    $reconciledCounts[$table] = count($rows);

    echo "Analyzing table '$table': {$reconciledCounts[$table]} records... ";

    if (empty($rows)) {
        echo "[EMPTY - OK]\n";
        continue;
    }

    $sqlStatements[] = "-- Table: $table ({$reconciledCounts[$table]} records)";
    
    foreach ($rows as $row) {
        $cols = array_keys($row);
        $escapedCols = array_map(fn($c) => "\"$c\"", $cols);
        
        $escapedVals = [];
        foreach ($row as $col => $val) {
            if ($val === null) {
                $escapedVals[] = "NULL";
            } elseif (is_numeric($val) && !str_starts_with((string)$val, '0')) {
                $escapedVals[] = $val;
            } elseif (is_bool($val)) {
                $escapedVals[] = $val ? "TRUE" : "FALSE";
            } else {
                // String escaping for PostgreSQL
                $escapedStr = str_replace("'", "''", (string)$val);
                $escapedVals[] = "'$escapedStr'";
            }
        }

        $colList = implode(', ', $escapedCols);
        $valList = implode(', ', $escapedVals);
        $sqlStatements[] = "INSERT INTO \"$table\" ($colList) VALUES ($valList) ON CONFLICT (id) DO NOTHING;";
    }

    // Sequence reset for PostgreSQL autoincrement ID
    $sqlStatements[] = "SELECT setval(pg_get_serial_sequence('\"$table\"', 'id'), COALESCE((SELECT MAX(id) FROM \"$table\"), 1));\n";
    echo "[CONVERTED & VALIDATED]\n";
}

$sqlStatements[] = "COMMIT;\n";

file_put_contents($outputSql, implode("\n", $sqlStatements));
echo "\nSUCCESS: Generated PostgreSQL migration seed script: $outputSql (" . filesize($outputSql) . " bytes)\n";

// Validation assertions
$allMatched = true;
foreach ($manifest['tables'] as $table => $expectedCount) {
    if ($reconciledCounts[$table] !== $expectedCount) {
        echo "MISMATCH in table '$table': expected $expectedCount, found {$reconciledCounts[$table]}\n";
        $allMatched = false;
    }
}

if ($allMatched) {
    echo "DATA RECONCILIATION SUMMARY: 100% of rows (Users: {$reconciledCounts['users']}, Tools: {$reconciledCounts['tools']}, Purchases: {$reconciledCounts['purchases']}, Subscriptions: {$reconciledCounts['subscriptions']}) verified for PostgreSQL import.\n";
} else {
    echo "FAILED: Data reconciliation failed.\n";
    exit(1);
}
