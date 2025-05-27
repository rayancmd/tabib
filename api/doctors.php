<?php
require_once '../includes/config.php';

// Get search parameters
$specialty = $_GET['specialty'] ?? '';
$wilaya = $_GET['wilaya'] ?? '';
$search = $_GET['search'] ?? '';

// Build query
$query = "SELECT * FROM doctors WHERE 1=1";
$params = [];

if (!empty($specialty)) {
    $query .= " AND specialty = ?";
    $params[] = $specialty;
}

if (!empty($wilaya)) {
    $query .= " AND wilaya = ?";
    $params[] = $wilaya;
}

if (!empty($search)) {
    $query .= " AND (name LIKE ? OR city LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

// Execute
$stmt = $pdo->prepare($query);
$stmt->execute($params);
$doctors = $stmt->fetchAll();

// Return JSON
echo json_encode($doctors);
?>