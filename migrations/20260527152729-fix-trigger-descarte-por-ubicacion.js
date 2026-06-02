'use strict';

// El trigger AFTER INSERT del descarte estaba descontando del stock con MAYOR
// cantidad del lote, ignorando la ubicación donde se hizo el descarte. Eso
// rompía la trazabilidad: si descartaba 5 dosis del Hospital Italiano pero el
// Nivel Central tenía más stock del mismo lote, el trigger restaba del NC.
//
// Esta migration reemplaza el trigger por una versión que respeta id_ubicacion.

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
