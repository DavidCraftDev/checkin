<?php

namespace App\Controllers\Api;

use App\Core\Database;
use App\Core\Response;
use App\Auth\SessionManager;

class StudyTimeController
{
    public static function list()
    {
        $user = SessionManager::getUser();
        if (!$user) {
            Response::error('Unauthorized', 401);
        }

        $cw = $_GET['cw'] ?? null;
        $year = $_GET['year'] ?? date('Y');

        $sql = 'SELECT * FROM "StudyTimeData" WHERE "userID" = $1';
        $params = [$user['id']];

        if ($cw) {
            $sql .= ' AND cw = $2';
            $params[] = $cw;
        }

        if ($year) {
            $sql .= ' AND year = $' . (count($params) + 1);
            $params[] = $year;
        }

        $sql .= ' ORDER BY year DESC, cw DESC';

        $stmt = Database::query($sql, $params);
        $studyTimes = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Parse needs arrays
        foreach ($studyTimes as &$st) {
            $st['needs'] = json_decode($st['needs'] ?? '[]', true);
            if (json_last_error() !== JSON_ERROR_NONE || !is_array($st['needs'])) {
                $st['needs'] = [];
            }
        }

        Response::json([
            'studyTimes' => $studyTimes,
            'count' => count($studyTimes)
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

        $needs = $input['needs'] ?? [];
        $cw = $input['cw'] ?? (int)date('W');
        $year = $input['year'] ?? (int)date('Y');

        if (!is_array($needs)) {
            Response::error('Needs must be an array', 400);
        }

        // Check if entry already exists for this user/cw/year
        $existing = Database::query(
            'SELECT id FROM "StudyTimeData" WHERE "userID" = $1 AND cw = $2 AND year = $3',
            [$user['id'], $cw, $year]
        )->fetch(\PDO::FETCH_ASSOC);

        if ($existing) {
            // Update existing
            $stmt = Database::query(
                'UPDATE "StudyTimeData" SET needs = $1 WHERE "userID" = $2 AND cw = $3 AND year = $4 RETURNING *',
                [json_encode($needs), $user['id'], $cw, $year]
            );
        } else {
            // Create new
            $id = bin2hex(random_bytes(12));
            $stmt = Database::query(
                'INSERT INTO "StudyTimeData" (id, "userID", needs, cw, year) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [$id, $user['id'], json_encode($needs), $cw, $year]
            );
        }

        $studyTime = $stmt->fetch(\PDO::FETCH_ASSOC);
        $studyTime['needs'] = json_decode($studyTime['needs'], true);

        Response::json($studyTime, $existing ? 200 : 201);
    }

    public static function get($id)
    {
        $user = SessionManager::getUser();
        if (!$user) {
            Response::error('Unauthorized', 401);
        }

        $stmt = Database::query(
            'SELECT * FROM "StudyTimeData" WHERE id = $1 AND "userID" = $2',
            [$id, $user['id']]
        );

        $studyTime = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$studyTime) {
            Response::error('Study time entry not found', 404);
        }

        $studyTime['needs'] = json_decode($studyTime['needs'] ?? '[]', true);
        Response::json($studyTime);
    }
}
