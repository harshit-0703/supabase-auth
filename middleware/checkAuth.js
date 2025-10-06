// Authentication middleware to check if user is logged in
const checkAuth = (req, res, next) => {
  // In a real application, we would check the JWT token in the request headers
  // or check the session. For simplicity, we'll check for a token in the cookies
  
  // Get the token from the cookie or query parameter (for testing)
  const token = req.cookies?.token || req.query.token;
  
  console.log('Token in checkAuth middleware:', token);
  
  if (!token) {
    // If no token is found, redirect to login page
    console.log('No token found, redirecting to login page');
    return res.redirect('/login');
  }
  
  // If token exists, proceed to the next middleware or route handler
  next();
};

module.exports = checkAuth;