/**
 * Codeforces API service to fetch user profile data, contests, and contest standings
 */

/**
 * Fetch user profile data from Codeforces API
 * @param {string} cfusername - Codeforces username
 * @returns {Promise<Object>} User profile data including image URL
 */
async function fetchCodeforcesUserProfile(cfusername) {
    try {
        const response = await fetch(`https://codeforces.com/api/user.info?handles=${cfusername}`);
        const data = await response.json();
        
        if (data.status === 'OK' && data.result && data.result.length > 0) {
            const userProfile = data.result[0];
            
            return {
                handle: userProfile.handle,
                firstName: userProfile.firstName || '',
                lastName: userProfile.lastName || '',
                avatar: userProfile.avatar || userProfile.titlePhoto || '',
                rating: userProfile.rating || 0,
                maxRating: userProfile.maxRating || 0,
                rank: userProfile.rank || 'unrated',
                maxRank: userProfile.maxRank || 'unrated',
                organization: userProfile.organization || '',
                city: userProfile.city || '',
                country: userProfile.country || ''
            };
        }
        
        return null;
    } catch (error) {
        console.error(`Error fetching Codeforces profile for ${cfusername}:`, error);
        return null;
    }
}

/**
 * Fetch list of Codeforces contests
 * @param {boolean} gym - Whether to include gym contests
 * @returns {Promise<Array>} List of contests
 */
async function fetchCodeforcesContests(gym = false) {
    try {
        const response = await fetch(`https://codeforces.com/api/contest.list?gym=${gym}`);
        const data = await response.json();
        
        if (data.status === 'OK' && data.result) {
            // Filter only finished contests and sort by start time (most recent first)
            const finishedContests = data.result
                .filter(contest => contest.phase === 'FINISHED')
                .sort((a, b) => b.startTimeSeconds - a.startTimeSeconds)
                .slice(0, 50) // Get last 50 contests
                .map(contest => ({
                    id: contest.id,
                    name: contest.name,
                    type: contest.type,
                    phase: contest.phase,
                    durationSeconds: contest.durationSeconds,
                    startTimeSeconds: contest.startTimeSeconds,
                    relativeTimeSeconds: contest.relativeTimeSeconds
                }));
            
            return finishedContests;
        }
        
        return [];
    } catch (error) {
        console.error('Error fetching Codeforces contests:', error);
        return [];
    }
}

/**
 * Fetch contest standings for a specific contest
 * @param {number} contestId - Contest ID
 * @param {Array} handles - Array of Codeforces handles to fetch data for
 * @returns {Promise<Object>} Contest standings data
 */
async function fetchContestStandings(contestId, handles) {
    try {
        const handlesParam = handles.join(';');
        const response = await fetch(`https://codeforces.com/api/contest.standings?contestId=${contestId}&handles=${handlesParam}&showUnofficial=false`);
        const data = await response.json();
        
        if (data.status === 'OK' && data.result) {
            const contest = data.result.contest;
            const problems = data.result.problems;
            const rows = data.result.rows;
            
            // Process standings data
            const standings = rows.map(row => {
                const party = row.party;
                const rank = row.rank;
                const points = row.points;
                const penalty = row.penalty;
                const successfulHackCount = row.successfulHackCount;
                const unsuccessfulHackCount = row.unsuccessfulHackCount;
                
                // Process problem results
                const problemResults = row.problemResults.map((result, index) => ({
                    problemIndex: problems[index]?.index || '',
                    problemName: problems[index]?.name || '',
                    points: result.points,
                    penalty: result.penalty,
                    rejectedAttemptCount: result.rejectedAttemptCount,
                    type: result.type,
                    bestSubmissionTimeSeconds: result.bestSubmissionTimeSeconds
                }));
                
                return {
                    handle: party.members[0]?.handle || '',
                    rank: rank,
                    points: points,
                    penalty: penalty,
                    successfulHackCount: successfulHackCount,
                    unsuccessfulHackCount: unsuccessfulHackCount,
                    problemResults: problemResults
                };
            });
            
            return {
                contest: {
                    id: contest.id,
                    name: contest.name,
                    type: contest.type,
                    phase: contest.phase,
                    durationSeconds: contest.durationSeconds,
                    startTimeSeconds: contest.startTimeSeconds
                },
                problems: problems.map(problem => ({
                    index: problem.index,
                    name: problem.name,
                    type: problem.type,
                    points: problem.points,
                    rating: problem.rating,
                    tags: problem.tags
                })),
                standings: standings
            };
        }
        
        return null;
    } catch (error) {
        console.error(`Error fetching contest standings for contest ${contestId}:`, error);
        return null;
    }
}

/**
 * Fetch user's contest participation history
 * @param {string} handle - Codeforces handle
 * @returns {Promise<Array>} User's contest history
 */
async function fetchUserContestHistory(handle) {
    try {
        const response = await fetch(`https://codeforces.com/api/user.rating?handle=${handle}`);
        const data = await response.json();
        
        if (data.status === 'OK' && data.result) {
            return data.result.map(contest => ({
                contestId: contest.contestId,
                contestName: contest.contestName,
                handle: contest.handle,
                rank: contest.rank,
                ratingUpdateTimeSeconds: contest.ratingUpdateTimeSeconds,
                oldRating: contest.oldRating,
                newRating: contest.newRating
            }));
        }
        
        return [];
    } catch (error) {
        console.error(`Error fetching contest history for ${handle}:`, error);
        return [];
    }
}

/**
 * Update user's Codeforces data in database
 * @param {string} cfusername - Codeforces username
 * @param {Object} User - Mongoose User model
 * @returns {Promise<boolean>} Success status
 */
async function updateUserCodeforcesData(cfusername, User) {
    try {
        const cfProfile = await fetchCodeforcesUserProfile(cfusername);
        
        if (cfProfile) {
            await User.findOneAndUpdate(
                { cfusername: cfusername },
                {
                    cfImageUrl: cfProfile.avatar,
                    // You can add more fields if needed
                    // cfRating: cfProfile.rating,
                    // cfMaxRating: cfProfile.maxRating,
                    // cfRank: cfProfile.rank,
                    // cfMaxRank: cfProfile.maxRank
                }
            );
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`Error updating Codeforces data for ${cfusername}:`, error);
        return false;
    }
}

module.exports = {
    fetchCodeforcesUserProfile,
    fetchCodeforcesContests,
    fetchContestStandings,
    fetchUserContestHistory,
    updateUserCodeforcesData
};
