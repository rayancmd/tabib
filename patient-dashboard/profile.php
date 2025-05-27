<?php
require_once '../../includes/config.php';
require_once '../../includes/functions.php';

checkAuth();
if ($_SESSION['user_role'] !== 'patient') {
    header("Location: /login.php");
    exit;
}

// Fetch current profile
$stmt = $pdo->prepare("SELECT * FROM patients WHERE user_id = ?");
$stmt->execute([$_SESSION['user_id']]);
$profile = $stmt->fetch();

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = sanitizeInput($_POST['name']);
    $phone = sanitizeInput($_POST['phone']);
    $birthdate = $_POST['birthdate'];
    $blood_type = $_POST['blood_type'] ?? null;
    $address = sanitizeInput($_POST['address']);
    $city = sanitizeInput($_POST['city']);
    $wilaya = $_POST['wilaya'];

    // Validate
    $errors = [];
    if (empty($name)) $errors[] = "Le nom complet est requis";
    if (!empty($birthdate) && !empty($birthdate)) $errors[] = "Date de naissance invalide";

    if (empty($errors)) {
        try {
            $pdo->beginTransaction();
            
            // Update users table
            $stmt = $pdo->prepare("UPDATE users SET name = ? WHERE id = ?");
            $stmt->execute([$name, $_SESSION['user_id']]);
            
            // Update patients table
            if ($profile) {
                $stmt = $pdo->prepare("UPDATE patients SET phone=?, birthdate=?, blood_type=?, address=?, city=?, wilaya=? WHERE user_id=?");
                $stmt->execute([$phone, $birthdate, $blood_type, $address, $city, $wilaya, $_SESSION['user_id']]);
            } else {
                $stmt = $pdo->prepare("INSERT INTO patients (user_id, phone, birthdate, blood_type, address, city, wilaya) VALUES (?,?,?,?,?,?,?)");
                $stmt->execute([$_SESSION['user_id'], $phone, $birthdate, $blood_type, $address, $city, $wilaya]);
            }
            
            $pdo->commit();
            $_SESSION['flash'] = ['type' => 'success', 'message' => 'Profil mis à jour avec succès'];
            header("Location: profile.php");
            exit;
        } catch (PDOException $e) {
            $pdo->rollBack();
            $errors[] = "Erreur de base de données: " . $e->getMessage();
        }
    }
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Mon Profil | TabiibDZ</title>
    <link rel="stylesheet" href="/assets/css/patient-dashboard.css">
    <style>
        .profile-form .form-group {
            margin-bottom: 20px;
        }
        .form-row {
            display: flex;
            gap: 20px;
        }
        .form-row .form-group {
            flex: 1;
        }
        .blood-type-select {
            display: flex;
            gap: 10px;
        }
        .blood-type-select label {
            display: flex;
            align-items: center;
            gap: 5px;
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <?php include '_sidebar.php'; ?>

        <main class="main-content">
            <h1>Mon Profil</h1>
            
            <?php if (isset($_SESSION['flash'])): ?>
                <div class="flash-message <?= $_SESSION['flash']['type'] ?>">
                    <?= $_SESSION['flash']['message'] ?>
                </div>
                <?php unset($_SESSION['flash']); ?>
            <?php endif; ?>

            <?php if (!empty($errors)): ?>
                <div class="flash-message error">
                    <?php foreach ($errors as $error): ?>
                        <p><?= $error ?></p>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>

            <div class="card profile-form">
                <form method="POST">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="name">Nom complet*</label>
                            <input type="text" id="name" name="name" 
                                   value="<?= htmlspecialchars($profile['name'] ?? $_SESSION['user_name']) ?>" required>
                        </div>
                        <div class="form-group">
                            <label for="phone">Téléphone</label>
                            <input type="tel" id="phone" name="phone" 
                                   value="<?= htmlspecialchars($profile['phone'] ?? '') ?>">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="birthdate">Date de naissance</label>
                            <input type="date" id="birthdate" name="birthdate" 
                                   value="<?= htmlspecialchars($profile['birthdate'] ?? '') ?>">
                        </div>
                        <div class="form-group">
                            <label>Groupe sanguin</label>
                            <div class="blood-type-select">
                                <?php 
                                $bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
                                foreach ($bloodTypes as $type): ?>
                                    <label>
                                        <input type="radio" name="blood_type" value="<?= $type ?>" 
                                            <?= ($profile['blood_type'] ?? '') === $type ? 'checked' : '' ?>>
                                        <?= $type ?>
                                    </label>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="address">Adresse</label>
                        <input type="text" id="address" name="address" 
                               value="<?= htmlspecialchars($profile['address'] ?? '') ?>">
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="city">Ville</label>
                            <input type="text" id="city" name="city" 
                                   value="<?= htmlspecialchars($profile['city'] ?? '') ?>">
                        </div>
                        <div class="form-group">
                            <label for="wilaya">Wilaya</label>
                            <select id="wilaya" name="wilaya">
                                <option value="">Sélectionnez</option>
                                <?php
                                $wilayas = include '../../data/wilayas.php'; // Array of Algerian wilayas
                                foreach ($wilayas as $code => $name): ?>
                                    <option value="<?= $code ?>" 
                                        <?= ($profile['wilaya'] ?? '') == $code ? 'selected' : '' ?>>
                                        <?= $name ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Enregistrer
                    </button>
                </form>
            </div>

            <div class="card">
                <h2>Changer le mot de passe</h2>
                <form id="passwordForm" method="POST" action="/api/auth.php?action=change_password">
                    <div class="form-group">
                        <label for="current_password">Mot de passe actuel*</label>
                        <input type="password" id="current_password" name="current_password" required>
                    </div>
                    <div class="form-group">
                        <label for="new_password">Nouveau mot de passe*</label>
                        <input type="password" id="new_password" name="new_password" minlength="8" required>
                    </div>
                    <div class="form-group">
                        <label for="confirm_password">Confirmer le mot de passe*</label>
                        <input type="password" id="confirm_password" name="confirm_password" required>
                    </div>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-key"></i> Mettre à jour
                    </button>
                </form>
            </div>
        </main>
    </div>

    <script src="/assets/js/profile.js"></script>
</body>
</html>