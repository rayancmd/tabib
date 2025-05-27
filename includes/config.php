<?php
if (strpos($_SERVER['REQUEST_URI'], '/api/') !== false) {
    header("Content-Type: application/json; charset=UTF-8");
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$host = 'localhost';
$db   = 'tabib'; 
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    error_log("Successfully connected to database: $db");
} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
    if (strpos($_SERVER['REQUEST_URI'], '/api/') !== false) {
        die(json_encode([
            'success' => false,
            'error' => 'Database connection failed'
        ]));
    } else {
        die('Database connection failed');
    }
}

ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 0); //
session_start();
?>