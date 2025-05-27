document.addEventListener('DOMContentLoaded', function() {
  // Form submission
  const contactForm = document.getElementById('contactForm');
  
  contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form values
      const formData = {
          name: document.getElementById('name').value,
          email: document.getElementById('email').value,
          subject: document.getElementById('subject').value,
          message: document.getElementById('message').value
      };
      
      // Validate
      if (!formData.name || !formData.email || !formData.subject || !formData.message) {
          alert('Veuillez remplir tous les champs');
          return;
      }
      
      // In production: Send to backend
      console.log('Form submitted:', formData);
      
      // Show success message
      alert('Merci pour votre message! Nous vous contacterons bientôt.');
      contactForm.reset();
      
      // Optional: Add loading state
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';
      setTimeout(() => {
          submitBtn.innerHTML = 'Envoyer le message';
      }, 1500);
  });
  
  // Mobile navigation toggle (if not in main.js)
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  
  if (hamburger) {
      hamburger.addEventListener('click', function() {
          navLinks.classList.toggle('active');
      });
  }
});
// Google Maps Initialization
function initMap() {
    const officeLocation = { lat: 36.7525, lng: 3.0420 }; // Algiers coordinates
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: officeLocation,
        styles: [
            {
                featureType: "poi",
                stylers: [{ visibility: "off" }]
            }
        ]
    });
    
    new google.maps.Marker({
        position: officeLocation,
        map: map,
        title: "TabiibDZ Headquarters",
        icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
        }
    });
}

contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const attachment = document.getElementById('attachment').files[0];
    if (attachment && attachment.size > 5 * 1024 * 1024) {
        alert('Le fichier est trop volumineux (max 5MB)');
        return;
    }
    
});