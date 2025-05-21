'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Estados', [
      { 
        codigo: 'DISP', 
        nombre: 'Disponible',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { 
        codigo: 'APLIC', 
        nombre: 'Aplicada',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { 
        codigo: 'DESC', 
        nombre: 'Descartada',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { 
        codigo: 'VENC', 
        nombre: 'Vencida',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Estados', {
      codigo: ['DISP', 'APLIC', 'DESC', 'VENC']
    }, {});
  }
};