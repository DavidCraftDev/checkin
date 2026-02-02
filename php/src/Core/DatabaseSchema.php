<?php

namespace CheckIn\Core;

use PDO;
use PDOException;

class DatabaseSchema
{
    /**
     * Initialize database schema - creates all tables if they don't exist
     * Matches TypeScript/Prisma schema exactly - 100% compatibility
     */
    public static function initialize(): void
    {
        $db = Database::getConnection();
        
        try {
            self::log('INFO', 'Starting database schema initialization...');
            
            // Start transaction
            $db->beginTransaction();
            
            // Create ENUM type for TrafficLightFeedback
            self::createEnumType($db);
            
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
     * Create TrafficLightFeedback ENUM type
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
     * Create User table
     */
    private static function createUserTable(PDO $db): void
    {
        $sql = <<<SQL
        CREATE TABLE IF NOT EXISTS "User" (
            id TEXT PRIMARY KEY DEFAULT ('c' || substr(md5(random()::text || clock_timestamp()::text), 1, 24)),
            username TEXT UNIQUE NOT NULL,
            displayname TEXT NOT NULL,
            permission INTEGER DEFAULT 0 NOT NULL,
            password TEXT,
            "group" TEXT[] DEFAULT '{}',
            needs TEXT[] DEFAULT '{}',
            competence TEXT[] DEFAULT '{}',
            courses TEXT[] NOT NULL DEFAULT '{}',
            "pwdLastSet" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
        
        -- Create unique constraint if not exists
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint 
                WHERE conname = 'User_id_key'
            ) THEN
                ALTER TABLE "User" ADD CONSTRAINT "User_id_key" UNIQUE (id);
            END IF;
            
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint 
                WHERE conname = 'User_username_key'
            ) THEN
                ALTER TABLE "User" ADD CONSTRAINT "User_username_key" UNIQUE (username);
            END IF;
        END$$;
        SQL;
        
        $db->exec($sql);
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
        
        -- Create unique constraint if not exists
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint 
                WHERE conname = 'Session_id_key'
            ) THEN
                ALTER TABLE "Session" ADD CONSTRAINT "Session_id_key" UNIQUE (id);
            END IF;
        END$$;
        SQL;
        
        $db->exec($sql);
    }
    
    /**
     * Create Events table
     */
    private static function createEventsTable(PDO $db): void
    {
        $sql = <<<SQL
        CREATE TABLE IF NOT EXISTS "Events" (
            id TEXT PRIMARY KEY DEFAULT ('c' || substr(md5(random()::text || clock_timestamp()::text), 1, 24)),
            type TEXT NOT NULL,
            "user" TEXT NOT NULL,
            cw INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
        
        -- Create unique constraint if not exists
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint 
                WHERE conname = 'Events_id_key'
            ) THEN
                ALTER TABLE "Events" ADD CONSTRAINT "Events_id_key" UNIQUE (id);
            END IF;
        END$$;
        SQL;
        
        $db->exec($sql);
    }
    
    /**
     * Create Attendances table
     */
    private static function createAttendancesTable(PDO $db): void
    {
        $sql = <<<SQL
        CREATE TABLE IF NOT EXISTS "Attendances" (
            id TEXT PRIMARY KEY DEFAULT ('c' || substr(md5(random()::text || clock_timestamp()::text), 1, 24)),
            "userID" TEXT NOT NULL,
            "eventID" TEXT NOT NULL,
            cw INTEGER NOT NULL,
            "teacherNote" TEXT,
            "studentNote" TEXT,
            type TEXT,
            feedback "TrafficLightFeedback" DEFAULT 'GREEN' NOT NULL,
            "selfReflection" TEXT,
            attended BOOLEAN DEFAULT true NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
        
        -- Create unique constraint if not exists
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint 
                WHERE conname = 'Attendances_id_key'
            ) THEN
                ALTER TABLE "Attendances" ADD CONSTRAINT "Attendances_id_key" UNIQUE (id);
            END IF;
        END$$;
        SQL;
        
        $db->exec($sql);
    }
    
    /**
     * Create StudyTimeData table
     */
    private static function createStudyTimeDataTable(PDO $db): void
    {
        $sql = <<<SQL
        CREATE TABLE IF NOT EXISTS "StudyTimeData" (
            id TEXT PRIMARY KEY DEFAULT ('c' || substr(md5(random()::text || clock_timestamp()::text), 1, 24)),
            "userID" TEXT NOT NULL,
            needs TEXT[] DEFAULT '{}',
            cw INTEGER NOT NULL,
            year INTEGER NOT NULL
        );
        
        -- Create unique constraint if not exists
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint 
                WHERE conname = 'StudyTimeData_id_key'
            ) THEN
                ALTER TABLE "StudyTimeData" ADD CONSTRAINT "StudyTimeData_id_key" UNIQUE (id);
            END IF;
        END$$;
        SQL;
        
        $db->exec($sql);
    }
    
    /**
     * Create ClosedStudyTimes table
     */
    private static function createClosedStudyTimesTable(PDO $db): void
    {
        $sql = <<<SQL
        CREATE TABLE IF NOT EXISTS "ClosedStudyTimes" (
            "lessonID" TEXT PRIMARY KEY DEFAULT ('c' || substr(md5(random()::text || clock_timestamp()::text), 1, 24)),
            "courseID" TEXT NOT NULL
        );
        
        -- Create unique constraint if not exists
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint 
                WHERE conname = 'ClosedStudyTimes_lessonID_key'
            ) THEN
                ALTER TABLE "ClosedStudyTimes" ADD CONSTRAINT "ClosedStudyTimes_lessonID_key" UNIQUE ("lessonID");
            END IF;
        END$$;
        SQL;
        
        $db->exec($sql);
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
