// Environment configuration utility
// This file helps you access environment variables consistently across your app

const config = {
  // Server configuration (accessible because of VITE_ prefix)
  port: import.meta.env.VITE_PORT || '3000',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  
  // App configuration (accessible because of VITE_ prefix)
  appTitle: import.meta.env.VITE_APP_TITLE || 'CodeWars',
  
  // These are always available in Vite (no VITE_ prefix needed)
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  
  // Example: These would be undefined if you tried to access them
  // secretKey: import.meta.env.API_SECRET_KEY,     // ❌ undefined (no VITE_ prefix)
  // dbPassword: import.meta.env.DATABASE_PASSWORD, // ❌ undefined (no VITE_ prefix)
};

export default config;
