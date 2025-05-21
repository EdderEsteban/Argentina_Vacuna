'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Provincias', [
      { nombre: 'Buenos Aires', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'CABA', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Catamarca', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Chaco', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Chubut', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Córdoba', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Corrientes', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Entre Ríos', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Formosa', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Jujuy', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'La Pampa', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'La Rioja', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Mendoza', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Misiones', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Neuquén', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Río Negro', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Salta', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'San Juan', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'San Luis', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Santa Cruz', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Santa Fe', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Santiago del Estero', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Tierra del Fuego', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Tucumán', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Provincias', null, {});
  }
};