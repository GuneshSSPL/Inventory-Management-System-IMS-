import { DataTypes } from 'sequelize';

import sequelize from '../config/sequelize.js';

export default (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    PermissionID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    PermissionName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true, // Permission names should be unique
      comment: 'e.g., create-user, read-material, update-settings'
    },
    Description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    // Timestamps
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'Permissions',
    timestamps: true, // Let Sequelize manage CreatedAt and UpdatedAt
    updatedAt: 'UpdatedAt',
    createdAt: 'CreatedAt',
  });
  return Permission;
};