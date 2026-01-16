<?php

namespace CheckIn\Controllers\Api;

use CheckIn\Core\Database;
use CheckIn\Core\Response;
use CheckIn\Auth\SessionManager;

class CoursesController
{
    public static function list()
    {
        $user = SessionManager::getUser();
        if (!$user) {
            Response::error('Unauthorized', 401);
        }

        // Get user's courses from the User table
        $stmt = Database::query(
            "SELECT courses FROM \"User\" WHERE id = $1",
            [$user['id']]
        );
        $userData = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$userData) {
            Response::json(['courses' => []]);
        }

        // Parse courses array (stored as JSON in PostgreSQL)
        $courses = json_decode($userData['courses'] ?? '[]', true);
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($courses)) {
            $courses = [];
        }

        // Format courses for response
        $formattedCourses = array_map(function($course) {
            return [
                'id' => $course,
                'name' => $course,
                'displayName' => $course
            ];
        }, $courses);

        Response::json([
            'courses' => $formattedCourses,
            'count' => count($formattedCourses)
        ]);
    }

    public static function get($courseId)
    {
        $user = SessionManager::getUser();
        if (!$user) {
            Response::error('Unauthorized', 401);
        }

        // Verify user has access to this course
        $stmt = Database::query(
            "SELECT courses FROM \"User\" WHERE id = $1",
            [$user['id']]
        );
        $userData = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$userData) {
            Response::error('User not found', 404);
        }

        $courses = json_decode($userData['courses'] ?? '[]', true);
        if (!in_array($courseId, $courses ?? [])) {
            Response::error('Course not found or access denied', 404);
        }

        Response::json([
            'id' => $courseId,
            'name' => $courseId,
            'displayName' => $courseId
        ]);
    }
}
