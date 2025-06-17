import { DataTypes } from 'sequelize';

export default (sequelize, DataTypes) => {
  const Workspace = sequelize.define('Workspace', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
    },
    // Add other relevant fields for your workspace model here
    // For example:
    // createdBy: {
    //   type: DataTypes.INTEGER,
    //   references: {
    //     model: 'Users', // Assuming you have a Users table
    //     key: 'id',
    //   },
    // },
    // location: {
    //   type: DataTypes.STRING,
    // },
  });

  // Define associations here if needed
  // Workspace.associate = (models) => {
  //   Workspace.belongsTo(models.User, { foreignKey: 'createdBy' });
  // };

  return Workspace;
};