<?php
// ============================================================
// db.php — Unibot Database Connection
// ============================================================
define('DB_HOST', 'localhost');
define('DB_USER', 'root');        // Change in production
define('DB_PASS', '');            // Change in production
define('DB_NAME', 'unibot_db');

function getDB(): mysqli {
    static $db = null;
    if ($db === null) {
        $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if ($db->connect_error) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed: ' . $db->connect_error]);
            exit;
        }
        $db->set_charset('utf8mb4');
    }
    return $db;
}
