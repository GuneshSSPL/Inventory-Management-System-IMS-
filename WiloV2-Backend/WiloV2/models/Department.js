import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

export default (sequelize, DataTypes) => {
  const Department = sequelize.define('Department', {
    DepartmentID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    DepartmentName: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  });
  return Department;
};
