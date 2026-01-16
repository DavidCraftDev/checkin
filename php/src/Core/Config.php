<?php

namespace CheckIn\Core;

class Config
{
    private static array $config = [];
    private static string $configPath;

    public static function init(): void
    {
        self::$configPath = dirname(__DIR__, 2) . '/data/config.json';
        self::load();
    }

    private static function load(): void
    {
        $defaultConfig = [
            'MAINTENANCE' => false,
            'SCHOOL_NAME' => '',
            'DEFAULT_LOGIN' => [
                'USERNAME' => 'admin',
                'PASSWORD' => self::generateSecurePassword()
            ],
            'LDAP' => [
                'ENABLE' => false,
                'URI' => '',
                'TLS_REJECT_UNAUTHORIZED' => false,
                'BIND_CREDENTIALS' => [
                    'DN' => '',
                    'PASSWORD' => ''
                ],
                'SEARCH_BASE' => '',
                'USER_SEARCH_FILTER' => '',
                'PASSWORD_RESET_URL' => ''
            ]
        ];

        // Load from file if exists
        if (file_exists(self::$configPath)) {
            $loadedConfig = json_decode(file_get_contents(self::$configPath), true);
            self::$config = array_replace_recursive($defaultConfig, $loadedConfig);
        } else {
            self::$config = $defaultConfig;
            self::save();
        }

        // Apply environment variable overrides
        self::applyEnvOverrides();
    }

    private static function applyEnvOverrides(): void
    {
        if (getenv('MAINTENANCE') !== false) {
            self::$config['MAINTENANCE'] = getenv('MAINTENANCE') === 'true';
        }
        if (getenv('SCHOOL_NAME') !== false) {
            self::$config['SCHOOL_NAME'] = getenv('SCHOOL_NAME');
        }
        if (getenv('DEFAULT_LOGIN_USERNAME') !== false) {
            self::$config['DEFAULT_LOGIN']['USERNAME'] = getenv('DEFAULT_LOGIN_USERNAME');
        }
        if (getenv('DEFAULT_LOGIN_PASSWORD') !== false) {
            self::$config['DEFAULT_LOGIN']['PASSWORD'] = getenv('DEFAULT_LOGIN_PASSWORD');
        }
    }

    private static function save(): void
    {
        $dir = dirname(self::$configPath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        file_put_contents(self::$configPath, json_encode(self::$config, JSON_PRETTY_PRINT));
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        $keys = explode('.', $key);
        $value = self::$config;

        foreach ($keys as $k) {
            if (!isset($value[$k])) {
                return $default;
            }
            $value = $value[$k];
        }

        return $value;
    }

    private static function generateSecurePassword(): string
    {
        $length = 16;
        $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        $password = '';
        for ($i = 0; $i < $length; $i++) {
            $password .= $chars[random_int(0, strlen($chars) - 1)];
        }
        return $password;
    }
}
