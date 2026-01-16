<?php

namespace CheckIn\Controllers\Api;

use CheckIn\Core\Response;
use CheckIn\Core\Database;
use CheckIn\Auth\AuthManager;

class GroupOverviewController
{
    public function get(): void
    {
        $user = AuthManager::requireAuth(1);

        $groupName = $_GET['group'] ?? '';
        $cw = (int)($_GET['cw'] ?? date('W'));
        $year = (int)($_GET['year'] ?? date('Y'));

        if (empty($groupName)) {
            Response::error('Group parameter required', 400);
        }

        // Fetch all users in the group
        $users = Database::fetchAll(
            'SELECT id, username, displayname, permission, "group" 
             FROM "User" 
             WHERE ? = ANY("group")',
            [$groupName]
        );

        if (empty($users)) {
            Response::json([
                'group' => $groupName,
                'users' => [],
                'cw' => $cw,
                'year' => $year
            ]);
            return;
        }

        $userIds = array_column($users, 'id');
        
        // Fetch attendances for all users in the group
        $placeholders = implode(',', array_fill(0, count($userIds), '?'));
        $params = array_merge($userIds, [$cw]);
        
        $attendances = Database::fetchAll(
            "SELECT a.*, u.username, u.displayname 
             FROM \"Attendances\" a 
             JOIN \"User\" u ON a.\"userID\" = u.id 
             WHERE a.\"userID\" IN ($placeholders) AND a.cw = ?
             ORDER BY u.displayname",
            $params
        );

        Response::json([
            'group' => $groupName,
            'users' => $users,
            'attendances' => $attendances,
            'cw' => $cw,
            'year' => $year
        ]);
    }
}
