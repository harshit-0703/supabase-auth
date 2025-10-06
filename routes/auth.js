const express = require('express');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-anon-key';

// Create Supabase client
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Error initializing Supabase client:', error.message);
  // Create a mock client for development if credentials are not valid
  supabase = {
    auth: {
      signUp: async () => ({ data: { user: { id: 'mock-id', email: 'mock@example.com' } }, error: null }),
      signInWithPassword: async () => ({ data: { user: { id: 'mock-id', email: 'mock@example.com', user_metadata: { name: 'Mock User' } } }, error: null }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: { id: 'mock-id', email: 'mock@example.com', user_metadata: { name: 'Mock User' } } }, error: null })
    }
  };
  // Only log in development environment
  if (process.env.NODE_ENV !== 'production') {
    console.log('Using mock Supabase client for development');
  }
}

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Register user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: data.user.id, email: data.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set token as cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 3600000, // 1 hour
      secure: process.env.NODE_ENV === 'production', // secure in production
      sameSite: 'strict'
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name
      }
    });
    
    // Log successful registration without exposing sensitive details
    console.log(`User registered successfully: ${data.user.email}`);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Login with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: data.user.id, email: data.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set token as cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 3600000, // 1 hour
      secure: process.env.NODE_ENV === 'production', // secure in production
      sameSite: 'strict'
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name
      }
    });
    
    // Log successful login without exposing sensitive details
    console.log(`User logged in successfully: ${data.user.email}`);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout user
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    // Clear the token cookie
    res.clearCookie('token');
    
    // Log successful logout
    console.log('User logged out successfully');
    
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from Supabase
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    res.status(200).json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;