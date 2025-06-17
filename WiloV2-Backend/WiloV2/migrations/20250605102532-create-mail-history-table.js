'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Running migration for MailHistories...');
    try {
      await queryInterface.createTable('MailHistories', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        MaterialCode: {
          type: Sequelize.STRING(100),
          allowNull: false,
          references: {
            model: 'Materials',
            key: 'MaterialCode',
          },
          onDelete: 'CASCADE',
        },
        MailType: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        MailContent: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        SentAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });
    } catch (err) {
      console.error('Migration failed:', err);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('MailHistories');
  },
};
