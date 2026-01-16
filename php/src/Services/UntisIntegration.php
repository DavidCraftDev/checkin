<?php

namespace CheckIn\Services;

use CheckIn\Core\Config;
use CheckIn\Core\Database;

class UntisIntegration
{
    private string $server;
    private string $school;
    private string $username;
    private string $password;
    private ?string $sessionId = null;

    public function __construct()
    {
        $this->server = Config::get('UNTIS.SERVER', '');
        $this->school = Config::get('UNTIS.SCHOOL', '');
        $this->username = Config::get('UNTIS.USERNAME', '');
        $this->password = Config::get('UNTIS.PASSWORD', '');
    }

    public function isConfigured(): bool
    {
        return !empty($this->server) && !empty($this->school) && 
               !empty($this->username) && !empty($this->password);
    }

    public function authenticate(): bool
    {
        if (!$this->isConfigured()) {
            return false;
        }

        try {
            $response = $this->apiCall('authenticate', [
                'user' => $this->username,
                'password' => $this->password,
                'client' => 'CheckIN-PHP'
            ]);

            if (isset($response['result']['sessionId'])) {
                $this->sessionId = $response['result']['sessionId'];
                return true;
            }
        } catch (\Exception $e) {
            error_log('Untis authentication failed: ' . $e->getMessage());
        }

        return false;
    }

    public function syncTimetable(int $startDate, int $endDate): array
    {
        if (!$this->sessionId && !$this->authenticate()) {
            return ['error' => 'Authentication failed'];
        }

        try {
            $response = $this->apiCall('getTimetable', [
                'id' => 0,
                'type' => 1,
                'startDate' => $startDate,
                'endDate' => $endDate
            ]);

            return $response['result'] ?? [];
        } catch (\Exception $e) {
            error_log('Untis timetable sync failed: ' . $e->getMessage());
            return ['error' => $e->getMessage()];
        }
    }

    public function syncClasses(): array
    {
        if (!$this->sessionId && !$this->authenticate()) {
            return [];
        }

        try {
            $response = $this->apiCall('getKlassen');
            return $response['result'] ?? [];
        } catch (\Exception $e) {
            error_log('Untis class sync failed: ' . $e->getMessage());
            return [];
        }
    }

    private function apiCall(string $method, array $params = []): array
    {
        $url = "https://{$this->server}/WebUntis/jsonrpc.do?school={$this->school}";
        
        $payload = [
            'id' => uniqid(),
            'method' => $method,
            'params' => $params,
            'jsonrpc' => '2.0'
        ];

        $options = [
            'http' => [
                'header' => "Content-type: application/json\r\n",
                'method' => 'POST',
                'content' => json_encode($payload),
                'timeout' => 30
            ]
        ];

        if ($this->sessionId) {
            $options['http']['header'] .= "Cookie: JSESSIONID={$this->sessionId}\r\n";
        }

        $context = stream_context_create($options);
        $result = file_get_contents($url, false, $context);

        if ($result === false) {
            throw new \Exception('Untis API request failed');
        }

        return json_decode($result, true);
    }

    public function logout(): bool
    {
        if (!$this->sessionId) {
            return true;
        }

        try {
            $this->apiCall('logout');
            $this->sessionId = null;
            return true;
        } catch (\Exception $e) {
            error_log('Untis logout failed: ' . $e->getMessage());
            return false;
        }
    }
}
