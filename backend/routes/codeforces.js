const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Helper function to check user authorization
async function checkUserAuth(username) {
    const user = await User.findOne({'username': username});
    if (!user) {
        throw new Error('User not found');
    }
    if (!user.loggedIn) {
        throw new Error('User is not logged in');
    }
    if (!user.cfusername) {
        throw new Error('Codeforces username not found for this user');
    }
    return user.cfusername;
}

// Helper function to fetch CF user info
async function fetchCfUserInfo(cfUsername) {
    const userInfoUrl = `https://codeforces.com/api/user.info?handles=${cfUsername}`;
    const response = await fetch(userInfoUrl);
    const data = await response.json();
    
    if (data.status !== 'OK') {
        throw new Error('Failed to fetch user info from Codeforces');
    }
    return data.result[0];
}

// Helper function to fetch contest history
async function fetchContestHistory(cfUsername) {
    const contestUrl = `https://codeforces.com/api/user.rating?handle=${cfUsername}`;
    const response = await fetch(contestUrl);
    const data = await response.json();
    
    return data.status === 'OK' ? data.result : [];
}

// Helper function to fetch recent submissions
async function fetchRecentSubmissions(cfUsername, count = 10) {
    const statusUrl = `https://codeforces.com/api/user.status?handle=${cfUsername}&from=1&count=${count}`;
    const response = await fetch(statusUrl);
    const data = await response.json();
    
    return data.status === 'OK' ? data.result : [];
}

// Helper function to format profile data
function formatProfile(cfUser) {
    return {
        handle: cfUser.handle,
        firstName: cfUser.firstName || '',
        lastName: cfUser.lastName || '',
        country: cfUser.country || '',
        city: cfUser.city || '',
        organization: cfUser.organization || '',
        avatar: cfUser.avatar || '',
        titlePhoto: cfUser.titlePhoto || '',
        rank: cfUser.rank || 'unrated',
        rating: cfUser.rating || 0,
        maxRank: cfUser.maxRank || 'unrated',
        maxRating: cfUser.maxRating || 0,
        lastOnlineTime: cfUser.lastOnlineTimeSeconds ? new Date(cfUser.lastOnlineTimeSeconds * 1000) : null,
        registrationTime: cfUser.registrationTimeSeconds ? new Date(cfUser.registrationTimeSeconds * 1000) : null,
        friendOfCount: cfUser.friendOfCount || 0,
        contribution: cfUser.contribution || 0
    };
}

// Helper function to format contest data
function formatContests(contestHistory) {
    return {
        totalContests: contestHistory.length,
        contestHistory: contestHistory.map(contest => ({
            contestId: contest.contestId,
            contestName: contest.contestName,
            handle: contest.handle,
            rank: contest.rank,
            oldRating: contest.oldRating,
            newRating: contest.newRating,
            ratingUpdateTime: new Date(contest.ratingUpdateTimeSeconds * 1000)
        }))
    };
}

// Helper function to format submissions
function formatSubmissions(submissions, limit = 5) {
    return submissions.slice(0, limit).map(submission => ({
        id: submission.id,
        contestId: submission.contestId,
        problemIndex: submission.problem.index,
        problemName: submission.problem.name,
        problemRating: submission.problem.rating,
        verdict: submission.verdict,
        programmingLanguage: submission.programmingLanguage,
        creationTime: new Date(submission.creationTimeSeconds * 1000)
    }));
}

// Helper function to calculate stats
function calculateStats(cfUser, contestHistory, submissions) {
    return {
        isOnline: cfUser.lastOnlineTimeSeconds ? (Date.now() - cfUser.lastOnlineTimeSeconds * 1000) < 60000 : false,
        totalSubmissions: submissions.length >= 10 ? '10+' : submissions.length,
        ratingChange: contestHistory.length > 0 ? 
            contestHistory[contestHistory.length - 1].newRating - contestHistory[contestHistory.length - 1].oldRating : 0
    };
}

// GET /basic - Basic profile info only
router.get('/basic/:username', async (req, res) => {
    try {
        const cfUsername = await checkUserAuth(req.params.username);
        const cfUser = await fetchCfUserInfo(cfUsername);
        
        res.json({
            success: true,
            username: req.params.username,
            basic: {
                handle: cfUser.handle,
                rating: cfUser.rating || 0,
                maxRating: cfUser.maxRating || 0,
                rank: cfUser.rank || 'unrated',
                isOnline: cfUser.lastOnlineTimeSeconds ? (Date.now() - cfUser.lastOnlineTimeSeconds * 1000) < 60000 : false
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET /profile - Full profile info
router.get('/profile/:username', async (req, res) => {
    try {
        const cfUsername = await checkUserAuth(req.params.username);
        const cfUser = await fetchCfUserInfo(cfUsername);
        
        res.json({
            success: true,
            username: req.params.username,
            profile: formatProfile(cfUser)
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET /contests - Contest history only
router.get('/contests/:username', async (req, res) => {
    try {
        const cfUsername = await checkUserAuth(req.params.username);
        const contestHistory = await fetchContestHistory(cfUsername);
        
        res.json({
            success: true,
            username: req.params.username,
            contests: formatContests(contestHistory)
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET /submissions - Recent submissions only
router.get('/submissions/:username', async (req, res) => {
    try {
        const cfUsername = await checkUserAuth(req.params.username);
        const count = parseInt(req.query.count) || 10;
        const submissions = await fetchRecentSubmissions(cfUsername, count);
        
        res.json({
            success: true,
            username: req.params.username,
            submissions: formatSubmissions(submissions, count)
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET /stats - Statistics only
router.get('/stats/:username', async (req, res) => {
    try {
        const cfUsername = await checkUserAuth(req.params.username);
        const [cfUser, contestHistory, submissions] = await Promise.all([
            fetchCfUserInfo(cfUsername),
            fetchContestHistory(cfUsername),
            fetchRecentSubmissions(cfUsername, 10)
        ]);
        
        res.json({
            success: true,
            username: req.params.username,
            stats: calculateStats(cfUser, contestHistory, submissions)
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET /full - Complete data (original endpoint)
router.get('/full/:username', async (req, res) => {
    try {
        const cfUsername = await checkUserAuth(req.params.username);
        
        const [cfUser, contestHistory, submissions] = await Promise.all([
            fetchCfUserInfo(cfUsername),
            fetchContestHistory(cfUsername),
            fetchRecentSubmissions(cfUsername, 10)
        ]);

        const cfData = {
            profile: formatProfile(cfUser),
            contests: formatContests(contestHistory),
            recentActivity: {
                submissions: formatSubmissions(submissions, 5)
            },
            stats: calculateStats(cfUser, contestHistory, submissions)
        };

        res.json({
            success: true,
            username: req.params.username,
            cf: cfData
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET /:username - Alias for /full/:username for backward compatibility
router.get('/:username', async (req, res) => {
    req.url = `/full/${req.params.username}`;
    return router.handle(req, res);
});

module.exports = router;

