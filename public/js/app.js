// Global variables
let currentUser = null;
let events = [];
let registrations = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize application
function initializeApp() {
    // Check if user is logged in
    checkAuthStatus();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data based on current page
    loadPageData();
}

// Check authentication status
async function checkAuthStatus() {
    try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
            currentUser = JSON.parse(user);
            updateUIForUser();
        } else {
            // Redirect to login if not authenticated
            if (window.location.pathname !== '/' && window.location.pathname !== '/register') {
                window.location.href = '/';
            }
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/' && window.location.pathname !== '/register') {
            window.location.href = '/';
        }
    }
}

// Update UI based on user role
function updateUIForUser() {
    const userInfo = document.getElementById('userInfo');
    const navMenu = document.querySelector('.nav-menu');
    
    if (currentUser && userInfo) {
        const roleIcon = currentUser.role === 'admin' ? 'fas fa-user-shield' : 'fas fa-user-graduate';
        const roleText = currentUser.role === 'admin' ? 'Administrator' : 'Student';
        userInfo.innerHTML = `<i class="${roleIcon}"></i> Welcome, <strong>${currentUser.username}</strong> (${roleText})`;
    }
    
    if (currentUser && navMenu) {
        // Show/hide navigation based on role
        const studentLinks = navMenu.querySelectorAll('[data-role="student"]');
        const adminLinks = navMenu.querySelectorAll('[data-role="admin"]');
        
        studentLinks.forEach(link => {
            link.style.display = currentUser.role === 'student' ? 'block' : 'none';
        });
        
        adminLinks.forEach(link => {
            link.style.display = currentUser.role === 'admin' ? 'block' : 'none';
        });
    }
}

// Set up event listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Event registration forms
    const registerEventForms = document.querySelectorAll('.register-event-form');
    registerEventForms.forEach(form => {
        form.addEventListener('submit', handleEventRegistration);
    });
    
    // Cancel registration buttons
    const cancelButtons = document.querySelectorAll('.cancel-registration-btn');
    cancelButtons.forEach(btn => {
        btn.addEventListener('click', handleCancelRegistration);
    });
    
    // Search form
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }
}

// Load page-specific data
function loadPageData() {
    const path = window.location.pathname;
    
    switch (path) {
        case '/dashboard':
            loadDashboardData();
            break;
        case '/register-event':
            loadEventsForRegistration();
            break;
        case '/list-registrations':
            loadAllRegistrations();
            break;
        case '/cancel-registration':
            loadMyRegistrations();
            break;
        case '/search-registrations':
            // Search page doesn't need initial data
            break;
    }
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const password = formData.get('password');
    
    try {
        showLoading('loginBtn');
        
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            
            showAlert('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            showAlert(data.message || 'Login failed', 'danger');
        }
    } catch (error) {
        showAlert('An error occurred during login', 'danger');
        console.error('Login error:', error);
    } finally {
        hideLoading('loginBtn');
    }
}

// Handle logout
async function handleLogout() {
    try {
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        currentUser = null;
        
        // Call logout API
        const response = await fetch('/api/auth/logout', {
            method: 'POST'
        });
        
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
        // Clear local storage even if API call fails
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        currentUser = null;
        window.location.href = '/';
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const headers = getAuthHeaders();
        const [eventsResponse, registrationsResponse, statsResponse] = await Promise.all([
            fetch('/api/events/with-count', { headers }),
            fetch('/api/registrations/my-registrations', { headers }),
            fetch('/api/registrations/stats', { headers })
        ]);
        
        if (eventsResponse.ok) {
            events = await eventsResponse.json();
            displayEvents(events);
        }
        
        if (registrationsResponse.ok) {
            const data = await registrationsResponse.json();
            registrations = Array.isArray(data) ? data : data.registrations || [];
            displayMyRegistrations(registrations);
        }
        
        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            displayStats(stats);
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showAlert('Error loading dashboard data', 'danger');
    }
}

// Load events for registration
async function loadEventsForRegistration() {
    try {
        const headers = getAuthHeaders();
        const response = await fetch('/api/events/with-count', { headers });
        if (response.ok) {
            events = await response.json();
            displayEventsForRegistration(events);
        }
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

// Load all registrations (admin)
async function loadAllRegistrations() {
    try {
        const headers = getAuthHeaders();
        const response = await fetch('/api/registrations/listRegistrations', { headers });
        if (response.ok) {
            const registrations = await response.json();
            displayAllRegistrations(registrations);
        }
    } catch (error) {
        console.error('Error loading registrations:', error);
    }
}

// Load my registrations (student)
async function loadMyRegistrations() {
    try {
        const headers = getAuthHeaders();
        const response = await fetch('/api/registrations/my-registrations', { headers });
        if (response.ok) {
            const data = await response.json();
            registrations = Array.isArray(data) ? data : data.registrations || [];
            displayMyRegistrations(registrations);
        }
    } catch (error) {
        console.error('Error loading my registrations:', error);
    }
}

// Display events
function displayEvents(events) {
    const eventsContainer = document.getElementById('eventsContainer');
    if (!eventsContainer) return;
    
    if (events.length === 0) {
        eventsContainer.innerHTML = '<p class="text-center"><i class="fas fa-calendar-times fa-2x text-muted mb-2"></i><br>No events available</p>';
        return;
    }
    const isAdmin = currentUser && currentUser.role === 'admin';
    const eventsHTML = events.map(event => `
        <div class="event-card">
            <h3 class="event-title"><i class="fas fa-calendar-day"></i> ${event.name}</h3>
            <div class="event-details">
                <p><i class="fas fa-calendar"></i> <strong>Start:</strong> ${new Date(event.date).toLocaleString()}</p>
                <p><i class="fas fa-calendar-check"></i> <strong>End:</strong> ${event.endDate ? new Date(event.endDate).toLocaleString() : ''}</p>
                <p><i class="fas fa-map-marker-alt"></i> <strong>Location:</strong> ${event.location}</p>
                <p><i class="fas fa-info-circle"></i> <strong>Description:</strong> ${event.description}</p>
            </div>
            <div class="event-capacity">
                <span><i class="fas fa-users"></i> Capacity: ${event.registeredCount || 0}/${event.maxCapacity}</span>
                <div class="capacity-bar">
                    <div class="capacity-fill ${event.isFull ? 'full' : ''}" 
                         style="width: ${((event.registeredCount || 0) / event.maxCapacity) * 100}%"></div>
                </div>
            </div>
            <div class="d-flex" style="gap: 0.5rem; margin-top: 1rem;">
                <button class="btn btn-info btn-sm event-detail-btn" data-event-id="${event._id}"><i class="fas fa-info-circle"></i> Detail</button>
                ${isAdmin ? `<button class="btn btn-danger btn-sm event-delete-btn" data-event-id="${event._id}"><i class="fas fa-trash"></i> Delete</button>` : ''}
            </div>
        </div>
    `).join('');
    
    eventsContainer.innerHTML = eventsHTML;
    // Attach detail event listeners
    document.querySelectorAll('.event-detail-btn').forEach(btn => {
        btn.addEventListener('click', showEventDetailModal);
    });
    // Attach delete event listeners (only for admin)
    if (isAdmin) {
        document.querySelectorAll('.event-delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDeleteEvent);
        });
    }
}

// Display events for registration
function displayEventsForRegistration(events) {
    const eventsContainer = document.getElementById('eventsContainer');
    if (!eventsContainer) return;
    
    if (events.length === 0) {
        eventsContainer.innerHTML = '<p class="text-center"><i class="fas fa-calendar-times fa-2x text-muted mb-2"></i><br>No events available for registration</p>';
        return;
    }
    const isAdmin = currentUser && currentUser.role === 'admin';
    const eventsHTML = events.map(event => `
        <div class="event-card">
            <h3 class="event-title"><i class="fas fa-calendar-day"></i> ${event.name}</h3>
            <div class="event-details">
                <p><i class="fas fa-calendar"></i> <strong>Start:</strong> ${new Date(event.date).toLocaleString()}</p>
                <p><i class="fas fa-calendar-check"></i> <strong>End:</strong> ${event.endDate ? new Date(event.endDate).toLocaleString() : ''}</p>
                <p><i class="fas fa-map-marker-alt"></i> <strong>Location:</strong> ${event.location}</p>
                <p><i class="fas fa-info-circle"></i> <strong>Description:</strong> ${event.description}</p>
            </div>
            <div class="event-capacity">
                <span><i class="fas fa-users"></i> Capacity: ${event.registeredCount || 0}/${event.maxCapacity}</span>
                <div class="capacity-bar">
                    <div class="capacity-fill ${event.isFull ? 'full' : ''}" 
                         style="width: ${((event.registeredCount || 0) / event.maxCapacity) * 100}%"></div>
                </div>
            </div>
            <form class="register-event-form" data-event-id="${event._id}">
                <button type="submit" class="btn btn-success w-100" 
                        ${event.isFull ? 'disabled' : ''}>
                    <i class="fas ${event.isFull ? 'fa-times-circle' : 'fa-calendar-plus'}"></i>
                    ${event.isFull ? 'Event Full' : 'Register for Event'}
                </button>
            </form>
            <div class="d-flex" style="gap: 0.5rem; margin-top: 1rem;">
                <button class="btn btn-info btn-sm event-detail-btn" data-event-id="${event._id}"><i class="fas fa-info-circle"></i> Detail</button>
                ${isAdmin ? `<button class="btn btn-danger btn-sm event-delete-btn" data-event-id="${event._id}"><i class="fas fa-trash"></i> Delete</button>` : ''}
            </div>
        </div>
    `).join('');
    
    eventsContainer.innerHTML = eventsHTML;
    // Re-attach event listeners
    const registerForms = document.querySelectorAll('.register-event-form');
    registerForms.forEach(form => {
        form.addEventListener('submit', handleEventRegistration);
    });
    // Attach detail event listeners
    document.querySelectorAll('.event-detail-btn').forEach(btn => {
        btn.addEventListener('click', showEventDetailModal);
    });
    // Attach delete event listeners (only for admin)
    if (isAdmin) {
        document.querySelectorAll('.event-delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDeleteEvent);
        });
    }
}

// Display all registrations (admin)
function displayAllRegistrations(registrations) {
    const registrationsContainer = document.getElementById('registrationsContainer');
    if (!registrationsContainer) return;
    
    if (registrations.length === 0) {
        registrationsContainer.innerHTML = '<p class="text-center"><i class="fas fa-users-slash fa-2x text-muted mb-2"></i><br>No students have registered yet</p>';
        return;
    }
    
    const tableHTML = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th><i class="fas fa-id-card"></i> Registration ID</th>
                        <th><i class="fas fa-user"></i> Student</th>
                        <th><i class="fas fa-calendar"></i> Event</th>
                        <th><i class="fas fa-clock"></i> Registration Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${registrations.map(reg => `
                        <tr>
                            <td><code>${reg._id}</code></td>
                            <td><i class="fas fa-user-graduate"></i> ${reg.studentId?.username || 'Unknown'}</td>
                            <td><i class="fas fa-calendar-day"></i> ${reg.eventId?.name || 'Unknown'}</td>
                            <td><i class="fas fa-clock"></i> ${new Date(reg.registrationDate).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    registrationsContainer.innerHTML = tableHTML;
}

// Display my registrations (student)
function displayMyRegistrations(registrations) {
    const registrationsContainer = document.getElementById('registrationsContainer');
    if (!registrationsContainer) return;
    
    if (registrations.length === 0) {
        registrationsContainer.innerHTML = '<p class="text-center"><i class="fas fa-clipboard-list fa-2x text-muted mb-2"></i><br>You haven\'t registered for any events yet</p>';
        return;
    }
    
    const registrationsHTML = registrations.map(reg => `
        <div class="card">
            <h3><i class="fas fa-calendar-day"></i> ${reg.eventId?.name || 'Unknown Event'}</h3>
            <div class="event-details">
                <p><i class="fas fa-calendar"></i> <strong>Date:</strong> ${new Date(reg.eventId?.date).toLocaleDateString()}</p>
                <p><i class="fas fa-map-marker-alt"></i> <strong>Location:</strong> ${reg.eventId?.location}</p>
                <p><i class="fas fa-clock"></i> <strong>Registration Date:</strong> ${new Date(reg.registrationDate).toLocaleString()}</p>
            </div>
            <button class="btn btn-danger cancel-registration-btn" data-registration-id="${reg._id}">
                <i class="fas fa-times-circle"></i> Cancel Registration
            </button>
        </div>
    `).join('');
    
    registrationsContainer.innerHTML = registrationsHTML;
    
    // Re-attach event listeners
    const cancelButtons = document.querySelectorAll('.cancel-registration-btn');
    cancelButtons.forEach(btn => {
        btn.addEventListener('click', handleCancelRegistration);
    });
}

// Display statistics
function displayStats(stats) {
    const statsContainer = document.getElementById('statsContainer');
    if (!statsContainer) return;
    
    const statsHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <i class="fas fa-calendar-alt fa-2x text-primary mb-2"></i>
                <div class="stat-number">${stats.totalEvents}</div>
                <div class="stat-label">Total Events</div>
            </div>
            <div class="stat-card">
                <i class="fas fa-users fa-2x text-success mb-2"></i>
                <div class="stat-number">${stats.totalRegistrations}</div>
                <div class="stat-label">Total Registrations</div>
            </div>
            <div class="stat-card">
                <i class="fas fa-user-graduate fa-2x text-info mb-2"></i>
                <div class="stat-number">${stats.totalStudents}</div>
                <div class="stat-label">Total Students</div>
            </div>
            <div class="stat-card">
                <i class="fas fa-chart-line fa-2x text-warning mb-2"></i>
                <div class="stat-number">${stats.averageRegistrationsPerEvent}</div>
                <div class="stat-label">Avg. Registrations/Event</div>
            </div>
        </div>
    `;
    
    statsContainer.innerHTML = statsHTML;
}

// Handle event registration
async function handleEventRegistration(event) {
    event.preventDefault();
    
    const eventId = event.target.dataset.eventId;
    
    try {
        showLoading(event.target.querySelector('button'));
        
        const response = await fetch('/api/registrations', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ eventId })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('Successfully registered for event!', 'success');
            // Reload events to update capacity
            loadEventsForRegistration();
        } else {
            showAlert(data.message || 'Registration failed', 'danger');
        }
    } catch (error) {
        showAlert('An error occurred during registration', 'danger');
        console.error('Registration error:', error);
    } finally {
        hideLoading(event.target.querySelector('button'));
    }
}

// Handle cancel registration
async function handleCancelRegistration(event) {
    const registrationId = event.target.dataset.registrationId;
    
    if (!confirm('Are you sure you want to cancel this registration?')) {
        return;
    }
    
    try {
        showLoading(event.target);
        
        const response = await fetch(`/api/registrations/${registrationId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('Registration cancelled successfully!', 'success');
            // Reload registrations
            loadMyRegistrations();
        } else {
            showAlert(data.message || 'Failed to cancel registration', 'danger');
        }
    } catch (error) {
        showAlert('An error occurred while cancelling registration', 'danger');
        console.error('Cancel registration error:', error);
    } finally {
        hideLoading(event.target);
    }
}

// Handle search
async function handleSearch(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate');
    
    try {
        showLoading('searchBtn');
        
        const headers = getAuthHeaders();
        const response = await fetch(`/api/registrations/getRegistrationsByDate?start=${startDate}&end=${endDate}`, { headers });
        
        if (response.ok) {
            const registrations = await response.json();
            displayAllRegistrations(registrations);
        } else {
            const data = await response.json();
            showAlert(data.message || 'Search failed', 'danger');
        }
    } catch (error) {
        showAlert('An error occurred during search', 'danger');
        console.error('Search error:', error);
    } finally {
        hideLoading('searchBtn');
    }
}

// Show event detail modal
async function showEventDetailModal(e) {
    const eventId = e.currentTarget.dataset.eventId;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/api/events/${eventId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const event = await response.json();
            document.getElementById('modalEventName').textContent = event.name;
            document.getElementById('modalEventStart').textContent = event.date ? new Date(event.date).toLocaleString() : '';
            document.getElementById('modalEventEnd').textContent = event.endDate ? new Date(event.endDate).toLocaleString() : '';
            document.getElementById('modalEventLocation').textContent = event.location;
            document.getElementById('modalEventDescription').textContent = event.description;
            document.getElementById('modalEventCapacity').textContent = event.maxCapacity;
            document.getElementById('modalEventRegistered').textContent = event.registeredCount || 0;
            document.getElementById('eventDetailModal').style.display = 'block';
        }
    } catch (error) {
        showAlert('Could not load event detail', 'danger');
    }
}

// Hide modal logic
window.addEventListener('DOMContentLoaded', function() {
    const closeBtn = document.getElementById('closeEventDetailModal');
    if (closeBtn) {
        closeBtn.onclick = function() {
            document.getElementById('eventDetailModal').style.display = 'none';
        };
    }
    window.onclick = function(event) {
        const modal = document.getElementById('eventDetailModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
});

// Utility functions
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;
    
    const alertHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    alertContainer.innerHTML = alertHTML;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        const alert = alertContainer.querySelector('.alert');
        if (alert) {
            alert.remove();
        }
    }, 5000);
}

function showLoading(element) {
    if (!element) return;
    
    element.disabled = true;
    element.innerHTML = '<span class="loading"></span> Loading...';
}

function hideLoading(element) {
    if (!element) return;
    
    element.disabled = false;
    element.innerHTML = element.dataset.originalText || 'Submit';
}

// Store original button text
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.dataset.originalText = button.textContent;
    });
});

// Handle delete event
async function handleDeleteEvent(e) {
    const eventId = e.currentTarget.dataset.eventId;
    if (!confirm('Are you sure you want to delete this event?')) return;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/api/events/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        let data = {};
        try { data = await response.json(); } catch {}
        if (response.ok) {
            showAlert('Event deleted successfully!', 'success');
            if (typeof loadDashboardData === 'function') loadDashboardData();
            if (typeof loadEventsForRegistration === 'function') loadEventsForRegistration();
        } else if (response.status === 403) {
            showAlert('You do not have permission to delete this event.', 'danger');
        } else if (response.status === 404) {
            showAlert('Event not found. It may have already been deleted.', 'danger');
        } else {
            showAlert(data.message || 'Failed to delete event (server error)', 'danger');
        }
    } catch (error) {
        showAlert('A network or server error occurred while deleting the event.', 'danger');
    }
} 