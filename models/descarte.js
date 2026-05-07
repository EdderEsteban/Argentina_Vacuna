'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Descarte extends Model {
    static associate(models) {
      this.belongsTo(models.Lote, { foreignKey: 'id_lote', as: 'lote' });
      this.belongsTo(models.Usuario, { foreignKey: 'id_usuario', as: 'responsable' });
      this.belongsTo(models.Estado, { foreignKey: 'id_estado', as: 'estado' });
      this.belongsTo(models.Ubicacion, { foreignKey: 'id_ubicacion', as: 'ubicacion' });
    }
  }

  Descarte.init({
    id_lote: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { notNull: { msg: 'El lote es requerido' } }
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { notNull: { msg: 'El responsable es requerido' } }
    },
    id_ubicacion: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: 1, msg: 'La cantidad mínima es 1' }
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
        notEmpty: { msg: 'El motivo es obligatorio' },
        len: { args: [10, 500], msg: 'El motivo debe tener entre 10 y 500 caracteres' }
      }
    },
    id_estado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3
    }
  }, {
    sequelize,
    modelName: 'Descarte',
    tableName: 'Descartes',
    paranoid: true,
    hooks: {
      beforeCreate: async (descarte) => {
        // El trigger de BD valida el stock total. Acá validamos stock en la ubicación específica.
        if (descarte.id_ubicacion) {
          const stock = await sequelize.models.Stock.findOne({
            where: { id_lote: descarte.id_lote, id_ubicacion: descarte.id_ubicacion }
          });
          if (!stock || descarte.cantidad > stock.cantidad) {
            throw new Error('No hay suficiente stock en esa ubicación para descartar');
          }
        }
      },
      afterCreate: async (descarte) => {
        // Marcar vacunas disponibles del lote como descartadas
        await sequelize.models.Vacuna.update(
          { id_estado: descarte.id_estado },
          { where: { id_lote: descarte.id_lote, id_estado: 1 } }
        );
        // Nota: el trigger actualizar_stock_descarte ya decrementa el stock en BD
      }
    }
  });

  return Descarte;
};
