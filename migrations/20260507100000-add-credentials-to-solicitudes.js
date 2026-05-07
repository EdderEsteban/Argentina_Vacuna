'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('SolicitudesAcceso', 'usuario', {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn('SolicitudesAcceso', 'password', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('SolicitudesAcceso', 'usuario');
    await queryInterface.removeColumn('SolicitudesAcceso', 'password');
  }
};
