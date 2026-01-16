<?php

namespace CheckIn\Controllers\Api;

use CheckIn\Core\Response;
use CheckIn\Auth\AuthManager;
use CheckIn\Services\EmailNotification;
use CheckIn\Services\UntisIntegration;
use CheckIn\Services\PDFExport;

class AdvancedController
{
    // Email notification endpoint
    public function sendEmail(): void
    {
        $user = AuthManager::requireAuth(1);
        
        $rawBody = file_get_contents('php://input');
        $input = json_decode($rawBody, true);
        
        if (!$input || !isset($input['type'])) {
            Response::error('Invalid request', 400);
        }

        $emailService = new EmailNotification();
        $result = false;

        switch ($input['type']) {
            case 'attendance_reminder':
                if (!isset($input['userId'], $input['eventId'])) {
                    Response::error('userId and eventId required', 400);
                }
                // Implementation would fetch user and event
                $result = true; // Placeholder
                break;
                
            case 'weekly_summary':
                // Implementation would send weekly summary
                $result = true; // Placeholder
                break;
        }

        Response::json(['success' => $result]);
    }

    // Untis integration sync
    public function syncUntis(): void
    {
        $user = AuthManager::requireAuth(2); // Admin only
        
        $untis = new UntisIntegration();
        
        if (!$untis->isConfigured()) {
            Response::error('Untis not configured', 400);
        }

        if (!$untis->authenticate()) {
            Response::error('Untis authentication failed', 401);
        }

        $action = $_GET['action'] ?? 'classes';
        
        switch ($action) {
            case 'classes':
                $result = $untis->syncClasses();
                break;
            case 'timetable':
                $startDate = (int)($_GET['startDate'] ?? date('Ymd'));
                $endDate = (int)($_GET['endDate'] ?? date('Ymd'));
                $result = $untis->syncTimetable($startDate, $endDate);
                break;
            default:
                Response::error('Invalid action', 400);
        }

        $untis->logout();
        
        Response::json([
            'success' => true,
            'action' => $action,
            'data' => $result
        ]);
    }

    // PDF export endpoint
    public function exportPDF(): void
    {
        $user = AuthManager::requireAuth(0);
        
        $userID = $_GET['userID'] ?? $user['id'];
        $startCW = (int)($_GET['startCW'] ?? 1);
        $endCW = (int)($_GET['endCW'] ?? 53);
        $year = (int)($_GET['year'] ?? date('Y'));
        
        // Check permission
        if ($userID !== $user['id'] && $user['permission'] < 1) {
            Response::error('Forbidden', 403);
        }

        try {
            $pdfService = new PDFExport();
            $filePath = $pdfService->generateAttendanceReport($userID, $startCW, $endCW, $year);
            
            // In production, this would send actual PDF
            // For now, send HTML
            header('Content-Type: text/html; charset=utf-8');
            header('Content-Disposition: inline; filename="report.html"');
            readfile($filePath);
            exit;
            
        } catch (\Exception $e) {
            Response::error('PDF generation failed: ' . $e->getMessage(), 500);
        }
    }

    // Advanced reporting
    public function getAdvancedReport(): void
    {
        $user = AuthManager::requireAuth(1);
        
        $type = $_GET['type'] ?? 'attendance';
        $startDate = $_GET['startDate'] ?? date('Y-m-d', strtotime('-30 days'));
        $endDate = $_GET['endDate'] ?? date('Y-m-d');
        
        // Placeholder for advanced reporting logic
        $report = [
            'type' => $type,
            'period' => ['start' => $startDate, 'end' => $endDate],
            'statistics' => [
                'total_users' => 0,
                'total_events' => 0,
                'total_attendances' => 0,
                'attendance_rate' => 0
            ],
            'trends' => [],
            'generated_at' => date('c')
        ];
        
        Response::json($report);
    }
}
