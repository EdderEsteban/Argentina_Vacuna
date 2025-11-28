'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UsuarioUbicaciones', {
      id_usuario: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'Usuarios', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      id_ubicacion: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'Ubicaciones', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      id_rol: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Roles', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Índice para búsquedas rápidas
    await queryInterface.addIndex('UsuarioUbicaciones', ['id_ubicacion', 'id_usuario']);
    await queryInterface.addIndex('UsuarioUbicaciones', ['id_rol']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('UsuarioUbicaciones');
  }
};