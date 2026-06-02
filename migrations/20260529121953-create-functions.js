'use strict';

// Funciones almacenadas (CREATE FUNCTION) para cubrir el ítem "Funciones" de los
// objetos de BD que pide el PDF, junto a los SP, triggers y el evento.
//
//  fn_stock_disponible_lote(p_id_lote)  → dosis totales en stock del lote (todas las ubicaciones)
//  fn_dias_para_vencer(p_id_lote)       → días hasta el vencimiento (negativo si ya venció)

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS fn_stock_disponible_lote');
    await queryInterface.sequelize.query(`
      CREATE FUNCTION fn_stock_disponible_lote(p_id_lote INT)
      RETURNS INT
      DETERMINISTIC
      READS SQL DATA
      BEGIN
        DECLARE total INT;
        SELECT COALESCE(SUM(cantidad), 0) INTO total
        FROM Stocks
        WHERE id_lote = p_id_lote;
        RETURN total;
      END
    `);

    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS fn_dias_para_vencer');
    await queryInterface.sequelize.query(`
      CREATE FUNCTION fn_dias_para_vencer(p_id_lote INT)
      RETURNS INT
      DETERMINISTIC
      READS SQL DATA
      BEGIN
        DECLARE venc DATE;
        SELECT fecha_venc INTO venc FROM Lotes WHERE id = p_id_lote;
        IF venc IS NULL THEN
          RETURN NULL;
        END IF;
        RETURN DATEDIFF(venc, CURDATE());
      END
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS fn_stock_disponible_lote');
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS fn_dias_para_vencer');
  }
};
