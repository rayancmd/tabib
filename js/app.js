document.addEventListener('DOMContentLoaded', function() {
  // Modal elements
  const loginBtn = document.querySelector('.btn-login');
  const loginModal = document.getElementById('loginModal');
  const registerBtn = document.querySelector('.btn-primary');
  const registerModal = document.getElementById('registerModal');
  const showRegister = document.getElementById('showRegister');
  const showLogin = document.getElementById('showLogin');
  
  // Login modal
  if (loginBtn && loginModal) {
    loginBtn.addEventListener('click', function() {
      loginModal.style.display = 'flex';
    });
  }
  
  // Register modal
  if (registerBtn && registerModal) {
    registerBtn.addEventListener('click', function() {
      registerModal.style.display = 'flex';
    });
  }
  
  // Switch between modals
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
  const closeModals = document.querySelectorAll('.close-modal');
  closeModals.forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
      if (loginModal) loginModal.style.display = 'none';
      if (registerModal) registerModal.style.display = 'none';
    });
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', function(e) {
    if (e.target === loginModal) {
      loginModal.style.display = 'none';
    }
    if (e.target === registerModal) {
      registerModal.style.display = 'none';
    }
  });
  
  // Registration form submission
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(this);
      formData.append('action', 'register');
      
      // Get submit button
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inscription...';
        
        // Send request
        const response = await fetch('../api/auth.php', { method: 'POST', body: formData });
        
        const result = await response.json();
        
        if (result.success) {
          alert('Inscription réussie! Vous pouvez maintenant vous connecter.');
          registerModal.style.display = 'none';
          this.reset();
        } else {
          alert('Erreur: ' + (result.error || 'Inscription échouée'));
        }
        
      } catch (error) {
        console.error('Registration error:', error);
        alert('Erreur de connexion. Veuillez réessayer.');
      } finally {
        // Restore button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }
  
  // doctors data
  const doctorsGrid = document.querySelector('.doctors-grid');
  const doctorsData = [
    {
      name: "Dr. Ahmed Belkacem",
      specialty: "Cardiologue",
      location: "Alger Centre",
      rating: 4.6,
      image: "/imgs/doctor1.jpg"
    },
    {
      name: "Dr. Samir Allal",
      specialty: "Pédiatre",
      location: "Oran",
      rating: 4.1,
      image: "/imgs/doctor2.png"
    },
    {
      name: "Dr. Karim Boudiaf",
      specialty: "Ophtalmologue",
      location: "Constantine",
      rating: 4.7,
      image: "/imgs/doctor3.png"
    },
    {
      name: "Dr. Kamal Bouzid",
      specialty: "Gynécologue",
      location: "Annaba",
      rating: 4.8,
      image: "/imgs/doctor4.png"
    },
    {
      name: "Dr. Djamel zeroual",
      specialty: "Médecin généraliste",
      location: "Sétif",
      rating: 4.5,
      image: "/imgs/doctor5.png"
    },
    {
      name: "Dr. Farid Yamali",
      specialty: "Neurologue",
      location: "Batna",
      rating: 4.3,
      image: "/imgs/doctor6.png"
    }
  ];
  
  // doctors cards
  function renderDoctors() {
    if (!doctorsGrid) return;
    
    doctorsGrid.innerHTML = '';
    
    doctorsData.forEach(doctor => {
      const doctorCard = document.createElement('div');
      doctorCard.className = 'doctor-card';
      const stars = '★'.repeat(Math.floor(doctor.rating)) + '☆'.repeat(5 - Math.floor(doctor.rating));
      doctorCard.innerHTML = `
        <div class="doctor-image">
          <img src="${doctor.image}" alt="${doctor.name}">
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
    
    document.querySelectorAll('.book-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        alert('Fonctionnalité de prise de rendez-vous à implémenter');
      });
    });
  }
  
  renderDoctors();
  
  // Algeria wilaya
  const wilayaSelect = document.getElementById('wilaya');
  if (wilayaSelect) {
    const wilayas = [
      {code: "1", name: "Adrar"},
      {code: "2", name: "Chlef"},
      {code: "3", name: "Laghouat"},
      {code: "4", name: "Oum El Bouaghi"},
      {code: "5", name: "Batna"},
      {code: "6", name: "Béjaïa"},
      {code: "7", name: "Biskra"},
      {code: "8", name: "Béchar"},
      {code: "9", name: "Blida"},
      {code: "10", name: "Bouira"},
      {code: "11", name: "Tamanrasset"},
      {code: "12", name: "Tébessa"},
      {code: "13", name: "Tlemcen"},
      {code: "14", name: "Tiaret"},
      {code: "15", name: "Tizi Ouzou"},
      {code: "16", name: "Alger"},
      {code: "17", name: "Djelfa"},
      {code: "18", name: "Jijel"},
      {code: "19", name: "Sétif"},
      {code: "20", name: "Saïda"},
      {code: "21", name: "Skikda"},
      {code: "22", name: "Sidi Bel Abbès"},
      {code: "23", name: "Annaba"},
      {code: "24", name: "Guelma"},
      {code: "25", name: "Constantine"},
      {code: "26", name: "Médéa"},
      {code: "27", name: "Mostaganem"},
      {code: "28", name: "M'Sila"},
      {code: "29", name: "Mascara"},
      {code: "30", name: "Ouargla"},
      {code: "31", name: "Oran"},
      {code: "32", name: "El Bayadh"},
      {code: "33", name: "Illizi"},
      {code: "34", name: "Bordj Bou Arreridj"},
      {code: "35", name: "Boumerdès"},
      {code: "36", name: "El Tarf"},
      {code: "37", name: "Tindouf"},
      {code: "38", name: "Tissemsilt"},
      {code: "39", name: "El Oued"},
      {code: "40", name: "Khenchela"},
      {code: "41", name: "Souk Ahras"},
      {code: "42", name: "Tipaza"},
      {code: "43", name: "Mila"},
      {code: "44", name: "Aïn Defla"},
      {code: "45", name: "Naâma"},
      {code: "46", name: "Aïn Témouchent"},
      {code: "47", name: "Ghardaïa"},
      {code: "48", name: "Relizane"}
    ];
    
    // paste options with wilayas
    wilayas.forEach(wilaya => {
      const option = document.createElement('option');
      option.value = wilaya.code;
      option.textContent = wilaya.name;
      wilayaSelect.appendChild(option);
    });
  }
  
  // search bar
  const searchBtn = document.querySelector('.search-box .btn-primary');
  if (searchBtn) {
    searchBtn.addEventListener('click', function() {
      const specialite = document.getElementById('specialite')?.value;
      const wilaya = document.getElementById('wilaya')?.value;
      const wilayaText = wilaya && wilayaSelect ? wilayaSelect.options[wilayaSelect.selectedIndex].text : 'toutes les wilayas';
      alert(`Recherche de ${specialite || 'toutes spécialités'} dans ${wilayaText}`);
    });
  }
  
  // Initialize counters
  function initCounters() {
    const counters = document.querySelectorAll('.counter');
    const speed = 200;
    
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const count = +counter.innerText;
      const increment = target / speed;
      
      if(count < target) {
        counter.innerText = Math.ceil(count + increment);
        setTimeout(initCounters, 1);
      } else {
        counter.innerText = target;
      }
    });
  }
  
  // Filter doctors by specialty
  function filterDoctors() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const specialty = this.getAttribute('data-specialty');
        console.log(`Filtering by: ${specialty}`);
      });
    });
  }
  
  initCounters();
  filterDoctors();
  
  // Animation on scroll
  const animateOnScroll = function() {
    const elements = document.querySelectorAll('.animate-fade-in, .animate-slide-up');
    
    elements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if(elementPosition < windowHeight - 100) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }
    });
  };
  
  window.addEventListener('scroll', animateOnScroll);
  animateOnScroll();
  
  // Smooth scroll
  document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80, 
          behavior: 'smooth'
        });
        
        document.querySelectorAll('nav a').forEach(link => {
          link.classList.remove('active');
        });
        this.classList.add('active');
      }
    });
  });
  
  // Active nav on scroll
  window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    
    document.querySelectorAll('section').forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionBottom = sectionTop + section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        const id = section.getAttribute('id');
        document.querySelectorAll('nav a').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
  
  // Back to Top Button
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    })
    
    backToTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});