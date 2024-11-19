let timerActive = false; // Flag to check if a timer is active
let selectedLot = null; // To keep track of which lot is selected
const lotSpaces = {
    lot1: 200,
    lot2: 200,
    lot3: 200
}; // Object to store available spaces for each lot

// Phone number formatting function
function formatPhoneNumber(value) {
    const cleaned = ('' + value).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
}

// Apply formatting as user types in the phone number field (Registration Page)
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', (event) => {
        const input = event.target.value;
        event.target.value = formatPhoneNumber(input);
    });
}

// Apply formatting as user types in the phone number field (Settings Page)
const phoneUpdateInput = document.getElementById('phone-update');
if (phoneUpdateInput) {
    phoneUpdateInput.addEventListener('input', (event) => {
        const input = event.target.value;
        event.target.value = formatPhoneNumber(input);
    });
}

// A simple utility function to show a specific page and hide all others
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    document.getElementById(pageId).style.display = 'flex';
}

// Initialize the app by showing the registration page by default
showPage('registration-page');

// Bottom navigation to switch between pages
document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', (event) => {
        const targetPageId = event.target.getAttribute('data-target');
        showPage(targetPageId);
    });
});

// Function to show error messages
function showError(message) {
    alert(message); // Show an alert for errors, can be customized for UI
}

// Function to update the available slots display
function updateLotDisplay() {
    document.querySelectorAll('.parking-lot').forEach((lot, index) => {
        const lotNumber = `lot${index + 1}`;
        lot.querySelector('p').textContent = `${lotSpaces[lotNumber]} Spots Available`;
    });
}

// Handle lot selection, storing selected lot and checking for active timer
document.querySelectorAll('.select-lot-btn').forEach((button, index) => {
    button.addEventListener('click', () => {
        if (timerActive) {
            showError("Timer Active, can't purchase new");
        } else {
            selectedLot = `lot${index + 1}`; // Store selected lot
            showPage('confirm-payment-page'); // Proceed to payment confirmation
        }
    });
});

// Confirm payment, decrease lot availability, and start the timer
document.getElementById('confirm-payment-btn').addEventListener('click', () => {
    if (selectedLot && lotSpaces[selectedLot] > 0) {
        lotSpaces[selectedLot] -= 1; // Decrease available spaces by one
        updateLotDisplay(); // Update the lot availability display
        timerActive = true; // Mark timer as active
        const selectedHours = document.getElementById('hours').value;
        const durationInSeconds = selectedHours * 3600; // Convert hours to seconds
        showPage('parking-timer-page');
        startTimer(durationInSeconds); // Start the timer based on the user-selected hours
    } else {
        showError("No available spaces in the selected lot.");
    }
});

// Calculate the parking cost based on selected hours
document.getElementById('hours').addEventListener('input', (event) => {
    const hours = event.target.value;
    const totalCost = hours * 10; // $10 per hour
    document.getElementById('total-cost').textContent = totalCost;
});

// Timer logic
let timerInterval;
let timeRemaining;  // Variable to track remaining time in seconds

function startTimer(duration) {
    timeRemaining = duration;

    const timerDisplay = document.getElementById('timer');
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        const hours = Math.floor(timeRemaining / 3600);
        const minutes = Math.floor((timeRemaining % 3600) / 60);
        const seconds = timeRemaining % 60;

        timerDisplay.textContent = `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (--timeRemaining < 0) {
            clearInterval(timerInterval);
            timerActive = false; // Reset timer flag
            lotSpaces[selectedLot] += 1; // Add space back to the selected lot
            updateLotDisplay(); // Update lot display to show available space
            selectedLot = null; // Reset selected lot
            alert("Your parking time has expired!");
        }
    }, 1000);
}

// Extend parking time when "Extend Time" button is clicked
document.getElementById('extend-hours').addEventListener('change', (event) => {
    const extendHours = event.target.value;
    const extendCost = extendHours * 2.5; // $2.50 per hour for extension
    document.getElementById('extend-cost').textContent = extendCost.toFixed(2);
});

// Handle the extension of parking time when the "Extend Time" button is clicked
document.getElementById('extend-time-btn').addEventListener('click', () => {
    const extendHours = document.getElementById('extend-hours').value;
    const additionalTime = extendHours * 3600; // Convert hours to seconds
    timeRemaining += additionalTime; // Add additional time to the current remaining time
    startTimer(timeRemaining); // Restart timer with updated time
});

// Initialize lot display on page load
document.addEventListener('DOMContentLoaded', updateLotDisplay);


// Handle Login / Register Form Submission
const registrationForm = document.getElementById('registration-form');

registrationForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent the default form submission

    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value.trim();

    // Simple validation to check if fields are filled
    if (email === '' || phone === '' || password === '') {
        showError("All fields are required.");
    } else {
        // Redirect to Parking Lot Page
        showPage('vehicle-info-page');
    }
});


// Handle Add Vehicle Information Form Submission
const vehicleInfoForm = document.getElementById('vehicle-info-form');

vehicleInfoForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent the default form submission

    const licensePlate = document.getElementById('license-plate').value.trim();
    const state = document.getElementById('state').value.trim();

    // Simple validation to check if fields are filled
    if (licensePlate === '' || state === '') {
        showError("All vehicle fields are required.");
    } else {
        // Proceed to the "Add Payment Information" page after saving vehicle information
        showPage('payment-info-page');
    }
});


// Handle Add Payment Information Form Submission
const paymentInfoForm = document.getElementById('payment-info-form');

paymentInfoForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent the default form submission

    const cardName = document.getElementById('card-name').value.trim();
    const cardNumber = document.getElementById('card-number').value.trim();

    // Simple validation to check if fields are filled
    if (cardName === '' || cardNumber === '') {
        showError("All payment fields are required.");
    } else {
        // Proceed to the Parking Lot Page after saving payment information
        showPage('parking-lot-page');
    }
});