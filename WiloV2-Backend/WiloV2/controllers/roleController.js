import db from '../models/index.js';
const Role = db.Role;
const Permission = db.Permission; // Import Permission model
const RolePermission = db.RolePermission; // Import RolePermission model

// import { sql, pool, poolConnect } from '../config/db.js'; // No longer needed for basic role CRUD if using Sequelize

// Create a new role
export const createRole = async (req, res, next) => {
  try {
    const { RoleName, Description } = req.body;
    if (!RoleName) {
      return res.status(400).json({ message: 'RoleName is required' });
    }
    const newRole = await Role.create({ RoleName, Description });
    res.status(201).json(newRole);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'RoleName already exists' });
    }
    next(error);
  }
};

// Get all roles
export const getAllRoles = async (req, res, next) => {
  try {
    const roles = await Role.findAll();
    res.status(200).json(roles);
  } catch (err) {
    // console.error('Error fetching roles:', err); // Keep for debugging if needed
    // res.status(500).send('Server error');
    next(err);
  }
};

// Get a single role by ID
export const getRoleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.status(200).json(role);
  } catch (error) {
    next(error);
  }
};

// Update a role by ID
export const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { RoleName, Description } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Update fields if they are provided
    if (RoleName !== undefined) role.RoleName = RoleName;
    if (Description !== undefined) role.Description = Description;

    await role.save();
    res.status(200).json(role);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'RoleName already exists' });
    }
    next(error);
  }
};

// Delete a role by ID
export const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Check for associated users or other dependencies before deleting if necessary
    // For example, if Users have a RoleID foreign key:
    // const usersWithRole = await db.User.count({ where: { RoleID: id } });
    // if (usersWithRole > 0) {
    //   return res.status(400).json({ message: 'Cannot delete role. It is currently assigned to users.' });
    // }
    // Similar checks for RolePermissions
    const rolePermissionsCount = await RolePermission.count({ where: { RoleID: id } });
    if (rolePermissionsCount > 0) {
        return res.status(400).json({ message: 'Cannot delete role. It has permissions assigned. Please remove permissions first.' });
    }


    await role.destroy();
    res.status(200).json({ message: 'Role deleted successfully' }); // Or res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Assign a permission to a role
export const assignPermissionToRole = async (req, res, next) => {
  try {
    const { roleId, permissionId } = req.params;

    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    const permission = await Permission.findByPk(permissionId);
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }

    // Check if the permission is already assigned to the role
    const existingAssignment = await RolePermission.findOne({
      where: {
        RoleID: roleId,
        PermissionID: permissionId
      }
    });

    if (existingAssignment) {
      return res.status(409).json({ message: 'Permission already assigned to this role' });
    }

    // Create the association in the RolePermissions table
    await RolePermission.create({ RoleID: roleId, PermissionID: permissionId });
    // Or, if you used Sequelize's addPermission method in model associations:
    // await role.addPermission(permission);

    res.status(200).json({ message: 'Permission assigned to role successfully' });
  } catch (error) {
    next(error);
  }
};

// Remove a permission from a role
export const removePermissionFromRole = async (req, res, next) => {
  try {
    const { roleId, permissionId } = req.params;

    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    const permission = await Permission.findByPk(permissionId);
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }

    // Remove the association from the RolePermissions table
    const result = await RolePermission.destroy({
      where: {
        RoleID: roleId,
        PermissionID: permissionId
      }
    });
    // Or, if you used Sequelize's removePermission method:
    // await role.removePermission(permission);

    if (result === 0) {
        return res.status(404).json({ message: 'Permission was not assigned to this role or already removed.' });
    }

    res.status(200).json({ message: 'Permission removed from role successfully' });
  } catch (error) {
    next(error);
  }
};

// Get all permissions for a specific role
export const getRolePermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const role = await Role.findByPk(roleId, {
      include: [{
        model: Permission,
        as: 'permissions', // Corrected alias to 'permissions' (lowercase)
        through: { attributes: [] } // Exclude join table attributes
      }]
    });

    if (!role) {
      return res.status(404).json({ message: 'Role not found.' });
    }

    // Access permissions using the corrected alias
    res.status(200).json(role.permissions);
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    res.status(500).json({ message: 'Failed to retrieve role permissions.', error: error.message });
  }
};