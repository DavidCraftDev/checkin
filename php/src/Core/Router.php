<?php

namespace CheckIn\Core;

class Router
{
    private array $routes = [];

    public function get(string $path, string $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }

    public function post(string $path, string $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }

    public function delete(string $path, string $handler): void
    {
        $this->addRoute('DELETE', $path, $handler);
    }

    public function put(string $path, string $handler): void
    {
        $this->addRoute('PUT', $path, $handler);
    }

    public function patch(string $path, string $handler): void
    {
        $this->addRoute('PATCH', $path, $handler);
    }

    private function addRoute(string $method, string $path, string $handler): void
    {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler
        ];
    }

    public function dispatch(): void
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        foreach ($this->routes as $route) {
            if ($route['method'] === $method && $this->matchPath($route['path'], $path)) {
                $this->callHandler($route['handler']);
                return;
            }
        }

        Response::error('Not Found', 404);
    }

    private function matchPath(string $routePath, string $requestPath): bool
    {
        // Exact match
        if ($routePath === $requestPath) {
            return true;
        }
        
        // Wildcard match (e.g., /api/v1/events/* matches /api/v1/events/123)
        if (strpos($routePath, '*') !== false) {
            $pattern = str_replace('/', '\/', $routePath);
            $pattern = str_replace('*', '.*', $pattern);
            $pattern = '/^' . $pattern . '$/';
            return preg_match($pattern, $requestPath) === 1;
        }
        
        return false;
    }

    private function callHandler(string $handler): void
    {
        [$class, $method] = explode('@', $handler);
        
        if (!class_exists($class)) {
            Response::error('Controller not found', 500);
            return;
        }

        $controller = new $class();
        
        if (!method_exists($controller, $method)) {
            Response::error('Method not found', 500);
            return;
        }

        $controller->$method();
    }
}
