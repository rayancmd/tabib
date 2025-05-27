<?php
require_once '../../includes/config.php';
require_once '../../includes/functions.php';

checkAuth();
if ($_SESSION['user_role'] !== 'patient') {
    header("Location: /login.php");
    exit;
}

// Handle actions
$action = $_GET['action'] ?? '';
$appointmentId = $_GET['id'] ?? 0;

// Cancel appointment
if ($action === 'cancel' && $appointmentId) {
    $stmt = $pdo->prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ? AND patient_id = ?");
    $stmt->execute([$appointmentId, $_SESSION['user_id']]);
    $_SESSION['flash'] = ['type' => 'success', 'message' => 'Rendez-vous annulé avec succès'];
    header("Location: appointments.php");
    exit;
}

// Fetch all appointments
$query = "SELECT a.*, u.name AS doctor_name, d.specialty 
          FROM appointments a
          JOIN users u ON a.doctor_id = u.id
          LEFT JOIN doctor_profiles d ON u.id = d.user_id
          WHERE a.patient_id = ?
          ORDER BY a.date DESC";

$appointments = $pdo->prepare($query);
$appointments->execute([$_SESSION['user_id']]);
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Gestion des Rendez-vous | TabiibDZ</title>
    <link rel="stylesheet" href="/assets/css/patient-dashboard.css">
</head>
<body>
    <div class="dashboard-container">
        <!-- Reuse sidebar from index.php -->
        <?php include '_sidebar.php'; ?>

        <main class="main-content">
            <div class="header-actions">
                <h1>Mes Rendez-vous</h1>
                <a href="?action=create" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Nouveau RDV
                </a>
            </div>

            <!-- Flash Messages -->
            <?php if (isset($_SESSION['flash'])): ?>
                <div class="flash-message <?= $_SESSION['flash']['type'] ?>">
                    <?= $_SESSION['flash']['message'] ?>
                </div>
                <?php unset($_SESSION['flash']); ?>
            <?php endif; ?>

            <!-- Appointment Creation Form (Hidden by Default) -->
            <?php if ($action === 'create'): ?>
                <div class="card appointment-form">
                    <h2><i class="fas fa-calendar-plus"></i> Prendre un Rendez-vous</h2>
                    <form action="/api/appointments.php" method="POST">
                        <input type="hidden" name="patient_id" value="<?= $_SESSION['user_id'] ?>">
                        
                        <div class="form-group">
                            <label for="doctor_id">Médecin</label>
                            <select name="doctor_id" id="doctor_id" required>
                                <option value="">Sélectionnez un médecin</option>
                                <?php
                                $doctors = $pdo->query("
                                    SELECT u.id, u.name, d.specialty 
                                    FROM users u
                                    JOIN doctor_profiles d ON u.id = d.user_id
                                    WHERE u.role = 'doctor'
                                ");
                                while ($doctor = $doctors->fetch()):
                                ?>
                                    <option value="<?= $doctor['id'] ?>">
                                        Dr. <?= htmlspecialchars($doctor['name']) ?> (<?= $doctor['specialty'] ?>)
                                    </option>
                                <?php endwhile; ?>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="date">Date et Heure</label>
                            <input type="datetime-local" name="date" id="date" required 
                                   min="<?= date('Y-m-d\TH:i') ?>">
                        </div>

                        <div class="form-group">
                            <label for="reason">Motif (optionnel)</label>
                            <textarea name="reason" id="reason" rows="3"></textarea>
                        </div>

                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-calendar-check"></i> Confirmer
                        </button>
                        <a href="appointments.php" class="btn btn-outline">Annuler</a>
                    </form>
                </div>
            <?php endif; ?>

            <!-- Appointments List -->
            <div class="card">
                <div class="filters">
                    <div class="filter-tabs">
                        <a href="?status=all" class="<?= !isset($_GET['status']) ? 'active' : '' ?>">Tous</a>
                        <a href="?status=upcoming" class="<?= ($_GET['status'] ?? '') === 'upcoming' ? 'active' : '' ?>">À venir</a>
                        <a href="?status=past" class="<?= ($_GET['status'] ?? '') === 'past' ? 'active' : '' ?>">Passés</a>
                    </div>
                </div>

                <div class="appointments-list">
                    <?php if ($appointments->rowCount() > 0): ?>
                        <?php while ($appt = $appointments->fetch()): ?>
                            <div class="appointment-item <?= strtotime($appt['date']) < time() ? 'past' : '' ?>">
                                <div class="appointment-info">
                                    <h3>Dr. <?= htmlspecialchars($appt['doctor_name']) ?></h3>
                                    <p class="specialty"><?= $appt['specialty'] ?></p>
                                    <p class="date">
                                        <i class="fas fa-calendar-day"></i>
                                        <?= date('d/m/Y H:i', strtotime($appt['date'])) ?>
                                    </p>
                                    <p class="reason"><?= $appt['reason'] ?: 'Aucun motif spécifié' ?></p>
                                </div>
                                <div class="appointment-actions">
                                    <span class="status-badge <?= $appt['status'] ?>">
                                        <?= ucfirst($appt['status']) ?>
                                    </span>
                                    <?php if ($appt['status'] === 'pending' && strtotime($appt['date']) > time()): ?>
                                        <a href="?action=cancel&id=<?= $appt['id'] ?>" 
                                           class="btn btn-sm btn-danger cancel-appointment">
                                            <i class="fas fa-times"></i> Annuler
                                        </a>
                                    <?php endif; ?>
                                    <a href="#" class="btn btn-sm btn-outline">
                                        <i class="fas fa-print"></i> Imprimer
                                    </a>
                                </div>
                            </div>
                        <?php endwhile; ?>
                    <?php else: ?>
                        <div class="empty-state">
                            <i class="fas fa-calendar-times"></i>
                            <p>Aucun rendez-vous trouvé</p>
                            <a href="?action=create" class="btn btn-primary">
                                Prendre un rendez-vous
                            </a>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </main>
    </div>

    <script src="/assets/js/appointments.js"></script>
</body>
</html>