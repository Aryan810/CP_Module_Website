import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, Clock, ExternalLink, X, ChevronLeft, ChevronRight, Globe, Timer, Users, Hash, RefreshCw } from 'lucide-react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isToday, isSameDay, parseISO } from 'date-fns';
import './Contests.css';

const PLATFORM_COLORS = {
  'codeforces.com': { bg: '#1976d2', border: '#1565c0' },
  'atcoder.jp': { bg: '#ff9800', border: '#f57c00' },
  'codechef.com': { bg: '#8bc34a', border: '#689f38' },
  'leetcode.com': { bg: '#9c27b0', border: '#7b1fa2' },
  'topcoder.com': { bg: '#ffa726', border: '#ff9800' },
  'hackerrank.com': { bg: '#2e7d32', border: '#1b5e20' },
  'hackerearth.com': { bg: '#3f51b5', border: '#303f9f' },
  'spoj.com': { bg: '#607d8b', border: '#455a64' },
  'default': { bg: '#424242', border: '#303030' }
};

const TIME_SLOTS = Array.from({ length: 12 }, (_, i) => i * 2);

function Contests() {
  const [currentWeek, setCurrentWeek] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContest, setSelectedContest] = useState(null);
  const [hoveredContest, setHoveredContest] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const dateInputRef = useRef(null);
  const lastSelectedDateRef = useRef('');
  const gridRef = useRef(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  const fetchContests = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = format(currentWeek, 'yyyy-MM-dd');
      const endDate = format(addDays(currentWeek, 7), 'yyyy-MM-dd');
      
      const response = await fetch(
        `https://clist.by/api/v3/contest/?start__lte=${endDate}T23:59:59&end__gte=${startDate}T00:00:00&limit=100&order_by=start`,
        {
          headers: {
            'Authorization': 'ApiKey mehul_v0:41c47f8b2dc39c7798ca814adcaf61ec49a23cdf'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const allowedHosts = [
          'codeforces.com',
          'atcoder.jp',
          'codechef.com',
          'topcoder.com',
          'leetcode.com',
          'hackerrank.com',
          'hackerearth.com'
        ];
        
        // Helper to convert UTC to IST (UTC+5:30)
        function toIST(utcDateString) {
          const utcDate = parseISO(utcDateString);
          // Add 5.5 hours (330 minutes) to convert UTC to IST
          return new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
        }
        
        const processedContests = (data.objects || [])
          .filter(contest => allowedHosts.includes(contest.host))
          .map(contest => ({
            ...contest,
            start: toIST(contest.start),
            end: toIST(contest.end)
          }))
          .filter(contest => {
            // Filter out contests longer than 24 hours (86400 seconds)
            const duration = contest.duration || 0;
            return duration <= 86400;
          });
        
        console.log('Processed contests:', processedContests);
        setContests(processedContests);
      } else {
        console.error('Failed to fetch contests:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch contests:', error);
    }
    setLoading(false);
  }, [currentWeek]);

  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  const getContestStyle = (contest, dayIndex, columnInfo) => {
    const dayStart = new Date(weekDays[dayIndex]);
    dayStart.setHours(0, 0, 0, 0);
    
    const contestStart = contest.start instanceof Date ? contest.start : new Date(contest.start);
    let contestEnd = contest.end instanceof Date ? contest.end : new Date(contest.end);
    
    // Handle contests that end at 00:00 of the next day - treat them as ending at 23:59:59 of the current day
    if (contestEnd.getHours() === 0 && contestEnd.getMinutes() === 0 && contestEnd.getSeconds() === 0) {
      // Move the end time back by 1 minute to 23:59 of the previous day
      contestEnd = new Date(contestEnd.getTime() - 60 * 1000);
    }
    
    // Clamp contest times to the current day
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    
    const effectiveStart = contestStart < dayStart ? dayStart : contestStart;
    const effectiveEnd = contestEnd > dayEnd ? dayEnd : contestEnd;
    
    const startMinutes = (effectiveStart.getHours() * 60) + effectiveStart.getMinutes();
    const endMinutes = (effectiveEnd.getHours() * 60) + effectiveEnd.getMinutes();
    
    const top = (startMinutes / (24 * 60)) * 100;
    const height = ((endMinutes - startMinutes) / (24 * 60)) * 100;
    
    // Width is based on maximum overlap, position is based on column
    const width = (columnInfo.width * 100) - 2; // Convert to percentage and shrink by 2%
    const left = columnInfo.column * (columnInfo.width * 100); // Each column takes width% space
    
    const platformColors = PLATFORM_COLORS[contest.host] || PLATFORM_COLORS.default;
    
    return {
      position: 'absolute',
      top: `${top}%`,
      height: `${Math.max(height, 1)}%`,
      left: `${left}%`,
      width: `${width}%`,
      backgroundColor: platformColors.bg,
      borderLeft: `3px solid ${platformColors.border}`,
      borderRadius: 'var(--radius-sm)',
      padding: '4px 8px',
      margin: '1px',
      overflow: 'hidden',
      cursor: 'pointer',
      zIndex: hoveredContest?.id === contest.id ? 10 : 1,
      transform: hoveredContest?.id === contest.id ? 'scale(1.02)' : 'scale(1)',
      transition: 'all var(--transition-normal)',
      boxShadow: hoveredContest?.id === contest.id ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
    };
  };

  // Helper function to check if two contests overlap in time
  const contestsOverlap = (contest1, contest2, dayStart, dayEnd) => {
    const start1 = contest1.start instanceof Date ? contest1.start : new Date(contest1.start);
    let end1 = contest1.end instanceof Date ? contest1.end : new Date(contest1.end);
    const start2 = contest2.start instanceof Date ? contest2.start : new Date(contest2.start);
    let end2 = contest2.end instanceof Date ? contest2.end : new Date(contest2.end);
    
    // Handle contests that end at 00:00 of the next day - treat them as ending at 23:59 of the current day
    if (end1.getHours() === 0 && end1.getMinutes() === 0 && end1.getSeconds() === 0) {
      end1 = new Date(end1.getTime() - 60 * 1000);
    }
    if (end2.getHours() === 0 && end2.getMinutes() === 0 && end2.getSeconds() === 0) {
      end2 = new Date(end2.getTime() - 60 * 1000);
    }
    
    // Clamp to day boundaries
    const effectiveStart1 = start1 < dayStart ? dayStart : start1;
    const effectiveEnd1 = end1 > dayEnd ? dayEnd : end1;
    const effectiveStart2 = start2 < dayStart ? dayStart : start2;
    const effectiveEnd2 = end2 > dayEnd ? dayEnd : end2;
    
    // Two time intervals overlap if start1 < end2 && start2 < end1
    return effectiveStart1 < effectiveEnd2 && effectiveStart2 < effectiveEnd1;
  };

  // Calculate contest widths based on maximum simultaneous overlaps
  const calculateContestWidths = (contests, dayStart, dayEnd) => {
    if (contests.length === 0) return [];
    
    // Helper function to get effective contest times within day boundaries
    const getEffectiveTimes = (contest) => {
      const contestStart = contest.start instanceof Date ? contest.start : new Date(contest.start);
      let contestEnd = contest.end instanceof Date ? contest.end : new Date(contest.end);
      
      // Handle contests that end at 00:00 of the next day
      if (contestEnd.getHours() === 0 && contestEnd.getMinutes() === 0 && contestEnd.getSeconds() === 0) {
        contestEnd = new Date(contestEnd.getTime() - 60 * 1000);
      }
      
      const effectiveStart = contestStart < dayStart ? dayStart : contestStart;
      const effectiveEnd = contestEnd > dayEnd ? dayEnd : contestEnd;
      
      return { start: effectiveStart, end: effectiveEnd };
    };
    
    // For each contest, find the maximum number of contests that are simultaneous with it
    const contestsWithMaxOverlap = contests.map(contest => {
      const { start: contestStart, end: contestEnd } = getEffectiveTimes(contest);
      
      let maxSimultaneous = 1; // At least the contest itself
      
      // Create all critical time points during this contest's duration
      const timePoints = new Set();
      timePoints.add(contestStart.getTime());
      timePoints.add(contestEnd.getTime());
      
      // Add start and end times of all other contests that might overlap
      contests.forEach(otherContest => {
        if (otherContest.id === contest.id) return;
        
        const { start: otherStart, end: otherEnd } = getEffectiveTimes(otherContest);
        
        // Only add time points if they're within this contest's duration
        if (otherStart >= contestStart && otherStart <= contestEnd) {
          timePoints.add(otherStart.getTime());
        }
        if (otherEnd >= contestStart && otherEnd <= contestEnd) {
          timePoints.add(otherEnd.getTime());
        }
      });
      
      // Check simultaneous contests at each critical time point
      Array.from(timePoints).forEach(timePoint => {
        const checkTime = new Date(timePoint);
        let simultaneousCount = 0;
        
        contests.forEach(checkContest => {
          const { start: checkStart, end: checkEnd } = getEffectiveTimes(checkContest);
          
          // A contest is active if the check time is within its duration (inclusive start, exclusive end)
          if (checkTime >= checkStart && checkTime < checkEnd) {
            simultaneousCount++;
          }
        });
        
        maxSimultaneous = Math.max(maxSimultaneous, simultaneousCount);
      });
      
      // Also check at regular intervals during the contest to catch any missed overlaps
      const contestDuration = contestEnd.getTime() - contestStart.getTime();
      const checkInterval = Math.min(30 * 60 * 1000, Math.max(60 * 1000, contestDuration / 20)); // Check every minute to 30 minutes
      
      for (let time = contestStart.getTime(); time < contestEnd.getTime(); time += checkInterval) {
        const checkTime = new Date(time);
        let simultaneousCount = 0;
        
        contests.forEach(checkContest => {
          const { start: checkStart, end: checkEnd } = getEffectiveTimes(checkContest);
          
          if (checkTime >= checkStart && checkTime < checkEnd) {
            simultaneousCount++;
          }
        });
        
        maxSimultaneous = Math.max(maxSimultaneous, simultaneousCount);
      }
      
      return {
        ...contest,
        maxSimultaneous
      };
    });
    
    // Assign columns using graph coloring algorithm
    const sortedContests = [...contestsWithMaxOverlap].sort((a, b) => {
      const startA = a.start instanceof Date ? a.start : new Date(a.start);
      const startB = b.start instanceof Date ? b.start : new Date(b.start);
      return startA - startB;
    });
    
    const contestColumns = [];
    
    for (const contest of sortedContests) {
      let assignedColumn = 0;
      
      // Find the first column where this contest doesn't overlap with any existing contest
      while (true) {
        const conflictsInColumn = contestColumns.filter(item => 
          item.column === assignedColumn && 
          contestsOverlap(contest, item.contest, dayStart, dayEnd)
        );
        
        if (conflictsInColumn.length === 0) {
          break;
        }
        
        assignedColumn++;
      }
      
      contestColumns.push({
        contest,
        column: assignedColumn
      });
    }
    
    // Return contests with column and width information
    return contestColumns.map(item => ({
      ...item.contest,
      columnInfo: {
        column: item.column,
        width: 1 / item.contest.maxSimultaneous // Width is 1/max_simultaneous
      }
    }));
  };

  const getContestsForDay = (contests, dayIndex) => {
    const dayStart = new Date(weekDays[dayIndex]);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(weekDays[dayIndex]);
    dayEnd.setHours(23, 59, 59, 999);

    // Get all contests that overlap with this day
    const dayContests = contests.filter(contest => {
      const contestStart = contest.start instanceof Date ? contest.start : new Date(contest.start);
      let contestEnd = contest.end instanceof Date ? contest.end : new Date(contest.end);
      
      // Handle contests that end at 00:00 of the next day - treat them as ending at 23:59:59 of the current day
      if (contestEnd.getHours() === 0 && contestEnd.getMinutes() === 0 && contestEnd.getSeconds() === 0) {
        // Move the end time back by 1 minute to 23:59 of the previous day
        contestEnd = new Date(contestEnd.getTime() - 60 * 1000);
      }

      // Special case: contest starts at 00:00 and ends at 23:59 of the same day (adjusted 24h contest)
      if (
        contestStart.getHours() === 0 && contestStart.getMinutes() === 0 &&
        contestEnd.getHours() === 23 && contestEnd.getMinutes() === 59
      ) {
        // Check if it's on the same calendar day
        return (
          contestStart.getFullYear() === dayStart.getFullYear() &&
          contestStart.getMonth() === dayStart.getMonth() &&
          contestStart.getDate() === dayStart.getDate()
        );
      }

      // Normal overlap logic
      return contestStart <= dayEnd && contestEnd >= dayStart;
    });

    // Use the new width calculation algorithm
    return calculateContestWidths(dayContests, dayStart, dayEnd);
  };

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const navigateWeek = (direction) => {
    if (direction === 'prev') {
      setCurrentWeek(subWeeks(currentWeek, 1));
    } else {
      setCurrentWeek(addWeeks(currentWeek, 1));
    }
  };

  const formatDuration = (start, end) => {
    const duration = Math.abs(new Date(end) - new Date(start)) / (1000 * 60 * 60);
    return `${duration.toFixed(1)}h`;
  };

  const getCurrentTimePosition = () => {
    const now = new Date();
    const minutes = (now.getHours() * 60) + now.getMinutes();
    return (minutes / (24 * 60)) * 100;
  };

  const getPlatformName = (host) => {
    if (!host) return 'Unknown';
    
    // Remove common domain extensions and extract platform name
    const platformName = host
      .replace(/\.(com|org|net|jp)$/i, '') // Remove domain extensions
      .replace(/^www\./i, '') // Remove www prefix if present
      .split('.')[0] // Take the first part before any remaining dots
      .toLowerCase();
    
    // Capitalize first letter for better display
    return platformName.charAt(0).toUpperCase() + platformName.slice(1);
  };

  const handleDatePick = (selectedDate) => {
    // Only proceed if a valid date is provided, it's not empty, and it's different from the last selected date
    if (selectedDate && selectedDate.trim() !== '' && selectedDate !== lastSelectedDateRef.current) {
      lastSelectedDateRef.current = selectedDate;
      const weekStart = startOfWeek(new Date(selectedDate), { weekStartsOn: 1 });
      setCurrentWeek(weekStart);
    }
  };

  const openDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        navigateWeek('prev');
      } else if (e.key === 'ArrowRight') {
        navigateWeek('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentWeek]);

  return (
    <div className="page-content-area">
      <div className="contests-app" onMouseMove={handleMouseMove}>
        {/* Header */}
        <div className="contests-header">
          <div className="contests-header-left">
            <h1>Programming Contests</h1>
            <div className="contests-week-navigation">
              <button onClick={() => navigateWeek('prev')} className="contests-nav-button">
                <ChevronLeft size={20} />
              </button>
              <span className="contests-week-range">
                {format(currentWeek, 'MMM d')} - {format(addDays(currentWeek, 6), 'MMM d, yyyy')}
              </span>
              <button onClick={() => navigateWeek('next')} className="contests-nav-button">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="contests-header-right">
            <input
              ref={dateInputRef}
              type="date"
              style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none' }}
              onChange={(e) => handleDatePick(e.target.value)}
            />
            <button 
              onClick={openDatePicker}
              className="contests-date-picker-button"
              title="Pick a date"
            >
              <Calendar size={18} />
            </button>
            <button 
              onClick={() => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))} 
              className="contests-today-button"
            >
              Today
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="contests-calendar-container">
          <div className="contests-calendar-grid" ref={gridRef}>
            {/* Time Column */}
            <div className="contests-time-column">
              <div className="contests-time-header"></div>
              {TIME_SLOTS.map(hour => (
                <div key={hour} className="contests-time-slot">
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {weekDays.map((day, dayIndex) => (
              <div key={day.toISOString()} className="contests-day-column">
                <div className={`contests-day-header ${isToday(day) ? 'contests-today' : ''}`}>
                  <div className="contests-day-name">{format(day, 'EEE')}</div>
                  <div className="contests-day-number">{format(day, 'd')}</div>
                </div>
                
                <div className="contests-day-content">
                  {/* Today line */}
                  {isToday(day) && (
                    <div 
                      className="contests-today-line" 
                      style={{ top: `${getCurrentTimePosition()}%` }}
                    />
                  )}
                  
                  {/* Contest blocks */}
                  {loading ? (
                    <div className="contests-loading">Loading...</div>
                  ) : (
                    getContestsForDay(contests, dayIndex).map(contest => (
                      <div
                        key={contest.id}
                        className="contests-contest-block"
                        style={{
                          ...getContestStyle(contest, dayIndex, contest.columnInfo),
                          wordBreak: 'break-word',
                          whiteSpace: 'normal',
                          overflowWrap: 'break-word'
                        }}
                        onClick={() => setSelectedContest(contest)}
                        onMouseEnter={() => setHoveredContest(contest)}
                        onMouseLeave={() => setHoveredContest(null)}
                      >
                        <div className="contests-contest-platform" style={{ fontSize: '0.7rem', fontWeight: 600, marginBottom: 2, wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word' }}>
                          {getPlatformName(contest.host)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {hoveredContest && (
          <div 
            className="contests-tooltip"
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y - 10,
            }}
          >
            <div className="contests-tooltip-title">{hoveredContest.event}</div>
            <div className="contests-tooltip-platform">{getPlatformName(hoveredContest.host)}</div>
            <div className="contests-tooltip-time">
              {format(hoveredContest.start instanceof Date ? hoveredContest.start : new Date(hoveredContest.start), 'MMM d, HH:mm')} - {format(hoveredContest.end instanceof Date ? hoveredContest.end : new Date(hoveredContest.end), 'HH:mm')}
            </div>
            <div className="contests-tooltip-duration">Duration: {formatDuration(hoveredContest.start, hoveredContest.end)}</div>
          </div>
        )}

        {/* Modal */}
        {selectedContest && (
          <div className="contests-modal-overlay" onClick={() => setSelectedContest(null)}>
            <div className="contests-modal" onClick={e => e.stopPropagation()}>
              <div className="contests-modal-header">
                <h2>{selectedContest.event}</h2>
                <button onClick={() => setSelectedContest(null)} className="contests-close-button">
                  <X size={20} />
                </button>
              </div>
              
              <div className="contests-modal-content">
                <div className="contests-modal-section">
                  <div className="contests-modal-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={16} style={{ color: '#3b82f6' }} />
                    Platform
                  </div>
                  <div className="contests-modal-value">{getPlatformName(selectedContest.host)}</div>
                </div>
                
                <div className="contests-modal-section">
                  <div className="contests-modal-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} style={{ color: '#10b981' }} />
                    Start Time
                  </div>
                  <div className="contests-modal-value">
                    {format(selectedContest.start instanceof Date ? selectedContest.start : new Date(selectedContest.start), 'MMM d, yyyy HH:mm')}
                  </div>
                </div>
                
                <div className="contests-modal-section">
                  <div className="contests-modal-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} style={{ color: '#f59e0b' }} />
                    End Time
                  </div>
                  <div className="contests-modal-value">
                    {format(selectedContest.end instanceof Date ? selectedContest.end : new Date(selectedContest.end), 'MMM d, yyyy HH:mm')}
                  </div>
                </div>
                
                <div className="contests-modal-section">
                  <div className="contests-modal-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Timer size={16} style={{ color: '#8b5cf6' }} />
                    Duration
                  </div>
                  <div className="contests-modal-value">
                    {selectedContest.duration ? 
                      `${Math.floor(selectedContest.duration / 3600)}h ${Math.floor((selectedContest.duration % 3600) / 60)}m` : 
                      formatDuration(selectedContest.start, selectedContest.end)
                    }
                  </div>
                </div>
                
                {selectedContest.n_problems && (
                  <div className="contests-modal-section">
                    <div className="contests-modal-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Hash size={16} style={{ color: '#ef4444' }} />
                      Number of Problems
                    </div>
                    <div className="contests-modal-value">{selectedContest.n_problems}</div>
                  </div>
                )}
                
                {selectedContest.n_statistics && (
                  <div className="contests-modal-section">
                    <div className="contests-modal-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={16} style={{ color: '#06b6d4' }} />
                      Participants
                    </div>
                    <div className="contests-modal-value">{selectedContest.n_statistics.toLocaleString()}</div>
                  </div>
                )}
                
                {selectedContest.parsed_at && (
                  <div className="contests-modal-section">
                    <div className="contests-modal-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={16} style={{ color: '#84cc16' }} />
                      Last Updated
                    </div>
                    <div className="contests-modal-value">
                      {format(new Date(selectedContest.parsed_at), 'MMM d, yyyy HH:mm')}
                    </div>
                  </div>
                )}
                
                {selectedContest.href && (
                  <div className="contests-modal-actions">
                    <a 
                      href={selectedContest.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="contests-external-link"
                    >
                      <ExternalLink size={16} />
                      Visit Contest
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Contests;
