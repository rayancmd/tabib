document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  checkAuthStatus();
  
  // Modal elements
  const loginBtn = document.querySelector('.btn-login');
  const registerBtn = document.querySelector('.btn-primary');
  const loginModal = document.getElementById('loginModal');
  const registerModal = document.getElementById('registerModal');
  const showRegister = document.getElementById('showRegister');
  const showLogin = document.getElementById('showLogin');
  
  // Modal event listeners
  if (loginBtn && loginModal) {
    loginBtn.addEventListener('click', () => loginModal.style.display = 'flex');
  }
  
  if (registerBtn && registerModal) {
    registerBtn.addEventListener('click', () => registerModal.style.display = 'flex');
  }
  
  if (showRegister && loginModal && registerModal) {
    showRegister.addEventListener('click', function(e) {
      e.preventDefault();
      loginModal.style.display = 'none';
      registerModal.style.display = 'flex';
    });
  }
  
  if (showLogin && loginModal && registerModal) {
    showLogin.addEventListener('click', function(e) {
      e.preventDefault();
      registerModal.style.display = 'none';
      loginModal.style.display = 'flex';
    });
  }
  
  // Close modals
  document.querySelectorAll('.close-modal').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
      closeModals();
    });
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', function(e) {
    if (e.target === loginModal || e.target === registerModal) {
      closeModals();
    }
  });
  
  function closeModals() {
    if (loginModal) loginModal.style.display = 'none';
    if (registerModal) registerModal.style.display = 'none';
  }
  
  // Authentication forms
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  
  // Handle login
  async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    formData.append('action', 'login');
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
      
      const response = await fetch('http://localhost/online_med_app/api/auth.php', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Connexion réussie!');
        closeModals();
        updateAuthUI(result.user);
        e.target.reset();
      } else {
        alert('Erreur: ' + (result.error || 'Connexion échouée'));
      }
      
    } catch (error) {
      console.error('Login error:', error);
      alert('Erreur de connexion. Veuillez réessayer.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
  
  // Handle registration
  async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // Client-side validation
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm_password');
    
    if (password !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (password.length < 8) {
      alert('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    formData.append('action', 'register');
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inscription...';
      
      const response = await fetch('api/auth.php', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Inscription réussie! Vous pouvez maintenant vous connecter.');
        registerModal.style.display = 'none';
        loginModal.style.display = 'flex';
        e.target.reset();
      } else {
        alert('Erreur: ' + (result.error || 'Inscription échouée'));
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      alert('Erreur de connexion. Veuillez réessayer.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
  
  // Check authentication status
  function checkAuthStatus() {
    // This would normally check session or JWT token
    // For now, we'll just update UI based on what's available
  }
  
  // Update UI after authentication
  function updateAuthUI(user) {
    if (user) {
      // Hide auth buttons
      const authButtons = document.querySelector('.auth-buttons');
      if (authButtons) {
        authButtons.innerHTML = `
          <span>Bonjour, ${user.name}</span>
          <button class="btn btn-outline" onclick="logout()">Déconnexion</button>
        `;
      }
    }
  }
  
  // Logout function
  window.logout = async function() {
    try {
      const formData = new FormData();
      formData.append('action', 'logout');
      
      const response = await fetch('api/auth.php', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Déconnexion réussie');
        location.reload();
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Erreur de déconnexion');
    }
  };
  
  // Sample doctors data for homepage
  const doctorsGrid = document.querySelector('.doctors-grid');
  if (doctorsGrid) {
    const doctorsData = [
      {
        name: "Dr. Ahmed Belkacem",
        specialty: "Cardiologue", 
        location: "Alger Centre",
        rating: 4.6,
        image: "http://localhost/online_med_app/imgs/doctor.png"
      },
      {
        name: "Dr. Samir Allal",
        specialty: "Pédiatre",
        location: "Oran", 
        rating: 4.1,
        image: "http://localhost/online_med_app/imgs/doctor.png"
      },
      {
        name: "Dr. Karim Boudiaf",
        specialty: "Ophtalmologue",
        location: "Constantine",
        rating: 4.7,
        image: "http://localhost/online_med_app/imgs/doctor.png"
      }
    ];
    
    renderDoctors(doctorsData);
  }
  
  function renderDoctors(doctors) {
    if (!doctorsGrid) return;
    
    doctorsGrid.innerHTML = '';
    
    doctors.forEach(doctor => {
      const doctorCard = document.createElement('div');
      doctorCard.className = 'doctor-card';
      const stars = '★'.repeat(Math.floor(doctor.rating)) + '☆'.repeat(5 - Math.floor(doctor.rating));
      
      doctorCard.innerHTML = `
        <div class="doctor-image">
          <img src="${doctor.image}" alt="${doctor.name}" loading="lazy">
        </div>
        <div class="doctor-info">
          <h3>${doctor.name}</h3>
          <span class="doctor-specialty">${doctor.specialty}</span>
          <div class="doctor-location">
            <i class="fas fa-map-marker-alt"></i>
            <span>${doctor.location}</span>
          </div>
          <div class="doctor-rating">
            <span class="stars">${stars}</span>
            <span>${doctor.rating}</span>
          </div>
          <button class="book-btn">Prendre RDV</button>
        </div>
      `;
      
      doctorsGrid.appendChild(doctorCard);
    });
    
    // Add event listeners to book buttons
    document.querySelectorAll('.book-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        window.location.href = 'trouver-medecin.html';
      });
    });
  }
  
  // Populate wilaya dropdown
  const wilayaSelect = document.getElementById('wilaya');
  if (wilayaSelect) {
    const wilayas = [
      {code: "16", name: "Alger"}, {code: "31", name: "Oran"}, {code: "25", name: "Constantine"},
      {code: "19", name: "Sétif"}, {code: "5", name: "Batna"}, {code: "6", name: "Béjaïa"},
      {code: "9", name: "Blida"}, {code: "35", name: "Boumerdès"}, {code: "44", name: "Aïn Defla"}
    ];
    
    wilayas.forEach(wilaya => {
      const option = document.createElement('option');
      option.value = wilaya.code;
      option.textContent = wilaya.name;
      wilayaSelect.appendChild(option);
    });
  }
  
  // Search functionality
  const searchBtn = document.querySelector('.btn-search');
  if (searchBtn) {
    searchBtn.addEventListener('click', function() {
      const searchInput = document.querySelector('.search-input input');
      const wilayaSelect = document.getElementById('wilaya');
      
      if (searchInput && searchInput.value.trim()) {
        const searchParams = new URLSearchParams({
          search: searchInput.value.trim(),
          wilaya: wilayaSelect ? wilayaSelect.value : ''
        });
        
        window.location.href = `trouver-medecin.html?${searchParams}`;
      } else {
        window.location.href = 'trouver-medecin.html';
      }
    });
  }
  
  // Counter animation
  function initCounters() {
    const counters = document.querySelectorAll('.counter');
    const speed = 200;
    
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const count = +counter.innerText;
      const increment = target / speed;
      
      if (count < target) {
        counter.innerText = Math.ceil(count + increment);
        setTimeout(() => initCounters(), 10);
      } else {
        counter.innerText = target;
      }
    });
  }
  
  // Smooth scrolling for navigation links
  document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Back to top button
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });
    
    backToTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Mobile menu toggle
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      navLinks.classList.toggle('active');
    });
  }
  
  // Initialize animations and counters
  setTimeout(initCounters, 500);
});