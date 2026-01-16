<?php

namespace CheckIn\Auth;

use CheckIn\Core\Database;
use CheckIn\Core\Config;

class AuthManager
{
    public static function authenticate(string $username, string $password): ?array
    {
        // Try local authentication first
        $user = Database::fetchOne(
            'SELECT * FROM "User" WHERE username = ?',
            [$username]
        );

        if ($user && self::verifyPassword($password, $user['password'])) {
            return $user;
        }

        // TODO: Implement LDAP authentication if enabled
        if (Config::get('LDAP.ENABLE')) {
            // LDAP authentication would go here
        }

        return null;
    }

    public static function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    public static function hashPassword(string $password): string
    {
        return password_hash($password, PASSWORD_BCRYPT);
    }

    public static function requireAuth(int $minPermission = 0): array
    {
        $session = SessionManager::getCurrentSession();
        
        if (!$session) {
            \CheckIn\Core\Response::error('Unauthorized', 401);
        }

        if ($session['permission'] < $minPermission) {
            \CheckIn\Core\Response::error('Forbidden', 403);
        }

        return $session;
    }
}
