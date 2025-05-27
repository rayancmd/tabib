<?php
require_once '../includes/config.php';
require_once '../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? $_GET['action'] ?? '';
    
    try {
        if ($action === 'register') {
            // Validate required fields
            $required = ['name', 'email', 'password', 'confirm_password'];
            foreach ($required as $field) {
                if (empty($_POST[$field])) {
                    throw new Exception("Field $field is required");
                }
            }

            $name = sanitizeInput($_POST['name']);
            $email = sanitizeInput($_POST['email']);
            $password = $_POST['password'];
            $confirmPassword = $_POST['confirm_password'];
            $phone = sanitizeInput($_POST['phone'] ?? '');

            // Validate email
            if (!validateEmail($email)) {
                throw new Exception("Invalid email format");
            }

            // Check password match
            if ($password !== $confirmPassword) {
                throw new Exception("Passwords do not match");
            }

            // Check password strength
            if (strlen($password) < 8) {
                throw new Exception("Password must be at least 8 characters");
            }

            // Check if email exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->rowCount() > 0) {
                throw new Exception("Email already registered");
            }

            // Start transaction
            $pdo->beginTransaction();

            // Insert user
            $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'patient')");
            $stmt->execute([$name, $email, password_hash($password, PASSWORD_BCRYPT)]);
            $userId = $pdo->lastInsertId();

            // Insert patient profile
            $stmt = $pdo->prepare("INSERT INTO patients (user_id, phone) VALUES (?, ?)");
            $stmt->execute([$userId, $phone]);

            $pdo->commit();

            sendJsonResponse([
                'success' => true,
                'message' => 'Registration successful'
            ]);

        } elseif ($action === 'login') {
            $email = sanitizeInput($_POST['email'] ?? '');
            $password = $_POST['password'] ?? '';

            if (empty($email) || empty($password)) {
                throw new Exception("Email and password are required");
            }

            // Find user
            $stmt = $pdo->prepare("SELECT id, name, email, password, role FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if (!$user || !password_verify($password, $user['password'])) {
                throw new Exception("Invalid credentials");
            }

            // Set session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_role'] = $user['role'];

            sendJsonResponse([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role']
                ]
            ]);

        } elseif ($action === 'logout') {
            session_destroy();
            sendJsonResponse(['success' => true, 'message' => 'Logged out successfully']);

        } elseif ($action === 'change_password') {
            checkAuth();
            
            $currentPassword = $_POST['current_password'] ?? '';
            $newPassword = $_POST['new_password'] ?? '';
            $confirmPassword = $_POST['confirm_password'] ?? '';

            if (empty($currentPassword) || empty($newPassword) || empty($confirmPassword)) {
                throw new Exception("All password fields are required");
            }

            if ($newPassword !== $confirmPassword) {
                throw new Exception("New passwords do not match");
            }

            if (strlen($newPassword) < 8) {
                throw new Exception("New password must be at least 8 characters");
            }

            // Verify current password
            $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch();

            if (!password_verify($currentPassword, $user['password'])) {
                throw new Exception("Current password is incorrect");
            }

            // Update password
            $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
            $stmt->execute([password_hash($newPassword, PASSWORD_BCRYPT), $_SESSION['user_id']]);

            sendJsonResponse(['success' => true, 'message' => 'Password updated successfully']);

        } else {
            throw new Exception("Invalid action");
        }

    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        
        error_log("Auth error: " . $e->getMessage());
        sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 400);
    }
} else {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}
?>