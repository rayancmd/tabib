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
  const modalDoctorName = document.getElementById('modalDoctorName');
  const modalDoctorSpecialty = document.getElementById('modalDoctorSpecialty');
  const currentMonthYear = document.getElementById('currentMonthYear');
  const calendarGrid = document.getElementById('calendarGrid');
  const slotsContainer = document.getElementById('slotsContainer');
  const prevMonth = document.getElementById('prevMonth');
  const nextMonth = document.getElementById('nextMonth');
  const confirmAppointment = document.getElementById('confirmAppointment');
  const modalDoctorAddress = document.getElementById('modalDoctorAddress');
  const modalDoctorPhone = document.getElementById('modalDoctorPhone');
  const modalDoctorLanguages = document.getElementById('modalDoctorLanguages');
  const modalDoctorPrice = document.getElementById('modalDoctorPrice');
  const modalDoctorBio = document.getElementById('modalDoctorBio');
  const reviewsList = document.getElementById('reviewsList');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  // Initialize map with marker cluster
  const map = L.map('map').setView([36.7525, 3.0420], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  const markers = L.markerClusterGroup();
  map.addLayer(markers);
  
  // Current date for calendar
  let currentDate = new Date();
  let selectedDate = null;
  let selectedTimeSlot = null;
  let selectedDoctor = null;
  
  // Sample doctor data (replace with API call)
  const doctors = [
      {
          id: 1,
          name: "Dr. Ahmed Belkacem",
          specialty: "Cardiologue",
          wilaya: "16",
          city: "Alger Centre",
          address: "123 Rue Didouche Mourad, Alger",
          rating: 4.6,
          reviews: 42,
          availableToday: true,
          price: 2500,
          image: "/imgs/doctor.png",
          lat: 36.7535,
          lng: 3.0410,
          languages: ["fr", "ar"],
          telemedicine: true,
          emergency: false,
          cnam: true,
          bio: "Cardiologue avec plus de 15 ans d'expérience, spécialisé en cardiologie interventionnelle.",
          phone: "0555 12 34 56",
          availability: {
              "2025-05-28": ["09:00", "10:30", "14:00", "15:30"],
              "2025-05-29": ["10:00", "11:30", "16:00"],
              "2025-05-30": ["09:30", "11:00", "14:30"]
          }
      },
      {
          id: 2,
          name: "Dr. Samir Allal",
          specialty: "Pédiatre",
          wilaya: "16",
          city: "Oran",
          address: "45 Rue des Frères Bouadou, Oran",
          rating: 4.1,
          reviews: 68,
          availableToday: false,
          price: 2000,
          image: "/imgs/doctor2.png",
          lat: 36.7455,
          lng: 3.0320,
          languages: ["fr", "ar", "en"],
          telemedicine: true,
          emergency: true,
          cnam: true,
          bio: "Pédiatre spécialisée en néonatologie avec 10 ans d'expérience en milieu hospitalier.",
          phone: "0555 98 76 54",
          availability: {
              "2025-05-29": ["08:30", "10:00", "13:30", "15:00"],
              "2025-05-30": ["09:00", "11:00", "14:00"]
          }
      },
      {
          id: 3,
          name: "Dr. Karim Boudiaf",
          specialty: "Ophtalmologue",
          wilaya: "25",
          city: "Constantine",
          address: "22 Boulevard de la Soummam, Constantine",
          rating: 4.7,
          reviews: 35,
          availableToday: true,
          price: 3000,
          image: "/imgs/doctor3.png",
          lat: 35.6969,
          lng: -0.6331,
          languages: ["fr", "ar"],
          telemedicine: false,
          emergency: false,
          cnam: false,
          bio: "Dermatologue esthétique spécialisé dans les traitements anti-âge et les maladies de peau.",
          phone: "0555 45 67 89",
          availability: {
              "2025-05-28": ["10:00", "11:30", "15:00"],
              "2025-05-30": ["09:00", "10:30", "14:00", "16:30"]
          }
      },
      {
          id: 4,
          name: "Dr. Kamal Bouzid",
          specialty: "Gynécologue",
          wilaya: "23",
          city: "Annaba",
          address: "18 Rue Ahmed Bey, Annaba",
          rating: 4.8,
          reviews: 54,
          availableToday: false,
          price: 2800,
          image: "/imgs/doctor4.png",
          lat: 36.7155,
          lng: 3.0520,
          languages: ["fr", "ar"],
          telemedicine: false,
          emergency: true,
          cnam: true,
          bio: "Gynécologue-obstétricienne avec expertise en échographie et suivi de grossesse.",
          phone: "0555 23 45 67",
          availability: {
              "2025-05-29": ["08:00", "10:30", "13:00", "15:30"],
              "2025-05-31": ["09:30", "11:00", "14:30"]
          }
      },
      {
          id: 5,
          name: "Dr. Djamel zeroual",
          specialty: "Médecin généraliste",
          wilaya: "19",
          city: "Sétif",
          address: "5 Rue des Frères Oudek, Sétif",
          rating: 4.5,
          reviews: 39,
          availableToday: true,
          price: 3500,
          image: "/imgs/doctor5.png",
          lat: 36.7355,
          lng: 3.0220,
          languages: ["fr", "ar", "en"],
          telemedicine: false,
          emergency: false,
          cnam: false,
          bio: "Ophtalmologue spécialisé en chirurgie réfractive et traitement des maladies rétiniennes.",
          phone: "0555 67 89 01",
          availability: {
              "2025-05-28": ["09:30", "11:00", "14:30", "16:00"],
              "2025-05-30": ["08:30", "10:00", "13:30"]
          }
      },
      {
          id: 6,
          name: "Dr. Farid Yamali",
          specialty: "Neurologue",
          wilaya: "05",
          city: "Batna",
          address: "10 Rue Larbi Ben M'hidi, Batna",
          rating: 4.3,
          reviews: 27,
          availableToday: true,
          price: 1800,
          image: "/imgs/doctor6.png",
          lat: 35.7069,
          lng: -0.6231,
          languages: ["fr", "ar"],
          telemedicine: true,
          emergency: true,
          cnam: true,
          bio: "Médecin généraliste avec approche holistique et expérience en médecine familiale.",
          phone: "0555 34 56 78",
          availability: {
              "2025-05-28": ["08:00", "09:30", "11:00", "14:00", "15:30"],
              "2025-05-29": ["10:00", "12:30", "16:00"]
          }
      }
  ];
  
  // Sample reviews data
  const reviews = {
      1: [
          { author: "Mohamed K.", date: "2025-04-15", rating: 5, comment: "Excellent médecin, très professionnel et à l'écoute." },
          { author: "Samira B.", date: "2025-03-22", rating: 4, comment: "Bon diagnostic, un peu d'attente mais ça valait le coup." }
      ],
      2: [
          { author: "Karim T.", date: "2025-05-10", rating: 5, comment: "Docteure très douce avec les enfants, ma fille n'a plus peur des consultations." },
          { author: "Nadia M.", date: "2025-04-05", rating: 5, comment: "Toujours disponible en cas d'urgence, merci docteur!" }
      ]
  };
  
  // Favorites system
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  
  // Display doctors on map and list
  function displayDoctors(doctorsToShow) {
      loadingState.style.display = 'none';
      
      if (doctorsToShow.length === 0) {
          noResults.style.display = 'flex';
          doctorsGrid.style.display = 'none';
      } else {
          noResults.style.display = 'none';
          doctorsGrid.style.display = 'grid';
      }
      
      // Clear previous results
      doctorsGrid.innerHTML = '';
      markers.clearLayers();
      
      // Update count
      resultsCount.textContent = `${doctorsToShow.length} médecins trouvés`;
      
      // Show doctors
      doctorsToShow.forEach(doctor => {
          // Add to map
          const marker = L.marker([doctor.lat, doctor.lng], {
              doctorId: doctor.id
          }).bindPopup(`
              <b>${doctor.name}</b><br>
              ${doctor.specialty}<br>
              <small>${doctor.address}</small>
          `);
          
          markers.addLayer(marker);
          
          // Check if doctor is favorite
          const isFavorite = favorites.includes(doctor.id);
          
          // Add to grid
          const card = document.createElement('div');
          card.className = 'doctor-card';
          card.innerHTML = `
              <div class="doctor-image">
                  <img src="./imgs/${doctor.image}" alt="${doctor.name}" loading="lazy">
                  ${doctor.availableToday ? '<span class="availability-badge">Disponible aujourd\'hui</span>' : ''}
                  <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-doctor-id="${doctor.id}">
                      <i class="fas fa-heart"></i>
                  </button>
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
                      <span class="reviews-count">${doctor.rating} (${doctor.reviews} avis)</span>
                  </div>
                  <div class="doctor-meta">
                      <span class="doctor-price">${doctor.price} DA</span>
                      <span class="doctor-languages">
                          <i class="fas fa-language"></i> ${doctor.languages.map(lang => lang.toUpperCase()).join(', ')}
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
      if (doctorsToShow.length > 0) {
          map.fitBounds(markers.getBounds(), { padding: [50, 50] });
      }
  }
  
  // Get star rating HTML
  function getStarRating(rating) {
      const fullStars = Math.floor(rating);
      const halfStar = rating % 1 >= 0.5 ? 1 : 0;
      const emptyStars = 5 - fullStars - halfStar;
      
      return `
          ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
          ${halfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
          ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
      `;
  }
  
  // Filter doctors
  function filterDoctors() {
      loadingState.style.display = 'flex';
      doctorsGrid.style.display = 'none';
      
      setTimeout(() => {
          const searchTerm = document.getElementById('mainSearch').value.toLowerCase();
          const specialty = document.getElementById('specialty').value;
          const wilaya = document.getElementById('wilaya').value;
          const availability = document.getElementById('availability').value;
          const telemedicine = document.getElementById('telemedecine').checked;
          const emergency = document.getElementById('urgence').checked;
          const cnam = document.getElementById('cnam').checked;
          const langueFr = document.getElementById('langueFr').checked;
          const langueAr = document.getElementById('langueAr').checked;
          const langueEn = document.getElementById('langueEn').checked;
          const maxPrice = document.getElementById('priceRange').value;
          
          const filtered = doctors.filter(doctor => {
              // Basic filters
              const matchesSearch = doctor.name.toLowerCase().includes(searchTerm) || 
                                  doctor.specialty.toLowerCase().includes(searchTerm) || 
                                  doctor.city.toLowerCase().includes(searchTerm) ||
                                  doctor.address.toLowerCase().includes(searchTerm);
              
              const matchesSpecialty = !specialty || doctor.specialty.toLowerCase() === specialty.toLowerCase();
              const matchesWilaya = !wilaya || doctor.wilaya === wilaya;
              const matchesPrice = doctor.price <= maxPrice;
              
              // Advanced filters
              const matchesTelemedicine = !telemedicine || doctor.telemedicine;
              const matchesEmergency = !emergency || doctor.emergency;
              const matchesCNAM = !cnam || doctor.cnam;
              
              // Language filters
              const matchesFr = !langueFr || doctor.languages.includes('fr');
              const matchesAr = !langueAr || doctor.languages.includes('ar');
              const matchesEn = !langueEn || doctor.languages.includes('en');
              
              // Availability filters
              let matchesAvailability = true;
              if (availability === 'today') {
                  matchesAvailability = doctor.availableToday;
              } else if (availability === 'week') {
                  // Check if doctor has availability in the next 7 days
                  const today = new Date();
                  const nextWeek = new Date(today);
                  nextWeek.setDate(today.getDate() + 7);
                  
                  matchesAvailability = Object.keys(doctor.availability || {}).some(dateStr => {
                      const date = new Date(dateStr);
                      return date >= today && date <= nextWeek;
                  });
              }
              
              return matchesSearch && matchesSpecialty && matchesWilaya && matchesPrice &&
                     matchesTelemedicine && matchesEmergency && matchesCNAM &&
                     matchesFr && matchesAr && matchesEn &&
                     matchesAvailability;
          });
          
          // Sort results
          const sortBy = document.getElementById('sortBy').value;
          let sortedDoctors = [...filtered];
          
          switch(sortBy) {
              case 'proximite':
                  // This would require geolocation to work properly
                  break;
              case 'note-desc':
                  sortedDoctors.sort((a, b) => b.rating - a.rating);
                  break;
              case 'note-asc':
                  sortedDoctors.sort((a, b) => a.rating - b.rating);
                  break;
              case 'tarif-desc':
                  sortedDoctors.sort((a, b) => b.price - a.price);
                  break;
              case 'tarif-asc':
                  sortedDoctors.sort((a, b) => a.price - b.price);
                  break;
              case 'disponibilite':
                  sortedDoctors.sort((a, b) => (b.availableToday ? 1 : 0) - (a.availableToday ? 1 : 0));
                  break;
              default:
                  // Default is pertinence
                  break;
          }
          
          displayDoctors(sortedDoctors);
      }, 500); // Simulate loading delay
  }
  
  // Generate calendar for a given month and year
  function generateCalendar(year, month) {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDay = firstDay.getDay();
      
      // Adjust starting day to make Monday the first day of week
      const adjustedStartingDay = startingDay === 0 ? 6 : startingDay - 1;
      
      currentMonthYear.textContent = `${getMonthName(month)} ${year}`;
      calendarGrid.innerHTML = '';
      
      // Add day headers
      const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      days.forEach(day => {
          const dayHeader = document.createElement('div');
          dayHeader.className = 'calendar-day-header';
          dayHeader.textContent = day;
          calendarGrid.appendChild(dayHeader);
      });
      
      // Add empty cells for days before the first day of month
      for (let i = 0; i < adjustedStartingDay; i++) {
          const emptyCell = document.createElement('div');
          emptyCell.className = 'calendar-day';
          calendarGrid.appendChild(emptyCell);
      }
      
      // Add days of month
      for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day);
          const dateStr = formatDate(date);
          const isAvailable = selectedDoctor && selectedDoctor.availability && selectedDoctor.availability[dateStr];
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
          const isSelected = selectedDate && dateStr === formatDate(selectedDate);
          
          const dayCell = document.createElement('div');
          dayCell.className = 'calendar-day';
          if (isAvailable) dayCell.classList.add('available');
          if (isPast) dayCell.classList.add('unavailable');
          if (isSelected) dayCell.classList.add('selected');
          dayCell.textContent = day;
          
          if (!isPast && isAvailable) {
              dayCell.addEventListener('click', () => selectDate(date));
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
  
  // Get month name
  function getMonthName(month) {
      const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
      return months[month];
  }
  
  // Select date for appointment
  function selectDate(date) {
      selectedDate = date;
      selectedTimeSlot = null;
      
      // Update calendar
      generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
      
      // Show available time slots
      showTimeSlots();
  }
  
  // Show available time slots for selected date
  function showTimeSlots() {
      if (!selectedDoctor || !selectedDate) return;
      
      const dateStr = formatDate(selectedDate);
      const slots = selectedDoctor.availability[dateStr] || [];
      
      slotsContainer.innerHTML = '';
      
      if (slots.length === 0) {
          slotsContainer.innerHTML = '<p>Aucun créneau disponible pour cette date</p>';
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
  
  // Show doctor details in modal
  function showDoctorModal(doctorId) {
      const doctor = doctors.find(d => d.id === parseInt(doctorId));
      if (!doctor) return;
      
      selectedDoctor = doctor;
      selectedDate = null;
      selectedTimeSlot = null;
      
      // Set modal content
      modalDoctorName.textContent = doctor.name;
      modalDoctorSpecialty.textContent = doctor.specialty;
      modalDoctorAddress.textContent = `${doctor.address}, ${doctor.city}`;
      modalDoctorPhone.textContent = doctor.phone;
      modalDoctorLanguages.textContent = doctor.languages.map(lang => {
          switch(lang) {
              case 'fr': return 'Français';
              case 'ar': return 'Arabe';
              case 'en': return 'Anglais';
              default: return lang;
          }
      }).join(', ');
      modalDoctorPrice.textContent = `${doctor.price} DA (Consultation)`;
      modalDoctorBio.textContent = doctor.bio;
      
      // Generate calendar for current month
      currentDate = new Date();
      generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
      
      // Show reviews if available
      reviewsList.innerHTML = '';
      if (reviews[doctor.id]) {
          reviews[doctor.id].forEach(review => {
              const reviewItem = document.createElement('div');
              reviewItem.className = 'review-item';
              reviewItem.innerHTML = `
                  <div class="review-author">${review.author}</div>
                  <div class="review-date">${review.date}</div>
                  <div class="review-stars">${getStarRating(review.rating)}</div>
                  <div class="review-comment">${review.comment}</div>
              `;
              reviewsList.appendChild(reviewItem);
          });
      } else {
          reviewsList.innerHTML = '<p>Aucun avis pour ce médecin</p>';
      }
      
      // Show modal
      appointmentModal.style.display = 'block';
      document.body.style.overflow = 'hidden';
  }
  
  // Search suggestions
  function showSearchSuggestions() {
      const searchTerm = mainSearch.value.toLowerCase();
      if (searchTerm.length < 2) {
          searchSuggestions.style.display = 'none';
          return;
      }
      
      // Find matching specialties, doctors and cities
      const specialties = [...new Set(doctors.map(d => d.specialty))];
      const doctorNames = doctors.map(d => d.name);
      const cities = [...new Set(doctors.map(d => d.city))];
      
      const matchingSpecialties = specialties.filters ;
          s.toLowerCase().includes(searchTerm)
          .map(s => ({ type: 'specialty', text: s }));
      
      const matchingDoctors = doctorNames.filter(n => 
          n.toLowerCase().includes(searchTerm))
          .map(n => ({ type: 'doctor', text: n }));
      
      const matchingCities = cities.filter(c => 
          c.toLowerCase().includes(searchTerm))
          .map(c => ({ type: 'city', text: c }));
      
      const allMatches = [...matchingSpecialties, ...matchingDoctors, ...matchingCities].slice(0, 5);
      
      if (allMatches.length === 0) {
          searchSuggestions.style.display = 'none';
          return;
      }
      
      searchSuggestions.innerHTML = '';
      allMatches.forEach(match => {
          const item = document.createElement('div');
          item.className = 'search-suggestion-item';
          
          let icon = '';
          if (match.type === 'specialty') icon = '<i class="fas fa-stethoscope"></i>';
          if (match.type === 'doctor') icon = '<i class="fas fa-user-md"></i>';
          if (match.type === 'city') icon = '<i class="fas fa-map-marker-alt"></i>';
          
          item.innerHTML = `${icon} ${match.text}`;
          item.addEventListener('click', () => {
              mainSearch.value = match.text;
              searchSuggestions.style.display = 'none';
              filterDoctors();
          });
          searchSuggestions.appendChild(item);
      });
      
      searchSuggestions.style.display = 'block';
  }
  
  // Event listeners
  searchBtn.addEventListener('click', filterDoctors);
  
  document.querySelectorAll('.advanced-filters select, .extra-filters input, #sortBy').forEach(element => {
      element.addEventListener('change', filterDoctors);
  });
  
  document.getElementById('priceRange').addEventListener('input', function() {
      document.getElementById('maxPriceValue').textContent = `${this.value} DA`;
      filterDoctors();
  });
  
  mainSearch.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') filterDoctors();
      showSearchSuggestions();
  });
  
  mainSearch.addEventListener('focus', showSearchSuggestions);
  
  document.addEventListener('click', function(e) {
      if (!mainSearch.contains(e.target) && !searchSuggestions.contains(e.target)) {
          searchSuggestions.style.display = 'none';
      }
  });
  
  resetFilters.addEventListener('click', function() {
      document.getElementById('specialty').value = '';
      document.getElementById('wilaya').value = '';
      document.getElementById('availability').value = '';
      document.getElementById('mainSearch').value = '';
      document.getElementById('telemedecine').checked = false;
      document.getElementById('urgence').checked = false;
      document.getElementById('cnam').checked = false;
      document.getElementById('langueFr').checked = false;
      document.getElementById('langueAr').checked = false;
      document.getElementById('langueEn').checked = false;
      document.getElementById('priceRange').value = 10000;
      document.getElementById('maxPriceValue').textContent = '10000+ DA';
      document.getElementById('sortBy').value = 'pertinence';
      
      filterDoctors();
  });
  
  // Doctor card interactions
  document.addEventListener('click', function(e) {
      // Appointment button
      if (e.target.closest('.prendre-rdv')) {
          const doctorId = e.target.closest('.prendre-rdv').dataset.doctorId;
          showDoctorModal(doctorId);
      }
      
      // Teleconsultation button
      if (e.target.closest('.teleconsult-btn')) {
          const doctorId = e.target.closest('.teleconsult-btn').dataset.doctorId;
          alert(`Fonctionnalité de téléconsultation pour le médecin ${doctorId} - À implémenter`);
      }
      
      // Favorite button
      if (e.target.closest('.favorite-btn')) {
          const btn = e.target.closest('.favorite-btn');
          const doctorId = parseInt(btn.dataset.doctorId);
          
          if (favorites.includes(doctorId)) {
              favorites = favorites.filter(id => id !== doctorId);
              btn.classList.remove('active');
          } else {
              favorites.push(doctorId);
              btn.classList.add('active');
          }
          
          localStorage.setItem('favorites', JSON.stringify(favorites));
      }
  });
  
  // Modal interactions
  closeModal.addEventListener('click', function() {
      appointmentModal.style.display = 'none';
      document.body.style.overflow = 'auto';
  });
  
  window.addEventListener('click', function(e) {
      if (e.target === appointmentModal) {
          appointmentModal.style.display = 'none';
          document.body.style.overflow = 'auto';
      }
  });
  
  prevMonth.addEventListener('click', function() {
      currentDate.setMonth(currentDate.getMonth() - 1);
      generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
  });
  
  nextMonth.addEventListener('click', function() {
      currentDate.setMonth(currentDate.getMonth() + 1);
      generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
  });
  
  confirmAppointment.addEventListener('click', function() {
      if (!selectedDate || !selectedTimeSlot) {
          alert('Veuillez sélectionner une date et un créneau horaire');
          return;
      }
      
      const dateStr = selectedDate.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
      });
      
      alert(`Rendez-vous confirmé avec ${selectedDoctor.name} le ${dateStr} à ${selectedTimeSlot}`);
      appointmentModal.style.display = 'none';
      document.body.style.overflow = 'auto';
  });
  
  // Tab switching in modal
  tabBtns.forEach(btn => {
      btn.addEventListener('click', function() {
          // Remove active class from all buttons and contents
          tabBtns.forEach(b => b.classList.remove('active'));
          tabContents.forEach(c => c.classList.remove('active'));
          
          // Add active class to clicked button and corresponding content
          this.classList.add('active');
          const tabId = this.dataset.tab;
          document.getElementById(`${tabId}Tab`).classList.add('active');
      });
  });
  
  // Marker click event
  map.on('click', function(e) {
      if (e.layer && e.layer.options && e.layer.options.doctorId) {
          showDoctorModal(e.layer.options.doctorId);
      }
  });
  
  // Initial load
  filterDoctors();
});