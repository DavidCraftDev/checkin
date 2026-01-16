<?php

class Config {
    private static $instance = null;
    private $data = [];
    private $configFilePath;

    private function __construct() {
        $this->configFilePath = __DIR__ . '/../data/config.json';
        $this->data = $this->getDefaultConfig();
        $this->loadConfig();
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Config();
        }
        return self::$instance;
    }

    public function get($key = null) {
        if ($key === null) {
            return $this->data;
        }
        $keys = explode('.', $key);
        $value = $this->data;
        foreach ($keys as $k) {
            if (isset($value[$k])) {
                $value = $value[$k];
            } else {
                return null;
            }
        }
        return $value;
    }

    private function getDefaultConfig() {
        return [
            'MAINTENANCE' => false,
            'SCHOOL_NAME' => "",
            'DEFAULT_LOGIN' => [
                'USERNAME' => "Own.Username",
                'PASSWORD' => "",
            ],
            'LDAP' => [
                'ENABLE' => false,
                'URI' => "",
                'TLS_REJECT_UNAUTHORIZED' => false,
                'BIND_CREADENTIALS' => [
                    'DN' => "",
                    'PASSWORD' => "",
                ],
                'SEARCH_BASE' => "",
                'USER_SEARCH_FILTER' => "",
                'PASSWORD_RESET_URL' => "",
                'AUTOMATIC_DATA_DETECTION' => [
                    'PERMISSION' => [
                        'ENABLE' => false,
                        'TEACHER_GROUP' => "",
                        'ADMIN_GROUP' => "",
                    ],
                    'GROUPS' => [
                        'ENABLE' => false,
                        'GROUP_OU' => "",
                    ],
                    'STUDYTIME_DATA' => [
                        'ENABLE' => false,
                        'STUDYTIME_OU' => "",
                    ],
                ],
            ],
            'UNTIS' => [
                'ENABLE' => false,
                'SCHOOL' => "",
                'USERNAME' => "",
                'PASSWORD' => "",
                'BASE_URL' => "",
                'CLASS_IDS' => []
            ],
            'MODULES' => [
                'SPONSORENLAUF' => false,
            ]
        ];
    }

    private function loadConfig() {
        if (file_exists($this->configFilePath)) {
            $json = file_get_contents($this->configFilePath);
            $loadedConfig = json_decode($json, true);
            if ($loadedConfig) {
                $this->data = array_replace_recursive($this->data, $loadedConfig);
            }
        }

        if (empty($this->data['DEFAULT_LOGIN']['PASSWORD'])) {
            $this->data['DEFAULT_LOGIN']['PASSWORD'] = $this->generateRandomSecurePassword();
        }

        $this->applyEnvOverrides();
        $this->writeConfig();
    }

    private function generateRandomSecurePassword($length = 16) {
        return bin2hex(random_bytes($length / 2));
    }

    private function writeConfig() {
        $dir = dirname($this->configFilePath);
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
        file_put_contents($this->configFilePath, json_encode($this->data, JSON_PRETTY_PRINT));
    }

    private function applyEnvOverrides() {
        if (getenv('MAINTENANCE')) $this->data['MAINTENANCE'] = getenv('MAINTENANCE') === 'true';
        if (getenv('SCHOOL_NAME')) $this->data['SCHOOL_NAME'] = getenv('SCHOOL_NAME');
        if (getenv('DEFAULT_LOGIN_USERNAME')) $this->data['DEFAULT_LOGIN']['USERNAME'] = getenv('DEFAULT_LOGIN_USERNAME');
        if (getenv('DEFAULT_LOGIN_PASSWORD')) $this->data['DEFAULT_LOGIN']['PASSWORD'] = getenv('DEFAULT_LOGIN_PASSWORD');
        if (getenv('USE_LDAP')) $this->data['LDAP']['ENABLE'] = getenv('USE_LDAP') === 'true';
        if (getenv('LDAP_URI')) $this->data['LDAP']['URI'] = getenv('LDAP_URI');
    }
}
