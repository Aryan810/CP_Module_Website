const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Get all users
router.get('all/:admin_name', async (req, res) => {
    try {
        const admin = await User.findOne({'username': req.params.admin_name, 'role': 'admin'});
        if (!admin) {
            return res.status(403).json({message: 'Access denied! Only admins can view all users.'});
        }
        if (admin.loggedIn === false) {
            return res.status(403).json({message: 'Access denied! This Admin is not logged in.'});
        }
        // Fetching only one user for demonstration, change to User.find() for all users
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user by Username
router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({'username': req.params.username});
        if (!user) {
            return res.status(404).json({message: 'User not found !'});
        }
        if (!user.loggedIn) {
            return res.status(403).json({message: 'Access denied! This user is not logged in.'});
        }
        res.json(user);
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new user
router.post('/', async (req, res) => {
    try {
        // Validate required fields
        if (!req.body.username || !req.body.email || !req.body.cfusername || !req.body.password || !req.body.role) {
            return res.status(400).json({ message: 'Username, email, password, role, and Codeforces username are required !' });
        }
        const user = new User(req.body);
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (error){
        res.status(400).json({ message: error.message });
    }
});

// Login user
router.put('login/:username', async (req, res) => {
    try {
        const user = await User.findOne({'username': req.params.username});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.loggedIn) {
            return res.status(403).json({ message: 'User already logged in' });
        }
        const isPasswordCorrect = await User.comparePassword(req.body.password, user.password);
        if (!isPasswordCorrect){
            return res.status(400).json({ message: 'Incorrect password' });
        }
        user.loggedIn = true;
        const saved = await user.save();
        res.json(saved);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Logout user
router.put('logout/:username', async (req, res) => {
    try {
        const user = await User.findOne({'username': req.params.username});
        if (!user){
            return res.status(404).json({ message: 'User not found' });
        }
        if (!user.loggedIn) {
            return res.status(403).json({ message: 'User already logged out!' });
        }
        user.loggedIn = false;
        const saved = await user.save();
        res.json(saved);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update user
router.put('/:username', async (req, res) => {
    try {
        const user = await User.findOne({'username': req.params.username});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }   
        const isPasswordCorrect = await User.comparePassword(req.body.password, user.password);
        if (!isPasswordCorrect){
            return res.status(400).json({ message: 'Incorrect password' });
        }
        const saved = await user.save();
        res.json(saved);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete user
router.delete('/:username', async (req, res) => {
    try {
        const user = await User.findOne(req.params.username);
        if (!user) {
            return res.status(404).json({ message: 'User not found !' });
        }
        const isPasswordCorrect = await User.comparePassword(req.body.password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Incorrect password !' });
        }
        await User.deleteOne({ username: req.params.username });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
