<?php

namespace CheckIn\Auth;

use CheckIn\Core\Database;
use CheckIn\Core\Config;
use CheckIn\Core\RateLimiter;

class AuthManager
{
    public static function authenticate(string $username, string $password): ?array
    {
        // Rate limiting for login attempts
        $identifier = RateLimiter::getClientIdentifier() . '_' . $username;
        if (!RateLimiter::checkLogin($identifier)) {
            error_log("Rate limit exceeded for user: $username");
            return null;
        }

        // Try LDAP authentication first if enabled
        $ldap = new LDAPAuth();
        if ($ldap->isEnabled()) {
            $user = $ldap->authenticate($username, $password);
            if ($user) {
                return $user;
            }
            // If LDAP is enabled but auth failed, don't try local auth
            return null;
        }

        // Try local authentication
        $user = Database::fetchOne(
            'SELECT * FROM "User" WHERE username = ?',
            [$username]
        );

        if ($user && self::verifyPassword($password, $user['password'])) {
            return $user;
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
