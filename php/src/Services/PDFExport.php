<?php

namespace CheckIn\Services;

use CheckIn\Core\Database;

class PDFExport
{
    public function generateAttendanceReport(string $userID, int $startCW, int $endCW, int $year): string
    {
        // Fetch user data
        $user = Database::fetchOne('SELECT * FROM "User" WHERE id = ?', [$userID]);
        if (!$user) {
            throw new \Exception('User not found');
        }

        // Fetch attendances
        $attendances = Database::fetchAll(
            'SELECT a.*, e.type as event_type 
             FROM "Attendances" a 
             LEFT JOIN "Events" e ON a."eventID" = e.id 
             WHERE a."userID" = ? AND a.cw BETWEEN ? AND ?
             ORDER BY a.cw ASC',
            [$userID, $startCW, $endCW]
        );

        // Generate HTML for PDF
        $html = $this->generateHTML($user, $attendances, $startCW, $endCW, $year);

        // Simple PDF generation using HTML
        return $this->htmlToPDF($html, "attendance_{$user['username']}_{$year}.pdf");
    }

    private function generateHTML(array $user, array $attendances, int $startCW, int $endCW, int $year): string
    {
        $totalCount = count($attendances);
        $attendedCount = count(array_filter($attendances, fn($a) => $a['attended']));

        $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
        .header { background: #f9fafb; padding: 20px; margin-bottom: 30px; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #2563eb; color: white; }
        tr:nth-child(even) { background: #f9fafb; }
        .stats { display: flex; gap: 20px; margin-top: 20px; }
        .stat-box { flex: 1; background: #e0e7ff; padding: 15px; border-radius: 4px; text-align: center; }
        .stat-value { font-size: 2em; font-weight: bold; color: #2563eb; }
        .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 0.9em; }
    </style>
</head>
<body>
    <h1>Anwesenheitsbericht</h1>
    
    <div class="header">
        <p><strong>Name:</strong> {$user['displayname']}</p>
        <p><strong>Benutzername:</strong> {$user['username']}</p>
        <p><strong>Zeitraum:</strong> KW {$startCW} - {$endCW}, {$year}</p>
        <p><strong>Erstellt am:</strong> {$this->formatDate(date('Y-m-d H:i:s'))}</p>
    </div>

    <div class="stats">
        <div class="stat-box">
            <div class="stat-value">{$totalCount}</div>
            <div>Gesamt</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">{$attendedCount}</div>
            <div>Teilgenommen</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">{$this->calculatePercentage($attendedCount, $totalCount)}%</div>
            <div>Quote</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Datum</th>
                <th>KW</th>
                <th>Typ</th>
                <th>Status</th>
                <th>Feedback</th>
            </tr>
        </thead>
        <tbody>
HTML;

        foreach ($attendances as $att) {
            $status = $att['attended'] ? 'Teilgenommen' : 'Nicht teilgenommen';
            $feedback = $att['feedback'] ?? '-';
            $html .= <<<ROW
            <tr>
                <td>{$this->formatDate($att['created_at'])}</td>
                <td>{$att['cw']}</td>
                <td>{$att['event_type']}</td>
                <td>{$status}</td>
                <td>{$feedback}</td>
            </tr>
ROW;
        }

        $html .= <<<HTML
        </tbody>
    </table>

    <div class="footer">
        <p>CheckIN Anwesenheitssystem - Generiert mit PHP</p>
    </div>
</body>
</html>
HTML;

        return $html;
    }

    private function htmlToPDF(string $html, string $filename): string
    {
        // For production, use a library like TCPDF, mPDF, or Dompdf
        // This is a simplified version that returns HTML
        // In a real implementation, you would convert HTML to PDF

        $pdfPath = sys_get_temp_dir() . '/' . $filename;
        file_put_contents($pdfPath . '.html', $html);
        
        return $pdfPath . '.html';
    }

    private function formatDate(string $date): string
    {
        return date('d.m.Y H:i', strtotime($date));
    }

    private function calculatePercentage(int $part, int $total): int
    {
        if ($total === 0) return 0;
        return (int)round(($part / $total) * 100);
    }
}
