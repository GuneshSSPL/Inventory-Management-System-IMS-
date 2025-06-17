// models/User.js

import { DataTypes } from 'sequelize';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    UserID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    Username: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    PasswordHash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    FirstName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    LastName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    RoleID: { // Foreign key for Role
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    DepartmentID: { // Foreign key for Department
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
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
    tableName: 'Users',
    timestamps: false
  });

  // Define associations within the associate method
  User.associate = (models) => {
    // A User belongs to one Role
    User.belongsTo(models.Role, {
      foreignKey: 'RoleID',
      as: 'Role'
    });

    // A User also belongs to one Department
    User.belongsTo(models.Department, {
      foreignKey: 'DepartmentID',
      as: 'Department'
    });

    // Add this association: A User has one Employee record
    User.hasOne(models.Employee, {
      foreignKey: 'UserID', // The foreign key in the Employee model that links back to User
      as: 'Employee' // Alias used for eager loading
    });
  };

  return User;
};
