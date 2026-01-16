<?php

namespace CheckIn\Auth;

use CheckIn\Core\Config;
use CheckIn\Core\Database;

class LDAPAuth
{
    private $connection;
    private bool $isEnabled;

    public function __construct()
    {
        $this->isEnabled = Config::get('LDAP.ENABLE', false);
    }

    public function isEnabled(): bool
    {
        return $this->isEnabled;
    }

    public function authenticate(string $username, string $password): ?array
    {
        if (!$this->isEnabled) {
            return null;
        }

        try {
            $ldapUri = Config::get('LDAP.URI');
            $this->connection = ldap_connect($ldapUri);

            if (!$this->connection) {
                error_log('LDAP: Failed to connect to ' . $ldapUri);
                return null;
            }

            // Set LDAP options
            ldap_set_option($this->connection, LDAP_OPT_PROTOCOL_VERSION, 3);
            ldap_set_option($this->connection, LDAP_OPT_REFERRALS, 0);

            if (!Config::get('LDAP.TLS_REJECT_UNAUTHORIZED', false)) {
                ldap_set_option($this->connection, LDAP_OPT_X_TLS_REQUIRE_CERT, LDAP_OPT_X_TLS_NEVER);
            }

            // Bind with readonly credentials
            $bindDN = Config::get('LDAP.BIND_CREDENTIALS.DN');
            $bindPassword = Config::get('LDAP.BIND_CREDENTIALS.PASSWORD');

            if (!@ldap_bind($this->connection, $bindDN, $bindPassword)) {
                error_log('LDAP: Bind failed - ' . ldap_error($this->connection));
                return null;
            }

            // Search for user
            $searchBase = Config::get('LDAP.SEARCH_BASE');
            $searchFilter = str_replace('{username}', ldap_escape($username, '', LDAP_ESCAPE_FILTER), 
                                       Config::get('LDAP.USER_SEARCH_FILTER', '(uid={username})'));

            $searchResult = @ldap_search($this->connection, $searchBase, $searchFilter);
            if (!$searchResult) {
                error_log('LDAP: Search failed - ' . ldap_error($this->connection));
                return null;
            }

            $entries = ldap_get_entries($this->connection, $searchResult);
            if ($entries['count'] === 0) {
                return null; // User not found
            }

            $userEntry = $entries[0];
            $userDN = $userEntry['dn'];

            // Try to bind as the user (authenticate)
            if (!@ldap_bind($this->connection, $userDN, $password)) {
                return null; // Invalid password
            }

            // Authentication successful, get or create user
            return $this->syncUser($username, $userEntry);

        } catch (\Exception $e) {
            error_log('LDAP Error: ' . $e->getMessage());
            return null;
        } finally {
            if ($this->connection) {
                @ldap_unbind($this->connection);
            }
        }
    }

    private function syncUser(string $username, array $ldapEntry): ?array
    {
        // Extract user data from LDAP
        $displayName = $ldapEntry['displayname'][0] ?? $ldapEntry['cn'][0] ?? $username;
        $email = $ldapEntry['mail'][0] ?? '';

        // Check if user exists
        $user = Database::fetchOne(
            'SELECT * FROM "User" WHERE username = ?',
            [$username]
        );

        if ($user) {
            // Update existing user
            Database::query(
                'UPDATE "User" SET displayname = ?, "pwdLastSet" = NOW() WHERE username = ?',
                [$displayName, $username]
            );
            
            // Fetch updated user
            $user = Database::fetchOne(
                'SELECT * FROM "User" WHERE username = ?',
                [$username]
            );
        } else {
            // Create new user
            $userId = $this->generateId();
            $permission = $this->detectPermission($ldapEntry);
            $groups = $this->detectGroups($ldapEntry);

            Database::query(
                'INSERT INTO "User" (id, username, displayname, permission, "group", needs, competence, courses, "pwdLastSet") 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
                [$userId, $username, $displayName, $permission, json_encode($groups), '[]', '[]', '[]']
            );

            $user = Database::fetchOne(
                'SELECT * FROM "User" WHERE id = ?',
                [$userId]
            );
        }

        return $user;
    }

    private function detectPermission(array $ldapEntry): int
    {
        if (!Config::get('LDAP.AUTOMATIC_DATA_DETECTION.PERMISSION.ENABLE', false)) {
            return 0; // Default to student
        }

        $memberOf = $ldapEntry['memberof'] ?? [];
        if (!is_array($memberOf)) {
            $memberOf = [$memberOf];
        }

        $adminGroup = Config::get('LDAP.AUTOMATIC_DATA_DETECTION.PERMISSION.ADMIN_GROUP');
        $teacherGroup = Config::get('LDAP.AUTOMATIC_DATA_DETECTION.PERMISSION.TEACHER_GROUP');

        foreach ($memberOf as $group) {
            if (stripos($group, $adminGroup) !== false) {
                return 2; // Admin
            }
            if (stripos($group, $teacherGroup) !== false) {
                return 1; // Teacher
            }
        }

        return 0; // Student
    }

    private function detectGroups(array $ldapEntry): array
    {
        if (!Config::get('LDAP.AUTOMATIC_DATA_DETECTION.GROUPS.ENABLE', false)) {
            return [];
        }

        $memberOf = $ldapEntry['memberof'] ?? [];
        if (!is_array($memberOf)) {
            $memberOf = [$memberOf];
        }

        $groupOU = Config::get('LDAP.AUTOMATIC_DATA_DETECTION.GROUPS.GROUP_OU');
        $groups = [];

        foreach ($memberOf as $dn) {
            if (stripos($dn, $groupOU) !== false) {
                // Extract CN from DN
                if (preg_match('/CN=([^,]+)/i', $dn, $matches)) {
                    $groups[] = $matches[1];
                }
            }
        }

        return $groups;
    }

    private function generateId(): string
    {
        return 'c' . bin2hex(random_bytes(12));
    }
}
