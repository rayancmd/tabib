document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const searchBtn = document.getElementById('searchBtn');
  const mainSearch = document.getElementById('mainSearch');
  const searchSuggestions = document.getElementById('searchSuggestions');
  const doctorsGrid = document.getElementById('doctorsGrid');
  const loadingState = document.getElementById('loadingState');
  const noResults = document.getElementById('noResults');
  const resultsCount = document.getElementById('resultsCount');
  const resetFilters = document.getElementById('resetFilters');
  const appointmentModal = document.getElementById('appointmentModal');
  const closeModal = document.getElementById('closeModal');
  
  // Current data
  let currentDoctors = [];
  let selectedDoctor = null;
  let selectedDate = null;
  let selectedTimeSlot = null;
  let currentDate = new Date();
  
  // Initialize map if available
  let map = null;
  let markers = null;
  
  if (typeof L !== 'undefined') {
    map = L.map('map').setView([36.7525, 3.0420], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    
    if (typeof L.markerClusterGroup !== 'undefined') {
      markers = L.markerClusterGroup();
      map.addLayer(markers);
    }
  }
  
  // Search and filter doctors
  async function searchDoctors() {
    try {
      loadingState.style.display = 'flex';
      doctorsGrid.style.display = 'none';
      noResults.style.display = 'none';
      
      const params = new URLSearchParams({
        search: mainSearch?.value || '',
        specialty: document.getElementById('specialty')?.value || '',
        wilaya: document.getElementById('wilaya')?.value || '',
        availability: document.getElementById('availability')?.value || '',
        max_price: document.getElementById('priceRange')?.value || 10000,
        sort_by: document.getElementById('sortBy')?.value || 'rating'
      });
      
      // Add checkbox filters
      if (document.getElementById('telemedecine')?.checked) params.append('telemedicine', '1');
      if (document.getElementById('urgence')?.checked) params.append('emergency', '1');
      if (document.getElementById('cnam')?.checked) params.append('cnam', '1');
      
      const response = await fetch(`api/doctors.php?${params}`);
      const data = await response.json();
      
      if (data.success) {
        currentDoctors = data.doctors;
        displayDoctors(currentDoctors);
      } else {
        throw new Error(data.error || 'Search failed');
      }
      
    } catch (error) {
      console.error('Search error:', error);
      loadingState.style.display = 'none';
      noResults.style.display = 'flex';
    }
  }
  
  // Display doctors
  function displayDoctors(doctors) {
    loadingState.style.display = 'none';
    
    if (doctors.length === 0) {
      noResults.style.display = 'flex';
      doctorsGrid.style.display = 'none';
      if (resultsCount) resultsCount.textContent = '0 médecins trouvés';
      return;
    }
    
    noResults.style.display = 'none';
    doctorsGrid.style.display = 'grid';
    if (resultsCount) resultsCount.textContent = `${doctors.length} médecins trouvés`;
    
    // Clear previous results
    doctorsGrid.innerHTML = '';
    if (markers) markers.clearLayers();
    
    doctors.forEach(doctor => {
      // Add to map if coordinates available
      if (map && doctor.lat && doctor.lng && markers) {
        const marker = L.marker([doctor.lat, doctor.lng]).bindPopup(`
          <b>${doctor.name}</b><br>
          ${doctor.specialty}<br>
          <small>${doctor.address}</small>
        `);
        markers.addLayer(marker);
      }
      
      // Create doctor card
      const card = document.createElement('div');
      card.className = 'doctor-card';
      card.innerHTML = `
        <div class="doctor-image">
          <img src="http://localhost/online_med_app/imgs/doctor.png" alt="${doctor.name}" loading="lazy">
          ${doctor.available_today ? '<span class="availability-badge">Disponible aujourd\'hui</span>' : ''}
        </div>
        <div class="doctor-info">
          <h3>${doctor.name}</h3>
          <span class="doctor-specialty">${doctor.specialty}</span>
          <div class="doctor-location">
            <i class="fas fa-map-marker-alt"></i>
            ${doctor.address}, ${doctor.city}
          </div>
          <div class="doctor-rating">
            <span class="stars">${getStarRating(doctor.rating)}</span>
            <span class="reviews-count">${doctor.rating} (${doctor.reviews_count} avis)</span>
          </div>
          <div class="doctor-meta">
            <span class="doctor-price">${doctor.consultation_fee} DA</span>
            <span class="doctor-languages">
              <i class="fas fa-language"></i> ${(doctor.languages || ['fr']).map(lang => lang.toUpperCase()).join(', ')}
            </span>
          </div>
          <div class="doctor-actions">
            <button class="btn btn-primary btn-sm prendre-rdv" data-doctor-id="${doctor.id}">
              Prendre RDV
            </button>
            ${doctor.telemedicine ? `
            <button class="btn btn-outline btn-sm teleconsult-btn" data-doctor-id="${doctor.id}">
              <i class="fas fa-video"></i> Téléconsultation
            </button>` : ''}
          </div>
        </div>
      `;
      doctorsGrid.appendChild(card);
    });
    
    // Fit map to show all markers
    if (map && markers && doctors.length > 0) {
      try {
        map.fitBounds(markers.getBounds(), { padding: [20, 20] });
      } catch (e) {
        // Ignore if no valid bounds
      }
    }
  }
  
  // Get star rating HTML
  function getStarRating(rating) {
    const fullStars = Math.floor(rating || 0);
    const halfStar = (rating % 1) >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    return `
      ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
      ${halfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
      ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
    `;
  }
  
  // Show doctor appointment modal
  async function showDoctorModal(doctorId) {
    try {
      const formData = new FormData();
      formData.append('doctor_id', doctorId);
      
      const response = await fetch('api/doctors.php', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        selectedDoctor = data.doctor;
        
        // Update modal content
        document.getElementById('modalDoctorName').textContent = selectedDoctor.name;
        document.getElementById('modalDoctorSpecialty').textContent = selectedDoctor.specialty;
        
        // Generate calendar
        generateCalendar(currentDate.getFullYear(), currentDate.getMonth(), data.available_slots);
        
        // Show modal
        appointmentModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Modal error:', error);
      alert('Erreur de connexion');
    }
  }
  
  // Generate calendar
  function generateCalendar(year, month, availableSlots = {}) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthYear = document.getElementById('currentMonthYear');
    
    if (!calendarGrid || !currentMonthYear) return;
    
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                   'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    
    currentMonthYear.textContent = `${months[month]} ${year}`;
    calendarGrid.innerHTML = '';
    
    // Add day headers
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    days.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'calendar-day-header';
      dayHeader.textContent = day;
      calendarGrid.appendChild(dayHeader);
    });
    
    // Add empty cells
    for (let i = 0; i < startingDay; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-day';
      calendarGrid.appendChild(emptyCell);
    }
    
    // Add days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDate(date);
      const hasSlots = availableSlots[dateStr] && availableSlots[dateStr].length > 0;
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
      
      const dayCell = document.createElement('div');
      dayCell.className = 'calendar-day';
      if (hasSlots) dayCell.classList.add('available');
      if (isPast) dayCell.classList.add('unavailable');
      dayCell.textContent = day;
      
      if (!isPast && hasSlots) {
        dayCell.addEventListener('click', () => selectDate(date, availableSlots[dateStr]));
      }
      
      calendarGrid.appendChild(dayCell);
    }
  }
  
  // Format date as YYYY-MM-DD
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Select date and show time slots
  function selectDate(date, slots) {
    selectedDate = date;
    selectedTimeSlot = null;
    
    // Update calendar
    document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
    event.target.classList.add('selected');
    
    // Show time slots
    const slotsContainer = document.getElementById('slotsContainer');
    if (!slotsContainer) return;
    
    slotsContainer.innerHTML = '';
    
    if (!slots || slots.length === 0) {
      slotsContainer.innerHTML = '<p>Aucun créneau disponible</p>';
      return;
    }
    
    slots.forEach(slot => {
      const slotElement = document.createElement('div');
      slotElement.className = 'time-slot';
      slotElement.textContent = slot;
      slotElement.addEventListener('click', () => {
        document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
        slotElement.classList.add('selected');
        selectedTimeSlot = slot;
      });
      slotsContainer.appendChild(slotElement);
    });
  }
  
  // Confirm appointment
  async function confirmAppointment() {
    if (!selectedDate || !selectedTimeSlot || !selectedDoctor) {
      alert('Veuillez sélectionner une date et un créneau');
      return;
    }
    
    try {
      const appointmentDate = `${formatDate(selectedDate)} ${selectedTimeSlot}:00`;
      
      const formData = new FormData();
      formData.append('doctor_id', selectedDoctor.id);
      formData.append('date', appointmentDate);
      formData.append('reason', '');
      
      const response = await fetch('api/appointment.php', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Rendez-vous confirmé!');
        appointmentModal.style.display = 'none';
        document.body.style.overflow = 'auto';
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Appointment error:', error);
      alert('Erreur de connexion');
    }
  }
  
  // Event listeners
  if (searchBtn) searchBtn.addEventListener('click', searchDoctors);
  
  if (mainSearch) {
    mainSearch.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') searchDoctors();
    });
  }
  
  // Filter change listeners
  document.querySelectorAll('#specialty, #wilaya, #availability, #sortBy').forEach(element => {
    if (element) element.addEventListener('change', searchDoctors);
  });
  
  document.querySelectorAll('#telemedecine, #urgence, #cnam').forEach(element => {
    if (element) element.addEventListener('change', searchDoctors);
  });
  
  const priceRange = document.getElementById('priceRange');
  if (priceRange) {
    priceRange.addEventListener('input', function() {
      const maxPriceValue = document.getElementById('maxPriceValue');
      if (maxPriceValue) maxPriceValue.textContent = `${this.value} DA`;
      searchDoctors();
    });
  }
  
  if (resetFilters) {
    resetFilters.addEventListener('click', function() {
      document.querySelectorAll('select, input[type="text"], input[type="range"]').forEach(el => {
        if (el.type === 'range') el.value = el.max;
        else el.value = '';
      });
      document.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);
      searchDoctors();
    });
  }
  
  // Doctor card click handlers
  document.addEventListener('click', function(e) {
    if (e.target.closest('.prendre-rdv')) {
      const doctorId = e.target.closest('.prendre-rdv').dataset.doctorId;
      showDoctorModal(doctorId);
    }
    
    if (e.target.closest('.teleconsult-btn')) {
      alert('Fonctionnalité de téléconsultation - À implémenter');
    }
  });
  
  // Modal close handlers
  if (closeModal) {
    closeModal.addEventListener('click', function() {
      appointmentModal.style.display = 'none';
      document.body.style.overflow = 'auto';
    });
  }
  
  window.addEventListener('click', function(e) {
    if (e.target === appointmentModal) {
      appointmentModal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });
  
  // Calendar navigation
  const prevMonth = document.getElementById('prevMonth');
  const nextMonth = document.getElementById('nextMonth');
  
  if (prevMonth) {
    prevMonth.addEventListener('click', function() {
      currentDate.setMonth(currentDate.getMonth() - 1);
      generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });
  }
  
  if (nextMonth) {
    nextMonth.addEventListener('click', function() {
      currentDate.setMonth(currentDate.getMonth() + 1);
      generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });
  }
  
  // Confirm appointment button
  const confirmAppointmentBtn = document.getElementById('confirmAppointment');
  if (confirmAppointmentBtn) {
    confirmAppointmentBtn.addEventListener('click', confirmAppointment);
  }
  
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      this.classList.add('active');
      const tabId = this.dataset.tab;
      const tabContent = document.getElementById(`${tabId}Tab`);
      if (tabContent) tabContent.classList.add('active');
    });
  });
  
  // Initial search
  searchDoctors();
});