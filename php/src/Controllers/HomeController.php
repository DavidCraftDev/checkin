<?php

namespace CheckIn\Controllers;

use CheckIn\Core\Response;
use CheckIn\Auth\SessionManager;

class HomeController
{
    public function index(): void
    {
        $session = SessionManager::getCurrentSession();
        
        if ($session) {
            Response::json([
                'message' => 'Redirect to /dashboard',
                'redirect' => '/dashboard'
            ]);
        } else {
            Response::json([
                'message' => 'Redirect to /login',
                'redirect' => '/login'
            ]);
        }
    }
}
