<?php
require '../includes/config.php';

error_log("New request: " . print_r($_REQUEST, true));

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    try {
        if ($_POST['action'] === 'register') {
            // Required fields
            $required = ['name', 'email', 'password', 'confirm_password'];
            foreach ($required as $field) {
                if (empty($_POST[$field])) {
                    throw new Exception("Field $field is required");
                }
            }

            // Validate email
            if (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
                throw new Exception("Invalid email format");
            }

            // Check password match
            if ($_POST['password'] !== $_POST['confirm_password']) {
                throw new Exception("Passwords do not match");
            }

            // Check if email exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$_POST['email']]);
            if ($stmt->rowCount() > 0) {
                throw new Exception("Email already registered");
            }

            // Start transaction
            $pdo->beginTransaction();

            // Insert into users table
            $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'patient')");
            $stmt->execute([
                $_POST['name'],
                $_POST['email'],
                password_hash($_POST['password'], PASSWORD_BCRYPT)
            ]);
            
            $user_id = $pdo->lastInsertId();
            error_log("New user created with ID: $user_id");

            // Insert into patients table
            $stmt = $pdo->prepare("INSERT INTO patients (user_id, phone) VALUES (?, ?)");
            $stmt->execute([
                $user_id,
                $_POST['phone'] ?? null
            ]);

            // Commit transaction
            $pdo->commit();

            // Return success
            echo json_encode([
                'success' => true,
                'user_id' => $user_id,
                'message' => 'Registration successful'
            ]);
            exit;
        }
    } catch (Exception $e) {
        // Rollback on error
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        
        error_log("Registration error: " . $e->getMessage());
        
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage(),
            'debug_info' => [
                'db_name' => $db,
                'tables' => $pdo->query("SHOW TABLES")->fetchAll()
            ]
        ]);
        exit;
    }
}
?>