'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addIndex('Laboratorios', ['nombre']),
      queryInterface.addIndex('Laboratorios', ['nacionalidad'])
    ]);
  },
  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeIndex('Laboratorios', ['nombre']),
      queryInterface.removeIndex('Laboratorios', ['nacionalidad'])
    ]);
  }
};