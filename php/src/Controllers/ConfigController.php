<?php

namespace CheckIn\Controllers;

use CheckIn\Core\Config;
use CheckIn\Core\Controller;

class ConfigController extends Controller
{
    public function getPublicConfig(): void
    {
        // Return only public config fields (not sensitive like passwords)
        $publicConfig = [
            'MAINTENANCE' => Config::get('MAINTENANCE'),
            'SCHOOL_NAME' => Config::get('SCHOOL_NAME'),
            'LDAP' => [
                'ENABLE' => Config::get('LDAP.ENABLE'),
                'PASSWORD_RESET_URL' => Config::get('LDAP.PASSWORD_RESET_URL')
            ]
        ];

        $this->json($publicConfig);
    }
}
