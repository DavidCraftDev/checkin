<?php

require_once 'Database.php';

class User {
    public static function getByUsername($username) {
        $db = Database::getInstance();
        $stmt = $db->query("SELECT * FROM \"User\" WHERE username = ?", [$username]);
        return $stmt->fetch();
    }

    public static function getById($id) {
        $db = Database::getInstance();
        $stmt = $db->query("SELECT * FROM \"User\" WHERE id = ?", [$id]);
        return $stmt->fetch();
    }
}
