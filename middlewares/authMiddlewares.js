const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      console.log('❌ JWT verify error:', err.message);
      return res.status(403).json({ message: 'Invalid token' });
    }
    console.log('✅ Token payload:', user);
    req.user = user;
    next();
  });  
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    console.log('User in authorizeRoles:', req.user);
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };
