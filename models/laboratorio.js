'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Laboratorio extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Laboratorio.hasMany(models.Lote, {
        foreignKey: "id_laboratorio",
      });
    }
  }
  Laboratorio.init({
    nombre: DataTypes.STRING,
    nacionalidad: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Laboratorio',
  });
  return Laboratorio;
};