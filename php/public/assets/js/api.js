// CheckIN - API Client
class API {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = this.baseURL + endpoint;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'same-origin',
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            // Log response details for debugging
            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));
            
            // Get the response text first
            const text = await response.text();
            console.log('Response text length:', text.length);
            console.log('Response text (first 200 chars):', text.substring(0, 200));
            
            // Check if response is empty
            if (!text || text.trim() === '') {
                console.error('Server returned empty response');
                throw new Error('Server returned empty response');
            }
            
            // Try to parse as JSON
            let data;
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                console.error('Failed to parse JSON response. Full text:', text);
                console.error('Parse error:', parseError);
                throw new Error('Server returned invalid JSON. Check console for details.');
            }

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async login(username, password) {
        return this.request('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    }

    async logout() {
        return this.request('/logout', {
            method: 'POST'
        });
    }

    // User endpoints
    async getUserOverview(userID, startCW, startYear, endCW, endYear) {
        const params = new URLSearchParams();
        if (userID) params.append('userID', userID);
        if (startCW) params.append('startCW', startCW);
        if (startYear) params.append('startYear', startYear);
        if (endCW) params.append('endCW', endCW);
        if (endYear) params.append('endYear', endYear);
        
        return this.request(`/api/v1/overview/user?${params}`);
    }

    async getGroupOverview(group, cw, year) {
        const params = new URLSearchParams({ group, cw, year });
        return this.request(`/api/v1/overview/group?${params}`);
    }

    // Health check
    async getHealth() {
        return this.request('/health');
    }

    // Config endpoint
    async getConfig() {
        return this.request('/api/v1/config');
    }

    // Event endpoints
    async createEvent(eventData) {
        return this.request('/api/v1/events', {
            method: 'POST',
            body: JSON.stringify(eventData)
        });
    }

    async getEvents(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/api/v1/events?${params}`);
    }

    async deleteEvent(eventId) {
        return this.request(`/api/v1/events/${eventId}`, {
            method: 'DELETE'
        });
    }

    // Attendance endpoints
    async recordAttendance(attendanceData) {
        return this.request('/api/v1/attendances', {
            method: 'POST',
            body: JSON.stringify(attendanceData)
        });
    }

    async getAttendances(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/api/v1/attendances?${params}`);
    }

    // QR Code endpoints
    async generateQRCode(eventId) {
        return this.request(`/api/v1/qr/generate/${eventId}`);
    }

    async validateQRCode(code) {
        return this.request('/api/v1/qr/validate', {
            method: 'POST',
            body: JSON.stringify({ code })
        });
    }
}

// Initialize API client
const api = new API();

// Utility functions
const utils = {
    // Get current calendar week
    getCurrentWeek() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const diff = now - start + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        const oneWeek = 604800000; // milliseconds in a week
        return Math.ceil(diff / oneWeek);
    },

    // Format date
    formatDate(date) {
        return new Date(date).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    // Format time
    formatTime(date) {
        return new Date(date).toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Show alert
    showAlert(message, type = 'success') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        const container = document.querySelector('.container') || document.body;
        container.insertBefore(alert, container.firstChild);
        
        setTimeout(() => alert.remove(), 5000);
    },

    // Show loading spinner
    showLoading(element) {
        element.innerHTML = '<div class="spinner"></div>';
    },

    // Get user from session/cookie
    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Save user to session
    saveUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },

    // Clear user session
    clearUser() {
        localStorage.removeItem('user');
    },

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getCurrentUser();
    },

    // Redirect if not authenticated
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/pages/login.html';
            return false;
        }
        return true;
    },

    // Check permission level
    hasPermission(requiredLevel) {
        const user = this.getCurrentUser();
        return user && user.permission >= requiredLevel;
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API, api, utils };
}
