/**
 * Codeforces API service to fetch user profile data
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
    updateUserCodeforcesData
};
