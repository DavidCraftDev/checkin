<?php

namespace CheckIn\Controllers\Api;

use CheckIn\Core\Response;
use CheckIn\Core\Database;
use CheckIn\Auth\AuthManager;

class UserOverviewController
{
    public function get(): void
    {
        $user = AuthManager::requireAuth(1);

        $userID = $_GET['userID'] ?? $user['id'];
        $startCW = (int)($_GET['startCW'] ?? date('W'));
        $startYear = (int)($_GET['startYear'] ?? date('Y'));
        $endCW = (int)($_GET['endCW'] ?? $startCW);
        $endYear = (int)($_GET['endYear'] ?? $startYear);

        // Fetch user data
        $userData = Database::fetchOne(
            'SELECT * FROM "User" WHERE id = ?',
            [$userID]
        );

        if (!$userData) {
            Response::error('User not found', 404);
        }

        // Check permission - users can only view their own data unless they have higher permissions
        if ($user['permission'] < 2 && $user['id'] !== $userID) {
            Response::error('Forbidden', 403);
        }

        // Fetch attendances for the given calendar weeks
        $attendances = Database::fetchAll(
            'SELECT a.*, e.type as event_type 
             FROM "Attendances" a 
             LEFT JOIN "Events" e ON a."eventID" = e.id 
             WHERE a."userID" = ? 
             AND a.cw BETWEEN ? AND ?
             ORDER BY a.cw DESC, a.created_at DESC',
            [$userID, $startCW, $endCW]
        );

        // Safely decode group field with error handling
        $rawGroup = $userData['group'] ?? '[]';
        $decodedGroup = json_decode($rawGroup, true);
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($decodedGroup)) {
            $decodedGroup = [];
        }

        Response::json([
            'user' => [
                'id' => $userData['id'],
                'username' => $userData['username'],
                'displayname' => $userData['displayname'],
                'group' => $decodedGroup,
                'permission' => $userData['permission']
            ],
            'attendances' => $attendances,
            'period' => [
                'startCW' => $startCW,
                'startYear' => $startYear,
                'endCW' => $endCW,
                'endYear' => $endYear
            ]
        ]);
    }
}
