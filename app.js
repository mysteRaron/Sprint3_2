let timerActive = false;
let selectedLot = null;
const lotSpaces = {};

// Phone number formatting function
function formatPhoneNumber(value) {
    const cleaned = ('' + value).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
}

// Apply phone number formatting on specific inputs if they exist on the page
function applyPhoneFormatting(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.addEventListener('input', (event) => {
            event.target.value = formatPhoneNumber(event.target.value);
        });
    }
}
applyPhoneFormatting('phone');
applyPhoneFormatting('phone-update');

// Function to show error messages
function showError(message) {
    alert(message);
}

// Fetch and display user details and vehicle information on the dashboard
async function loadDashboardData() {
    try {
        const userResponse = await fetch('/api/users/me'); // Endpoint to get user details
        const vehicleResponse = await fetch('/api/vehicles/me'); // Endpoint to get all vehicles for the user

        if (userResponse.ok) {
            const userData = await userResponse.json();
            document.getElementById('user-email').textContent = userData.email;
            document.getElementById('user-phone').textContent = userData.phone;
        }

        if (vehicleResponse.ok) {
            const vehicles = await vehicleResponse.json();
            const vehicleInfoContainer = document.getElementById('vehicle-info');
            vehicleInfoContainer.innerHTML = ''; // Clear any existing content

            vehicles.forEach(vehicle => {
                const vehicleElement = document.createElement('div');
                vehicleElement.className = 'vehicle-item';
                vehicleElement.innerHTML = `
                    <p>License Plate: ${vehicle.licensePlate}</p>
                    <p>State: ${vehicle.state}</p>
                    <p>${vehicle.isDefault ? "Default Vehicle" : ""}</p>
                `;
                vehicleInfoContainer.appendChild(vehicleElement);
            });
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        alert('Failed to load dashboard data.');
    }
}

// Load dashboard data when the dashboard page loads
if (document.getElementById('dashboard-page')) {
    document.addEventListener('DOMContentLoaded', loadDashboardData);
}


// Fetch and display parking lot availability
// Fetch and display parking lot availability
async function fetchParkingLots() {
    try {
        const response = await fetch('/api/parking-lots');
        const lots = await response.json();
        
        // Store available spots in the lotSpaces object and update the display
        lots.forEach(lot => {
            lotSpaces[lot._id] = lot.availableSpots;
        });
        
        // Call update function to display the updated spots
        updateLotDisplay();
    } catch (error) {
        console.error("Error fetching parking lots:", error);
    }
}

// Update the available slots display
function updateLotDisplay() {
    // Assuming the lots in `lotSpaces` have corresponding IDs in HTML like `lot1-spots`, `lot2-spots`, etc.
    if (lotSpaces['lot1']) {
        document.getElementById('lot1-spots').textContent = `${lotSpaces['lot1']} Spots Available`;
    }
    if (lotSpaces['lot2']) {
        document.getElementById('lot2-spots').textContent = `${lotSpaces['lot2']} Spots Available`;
    }
    if (lotSpaces['lot3']) {
        document.getElementById('lot3-spots').textContent = `${lotSpaces['lot3']} Spots Available`;
    }
}

// Ensure this function is called on page load or when needed
document.addEventListener('DOMContentLoaded', fetchParkingLots);


const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json(); // Get the user data from the response
                localStorage.setItem('userId', data.userId); // Save userId to localStorage
                if (data.vehicleId) {
                    localStorage.setItem('vehicleId', data.vehicleId); // Save vehicleId if available
                }
                
                alert('Login successful!');
                window.location.href = '/dashboard'; // Redirect to the dashboard or another authenticated page
            } else {
                const errorData = await response.json();
                showError(`Error: ${errorData.error}`);
            }
        } catch (error) {
            showError('An error occurred during login.');
        }
    });
}

// Handle registration form submission
const registrationForm = document.getElementById('registration-form');
if (registrationForm) {
    registrationForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, phone, password })
            });

            if (response.ok) {
                alert('Registration successful!');
                window.location.href = '/login'; // Redirect to login page
            } else {
                const errorData = await response.json();
                showError(`Error: ${errorData.error}`);
            }
        } catch (error) {
            showError('An error occurred during registration.');
        }
    });
}

const vehicleForm = document.getElementById('vehicle-info-form');
if (vehicleForm) {
    vehicleForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Collect form data
        const licensePlate = document.getElementById('license-plate').value;
        const state = document.getElementById('state').value;
        const isDefault = document.getElementById('default-vehicle').checked;

        try {
            // Send data to the server at the correct endpoint
            const response = await fetch('/api/vehicles/me', {  // Notice the updated endpoint here
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ licensePlate, state, isDefault })
            });

            if (response.ok) {
                alert('Vehicle information saved successfully!');
                vehicleForm.reset();
            } else {
                const errorData = await response.json();
                showError(`Error: ${errorData.error}`);
            }
        } catch (error) {
            showError('An error occurred while saving vehicle information.');
        }
    });
}




// Handle payment info form submission
const paymentInfoForm = document.getElementById('payment-info-form');
if (paymentInfoForm) {
    paymentInfoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const cardName = document.getElementById('card-name').value;
        const cardNumber = document.getElementById('card-number').value;

        try {
            const response = await fetch('/api/payment-info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cardName, cardNumber })
            });

            if (response.ok) {
                alert('Payment information saved successfully!');
            } else {
                const errorData = await response.json();
                showError(`Error: ${errorData.error}`);
            }
        } catch (error) {
            showError('An error occurred while saving payment information.');
        }
    });
}

// Handle user settings update form submission (settings.html)
const userSettingsForm = document.getElementById('user-settings-form');
if (userSettingsForm) {
    userSettingsForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Collect updated information
        const email = document.getElementById('email-update').value;
        const phone = document.getElementById('phone-update').value;
        const password = document.getElementById('password-update').value;
        const licensePlate = document.getElementById('license-plate-update').value;
        const state = document.getElementById('state-update').value;
        const cardName = document.getElementById('card-name-update').value;
        const cardNumber = document.getElementById('card-number-update').value;

        try {
            // Update user info
            await fetch('/api/users/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, phone, password })
            });

            // Update vehicle info
            await fetch('/api/vehicles/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ licensePlate, state })
            });

            // Update payment info
            await fetch('/api/payment-info/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cardName, cardNumber })
            });

            alert('User settings updated successfully!');
        } catch (error) {
            showError('An error occurred while updating user settings.');
        }
    });
}

const lotButtons = document.querySelectorAll('.select-lot-btn');
if (lotButtons.length > 0) {
    lotButtons.forEach((button) => {
        button.addEventListener('click', () => {
            if (timerActive) {
                showError("Timer active, can't start a new session");
            } else {
                const parkingLotId = button.getAttribute('data-lot-id'); // Get the actual parkingLotId
                localStorage.setItem('parkingLotId', parkingLotId); // Save to localStorage with correct key
                window.location.href = '/confirm-payment'; // Redirect to confirm payment
            }
        });
    });
}

const confirmPaymentButton = document.getElementById('confirm-payment-btn');
if (confirmPaymentButton) {
    confirmPaymentButton.addEventListener('click', async () => {
        const selectedHours = document.getElementById('hours').value;
        const totalCost = selectedHours * 10;

        // Retrieve the necessary IDs
        const userId = localStorage.getItem('userId');
        const vehicleId = localStorage.getItem('vehicleId');
        const parkingLotId = localStorage.getItem('parkingLotId');

        // Log each value to identify missing information
        console.log("User ID:", userId);
        console.log("Vehicle ID:", vehicleId);
        console.log("Parking Lot ID:", parkingLotId);

        // Check if IDs are available
        if (!userId) {
            console.error('User ID is missing');
        }
        if (!vehicleId) {
            console.error('Vehicle ID is missing');
        }
        if (!parkingLotId) {
            console.error('Parking Lot ID is missing');
        }
        if (!userId || !vehicleId || !parkingLotId) {
            showError('Required information is missing. Please try again.');
            return;
        }

        // Remaining code for API call
        try {
            const response = await fetch('/api/parking-sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    user: userId, 
                    vehicle: vehicleId, 
                    parkingLot: parkingLotId, 
                    hours: selectedHours, 
                    totalCost 
                })
            });

            if (response.ok) {
                alert('Parking session started!');
                startTimer(selectedHours * 3600);
            } else {
                const errorData = await response.json();
                showError(`Error: ${errorData.error}`);
            }
        } catch (error) {
            showError('An error occurred while starting the parking session.');
        }
    });
}





// Timer logic
let timerInterval;
let timeRemaining;

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
            timerActive = false;
            showError("Your parking time has expired!");
        }
    }, 1000);
}

// Extend parking time (timer.html)
const extendTimeButton = document.getElementById('extend-time-btn');
if (extendTimeButton) {
    extendTimeButton.addEventListener('click', () => {
        const extendHours = document.getElementById('extend-hours').value;
        const additionalTime = extendHours * 3600;
        timeRemaining += additionalTime;
        startTimer(timeRemaining);
    });
}

// Initialize lot display on page load (parking-lots.html)
if (document.querySelector('.parking-lot')) {
    document.addEventListener('DOMContentLoaded', fetchParkingLots);
}

