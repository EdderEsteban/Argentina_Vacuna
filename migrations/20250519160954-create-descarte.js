'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Descartes', {
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
            id_usuario: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Usuarios',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            cantidad: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            fecha_descarte: {
                type: Sequelize.DATEONLY,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_DATE')
            },
            forma_descarte: {
                type: Sequelize.ENUM(
                    'incineracion',
                    'autoclave',
                    'reciclaje',
                    'vertido_controlado',
                    'devolucion_proveedor'
                ),
                allowNull: false
            },
            motivo: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            id_estado: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Estados',
                    key: 'id'
                },
                defaultValue: 3 // Descartado
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

        // Índices
        await queryInterface.addIndex('Descartes', ['id_lote']);
        await queryInterface.addIndex('Descartes', ['id_usuario']);
        await queryInterface.addIndex('Descartes', ['fecha_descarte']);
        await queryInterface.addIndex('Descartes', ['forma_descarte']);

        // Trigger para validar stock antes de descartar
        await queryInterface.sequelize.query(`
      CREATE TRIGGER validar_stock_descarte
      BEFORE INSERT ON Descartes
      FOR EACH ROW
      BEGIN
        DECLARE stock_actual INT;
        DECLARE lote_vencido BOOLEAN;
        
        -- Verificar stock disponible
        SELECT SUM(cantidad) INTO stock_actual
        FROM Stocks
        WHERE id_lote = NEW.id_lote;
        
        -- Verificar vencimiento
        SELECT fecha_venc < CURDATE() INTO lote_vencido
        FROM Lotes
        WHERE id = NEW.id_lote;
        
        IF NEW.id_estado != 3 AND lote_vencido THEN
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'El lote está vencido, debe usar estado "Vencido"';
        END IF;
        
        IF stock_actual < NEW.cantidad THEN
          SIGNAL SQLSTATE '45001'
          SET MESSAGE_TEXT = 'No hay suficiente stock para descartar';
        END IF;
      END
    `);

        // Trigger para actualizar stock después de descartar
        await queryInterface.sequelize.query(`
      CREATE TRIGGER actualizar_stock_descarte
      AFTER INSERT ON Descartes
      FOR EACH ROW
      BEGIN
        -- Disminuir stock en todas las ubicaciones
        UPDATE Stocks
        SET cantidad = cantidad - NEW.cantidad
        WHERE id_lote = NEW.id_lote
        ORDER BY cantidad DESC
        LIMIT 1;
      END
    `);
    },

    async down(queryInterface) {
        // Eliminar triggers
        await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS validar_stock_descarte
    `);
        await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS actualizar_stock_descarte
    `);
        await queryInterface.dropTable('Descartes');
    }
};