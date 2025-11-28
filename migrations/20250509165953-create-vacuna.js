'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Vacunas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      id_lote: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Lotes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      id_estado: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        references: {
          model: 'Estados',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      tipo: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      nombre_comercial: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Índices para consultas frecuentes
    await queryInterface.addIndex('Vacunas', ['id_lote']);
    await queryInterface.addIndex('Vacunas', ['id_estado']);
    await queryInterface.addIndex('Vacunas', ['tipo']);
    await queryInterface.addIndex('Vacunas', ['nombre_comercial']);

    // Trigger para actualizar estado cuando el lote venza
    await queryInterface.sequelize.query(`
      CREATE TRIGGER actualizar_estado_vencimiento
      AFTER UPDATE ON Lotes
      FOR EACH ROW
      BEGIN
        IF NEW.fecha_venc < CURDATE() THEN
          UPDATE Vacunas 
          SET id_estado = (SELECT id FROM Estados WHERE codigo = 'VENC')
          WHERE id_lote = NEW.id AND id_estado != (SELECT id FROM Estados WHERE codigo = 'APLIC');
        END IF;
      END
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS actualizar_estado_vencimiento
    `);
    
    await queryInterface.dropTable('Vacunas');
  }
};