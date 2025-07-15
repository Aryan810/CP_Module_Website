const express = require('express');
const User = require('../models/User');
const { verifyCodeforcesUsername } = require('../utils/codeforcesVerification');
const router = express.Router();

// Get all users
router.get('/all/:admin_name', async (req, res) => {
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
        console.log('Registration attempt with data:', JSON.stringify(req.body, null, 2));
        
        // Validate required fields
        const requiredFields = ['username', 'email', 'cfusername', 'password', 'role'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            console.log('Missing required fields:', missingFields);
            return res.status(400).json({ 
                message: `Missing required fields: ${missingFields.join(', ')}`,
                requiredFields: requiredFields,
                receivedFields: Object.keys(req.body)
            });
        }
        
        // Check for existing user
        const existingUser = await User.findOne({
            $or: [
                { username: req.body.username },
                { email: req.body.email },
                { cfusername: req.body.cfusername }
            ]
        });
        
        if (existingUser) {
            console.log('User already exists:', existingUser.username);
            return res.status(400).json({ 
                message: 'User with this username, email, or Codeforces username already exists' 
            });
        }

        // Verify Codeforces username exists
        const cfVerification = await verifyCodeforcesUsername(req.body.cfusername);
        if (!cfVerification.exists) {
            const errorMessage = cfVerification.error || 'Codeforces username does not exist. Please enter a valid Codeforces username.';
            return res.status(400).json({ 
                message: errorMessage
            });
        }
        
        const user = new User(req.body);
        const savedUser = await user.save();
        console.log('User created successfully:', savedUser.username);
        
        // Return response without password
        const userResponse = {
            id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email,
            role: savedUser.role,
            name: savedUser.name,
            cfusername: savedUser.cfusername,
            loggedIn: savedUser.loggedIn,
            createdAt: savedUser.createdAt,
            updatedAt: savedUser.updatedAt
        };
        
        res.status(201).json({
            message: 'User created successfully',
            user: userResponse
        });
    } catch (error){
        console.error('Registration error:', error);
        
        // Handle specific MongoDB errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                message: `${field} already exists. Please choose a different ${field}.`
            });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: validationErrors
            });
        }
        
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
});

// Login user
router.put('/login/:username', async (req, res) => {
    try {
        console.log('Login attempt for username:', req.params.username);
        
        // Validate request body
        if (!req.body.password) {
            return res.status(400).json({ message: 'Password is required' });
        }
        
        const user = await User.findOne({'username': req.params.username});
        if (!user) {
            console.log('User not found:', req.params.username);
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (user.loggedIn) {
            console.log('User already logged in:', req.params.username);
            return res.status(403).json({ message: 'User already logged in' });
        }
        
        const isPasswordCorrect = await user.comparePassword(req.body.password);
        if (!isPasswordCorrect){
            console.log('Incorrect password for:', req.params.username);
            return res.status(400).json({ message: 'Incorrect password' });
        }
        
        user.loggedIn = true;
        const saved = await user.save();
        console.log('Login successful for:', req.params.username);
        
        // Return a clean response without sensitive data
        const userResponse = {
            id: saved._id,
            username: saved.username,
            email: saved.email,
            role: saved.role,
            name: saved.name,
            cfusername: saved.cfusername,
            loggedIn: saved.loggedIn,
            createdAt: saved.createdAt,
            updatedAt: saved.updatedAt
        };
        
        res.status(200).json({ 
            message: 'Login successful', 
            user: userResponse 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
});

// Logout user
router.put('/logout/:username', async (req, res) => {
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
        const isPasswordCorrect = await user.comparePassword(req.body.password);
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
        const user = await User.findOne({'username': req.params.username});
        if (!user) {
            return res.status(404).json({ message: 'User not found !' });
        }
        const isPasswordCorrect = await user.comparePassword(req.body.password);
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
