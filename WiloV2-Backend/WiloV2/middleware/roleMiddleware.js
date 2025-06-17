// Middleware to check if the user is an admin
export const isAdmin = (req, res, next) => {
  // Assuming your user object is attached to req.user by the authenticateToken middleware
  // And that the user object has a 'Role' property or a 'roles' array
  // Adjust this logic based on how user roles are stored and named in your system

  if (req.user && (req.user.Role === 'Admin' || (req.user.roles && req.user.roles.includes('Admin')))) {
    // User has the 'Admin' role, proceed to the next middleware or route handler
    next();
  } else {
    // User does not have the 'Admin' role
    res.status(403).json({ message: 'Forbidden: You do not have administrative privileges to perform this action.' });
  }
};

// Example for checking other roles if needed in the future
export const hasRole = (roleName) => {
  return (req, res, next) => {
    if (req.user && (req.user.Role === roleName || (req.user.roles && req.user.roles.includes(roleName)))) {
      next();
    } else {
      res.status(403).json({ message: `Forbidden: You do not have the '${roleName}' role.` });
    }
  };
};