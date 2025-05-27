<?php
require_once '../includes/config.php';
checkAuth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $doctorId = (int)$_POST['doctor_id'];
    $patientId = $_SESSION['user_id'];
    $date = $_POST['date']; // Format: YYYY-MM-DD HH:MM:SS
    $reason = sanitizeInput($_POST['reason']);

    // Validate
    if (!$doctorId || !$date) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input']);
        exit;
    }

    // Check doctor exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ? AND role = 'doctor'");
    $stmt->execute([$doctorId]);
    
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Doctor not found']);
        exit;
    }

    // Insert appointment
    $stmt = $pdo->prepare("INSERT INTO appointments (doctor_id, patient_id, date, reason) VALUES (?, ?, ?, ?)");
    $stmt->execute([$doctorId, $patientId, $date, $reason]);

    echo json_encode(['success' => true, 'appointment_id' => $pdo->lastInsertId()]);
}
?>