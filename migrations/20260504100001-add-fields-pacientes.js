'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Pacientes', 'fecha_nacimiento', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      after: 'dni'
    });
    await queryInterface.addColumn('Pacientes', 'genero', {
      type: Sequelize.ENUM('Masculino', 'Femenino', 'No binario', 'Prefiero no decir'),
      allowNull: true,
      after: 'fecha_nacimiento'
    });
    await queryInterface.addColumn('Pacientes', 'localidad', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'genero'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Pacientes', 'fecha_nacimiento');
    await queryInterface.removeColumn('Pacientes', 'genero');
    await queryInterface.removeColumn('Pacientes', 'localidad');
  }
};
