// Codeforces helper routes. These take a CF handle directly so they're
// independent of our user store.
const express = require('express');
const router = express.Router();

async function fetchCfUserInfo(handle) {
  const r = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`);
  const data = await r.json();
  if (data.status !== 'OK' || !data.result?.length) throw new Error('Codeforces user not found');
  return data.result[0];
}

async function fetchContestHistory(handle) {
  const r = await fetch(`https://codeforces.com/api/user.rating?handle=${encodeURIComponent(handle)}`);
  const data = await r.json();
  return data.status === 'OK' ? data.result : [];
}

async function fetchRecentSubmissions(handle, count = 10) {
  const r = await fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=${count}`);
  const data = await r.json();
  return data.status === 'OK' ? data.result : [];
}

function formatProfile(u) {
  return {
    handle: u.handle,
    firstName: u.firstName || '',
    lastName: u.lastName || '',
    country: u.country || '',
    city: u.city || '',
    organization: u.organization || '',
    avatar: u.avatar || '',
    titlePhoto: u.titlePhoto || '',
    rank: u.rank || 'unrated',
    rating: u.rating || 0,
    maxRank: u.maxRank || 'unrated',
    maxRating: u.maxRating || 0,
    lastOnlineTime: u.lastOnlineTimeSeconds ? new Date(u.lastOnlineTimeSeconds * 1000) : null,
    registrationTime: u.registrationTimeSeconds ? new Date(u.registrationTimeSeconds * 1000) : null,
    friendOfCount: u.friendOfCount || 0,
    contribution: u.contribution || 0,
  };
}

function formatContests(history) {
  return {
    totalContests: history.length,
    contestHistory: history.map((c) => ({
      contestId: c.contestId,
      contestName: c.contestName,
      handle: c.handle,
      rank: c.rank,
      oldRating: c.oldRating,
      newRating: c.newRating,
      ratingUpdateTime: new Date(c.ratingUpdateTimeSeconds * 1000),
    })),
  };
}

function formatSubmissions(subs, limit = 5) {
  return subs.slice(0, limit).map((s) => ({
    id: s.id,
    contestId: s.contestId,
    problemIndex: s.problem.index,
    problemName: s.problem.name,
    problemRating: s.problem.rating,
    verdict: s.verdict,
    programmingLanguage: s.programmingLanguage,
    creationTime: new Date(s.creationTimeSeconds * 1000),
  }));
}

router.get('/profile/:handle', async (req, res) => {
  try {
    const u = await fetchCfUserInfo(req.params.handle);
    res.json({ success: true, profile: formatProfile(u) });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/full/:handle', async (req, res) => {
  try {
    const [u, history, subs] = await Promise.all([
      fetchCfUserInfo(req.params.handle),
      fetchContestHistory(req.params.handle),
      fetchRecentSubmissions(req.params.handle, 10),
    ]);
    res.json({
      success: true,
      cf: {
        profile: formatProfile(u),
        contests: formatContests(history),
        recentActivity: { submissions: formatSubmissions(subs, 5) },
        stats: {
          isOnline: u.lastOnlineTimeSeconds ? Date.now() - u.lastOnlineTimeSeconds * 1000 < 60000 : false,
          totalSubmissions: subs.length >= 10 ? '10+' : subs.length,
          ratingChange: history.length ? history[history.length - 1].newRating - history[history.length - 1].oldRating : 0,
        },
      },
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/:handle', (req, res, next) => {
  req.url = `/full/${req.params.handle}`;
  router.handle(req, res, next);
});

module.exports = router;
