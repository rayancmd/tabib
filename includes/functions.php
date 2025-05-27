<?php
function sanitizeInput($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Authentication check
function checkAuth() {
    if (!isset($_SESSION['user_id'])) {
        if (strpos($_SERVER['REQUEST_URI'], '/api/') !== false) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            exit;
        } else {
            header("Location: /login.php");
            exit;
        }
    }
}

// Check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

// Get current user data
function getCurrentUser($pdo) {
    if (!isLoggedIn()) return null;
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    return $stmt->fetch();
}

// CSRF Protection
function generateCsrfToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCsrfToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// Format date for display
function formatDate($date, $format = 'd/m/Y H:i') {
    return date($format, strtotime($date));
}

// Send JSON response
function sendJsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// Validate appointment date
function validateAppointmentDate($date) {
    $appointmentDate = new DateTime($date);
    $now = new DateTime();
    
    // Check if date is in the future
    if ($appointmentDate <= $now) {
        return "Date must be in the future";
    }
    
    // Check if it's not a weekend (optional)
    $dayOfWeek = $appointmentDate->format('N');
    if ($dayOfWeek >= 6) {
        return "Weekend appointments not available";
    }
    
    return true;
}

// Get Algerian wilayas
function getWilayas() {
    return [
        "1" => "Adrar", "2" => "Chlef", "3" => "Laghouat", "4" => "Oum El Bouaghi",
        "5" => "Batna", "6" => "Béjaïa", "7" => "Biskra", "8" => "Béchar",
        "9" => "Blida", "10" => "Bouira", "11" => "Tamanrasset", "12" => "Tébessa",
        "13" => "Tlemcen", "14" => "Tiaret", "15" => "Tizi Ouzou", "16" => "Alger",
        "17" => "Djelfa", "18" => "Jijel", "19" => "Sétif", "20" => "Saïda",
        "21" => "Skikda", "22" => "Sidi Bel Abbès", "23" => "Annaba", "24" => "Guelma",
        "25" => "Constantine", "26" => "Médéa", "27" => "Mostaganem", "28" => "M'Sila",
        "29" => "Mascara", "30" => "Ouargla", "31" => "Oran", "32" => "El Bayadh",
        "33" => "Illizi", "34" => "Bordj Bou Arreridj", "35" => "Boumerdès",
        "36" => "El Tarf", "37" => "Tindouf", "38" => "Tissemsilt", "39" => "El Oued",
        "40" => "Khenchela", "41" => "Souk Ahras", "42" => "Tipaza", "43" => "Mila",
        "44" => "Aïn Defla", "45" => "Naâma", "46" => "Aïn Témouchent",
        "47" => "Ghardaïa", "48" => "Relizane"
    ];
}
?>