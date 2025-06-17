// models/Material.js

export default (sequelize, DataTypes) => {
  const Material = sequelize.define('Material', {
    MaterialCode: {
      type: DataTypes.STRING(200),
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
    IESCode: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    CategoryID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ManufacturerID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    SupplierID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { // Add references to link to the Suppliers table
        model: 'Suppliers',
        key: 'SupplierID'
      }
    },
    UOM: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    UnitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    CurrentQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    BarcodeData: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ReorderLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
  }, {
    tableName: 'Materials',
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: 'UpdatedAt'
  });

  // Association logic
  Material.associate = (models) => {
    // A Material can have many MailHistory records
    Material.hasMany(models.MailHistory, {
      foreignKey: 'MaterialCode', // The FK in the TARGET table (MailHistories)
      sourceKey: 'MaterialCode'   // The key in THIS table (Materials)
    });

    // A Material belongs to one Supplier
    Material.belongsTo(models.Supplier, {
      foreignKey: 'SupplierID' // The FK in THIS table (Materials)
    });
  };

  return Material;
};