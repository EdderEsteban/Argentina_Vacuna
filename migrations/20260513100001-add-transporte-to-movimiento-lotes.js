'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('MovimientoLotes', 'id_transporte', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Transportes', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      after: 'id_estado'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('MovimientoLotes', 'id_transporte');
  }
};
