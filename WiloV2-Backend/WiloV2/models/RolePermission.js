// models/RolePermission.js

import { DataTypes } from 'sequelize';
// No need to import sequelize here, as it's passed as an argument by index.js

export default (sequelize, DataTypes) => {
  const RolePermission = sequelize.define('RolePermission', {
    RolePermissionID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    RoleID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Roles', // Name of the target table
        key: 'RoleID',
      },
    },
    PermissionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Permissions', // Name of the target table
        key: 'PermissionID',
      },
    },
    // Timestamps for the association itself, if needed (e.g., when was this permission granted to this role)
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'RolePermissions',
    timestamps: true,
    updatedAt: 'UpdatedAt',
    createdAt: 'CreatedAt',
    indexes: [
      {
        unique: true,
        fields: ['RoleID', 'PermissionID'], // Ensures a role cannot have the same permission twice
      },
    ],
  });

  // Define associations within the associate method
  // This is crucial for Sequelize to know how to eager load (e.g., in `include` statements)
  RolePermission.associate = (models) => {
    // A RolePermission belongs to one Role
    RolePermission.belongsTo(models.Role, {
      foreignKey: 'RoleID',
      as: 'Role', // Alias to access the associated Role from a RolePermission instance
    });

    // A RolePermission belongs to one Permission
    RolePermission.belongsTo(models.Permission, {
      foreignKey: 'PermissionID',
      as: 'Permission', // Alias to access the associated Permission from a RolePermission instance
    });
  };

  return RolePermission;
};