// models/Role.js

import { DataTypes } from 'sequelize';
// No need to import sequelize here, as it's passed as an argument by index.js

export default (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    RoleID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    RoleName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    Description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Roles',
    timestamps: false
  });

  // Define associations within the associate method
  Role.associate = (models) => {
    // A Role can have many Users
    Role.hasMany(models.User, {
      foreignKey: 'RoleID', // The foreign key in the User model that links to Role
      as: 'Users' // Alias for the association
    });

    // A Role can have many Permissions through the RolePermission join table
    Role.hasMany(models.RolePermission, {
        foreignKey: 'RoleID',
        as: 'RolePermissions'
    });
    Role.belongsToMany(models.Permission, {
        through: models.RolePermission,
        foreignKey: 'RoleID',
        otherKey: 'PermissionID',
        as: 'Permissions'
    });
  };

  return Role;
};