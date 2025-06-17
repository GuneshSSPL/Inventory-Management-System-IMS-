 import db from '../models/index.js';
const Permission = db.Permission;

// Create a new permission
export const createPermission = async (req, res, next) => {
  try {
    const { PermissionName, Description } = req.body;
    if (!PermissionName) {
      return res.status(400).json({ message: 'PermissionName is required' });
    }
    const newPermission = await Permission.create({ PermissionName, Description });
    res.status(201).json(newPermission);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'PermissionName already exists' });
    }
    next(error);
  }
};

// Get all permissions
export const getAllPermissions = async (req, res, next) => {
  try {
    const permissions = await Permission.findAll();
    res.status(200).json(permissions);
  } catch (error) {
    next(error);
  }
};

// Get a single permission by ID
export const getPermissionById = async (req, res, next) => {
  try {
    const permission = await Permission.findByPk(req.params.id);
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    res.status(200).json(permission);
  } catch (error) {
    next(error);
  }
};

// Update a permission by ID
export const updatePermission = async (req, res, next) => {
  try {
    const { PermissionName, Description } = req.body;
    const permission = await Permission.findByPk(req.params.id);

    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }

    // Check for unique constraint violation if PermissionName is being changed
    if (PermissionName && PermissionName !== permission.PermissionName) {
        const existingPermission = await Permission.findOne({ where: { PermissionName } });
        if (existingPermission && existingPermission.PermissionID !== permission.PermissionID) {
            return res.status(409).json({ message: 'PermissionName already exists' });
        }
    }

    permission.PermissionName = PermissionName || permission.PermissionName;
    permission.Description = Description === undefined ? permission.Description : Description; // Allow setting Description to null or empty
    
    await permission.save();
    res.status(200).json(permission);
  } catch (error) {
     if (error.name === 'SequelizeUniqueConstraintError') {
      // This case should ideally be caught by the explicit check above,
      // but it's good to have a fallback.
      return res.status(409).json({ message: 'Error updating permission. PermissionName might already exist.' });
    }
    next(error);
  }
};

// Delete a permission by ID
export const deletePermission = async (req, res, next) => {
  try {
    const permission = await Permission.findByPk(req.params.id);
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    await permission.destroy();
    res.status(200).json({ message: 'Permission deleted successfully' });
  } catch (error) {
    // Handle potential foreign key constraint errors if permissions are in use
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({ message: 'Cannot delete permission. It is currently assigned to one or more roles.' });
    }
    next(error);
  }
};