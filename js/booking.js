// Booking System JavaScript

// DOM Elements
const bookingForm = document.getElementById('bookingForm');
const progressSteps = document.querySelectorAll('.progress-step');
const bookingSteps = document.querySelectorAll('.booking-step');
const nextButtons = document.querySelectorAll('.next-step');
const prevButtons = document.querySelectorAll('.prev-step');
const confirmButton = document.getElementById('confirmBooking');
const modal = document.getElementById('confirmationModal');
const serviceCheckboxes = document.querySelectorAll('input[name="services"]');
const totalPriceElement = document.querySelector('.total-price');
const stylistRadios = document.querySelectorAll('input[name="stylist"]');
const calendarDays = document.getElementById('calendarDays');
const timeSlots = document.getElementById('timeSlots');
const agreeTerms = document.getElementById('agreeTerms');

// Booking state
let currentStep = 1;
let bookingData = {
    services: [],
    stylist: '',
    date: '',
    time: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    total: 0
};

// Initialize booking system
document.addEventListener('DOMContentLoaded', () => {
    initializeCalendar();
    initializeTimeSlots();
    updateTotalPrice();
    loadSavedBookingData();
});

// Load saved data from localStorage (if any)
function loadSavedBookingData() {
    const saved = localStorage.getItem('creatives_booking_draft');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            Object.assign(bookingData, data);
            restoreBookingState();
        } catch (e) {
            console.error('Error loading saved booking:', e);
        }
    }
}

// Restore booking state from saved data
function restoreBookingState() {
    // Restore services
    if (bookingData.services.length > 0) {
        serviceCheckboxes.forEach(checkbox => {
            if (bookingData.services.includes(checkbox.value)) {
                checkbox.checked = true;
            }
        });
        updateTotalPrice();
    }
    
    // Restore stylist
    if (bookingData.stylist) {
        stylistRadios.forEach(radio => {
            if (radio.value === bookingData.stylist) {
                radio.checked = true;
            }
        });
    }
    
    // Restore date and time
    if (bookingData.date) {
        highlightSelectedDate(bookingData.date);
    }
    if (bookingData.time) {
        highlightSelectedTime(bookingData.time);
    }
    
    // Restore personal info
    if (bookingData.firstName) {
        document.getElementById('firstName').value = bookingData.firstName;
        document.getElementById('lastName').value = bookingData.lastName;
        document.getElementById('bookingEmail').value = bookingData.email;
        document.getElementById('bookingPhone').value = bookingData.phone;
        document.getElementById('notes').value = bookingData.notes;
    }
}

// Step Navigation
function goToStep(step) {
    // Validate current step before proceeding
    if (step > currentStep && !validateStep(currentStep)) {
        return;
    }
    
    // Update step display
    bookingSteps.forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
    
    // Update progress bar
    progressSteps.forEach((s, index) => {
        const stepNum = index + 1;
        if (stepNum < step) {
            s.classList.add('completed');
            s.classList.remove('active');
        } else if (stepNum === step) {
            s.classList.add('active');
            s.classList.remove('completed');
        } else {
            s.classList.remove('active', 'completed');
        }
    });
    
    currentStep = step;
    
    // Update summary if on step 5
    if (step === 5) {
        updateBookingSummary();
    }
    
    // Save draft
    saveDraft();
}

// Validate current step
function validateStep(step) {
    switch(step) {
        case 1:
            return validateServices();
        case 2:
            return validateStylist();
        case 3:
            return validateDateTime();
        case 4:
            return validatePersonalInfo();
        default:
            return true;
    }
}

// Step validations
function validateServices() {
    const selected = Array.from(serviceCheckboxes).filter(cb => cb.checked);
    if (selected.length === 0) {
        showError('Please select at least one service');
        return false;
    }
    return true;
}

function validateStylist() {
    const selected = Array.from(stylistRadios).filter(r => r.checked);
    if (selected.length === 0) {
        showError('Please select a stylist');
        return false;
    }
    return true;
}

function validateDateTime() {
    if (!bookingData.date) {
        showError('Please select a date');
        return false;
    }
    if (!bookingData.time) {
        showError('Please select a time');
        return false;
    }
    return true;
}

function validatePersonalInfo() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('bookingEmail').value.trim();
    const phone = document.getElementById('bookingPhone').value.trim();
    
    if (!firstName || !lastName) {
        showError('Please enter your full name');
        return false;
    }
    
    if (!email || !isValidEmail(email)) {
        showError('Please enter a valid email address');
        return false;
    }
    
    if (!phone || !isValidPhone(phone)) {
        showError('Please enter a valid phone number');
        return false;
    }
    
    // Save to booking data
    bookingData.firstName = firstName;
    bookingData.lastName = lastName;
    bookingData.email = email;
    bookingData.phone = phone;
    bookingData.notes = document.getElementById('notes').value.trim();
    
    return true;
}

// Helper validation functions
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^[\d\s\-+()]{10,}$/.test(phone);
}

function showError(message) {
    // Create and show error toast
    const toast = document.createElement('div');
    toast.classList.add('error-toast');
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add error toast styles
const toastStyles = `
    .error-toast {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background-color: #ff4444;
        color: white;
        padding: 1rem 2rem;
        border-radius: 4px;
        box-shadow: var(--shadow-lg);
        z-index: 2000;
        transition: transform 0.3s ease;
        font-weight: 500;
    }
    
    .error-toast.show {
        transform: translateX(-50%) translateY(0);
    }
`;

const toastStyleElement = document.createElement('style');
toastStyleElement.textContent = toastStyles;
document.head.appendChild(toastStyleElement);

// Event Listeners for navigation
nextButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const nextStep = parseInt(btn.dataset.next);
        goToStep(nextStep);
    });
});

prevButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const prevStep = parseInt(btn.dataset.prev);
        goToStep(prevStep);
    });
});

// Service selection - update total
serviceCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        updateTotalPrice();
        updateServicesList();
        saveDraft();
    });
});

function updateTotalPrice() {
    let total = 0;
    serviceCheckboxes.forEach(cb => {
        if (cb.checked) {
            total += parseInt(cb.dataset.price);
        }
    });
    
    bookingData.total = total;
    bookingData.services = Array.from(serviceCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    if (totalPriceElement) {
        totalPriceElement.textContent = `$${total}`;
    }
}

function updateServicesList() {
    const summaryList = document.getElementById('summaryServices');
    if (!summaryList) return;
    
    const selected = Array.from(serviceCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => {
            const label = cb.closest('.service-option').querySelector('.service-name').textContent;
            const price = cb.dataset.price;
            return `<li>${label} - $${price}</li>`;
        });
    
    summaryList.innerHTML = selected.length ? selected.join('') : '<li>No services selected</li>';
}

// Stylist selection
stylistRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        bookingData.stylist = radio.value;
        saveDraft();
    });
});

// Calendar functionality
function initializeCalendar() {
    if (!calendarDays) return;
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    updateCalendar(currentMonth, currentYear);
}

function updateCalendar(month, year) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let calendarHTML = '';
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += '<div class="calendar-day disabled"></div>';
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isPast = date < new Date().setHours(0,0,0,0);
        const isSelected = bookingData.date === `${year}-${month + 1}-${day}`;
        
        calendarHTML += `
            <div class="calendar-day ${isPast ? 'disabled' : ''} ${isSelected ? 'selected' : ''}" 
                 data-date="${year}-${month + 1}-${day}">
                ${day}
            </div>
        `;
    }
    
    calendarDays.innerHTML = calendarHTML;
    
    // Add click handlers to calendar days
    document.querySelectorAll('.calendar-day:not(.disabled)').forEach(day => {
        day.addEventListener('click', () => {
            document.querySelectorAll('.calendar-day.selected').forEach(d => {
                d.classList.remove('selected');
            });
            day.classList.add('selected');
            bookingData.date = day.dataset.date;
            generateTimeSlots(bookingData.date);
            saveDraft();
        });
    });
}

// Time slots functionality
function initializeTimeSlots() {
    if (!timeSlots) return;
    timeSlots.innerHTML = '<span class="no-time">Please select a date first</span>';
}

function generateTimeSlots(date) {
    if (!timeSlots) return;
    
    // Mock available time slots (in real app, this would come from server)
    const slots = [
        '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
    ];
    
    let timeHTML = '';
    slots.forEach(slot => {
        const isSelected = bookingData.time === slot;
        timeHTML += `
            <div class="time-slot ${isSelected ? 'selected' : ''}" data-time="${slot}">
                ${slot}
            </div>
        `;
    });
    
    timeSlots.innerHTML = timeHTML;
    
    // Add click handlers
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', () => {
            document.querySelectorAll('.time-slot.selected').forEach(s => {
                s.classList.remove('selected');
            });
            slot.classList.add('selected');
            bookingData.time = slot.dataset.time;
            saveDraft();
        });
    });
}

// Calendar navigation
document.querySelector('.calendar-prev')?.addEventListener('click', () => {
    // Decrement month logic
});

document.querySelector('.calendar-next')?.addEventListener('click', () => {
    // Increment month logic
});

// Helper functions for date highlighting
function highlightSelectedDate(date) {
    document.querySelectorAll('.calendar-day').forEach(day => {
        if (day.dataset.date === date) {
            day.classList.add('selected');
        }
    });
}

function highlightSelectedTime(time) {
    document.querySelectorAll('.time-slot').forEach(slot => {
        if (slot.dataset.time === time) {
            slot.classList.add('selected');
        }
    });
}

// Update booking summary
function updateBookingSummary() {
    // Services already updated via updateServicesList()
    
    // Stylist
    const stylistSummary = document.getElementById('summaryStylist');
    const selectedStylist = document.querySelector('input[name="stylist"]:checked');
    if (selectedStylist) {
        const stylistCard = selectedStylist.closest('.stylist-option').querySelector('h3');
        stylistSummary.textContent = stylistCard ? stylistCard.textContent : 'Selected';
    }
    
    // Date & Time
    const dateTimeSummary = document.getElementById('summaryDateTime');
    if (bookingData.date && bookingData.time) {
        const date = new Date(bookingData.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        dateTimeSummary.textContent = `${formattedDate} at ${bookingData.time}`;
    }
    
    // Personal Details
    document.getElementById('summaryName').textContent = 
        `${bookingData.firstName} ${bookingData.lastName}`;
    document.getElementById('summaryContact').textContent = 
        `${bookingData.email} | ${bookingData.phone}`;
    
    // Total
    document.getElementById('summaryTotal').textContent = `$${bookingData.total}`;
}

// Save draft to localStorage
function saveDraft() {
    localStorage.setItem('creatives_booking_draft', JSON.stringify(bookingData));
}

// Form submission
if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!agreeTerms || !agreeTerms.checked) {
            showError('Please agree to the terms and conditions');
            return;
        }
        
        // Process booking
        processBooking();
    });
}

function processBooking() {
    // Generate booking reference
    const bookingRef = 'CBH' + Date.now().toString().slice(-8);
    
    // Here you would typically send the booking to a server
    console.log('Booking submitted:', {
        reference: bookingRef,
        ...bookingData
    });
    
    // Show confirmation modal
    document.getElementById('bookingRef').textContent = `#${bookingRef}`;
    modal.classList.add('show');
    
    // Clear draft from localStorage
    localStorage.removeItem('creatives_booking_draft');
}

// Close modal
document.querySelector('.modal .btn-primary')?.addEventListener('click', () => {
    modal.classList.remove('show');
});

// Add to calendar functionality
document.getElementById('addToCalendar')?.addEventListener('click', () => {
    if (!bookingData.date || !bookingData.time) return;
    
    // Create calendar event URL (Google Calendar)
    const date = new Date(bookingData.date);
    const [time, period] = bookingData.time.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (period === 'PM' && hours !== '12') {
        hours = parseInt(hours) + 12;
    }
    if (period === 'AM' && hours === '12') {
        hours = '00';
    }
    
    date.setHours(parseInt(hours), parseInt(minutes || '0'));
    
    const endDate = new Date(date);
    endDate.setHours(date.getHours() + 2); // Assume 2-hour appointment
    
    const formatDate = (d) => d.toISOString().replace(/-|:|\.\d+/g, '');
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Salon+Appointment+at+Creatives&dates=${formatDate(date)}/${formatDate(endDate)}&details=Booking+Reference:+${document.getElementById('bookingRef').textContent}&location=123+Beauty+Avenue,+New+York,+NY`;
    
    window.open(url, '_blank');
});

// Input validation on blur
document.getElementById('firstName')?.addEventListener('blur', validatePersonalInfo);
document.getElementById('lastName')?.addEventListener('blur', validatePersonalInfo);
document.getElementById('bookingEmail')?.addEventListener('blur', validatePersonalInfo);
document.getElementById('bookingPhone')?.addEventListener('blur', validatePersonalInfo);

// Phone number formatting
document.getElementById('bookingPhone')?.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    
    if (value.length > 6) {
        value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6)}`;
    } else if (value.length > 3) {
        value = `(${value.slice(0,3)}) ${value.slice(3)}`;
    }
    
    e.target.value = value;
});

// Auto-save every 30 seconds
setInterval(saveDraft, 30000);

// Clear old drafts (older than 7 days)
const clearOldDrafts = () => {
    const keys = Object.keys(localStorage);
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    keys.forEach(key => {
        if (key.startsWith('creatives_booking_')) {
            try {
                const item = localStorage.getItem(key);
                const data = JSON.parse(item);
                if (data.timestamp && data.timestamp < weekAgo) {
                    localStorage.removeItem(key);
                }
            } catch (e) {
                // Invalid JSON, remove it
                localStorage.removeItem(key);
            }
        }
    });
};

clearOldDrafts();