// Configuration for the Campus Connect app
export const config = {
  // API Configuration
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'http://localhost:8000',
  
  // Development settings
  IS_DEVELOPMENT: __DEV__,
  
  // API endpoints
  ENDPOINTS: {
    HEALTH: '/health',
    MAJORS: '/majors',
    CATEGORIES: '/categories',
    MAJOR_COLORS: '/major-colors',
    SIGNUP: '/signup',
    SIGNIN: '/signin',
    VERIFY_TOKEN: '/verify-token',
    PROFILE: '/profile',
    RECOMMENDATIONS: '/recommendations',
    PERSONALIZED_SCHOLARSHIPS: '/personalized-scholarships',
  },
  
  // Request timeout (in milliseconds)
  REQUEST_TIMEOUT: 10000,
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

export default config;
