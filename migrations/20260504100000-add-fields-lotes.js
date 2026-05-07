'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Lotes', 'pais_origen', {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: 'id_laboratorio'
    });
    await queryInterface.addColumn('Lotes', 'fecha_adquisicion', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      after: 'fecha_compra'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Lotes', 'pais_origen');
    await queryInterface.removeColumn('Lotes', 'fecha_adquisicion');
  }
};
