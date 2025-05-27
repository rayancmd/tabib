document.addEventListener('DOMContentLoaded', function() {
    // Handle appointment cancellation
    document.querySelectorAll('.cancel-appointment').forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous?')) {
                e.preventDefault();
            }
        });
    });

    // Date picker constraints
    const dateInput = document.getElementById('date');
    if (dateInput) {
        // Disable past dates and weekends
        dateInput.addEventListener('input', function() {
            const selectedDate = new Date(this.value);
            const day = selectedDate.getUTCDay();
            
            if (day === 0 || day === 6) {
                alert('Les rendez-vous ne sont pas disponibles le weekend');
                this.value = '';
            }
        });
    }

    // Doctor availability check (simplified)
    const doctorSelect = document.getElementById('doctor_id');
    if (doctorSelect) {
        doctorSelect.addEventListener('change', async function() {
            const doctorId = this.value;
            const dateSelected = dateInput.value;
            
            if (doctorId && dateSelected) {
                // In a real app: Fetch API to check availability
                console.log(`Checking availability for Dr. ${doctorId} on ${dateSelected}`);
            }
        });
    }
});