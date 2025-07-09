const express = require('express');
const router = express.Router();

// Main routes
router.get('/', (req, res) => {
    res.json({
        message: 'API is working!'
    });
});

// Health check route
router.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString() 
    });
});

module.exports = router;
