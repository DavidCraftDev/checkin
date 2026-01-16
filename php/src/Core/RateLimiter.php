<?php

namespace CheckIn\Core;

class RateLimiter
{
    private static array $requests = [];
    private const MAX_REQUESTS = 100; // per window
    private const WINDOW_SIZE = 60; // seconds
    private const LOGIN_MAX_REQUESTS = 5;
    private const LOGIN_WINDOW = 300; // 5 minutes

    public static function check(string $identifier, int $maxRequests = self::MAX_REQUESTS, int $windowSize = self::WINDOW_SIZE): bool
    {
        $now = time();
        $key = md5($identifier);
        
        // Initialize if not exists
        if (!isset(self::$requests[$key])) {
            self::$requests[$key] = [];
        }
        
        // Remove old requests outside the window
        self::$requests[$key] = array_filter(
            self::$requests[$key],
            fn($timestamp) => ($now - $timestamp) < $windowSize
        );
        
        // Check if limit exceeded
        if (count(self::$requests[$key]) >= $maxRequests) {
            return false;
        }
        
        // Add current request
        self::$requests[$key][] = $now;
        
        return true;
    }

    public static function checkLogin(string $identifier): bool
    {
        return self::check('login_' . $identifier, self::LOGIN_MAX_REQUESTS, self::LOGIN_WINDOW);
    }

    public static function requireLimit(string $identifier, int $maxRequests = self::MAX_REQUESTS, int $windowSize = self::WINDOW_SIZE): void
    {
        if (!self::check($identifier, $maxRequests, $windowSize)) {
            Response::error('Rate limit exceeded. Please try again later.', 429);
        }
    }

    public static function getClientIdentifier(): string
    {
        // Use IP + User Agent for identification
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        
        return $ip . '|' . $userAgent;
    }
}
