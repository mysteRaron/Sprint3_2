let timerActive = false;
let selectedLot = null;
const lotSpaces = {};

localStorage.setItem('userId', '672e7e11c3cfa89b7de32f75'); // Replace 'testUser123' with a valid user ID
localStorage.setItem('vehicleId', '672fa87ff2d528ef3fbf599e'); // Replace 'testVehicle123' with a valid vehicle ID
localStorage.setItem('parkingLotId', '67391ec959d4d5684461d7fe'); // Replace 'testLot123' with a valid parking lot ID

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
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('dashboard-page')) {
        loadDashboardData();  // Load user and vehicle details
        fetchParkingLots();   // Load parking lot data
    }
});

async function loadDashboardData() {
    try {
        // Fetch user details
        const userResponse = await fetch('/api/users/me');
        if (!userResponse.ok) throw new Error(`Failed to fetch user details: Status ${userResponse.status}`);
        const userData = await userResponse.json();
        document.getElementById('user-email').textContent = userData.email || 'Not provided';
        document.getElementById('user-phone').textContent = userData.phone || 'Not provided';

        // Fetch vehicle details
        const vehicleResponse = await fetch('/api/vehicles/me');
        if (!vehicleResponse.ok) throw new Error(`Failed to fetch vehicle details: Status ${vehicleResponse.status}`);
        const vehicles = await vehicleResponse.json();
        const vehicleInfoContainer = document.getElementById('vehicle-info');
        vehicleInfoContainer.innerHTML = ''; // Clear any existing content

        if (vehicles.length === 0) {
            vehicleInfoContainer.textContent = 'No vehicles registered.';
        } else {
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

        // Fetch parking sessions
        const sessionResponse = await fetch('/api/parking-sessions/me', {  // Modified endpoint
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!sessionResponse.ok) throw new Error(`Failed to fetch parking sessions: Status ${sessionResponse.status}`);
        const sessions = await sessionResponse.json();
        const sessionsContainer = document.getElementById('recent-sessions');
        sessionsContainer.innerHTML = ''; // Clear existing content

        if (sessions.length === 0) {
            sessionsContainer.innerHTML = '<p>No recent parking sessions found.</p>';
        } else {
            sessions.forEach(session => {
                const sessionDiv = document.createElement('div');
                sessionDiv.className = 'session-item';
                sessionDiv.innerHTML = `
                    <h3>Parking at: ${session.parkingLot.name}</h3>
                    <p>Vehicle: ${session.vehicle.make} ${session.vehicle.model}</p>
                    <p>Start: ${new Date(session.startTime).toLocaleString()}</p>
                    <p>Duration: 1 hours</p>
                    <p>Cost: $${session.totalCost.toFixed(2)}</p>
                `;
                sessionsContainer.appendChild(sessionDiv);
                const durationInSeconds = session.duration * 3600; // Convert hours to seconds
                startTimer(durationInSeconds);
            });
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        alert('Failed to load dashboard data: ' + error.message);
    }
}


// Load dashboard data when the dashboard page loads
if (document.getElementById('dashboard-page')) {
    document.addEventListener('DOMContentLoaded', loadDashboardData);
}


// Fetch and initially display parking lot data
async function fetchParkingLots() {
    try {
        const response = await fetch('/api/parking-lots');
        const lots = await response.json();
        
        updateParkingLotsHTML(lots);  // Update the HTML with fetched data
        updateLotDisplay(lots);       // Optionally, keep a separate display update function if needed for specific updates
    } catch (error) {
        console.error("Error fetching parking lots:", error);
    }
}

// Dynamically generate and update parking lot display based on fetched data
function updateParkingLotsHTML(lots) {
    const parkingLotContainer = document.getElementById('parking-lot-details');
    parkingLotContainer.innerHTML = ''; // Clear existing content
    lots.forEach(lot => {
        const lotDiv = document.createElement('div');
        lotDiv.className = 'parking-lot';
        lotDiv.innerHTML = `
            <h2>${lot.name}</h2>
            <p id="${lot._id}-spots">${lot.availableSpots} Spots Available</p>
            <button class="select-lot-btn" data-lot-id="${lot._id}">Select</button>
        `;
        parkingLotContainer.appendChild(lotDiv);
    });
    
}

 




// Update the available slots display separately if needed
function updateLotDisplay(lots) {
    lots.forEach(lot => {
        const spotElement = document.getElementById(`${lot._id}-spots`);
        if (spotElement) {
            spotElement.textContent = `${lot.availableSpots} Spots Available`;
        }
    });
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

 
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('addParkingLotForm');
    if(form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            const formData = {
                name: document.getElementById('name').value,
                location: document.getElementById('location').value,
                totalSpots: parseInt(document.getElementById('totalSpots').value, 10),
                availableSpots: parseInt(document.getElementById('availableSpots').value, 10)
            };

            fetch('/api/parking-lots/add', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                alert('Parking lot added successfully!');
                form.reset();
                // Optionally redirect or update UI
            })
            .catch(error => {
                console.error('Error adding parking lot:', error);
                alert('Failed to add parking lot.');
            });
        });
    }
});

const vehicleForm = document.getElementById('vehicle-info-form');
if (vehicleForm) {
    vehicleForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Collect form data
        const licensePlate = document.getElementById('license-plate').value;
        const state = document.getElementById('state').value.toUpperCase(); // Ensure state is in uppercase
        const isDefault = document.getElementById('default-vehicle').checked;

        // Client-side validation example
        if (!licensePlate.match(/^[A-Z0-9]+$/i)) {
            showError('Invalid license plate format.');
            return;
        }
        if (state.length !== 2 || !state.match(/^[A-Z]{2}$/)) {
            showError('Invalid state format. Please enter a two-letter state abbreviation.');
            return;
        }

        try {
            const response = await fetch('/api/vehicles/me', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ licensePlate, state, isDefault })
            });

            if (response.ok) {
                showSuccess('Vehicle information saved successfully!');
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

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
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

 


 

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOMContentLoaded fired");

    const parkingLotContainer = document.getElementById('parking-lot-details');
    if (parkingLotContainer) {
        parkingLotContainer.addEventListener('click', async function (event) {
            if (event.target.classList.contains('select-lot-btn')) {
                console.log("Select button clicked");

                // Get the lot ID from the button's dataset
                const lotId = event.target.dataset.lotId;

                try {
                    // Call the API to decrement availability
                    const response = await fetch('/api/decrement-availability', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ lotId }), // Use dynamic lotId
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log(`New availability for lot ${lotId}: ${data.availableSpots}`);

                        // Update the UI to reflect the new availability
                        const availabilitySpan = document.querySelector(`#${lotId}-availability`);
                        if (availabilitySpan) {
                            availabilitySpan.textContent = data.availableSpots;
                        }
                    } else {
                        const errorData = await response.json();
                        console.error(`Error decrementing availability: ${errorData.error}`);
                        alert(`Error: ${errorData.error}`);
                        return; // Exit function to avoid further execution
                    }
                } catch (error) {
                    console.error("Error selecting parking lot:", error);
                     
                }

                // Display payment confirmation section
                const paymentConfirmation = document.getElementById('payment-confirmation');
                if (paymentConfirmation) {
                    paymentConfirmation.style.display = 'block';
                    console.log("Payment confirmation displayed");

                    // Attach listener for the confirm payment button
                    const confirmPaymentButton = document.getElementById('confirm-payment-btn');
                    if (confirmPaymentButton) {
                        console.log("Confirm payment button found, attaching event listener");

                        // Remove existing listener to avoid duplicates
                        confirmPaymentButton.replaceWith(confirmPaymentButton.cloneNode(true));
                        document.getElementById('confirm-payment-btn')
                            .addEventListener('click', handlePaymentConfirmation);
                    } else {
                        console.error("Confirm payment button not found");
                    }
                } else {
                    console.error("Payment confirmation section not found");
                }
            }
        });
    } else {
        console.error("Parking lot container not found");
    }
});



// Handle payment confirmation
// Handle payment confirmation and start parking session
async function handlePaymentConfirmation() {
    // Retrieve hours and calculate total cost
    const hours = parseInt(document.getElementById('hours').value, 10);
    const totalCost = hours * 10; // Assuming the cost is $10 per hour

    // Retrieve IDs from local storage
    const parkingLotId = localStorage.getItem('parkingLotId');
    const userId = localStorage.getItem('userId');
    const vehicleId = localStorage.getItem('vehicleId');

    // Check for missing required information
    if (!userId || !vehicleId || !parkingLotId) {
        alert('Required information is missing. Please check and try again.');
        return;
    }

    console.log("Sending session creation payload:", { user: userId, vehicle: vehicleId, parkingLot: parkingLotId, hours, totalCost });

    try {
        // Send request to server to create parking session
        const response = await fetch('/api/parking-sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: userId, vehicle: vehicleId, parkingLot: parkingLotId, hours, totalCost })
        });

        // Handle server response
        if (response.ok) {
            const data = await response.json();
            alert('Parking session started successfully!');
            console.log("Session details:", data);
            startTimer(hours * 3600); // Starts a timer for the parking session based on the hours booked
        } else {
            const errorData = await response.json();
            console.error("Failed to create session:", errorData);
            alert(`Failed to start session: ${errorData.error}`);
        }
    } catch (error) {
        console.error("Network or server error during session creation:", error);
        alert('Error connecting to the service. Please try again later.');
    }
}






document.getElementById('addParkingLotForm').addEventListener('submit', function(event) {
    const totalSpots = document.getElementById('totalSpots').value;
    const availableSpots = document.getElementById('availableSpots').value;

    if (parseInt(availableSpots) > parseInt(totalSpots)) {
        alert("Available spots cannot be more than total spots.");
        event.preventDefault(); // Prevent form submission
    }
});

 

 









document.addEventListener('DOMContentLoaded', () => {
    const extendTimeButton = document.getElementById('extend-time-btn');

    if (extendTimeButton) {
        extendTimeButton.addEventListener('click', () => {
            console.log('Extend Time button clicked');

            // Hardcoded 1 hour (in milliseconds)
            const additionalTime = 1 * 3600 * 1000;

            // Retrieve the current timer end time from localStorage
            const currentEndTime = parseInt(localStorage.getItem('timerEndTime'), 10);

            if (!currentEndTime || isNaN(currentEndTime)) {
                alert("No active timer found. Please start a session first.");
                console.error("No valid timerEndTime in localStorage");
                return;
            }

            // Add 1 hour to the current end time
            const newEndTime = currentEndTime + additionalTime;
            localStorage.setItem('timerEndTime', newEndTime); // Update localStorage
            console.log(`Timer extended. New end time: ${newEndTime}`);

            // Restart the timer using the updated end time
            const remainingTime = Math.max(0, Math.floor((newEndTime - Date.now()) / 1000));
            startTimer(remainingTime);

            alert("Parking time extended by 1 hour.");
        });
    } else {
        console.error('Extend Time button not found');
    }
});

// Start Timer Function
function startTimer(duration) {
    const timerDisplay = document.getElementById('timer-display');
    timerDisplay.style.display = 'block';

    // If the timer is being started for the first time, calculate the endTime and store it
    let endTime = parseInt(localStorage.getItem('timerEndTime'), 10);
    if (!endTime || isNaN(endTime)) {
        endTime = Date.now() + duration * 1000; // Calculate new end time
        localStorage.setItem('timerEndTime', endTime);
    }

    // Clear any existing interval
    if (window.timerInterval) {
        clearInterval(window.timerInterval);
    }

    // Start the countdown
    window.timerInterval = setInterval(() => {
        const now = Date.now();
        const timeRemaining = Math.max(0, Math.floor((endTime - now) / 1000));

        if (timeRemaining > 0) {
            const hours = Math.floor(timeRemaining / 3600);
            const minutes = Math.floor((timeRemaining % 3600) / 60);
            const seconds = timeRemaining % 60;

            timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            clearInterval(window.timerInterval);
            handleTimerExpiry(); // Handle expiry
        }
    }, 1000);
}

function handleTimerExpiry() {
     

    const parkingLotId = localStorage.getItem('parkingLotId'); // Get the selected lot ID
    if (parkingLotId) {
        incrementParkingLotAvailability(parkingLotId); // Call API to increment availability
    }

    localStorage.removeItem('timerEndTime'); // Clear expired timer data
    resetUI(); // Reset UI to allow new session
}

// Function to call the API to increment availability
async function incrementParkingLotAvailability(lotId) {
    try {
        const response = await fetch('/api/increment-availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lotId }) // Use dynamic lotId
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`Availability incremented for lot ${lotId}: ${data.availableSpots}`);
            updateUIAfterIncrement(lotId, data.availableSpots);
        } else {
            const errorData = await response.json();
            console.error(`Error incrementing availability: ${errorData.error}`);
            alert(`Error: ${errorData.error}`);
        }
    } catch (error) {
        console.error("Error incrementing parking lot availability:", error);
    }
}

// Update the UI after incrementing the availability
function updateUIAfterIncrement(lotId, availableSpots) {
    const availabilitySpan = document.querySelector(`#${lotId}-availability`);
    if (availabilitySpan) {
        availabilitySpan.textContent = availableSpots;
    }
}




// Reset UI
function resetUI() {
    document.getElementById('select-lot-btn').disabled = false; // Enable the lot selection
    document.getElementById('timer-display').textContent = "00:00:00"; // Reset timer display
}

// Resume Timer Function
function resumeTimer() {
    const timerDisplay = document.getElementById('timer-display');
    const endTime = parseInt(localStorage.getItem('timerEndTime'), 10);

    if (endTime && !isNaN(endTime)) {
        const now = Date.now();
        const timeRemaining = Math.max(0, Math.floor((endTime - now) / 1000));

        if (timeRemaining > 0) {
            startTimer(timeRemaining); // Resume the timer with the remaining time
        } else {
            localStorage.removeItem('timerEndTime');
            timerDisplay.textContent = "00:00:00";
        }
    }
}

// Initialize the timer on page load
document.addEventListener('DOMContentLoaded', resumeTimer);





// Initialize lot display on page load (parking-lots.html)
if (document.querySelector('.parking-lot')) {
    document.addEventListener('DOMContentLoaded', fetchParkingLots);
}

