'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Descarte extends Model {
    static associate(models) {
      // Relación con Lote
      this.belongsTo(models.Lote, {
        foreignKey: 'id_lote',
        as: 'lote'
      });

      // Relación con Usuario (persona a cargo)
      this.belongsTo(models.Usuario, {
        foreignKey: 'id_usuario',
        as: 'responsable'
      });

      // Relación con Estado
      this.belongsTo(models.Estado, {
        foreignKey: 'id_estado',
        as: 'estado'
      });

      // Relación con Ubicación (donde se descarta)
      this.belongsTo(models.Ubicacion, {
        foreignKey: 'id_ubicacion',
        as: 'ubicacion'
      });
    }
  }

  Descarte.init({
    id_lote: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El lote es requerido'
        }
      }
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El responsable es requerido'
        }
      }
    },
    id_ubicacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La ubicación es requerida'
        }
      }
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: 1,
          msg: 'La cantidad mínima es 1'
        },
        async tieneStockSuficiente(value) {
          const stock = await sequelize.models.Stock.findOne({
            where: {
              id_lote: this.id_lote,
              id_ubicacion: this.id_ubicacion
            }
          });
          
          if (!stock || value > stock.cantidad) {
            throw new Error('No hay suficiente stock para descartar');
          }
        }
      }
    },
    fecha_descarte: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: true,
        noEsFutura(value) {
          if (new Date(value) > new Date()) {
            throw new Error('La fecha no puede ser futura');
          }
        }
      }
    },
    forma_descarte: {
      type: DataTypes.ENUM(
        'incineracion',
        'autoclave',
        'reciclaje',
        'vertido_controlado',
        'devolucion_proveedor'
      ),
      allowNull: false
    },
    motivo: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El motivo es obligatorio'
        },
        len: {
          args: [10, 500],
          msg: 'El motivo debe tener entre 10 y 500 caracteres'
        }
      }
    },
    id_estado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3 // 3 = 'Descartado'
    }
  }, {
    sequelize,
    modelName: 'Descarte',
    tableName: 'Descartes',
    paranoid: true,
    hooks: {
      beforeCreate: async (descarte) => {
        // Validar que exista stock suficiente
        const stock = await sequelize.models.Stock.findOne({
          where: {
            id_lote: descarte.id_lote,
            id_ubicacion: descarte.id_ubicacion
          }
        });
        
        if (!stock || descarte.cantidad > stock.cantidad) {
          throw new Error('No hay suficiente stock para descartar');
        }
      },
      afterCreate: async (descarte) => {
        // 1. Actualizar estado de las vacunas descartadas
        await sequelize.models.Vacuna.update({
          id_estado: descarte.id_estado
        }, {
          where: {
            id_lote: descarte.id_lote,
            id_estado: 1 // Solo las disponibles
          },
          limit: descarte.cantidad
        });

        // 2. Disminuir stock
        await sequelize.models.Stock.decrement('cantidad', {
          by: descarte.cantidad,
          where: {
            id_lote: descarte.id_lote,
            id_ubicacion: descarte.id_ubicacion
          }
        });

        // 3. Registrar en el historial
        await sequelize.models.HistorialDescarte.create({
          id_descarte: descarte.id,
          accion: 'CREACION',
          detalles: `Descarte de ${descarte.cantidad} unidades`
        });

        // 4. Notificar al sistema si es masivo
        if (descarte.cantidad > 100) {
          await sequelize.models.Notificacion.create({
            tipo: 'DESCARTE_MASIVO',
            mensaje: `Descarte masivo detectado: Lote ${descarte.lote.num_lote}`,
            id_usuario: descarte.id_usuario
          });
        }
      }
    }
  });

  return Descarte;
};