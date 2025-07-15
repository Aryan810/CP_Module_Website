/**
 * Check if a Codeforces username exists
 * @param {string} cfusername - The Codeforces username to verify
 * @returns {Promise<{exists: boolean, error?: string}>} - Returns object with exists status and optional error
 */
async function verifyCodeforcesUsername(cfusername) {
    try {
        const response = await fetch(`https://codeforces.com/api/user.info?handles=${cfusername}`);
        
        if (!response.ok) {
            if (response.status >= 500) {
                return { exists: false, error: 'CF API not working' };
            }
        }
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.result && data.result.length > 0) {
            return { exists: true };
        }
        
        return { exists: false };
    } catch (error) {
        return { exists: false, error: 'CF API not working' };
    }
}

module.exports = {
    verifyCodeforcesUsername
};
