const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

// Initialise Firebase Admin (no-op if no service-account is configured).
require('./firebase');

const app = express();
const PORT = process.env.PORT || 3001;

const indexRoutes = require('./routes/index');
const usersRoutes = require('./routes/users');
const cfRoutes = require('./routes/codeforces');
const cfUpdateRoutes = require('./routes/cfUpdate');
const eventsRoutes = require('./routes/events');
const leaderboardsRoutes = require('./routes/leaderboards');

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.use('/api/cf', cfRoutes);
app.use('/api/cf-update', cfUpdateRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/leaderboards', leaderboardsRoutes);
app.use('/api', indexRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'CP-Hub backend is up.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CP-Hub backend listening on port ${PORT}`);
  });
}

module.exports = app;
