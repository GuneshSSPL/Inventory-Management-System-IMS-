import { pool, sql, poolConnect } from '../config/db.js';

export const assignDepartment = async (req, res) => {
  const { userId, departmentId } = req.body;
  
  if (!userId || !departmentId) {
    return res.status(400).json({ message: 'userId and departmentId are required' });
  }
  
  await poolConnect;
  
  try {
    // Update the Users table to assign a department
    await pool.request()
      .input('UserID', sql.Int, userId)
      .input('DepartmentID', sql.Int, departmentId)
      .query('UPDATE Users SET DepartmentID = @DepartmentID WHERE UserID = @UserID');
    
    res.json({ message: 'Department assigned successfully' });
  } catch (error) {
    console.error('Department assignment error:', error);
    res.status(500).json({ message: 'Server error during department assignment' });
  }
};
// Get all roles (updated with proper error handling)
export const getRoles = async (req, res) => {
  await poolConnect;
  try {
    const result = await pool.request()
      .query('SELECT RoleID, RoleName FROM Roles ORDER BY RoleName');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ 
      message: 'Failed to fetch roles',
      error: error.message 
    });
  }
};


export const getUsers = async (req, res) => {
  await poolConnect;
  try {
    const result = await pool.request()
      .query(`SELECT UserID, Email, DepartmentID 
              FROM Users 
              WHERE IsActive = 1 
              ORDER BY Email`);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Assign role to user (enhanced version)
export const assignRole = async (req, res) => {
  const { userId, roleId } = req.body;
  
  if (!userId || !roleId) {
    return res.status(400).json({ 
      message: 'Both user ID and role ID are required' 
    });
  }
  
  await poolConnect;
  
  try {
    const checkUser = await pool.request()
      .input('UserID', sql.Int, userId)
      .query('SELECT UserID FROM Users WHERE UserID = @UserID');
      
    if (checkUser.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    await pool.request()
      .input('UserID', sql.Int, userId)
      .input('RoleID', sql.Int, roleId)
      .query(`UPDATE Users 
             SET RoleID = @RoleID 
             WHERE UserID = @UserID`);
    
    res.json({ 
      success: true,
      message: 'Role assigned successfully',
      userId,
      roleId
    });
  } catch (error) {
    console.error('Role assignment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to assign role',
      error: error.message 
    });
  }
};
