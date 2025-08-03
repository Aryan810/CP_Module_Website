const express = require('express');
const User = require('../models/User');
const { verifyCodeforcesUsername } = require('../utils/codeforcesVerification');
const { 
    fetchCodeforcesUserProfile, 
    fetchCodeforcesContests, 
    fetchContestStandings, 
    fetchUserContestHistory 
} = require('../services/codeforcesService');
const router = express.Router();

// Get leaderboard data with Codeforces information
router.get('/leaderboard', async (req, res) => {
    try {
        console.log('Fetching leaderboard data...');
        
        // First check all users in database
        const allUsers = await User.find().select('-password');
        console.log(`Total users in database: ${allUsers.length}`);
        
        // Log user details for debugging
        allUsers.forEach(user => {
            console.log(`User: ${user.username}, LoggedIn: ${user.loggedIn}, CF: ${user.cfusername}`);
        });
        
        // Get all users who have Codeforces usernames (remove loggedIn requirement for testing)
        const users = await User.find({ 
            cfusername: { $exists: true, $ne: '' }
        }).select('-password'); // Exclude password field
        
        console.log(`Found ${users.length} eligible users for leaderboard`);
        
        // If no users found, return sample data for testing
        if (users.length === 0) {
            console.log('No users found, returning empty array');
            return res.json([]);
        }
        
        // Fetch Codeforces data for each user
        const leaderboardData = await Promise.all(
            users.map(async (user) => {
                try {
                    const cfProfile = await fetchCodeforcesUserProfile(user.cfusername);
                    
                    return {
                        rank: 0, // Will be calculated after sorting
                        name: user.name || `${cfProfile?.firstName || ''} ${cfProfile?.lastName || ''}`.trim() || user.username,
                        username: user.cfusername,
                        rating: cfProfile?.rating || 0,
                        maxRating: cfProfile?.maxRating || 0,
                        contestsParticipated: 0, // Would need additional API call to get contest participation
                        problemsSolved: 0, // Would need additional API call to get solved problems
                        platform: "Codeforces",
                        avatar: user.cfImageUrl || cfProfile?.avatar || `https://via.placeholder.com/40/4ade80/ffffff?text=${(user.name || user.username).charAt(0)}`,
                        institute: cfProfile?.organization || "Unknown",
                        contestRating: cfProfile?.rating || 0,
                        lastContestRank: 0, // Would need additional API call
                        cfRank: cfProfile?.rank || 'unrated',
                        cfMaxRank: cfProfile?.maxRank || 'unrated'
                    };
                } catch (error) {
                    console.error(`Error fetching CF data for ${user.cfusername}:`, error);
                    
                    // Return user data without CF info if API fails
                    return {
                        rank: 0,
                        name: user.name || user.username,
                        username: user.cfusername,
                        rating: 0,
                        maxRating: 0,
                        contestsParticipated: 0,
                        problemsSolved: 0,
                        platform: "Codeforces",
                        avatar: user.cfImageUrl || `https://via.placeholder.com/40/4ade80/ffffff?text=${(user.name || user.username).charAt(0)}`,
                        institute: "Unknown",
                        contestRating: 0,
                        lastContestRank: 0,
                        cfRank: 'unrated',
                        cfMaxRank: 'unrated'
                    };
                }
            })
        );
        
        // Sort by rating and assign ranks
        const sortedData = leaderboardData
            .sort((a, b) => b.rating - a.rating)
            .map((user, index) => ({ ...user, rank: index + 1 }));
        
        console.log(`Returning ${sortedData.length} users in leaderboard`);
        res.json(sortedData);
        
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        res.status(500).json({ 
            message: 'Error fetching leaderboard data',
            error: error.message 
        });
    }
});

// Get Codeforces contests list
router.get('/contests', async (req, res) => {
    try {
        console.log('Fetching Codeforces contests...');
        
        const contests = await fetchCodeforcesContests(false); // Don't include gym contests
        
        console.log(`Found ${contests.length} contests`);
        res.json(contests);
        
    } catch (error) {
        console.error('Error fetching contests:', error);
        res.status(500).json({ 
            message: 'Error fetching contests',
            error: error.message 
        });
    }
});

// Get contest standings for a specific contest
router.get('/contest/:contestId/standings', async (req, res) => {
    try {
        const contestId = parseInt(req.params.contestId);
        console.log(`Fetching contest standings for contest ${contestId}...`);
        
        // Get all users with Codeforces usernames
        const users = await User.find({ 
            cfusername: { $exists: true, $ne: '' }
        }).select('cfusername');
        
        if (users.length === 0) {
            return res.json({
                contest: null,
                problems: [],
                standings: []
            });
        }
        
        const handles = users.map(user => user.cfusername);
        console.log(`Fetching standings for ${handles.length} users`);
        
        const contestData = await fetchContestStandings(contestId, handles);
        
        if (!contestData) {
            return res.status(404).json({
                message: 'Contest not found or no data available'
            });
        }
        
        // Enrich standings with user data from our database
        const enrichedStandings = await Promise.all(
            contestData.standings.map(async (standing) => {
                const user = await User.findOne({ cfusername: standing.handle }).select('name username cfImageUrl');
                
                // Calculate solved problems and their indices
                const solvedProblems = standing.problemResults
                    .map((result, index) => ({
                        index: contestData.problems[index]?.index || String.fromCharCode(65 + index), // A, B, C, etc.
                        solved: result.points > 0
                    }))
                    .filter(problem => problem.solved)
                    .map(problem => problem.index);
                
                // Calculate relative ranking among institute participants
                const instituteRank = contestData.standings
                    .filter(s => s.handle !== standing.handle)
                    .filter(s => s.rank < standing.rank).length + 1;
                
                return {
                    handle: standing.handle,
                    rank: standing.rank,
                    points: standing.points,
                    penalty: standing.penalty,
                    successfulHackCount: standing.successfulHackCount,
                    unsuccessfulHackCount: standing.unsuccessfulHackCount,
                    problemResults: standing.problemResults,
                    name: user?.name || standing.handle,
                    username: user?.username || standing.handle,
                    avatar: user?.cfImageUrl || `https://via.placeholder.com/40/4ade80/ffffff?text=${standing.handle.charAt(0)}`,
                    // Calculate solved problems count
                    solvedCount: standing.problemResults.filter(result => result.points > 0).length,
                    // List of solved problem indices (A, B, C, etc.)
                    solvedProblems: solvedProblems,
                    // Calculate total time (penalty in minutes)
                    totalTime: Math.floor(standing.penalty / 60),
                    // Global contest rank
                    globalRank: standing.rank,
                    // Relative rank among institute participants
                    instituteRank: instituteRank,
                    // Format problem results for better display
                    problems: standing.problemResults.map((result, index) => ({
                        ...result,
                        index: contestData.problems[index]?.index || String.fromCharCode(65 + index),
                        name: contestData.problems[index]?.name || `Problem ${String.fromCharCode(65 + index)}`,
                        solved: result.points > 0,
                        timeInMinutes: result.bestSubmissionTimeSeconds ? Math.floor(result.bestSubmissionTimeSeconds / 60) : null,
                        attempts: result.rejectedAttemptCount + (result.points > 0 ? 1 : 0)
                    }))
                };
            })
        );
        
        // Sort by rank
        enrichedStandings.sort((a, b) => a.rank - b.rank);
        
        // Recalculate institute ranks after sorting
        enrichedStandings.forEach((standing, index) => {
            standing.instituteRank = index + 1;
        });
        
        console.log('Sample enriched standing:', JSON.stringify(enrichedStandings[0], null, 2));
        
        res.json({
            contest: contestData.contest,
            problems: contestData.problems,
            standings: enrichedStandings
        });
        
    } catch (error) {
        console.error('Error fetching contest standings:', error);
        res.status(500).json({ 
            message: 'Error fetching contest standings',
            error: error.message 
        });
    }
});

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

        // Verify Codeforces username exists and fetch profile data
        const cfVerification = await verifyCodeforcesUsername(req.body.cfusername);
        if (!cfVerification.exists) {
            const errorMessage = cfVerification.error || 'Codeforces username does not exist. Please enter a valid Codeforces username.';
            return res.status(400).json({ 
                message: errorMessage
            });
        }

        // Fetch Codeforces profile data including image
        const cfProfile = await fetchCodeforcesUserProfile(req.body.cfusername);
        
        // Create user with Codeforces image URL
        const userData = {
            ...req.body,
            cfImageUrl: cfProfile?.avatar || ''
        };
        
        const user = new User(userData);
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
            cfImageUrl: savedUser.cfImageUrl,
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
            cfImageUrl: saved.cfImageUrl,
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
        console.log('Logout attempt for username:', req.params.username);
        
        const user = await User.findOne({'username': req.params.username});
        if (!user){
            console.log('User not found during logout:', req.params.username);
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (!user.loggedIn) {
            console.log('User already logged out:', req.params.username);
            return res.status(200).json({ message: 'User already logged out' });
        }
        
        user.loggedIn = false;
        const saved = await user.save();
        console.log('Logout successful for:', req.params.username);
        
        res.status(200).json({ 
            message: 'Logout successful',
            username: saved.username
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Internal server error: ' + error.message });
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
