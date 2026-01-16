<?php

require_once '../../src/Auth.php';
require_once '../../src/User.php';
require_once '../../src/Attendance.php';
require_once '../../src/Utils.php';

header('Content-Type: application/json');

$currentUser = Auth::getCurrentUser();

if (!$currentUser) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

$cw = (int)date('W');
$year = (int)date('Y');

$attendances = Attendance::getPerUser($currentUser['id'], $cw, $year);

$needs = Utils::parsePgArray($currentUser['needs']);
$missingStudyTimes = [];

foreach ($needs as $needed) {
    $found = false;
    foreach ($attendances as $data) {
        $type = $data['attendance']['type'];
        if ($type) {
            $normalizedType = str_replace(["Vertretung:", "Notiz:"], "", $type);
            if ($normalizedType === $needed) {
                $found = true;
                break;
            }
        }
    }
    if (!$found) {
        $missingStudyTimes[] = $needed;
    }
}

$completedStudyTimes = array_filter($attendances, function($a) {
    return $a['attendance']['type'] !== null && $a['attendance']['type'] !== 'Unterricht';
});

unset($currentUser['password']);
$currentUser['needs'] = $needs;
$currentUser['group'] = Utils::parsePgArray($currentUser['group']);
$currentUser['competence'] = Utils::parsePgArray($currentUser['competence']);
$currentUser['courses'] = Utils::parsePgArray($currentUser['courses']);

echo json_encode([
    'user' => $currentUser,
    'attendances' => $attendances,
    'stats' => [
        'missing' => $missingStudyTimes,
        'completedCount' => count($completedStudyTimes),
        'totalNeeds' => count($needs)
    ]
]);
