// index.js
// Import necessary modules and set up the Express app
const express    = require('express');
const cookieParser = require('cookie-parser');
const cors      = require('cors');
const leadRoutes = require('./routes/leads');
const serviceRoutes = require('./routes/services');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const errorHandler = require('./middleware/errorHandling');

// Initialize the Express app and set the port
require('dotenv').config();
const app        = express();
const PORT       = process.env.PORT || 3000;


// Middleware to parse JSON requests
app.use(express.json());
// Middleware to parse cookies
app.use(cookieParser());
// Middleware to enable CORS
app.use(cors({
  origin: 'http://localhost:5173',  // or wherever your frontend runs
  credentials: true,                // <— allows cookies to be sent
}));

// Auth route 
app.use('/api/auth', authRoutes);

// Main API routes
app.use('/api/leads', leadRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// Catch-all route for undefined endpoints
app.use(errorHandler);


// Start the server
app.listen(PORT, () =>
  console.log(`🚀 Server listening on http://localhost:${PORT}`)
);
