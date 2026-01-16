<?php

namespace CheckIn\Services;

use CheckIn\Core\Config;

class EmailNotification
{
    private string $from;

    public function __construct()
    {
        $this->from = Config::get('EMAIL.FROM', 'noreply@checkin.local');
    }

    public function sendAttendanceReminder(array $user, array $event): bool
    {
        if (!isset($user['email']) || empty($user['email'])) {
            return false;
        }

        $subject = 'Erinnerung: Anwesenheit erfassen - ' . $event['type'];
        $body = $this->getAttendanceReminderTemplate($user, $event);

        return $this->send($user['email'], $subject, $body);
    }

    public function sendEventNotification(array $users, array $event): int
    {
        $sent = 0;
        foreach ($users as $user) {
            if (!isset($user['email']) || empty($user['email'])) {
                continue;
            }

            $subject = 'Neue Veranstaltung: ' . $event['type'];
            $body = $this->getEventNotificationTemplate($user, $event);

            if ($this->send($user['email'], $subject, $body)) {
                $sent++;
            }
        }
        return $sent;
    }

    private function send(string $to, string $subject, string $body): bool
    {
        try {
            $headers = [
                'From: ' . $this->from,
                'X-Mailer: CheckIN PHP',
                'MIME-Version: 1.0',
                'Content-Type: text/html; charset=UTF-8'
            ];

            return mail($to, $subject, $body, implode("\r\n", $headers));
        } catch (\Exception $e) {
            error_log('Email error: ' . $e->getMessage());
            return false;
        }
    }

    private function getAttendanceReminderTemplate(array $user, array $event): string
    {
        return "<!DOCTYPE html><html><body><h2>Hallo {$user['displayname']},</h2><p>Veranstaltung: {$event['type']}, KW: {$event['cw']}</p></body></html>";
    }

    private function getEventNotificationTemplate(array $user, array $event): string
    {
        return "<!DOCTYPE html><html><body><h2>Hallo {$user['displayname']},</h2><p>Neue Veranstaltung: {$event['type']}, KW: {$event['cw']}</p></body></html>";
    }
}
