// Frontend Configuration
// Automatically detects backend URL based on current host

const API_BASE_URL = (() => {
    const hostname = window.location.hostname;
    const port = 5000;
    const protocol = window.location.protocol;
    
    // If running under the file:// protocol, fallback to localhost:5000
    if (protocol === 'file:' || !hostname) {
        return `http://localhost:${port}`;
    }
    
    // For localhost development, allow any hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `${protocol}//localhost:${port}`;
    }
    
    // Production: use current host
    return `${protocol}//${hostname}:${port}`;
})();

// Export for use in other modules
window.API_BASE_URL = API_BASE_URL;
