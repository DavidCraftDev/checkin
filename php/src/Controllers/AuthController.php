<?php

namespace CheckIn\Controllers;

use CheckIn\Core\Response;
use CheckIn\Auth\AuthManager;
use CheckIn\Auth\SessionManager;

class AuthController
{
    public function login(): void
    {
        // Start output buffering to catch any accidental output
        ob_start();
        
        $rawBody = file_get_contents('php://input');
        
        // Handle empty body
        if (empty($rawBody)) {
            ob_end_clean();
            Response::error('Request body is empty', 400);
            return;
        }
        
        $input = json_decode($rawBody, true);

        // Check for JSON parsing errors
        if (json_last_error() !== JSON_ERROR_NONE) {
            ob_end_clean();
            Response::error('Invalid JSON in request body: ' . json_last_error_msg(), 400);
            return;
        }

        // Validate input is an array
        if (!is_array($input)) {
            ob_end_clean();
            Response::error('Invalid request body format - expected JSON object', 400);
            return;
        }

        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';

        if (empty($username) || empty($password)) {
            ob_end_clean();
            Response::error('Username and password required', 400);
            return;
        }

        $user = AuthManager::authenticate($username, $password);

        if (!$user) {
            ob_end_clean();
            Response::error('Invalid credentials', 401);
            return;
        }

        $sessionId = SessionManager::createSession($user['id']);
        $expiresAt = time() + (60 * 60 * 24 * 30); // 30 days

        SessionManager::setSessionCookie($sessionId, $expiresAt);

        ob_end_clean();
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
