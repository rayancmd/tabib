<?php
require_once '../../includes/config.php';
require_once '../../includes/functions.php';

checkAuth();
if ($_SESSION['user_role'] !== 'doctor') {
    header("Location: /login.php");
    exit;
}

// Handle actions
$action = $_GET['action'] ?? '';
$appointmentId = $_GET['id'] ?? 0;

if ($action === 'confirm' && $appointmentId) {
    $stmt = $pdo->prepare("UPDATE appointments SET status = 'confirmed' WHERE id = ? AND doctor_id = ?");
    $stmt->execute([$appointmentId, $_SESSION['user_id']]);
    $_SESSION['flash'] = ['type' => 'success', 'message' => 'Rendez-vous confirmé'];
    header("Location: appointments.php");
    exit;
}

// Fetch all appointments
$statusFilter = $_GET['status'] ?? 'upcoming';
$query = "SELECT a.*, u.name AS patient_name 
          FROM appointments a
          JOIN users u ON a.patient_id = u.id
          WHERE a.doctor_id = ?";

if ($statusFilter === 'upcoming') {
    $query .= " AND a.date >= NOW() ORDER BY a.date ASC";
} else {
    $query .= " AND a.date < NOW() ORDER BY a.date DESC";
}

$appointments = $pdo->prepare($query);
$appointments->execute([$_SESSION['user_id']]);
?>

