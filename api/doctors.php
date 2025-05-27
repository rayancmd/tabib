<?php
require_once '../includes/config.php';
require_once '../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Get search parameters
        $specialty = sanitizeInput($_GET['specialty'] ?? '');
        $wilaya = sanitizeInput($_GET['wilaya'] ?? '');
        $search = sanitizeInput($_GET['search'] ?? '');
        $availability = sanitizeInput($_GET['availability'] ?? '');
        $telemedicine = isset($_GET['telemedicine']) ? 1 : 0;
        $emergency = isset($_GET['emergency']) ? 1 : 0;
        $cnam = isset($_GET['cnam']) ? 1 : 0;
        $maxPrice = (float)($_GET['max_price'] ?? 10000);
        $sortBy = sanitizeInput($_GET['sort_by'] ?? 'rating');

        // Build query
        $query = "SELECT u.id, u.name, d.specialty, d.consultation_fee, d.phone, d.address, 
                         d.city, d.wilaya, d.languages, d.telemedicine, d.emergency, d.cnam, 
                         d.bio, d.rating, d.reviews_count, d.available_today
                  FROM users u 
                  JOIN doctors d ON u.id = d.user_id 
                  WHERE u.role = 'doctor'";
        
        $params = [];

        // Add filters
        if (!empty($specialty)) {
            $query .= " AND d.specialty LIKE ?";
            $params[] = "%$specialty%";
        }

        if (!empty($wilaya)) {
            $query .= " AND d.wilaya = ?";
            $params[] = $wilaya;
        }

        if (!empty($search)) {
            $query .= " AND (u.name LIKE ? OR d.specialty LIKE ? OR d.city LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        if ($availability === 'today') {
            $query .= " AND d.available_today = 1";
        }

        if ($telemedicine) {
            $query .= " AND d.telemedicine = 1";
        }

        if ($emergency) {
            $query .= " AND d.emergency = 1";
        }

        if ($cnam) {
            $query .= " AND d.cnam = 1";
        }

        if ($maxPrice < 10000) {
            $query .= " AND d.consultation_fee <= ?";
            $params[] = $maxPrice;
        }

        // Add sorting
        switch ($sortBy) {
            case 'rating_desc':
                $query .= " ORDER BY d.rating DESC, d.reviews_count DESC";
                break;
            case 'rating_asc':
                $query .= " ORDER BY d.rating ASC";
                break;
            case 'price_desc':
                $query .= " ORDER BY d.consultation_fee DESC";
                break;
            case 'price_asc':
                $query .= " ORDER BY d.consultation_fee ASC";
                break;
            case 'availability':
                $query .= " ORDER BY d.available_today DESC, d.rating DESC";
                break;
            default:
                $query .= " ORDER BY d.rating DESC, d.reviews_count DESC";
        }

        // Execute query
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $doctors = $stmt->fetchAll();

        // Process languages JSON
        foreach ($doctors as &$doctor) {
            if ($doctor['languages']) {
                $doctor['languages'] = json_decode($doctor['languages'], true);
            } else {
                $doctor['languages'] = ['fr'];
            }
        }

        sendJsonResponse([
            'success' => true,
            'doctors' => $doctors,
            'count' => count($doctors)
        ]);

    } catch (Exception $e) {
        error_log("Doctors API error: " . $e->getMessage());
        sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get doctor details (for appointment modal)
    checkAuth();
    
    try {
        $doctorId = (int)($_POST['doctor_id'] ?? 0);
        
        if (!$doctorId) {
            throw new Exception('Doctor ID is required');
        }

        $stmt = $pdo->prepare("
            SELECT u.id, u.name, d.specialty, d.consultation_fee, d.phone, d.address, 
                   d.city, d.wilaya, d.languages, d.telemedicine, d.emergency, d.cnam, 
                   d.bio, d.rating, d.reviews_count
            FROM users u 
            JOIN doctors d ON u.id = d.user_id 
            WHERE u.id = ? AND u.role = 'doctor'
        ");
        $stmt->execute([$doctorId]);
        $doctor = $stmt->fetch();

        if (!$doctor) {
            throw new Exception('Doctor not found');
        }

        // Process languages
        if ($doctor['languages']) {
            $doctor['languages'] = json_decode($doctor['languages'], true);
        } else {
            $doctor['languages'] = ['fr'];
        }

        // Get available slots for next 30 days (simplified)
        $availableSlots = [];
        $startDate = new DateTime();
        for ($i = 1; $i <= 30; $i++) {
            $date = clone $startDate;
            $date->add(new DateInterval("P{$i}D"));
            
            // Skip weekends
            if ($date->format('N') >= 6) continue;
            
            $dateStr = $date->format('Y-m-d');
            
            // Check existing appointments
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM appointments WHERE doctor_id = ? AND DATE(date) = ? AND status != 'cancelled'");
            $stmt->execute([$doctorId, $dateStr]);
            $appointmentCount = $stmt->fetchColumn();
            
            // Assume 8 slots per day max
            if ($appointmentCount < 8) {
                $availableSlots[$dateStr] = [
                    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'
                ];
                
                // Remove booked slots
                $stmt = $pdo->prepare("SELECT TIME(date) FROM appointments WHERE doctor_id = ? AND DATE(date) = ? AND status != 'cancelled'");
                $stmt->execute([$doctorId, $dateStr]);
                $bookedTimes = $stmt->fetchAll(PDO::FETCH_COLUMN);
                
                foreach ($bookedTimes as $bookedTime) {
                    $key = array_search($bookedTime, $availableSlots[$dateStr]);
                    if ($key !== false) {
                        unset($availableSlots[$dateStr][$key]);
                    }
                }
                
                $availableSlots[$dateStr] = array_values($availableSlots[$dateStr]);
                
                // Remove date if no slots available
                if (empty($availableSlots[$dateStr])) {
                    unset($availableSlots[$dateStr]);
                }
            }
        }

        sendJsonResponse([
            'success' => true,
            'doctor' => $doctor,
            'available_slots' => $availableSlots
        ]);

    } catch (Exception $e) {
        sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 400);
    }

} else {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}
?>