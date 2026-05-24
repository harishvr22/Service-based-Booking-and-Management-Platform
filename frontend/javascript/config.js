// Frontend Configuration
// Automatically detects backend URL based on current host

const API_BASE_URL = (() => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = 5000;
    
    // 1. Check if running under the file:// protocol (local files)
    if (protocol === 'file:' || !hostname) {
        return `http://localhost:${port}`;
    }
    
    // 2. Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `${protocol}//localhost:${port}`;
    }
    
    // 3. Production Deployment (Render)
    // IMPORTANT: Replace the placeholder below with your actual deployed Render backend URL.
    // Example: 'https://apartment-service-backend.onrender.com'
    const PRODUCTION_BACKEND_URL = 'https://service-based-booking-and-management.onrender.com';
    
    if (PRODUCTION_BACKEND_URL.includes('YOUR_BACKEND_SERVICE')) {
        console.warn(
            "⚠️ [CONFIG WARNING]: Production backend URL is not configured in 'frontend/javascript/config.js'. " +
            "Please replace 'YOUR_BACKEND_SERVICE' with your actual Render backend URL."
        );
        // Fallback to same-origin (useful if serving frontend and backend from the same domain)
        return `${protocol}//${hostname}`;
    }
    
    return PRODUCTION_BACKEND_URL;
})();

// Export for use in other modules
window.API_BASE_URL = API_BASE_URL;
