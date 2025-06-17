// userController.js
import db from '../models/index.js'; // Add this line
import { sql, pool, poolConnect } from '../config/db.js'; // Ensure pool is correctly imported and available
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

  export const register = async (req, res) => {
    try {
      console.log('Register endpoint hit. Request body:', req.body); // Log incoming request body
      const { employeeName, email, password, roleId, departmentId } = req.body || {};

      if (!employeeName || !email || !password || !roleId || !departmentId) {
        console.log('Missing required fields in registration request'); // Log missing fields
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Use Sequelize to check if user exists
      const existingUser = await db.User.findOne({ where: { Email: email } });

      console.log('User check result:', existingUser); // Log user check result

      if (existingUser) {
        console.log('User with email already exists:', email); // Log existing user
        return res.status(409).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      console.log('Password hashed successfully'); // Log successful hashing

      // Use Sequelize to create the user
      const newUser = await db.User.create({
        Email: email,
        PasswordHash: hashedPassword,
        RoleID: 10, // Set RoleID to 10 as requested
        DepartmentID: departmentId
      });

      console.log('New user created with ID:', newUser.UserID); // Log new user ID

      // Use Sequelize to create the employee record
      await db.Employee.create({
        UserID: newUser.UserID,
        EmployeeName: employeeName
      });

      console.log('Employee record created for user ID:', newUser.UserID); // Log employee creation

      // At this point, direct permission assignment is removed due to UserPermissions table not existing.
      // We need to decide how to handle permissions: via a new UserPermission model or by ensuring Role 10 has these permissions.

      const token = jwt.sign(
        { userId: newUser.UserID, email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      console.log('JWT token generated for user ID:', newUser.UserID); // Log token generation

      res.status(201).json({ token });
      console.log('Registration successful for user ID:', newUser.UserID); // Log successful response
    } catch (error) {
      console.error('Registration error:', error); // Keep existing error logging
      res.status(500).json({ message: 'Server error' });
    }
  };


export const login = async (req, res) => {
  console.log('Login endpoint hit. Request body:', req.body);
  try {
    const { email, password } = req.body;

    // Use Sequelize to find the user and include associated Role and Employee data
    const user = await db.User.findOne({
      where: { Email: email },
      include: [
        { model: db.Role, as: 'Role', attributes: ['RoleName'] }, // <--- ADDED 'as: "Role"' HERE
        { model: db.Employee, as: 'Employee', attributes: ['EmployeeName'] } // <--- ASSUMING Employee also has 'as: "Employee"' in User model
      ]
    });

    console.log('User found in DB:', user);

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials (user not found)' });
    }

    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    console.log('Password comparison result:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials (password mismatch)' });
    }

    // Fetch permissions using Sequelize
    let permissions = [];
    if (user.RoleID) {
      const rolePermissions = await db.RolePermission.findAll({
        where: { RoleID: user.RoleID },
        // Ensure Permission model has an alias if needed (e.g., 'as: "Permission"')
        include: [{ model: db.Permission, as: 'Permission', attributes: ['PermissionName'] }] // <--- ADDED 'as: "Permission"' HERE
      });
      permissions = rolePermissions.map(rp => rp.Permission.PermissionName);
      console.log('Permissions fetched for user:', permissions);
    }

    const jwtPayload = {
      userId: user.UserID,
      email: user.Email,
      Role: user.Role ? user.Role.RoleName : null, // Access via user.Role
      RoleID: user.RoleID,
      permissions: permissions
    };

    jwt.sign(
      jwtPayload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          return res.status(500).json({ success: false, message: 'Error signing token' });
        }

        res.json({
          success: true,
          token: token,
          userId: user.UserID,
          email: user.Email,
          employeeName: user.Employee ? user.Employee.EmployeeName : '', // Access via user.Employee
          roles: user.Role ? [user.Role.RoleName] : [], // Access via user.Role
          permissions: permissions
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};


export const rfidLogin = async (req, res) => {
  try {
    const { rfid } = req.body || {};

    if (!rfid) {
      return res.status(400).json({ message: 'RFID is required' });
    }

    const employeeResult = await pool.request()
      .input('rfid', sql.NVarChar(100), rfid)
      .query('SELECT * FROM Employees WHERE RFID = @rfid');

    const employee = employeeResult.recordset[0];
    if (!employee) {
      return res.status(404).json({ message: 'RFID not found' });
    }

    const userResult = await pool.request()
      .input('userId', sql.Int, employee.UserID)
      .query('SELECT * FROM Users WHERE UserID = @userId');

    const user = userResult.recordset[0];
    console.log('User found in DB:', user); // Log user found in database
    if (!user) {
      return res.status(404).json({ message: 'User not found for the given RFID' });
    }

    const token = jwt.sign(
      { userId: user.UserID, email: user.Email, roleId: user.RoleID },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('RFID Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (req, res) => {
  const userId = req.params.id;
  const { roleId } = req.body;

  if (!roleId) {
    return res.status(400).json({ message: 'RoleID is required' });
  }

  try {
    await poolConnect;
    await pool.request()
      .input('UserID', sql.Int, userId)
      .input('RoleID', sql.Int, roleId)
      .query('UPDATE Users SET RoleID = @RoleID WHERE UserID = @UserID');

    res.status(200).json({ message: 'User role updated successfully' });
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all users with their roles
 */
export const getAllUsers = async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query(`
      SELECT
        u.UserID,
        u.Email,
        u.RoleID,
        r.RoleName
      FROM Users u
      LEFT JOIN Roles r ON u.RoleID = r.RoleID
    `);
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (req, res) => {
  try {
    await poolConnect;

    console.log('Decoded JWT payload:', req.user); // Debug line

    const result = await pool.request()
      .input('UserID', sql.Int, req.user.userId) // ✅ Use userId here
      .query(`
        SELECT
          u.UserID,
          u.Email,
          u.RoleID,
          r.RoleName
        FROM Users u
        LEFT JOIN Roles r ON u.RoleID = r.RoleID
        WHERE u.UserID = @UserID
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching current user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Add this function to your existing userController.js

export const authCallback = async (req, res) => {
  // Ensure req.user contains necessary user info from Auth0, including roleId if available
  // If Auth0 doesn't provide roleId directly, you might need to fetch it from your DB here
  // based on user.email or user.id from Auth0.

  // For now, assuming req.user has 'id', 'email', and 'roleId' (or similar) from Auth0 strategy
  const token = await generateToken({
    id: req.user.id,
    email: req.user.email,
    roleId: req.user.roleId // Make sure this is correctly populated by your Auth0 strategy
  });

  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:4200'}/auth-callback?token=${token}`);
};

// Make sure you have a generateToken function in your controller
const generateToken = async (user) => {
  let permissions = [];
  let roleName = '';
  let employeeName = '';

  // Use Sequelize to find the user and include associated Role and Employee data
  const foundUser = await db.User.findOne({
    where: { UserID: user.id },
    include: [
      { model: db.Role, as: 'Role', attributes: ['RoleName'] }, // <--- ADDED 'as: "Role"' HERE
      { model: db.Employee, as: 'Employee', attributes: ['EmployeeName'] } // <--- ASSUMING Employee also has 'as: "Employee"' in User model
    ]
  });

  if (foundUser) {
    roleName = foundUser.Role ? foundUser.Role.RoleName : '';
    employeeName = foundUser.Employee ? foundUser.Employee.EmployeeName : '';

    // Fetch permissions using Sequelize
    if (foundUser.RoleID) {
      const rolePermissions = await db.RolePermission.findAll({
        where: { RoleID: foundUser.RoleID },
        // Ensure Permission model has an alias if needed (e.g., 'as: "Permission"')
        include: [{ model: db.Permission, as: 'Permission', attributes: ['PermissionName'] }] // <--- ADDED 'as: "Permission"' HERE
      });
      permissions = rolePermissions.map(rp => rp.Permission.PermissionName);
    }
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      Role: roleName,
      RoleID: foundUser ? foundUser.RoleID : null,
      permissions: permissions,
      employeeName: employeeName,
      roles: roleName ? [roleName] : []
    },
    process.env.JWT_SECRET || 'your-jwt-secret',
    { expiresIn: '1d' }
  );
};


export const logout = (req, res) => {
  // Clear the user session
  req.logout(function(err) {
    if (err) { return next(err); }

    // Redirect to Auth0 logout URL
    const returnTo = encodeURIComponent('http://localhost:4200/login'); // Changed to frontend login URL
    const logoutURL = `https://${process.env.AUTH0_ISSUER_BASE_URL.replace('https://', '').trim()}/v2/logout?client_id=${process.env.AUTH0_CLIENT_ID}&returnTo=${returnTo}`;

    res.redirect(logoutURL);
  });
};