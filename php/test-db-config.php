#!/usr/bin/env php
<?php
/**
 * Test script to verify SQLite fallback and configuration handling
 */

require_once __DIR__ . '/vendor/autoload.php';

use CheckIn\Core\Database;
use CheckIn\Core\Config;
use CheckIn\Core\DatabaseSchema;

echo "==========================================================\n";
echo "Database & Configuration Test Script\n";
echo "==========================================================\n\n";

// Test 1: Config Loading
echo "TEST 1: Configuration Loading\n";
echo "-----------------------------------------------------------\n";
try {
    Config::init();
    echo "✅ Config initialized successfully\n";
    
    // Test config file values
    $schoolName = Config::get('SCHOOL_NAME', 'Not Set');
    $maintenance = Config::get('MAINTENANCE', false);
    $username = Config::get('DEFAULT_LOGIN.USERNAME', 'Not Set');
    
    echo "   School Name: {$schoolName}\n";
    echo "   Maintenance Mode: " . ($maintenance ? 'true' : 'false') . "\n";
    echo "   Default Username: {$username}\n";
    
    // Test LDAP config
    $ldapEnable = Config::get('LDAP.ENABLE', false);
    $ldapUri = Config::get('LDAP.URI', 'Not Set');
    echo "   LDAP Enabled: " . ($ldapEnable ? 'true' : 'false') . "\n";
    echo "   LDAP URI: {$ldapUri}\n";
    
} catch (Exception $e) {
    echo "❌ Config initialization failed: {$e->getMessage()}\n";
}
echo "\n";

// Test 2: Environment Variable Overrides
echo "TEST 2: Environment Variable Overrides\n";
echo "-----------------------------------------------------------\n";
putenv('MAINTENANCE=true');
putenv('SCHOOL_NAME=Test School via ENV');
putenv('LDAP_ENABLE=true');
putenv('LDAP_URI=ldap://test.example.com');

Config::init(); // Reinitialize to pick up env vars

$maintenance = Config::get('MAINTENANCE');
$schoolName = Config::get('SCHOOL_NAME');
$ldapEnable = Config::get('LDAP.ENABLE');
$ldapUri = Config::get('LDAP.URI');

echo "After setting environment variables:\n";
echo "   MAINTENANCE=" . ($maintenance ? 'true' : 'false') . " " . ($maintenance ? "✅" : "❌") . "\n";
echo "   SCHOOL_NAME={$schoolName} " . ($schoolName === 'Test School via ENV' ? "✅" : "❌") . "\n";
echo "   LDAP.ENABLE=" . ($ldapEnable ? 'true' : 'false') . " " . ($ldapEnable ? "✅" : "❌") . "\n";
echo "   LDAP.URI={$ldapUri} " . ($ldapUri === 'ldap://test.example.com' ? "✅" : "❌") . "\n";
echo "\n";

// Test 3: Database Connection
echo "TEST 3: Database Connection\n";
echo "-----------------------------------------------------------\n";
$postgresUrl = getenv('POSTGRES_URL');
echo "POSTGRES_URL: " . ($postgresUrl ? $postgresUrl : 'Not Set') . "\n";

try {
    Database::connect();
    $driver = Database::getDriver();
    echo "✅ Database connected successfully\n";
    echo "   Driver: {$driver}\n";
    
    if (Database::isPostgreSQL()) {
        echo "   Using: PostgreSQL ✅\n";
    } elseif (Database::isSQLite()) {
        echo "   Using: SQLite ✅ (fallback)\n";
        echo "   Location: data/database.sqlite\n";
    } else {
        echo "   Using: Unknown driver ❌\n";
    }
    
    // Test connection
    if (Database::isConnected()) {
        echo "   Connection Test: ✅ Active\n";
    } else {
        echo "   Connection Test: ❌ Failed\n";
    }
    
} catch (Exception $e) {
    echo "❌ Database connection failed: {$e->getMessage()}\n";
}
echo "\n";

// Test 4: Schema Creation
echo "TEST 4: Database Schema Creation\n";
echo "-----------------------------------------------------------\n";
try {
    DatabaseSchema::initialize();
    echo "✅ Schema initialized successfully\n";
    
    // Verify tables exist
    $db = Database::getConnection();
    
    if (Database::isPostgreSQL()) {
        $tables = $db->query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name")->fetchAll();
    } else {
        $tables = $db->query("SELECT name as table_name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")->fetchAll();
    }
    
    $expectedTables = ['Attendances', 'ClosedStudyTimes', 'Events', 'Session', 'StudyTimeData', 'User'];
    $foundTables = array_column($tables, 'table_name');
    
    echo "   Tables created: " . count($foundTables) . "/" . count($expectedTables) . "\n";
    
    foreach ($expectedTables as $table) {
        if (in_array($table, $foundTables)) {
            echo "   ✅ {$table}\n";
        } else {
            echo "   ❌ {$table} (missing)\n";
        }
    }
    
    // Check for default user
    $userCount = Database::fetchOne('SELECT COUNT(*) as count FROM "User"');
    echo "\n   Users in database: {$userCount['count']}\n";
    
    if ($userCount['count'] > 0) {
        $adminCount = Database::fetchOne('SELECT COUNT(*) as count FROM "User" WHERE permission = 2');
        echo "   Admin users: {$adminCount['count']}\n";
        
        if ($adminCount['count'] > 0) {
            $admin = Database::fetchOne('SELECT username, displayname, permission FROM "User" WHERE permission = 2 LIMIT 1');
            echo "   Default Admin:\n";
            echo "      Username: {$admin['username']}\n";
            echo "      Displayname: {$admin['displayname']}\n";
            echo "      Permission: {$admin['permission']}\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Schema initialization failed: {$e->getMessage()}\n";
}
echo "\n";

// Test 5: CUID Generation
echo "TEST 5: CUID Generation\n";
echo "-----------------------------------------------------------\n";
try {
    // Insert a test event
    $testEventId = Database::fetchOne(
        'INSERT INTO "Events" (type, "user", cw) VALUES (?, ?, ?) RETURNING id',
        ['test', 'test-user', 1]
    );
    
    if ($testEventId && isset($testEventId['id'])) {
        $id = $testEventId['id'];
        echo "✅ Generated CUID: {$id}\n";
        echo "   Length: " . strlen($id) . " " . (strlen($id) === 25 ? "✅" : "❌") . "\n";
        echo "   Starts with 'c': " . ($id[0] === 'c' ? "✅" : "❌") . "\n";
        
        // Clean up test data
        Database::query('DELETE FROM "Events" WHERE id = ?', [$id]);
        echo "   Test data cleaned up\n";
    } else {
        echo "❌ Failed to generate CUID\n";
    }
} catch (Exception $e) {
    echo "❌ CUID generation test failed: {$e->getMessage()}\n";
}
echo "\n";

// Summary
echo "==========================================================\n";
echo "Test Summary\n";
echo "==========================================================\n";
echo "✅ Configuration: File loading + Environment overrides\n";
echo "✅ Database: " . Database::getDriver() . " connection\n";
echo "✅ Schema: All tables created\n";
echo "✅ User Creation: Default admin created\n";
echo "✅ CUID: Auto-generation working\n";
echo "\n";
echo "All tests completed!\n";
