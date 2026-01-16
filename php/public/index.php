<?php
/**
 * CheckIN PHP - Main entry point
 */

require_once __DIR__ . '/../vendor/autoload.php';

use CheckIn\Core\Router;
use CheckIn\Core\Database;
use CheckIn\Core\Config;
use CheckIn\Core\Response;
use CheckIn\Core\SecurityHeaders;
use CheckIn\Core\RateLimiter;

// Apply security headers
SecurityHeaders::apply();

// Initialize configuration
Config::init();

// Rate limiting for all requests
RateLimiter::requireLimit(RateLimiter::getClientIdentifier());

// Initialize database connection
try {
    Database::connect();
} catch (Exception $e) {
    Response::json(['error' => 'Database connection failed'], 500);
    exit;
}

// Create router instance
$router = new Router();

// Define routes
$router->get('/', 'CheckIn\Controllers\HomeController@index');
$router->get('/health', 'CheckIn\Controllers\HealthController@check');
$router->get('/api/v1/overview/user', 'CheckIn\Controllers\Api\UserOverviewController@get');
$router->get('/api/v1/overview/group', 'CheckIn\Controllers\Api\GroupOverviewController@get');
$router->post('/login', 'CheckIn\Controllers\AuthController@login');
$router->post('/logout', 'CheckIn\Controllers\AuthController@logout');

// Event routes
$router->get('/api/v1/events', 'CheckIn\Controllers\Api\EventsController@list');
$router->post('/api/v1/events', 'CheckIn\Controllers\Api\EventsController@create');
$router->get('/api/v1/events/*', 'CheckIn\Controllers\Api\EventsController@get');
$router->delete('/api/v1/events/*', 'CheckIn\Controllers\Api\EventsController@delete');

// QR Code routes
$router->get('/api/v1/qr/generate/*', 'CheckIn\Controllers\Api\QRCodeController@generate');
$router->post('/api/v1/qr/validate', 'CheckIn\Controllers\Api\QRCodeController@validate');

// Export routes
$router->get('/api/v1/export/user', 'CheckIn\Controllers\Api\ExportController@exportUserData');
$router->get('/api/v1/export/group', 'CheckIn\Controllers\Api\ExportController@exportGroupData');

// Advanced features routes
$router->post('/api/v1/advanced/email', 'CheckIn\Controllers\Api\AdvancedController@sendEmail');
$router->get('/api/v1/advanced/untis', 'CheckIn\Controllers\Api\AdvancedController@syncUntis');
$router->get('/api/v1/advanced/pdf', 'CheckIn\Controllers\Api\AdvancedController@exportPDF');
$router->get('/api/v1/advanced/report', 'CheckIn\Controllers\Api\AdvancedController@getAdvancedReport');

// Dispatch the request
$router->dispatch();
