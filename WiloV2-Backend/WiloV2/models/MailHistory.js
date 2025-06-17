// models/MailHistory.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class MailHistory extends Model {
    static associate(models) {
      // A MailHistory record belongs to one Material
      MailHistory.belongsTo(models.Material, {
        foreignKey: 'MaterialCode', // The FK column in THIS table (MailHistories)
        targetKey: 'MaterialCode',  // The key it points to in the TARGET table (Materials)
        as: 'material'
      });
    }
  }

  MailHistory.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    MaterialCode: {
      type: DataTypes.STRING(200),
      allowNull: false,
      references: {
        model: 'Materials', // This should be the table name
        key: 'MaterialCode'
      }
    },
    MailType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    MailContent: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    RecipientEmail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SentAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'MailHistory',
    tableName: 'MailHistories',
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: 'UpdatedAt'
  });

  return MailHistory;
};