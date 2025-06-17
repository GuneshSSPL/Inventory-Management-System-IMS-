'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('MailHistories', 'RecipientEmail', {
      type: Sequelize.STRING,
      allowNull: true, // or false, depending on your requirements
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('MailHistories', 'RecipientEmail');
  }
};