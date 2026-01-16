<?php

namespace CheckIn\Controllers\Api;

use CheckIn\Core\Response;
use CheckIn\Core\Database;
use CheckIn\Auth\AuthManager;

class QRCodeController
{
    public function generate(): void
    {
        $user = AuthManager::requireAuth(1);
        
        // Get event ID from URL path
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $parts = explode('/', trim($path, '/'));
        $eventId = end($parts);
        
        if (empty($eventId)) {
            Response::error('Event ID required', 400);
        }
        
        // Verify event exists and user has permission
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
        
        // Generate QR code data (event ID + timestamp for security)
        $qrData = base64_encode(json_encode([
            'eventId' => $eventId,
            'timestamp' => time(),
            'type' => 'checkin'
        ]));
        
        // Create QR code image using GD
        $size = 300;
        $qrCodeImage = $this->generateQRCodeImage($qrData, $size);
        
        // Return as base64 image
        ob_start();
        imagepng($qrCodeImage);
        $imageData = ob_get_clean();
        imagedestroy($qrCodeImage);
        
        Response::json([
            'qrCode' => 'data:image/png;base64,' . base64_encode($imageData),
            'data' => $qrData,
            'eventId' => $eventId
        ]);
    }
    
    public function validate(): void
    {
        $user = AuthManager::requireAuth(0);
        
        $rawBody = file_get_contents('php://input');
        $input = json_decode($rawBody, true);
        
        if (!isset($input['code'])) {
            Response::error('QR code data required', 400);
        }
        
        try {
            $decoded = json_decode(base64_decode($input['code']), true);
            
            if (!$decoded || !isset($decoded['eventId'])) {
                Response::error('Invalid QR code', 400);
            }
            
            // Check timestamp (valid for 24 hours)
            if (isset($decoded['timestamp']) && (time() - $decoded['timestamp']) > 86400) {
                Response::error('QR code expired', 400);
            }
            
            // Verify event exists
            $event = Database::fetchOne(
                'SELECT * FROM "Events" WHERE id = ?',
                [$decoded['eventId']]
            );
            
            if (!$event) {
                Response::error('Event not found', 404);
            }
            
            // Record attendance
            $attendanceId = $this->generateId();
            Database::query(
                'INSERT INTO "Attendances" (id, "userID", "eventID", cw, attended, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
                [$attendanceId, $user['id'], $decoded['eventId'], (int)date('W'), true]
            );
            
            Response::json([
                'success' => true,
                'message' => 'Teilnahme erfolgreich erfasst',
                'event' => $event,
                'attendanceId' => $attendanceId
            ]);
            
        } catch (\Exception $e) {
            Response::error('Invalid QR code format: ' . $e->getMessage(), 400);
        }
    }
    
    private function generateQRCodeImage(string $data, int $size): \GdImage
    {
        // Simple QR code placeholder - in production, use a proper QR library
        $image = imagecreatetruecolor($size, $size);
        $white = imagecolorallocate($image, 255, 255, 255);
        $black = imagecolorallocate($image, 0, 0, 0);
        
        imagefill($image, 0, 0, $white);
        
        // Draw a simple pattern (this is a placeholder - use a real QR library in production)
        $text = "QR: " . substr($data, 0, 20) . "...";
        imagestring($image, 5, 10, $size / 2, $text, $black);
        
        // Add border
        imagerectangle($image, 0, 0, $size - 1, $size - 1, $black);
        
        return $image;
    }
    
    private function generateId(): string
    {
        // Generate a CUID-like ID
        return 'c' . bin2hex(random_bytes(12));
    }
}
