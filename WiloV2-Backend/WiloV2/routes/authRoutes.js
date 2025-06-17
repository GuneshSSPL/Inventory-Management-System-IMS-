import express from 'express';
import { login, register } from '../controllers/userController.js'; // Add register here
import passport from 'passport';
import jwt from 'jsonwebtoken';
// Potentially import userService if findOrCreateUser is not handled solely in passport strategy
// import { findOrCreateUser } from '../services/userService.js';
import db from '../models/index.js'; // Import Sequelize models


const router = express.Router();

router.post('/login', login);
router.post('/register', register); // Add this line for the registration endpoint

// LinkedIn Login Route - Initiates the LinkedIn login flow
router.get('/linkedin', passport.authenticate('linkedin', { state: true }));

// Auth0 Login Route - Initiates the Auth0 login flow
router.get('/auth0', passport.authenticate('auth0', { // Changed from '/api/auth0' to '/auth0'
  scope: ['openid', 'email', 'profile'] // Request necessary scopes from Auth0
}));

// Auth0 Callback Route - Auth0 redirects here after successful authentication
router.get('/auth0/callback',
  passport.authenticate('auth0', {
    failureRedirect: 'http://localhost:4200/login?error=auth0_failed',
    session: false
  }),
  async (req, res) => { // Made the callback function async
    // Authentication successful. req.user contains the Auth0 profile (or your mapped user object from findOrCreateUser).
    // Fetch complete user data from your database using Sequelize
    try {
      const user = await db.User.findOne({
        where: { UserID: req.user.id }, // Use the user ID returned by findOrCreateUser
        include: [
          { model: db.Role, attributes: ['RoleName'] },
          { model: db.Employee, attributes: ['EmployeeName'] }
        ]
      });

      if (!user) {
        console.error('Auth0 Callback: User not found in DB after authentication for ID:', req.user.id);
        return res.redirect('http://localhost:4200/login?error=user_not_found');
      }

      // Fetch permissions using Sequelize
      let permissions = [];
      if (user.RoleID) {
        const rolePermissions = await db.RolePermission.findAll({
          where: { RoleID: user.RoleID },
          include: [{ model: db.Permission, attributes: ['PermissionName'] }]
        });
        permissions = rolePermissions.map(rp => rp.Permission.PermissionName);
        console.log('Auth0 Callback: Permissions fetched for user:', permissions);
      }

      // Generate a JWT for your application with comprehensive payload.
      const jwtPayload = {
        userId: user.UserID,
        email: user.Email,
        Role: user.Role ? user.Role.RoleName : null,
        RoleID: user.RoleID,
        permissions: permissions,
        employeeName: user.Employee ? user.Employee.EmployeeName : ''
      };

      const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

      console.log('Auth0 Callback: JWT token generated with payload:', jwtPayload);

      // Redirect to a frontend route that can handle the token
      res.redirect(`http://localhost:4200/auth-callback?token=${token}`);

    } catch (error) {
      console.error('Auth0 Callback: Error fetching user data or generating token:', error);
      res.redirect('http://localhost:4200/login?error=server_error');
    }
  }
);

// LinkedIn Callback Route - LinkedIn redirects here after successful authentication
router.get('/linkedin/callback',
  passport.authenticate('linkedin', {
    failureRedirect: 'http://localhost:4200/login?error=linkedin_failed', // Full frontend URL for failure
    session: false // Recommended if you primarily use JWTs for your API
  }),
  (req, res) => {
    // Authentication successful. req.user contains the LinkedIn profile (or your mapped user object).
    // Generate a JWT for your application.
    const userPayload = {
      userId: req.user.id, // Assuming user object from findOrCreateUser has an 'id'
      email: req.user.email,
      name: req.user.name,
      // Add any other relevant user details or roles from your system
    };

    const token = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Redirect to a frontend route that can handle the token
    res.redirect(`http://localhost:4200/auth-callback?token=${token}`);
  }
);

export default router;
