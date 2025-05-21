// models/movimientolote.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MovimientoLote extends Model {
    static associate(models) {
      this.belongsTo(models.Lote, { foreignKey: 'id_lote', as: 'lote' });
      this.belongsTo(models.Ubicacion, { 
        foreignKey: 'id_ubicacion_origen', 
        as: 'origen' 
      });
      this.belongsTo(models.Ubicacion, { 
        foreignKey: 'id_ubicacion_destino', 
        as: 'destino' 
      });
    }
  }

  MovimientoLote.init({
    id_lote: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'El lote es requerido' }
      }
    },
    id_ubicacion_origen: {
      type: DataTypes.INTEGER,
      validate: {
        esDiferenteDestino(value) {
          if (value && value === this.id_ubicacion_destino) {
            throw new Error('Origen y destino no pueden ser iguales');
          }
        }
      }
    },
    id_ubicacion_destino: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'El destino es requerido' }
      }
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'La cantidad mínima es 1'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'MovimientoLote',
    tableName: 'MovimientoLotes',
    paranoid: true
  });

  return MovimientoLote;
};