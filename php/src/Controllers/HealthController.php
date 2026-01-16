<?php

namespace CheckIn\Controllers;

use CheckIn\Core\Response;
use CheckIn\Core\Database;
use CheckIn\Core\Config;

class HealthController
{
    public function check(): void
    {
        $dbConnected = Database::isConnected();
        $status = $dbConnected ? 'ok' : 'error';
        
        // Read version from package.json
        $packageJsonPath = dirname(__DIR__, 3) . '/package.json';
        $version = '1.0.0';
        
        if (file_exists($packageJsonPath)) {
            $packageData = json_decode(file_get_contents($packageJsonPath), true);
            $version = $packageData['version'] ?? '1.0.0';
        }

        $data = [
            'data' => [
                'version' => $version . '-php',
                'maintenance' => Config::get('MAINTENANCE', false),
                'status' => $status,
                'databaseConnected' => $dbConnected
            ]
        ];

        // Use standard HTTP status codes: 200 for healthy, 503 for unhealthy
        $httpStatus = $dbConnected ? 200 : 503;
        Response::json($data, $httpStatus);
    }
}
