'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Descartes', 'id_ubicacion', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'id_usuario',
      references: { model: 'Ubicaciones', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Descartes', 'id_ubicacion');
  }
};
