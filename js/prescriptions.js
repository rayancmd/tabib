// Print individual prescription
function printPrescription(prescriptionId) {
    const printContent = document.getElementById(`print-content-${prescriptionId}`).innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
}

// Request medication refill
async function requestRefill(prescriptionId) {
    if (!confirm('Demander un renouvellement pour cette ordonnance?')) return;
    
    try {
        const response = await fetch('/api/prescriptions.php?action=request_refill', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prescription_id: prescriptionId,
                patient_id:  $_SESSION['user_id'] 
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Votre demande a été envoyée au médecin');
        } else {
            alert('Erreur: ' + (result.error || 'Échec de la demande'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Une erreur est survenue');
    }
}

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    // Enable Bootstrap tooltips if using Bootstrap
    $('[data-toggle="tooltip"]').tooltip();
    
    // Or use native title as tooltip
    const medItems = document.querySelectorAll('.medication-item');
    medItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const dosage = this.querySelector('.medication-dosage').textContent;
            this.setAttribute('title', dosage);
        });
    });
});