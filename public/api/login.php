<?php

require_once '../../src/Auth.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if ($input) {
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';
    } else {
        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';
    }

    $username = trim($username);

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing credentials']);
        exit;
    }

    if (Auth::login($username, $password)) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
