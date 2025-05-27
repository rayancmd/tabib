<?php
require_once '../../includes/config.php';
require_once '../../includes/functions.php';

// Authentication check
checkAuth();
if ($_SESSION['user_role'] !== 'patient') {
    header("Location: /login.php");
    exit;
}

// Fetch patient data
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$patient = $stmt->fetch();

// Fetch upcoming appointments
$appointments = $pdo->prepare("
    SELECT a.*, u.name AS doctor_name, u.email AS doctor_email 
    FROM appointments a
    JOIN users u ON a.doctor_id = u.id
    WHERE a.patient_id = ? AND a.date >= NOW()
    ORDER BY a.date ASC
    LIMIT 3
");
$appointments->execute([$_SESSION['user_id']]);
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Tableau de Bord Patient | TabiibDZ</title>
    <link rel="stylesheet" href="/assets/css/patient-dashboard.css">
</head>
<body>
    <div class="dashboard-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="profile-summary">
                <img src="/assets/images/default-avatar.png" alt="Profile" class="avatar">
                <h3><?= htmlspecialchars($patient['name']) ?></h3>
                <p>Patient</p>
            </div>
            <nav>
                <a href="index.php" class="active"><i class="fas fa-home"></i> Accueil</a>
                <a href="appointments.php"><i class="fas fa-calendar-check"></i> Rendez-vous</a>
                <a href="prescriptions.php"><i class="fas fa-prescription"></i> Ordonnances</a>
                <a href="profile.php"><i class="fas fa-user-cog"></i> Profil</a>
                <a href="/api/auth.php?action=logout"><i class="fas fa-sign-out-alt"></i> Déconnexion</a>
            </nav>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <h1>Bienvenue, <?= htmlspecialchars($patient['name']) ?>!</h1>
            
            <!-- Appointments Summary -->
            <section class="card upcoming-appointments">
                <h2><i class="fas fa-clock"></i> Prochains Rendez-vous</h2>
                <?php if ($appointments->rowCount() > 0): ?>
                    <div class="appointments-list">
                        <?php while ($appt = $appointments->fetch()): ?>
                            <div class="appointment-item">
                                <div class="appointment-details">
                                    <h3>Dr. <?= htmlspecialchars($appt['doctor_name']) ?></h3>
                                    <p><?= date('d/m/Y H:i', strtotime($appt['date'])) ?></p>
                                    <p class="status-badge <?= $appt['status'] ?>"><?= ucfirst($appt['status']) ?></p>
                                </div>
                                <a href="appointments.php?action=view&id=<?= $appt['id'] ?>" class="btn btn-sm">
                                    <i class="fas fa-eye"></i> Détails
                                </a>
                            </div>
                        <?php endwhile; ?>
                    </div>
                <?php else: ?>
                    <p>Aucun rendez-vous à venir.</p>
                <?php endif; ?>
                <a href="appointments.php" class="btn">Voir tous les rendez-vous</a>
            </section>

            <!-- Quick Actions -->
            <div class="quick-actions">
                <a href="appointments.php?action=create" class="action-card">
                    <i class="fas fa-plus-circle"></i>
                    <span>Prendre RDV</span>
                </a>
                <a href="prescriptions.php" class="action-card">
                    <i class="fas fa-file-medical"></i>
                    <span>Mes Ordonnances</span>
                </a>
                <a href="profile.php" class="action-card">
                    <i class="fas fa-user-edit"></i>
                    <span>Modifier Profil</span>
                </a>
            </div>
        </main>
    </div>

    <script src="/assets/js/patient-dashboard.js"></script>
</body>
</html>