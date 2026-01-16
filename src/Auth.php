<?php

require_once 'Database.php';
require_once 'User.php';

class Auth {
    public static function login($username, $password) {
        $user = User::getByUsername($username);

        if (!$user) {
            return false;
        }

        if ($user['password'] && password_verify($password, $user['password'])) {
            $token = self::generateSessionToken();
            self::createSession($token, $user['id']);
            setcookie('session_token', $token, [
                'expires' => time() + (30 * 24 * 60 * 60),
                'path' => '/',
                'secure' => isset($_SERVER['HTTPS']),
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
            return true;
        }

        return false;
    }

    public static function logout() {
        if (isset($_COOKIE['session_token'])) {
            self::deleteSession($_COOKIE['session_token']);
            setcookie('session_token', '', time() - 3600, '/');
        }
    }

    public static function getCurrentUser() {
        if (!isset($_COOKIE['session_token'])) {
            return null;
        }
        $token = $_COOKIE['session_token'];
        $session = self::getSession($token);

        if ($session && new DateTime($session['expiresAt']) > new DateTime()) {
            return User::getById($session['userID']);
        }
        return null;
    }

    private static function generateSessionToken() {
        return bin2hex(random_bytes(32));
    }

    private static function createSession($token, $userId) {
        $db = Database::getInstance();
        $expiresAt = date('Y-m-d H:i:s', time() + (30 * 24 * 60 * 60));
        $db->query("INSERT INTO \"Session\" (id, \"userID\", \"expiresAt\") VALUES (?, ?, ?)", [$token, $userId, $expiresAt]);
        return ['id' => $token, 'expiresAt' => $expiresAt];
    }

    private static function getSession($token) {
        $db = Database::getInstance();
        return $db->query("SELECT * FROM \"Session\" WHERE id = ?", [$token])->fetch();
    }

    private static function deleteSession($token) {
        $db = Database::getInstance();
        $db->query("DELETE FROM \"Session\" WHERE id = ?", [$token]);
    }
}
