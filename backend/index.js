const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const indexRoutes = require('./routes/index');
const userRoutes = require('./routes/users');
const userCodeforcesRoutes = require('./routes/codeforces');

// Middleware to parse JSON
app.use(express.json());

// Use routes
app.use('/', (req, res) => {
    res.json({"message": "Welcome to Backend root!"});
});
app.use('/api', indexRoutes);
app.use('/api/cf', userCodeforcesRoutes);
app.use('/api/users', userRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});