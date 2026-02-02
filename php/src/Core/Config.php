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
                'USERNAME' => 'Own.Username',  // Match TypeScript default
                'PASSWORD' => self::generateSecurePassword()
            ],
            'LDAP' => [
                'ENABLE' => false,
                'URI' => '',
                'TLS_REJECT_UNAUTHORIZED' => false,
                'BIND_CREADENTIALS' => [  // Note: Typo matches TypeScript exactly!
                    'DN' => '',
                    'PASSWORD' => ''
                ],
                'SEARCH_BASE' => '',
                'USER_SEARCH_FILTER' => '',
                'PASSWORD_RESET_URL' => '',
                'AUTOMATIC_DATA_DETECTION' => [
                    'PERMISSION' => [
                        'ENABLE' => false,
                        'TEACHER_GROUP' => '',
                        'ADMIN_GROUP' => ''
                    ],
                    'GROUPS' => [
                        'ENABLE' => false,
                        'GROUP_OU' => ''
                    ],
                    'STUDYTIME_DATA' => [
                        'ENABLE' => false,
                        'STUDYTIME_OU' => ''
                    ]
                ]
            ],
            'UNTIS' => [
                'ENABLE' => false,
                'SCHOOL' => '',
                'USERNAME' => '',
                'PASSWORD' => '',
                'BASE_URL' => '',
                'CLASS_IDS' => []
            ],
            'MODULES' => [
                'SPONSORENLAUF' => false
            ]
        ];

        // Load from file if exists
        if (file_exists(self::$configPath)) {
            $fileContents = file_get_contents(self::$configPath);
            $loadedConfig = [];

            if ($fileContents !== false && $fileContents !== '') {
                $decodedConfig = json_decode($fileContents, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decodedConfig)) {
                    $loadedConfig = $decodedConfig;
                } else {
                    error_log('Failed to parse config file: ' . json_last_error_msg());
                }
            }
            
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
        // Application settings
        if (getenv('MAINTENANCE') !== false) {
            self::$config['MAINTENANCE'] = getenv('MAINTENANCE') === 'true';
        }
        if (getenv('SCHOOL_NAME') !== false) {
            self::$config['SCHOOL_NAME'] = getenv('SCHOOL_NAME');
        }
        
        // Default login credentials
        if (getenv('DEFAULT_LOGIN_USERNAME') !== false) {
            self::$config['DEFAULT_LOGIN']['USERNAME'] = getenv('DEFAULT_LOGIN_USERNAME');
        }
        if (getenv('DEFAULT_LOGIN_PASSWORD') !== false) {
            self::$config['DEFAULT_LOGIN']['PASSWORD'] = getenv('DEFAULT_LOGIN_PASSWORD');
        }
        
        // LDAP configuration
        // Support both USE_LDAP (TypeScript) and LDAP_ENABLE (alternative)
        if (getenv('USE_LDAP') !== false) {
            self::$config['LDAP']['ENABLE'] = getenv('USE_LDAP') === 'true';
        }
        if (getenv('LDAP_ENABLE') !== false) {
            self::$config['LDAP']['ENABLE'] = getenv('LDAP_ENABLE') === 'true';
        }
        if (getenv('LDAP_URI') !== false) {
            self::$config['LDAP']['URI'] = getenv('LDAP_URI');
        }
        if (getenv('LDAP_TLS_REJECT_UNAUTHORIZED') !== false) {
            self::$config['LDAP']['TLS_REJECT_UNAUTHORIZED'] = getenv('LDAP_TLS_REJECT_UNAUTHORIZED') === 'true';
        }
        // Note: BIND_CREADENTIALS matches TypeScript typo exactly
        if (getenv('LDAP_BIND_DN') !== false) {
            self::$config['LDAP']['BIND_CREADENTIALS']['DN'] = getenv('LDAP_BIND_DN');
        }
        if (getenv('LDAP_BIND_PASSWORD') !== false) {
            self::$config['LDAP']['BIND_CREADENTIALS']['PASSWORD'] = getenv('LDAP_BIND_PASSWORD');
        }
        if (getenv('LDAP_SEARCH_BASE') !== false) {
            self::$config['LDAP']['SEARCH_BASE'] = getenv('LDAP_SEARCH_BASE');
        }
        if (getenv('LDAP_USER_SEARCH_FILTER') !== false) {
            self::$config['LDAP']['USER_SEARCH_FILTER'] = getenv('LDAP_USER_SEARCH_FILTER');
        }
        if (getenv('LDAP_PASSWORD_RESET_URL') !== false) {
            self::$config['LDAP']['PASSWORD_RESET_URL'] = getenv('LDAP_PASSWORD_RESET_URL');
        }
        
        // LDAP Automatic Data Detection - Permission
        if (getenv('LDAP_AUTO_PERMISSION') !== false) {
            self::$config['LDAP']['AUTOMATIC_DATA_DETECTION']['PERMISSION']['ENABLE'] = getenv('LDAP_AUTO_PERMISSION') === 'true';
        }
        if (getenv('LDAP_AUTO_PERMISSION_TEACHER_GROUP') !== false) {
            self::$config['LDAP']['AUTOMATIC_DATA_DETECTION']['PERMISSION']['TEACHER_GROUP'] = getenv('LDAP_AUTO_PERMISSION_TEACHER_GROUP');
        }
        if (getenv('LDAP_AUTO_PERMISSION_ADMIN_GROUP') !== false) {
            self::$config['LDAP']['AUTOMATIC_DATA_DETECTION']['PERMISSION']['ADMIN_GROUP'] = getenv('LDAP_AUTO_PERMISSION_ADMIN_GROUP');
        }
        
        // LDAP Automatic Data Detection - Groups
        if (getenv('LDAP_AUTO_GROUPS_DETECTION') !== false) {
            self::$config['LDAP']['AUTOMATIC_DATA_DETECTION']['GROUPS']['ENABLE'] = getenv('LDAP_AUTO_GROUPS_DETECTION') === 'true';
        }
        if (getenv('LDAP_AUTO_GROUPS_OU') !== false) {
            self::$config['LDAP']['AUTOMATIC_DATA_DETECTION']['GROUPS']['GROUP_OU'] = getenv('LDAP_AUTO_GROUPS_OU');
        }
        
        // LDAP Automatic Data Detection - Study Time Data
        if (getenv('LDAP_AUTO_STUDYTIME_DATA') !== false) {
            self::$config['LDAP']['AUTOMATIC_DATA_DETECTION']['STUDYTIME_DATA']['ENABLE'] = getenv('LDAP_AUTO_STUDYTIME_DATA') === 'true';
        }
        if (getenv('LDAP_AUTO_STUDYTIME_DATA_OU') !== false) {
            self::$config['LDAP']['AUTOMATIC_DATA_DETECTION']['STUDYTIME_DATA']['STUDYTIME_OU'] = getenv('LDAP_AUTO_STUDYTIME_DATA_OU');
        }
        
        // UNTIS configuration
        if (getenv('UNTIS_ENABLE') !== false) {
            self::$config['UNTIS']['ENABLE'] = getenv('UNTIS_ENABLE') === 'true';
        }
        if (getenv('UNTIS_SCHOOL') !== false) {
            self::$config['UNTIS']['SCHOOL'] = getenv('UNTIS_SCHOOL');
        }
        if (getenv('UNTIS_USERNAME') !== false) {
            self::$config['UNTIS']['USERNAME'] = getenv('UNTIS_USERNAME');
        }
        if (getenv('UNTIS_PASSWORD') !== false) {
            self::$config['UNTIS']['PASSWORD'] = getenv('UNTIS_PASSWORD');
        }
        if (getenv('UNTIS_BASE_URL') !== false) {
            self::$config['UNTIS']['BASE_URL'] = getenv('UNTIS_BASE_URL');
        }
        
        // MODULES configuration
        if (getenv('MODULE_SPONSORENLAUF') !== false) {
            self::$config['MODULES']['SPONSORENLAUF'] = getenv('MODULE_SPONSORENLAUF') === 'true';
        }
    }

    private static function save(): void
    {
        $dir = dirname(self::$configPath);
        if (!is_dir($dir)) {
            if (!mkdir($dir, 0755, true)) {
                error_log("Failed to create config directory: {$dir}");
                return;
            }
        }
        $json = json_encode(self::$config, JSON_PRETTY_PRINT);
        if ($json === false) {
            error_log("Failed to encode config to JSON: " . json_last_error_msg());
            return;
        }
        if (file_put_contents(self::$configPath, $json) === false) {
            error_log("Failed to write config file: " . self::$configPath);
        }
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
