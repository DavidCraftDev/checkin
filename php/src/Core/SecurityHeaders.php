<?php

namespace CheckIn\Core;

class SecurityHeaders
{
    public static function apply(): void
    {
        // Content Security Policy
        header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'");
        
        // X-Frame-Options (clickjacking protection)
        header("X-Frame-Options: DENY");
        
        // X-Content-Type-Options (MIME sniffing protection)
        header("X-Content-Type-Options: nosniff");
        
        // X-XSS-Protection (legacy XSS protection)
        header("X-XSS-Protection: 1; mode=block");
        
        // Referrer Policy
        header("Referrer-Policy: strict-origin-when-cross-origin");
        
        // Permissions Policy
        header("Permissions-Policy: geolocation=(), microphone=(), camera=(self)");
        
        // Strict-Transport-Security (HSTS) - only if HTTPS
        if (isset($_SERVER['HTTPS']) || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')) {
            header("Strict-Transport-Security: max-age=31536000; includeSubDomains");
        }
    }

    public static function sanitizeOutput(string $input): string
    {
        return htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    public static function sanitizeInput(string $input): string
    {
        // Remove null bytes
        $input = str_replace(chr(0), '', $input);
        
        // Trim whitespace
        $input = trim($input);
        
        return $input;
    }
}
