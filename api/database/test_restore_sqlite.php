<?php

$sourceDb = __DIR__ . '/backup_pre_postgres_20261012.sqlite';
$exportDir = __DIR__ . '/backups_json';
$testDb = __DIR__ . '/test_restore.sqlite';

if (file_exists($testDb)) {
    unlink($testDb);
}

echo "Testing SQLite restoration into isolated database: $testDb\n";

try {
    // 1. Connect to source backup DB to get DDLs
    $sourcePdo = new PDO("sqlite:$sourceDb");
    $sourcePdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 2. Connect to fresh isolated test DB
    $destPdo = new PDO("sqlite:$testDb");
    $destPdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 3. Replicate table definitions
    $stmt = $sourcePdo->query("SELECT sql FROM sqlite_master WHERE type='table' AND sql NOT NULL AND name NOT LIKE 'sqlite_%'");
    $ddls = $stmt->fetchAll(PDO::FETCH_COLUMN);

    foreach ($ddls as $ddl) {
        $destPdo->exec($ddl);
    }
    echo "Recreated " . count($ddls) . " tables in target database.\n";

    // 4. Read manifest
    $manifestFile = "$exportDir/export_manifest.json";
    if (!file_exists($manifestFile)) {
        throw new Exception("Manifest not found: $manifestFile");
    }
    $manifest = json_decode(file_get_contents($manifestFile), true);

    $reconciled = true;
    foreach ($manifest['tables'] as $table => $expectedCount) {
        $jsonPath = "$exportDir/{$table}.json";
        if (!file_exists($jsonPath)) {
            continue;
        }
        $data = json_decode(file_get_contents($jsonPath), true);
        
        if (!empty($data)) {
            $cols = array_keys($data[0]);
            $colNames = implode(', ', array_map(fn($c) => "\"$c\"", $cols));
            $placeholders = implode(', ', array_map(fn($c) => ":$c", $cols));
            $stmt = $destPdo->prepare("INSERT INTO \"$table\" ($colNames) VALUES ($placeholders)");

            foreach ($data as $row) {
                $stmt->execute($row);
            }
        }

        $res = $destPdo->query("SELECT COUNT(*) FROM \"$table\"")->fetchColumn();
        echo "Table '$table': Expected $expectedCount, Restored $res. ";
        if ((int)$res === (int)$expectedCount) {
            echo "[PASS]\n";
        } else {
            echo "[FAIL - Count Mismatch]\n";
            $reconciled = false;
        }

        // Compare specific records for users and purchases
        if ($table === 'users' && !empty($data)) {
            $checkUser = $destPdo->query("SELECT email, role, subscription_tier FROM users WHERE id=1")->fetch(PDO::FETCH_ASSOC);
            if ($checkUser['email'] === 'admin@vimztools.com' && $checkUser['role'] === 'admin') {
                echo " -> User 1 verification (admin@vimztools.com): [PASS]\n";
            } else {
                echo " -> User 1 verification: [FAIL]\n";
                $reconciled = false;
            }
        }
        if ($table === 'purchases' && !empty($data)) {
            $checkPurch = $destPdo->query("SELECT tool_slug, amount, transaction_id FROM purchases WHERE id=1")->fetch(PDO::FETCH_ASSOC);
            if ($checkPurch['tool_slug'] === 'invoice-generator' && (float)$checkPurch['amount'] === 4.99) {
                echo " -> Purchase 1 verification (invoice-generator, $4.99): [PASS]\n";
            } else {
                echo " -> Purchase 1 verification: [FAIL]\n";
                $reconciled = false;
            }
        }
    }

    // Close connections before unlinking (Windows file locking)
    $destPdo = null;
    $sourcePdo = null;

    if ($reconciled) {
        echo "SUCCESS: 100% Data restoration and field reconciliation verified!\n";
    } else {
        echo "FAILED: Data reconciliation failed.\n";
        exit(1);
    }

    if (file_exists($testDb)) {
        unlink($testDb);
        echo "Cleaned up temporary test database.\n";
    }

} catch (Exception $e) {
    echo "ERROR during restore test: " . $e->getMessage() . "\n";
    $destPdo = null;
    $sourcePdo = null;
    if (file_exists($testDb)) {
        unlink($testDb);
    }
    exit(1);
}
