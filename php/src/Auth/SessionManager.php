<?php

namespace CheckIn\Auth;

use CheckIn\Core\Database;

class SessionManager
{
    private const SESSION_DURATION = 60 * 60 * 24 * 30; // 30 days

    public static function createSession(string $userId): string
    {
        $sessionId = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', time() + self::SESSION_DURATION);

        Database::query(
            'INSERT INTO "Session" (id, "userID", "expiresAt") VALUES (?, ?, ?)',
            [$sessionId, $userId, $expiresAt]
        );

        return $sessionId;
    }

    public static function validateSession(string $sessionId): ?array
    {
        $session = Database::fetchOne(
            'SELECT s.id, s."userID", s."expiresAt", u.* 
             FROM "Session" s 
             JOIN "User" u ON s."userID" = u.id 
             WHERE s.id = ? AND s."expiresAt" > NOW()',
            [$sessionId]
        );

        if (!$session) {
            return null;
        }

        // Extend session
        $newExpiresAt = date('Y-m-d H:i:s', time() + self::SESSION_DURATION);
        Database::query(
            'UPDATE "Session" SET "expiresAt" = ? WHERE id = ?',
            [$newExpiresAt, $sessionId]
        );

        return $session;
    }

    public static function deleteSession(string $sessionId): void
    {
        Database::query('DELETE FROM "Session" WHERE id = ?', [$sessionId]);
    }

    public static function getCurrentSession(): ?array
    {
        $sessionId = $_COOKIE['session'] ?? null;
        
        if (!$sessionId) {
            return null;
        }

        return self::validateSession($sessionId);
    }

    public static function setSessionCookie(string $sessionId, int $expiresAt): void
    {
        // Check for HTTPS via standard variable or X-Forwarded-Proto header (for proxies)
        $isSecure = isset($_SERVER['HTTPS']) || 
                    (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

        setcookie(
            'session',
            $sessionId,
            [
                'expires' => $expiresAt,
                'path' => '/',
                'httponly' => true,
                'samesite' => 'Lax',
                'secure' => $isSecure
            ]
        );
    }

    public static function deleteSessionCookie(): void
    {
        setcookie(
            'session',
            '',
            [
                'expires' => time() - 3600,
                'path' => '/',
                'httponly' => true
            ]
        );
    }
}
