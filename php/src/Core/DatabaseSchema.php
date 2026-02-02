<?php

namespace CheckIn\Core;

use PDO;
use PDOException;

class DatabaseSchema
{
    /**
     * Initialize database schema - creates all tables if they don't exist
     * Matches TypeScript/Prisma schema exactly - 100% compatibility
     * Supports both PostgreSQL and SQLite
     */
    public static function initialize(): void
    {
        $db = Database::getConnection();
        $driver = Database::getDriver();
        
        try {
            self::log('INFO', "Starting database schema initialization (driver: {$driver})...");
            
            // Start transaction
            $db->beginTransaction();
            
            // Create ENUM type for TrafficLightFeedback (PostgreSQL only)
            if (Database::isPostgreSQL()) {
                self::createEnumType($db);
            }
            
            // Create tables in order (respecting foreign key dependencies)
            self::createUserTable($db);
            self::createSessionTable($db);
            self::createEventsTable($db);
            self::createAttendancesTable($db);
            self::createStudyTimeDataTable($db);
            self::createClosedStudyTimesTable($db);
            
            // Commit transaction
            $db->commit();
            
            self::log('SUCCESS', 'Database schema initialized successfully');
            
            // Create default admin user if configured (matches scripts/defaultSeed.ts)
            self::createDefaultUser();
            
        } catch (PDOException $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            self::log('ERROR', 'Database schema initialization failed: ' . $e->getMessage());
            throw new \Exception('Failed to initialize database schema: ' . $e->getMessage());
        }
    }
    
    /**
     * Create TrafficLightFeedback ENUM type (PostgreSQL only)
     */
    private static function createEnumType(PDO $db): void
    {
        $sql = <<<SQL
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TrafficLightFeedback') THEN
                CREATE TYPE "TrafficLightFeedback" AS ENUM ('GREEN', 'YELLOW', 'RED');
            END IF;
        END$$;
        SQL;
        
        $db->exec($sql);
    }
    
    /**
     * Get CUID default expression for the current database driver
     */
    private static function getCuidDefault(): string
    {
        if (Database::isPostgreSQL()) {
            return "DEFAULT ('c' || substr(md5(random()::text || clock_timestamp()::text), 1, 24))";
        } else {
            // SQLite - use hex of random blob
            return "DEFAULT ('c' || substr(lower(hex(randomblob(12))), 1, 24))";
        }
    }
    
    /**
     * Get array field type for the current database driver
     */
    private static function getArrayType(): string
    {
        if (Database::isPostgreSQL()) {
            return "TEXT[]";
        } else {
            // SQLite - use TEXT (will store JSON)
            return "TEXT";
        }
    }
    
    /**
     * Get feedback field definition for the current database driver
     */
    private static function getFeedbackField(): string
    {
        if (Database::isPostgreSQL()) {
            return 'feedback "TrafficLightFeedback" DEFAULT \'GREEN\' NOT NULL';
        } else {
            // SQLite - use TEXT with CHECK constraint
            return "feedback TEXT DEFAULT 'GREEN' NOT NULL CHECK (feedback IN ('GREEN', 'YELLOW', 'RED'))";
        }
    }
    
    /**
     * Add unique constraint (PostgreSQL uses DO blocks, SQLite uses CREATE UNIQUE INDEX)
     */
    private static function addUniqueConstraint(PDO $db, string $table, string $column, string $constraintName): void
    {
        if (Database::isPostgreSQL()) {
            $sql = <<<SQL
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = '{$constraintName}'
                ) THEN
                    ALTER TABLE "{$table}" ADD CONSTRAINT "{$constraintName}" UNIQUE ({$column});
                END IF;
            END$$;
            SQL;
            $db->exec($sql);
        } else {
            // SQLite - CREATE UNIQUE INDEX IF NOT EXISTS
            $sql = "CREATE UNIQUE INDEX IF NOT EXISTS \"{$constraintName}\" ON \"{$table}\" ({$column})";
            $db->exec($sql);
        }
    }
    
    /**
     * Create User table
     */
    private static function createUserTable(PDO $db): void
    {
        $cuidDefault = self::getCuidDefault();
        $arrayType = self::getArrayType();
        $arrayDefault = Database::isPostgreSQL() ? "'{}'" : "'{}'";
        
        $sql = <<<SQL
        CREATE TABLE IF NOT EXISTS "User" (
            id TEXT PRIMARY KEY {$cuidDefault},
            username TEXT UNIQUE NOT NULL,
            displayname TEXT NOT NULL,
            permission INTEGER DEFAULT 0 NOT NULL,
            password TEXT,
            "group" {$arrayType} DEFAULT {$arrayDefault},
            needs {$arrayType} DEFAULT {$arrayDefault},
            competence {$arrayType} DEFAULT {$arrayDefault},
            courses {$arrayType} NOT NULL DEFAULT {$arrayDefault},
            "pwdLastSet" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
        SQL;
        
        $db->exec($sql);
        
        // Add unique constraints
        self::addUniqueConstraint($db, 'User', 'id', 'User_id_key');
        self::addUniqueConstraint($db, 'User', 'username', 'User_username_key');
    }
    
    /**
     * Create Session table
     */
    private static function createSessionTable(PDO $db): void
    {
        $sql = <<<SQL
        CREATE TABLE IF NOT EXISTS "Session" (
            id TEXT PRIMARY KEY,
            "userID" TEXT NOT NULL,
            "expiresAt" TIMESTAMP NOT NULL,
            CONSTRAINT "Session_userID_fkey" FOREIGN KEY ("userID") 
                REFERENCES "User"(id) ON DELETE CASCADE
        );
        SQL;
        
        $db->exec($sql);
        
        // Add unique constraint
        self::addUniqueConstraint($db, 'Session', 'id', 'Session_id_key');
    }
    
    /**
     * Create Events table
     */
    private static function createEventsTable(PDO $db): void
    {
        $cuidDefault = self::getCuidDefault();
        
        $sql = <<<SQL
        CREATE TABLE IF NOT EXISTS "Events" (
            id TEXT PRIMARY KEY {$cuidDefault},
            type TEXT NOT NULL,
            "user" TEXT NOT NULL,
            cw INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
        SQL;
        
        $db->exec($sql);
        
        // Add unique constraint
        self::addUniqueConstraint($db, 'Events', 'id', 'Events_id_key');
    }
    
    /**
     * Create Attendances table
     */
    private static function createAttendancesTable(PDO $db): void
    {
        $cuidDefault = self::getCuidDefault();
        $feedbackField = self::getFeedbackField();
        
        $sql = <<<SQL
        CREATE TABLE IF NOT EXISTS "Attendances" (
            id TEXT PRIMARY KEY {$cuidDefault},
            "userID" TEXT NOT NULL,
            "eventID" TEXT NOT NULL,
            cw INTEGER NOT NULL,
            "teacherNote" TEXT,
            "studentNote" TEXT,
            type TEXT,
            {$feedbackField},
            "selfReflection" TEXT,
            attended BOOLEAN DEFAULT true NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
        SQL;
        
        $db->exec($sql);
        
        // Add unique constraint
        self::addUniqueConstraint($db, 'Attendances', 'id', 'Attendances_id_key');
    }
    
    /**
     * Create StudyTimeData table
     */
    private static function createStudyTimeDataTable(PDO $db): void
    {
        $cuidDefault = self::getCuidDefault();
        $arrayType = self::getArrayType();
        $arrayDefault = Database::isPostgreSQL() ? "'{}'" : "'{}'";
        
        $sql = <<<SQL
        CREATE TABLE IF NOT EXISTS "StudyTimeData" (
            id TEXT PRIMARY KEY {$cuidDefault},
            "userID" TEXT NOT NULL,
            needs {$arrayType} DEFAULT {$arrayDefault},
            cw INTEGER NOT NULL,
            year INTEGER NOT NULL
        );
        SQL;
        
        $db->exec($sql);
        
        // Add unique constraint
        self::addUniqueConstraint($db, 'StudyTimeData', 'id', 'StudyTimeData_id_key');
    }
    
    /**
     * Create ClosedStudyTimes table
     */
    private static function createClosedStudyTimesTable(PDO $db): void
    {
        $cuidDefault = self::getCuidDefault();
        
        $sql = <<<SQL
        CREATE TABLE IF NOT EXISTS "ClosedStudyTimes" (
            "lessonID" TEXT PRIMARY KEY {$cuidDefault},
            "courseID" TEXT NOT NULL
        );
        SQL;
        
        $db->exec($sql);
        
        // Add unique constraint
        self::addUniqueConstraint($db, 'ClosedStudyTimes', '"lessonID"', 'ClosedStudyTimes_lessonID_key');
    }
    
    /**
     * Check if database schema exists
     */
    public static function schemaExists(): bool
    {
        try {
            $db = Database::getConnection();
            
            // Check if key tables exist
            $result = $db->query("
                SELECT COUNT(*) as count
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('User', 'Session', 'Events', 'Attendances')
            ")->fetch();
            
            return $result && $result['count'] == 4;
        } catch (PDOException $e) {
            return false;
        }
    }
    
    /**
     * Create default admin user from environment variables
     * Matches TypeScript implementation in scripts/defaultSeed.ts EXACTLY
     */
    private static function createDefaultUser(): void
    {
        try {
            $username = Config::get('DEFAULT_LOGIN.USERNAME');
            $password = Config::get('DEFAULT_LOGIN.PASSWORD');
            
            if (empty($username) || empty($password)) {
                return;
            }
            
            // Add LDAP prefix if LDAP is enabled (matching TypeScript)
            $ldapEnabled = Config::get('LDAP.ENABLE');
            if ($ldapEnabled) {
                $username = 'local/' . $username;
            }
            
            // Lowercase username (matching TypeScript)
            $username = strtolower($username);
            
            // Check if any admin user exists (permission = 2)
            // Matching TypeScript: creates user only if no admins exist
            $adminCount = Database::fetchOne(
                'SELECT COUNT(*) as count FROM "User" WHERE permission = 2'
            );
            
            if ($adminCount && $adminCount['count'] > 0) {
                return;
            }
            
            // Check if username already exists (matching TypeScript error handling)
            $usernameCount = Database::fetchOne(
                'SELECT COUNT(*) as count FROM "User" WHERE username = ?',
                [$username]
            );
            
            if ($usernameCount && $usernameCount['count'] > 0) {
                self::log('ERROR', 'Default admin username already exists in the database and there are no other admin users. Please provide a different username in the config file.');
                return;
            }
            
            // Create admin user with bcrypt cost 12 (matching TypeScript)
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
            
            Database::query(
                'INSERT INTO "User" (username, displayname, permission, password, "pwdLastSet") 
                 VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
                [
                    $username,
                    'Default Admin',  // Matching TypeScript exactly
                    2,                // Matching TypeScript permission level
                    $hashedPassword
                ]
            );
            
            // Log success (matching TypeScript logger output)
            self::log('INFO', 'New default admin created because no admins were found in the database.');
            self::log('INFO', "Username: $username");
            
        } catch (\Exception $e) {
            self::log('ERROR', 'Failed to create default user: ' . $e->getMessage());
        }
    }
    
    /**
     * Structured logging matching TypeScript logger
     */
    private static function log(string $level, string $message): void
    {
        $timestamp = date('Y-m-d H:i:s');
        $formatted = "[$timestamp] [$level] [Seed] $message";
        error_log($formatted);
    }
}
