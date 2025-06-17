import User from '../models/User.js'; // Assuming User model path
import Role from '../models/Role.js'; // Assuming Role model path
import { Op } from 'sequelize';

// Assign a specific role to a user (Admin only)
export const assignRoleToUser = async (req, res) => {
  try {
    const { userId, roleId } = req.body;

    if (!userId || !roleId) {
      return res.status(400).json({ message: 'User ID and Role ID are required.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found.' });
    }

    // Assuming your User model has a method to set the role
    // or you update the RoleID directly
    user.RoleID = roleId; // Or user.setRole(role) if you have associations set up
    await user.save();

    res.status(200).json({ message: `Role '${role.RoleName}' assigned successfully to user '${user.Username}'.` });
  } catch (error) {
    console.error('Error assigning role to user:', error);
    res.status(500).json({ message: 'Failed to assign role.', error: error.message });
  }
};

// Get all users for RoleMaster (Admin only)
export const getAllUsersForRoleMaster = async (req, res) => {
  try {
    // Fetch users, potentially with their current roles if your model associations allow
    const users = await User.findAll({
      attributes: ['UserID', 'Username', 'Email', 'RoleID'], // Specify attributes you need
      // include: [{ model: Role, attributes: ['RoleName'] }] // If you want to include RoleName
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users for RoleMaster:', error);
    res.status(500).json({ message: 'Failed to fetch users.', error: error.message });
  }
};

// Get all roles for RoleMaster (Admin only)
export const getAllRolesForRoleMaster = async (req, res) => {
  try {
    const roles = await Role.findAll({
      attributes: ['RoleID', 'RoleName', 'Description'] // Specify attributes you need
    });
    res.status(200).json(roles);
  } catch (error) {
    console.error('Error fetching roles for RoleMaster:', error);
    res.status(500).json({ message: 'Failed to fetch roles.', error: error.message });
  }
};