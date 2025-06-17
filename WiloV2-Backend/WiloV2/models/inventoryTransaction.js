import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

export default (sequelize, DataTypes) => {
  const InventoryTransaction = sequelize.define('InventoryTransaction', {
    TransactionID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    MaterialCode: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: false
      // Foreign key will be set up in associations
    },
    TransactionType: {
      type: DataTypes.STRING(20),
      allowNull: false, // SQL has CHECK constraint, implying not null
      validate: {
        isIn: [['INWARD', 'CONSUMPTION', 'ADJUSTMENT']] // Sequelize validation
      }
    },
    Quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    TransactionDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    }
    // ReferenceDocument: {
    //   type: DataTypes.STRING(100),
    //   allowNull: true
    // }
    // CreatedAt and UpdatedAt will be handled by Sequelize
  }, {
    tableName: 'InventoryTransactions',
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: 'UpdatedAt'
  });

  InventoryTransaction.associate = (models) => {
    InventoryTransaction.belongsTo(models.Material, {
      foreignKey: 'MaterialCode',
      targetKey: 'MaterialCode'
    });
    InventoryTransaction.belongsTo(models.User, {
      foreignKey: 'UserID',
      targetKey: 'UserID'
    });
  };

  InventoryTransaction.beforeCreate((record, options) => {
    if (!record.TransactionDate) {
      record.TransactionDate = record.createdAt;
    }
  });

  return InventoryTransaction;
};