'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Lotes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      num_lote: {
        type: Sequelize.STRING
      },
      id_laboratorio: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Laboratorios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      cantidad: {
        type: Sequelize.INTEGER
      },
      fecha_fab: {
        type: Sequelize.DATEONLY
      },
      fecha_venc: {
        type: Sequelize.DATEONLY
      },
      fecha_compra: {
        type: Sequelize.DATEONLY
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Lotes');
  }
};