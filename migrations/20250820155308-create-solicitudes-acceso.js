'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SolicitudesAcceso', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      apellido: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      dni: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      correo: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: { isEmail: true }
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      motivo: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      estado: {
        type: Sequelize.ENUM('Pendiente', 'Aprobado', 'Rechazado'),
        allowNull: false,
        defaultValue: 'Pendiente'
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

    // Índice para búsquedas rápidas
    await queryInterface.addIndex('SolicitudesAcceso', ['estado']);
    await queryInterface.addIndex('SolicitudesAcceso', ['correo']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('SolicitudesAcceso');
  }
};