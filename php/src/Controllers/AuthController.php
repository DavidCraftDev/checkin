<?php

namespace CheckIn\Controllers;

use CheckIn\Core\Response;
use CheckIn\Auth\AuthManager;
use CheckIn\Auth\SessionManager;

class AuthController
{
    public function login(): void
    {
        $rawBody = file_get_contents('php://input');
        $input = json_decode($rawBody, true);

        if ($input === null && json_last_error() !== JSON_ERROR_NONE) {
            Response::error('Invalid JSON in request body: ' . json_last_error_msg(), 400);
        }

        if (!is_array($input)) {
            Response::error('Invalid request body format', 400);
        }

        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';

        if (empty($username) || empty($password)) {
            Response::error('Username and password required', 400);
        }

        $user = AuthManager::authenticate($username, $password);

        if (!$user) {
            Response::error('Invalid credentials', 401);
        }

        $sessionId = SessionManager::createSession($user['id']);
        $expiresAt = time() + (60 * 60 * 24 * 30); // 30 days

        SessionManager::setSessionCookie($sessionId, $expiresAt);

        Response::json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'displayname' => $user['displayname'],
                'permission' => $user['permission']
            ]
        ]);
    }

    public function logout(): void
    {
        $sessionId = $_COOKIE['session'] ?? null;
        
        if ($sessionId) {
            SessionManager::deleteSession($sessionId);
            SessionManager::deleteSessionCookie();
        }

        Response::json(['message' => 'Logout successful']);
    }
}
