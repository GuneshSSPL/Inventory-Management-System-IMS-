import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

export default (sequelize, DataTypes) => {
  const Employee = sequelize.define('Employee', {
    EmployeeID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    UserID: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: true // SQL has UNIQUE but not NOT NULL, implies optional link
      // Foreign key will be set up in associations
    },
    EmployeeName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    RFID: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: true // SQL has UNIQUE but not NOT NULL
    },
    ProfilePicturePath: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
    // CreatedAt and UpdatedAt will be handled by Sequelize
  }, {
    tableName: 'Employees',
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: 'UpdatedAt'
  });
  return Employee;
};