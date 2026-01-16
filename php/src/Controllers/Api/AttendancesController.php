<?php

namespace App\Controllers\Api;

use App\Core\Database;
use App\Core\Response;
use App\Auth\SessionManager;

class AttendancesController
{
    public static function list()
    {
        $user = SessionManager::getUser();
        if (!$user) {
            Response::error('Unauthorized', 401);
        }

        // Get query parameters
        $cw = $_GET['cw'] ?? null;
        $year = $_GET['year'] ?? date('Y');

        $sql = 'SELECT * FROM "Attendances" WHERE "userID" = $1';
        $params = [$user['id']];

        if ($cw) {
            $sql .= ' AND cw = $2';
            $params[] = $cw;
        }

        $sql .= ' ORDER BY created_at DESC';

        $stmt = Database::query($sql, $params);
        $attendances = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        Response::json([
            'attendances' => $attendances,
            'count' => count($attendances)
        ]);
    }

    public static function create()
    {
        $user = SessionManager::getUser();
        if (!$user) {
            Response::error('Unauthorized', 401);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($input)) {
            Response::error('Invalid JSON in request body', 400);
        }

        $eventID = $input['eventID'] ?? null;
        $cw = $input['cw'] ?? (int)date('W');
        $teacherNote = $input['teacherNote'] ?? null;
        $studentNote = $input['studentNote'] ?? null;
        $type = $input['type'] ?? null;
        $feedback = $input['feedback'] ?? 'GREEN';
        $selfReflection = $input['selfReflection'] ?? null;
        $attended = $input['attended'] ?? true;

        if (!$eventID) {
            Response::error('Event ID is required', 400);
        }

        // Validate feedback enum
        if (!in_array($feedback, ['GREEN', 'YELLOW', 'RED'])) {
            $feedback = 'GREEN';
        }

        // Generate CUID-like ID
        $id = bin2hex(random_bytes(12));

        $stmt = Database::query(
            'INSERT INTO "Attendances" (id, "userID", "eventID", cw, "teacherNote", "studentNote", type, feedback, "selfReflection", attended, created_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) 
             RETURNING *',
            [$id, $user['id'], $eventID, $cw, $teacherNote, $studentNote, $type, $feedback, $selfReflection, $attended ? 'true' : 'false']
        );

        $attendance = $stmt->fetch(\PDO::FETCH_ASSOC);
        Response::json($attendance, 201);
    }

    public static function get($id)
    {
        $user = SessionManager::getUser();
        if (!$user) {
            Response::error('Unauthorized', 401);
        }

        $stmt = Database::query(
            'SELECT * FROM "Attendances" WHERE id = $1 AND "userID" = $2',
            [$id, $user['id']]
        );

        $attendance = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$attendance) {
            Response::error('Attendance not found', 404);
        }

        Response::json($attendance);
    }

    public static function update($id)
    {
        $user = SessionManager::getUser();
        if (!$user) {
            Response::error('Unauthorized', 401);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($input)) {
            Response::error('Invalid JSON in request body', 400);
        }

        // Check if user owns this attendance or has permission
        $stmt = Database::query(
            'SELECT * FROM "Attendances" WHERE id = $1',
            [$id]
        );

        $attendance = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$attendance) {
            Response::error('Attendance not found', 404);
        }

        if ($attendance['userID'] !== $user['id'] && $user['permission'] < 1) {
            Response::error('Permission denied', 403);
        }

        // Build update query dynamically
        $updates = [];
        $params = [];
        $paramIndex = 1;

        $allowedFields = ['teacherNote', 'studentNote', 'type', 'feedback', 'selfReflection', 'attended'];
        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $updates[] = "\"$field\" = $$paramIndex";
                $params[] = $input[$field];
                $paramIndex++;
            }
        }

        if (empty($updates)) {
            Response::error('No valid fields to update', 400);
        }

        $params[] = $id;
        $sql = 'UPDATE "Attendances" SET ' . implode(', ', $updates) . " WHERE id = $$paramIndex RETURNING *";

        $stmt = Database::query($sql, $params);
        $updated = $stmt->fetch(\PDO::FETCH_ASSOC);

        Response::json($updated);
    }

    public static function delete($id)
    {
        $user = SessionManager::getUser();
        if (!$user) {
            Response::error('Unauthorized', 401);
        }

        // Check if user owns this attendance or has permission >= 1
        $stmt = Database::query(
            'SELECT * FROM "Attendances" WHERE id = $1',
            [$id]
        );

        $attendance = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$attendance) {
            Response::error('Attendance not found', 404);
        }

        if ($attendance['userID'] !== $user['id'] && $user['permission'] < 1) {
            Response::error('Permission denied', 403);
        }

        Database::query(
            'DELETE FROM "Attendances" WHERE id = $1',
            [$id]
        );

        Response::json(['message' => 'Attendance deleted successfully']);
    }
}
