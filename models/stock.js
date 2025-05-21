// models/stock.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Stock extends Model {
    static associate(models) {
      this.belongsTo(models.Lote, {
        foreignKey: 'id_lote',
        as: 'lote'
      });
      this.belongsTo(models.Ubicacion, {
        foreignKey: 'id_ubicacion',
        as: 'ubicacion'
      });
    }
  }

  Stock.init({
    id_lote: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'El lote es requerido' }
      }
    },
    id_ubicacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'La ubicación es requerida' }
      }
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'El stock no puede ser negativo'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Stock',
    tableName: 'Stocks',
    indexes: [
      {
        unique: true,
        fields: ['id_lote', 'id_ubicacion']
      }
    ]
  });

  return Stock;
};