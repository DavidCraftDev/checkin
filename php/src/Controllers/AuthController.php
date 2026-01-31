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
        
        // Log for debugging (remove in production)
        error_log("Login attempt - Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'not set'));
        error_log("Login attempt - Body: " . substr($rawBody, 0, 200));
        
        // Handle empty body
        if (empty($rawBody)) {
            Response::error('Request body is empty', 400);
        }
        
        $input = json_decode($rawBody, true);

        // Check for JSON parsing errors
        if (json_last_error() !== JSON_ERROR_NONE) {
            Response::error('Invalid JSON in request body: ' . json_last_error_msg(), 400);
        }

        // Validate input is an array
        if (!is_array($input)) {
            Response::error('Invalid request body format - expected JSON object', 400);
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
