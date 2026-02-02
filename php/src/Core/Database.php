<?php

namespace CheckIn\Core;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $connection = null;
    private static ?string $driver = null;

    public static function connect(): void
    {
        if (self::$connection !== null) {
            return;
        }

        $dbUrl = getenv('POSTGRES_URL');
        
        // Try PostgreSQL first, fallback to SQLite
        if ($dbUrl && $dbUrl !== 'false' && $dbUrl !== '') {
            self::connectPostgreSQL($dbUrl);
        } else {
            self::connectSQLite();
        }
    }

    private static function connectPostgreSQL(string $dbUrl): void
    {
        // Parse PostgreSQL URL: postgres://user:pass@host:port/dbname
        $parts = parse_url($dbUrl);
        $host = $parts['host'] ?? 'localhost';
        $port = $parts['port'] ?? 5432;
        $dbname = ltrim($parts['path'] ?? '/postgres', '/');
        $user = $parts['user'] ?? 'postgres';
        $password = $parts['pass'] ?? '';

        $dsn = "pgsql:host={$host};port={$port};dbname={$dbname}";

        try {
            self::$connection = new PDO($dsn, $user, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]);
            self::$driver = 'pgsql';
            error_log('Connected to PostgreSQL database');
        } catch (PDOException $e) {
            error_log('PostgreSQL connection failed: ' . $e->getMessage() . ' - Falling back to SQLite');
            self::connectSQLite();
        }
    }

    private static function connectSQLite(): void
    {
        $dataDir = dirname(__DIR__, 2) . '/data';
        if (!is_dir($dataDir)) {
            if (!mkdir($dataDir, 0755, true)) {
                throw new \Exception('Failed to create data directory');
            }
        }

        $dbPath = $dataDir . '/database.sqlite';
        $isNewDb = !file_exists($dbPath);
        $dsn = "sqlite:{$dbPath}";

        try {
            self::$connection = new PDO($dsn, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]);
            self::$driver = 'sqlite';
            
            // For new databases, set auto_vacuum before creating any tables
            if ($isNewDb) {
                self::$connection->exec('PRAGMA auto_vacuum = FULL');
            }
            
            // Enable WAL (Write-Ahead Logging) for better concurrency
            self::$connection->exec('PRAGMA journal_mode = WAL');
            
            // Enable foreign keys for SQLite
            self::$connection->exec('PRAGMA foreign_keys = ON');
            
            // Optimize SQLite settings
            self::$connection->exec('PRAGMA synchronous = NORMAL');
            self::$connection->exec('PRAGMA cache_size = -20000'); // 20MB cache
            self::$connection->exec('PRAGMA temp_store = MEMORY');
            
            error_log('Connected to SQLite database: ' . $dbPath);
            error_log('SQLite optimizations: WAL mode, auto_vacuum ' . ($isNewDb ? 'FULL' : '(existing db)') . ', foreign keys ON');
        } catch (PDOException $e) {
            throw new \Exception('SQLite connection failed: ' . $e->getMessage());
        }
    }

    public static function getConnection(): PDO
    {
        if (self::$connection === null) {
            self::connect();
        }
        return self::$connection;
    }

    public static function getDriver(): string
    {
        if (self::$driver === null) {
            self::connect();
        }
        return self::$driver ?? 'unknown';
    }

    public static function isPostgreSQL(): bool
    {
        return self::getDriver() === 'pgsql';
    }

    public static function isSQLite(): bool
    {
        return self::getDriver() === 'sqlite';
    }

    public static function query(string $sql, array $params = []): \PDOStatement
    {
        try {
            $stmt = self::getConnection()->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log('Database query failed: ' . $e->getMessage() . ' | SQL: ' . $sql);
            throw new \Exception('Database query failed: ' . $e->getMessage(), 0, $e);
        }
    }

    public static function fetchAll(string $sql, array $params = []): array
    {
        return self::query($sql, $params)->fetchAll();
    }

    public static function fetchOne(string $sql, array $params = []): ?array
    {
        $result = self::query($sql, $params)->fetch();
        return $result ?: null;
    }

    public static function isConnected(): bool
    {
        try {
            if (self::$connection === null) {
                return false;
            }
            self::$connection->query('SELECT 1');
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }
}
