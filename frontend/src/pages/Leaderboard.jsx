import React, { useState, useEffect } from 'react';
import './Leaderboard.css';

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('all'); // New state for active tab
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // Sample leaderboard data - replace with actual API data
  const sampleData = [
    // Codeforces users
    {
      rank: 1,
      name: "Alice Johnson",
      username: "alice_codes",
      rating: 2150,
      maxRating: 2200,
      contestsParticipated: 45,
      problemsSolved: 850,
      platform: "Codeforces",
      avatar: "https://via.placeholder.com/40/4ade80/ffffff?text=AJ",
      institute: "IITG"
    },
    {
      rank: 2,
      name: "Bob Smith",
      username: "bob_algorithms",
      rating: 2080,
      maxRating: 2120,
      contestsParticipated: 38,
      problemsSolved: 720,
      platform: "Codeforces",
      avatar: "https://via.placeholder.com/40/22c55e/ffffff?text=BS",
      institute: "IITG"
    },
    {
      rank: 8,
      name: "Grace Wilson",
      username: "grace_coder",
      rating: 1650,
      maxRating: 1700,
      contestsParticipated: 28,
      problemsSolved: 450,
      platform: "Codeforces",
      avatar: "https://via.placeholder.com/40/4ade80/ffffff?text=GW",
      institute: "IITG"
    },
    // CodeChef users
    {
      rank: 3,
      name: "Charlie Brown",
      username: "charlie_cp",
      rating: 1950,
      maxRating: 2000,
      contestsParticipated: 42,
      problemsSolved: 680,
      platform: "CodeChef",
      avatar: "https://via.placeholder.com/40/16a34a/ffffff?text=CB",
      institute: "IITG"
    },
    {
      rank: 7,
      name: "Henry Davis",
      username: "henry_chef",
      rating: 1720,
      maxRating: 1750,
      contestsParticipated: 25,
      problemsSolved: 380,
      platform: "CodeChef",
      avatar: "https://via.placeholder.com/40/16a34a/ffffff?text=HD",
      institute: "IITG"
    },
    // LeetCode users
    {
      rank: 4,
      name: "Diana Prince",
      username: "diana_debug",
      rating: 1890,
      maxRating: 1920,
      contestsParticipated: 35,
      problemsSolved: 620,
      platform: "LeetCode",
      avatar: "https://via.placeholder.com/40/15803d/ffffff?text=DP",
      institute: "IITG"
    },
    {
      rank: 9,
      name: "Ivy Chen",
      username: "ivy_leetcode",
      rating: 1580,
      maxRating: 1620,
      contestsParticipated: 32,
      problemsSolved: 420,
      platform: "LeetCode",
      avatar: "https://via.placeholder.com/40/15803d/ffffff?text=IC",
      institute: "IITG"
    },
    // AtCoder users
    {
      rank: 5,
      name: "Ethan Hunt",
      username: "ethan_elite",
      rating: 1820,
      maxRating: 1870,
      contestsParticipated: 40,
      problemsSolved: 590,
      platform: "AtCoder",
      avatar: "https://via.placeholder.com/40/4ade80/ffffff?text=EH",
      institute: "IITG"
    },
    {
      rank: 6,
      name: "Fiona Green",
      username: "fiona_fast",
      rating: 1780,
      maxRating: 1800,
      contestsParticipated: 30,
      problemsSolved: 520,
      platform: "AtCoder",
      avatar: "https://via.placeholder.com/40/22c55e/ffffff?text=FG",
      institute: "IITG"
    },
    {
      rank: 10,
      name: "Jack Robinson",
      username: "jack_atcoder",
      rating: 1520,
      maxRating: 1580,
      contestsParticipated: 22,
      problemsSolved: 350,
      platform: "AtCoder",
      avatar: "https://via.placeholder.com/40/22c55e/ffffff?text=JR",
      institute: "IITG"
    }
  ];

  useEffect(() => {
    // Initialize data
    setLeaderboardData(sampleData);
    setFilteredData(sampleData);
  }, []);

  useEffect(() => {
    // Filter data based on active tab only
    let filtered = leaderboardData;
    
    // Filter by platform tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(user => user.platform.toLowerCase() === activeTab.toLowerCase());
    }
    
    // Re-rank the filtered data
    const rankedData = filtered
      .sort((a, b) => b.rating - a.rating)
      .map((user, index) => ({ ...user, rank: index + 1 }));
    
    setFilteredData(rankedData);
  }, [leaderboardData, activeTab]);

  const getRankBadgeClass = (rank) => {
    if (rank === 1) return 'rank-badge gold';
    if (rank === 2) return 'rank-badge silver';
    if (rank === 3) return 'rank-badge bronze';
    return 'rank-badge default';
  };

  const getPlatformColor = (platform) => {
    const colors = {
      'Codeforces': '#1f8ef1',
      'CodeChef': '#5b4638',
      'LeetCode': '#ffa116',
      'AtCoder': '#3c4043',
      'HackerRank': '#00ea64'
    };
    return colors[platform] || '#4ade80';
  };

  const tabs = [
    { id: 'all', name: 'All Platforms', icon: '🌐', color: '#4ade80' },
    { id: 'codeforces', name: 'Codeforces', icon: '🔵', color: '#1f8ef1' },
    { id: 'codechef', name: 'CodeChef', icon: '🍳', color: '#5b4638' },
    { id: 'leetcode', name: 'LeetCode', icon: '🟡', color: '#ffa116' },
    { id: 'atcoder', name: 'AtCoder', icon: '🟠', color: '#3c4043' }
  ];

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1 className="leaderboard-title">🏆 Leaderboard</h1>
        <p className="leaderboard-subtitle">Top performers in competitive programming</p>
      </div>

      {/* Platform Tabs */}
      <div className="platform-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              '--tab-color': tab.color,
              '--tab-color-hover': tab.color + '20'
            }}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-name">{tab.name}</span>
            <span className="tab-count">
              {tab.id === 'all' 
                ? leaderboardData.length 
                : leaderboardData.filter(user => user.platform.toLowerCase() === tab.id.toLowerCase()).length
              }
            </span>
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="results-info">
        <span className="results-count">
          Showing {filteredData.length} of {activeTab === 'all' 
            ? leaderboardData.length 
            : leaderboardData.filter(user => user.platform.toLowerCase() === activeTab.toLowerCase()).length
          } participants
          {activeTab !== 'all' && (
            <span className="active-filter"> on {tabs.find(tab => tab.id === activeTab)?.name}</span>
          )}
        </span>
      </div>

      {/* Leaderboard Table */}
      <div className="table-container">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th className="rank-column">Rank</th>
              <th className="user-column">User</th>
              <th className="rating-column">Current Rating</th>
              <th className="max-rating-column">Max Rating</th>
              <th className="contests-column">Contests</th>
              <th className="problems-column">Problems</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((user, index) => (
                <tr key={user.username} className="table-row">
                  <td className="rank-cell">
                    <div className={getRankBadgeClass(user.rank)}>
                      {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : user.rank}
                    </div>
                  </td>
                  <td className="user-cell">
                    <div className="user-info">
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="user-avatar"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/40/4ade80/ffffff?text=${user.name.charAt(0)}`;
                        }}
                      />
                      <div className="user-details">
                        <span className="user-name">{user.name}</span>
                        <span className="user-username">@{user.username}</span>
                        <span className="user-institute">{user.institute}</span>
                      </div>
                    </div>
                  </td>
                  <td className="rating-cell">
                    <span className="current-rating">{user.rating}</span>
                  </td>
                  <td className="max-rating-cell">
                    <span className="max-rating">{user.maxRating}</span>
                  </td>
                  <td className="contests-cell">
                    <span className="contests-count">{user.contestsParticipated}</span>
                  </td>
                  <td className="problems-cell">
                    <span className="problems-count">{user.problemsSolved}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-results">
                  <div className="no-results-content">
                    <span className="no-results-icon">🔍</span>
                    <span className="no-results-text">No participants match the current filters</span>
                    <span className="no-results-suggestion">Try adjusting the filter criteria</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Statistics Footer */}
      <div className="leaderboard-stats">
        <div className="stat-item">
          <span className="stat-value">{leaderboardData.length}</span>
          <span className="stat-label">Total Participants</span>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
