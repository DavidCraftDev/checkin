<?php

namespace CheckIn\Core;

class CSRFProtection
{
    private const TOKEN_LENGTH = 32;
    private const TOKEN_LIFETIME = 3600; // 1 hour

    public static function generateToken(): string
    {
        $token = bin2hex(random_bytes(self::TOKEN_LENGTH));
        
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $_SESSION['csrf_token'] = $token;
        $_SESSION['csrf_token_time'] = time();
        
        return $token;
    }

    public static function getToken(): ?string
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Check if token exists and is not expired
        if (isset($_SESSION['csrf_token'], $_SESSION['csrf_token_time'])) {
            if (time() - $_SESSION['csrf_token_time'] < self::TOKEN_LIFETIME) {
                return $_SESSION['csrf_token'];
            }
            // Token expired, generate new one
            return self::generateToken();
        }
        
        return self::generateToken();
    }

    public static function validateToken(string $token): bool
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['csrf_token'], $_SESSION['csrf_token_time'])) {
            return false;
        }
        
        // Check expiration
        if (time() - $_SESSION['csrf_token_time'] >= self::TOKEN_LIFETIME) {
            return false;
        }
        
        // Timing-safe comparison
        return hash_equals($_SESSION['csrf_token'], $token);
    }

    public static function requireToken(): void
    {
        $token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
        
        if (!$token || !self::validateToken($token)) {
            Response::error('CSRF token validation failed', 403);
        }
    }
}
