import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sql, pool, poolConnect } from '../config/db.js';

export const findOrCreateUser = async (profile) => {
  try {
    await poolConnect;

    // Check if user exists by provider ID first
    const userByProviderResult = await pool.request()
      .input('provider', sql.NVarChar(50), profile.provider)
      .input('providerId', sql.NVarChar(100), profile.providerId)
      .query('SELECT u.*, r.RoleName FROM Users u LEFT JOIN Roles r ON u.RoleID = r.RoleID WHERE u.Provider = @provider AND u.ProviderID = @providerId');

    if (userByProviderResult.recordset.length > 0) {
      const user = userByProviderResult.recordset[0];
      return {
        id: user.UserID,
        email: user.Email,
        name: user.Name,
        provider: user.Provider,
        providerId: user.ProviderID,
        picture: user.ProfilePicture,
        roleId: user.RoleID, // Add RoleID
        roleName: user.RoleName // Add RoleName
      };
    }

    // Then check by email
    const userByEmailResult = await pool.request()
      .input('email', sql.NVarChar(100), profile.email)
      .query('SELECT u.*, r.RoleName FROM Users u LEFT JOIN Roles r ON u.RoleID = r.RoleID WHERE u.Email = @email');

    if (userByEmailResult.recordset.length > 0) {
      // Update existing user with provider info if needed
      const existingUser = userByEmailResult.recordset[0];
      if (!existingUser.Provider) {
        await pool.request()
          .input('userId', sql.Int, existingUser.UserID)
          .input('provider', sql.NVarChar(50), profile.provider)
          .input('providerId', sql.NVarChar(100), profile.providerId)
          .query('UPDATE Users SET Provider = @provider, ProviderID = @providerId WHERE UserID = @userId');
      }
      return {
        id: existingUser.UserID,
        email: existingUser.Email,
        name: existingUser.Name,
        provider: existingUser.Provider,
        providerId: existingUser.ProviderID,
        picture: existingUser.ProfilePicture,
        roleId: existingUser.RoleID, // Add RoleID
        roleName: existingUser.RoleName // Add RoleName
      };
    }

    // Create new user if not found
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const passwordHash = await bcrypt.hash(randomPassword, 12);

    const defaultRoleId = 10; // Assuming RoleID 10 is the 'user' role
    const defaultDepartmentId = 1; // <-- Add a default DepartmentID

    const userInsertResult = await pool.request()
      .input('email', sql.NVarChar(100), profile.email)
      .input('passwordHash', sql.NVarChar(256), passwordHash)
      .input('provider', sql.NVarChar(50), profile.provider)
      .input('providerId', sql.NVarChar(100), profile.providerId)
      .input('name', sql.NVarChar(100), profile.name || null)
      .input('picture', sql.NVarChar(256), profile.picture || null)
      .input('roleId', sql.Int, defaultRoleId)
      .input('departmentId', sql.Int, defaultDepartmentId)
      .query(`
        INSERT INTO Users (Email, PasswordHash, Provider, ProviderID, Name, ProfilePicture, RoleID, DepartmentID)
        OUTPUT INSERTED.UserID, INSERTED.RoleID
        VALUES (@email, @passwordHash, @provider, @providerId, @name, @picture, @roleId, @departmentId)
      `);

    const newUserId = userInsertResult.recordset[0].UserID;
    const newUserRoleId = userInsertResult.recordset[0].RoleID;

    // Fetch RoleName for the new user
    const roleResult = await pool.request()
      .input('roleId', sql.Int, newUserRoleId)
      .query('SELECT RoleName FROM Roles WHERE RoleID = @roleId');
    const newUserRoleName = roleResult.recordset.length > 0 ? roleResult.recordset[0].RoleName : null;

    // Assign 'view_material_table' permission (PermissionID 61) to the default role (RoleID 2)
    // This assumes RoleID 2 is the 'user' role and PermissionID 61 is 'view_material_table'
    const viewMaterialTablePermissionId = 61; // Use the provided PermissionID
    const roleIdToAssignPermission = defaultRoleId; // Assign to the default user role

    // Check if the permission is already assigned to the role to avoid duplicates
    const existingRolePermission = await pool.request()
      .input('roleId', sql.Int, roleIdToAssignPermission)
      .input('permissionId', sql.Int, viewMaterialTablePermissionId)
      .query('SELECT COUNT(*) AS count FROM RolePermissions WHERE RoleID = @roleId AND PermissionID = @permissionId');

    if (existingRolePermission.recordset[0].count === 0) {
      // If not already assigned, insert the association
      await pool.request()
        .input('roleId', sql.Int, roleIdToAssignPermission)
        .input('permissionId', sql.Int, viewMaterialTablePermissionId)
        .query('INSERT INTO RolePermissions (RoleID, PermissionID) VALUES (@roleId, @permissionId)');
      console.log(`Assigned permission ${viewMaterialTablePermissionId} to role ${roleIdToAssignPermission} for new user ${newUserId}`);
    } else {
      console.log(`Permission ${viewMaterialTablePermissionId} already assigned to role ${roleIdToAssignPermission}. Skipping assignment for new user ${newUserId}.`);
    }

    // Create employee record if name is provided
    if (profile.name) {
      await pool.request()
        .input('UserID', sql.Int, newUserId)
        .input('EmployeeName', sql.NVarChar(100), profile.name)
        .query('INSERT INTO Employees (UserID, EmployeeName) VALUES (@UserID, @EmployeeName)');
    }

    return {
      id: newUserId,
      email: profile.email,
      name: profile.name || null,
      provider: profile.provider,
      providerId: profile.providerId,
      picture: profile.picture || null,
      roleId: newUserRoleId, // Add RoleID
      roleName: newUserRoleName // Add RoleName
    };
  } catch (error) {
    console.error('Error in findOrCreateUser:', error);
    throw error;
  }
};

export const findUserById = async (id) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input('userId', sql.Int, id)
      .query('SELECT u.*, r.RoleName FROM Users u LEFT JOIN Roles r ON u.RoleID = r.RoleID WHERE u.UserID = @userId');
    
    const user = result.recordset[0];
    if (!user) return null;
    return {
      id: user.UserID,
      email: user.Email,
      name: user.Name,
      provider: user.Provider,
      providerId: user.ProviderID,
      picture: user.ProfilePicture,
      roleId: user.RoleID, // Add RoleID
      roleName: user.RoleName // Add RoleName
    };
  } catch (error) {
    console.error('Error in findUserById:', error);
    throw error;
  }
};