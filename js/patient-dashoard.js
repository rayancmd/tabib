document.addEventListener('DOMContentLoaded', function() {
    // Toggle mobile sidebar
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }

    // Appointment cancellation
    document.querySelectorAll('.cancel-appointment').forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm('Voulez-vous vraiment annuler ce rendez-vous?')) {
                e.preventDefault();
            }
        });
    });

    // Fetch notifications
    async function fetchNotifications() {
        try {
            const response = await fetch('/api/notifications.php');
            const data = await response.json();
            updateNotificationBadge(data.count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }

    function updateNotificationBadge(count) {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    // Initialize
    fetchNotifications();
});