require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const checkAuth = require('./middleware/checkAuth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Add cookie parser middleware

// Serve static files for CSS and JS
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));

// API Routes
app.use('/api/auth', authRoutes);

// Redirect /index.html to root route (/)
app.get('/index.html', (req, res) => {
  // Redirect without unnecessary logging
  res.redirect('/');
});

// Authentication routes
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Default route (home page) - protected by authentication
app.get('/', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Redirect any other routes to the home page
app.use((req, res) => {
  res.redirect('/');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});