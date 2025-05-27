<?php
require_once '../../includes/config.php';
require_once '../../includes/functions.php';

checkAuth();
if ($_SESSION['user_role'] !== 'doctor') {
    header("Location: /login.php");
    exit;
}

// Fetch doctor profile
$stmt = $pdo->prepare("
    SELECT u.name, d.specialty, d.consultation_fee 
    FROM users u
    JOIN doctor_profiles d ON u.id = d.user_id
    WHERE u.id = ?
");
$stmt->execute([$_SESSION['user_id']]);
$doctor = $stmt->fetch();

// Today's appointments
$today = date('Y-m-d');
$appointments = $pdo->prepare("
    SELECT a.*, u.name AS patient_name 
    FROM appointments a
    JOIN users u ON a.patient_id = u.id
    WHERE a.doctor_id = ? 
    AND DATE(a.date) = ?
    ORDER BY a.date ASC
");
$appointments->execute([$_SESSION['user_id'], $today]);
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Tableau de Bord Médecin | TabiibDZ</title>
    <link rel="stylesheet" href="/assets/css/doctor-dashboard.css">
</head>
<body>
    <div class="dashboard-container">
        <?php include '_sidebar.php'; ?>

        <main class="main-content">
            <div class="welcome-section">
                <h1>Bonjour, Dr. <?= htmlspecialchars($doctor['name']) ?></h1>
                <p class="specialty"><?= $doctor['specialty'] ?></p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Rendez-vous Aujourd'hui</h3>
                    <p class="count"><?= $appointments->rowCount() ?></p>
                </div>
                <div class="stat-card">
                    <h3>Frais de Consultation</h3>
                    <p class="count"><?= $doctor['consultation_fee'] ?> DA</p>
                </div>
                <div class="stat-card">
                    <h3>Patients Ce Mois</h3>
                    <p class="count">
                        <?php 
                        $patients = $pdo->query("
                            SELECT COUNT(DISTINCT patient_id) 
                            FROM appointments 
                            WHERE doctor_id = {$_SESSION['user_id']}
                            AND MONTH(date) = MONTH(CURRENT_DATE())
                        ")->fetchColumn();
                        echo $patients;
                        ?>
                    </p>
                </div>
            </div>

            <div class="card today-appointments">
                <h2><i class="fas fa-calendar-day"></i> Rendez-vous Aujourd'hui</h2>
                <?php if ($appointments->rowCount() > 0): ?>
                    <div class="appointments-list">
                        <?php while ($appt = $appointments->fetch()): ?>
                            <div class="appointment">
                                <div class="patient-info">
                                    <h3><?= htmlspecialchars($appt['patient_name']) ?></h3>
                                    <p><?= date('H:i', strtotime($appt['date'])) ?></p>
                                </div>
                                <div class="appointment-actions">
                                    <a href="appointments.php?action=view&id=<?= $appt['id'] ?>" 
                                       class="btn btn-sm">
                                        <i class="fas fa-eye"></i> Détails
                                    </a>
                                    <?php if ($appt['status'] === 'pending'): ?>
                                        <a href="appointments.php?action=confirm&id=<?= $appt['id'] ?>" 
                                           class="btn btn-sm btn-primary">
                                            <i class="fas fa-check"></i> Confirmer
                                        </a>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php endwhile; ?>
                    </div>
                <?php else: ?>
                    <p class="empty-state">Aucun rendez-vous aujourd'hui</p>
                <?php endif; ?>
            </div>
        </main>
    </div>
</body>
</html>