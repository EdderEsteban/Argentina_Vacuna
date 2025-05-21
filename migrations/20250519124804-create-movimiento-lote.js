'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MovimientoLotes', {
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
      id_ubicacion_origen: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Ubicaciones',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      id_ubicacion_destino: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Ubicaciones',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      fecha_movimiento: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_DATE')
      },
      id_estado: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1, // Estado inicial
        references: {
          model: 'Estados',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
    await queryInterface.addIndex('MovimientoLotes', ['id_lote']);
    await queryInterface.addIndex('MovimientoLotes', ['id_ubicacion_origen']);
    await queryInterface.addIndex('MovimientoLotes', ['id_ubicacion_destino']);
    await queryInterface.addIndex('MovimientoLotes', ['fecha_movimiento']);
    await queryInterface.addIndex('MovimientoLotes', ['id_estado']);

    // Crear trigger para validación de stock
    await queryInterface.sequelize.query(`
      CREATE TRIGGER validar_stock_movimiento
      BEFORE INSERT ON MovimientoLotes
      FOR EACH ROW
      BEGIN
        DECLARE stock_actual INT;
        
        IF NEW.id_ubicacion_origen IS NOT NULL THEN
          SELECT cantidad INTO stock_actual 
          FROM Stocks 
          WHERE id_lote = NEW.id_lote AND id_ubicacion = NEW.id_ubicacion_origen;
          
          IF stock_actual < NEW.cantidad THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No hay suficiente stock para este movimiento';
          END IF;
        END IF;
      END
    `);
  },

  async down(queryInterface) {
    // Eliminar trigger
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS validar_stock_movimiento
    `);
    
    await queryInterface.dropTable('MovimientoLotes');
  }
};