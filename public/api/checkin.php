<?php

require_once '../../src/Auth.php';
require_once '../../src/Attendance.php';
require_once '../../src/User.php';

header('Content-Type: application/json');

$currentUser = Auth::getCurrentUser();

if (!$currentUser) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$eventId = $input['eventId'] ?? null;
$targetUserId = $input['userId'] ?? null;

if (!$eventId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing eventId']);
    exit;
}

if ($targetUserId) {
    if ($currentUser['permission'] < 1) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Insufficient permissions to check in others']);
        exit;
    }

    $targetUser = User::getById($targetUserId);
    if (!$targetUser) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }
} else {
    $targetUserId = $currentUser['id'];
}

try {
    if (Attendance::exists($eventId, $targetUserId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Already checked in']);
        exit;
    }

    Attendance::create($eventId, $targetUserId);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
