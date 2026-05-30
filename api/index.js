// Vercel serverless entry point.
// Re-exports the Express app from /backend so all routes work as a single function.
module.exports = require('../backend/index.js');
