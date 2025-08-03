import React, { useState, useEffect } from 'react';
import './Leaderboard.css';
import ApiService from '../services/api';

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('codeforces'); // Default to first platform
  const [activeSubTab, setActiveSubTab] = useState('overall'); // Default to overall ranking
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // Show 50 items per page
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Contest-specific state
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [contestStandings, setContestStandings] = useState([]);
  const [contestLoading, setContestLoading] = useState(false);

  useEffect(() => {
    // Fetch leaderboard data and contests from API
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both leaderboard data and contests in parallel
        const [leaderboardResponse, contestsResponse] = await Promise.all([
          ApiService.fetchLeaderboardData(),
          ApiService.fetchContests()
        ]);
        
        console.log('Fetched leaderboard data:', leaderboardResponse);
        console.log('Fetched contests:', contestsResponse);
        
        setLeaderboardData(leaderboardResponse);
        setFilteredData(leaderboardResponse);
        setContests(contestsResponse);
        
        // Set the most recent contest as default if available
        if (contestsResponse && contestsResponse.length > 0) {
          setSelectedContest(contestsResponse[0]);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch contest standings when contest is selected
  useEffect(() => {
    const fetchContestStandings = async () => {
      if (activeSubTab === 'contest' && selectedContest) {
        try {
          setContestLoading(true);
          const standings = await ApiService.fetchContestStandings(selectedContest.id);
          console.log('Fetched contest standings:', standings);
          console.log('First standing:', standings.standings?.[0]);
          setContestStandings(standings.standings || []);
        } catch (err) {
          console.error('Failed to fetch contest standings:', err);
          setContestStandings([]);
        } finally {
          setContestLoading(false);
        }
      }
    };

    fetchContestStandings();
  }, [selectedContest, activeSubTab]);

  useEffect(() => {
    // Filter data based on active tab and sub-tab
    let filtered = [];
    
    if (activeSubTab === 'contest' && contestStandings.length > 0) {
      // Use contest standings data
      filtered = contestStandings.filter(user => activeTab === 'codeforces'); // Since we only have Codeforces for now
    } else {
      // Use regular leaderboard data
      filtered = leaderboardData.filter(user => user.platform.toLowerCase() === activeTab.toLowerCase());
      
      // Sort and rank based on sub-tab selection
      if (activeSubTab === 'contest') {
        // Contest-wise ranking: sort by contest rating and last contest rank
        filtered = filtered
          .sort((a, b) => {
            // Primary sort by contest rating (descending)
            if (a.contestRating !== b.contestRating) {
              return b.contestRating - a.contestRating;
            }
            // Secondary sort by last contest rank (ascending - lower rank is better)
            return a.lastContestRank - b.lastContestRank;
          })
          .map((user, index) => ({ ...user, rank: index + 1 }));
      } else {
        // Overall ranking: sort by overall rating
        filtered = filtered
          .sort((a, b) => b.rating - a.rating)
          .map((user, index) => ({ ...user, rank: index + 1 }));
      }
    }
    
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filtering changes
  }, [leaderboardData, contestStandings, activeTab, activeSubTab]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getVisiblePages = () => {
    const maxVisiblePages = 5;
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(currentPage - half, 1);
    let end = Math.min(start + maxVisiblePages - 1, totalPages);
    
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(end - maxVisiblePages + 1, 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

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
    { id: 'codeforces', name: 'Codeforces' }
    // Note: Other platforms will be added when their data becomes available
    // { id: 'codechef', name: 'CodeChef' },
    // { id: 'leetcode', name: 'LeetCode' },
    // { id: 'atcoder', name: 'AtCoder' }
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <h1 className="leaderboard-title">🏆 Leaderboard</h1>
          <p className="leaderboard-subtitle">Loading leaderboard data...</p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Fetching latest rankings...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <h1 className="leaderboard-title">🏆 Leaderboard</h1>
          <p className="leaderboard-subtitle">Error loading data</p>
        </div>
        <div className="error-container">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-text">Failed to load leaderboard data</span>
            <span className="error-details">{error}</span>
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1 className="leaderboard-title">🏆 Leaderboard</h1>
        <p className="leaderboard-subtitle">Top performers in competitive programming</p>
      </div>

      {/* Combined Tabs Container */}
      <div className="tabs-container">
        {/* Platform Tabs */}
        <div className="platform-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-name">{tab.name}</span>
              <span className="tab-count">
                {leaderboardData.filter(user => user.platform.toLowerCase() === tab.id.toLowerCase()).length}
              </span>
            </button>
          ))}
        </div>

        {/* Sub-tabs for Ranking Type */}
        <div className="sub-tabs">
          <button
            className={`sub-tab-button ${activeSubTab === 'overall' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('overall')}
          >
            <span className="sub-tab-icon">📊</span>
            <span className="sub-tab-name">Overall Ranking</span>
          </button>
          <button
            className={`sub-tab-button ${activeSubTab === 'contest' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('contest')}
          >
            <span className="sub-tab-icon">🏁</span>
            <span className="sub-tab-name">Contest Wise</span>
          </button>
        </div>
      </div>

      {/* Contest Selection Dropdown - Show only when contest tab is active */}
      {activeSubTab === 'contest' && (
        <div className="contest-selection">
          <div className="contest-dropdown-container">
            <label htmlFor="contest-select" className="contest-label">
              <span className="contest-icon">🏆</span>
              Select Contest:
            </label>
            <select
              id="contest-select"
              className="contest-dropdown"
              value={selectedContest?.id || ''}
              onChange={(e) => {
                const contest = contests.find(c => c.id === parseInt(e.target.value));
                setSelectedContest(contest);
              }}
            >
              <option value="">Choose a contest...</option>
              {contests.map((contest) => (
                <option key={contest.id} value={contest.id}>
                  {contest.name} - {new Date(contest.startTimeSeconds * 1000).toLocaleDateString()}
                </option>
              ))}
            </select>
            {selectedContest && (
              <div className="contest-info">
                <span className="contest-date">
                  📅 {new Date(selectedContest.startTimeSeconds * 1000).toLocaleString()}
                </span>
                <span className="contest-duration">
                  ⏱️ {Math.floor(selectedContest.durationSeconds / 3600)}h {Math.floor((selectedContest.durationSeconds % 3600) / 60)}m
                </span>
                <span className="contest-type">
                  🏷️ {selectedContest.type}
                </span>
                <span className="contest-participants">
                  👥 {filteredData.length} participants from our institute
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="table-container">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th className="rank-column">Rank</th>
              <th className="user-column">User</th>
              {activeSubTab === 'contest' && selectedContest ? (
                <>
                  <th className="rank-column">Global Rank</th>
                  <th className="rank-column">Institute Rank</th>
                  <th className="score-column">Score</th>
                  <th className="solved-column">Solved Problems</th>
                  <th className="time-column">Total Time</th>
                </>
              ) : activeSubTab === 'contest' ? (
                <>
                  <th className="rating-column">Contest Rating</th>
                  <th className="rating-column">Overall Rating</th>
                  <th className="contests-column">Last Contest Rank</th>
                  <th className="contests-column">Contests</th>
                </>
              ) : (
                <>
                  <th className="rating-column">Current Rating</th>
                  <th className="max-rating-column">Max Rating</th>
                  <th className="contests-column">Contests</th>
                  <th className="problems-column">Problems</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {contestLoading && activeSubTab === 'contest' && selectedContest ? (
              <tr>
                <td colSpan="6" className="loading-cell">
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading contest standings...</p>
                  </div>
                </td>
              </tr>
            ) : currentPageData.length > 0 ? (
              currentPageData.map((user, index) => (
                <tr key={user.username || user.handle} className="table-row">
                  <td className="rank-cell">
                    <div className={getRankBadgeClass(user.instituteRank || user.rank)}>
                      {(user.instituteRank || user.rank) === 1 ? '🥇' : (user.instituteRank || user.rank) === 2 ? '🥈' : (user.instituteRank || user.rank) === 3 ? '🥉' : (user.instituteRank || user.rank)}
                    </div>
                  </td>
                  <td className="user-cell">
                    <div className="user-info">
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="user-avatar"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/40/4ade80/ffffff?text=${(user.name || user.handle).charAt(0)}`;
                        }}
                      />
                      <div className="user-details">
                        <span className="user-name">{user.name}</span>
                        <span className="user-username">@{user.username || user.handle}</span>
                        <span className="user-institute">{user.institute || 'Unknown'}</span>
                      </div>
                    </div>
                  </td>
                  {activeSubTab === 'contest' && selectedContest ? (
                    <>
                      <td className="global-rank-cell">
                        <span className="global-rank">#{user.globalRank || user.rank}</span>
                        <span className="global-rank-label">global</span>
                      </td>
                      <td className="institute-rank-cell">
                        <span className="institute-rank">#{user.instituteRank || user.rank}</span>
                        <span className="institute-rank-label">institute</span>
                      </td>
                      <td className="score-cell">
                        <span className="contest-score">{user.points || 0}</span>
                      </td>
                      <td className="solved-cell">
                        <div className="solved-problems">
                          {user.solvedProblems && user.solvedProblems.length > 0 ? (
                            <div className="problem-badges">
                              {user.solvedProblems.map((problemIndex, idx) => (
                                <span key={idx} className="problem-badge solved">
                                  {problemIndex}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="no-problems">-</span>
                          )}
                          <span className="solved-count">({user.solvedCount || 0} solved)</span>
                        </div>
                      </td>
                      <td className="time-cell">
                        <span className="total-time">{user.totalTime || 0}m</span>
                      </td>
                    </>
                  ) : activeSubTab === 'contest' ? (
                    <>
                      <td className="rating-cell">
                        <span className="current-rating">{user.contestRating}</span>
                      </td>
                      <td className="rating-cell">
                        <span className="overall-rating">{user.rating}</span>
                      </td>
                      <td className="contests-cell">
                        <span className="last-contest-rank">#{user.lastContestRank}</span>
                      </td>
                      <td className="contests-cell">
                        <span className="contests-count">{user.contestsParticipated}</span>
                      </td>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={activeSubTab === 'contest' && selectedContest ? '6' : '6'} className="no-results">
                  <div className="no-results-content">
                    <span className="no-results-icon">🔍</span>
                    <span className="no-results-text">
                      {activeSubTab === 'contest' && !selectedContest ? 
                        'Please select a contest to view standings' : 
                        'No participants match the current filters'
                      }
                    </span>
                    <span className="no-results-suggestion">
                      {activeSubTab === 'contest' && !selectedContest ? 
                        'Choose from the dropdown above' : 
                        'Try adjusting the filter criteria'
                      }
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <button
            className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <span>← Previous</span>
          </button>

          <div className="page-numbers">
            {getVisiblePages().map(page => (
              <button
                key={page}
                className={`page-number ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <span>Next →</span>
          </button>

          <div className="pagination-info">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length}
          </div>
        </div>
      )}

      {/* Results Count - Fixed position box */}
      <div className="results-info">
        <span className="results-count">
          {filteredData.length} participants
          <br />
          <span className="active-filter">{tabs.find(tab => tab.id === activeTab)?.name}</span>
        </span>
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
