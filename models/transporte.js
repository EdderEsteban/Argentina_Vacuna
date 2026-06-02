'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Transporte extends Model {
    static associate(models) {
      this.hasMany(models.MovimientoLote, { foreignKey: 'id_transporte', as: 'movimientos' });
    }
  }

  Transporte.init({
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: { msg: 'El nombre de la empresa es requerido' } }
    },
    id_movil: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: { notEmpty: { msg: 'El identificador del móvil es requerido' } }
    }
  }, {
    sequelize,
    modelName: 'Transporte',
    tableName: 'Transportes',
    paranoid: true
  });

  return Transporte;
};
