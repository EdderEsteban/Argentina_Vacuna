'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Lotes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      num_lote: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      id_laboratorio: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Laboratorios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      fecha_fab: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      fecha_venc: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      fecha_compra: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    await queryInterface.addIndex('Lotes', ['num_lote']);
    await queryInterface.addIndex('Lotes', ['fecha_venc']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Lotes');
  }
};