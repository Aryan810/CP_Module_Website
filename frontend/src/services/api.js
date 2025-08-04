// API service for making HTTP requests

// Use environment variable if available, otherwise use relative path for production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:3001/api' : '/api');

class ApiService {
  async fetchLeaderboardData() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/leaderboard`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Leaderboard data fetched:', data);
      return data;
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      throw error;
    }
  }

  async fetchUserByUsername(username) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${username}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  async fetchContests() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/contests`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Contests data fetched:', data);
      return data;
    } catch (error) {
      console.error('Error fetching contests:', error);
      throw error;
    }
  }

  async fetchContestStandings(contestId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/contest/${contestId}/standings`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Contest standings data fetched:', data);
      return data;
    } catch (error) {
      console.error('Error fetching contest standings:', error);
      throw error;
    }
  }
}

export default new ApiService();
