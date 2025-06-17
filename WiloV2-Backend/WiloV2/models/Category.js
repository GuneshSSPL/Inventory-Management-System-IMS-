import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

export default (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    CategoryID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    CategoryName: {
      type: DataTypes.STRING(100), // Matched SQL (was 255)
      allowNull: false,
      unique: true
    }
  });
  return Category;
};
