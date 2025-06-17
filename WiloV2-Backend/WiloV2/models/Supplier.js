// models/Supplier.js

export default (sequelize, DataTypes) => {
  const Supplier = sequelize.define('Supplier', {
    SupplierID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    SupplierName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      }
    },
    PhoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'Suppliers',
    timestamps: true,
  });

  // Association logic for Supplier
  Supplier.associate = (models) => {
    Supplier.hasMany(models.Material, {
      foreignKey: 'SupplierID'
    });
  };

  return Supplier;
};