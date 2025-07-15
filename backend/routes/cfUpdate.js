const express = require('express');
const User = require('../models/User');
const { updateUserCodeforcesData } = require('../services/codeforcesService');
const router = express.Router();

// Update Codeforces data for a specific user
router.put('/update-cf-data/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const success = await updateUserCodeforcesData(user.cfusername, User);
        
        if (success) {
            const updatedUser = await User.findOne({ username: req.params.username });
            res.json({
                message: 'Codeforces data updated successfully',
                cfImageUrl: updatedUser.cfImageUrl
            });
        } else {
            res.status(400).json({ message: 'Failed to update Codeforces data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
});

// Update Codeforces data for all users (admin only)
router.put('/update-all-cf-data/:adminUsername', async (req, res) => {
    try {
        const admin = await User.findOne({ username: req.params.adminUsername, role: 'admin' });
        
        if (!admin) {
            return res.status(403).json({ message: 'Access denied! Only admins can update all users.' });
        }

        const users = await User.find({}, 'cfusername');
        let updated = 0;
        let failed = 0;

        for (const user of users) {
            const success = await updateUserCodeforcesData(user.cfusername, User);
            if (success) {
                updated++;
            } else {
                failed++;
            }
        }

        res.json({
            message: 'Bulk update completed',
            updated,
            failed,
            total: users.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
});

module.exports = router;
