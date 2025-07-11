'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TRIGGER prevenir_aplicacion_vencida
      BEFORE INSERT ON Aplicaciones  
      FOR EACH ROW
      BEGIN
        DECLARE fecha_vencimiento DATE;
        DECLARE estado_vacuna INT;

        -- Obtener la fecha de vencimiento del lote
        SELECT fecha_venc INTO fecha_vencimiento
        FROM Lotes
        WHERE id = NEW.id_lote;

        -- Obtener el estado de la vacuna
        SELECT id_estado INTO estado_vacuna
        FROM Vacunas
        WHERE id = NEW.id_vacuna;

        -- Verificar si la vacuna está vencida o su lote ha vencido
        IF estado_vacuna = (SELECT id FROM Estados WHERE codigo = 'VENC') OR fecha_vencimiento < CURDATE() THEN
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'No se puede aplicar una vacuna vencida';
        END IF;
      END
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS prevenir_aplicacion_vencida
    `);
  }
};