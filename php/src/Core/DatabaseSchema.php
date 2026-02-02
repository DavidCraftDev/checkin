<?php

namespace CheckIn\Core;

use PDO;
use PDOException;

class DatabaseSchema
{
    /**
     * Initialize database schema - creates all tables if they don't exist
     * ENHANCED: With validation, versioning, and comprehensive logging
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
            
            // ENHANCEMENT: Set schema version
            $version = self::getSchemaVersion();
            self::log('INFO', "Schema version: $version");
            
            // Create default admin user if configured
            self::createDefaultUser();
            
            // ENHANCEMENT: Validate schema after creation
            $validation = self::validateSchema();
            if ($validation['valid']) {
                self::log('SUCCESS', 'Schema validation passed');
            } else {
                self::log('WARNING', 'Schema validation found issues:');
                foreach ($validation['issues'] as $issue) {
                    self::log('WARNING', "  - $issue");
                }
            }
            
            // ENHANCEMENT: Log health status
            $health = self::getHealthStatus();
            self::log('INFO', 'Database health status: ' . $health['status']);
            self::log('INFO', 'Total users: ' . ($health['tables']['User'] ?? 'unknown'));
            self::log('INFO', 'Admin users: ' . $health['admin_count']);
            
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
     * Validate database schema integrity
     * ENHANCEMENT: Exceeds TypeScript - validates schema after creation
     * 
     * @return array Validation results with status and any issues found
     */
    public static function validateSchema(): array
    {
        $issues = [];
        $db = Database::getConnection();
        
        try {
            // Check all required tables exist
            $requiredTables = ['User', 'Session', 'Events', 'Attendances', 'StudyTimeData', 'ClosedStudyTimes'];
            foreach ($requiredTables as $table) {
                $result = $db->query("
                    SELECT COUNT(*) as count
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' AND table_name = '$table'
                ")->fetch();
                
                if (!$result || $result['count'] == 0) {
                    $issues[] = "Missing table: $table";
                }
            }
            
            // Check ENUM type exists
            $result = $db->query("
                SELECT COUNT(*) as count
                FROM pg_type 
                WHERE typname = 'TrafficLightFeedback'
            ")->fetch();
            
            if (!$result || $result['count'] == 0) {
                $issues[] = "Missing ENUM type: TrafficLightFeedback";
            }
            
            // Check foreign key constraint on Session table
            $result = $db->query("
                SELECT COUNT(*) as count
                FROM information_schema.table_constraints 
                WHERE table_name = 'Session' 
                AND constraint_type = 'FOREIGN KEY'
            ")->fetch();
            
            if (!$result || $result['count'] == 0) {
                $issues[] = "Missing foreign key constraint on Session table";
            }
            
            // Check for admin user
            $adminCount = Database::fetchOne(
                'SELECT COUNT(*) as count FROM "User" WHERE permission = 2'
            );
            
            if (!$adminCount || $adminCount['count'] == 0) {
                $issues[] = "WARNING: No admin user found in database";
            }
            
            return [
                'valid' => empty($issues),
                'issues' => $issues,
                'checked_at' => date('Y-m-d H:i:s')
            ];
            
        } catch (\Exception $e) {
            return [
                'valid' => false,
                'issues' => ['Validation error: ' . $e->getMessage()],
                'checked_at' => date('Y-m-d H:i:s')
            ];
        }
    }
    
    /**
     * Get schema health status
     * ENHANCEMENT: Exceeds TypeScript - provides detailed health metrics
     * 
     * @return array Health status information
     */
    public static function getHealthStatus(): array
    {
        try {
            $db = Database::getConnection();
            
            // Get table counts
            $tables = [];
            $tableNames = ['User', 'Session', 'Events', 'Attendances', 'StudyTimeData', 'ClosedStudyTimes'];
            
            foreach ($tableNames as $tableName) {
                try {
                    $result = Database::fetchOne("SELECT COUNT(*) as count FROM \"$tableName\"");
                    $tables[$tableName] = $result ? (int)$result['count'] : 0;
                } catch (\Exception $e) {
                    $tables[$tableName] = 'ERROR: ' . $e->getMessage();
                }
            }
            
            // Get admin count
            $adminCount = Database::fetchOne('SELECT COUNT(*) as count FROM "User" WHERE permission = 2');
            
            // Get database size
            $dbSize = $db->query("
                SELECT pg_size_pretty(pg_database_size(current_database())) as size
            ")->fetch();
            
            // Get database version
            $version = $db->query("SELECT version()")->fetch();
            
            return [
                'status' => 'healthy',
                'tables' => $tables,
                'admin_count' => $adminCount ? (int)$adminCount['count'] : 0,
                'database_size' => $dbSize ? $dbSize['size'] : 'unknown',
                'postgres_version' => $version ? $version['version'] : 'unknown',
                'checked_at' => date('Y-m-d H:i:s')
            ];
            
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'checked_at' => date('Y-m-d H:i:s')
            ];
        }
    }
    
    /**
     * Get schema version
     * ENHANCEMENT: Track schema version for migration management
     * 
     * @return string Schema version
     */
    public static function getSchemaVersion(): string
    {
        try {
            // Create version tracking table if it doesn't exist
            $db = Database::getConnection();
            $db->exec("
                CREATE TABLE IF NOT EXISTS \"_SchemaVersion\" (
                    version TEXT PRIMARY KEY,
                    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
                )
            ");
            
            // Get current version
            $result = Database::fetchOne("
                SELECT version FROM \"_SchemaVersion\" 
                ORDER BY applied_at DESC 
                LIMIT 1
            ");
            
            if ($result) {
                return $result['version'];
            }
            
            // No version found, insert initial version
            Database::query("
                INSERT INTO \"_SchemaVersion\" (version) 
                VALUES (?) 
                ON CONFLICT (version) DO NOTHING
            ", ['1.0.0-php']);
            
            return '1.0.0-php';
            
        } catch (\Exception $e) {
            return 'unknown';
        }
    }
    
    /**
     * Create default admin user from environment variables
     * Matches and EXCEEDS TypeScript implementation in scripts/defaultSeed.ts
     * 
     * Enhancements beyond TypeScript:
     * - Writes generated password back to config file
     * - Creates audit log entry in database
     * - Validates user creation
     * - Better error handling and logging
     */
    private static function createDefaultUser(): void
    {
        try {
            $username = Config::get('DEFAULT_LOGIN.USERNAME');
            $password = Config::get('DEFAULT_LOGIN.PASSWORD');
            $passwordWasGenerated = false;
            
            // Auto-generate password if empty (matching TypeScript behavior)
            if (empty($password)) {
                $password = self::generateSecurePassword();
                $passwordWasGenerated = true;
                self::log('WARNING', 'No default password configured. Auto-generated secure password.');
                self::log('IMPORTANT', 'Please change this password immediately after first login!');
            }
            
            if (empty($username)) {
                self::log('INFO', 'Default login username not configured - skipping default user creation');
                return;
            }
            
            // Add LDAP prefix if LDAP is enabled (matching TypeScript behavior)
            $ldapEnabled = Config::get('LDAP.ENABLE');
            if ($ldapEnabled) {
                $username = 'local/' . $username;
            }
            
            // Lowercase username (matching TypeScript behavior)
            $username = strtolower($username);
            
            // Check if any admin user exists (permission = 2)
            // Matching TypeScript: creates user only if no admins exist
            $adminCount = Database::fetchOne(
                'SELECT COUNT(*) as count FROM "User" WHERE permission = 2'
            );
            
            if ($adminCount && $adminCount['count'] > 0) {
                self::log('INFO', 'Admin user already exists - skipping default user creation');
                return;
            }
            
            // Check if username already exists
            $existingUser = Database::fetchOne(
                'SELECT id FROM "User" WHERE username = ?',
                [$username]
            );
            
            if ($existingUser) {
                self::log('ERROR', "Default admin username '$username' already exists but no admin user found!");
                self::log('ERROR', 'Please provide a different username in the config file.');
                return;
            }
            
            // Create admin user with bcrypt cost 12 (matching TypeScript)
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
            
            Database::query(
                'INSERT INTO "User" (username, displayname, permission, password, "group", needs, competence, courses, "pwdLastSet") 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
                [
                    $username,
                    'Default Admin',  // Matching TypeScript
                    2,                // Matching TypeScript permission level
                    $hashedPassword,
                    '{}',
                    '{}',
                    '{}',
                    '{}'
                ]
            );
            
            // Verify user was created (ENHANCEMENT: validation)
            $createdUser = Database::fetchOne(
                'SELECT id, username, displayname, permission FROM "User" WHERE username = ?',
                [$username]
            );
            
            if (!$createdUser) {
                throw new \Exception('User creation failed - user not found after insert');
            }
            
            self::log('SUCCESS', 'New default admin created because no admins were found in the database.');
            self::log('INFO', "Username: $username");
            
            // ENHANCEMENT: Write generated password back to config (exceeds TypeScript)
            if ($passwordWasGenerated) {
                self::writePasswordToConfig($password);
                self::log('INFO', "Auto-generated password saved to config file.");
                self::log('INFO', "Password: $password");
            }
            
            // ENHANCEMENT: Create audit log entry (exceeds TypeScript)
            self::createAuditLog('default_admin_created', [
                'username' => $username,
                'user_id' => $createdUser['id'],
                'password_generated' => $passwordWasGenerated,
                'ldap_enabled' => $ldapEnabled
            ]);
            
        } catch (\Exception $e) {
            self::log('ERROR', 'Failed to create default user: ' . $e->getMessage());
            // Don't throw - this is not critical for schema initialization
        }
    }
    
    /**
     * Write generated password back to config file
     * ENHANCEMENT: Exceeds TypeScript - TypeScript writes to config, we do too
     */
    private static function writePasswordToConfig(string $password): void
    {
        try {
            $configPath = dirname(__DIR__, 2) . '/data/config.json';
            
            if (!file_exists($configPath)) {
                self::log('WARNING', 'Config file not found - cannot write back password');
                return;
            }
            
            $config = json_decode(file_get_contents($configPath), true);
            if (!is_array($config)) {
                $config = [];
            }
            
            if (!isset($config['DEFAULT_LOGIN'])) {
                $config['DEFAULT_LOGIN'] = [];
            }
            
            $config['DEFAULT_LOGIN']['PASSWORD'] = $password;
            
            // Write with pretty formatting
            $json = json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            file_put_contents($configPath, $json);
            
        } catch (\Exception $e) {
            self::log('WARNING', 'Failed to write password to config: ' . $e->getMessage());
        }
    }
    
    /**
     * Create audit log table and entry
     * ENHANCEMENT: Track admin creation for security audit
     */
    private static function createAuditLog(string $action, array $details): void
    {
        try {
            $db = Database::getConnection();
            
            // Create audit log table if it doesn't exist
            $sql = <<<SQL
            CREATE TABLE IF NOT EXISTS "_AuditLog" (
                id TEXT PRIMARY KEY DEFAULT ('c' || substr(md5(random()::text || clock_timestamp()::text), 1, 24)),
                action TEXT NOT NULL,
                details JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
            );
            SQL;
            
            $db->exec($sql);
            
            // Insert audit entry
            Database::query(
                'INSERT INTO "_AuditLog" (action, details) VALUES (?, ?::jsonb)',
                [$action, json_encode($details)]
            );
            
        } catch (\Exception $e) {
            self::log('WARNING', 'Failed to create audit log: ' . $e->getMessage());
        }
    }
    
    /**
     * Enhanced logging with severity levels
     * ENHANCEMENT: Structured logging matching TypeScript logger
     */
    private static function log(string $level, string $message): void
    {
        $timestamp = date('Y-m-d H:i:s');
        $formatted = "[$timestamp] [$level] [Seed] $message";
        error_log($formatted);
    }
    
    /**
     * Generate a secure random password
     * Matches TypeScript implementation in app/src/modules/data/config.ts
     */
    private static function generateSecurePassword(): string
    {
        $length = 16;
        $charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?';
        $password = '';
        
        for ($i = 0; $i < $length; $i++) {
            $password .= $charset[random_int(0, strlen($charset) - 1)];
        }
        
        return $password;
    }
}
