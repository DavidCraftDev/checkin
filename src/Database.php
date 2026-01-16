<?php

require_once 'Config.php';

class Database {
    private static $instance = null;
    private $pdo;

    private function __construct() {
        $connectionString = getenv('POSTGRES_URL');
        if (!$connectionString) {
            throw new Exception("POSTGRES_URL environment variable is not set.");
        }

        $params = parse_url($connectionString);

        $host = $params['host'];
        $port = isset($params['port']) ? $params['port'] : 5432;
        $user = $params['user'];
        $pass = $params['pass'];
        $dbname = ltrim($params['path'], '/');

        $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";

        try {
            $this->pdo = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            die("Connection failed: " . $e->getMessage());
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->pdo;
    }

    public function query($sql, $params = []) {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }
}
