// Google Places API Configuration Example
// Copy this file to config.js and add your actual API key

const CONFIG = {
    GOOGLE_PLACES_API_KEY: 'YOUR_API_KEY_HERE'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
