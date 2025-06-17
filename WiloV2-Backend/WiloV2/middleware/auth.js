import jwt from 'jsonwebtoken';

// Middleware to check JWT token
export const authenticate = (req, res, next) => {
  const authHeader = req.header('Authorization'); // Get header directly
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Decoded payload will have userId, email, Role
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Middleware to check for roles
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.Role; // Access Role from JWT payload

    if (!req.user || !userRole || !allowedRoles.includes(userRole.toLowerCase())) {
      return res.status(403).json({ message: 'Forbidden: Access denied for this role' });
    }

    next();
  };
};