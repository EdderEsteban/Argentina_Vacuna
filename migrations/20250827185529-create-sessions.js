'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Sessions', {
      sid: {
        type: Sequelize.STRING(36),
        allowNull: false,
        primaryKey: true
      },
      expires: {
        type: Sequelize.DATE
      },
      data: {
        type: Sequelize.TEXT
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Sessions');
  }
};