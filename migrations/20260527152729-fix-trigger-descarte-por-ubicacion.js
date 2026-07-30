'use strict';

// Corrige el trigger de descarte para que descuente del stock de la ubicación
// donde se hizo el descarte

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS actualizar_stock_descarte');
    await queryInterface.sequelize.query(`
      CREATE TRIGGER actualizar_stock_descarte
      AFTER INSERT ON Descartes
      FOR EACH ROW
      BEGIN
        IF NEW.id_ubicacion IS NOT NULL THEN
          UPDATE Stocks
          SET cantidad = cantidad - NEW.cantidad
          WHERE id_lote = NEW.id_lote AND id_ubicacion = NEW.id_ubicacion;
        END IF;
      END
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS actualizar_stock_descarte');
    await queryInterface.sequelize.query(`
      CREATE TRIGGER actualizar_stock_descarte
      AFTER INSERT ON Descartes
      FOR EACH ROW
      BEGIN
        UPDATE Stocks
        SET cantidad = cantidad - NEW.cantidad
        WHERE id_lote = NEW.id_lote
        ORDER BY cantidad DESC
        LIMIT 1;
      END
    `);
  }
};
