const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const indexRoutes = require('./routes/index');
const userRoutes = require('./routes/users');
const userCodeforcesRoutes = require('./routes/codeforces');

// cors middleware.
app.use(cors());

// Middleware to parse JSON
app.use(express.json());
// Use routes
app.use('/', (req, res) => {
    res.json({"message": "Welcome to Backend root!"});
});
app.use('/api', indexRoutes);
app.use('/api/cf', userCodeforcesRoutes);
app.use('/api/users', userRoutes);

// connect to db
mongoose.connect(process.env.MONGO_URI) // asyncronous
    .then(() => {
        // listening for requests
        app.listen(process.env.PORT, () => {
            console.log(`connected to DB and Listening on port ${process.env.PORT}...`);
        });
    })
    .catch((err) => {
        console.log(err);
    })