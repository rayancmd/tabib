<?php
require_once '../includes/config.php';
require_once '../includes/functions.php';

checkAuth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $doctorId = (int)($_POST['doctor_id'] ?? 0);
        $patientId = $_SESSION['user_id'];
        $date = $_POST['date'] ?? '';
        $reason = sanitizeInput($_POST['reason'] ?? '');

        // Validate input
        if (!$doctorId || empty($date)) {
            throw new Exception('Doctor and date are required');
        }

        // Validate date format and future date
        $dateValidation = validateAppointmentDate($date);
        if ($dateValidation !== true) {
            throw new Exception($dateValidation);
        }

        // Check if doctor exists and is a doctor
        $stmt = $pdo->prepare("SELECT u.id, u.name, d.specialty FROM users u JOIN doctors d ON u.id = d.user_id WHERE u.id = ? AND u.role = 'doctor'");
        $stmt->execute([$doctorId]);
        $doctor = $stmt->fetch();
        
        if (!$doctor) {
            throw new Exception('Doctor not found');
        }

        // Check for conflicting appointments (same doctor, same time)
        $stmt = $pdo->prepare("SELECT id FROM appointments WHERE doctor_id = ? AND date = ? AND status != 'cancelled'");
        $stmt->execute([$doctorId, $date]);
        if ($stmt->rowCount() > 0) {
            throw new Exception('This time slot is not available');
        }

        // Check if patient already has appointment at this time
        $stmt = $pdo->prepare("SELECT id FROM appointments WHERE patient_id = ? AND date = ? AND status != 'cancelled'");
        $stmt->execute([$patientId, $date]);
        if ($stmt->rowCount() > 0) {
            throw new Exception('You already have an appointment at this time');
        }

        // Insert appointment
        $stmt = $pdo->prepare("INSERT INTO appointments (doctor_id, patient_id, date, reason, status) VALUES (?, ?, ?, ?, 'pending')");
        $stmt->execute([$doctorId, $patientId, $date, $reason]);
        $appointmentId = $pdo->lastInsertId();

        sendJsonResponse([
            'success' => true,
            'appointment_id' => $appointmentId,
            'message' => 'Appointment booked successfully',
            'appointment' => [
                'id' => $appointmentId,
                'doctor_name' => $doctor['name'],
                'specialty' => $doctor['specialty'],
                'date' => $date,
                'reason' => $reason,
                'status' => 'pending'
            ]
        ]);

    } catch (Exception $e) {
        error_log("Appointment error: " . $e->getMessage());
        sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 400);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get user's appointments
    try {
        $status = $_GET['status'] ?? 'all';
        $query = "SELECT a.*, u.name AS doctor_name, d.specialty 
                  FROM appointments a
                  JOIN users u ON a.doctor_id = u.id
                  LEFT JOIN doctors d ON u.id = d.user_id
                  WHERE a.patient_id = ?";
        
        $params = [$_SESSION['user_id']];
        
        if ($status === 'upcoming') {
            $query .= " AND a.date >= NOW() AND a.status != 'cancelled'";
        } elseif ($status === 'past') {
            $query .= " AND a.date < NOW()";
        }
        
        $query .= " ORDER BY a.date DESC";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $appointments = $stmt->fetchAll();

        sendJsonResponse([
            'success' => true,
            'appointments' => $appointments
        ]);

    } catch (Exception $e) {
        sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 400);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Cancel appointment
    try {
        parse_str(file_get_contents("php://input"), $data);
        $appointmentId = (int)($data['appointment_id'] ?? 0);

        if (!$appointmentId) {
            throw new Exception('Appointment ID is required');
        }

        // Check if appointment belongs to user and can be cancelled
        $stmt = $pdo->prepare("SELECT id, date, status FROM appointments WHERE id = ? AND patient_id = ?");
        $stmt->execute([$appointmentId, $_SESSION['user_id']]);
        $appointment = $stmt->fetch();

        if (!$appointment) {
            throw new Exception('Appointment not found');
        }

        if ($appointment['status'] === 'cancelled') {
            throw new Exception('Appointment is already cancelled');
        }

        if (strtotime($appointment['date']) <= time()) {
            throw new Exception('Cannot cancel past appointments');
        }

        // Cancel appointment
        $stmt = $pdo->prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ?");
        $stmt->execute([$appointmentId]);

        sendJsonResponse([
            'success' => true,
            'message' => 'Appointment cancelled successfully'
        ]);

    } catch (Exception $e) {
        sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 400);
    }

} else {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}
?>