<?php

namespace CheckIn\Controllers\Api;

use CheckIn\Core\Response;
use CheckIn\Core\Database;
use CheckIn\Auth\AuthManager;

class ExportController
{
    public function exportUserData(): void
    {
        $user = AuthManager::requireAuth(0);
        
        // Get user ID from query or use current user
        $userID = $_GET['userID'] ?? $user['id'];
        $startCW = (int)($_GET['startCW'] ?? 1);
        $endCW = (int)($_GET['endCW'] ?? 53);
        $year = (int)($_GET['year'] ?? date('Y'));
        
        // Check permission
        if ($userID !== $user['id'] && $user['permission'] < 1) {
            Response::error('Forbidden', 403);
        }
        
        // Fetch user data
        $userData = Database::fetchOne(
            'SELECT * FROM "User" WHERE id = ?',
            [$userID]
        );
        
        if (!$userData) {
            Response::error('User not found', 404);
        }
        
        // Fetch attendances
        $attendances = Database::fetchAll(
            'SELECT a.*, e.type as event_type 
             FROM "Attendances" a 
             LEFT JOIN "Events" e ON a."eventID" = e.id 
             WHERE a."userID" = ? 
             AND a.cw BETWEEN ? AND ?
             ORDER BY a.cw ASC, a.created_at ASC',
            [$userID, $startCW, $endCW]
        );
        
        // Generate CSV
        $filename = 'attendance_' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $userData['username']) . '_' . $year . '.csv';
        
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . addslashes($filename) . '"');
        header('Pragma: no-cache');
        header('Expires: 0');
        
        $output = fopen('php://output', 'w');
        
        // UTF-8 BOM for Excel compatibility
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
        
        // Header row
        fputcsv($output, [
            'Datum',
            'KW',
            'Typ',
            'Status',
            'Feedback',
            'Notiz (Schüler)',
            'Notiz (Lehrer)',
            'Selbstreflexion'
        ], ';');
        
        // Data rows
        foreach ($attendances as $att) {
            fputcsv($output, [
                date('d.m.Y H:i', strtotime($att['created_at'])),
                $att['cw'],
                $att['event_type'] ?? $att['type'] ?? 'N/A',
                $att['attended'] ? 'Teilgenommen' : 'Nicht teilgenommen',
                $att['feedback'] ?? '',
                $att['studentNote'] ?? '',
                $att['teacherNote'] ?? '',
                $att['selfReflection'] ?? ''
            ], ';');
        }
        
        fclose($output);
        exit;
    }
    
    public function exportGroupData(): void
    {
        $user = AuthManager::requireAuth(1);
        
        $group = $_GET['group'] ?? '';
        $cw = (int)($_GET['cw'] ?? date('W'));
        $year = (int)($_GET['year'] ?? date('Y'));
        
        if (empty($group)) {
            Response::error('Group parameter required', 400);
        }
        
        // Fetch group members
        $users = Database::fetchAll(
            'SELECT id, username, displayname FROM "User" WHERE ? = ANY("group") ORDER BY displayname',
            [$group]
        );
        
        if (empty($users)) {
            Response::error('No users found in group', 404);
        }
        
        $userIds = array_column($users, 'id');
        $placeholders = implode(',', array_fill(0, count($userIds), '?'));
        $params = array_merge($userIds, [$cw]);
        
        $attendances = Database::fetchAll(
            "SELECT a.*, u.username, u.displayname 
             FROM \"Attendances\" a 
             JOIN \"User\" u ON a.\"userID\" = u.id 
             WHERE a.\"userID\" IN ($placeholders) AND a.cw = ?
             ORDER BY u.displayname, a.created_at",
            $params
        );
        
        // Generate CSV
        $filename = 'group_' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $group) . '_KW' . $cw . '_' . $year . '.csv';
        
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . addslashes($filename) . '"');
        
        $output = fopen('php://output', 'w');
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
        
        fputcsv($output, [
            'Name',
            'Benutzername',
            'Datum',
            'Status',
            'Feedback',
            'Notizen'
        ], ';');
        
        foreach ($attendances as $att) {
            fputcsv($output, [
                $att['displayname'],
                $att['username'],
                date('d.m.Y H:i', strtotime($att['created_at'])),
                $att['attended'] ? 'Ja' : 'Nein',
                $att['feedback'] ?? '',
                $att['studentNote'] ?? $att['teacherNote'] ?? ''
            ], ';');
        }
        
        fclose($output);
        exit;
    }

    public function exportUserXLSX(): void
    {
        // For XLSX, we'll use CSV with .xlsx extension
        // Full XLSX would require PHPSpreadsheet library
        $user = AuthManager::requireAuth(0);
        
        $userID = $_GET['userID'] ?? $user['id'];
        $startCW = (int)($_GET['startCW'] ?? 1);
        $endCW = (int)($_GET['endCW'] ?? 53);
        $year = (int)($_GET['year'] ?? date('Y'));
        
        if ($userID !== $user['id'] && $user['permission'] < 1) {
            Response::error('Forbidden', 403);
        }
        
        $userData = Database::fetchOne('SELECT * FROM "User" WHERE id = ?', [$userID]);
        if (!$userData) {
            Response::error('User not found', 404);
        }
        
        $attendances = Database::fetchAll(
            'SELECT a.*, e.type as event_type FROM "Attendances" a 
             LEFT JOIN "Events" e ON a."eventID" = e.id 
             WHERE a."userID" = ? AND a.cw BETWEEN ? AND ?
             ORDER BY a.cw ASC, a.created_at ASC',
            [$userID, $startCW, $endCW]
        );
        
        $filename = 'attendance_' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $userData['username']) . '_' . $year . '.csv';
        
        // Note: Using CSV format with UTF-8 BOM for Excel compatibility (lightweight alternative to XLSX)
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . addslashes($filename) . '"');
        
        $output = fopen('php://output', 'w');
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
        
        fputcsv($output, ['Datum', 'KW', 'Typ', 'Status', 'Feedback', 'Notiz (Schüler)', 'Notiz (Lehrer)', 'Selbstreflexion'], ';');
        
        foreach ($attendances as $att) {
            fputcsv($output, [
                date('d.m.Y H:i', strtotime($att['created_at'])),
                $att['cw'],
                $att['event_type'] ?? $att['type'] ?? 'N/A',
                $att['attended'] ? 'Teilgenommen' : 'Nicht teilgenommen',
                $att['feedback'] ?? '',
                $att['studentNote'] ?? '',
                $att['teacherNote'] ?? '',
                $att['selfReflection'] ?? ''
            ], ';');
        }
        
        fclose($output);
        exit;
    }

    public function exportGroupXLSX(): void
    {
        $user = AuthManager::requireAuth(1);
        
        $group = $_GET['group'] ?? '';
        $cw = (int)($_GET['cw'] ?? date('W'));
        $year = (int)($_GET['year'] ?? date('Y'));
        
        if (empty($group)) {
            Response::error('Group parameter required', 400);
        }
        
        $users = Database::fetchAll(
            'SELECT id, username, displayname FROM "User" WHERE ? = ANY("group") ORDER BY displayname',
            [$group]
        );
        
        if (empty($users)) {
            Response::error('No users found in group', 404);
        }
        
        $userIds = array_column($users, 'id');
        $placeholders = implode(',', array_fill(0, count($userIds), '?'));
        $params = array_merge($userIds, [$cw]);
        
        $attendances = Database::fetchAll(
            "SELECT a.*, u.username, u.displayname FROM \"Attendances\" a 
             JOIN \"User\" u ON a.\"userID\" = u.id 
             WHERE a.\"userID\" IN ($placeholders) AND a.cw = ?
             ORDER BY u.displayname, a.created_at",
            $params
        );
        
        $filename = 'group_' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $group) . '_KW' . $cw . '_' . $year . '.csv';
        
        // Note: Using CSV format with UTF-8 BOM for Excel compatibility (lightweight alternative to XLSX)
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . addslashes($filename) . '"');
        
        $output = fopen('php://output', 'w');
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
        
        fputcsv($output, ['Name', 'Benutzername', 'Datum', 'Status', 'Feedback', 'Notizen'], ';');
        
        foreach ($attendances as $att) {
            fputcsv($output, [
                $att['displayname'],
                $att['username'],
                date('d.m.Y H:i', strtotime($att['created_at'])),
                $att['attended'] ? 'Ja' : 'Nein',
                $att['feedback'] ?? '',
                $att['studentNote'] ?? $att['teacherNote'] ?? ''
            ], ';');
        }
        
        fclose($output);
        exit;
    }

    public function exportEventsJSON(): void
    {
        $user = AuthManager::requireAuth(0);
        
        $cw = $_GET['cw'] ?? null;
        $year = $_GET['year'] ?? date('Y');
        
        $sql = 'SELECT * FROM "Events" WHERE "user" = ?';
        $params = [$user['id']];
        
        if ($cw) {
            $sql .= ' AND cw = ?';
            $params[] = $cw;
        }
        
        $sql .= ' ORDER BY created_at DESC';
        
        $events = Database::fetchAll($sql, $params);
        
        header('Content-Type: application/json; charset=utf-8');
        header('Content-Disposition: attachment; filename="events_' . $user['username'] . '_' . $year . '.json"');
        
        echo json_encode([
            'user' => $user['username'],
            'year' => $year,
            'cw' => $cw,
            'events' => $events,
            'count' => count($events),
            'exported_at' => date('Y-m-d H:i:s')
        ], JSON_PRETTY_PRINT);
        
        exit;
    }

    // TypeScript compatibility routes
    
    public function exportOverviewUserXLSX(): void
    {
        // Matches /export/overview/user/xlsx route from TypeScript
        $this->exportUserXLSX();
    }
    
    public function exportOverviewGroupXLSX(): void
    {
        // Matches /export/overview/group/xlsx route from TypeScript
        $this->exportGroupXLSX();
    }
    
    public function exportUserJSON(): void
    {
        $user = AuthManager::requireAuth(0);
        
        $userID = $_GET['userID'] ?? $user['id'];
        if ($userID !== $user['id'] && $user['permission'] < 1) {
            Response::error('Forbidden', 403);
        }
        
        $userData = Database::fetchOne('SELECT * FROM "User" WHERE id = ?', [$userID]);
        if (!$userData) {
            Response::error('User not found', 404);
        }
        
        // Decode JSON fields
        $userData['group'] = json_decode($userData['group'] ?? '[]', true);
        $userData['courses'] = json_decode($userData['courses'] ?? '[]', true);
        $userData['needs'] = json_decode($userData['needs'] ?? '[]', true);
        $userData['competence'] = json_decode($userData['competence'] ?? '[]', true);
        
        header('Content-Type: application/json; charset=utf-8');
        header('Content-Disposition: attachment; filename="user_' . $userData['username'] . '.json"');
        
        echo json_encode($userData, JSON_PRETTY_PRINT);
        exit;
    }
    
    public function exportAttendedEventsXLSX(): void
    {
        $user = AuthManager::requireAuth(0);
        
        $userID = $_GET['userID'] ?? $user['id'];
        $cw = (int)($_GET['cw'] ?? date('W'));
        $year = (int)($_GET['year'] ?? date('Y'));
        
        if ($userID !== $user['id'] && $user['permission'] < 1) {
            Response::error('Forbidden', 403);
        }
        
        $attendances = Database::fetchAll(
            'SELECT a.*, e.type, e.name FROM "Attendances" a 
             LEFT JOIN "Events" e ON a."eventID" = e.id 
             WHERE a."userID" = ? AND a.cw = ?
             ORDER BY a.created_at ASC',
            [$userID, $cw]
        );
        
        $filename = 'attended_events_' . $cw . '_' . $year . '_' . $userID . '.xlsx';
        
        // Note: Using CSV format with UTF-8 BOM for Excel compatibility (lightweight alternative to XLSX)
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . addslashes($filename) . '"');
        
        $output = fopen('php://output', 'w');
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
        
        fputcsv($output, ['Event', 'Typ', 'Datum', 'Status', 'Feedback'], ';');
        
        foreach ($attendances as $att) {
            fputcsv($output, [
                $att['name'] ?? 'N/A',
                $att['type'] ?? 'N/A',
                date('d.m.Y H:i', strtotime($att['created_at'])),
                $att['attended'] ? 'Teilgenommen' : 'Nicht teilgenommen',
                $att['feedback'] ?? ''
            ], ';');
        }
        
        fclose($output);
        exit;
    }
    
    public function exportAttendedEventsJSON(): void
    {
        $user = AuthManager::requireAuth(0);
        
        $userID = $_GET['userID'] ?? $user['id'];
        $cw = (int)($_GET['cw'] ?? date('W'));
        $year = (int)($_GET['year'] ?? date('Y'));
        
        if ($userID !== $user['id'] && $user['permission'] < 1) {
            Response::error('Forbidden', 403);
        }
        
        $attendances = Database::fetchAll(
            'SELECT a.*, e.type, e.name FROM "Attendances" a 
             LEFT JOIN "Events" e ON a."eventID" = e.id 
             WHERE a."userID" = ? AND a.cw = ?
             ORDER BY a.created_at ASC',
            [$userID, $cw]
        );
        
        header('Content-Type: application/json; charset=utf-8');
        header('Content-Disposition: attachment; filename="attended_events_' . $cw . '_' . $year . '.json"');
        
        echo json_encode(['attendances' => $attendances, 'count' => count($attendances)], JSON_PRETTY_PRINT);
        exit;
    }
    
    public function exportCreatedEventsXLSX(): void
    {
        $user = AuthManager::requireAuth(1);
        
        $cw = $_GET['cw'] ?? null;
        $year = (int)($_GET['year'] ?? date('Y'));
        
        $sql = 'SELECT * FROM "Events" WHERE "user" = ?';
        $params = [$user['id']];
        
        if ($cw) {
            $sql .= ' AND cw = ?';
            $params[] = $cw;
        }
        
        $events = Database::fetchAll($sql . ' ORDER BY created_at DESC', $params);
        
        $filename = 'created_events_' . $user['username'] . '_' . $year . '.xlsx';
        
        // Note: Using CSV format with UTF-8 BOM for Excel compatibility (lightweight alternative to XLSX)
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . addslashes($filename) . '"');
        
        $output = fopen('php://output', 'w');
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
        
        fputcsv($output, ['Name', 'Typ', 'KW', 'Erstellt am'], ';');
        
        foreach ($events as $event) {
            fputcsv($output, [
                $event['name'],
                $event['type'],
                $event['cw'],
                date('d.m.Y H:i', strtotime($event['created_at']))
            ], ';');
        }
        
        fclose($output);
        exit;
    }
    
    public function exportCreatedEventsJSON(): void
    {
        $user = AuthManager::requireAuth(1);
        
        $cw = $_GET['cw'] ?? null;
        $year = (int)($_GET['year'] ?? date('Y'));
        
        $sql = 'SELECT * FROM "Events" WHERE "user" = ?';
        $params = [$user['id']];
        
        if ($cw) {
            $sql .= ' AND cw = ?';
            $params[] = $cw;
        }
        
        $events = Database::fetchAll($sql . ' ORDER BY created_at DESC', $params);
        
        header('Content-Type: application/json; charset=utf-8');
        header('Content-Disposition: attachment; filename="created_events_' . $year . '.json"');
        
        echo json_encode(['events' => $events, 'count' => count($events)], JSON_PRETTY_PRINT);
        exit;
    }
    
    public function exportEventXLSX(): void
    {
        $user = AuthManager::requireAuth(1);
        
        $eventID = $_GET['eventID'] ?? null;
        if (!$eventID) {
            Response::error('Event ID required', 400);
        }
        
        $event = Database::fetchOne('SELECT * FROM "Events" WHERE id = ?', [$eventID]);
        if (!$event) {
            Response::error('Event not found', 404);
        }
        
        $attendances = Database::fetchAll(
            'SELECT a.*, u.displayname, u.username FROM "Attendances" a 
             JOIN "User" u ON a."userID" = u.id 
             WHERE a."eventID" = ?
             ORDER BY u.displayname',
            [$eventID]
        );
        
        $filename = 'event_' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $event['name']) . '.xlsx';
        
        // Note: Using CSV format with UTF-8 BOM for Excel compatibility (lightweight alternative to XLSX)
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . addslashes($filename) . '"');
        
        $output = fopen('php://output', 'w');
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
        
        fputcsv($output, ['Name', 'Benutzername', 'Status', 'Feedback', 'Datum'], ';');
        
        foreach ($attendances as $att) {
            fputcsv($output, [
                $att['displayname'],
                $att['username'],
                $att['attended'] ? 'Teilgenommen' : 'Nicht teilgenommen',
                $att['feedback'] ?? '',
                date('d.m.Y H:i', strtotime($att['created_at']))
            ], ';');
        }
        
        fclose($output);
        exit;
    }
    
    public function exportEventJSON(): void
    {
        $user = AuthManager::requireAuth(1);
        
        $eventID = $_GET['eventID'] ?? null;
        if (!$eventID) {
            Response::error('Event ID required', 400);
        }
        
        $event = Database::fetchOne('SELECT * FROM "Events" WHERE id = ?', [$eventID]);
        if (!$event) {
            Response::error('Event not found', 404);
        }
        
        $attendances = Database::fetchAll(
            'SELECT a.*, u.displayname, u.username FROM "Attendances" a 
             JOIN "User" u ON a."userID" = u.id 
             WHERE a."eventID" = ?
             ORDER BY u.displayname',
            [$eventID]
        );
        
        header('Content-Type: application/json; charset=utf-8');
        header('Content-Disposition: attachment; filename="event_' . $event['id'] . '.json"');
        
        echo json_encode([
            'event' => $event,
            'attendances' => $attendances,
            'count' => count($attendances)
        ], JSON_PRETTY_PRINT);
        exit;
    }
    
    public function exportGroupXLSXById(): void
    {
        $user = AuthManager::requireAuth(1);
        
        $groupID = $_GET['groupID'] ?? null;
        if (!$groupID) {
            Response::error('Group ID required', 400);
        }
        
        $cw = (int)($_GET['cw'] ?? date('W'));
        $year = (int)($_GET['year'] ?? date('Y'));
        
        $users = Database::fetchAll(
            'SELECT id, username, displayname FROM "User" WHERE ? = ANY("group") ORDER BY displayname',
            [$groupID]
        );
        
        if (empty($users)) {
            Response::error('No users found in group', 404);
        }
        
        $userIds = array_column($users, 'id');
        $placeholders = implode(',', array_fill(0, count($userIds), '?'));
        $params = array_merge($userIds, [$cw]);
        
        $attendances = Database::fetchAll(
            "SELECT a.*, u.username, u.displayname FROM \"Attendances\" a 
             JOIN \"User\" u ON a.\"userID\" = u.id 
             WHERE a.\"userID\" IN ($placeholders) AND a.cw = ?
             ORDER BY u.displayname, a.created_at",
            $params
        );
        
        $filename = 'group_' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $groupID) . '_KW' . $cw . '_' . $year . '.xlsx';
        
        // Note: Using CSV format with UTF-8 BOM for Excel compatibility (lightweight alternative to XLSX)
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . addslashes($filename) . '"');
        
        $output = fopen('php://output', 'w');
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
        
        fputcsv($output, ['Name', 'Benutzername', 'Datum', 'Status', 'Feedback', 'Notizen'], ';');
        
        foreach ($attendances as $att) {
            fputcsv($output, [
                $att['displayname'],
                $att['username'],
                date('d.m.Y H:i', strtotime($att['created_at'])),
                $att['attended'] ? 'Ja' : 'Nein',
                $att['feedback'] ?? '',
                $att['studentNote'] ?? $att['teacherNote'] ?? ''
            ], ';');
        }
        
        fclose($output);
        exit;
    }
    
    public function exportGroupJSONById(): void
    {
        $user = AuthManager::requireAuth(1);
        
        $groupID = $_GET['groupID'] ?? null;
        if (!$groupID) {
            Response::error('Group ID required', 400);
        }
        
        $cw = (int)($_GET['cw'] ?? date('W'));
        
        $users = Database::fetchAll(
            'SELECT id, username, displayname, permission, "group", needs, competence FROM "User" 
             WHERE ? = ANY("group") ORDER BY displayname',
            [$groupID]
        );
        
        header('Content-Type: application/json; charset=utf-8');
        header('Content-Disposition: attachment; filename="group_' . $groupID . '.json"');
        
        echo json_encode(['group' => $groupID, 'users' => $users, 'count' => count($users)], JSON_PRETTY_PRINT);
        exit;
    }
    
    public function exportAllGroupsXLSX(): void
    {
        $user = AuthManager::requireAuth(2);
        
        // Get all unique groups
        $groups = Database::fetchAll(
            'SELECT DISTINCT unnest("group") as group_name FROM "User" WHERE "group" IS NOT NULL ORDER BY group_name'
        );
        
        $filename = 'all_groups_' . date('Y-m-d') . '.xlsx';
        
        // Note: Using CSV format with UTF-8 BOM for Excel compatibility (lightweight alternative to XLSX)
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . addslashes($filename) . '"');
        
        $output = fopen('php://output', 'w');
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
        
        fputcsv($output, ['Gruppe', 'Anzahl Mitglieder'], ';');
        
        foreach ($groups as $group) {
            $count = Database::fetchOne(
                'SELECT COUNT(*) as count FROM "User" WHERE ? = ANY("group")',
                [$group['group_name']]
            );
            
            fputcsv($output, [$group['group_name'], $count['count']], ';');
        }
        
        fclose($output);
        exit;
    }
    
    public function exportAllGroupsJSON(): void
    {
        $user = AuthManager::requireAuth(2);
        
        $groups = Database::fetchAll(
            'SELECT DISTINCT unnest("group") as group_name FROM "User" WHERE "group" IS NOT NULL ORDER BY group_name'
        );
        
        $groupsWithCounts = [];
        foreach ($groups as $group) {
            $count = Database::fetchOne(
                'SELECT COUNT(*) as count FROM "User" WHERE ? = ANY("group")',
                [$group['group_name']]
            );
            
            $groupsWithCounts[] = [
                'name' => $group['group_name'],
                'memberCount' => (int)$count['count']
            ];
        }
        
        header('Content-Type: application/json; charset=utf-8');
        header('Content-Disposition: attachment; filename="all_groups.json"');
        
        echo json_encode(['groups' => $groupsWithCounts, 'count' => count($groupsWithCounts)], JSON_PRETTY_PRINT);
        exit;
    }
}
