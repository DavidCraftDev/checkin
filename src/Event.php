<?php

require_once 'Database.php';

class Event {
    public static function getById($id) {
        $db = Database::getInstance();
        return $db->query("SELECT * FROM \"Events\" WHERE id = ?", [$id])->fetch();
    }

    public static function create($type, $userId) {
        $db = Database::getInstance();
        $id = uniqid();
        $date = new DateTime();
        $cw = (int)$date->format('W');

        $db->query("INSERT INTO \"Events\" (id, type, \"user\", cw) VALUES (?, ?, ?, ?)", [$id, $type, $userId, $cw]);
        return self::getById($id);
    }
}
