<?php

namespace CheckIn\Controllers\Api;

use CheckIn\Core\Response;
use CheckIn\Core\Database;
use CheckIn\Auth\AuthManager;

class EventsController
{
    public function list(): void
    {
        $user = AuthManager::requireAuth(0);
        
        $cw = $_GET['cw'] ?? (int)date('W');
        $year = $_GET['year'] ?? (int)date('Y');
        $userFilter = $_GET['user'] ?? null;
        
        $sql = 'SELECT * FROM "Events" WHERE cw = ? AND EXTRACT(YEAR FROM created_at) = ?';
        $params = [$cw, $year];
        
        // Filter by user if specified and user has permission
        if ($userFilter) {
            if ($userFilter !== $user['id'] && $user['permission'] < 1) {
                Response::error('Forbidden', 403);
            }
            $sql .= ' AND "user" = ?';
            $params[] = $userFilter;
        } else if ($user['permission'] < 1) {
            // Regular users can only see their own events
            $sql .= ' AND "user" = ?';
            $params[] = $user['id'];
        }
        
        $sql .= ' ORDER BY created_at DESC';
        
        $events = Database::fetchAll($sql, $params);
        
        Response::json([
            'events' => $events,
            'count' => count($events),
            'cw' => $cw,
            'year' => $year
        ]);
    }
    
    public function create(): void
    {
        $user = AuthManager::requireAuth(1);
        
        $rawBody = file_get_contents('php://input');
        $input = json_decode($rawBody, true);
        
        if ($input === null && json_last_error() !== JSON_ERROR_NONE) {
            Response::error('Invalid JSON in request body', 400);
        }
        
        $type = $input['type'] ?? '';
        $cw = $input['cw'] ?? (int)date('W');
        
        if (empty($type)) {
            Response::error('Event type required', 400);
        }
        
        $eventId = $this->generateId();
        
        Database::query(
            'INSERT INTO "Events" (id, type, "user", cw, created_at) VALUES (?, ?, ?, ?, NOW())',
            [$eventId, $type, $user['id'], $cw]
        );
        
        $event = Database::fetchOne(
            'SELECT * FROM "Events" WHERE id = ?',
            [$eventId]
        );
        
        Response::json([
            'message' => 'Event created successfully',
            'event' => $event
        ], 201);
    }
    
    public function get(): void
    {
        $user = AuthManager::requireAuth(0);
        
        // Get event ID from URL path
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $parts = explode('/', trim($path, '/'));
        $eventId = end($parts);
        
        if (empty($eventId)) {
            Response::error('Event ID required', 400);
        }
        
        $event = Database::fetchOne(
            'SELECT * FROM "Events" WHERE id = ?',
            [$eventId]
        );
        
        if (!$event) {
            Response::error('Event not found', 404);
        }
        
        // Check permissions
        if ($event['user'] !== $user['id'] && $user['permission'] < 1) {
            Response::error('Forbidden', 403);
        }
        
        // Get attendances for this event
        $attendances = Database::fetchAll(
            'SELECT a.*, u.username, u.displayname 
             FROM "Attendances" a 
             JOIN "User" u ON a."userID" = u.id 
             WHERE a."eventID" = ?
             ORDER BY a.created_at DESC',
            [$eventId]
        );
        
        Response::json([
            'event' => $event,
            'attendances' => $attendances,
            'attendanceCount' => count($attendances)
        ]);
    }
    
    public function delete(): void
    {
        $user = AuthManager::requireAuth(1);
        
        // Get event ID from URL path
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $parts = explode('/', trim($path, '/'));
        $eventId = end($parts);
        
        if (empty($eventId)) {
            Response::error('Event ID required', 400);
        }
        
        $event = Database::fetchOne(
            'SELECT * FROM "Events" WHERE id = ?',
            [$eventId]
        );
        
        if (!$event) {
            Response::error('Event not found', 404);
        }
        
        // Check if user owns the event or is admin
        if ($event['user'] !== $user['id'] && $user['permission'] < 2) {
            Response::error('Forbidden', 403);
        }
        
        // Delete associated attendances first
        Database::query(
            'DELETE FROM "Attendances" WHERE "eventID" = ?',
            [$eventId]
        );
        
        // Delete event
        Database::query(
            'DELETE FROM "Events" WHERE id = ?',
            [$eventId]
        );
        
        Response::json([
            'message' => 'Event deleted successfully'
        ]);
    }
    
    private function generateId(): string
    {
        return 'c' . bin2hex(random_bytes(12));
    }
}
