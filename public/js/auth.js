// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutBtn = document.getElementById('logout-btn');
const alertBox = document.getElementById('alert-box');

// API URL
const API_URL = '/api/auth';

// Check if user is logged in
function checkAuth() {
  const token = localStorage.getItem('token');
  
  if (token) {
    // Redirect to home page if on login or register page
    if (window.location.pathname === '/login' || window.location.pathname === '/signup') {
      window.location.href = '/';
    }
  } else {
    // Redirect to login page if not logged in and trying to access home page
    if (window.location.pathname === '/' || window.location.pathname === '') {
      window.location.href = '/login';
    }
  }
  
  // Note: The server-side authentication check will handle redirects as well
  // This client-side check is just for a better user experience
}

// Show alert message
function showAlert(message, type = 'error') {
  if (alertBox) {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = 'block';
    
    // Hide alert after 3 seconds
    setTimeout(() => {
      alertBox.style.display = 'none';
    }, 3000);
  }
}

// Register user
async function registerUser(event) {
  event.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password }),
      credentials: 'include' // Include cookies in the request
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    
    // Save token to localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Show success message
    showAlert('Registration successful! Redirecting...', 'success');
    
    // Redirect to home page
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
    
  } catch (error) {
    showAlert(error.message);
  }
}

// Login user
async function loginUser(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include' // Include cookies in the request
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    // Save token to localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Show success message
    showAlert('Login successful! Redirecting...', 'success');
    
    // Redirect to home page
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
    
  } catch (error) {
    showAlert(error.message);
  }
}

// Logout user
async function logoutUser() {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include cookies in the request
    });
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    window.location.href = '/login';
    
  } catch (error) {
    console.error('Logout error:', error);
    // Still redirect to login page even if there's an error
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}

// Display user info on home page
function displayUserInfo() {
  const userInfoElement = document.getElementById('user-info');
  
  if (userInfoElement) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user.id) {
      userInfoElement.innerHTML = `
        <p><strong>Name:</strong> ${user.name || 'N/A'}</p>
        <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
        <p><strong>User ID:</strong> ${user.id}</p>
      `;
    }
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication status
  checkAuth();
  
  // Register form event listener
  if (registerForm) {
    registerForm.addEventListener('submit', registerUser);
  }
  
  // Login form event listener
  if (loginForm) {
    loginForm.addEventListener('submit', loginUser);
  }
  
  // Logout button event listener
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutUser);
  }
  
  // Display user info on home page
  if (window.location.pathname === '/' || window.location.pathname === '') {
    displayUserInfo();
  }
});