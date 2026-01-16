<?php

require_once 'Database.php';
require_once 'Event.php';
require_once 'User.php';

class Attendance {
    public static function getPerUser($userId, $cw, $year) {
        $db = Database::getInstance();
        $startDate = "$year-01-01";
        $endDate = "$year-12-31";

        $sql = "SELECT * FROM \"Attendances\" WHERE \"userID\" = ? AND cw = ? AND created_at >= ? AND created_at <= ?";
        $attendances = $db->query($sql, [$userId, $cw, $startDate, $endDate])->fetchAll();

        $result = [];
        foreach ($attendances as $attendance) {
            $event = null;
            $eventUser = null;

            if ($attendance['eventID'] === 'NOTE') {
                $event = [
                    'id' => 'NOTE',
                    'type' => 'Notiz',
                    'user' => $userId,
                    'cw' => $cw,
                    'created_at' => $attendance['created_at']
                ];
                $eventUser = User::getById($userId);
            } else {
                $event = Event::getById($attendance['eventID']);
                if ($event) {
                    $eventUser = User::getById($event['user']);
                }
            }

            if ($event) {
                $result[] = [
                    'attendance' => $attendance,
                    'event' => $event,
                    'eventUser' => $eventUser
                ];
            }
        }

        usort($result, function($a, $b) {
            return strtotime($b['attendance']['created_at']) - strtotime($a['attendance']['created_at']);
        });

        return $result;
    }

    public static function exists($eventId, $userId) {
        $db = Database::getInstance();
        $stmt = $db->query("SELECT COUNT(*) FROM \"Attendances\" WHERE \"eventID\" = ? AND \"userID\" = ?", [$eventId, $userId]);
        return $stmt->fetchColumn() > 0;
    }

    public static function create($eventId, $userId) {
        $db = Database::getInstance();

        // Verify event exists
        if (!Event::getById($eventId)) {
            throw new Exception("Event not found");
        }

        $id = uniqid();
        $cw = (int)date('W');

        $db->query("INSERT INTO \"Attendances\" (id, \"userID\", \"eventID\", cw) VALUES (?, ?, ?, ?)", [$id, $userId, $eventId, $cw]);

        return $id;
    }
}
