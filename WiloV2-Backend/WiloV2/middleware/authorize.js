import jwt from 'jsonwebtoken';

export const authorize = (requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { RoleID, Role, permissions } = req.user; // Assuming Role is RoleName

    // Check for Admin role (ID 13 or name 'Admin') to bypass permission checks
    if (RoleID === 13 || Role === 'Admin') {
      return next(); // Admin has access to everything
    }

    if (!permissions) {
      return res.status(403).json({ message: 'Forbidden: No permissions found for user' });
    }

    const hasPermission = requiredPermissions.some(rp => permissions.includes(rp));

    if (hasPermission) {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden: You do not have the required permissions' });
    }
  };
};

export const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided or malformed token.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add decoded payload to request object
    // console.log('isAuthenticated - Decoded User:', JSON.stringify(req.user)); // Log the whole object
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Unauthorized: Token has expired.' });
    }
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token.' });
  }
};