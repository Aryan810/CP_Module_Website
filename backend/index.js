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
const cfUpdateRoutes = require('./routes/cfUpdate');

// cors middleware.
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB with connection pooling for serverless
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }
  
  // Check if MONGO_URI is available
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not set');
  }
    // Connect to MongoDB
  try {
    console.log('Connecting to MongoDB...');
    const connection = await mongoose.connect(process.env.MONGO_URI);
    cachedConnection = connection;
    console.log('Connected to MongoDB successfully');
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}


// Use routes - ORDER MATTERS!
app.use('/api/cf', userCodeforcesRoutes);
app.use('/api/cf-update', cfUpdateRoutes);
app.use('/api/users', userRoutes);
app.use('/api', indexRoutes);  // This should be LAST among /api routes
app.use('/', (req, res) => {
    res.json({"message": "Welcome to Backend root!"});
});

// if (process.env.NODE_ENV !== 'production') {

  connectToDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log('Database connected successfully');
      });
    })
    .catch((error) => {
      console.error('Failed to connect to database:', error);
      process.exit(1);
    });
// }

// Export for Vercel serverless
module.exports = app;