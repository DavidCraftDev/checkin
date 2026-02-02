<?php

namespace CheckIn\Core;

use PDO;
use PDOException;

class DatabaseSchema
{
    /**
     * Initialize database schema - creates all tables if they don't exist
     */
    public static function initialize(): void
    {
        $db = Database::getConnection();
        
        try {
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
            
            error_log('Database schema initialized successfully');
        } catch (PDOException $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            error_log('Database schema initialization failed: ' . $e->getMessage());
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
            id TEXT PRIMARY KEY,
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
            id TEXT PRIMARY KEY,
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
            id TEXT PRIMARY KEY,
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
            id TEXT PRIMARY KEY,
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
            "lessonID" TEXT PRIMARY KEY,
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
}
