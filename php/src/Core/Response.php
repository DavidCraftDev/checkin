<?php

namespace CheckIn\Core;

class Response
{
    public static function json(mixed $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json');
        $json = json_encode($data);
        if ($json === false) {
            // Fallback to plain text if JSON encoding fails
            http_response_code(500);
            header('Content-Type: text/plain; charset=utf-8');
            echo 'JSON encoding failed: ' . json_last_error_msg();
        } else {
            echo $json;
        }
        exit;
    }

    public static function text(string $text, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: text/plain');
        echo $text;
        exit;
    }

    public static function error(string $message, int $status = 500): void
    {
        self::json(['error' => $message], $status);
    }
}
