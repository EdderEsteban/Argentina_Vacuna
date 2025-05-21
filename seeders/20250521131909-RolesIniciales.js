'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Roles', [
      {
        nombre: 'Administrador',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Director',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Enfermero',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Operador Provincial',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Operador Nacional',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', {
      nombre: [
        'Administrador', 
        'Director', 
        'Enfermero', 
        'Operador Provincial', 
        'Operador Nacional'
      ]
    }, {});
  }
};