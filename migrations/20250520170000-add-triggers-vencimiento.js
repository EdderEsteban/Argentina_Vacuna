'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TRIGGER prevenir_aplicacion_vencida
      BEFORE INSERT ON Aplicaciones  
      FOR EACH ROW
      BEGIN
        DECLARE estado_vacuna INT;
        DECLARE fecha_vencimiento DATE;
        
        -- Obtener estado y fecha de vencimiento mediante JOIN
        SELECT V.id_estado, L.fecha_venc INTO estado_vacuna, fecha_vencimiento
        FROM Vacunas V
        JOIN Lotes L ON V.id_lote = NEW.id_lote
        WHERE V.id = NEW.id_vacuna;
        
        -- Verificar estado o vencimiento directo
        IF estado_vacuna = (SELECT id FROM Estados WHERE codigo = 'VENC') OR
           fecha_vencimiento < CURDATE() THEN
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