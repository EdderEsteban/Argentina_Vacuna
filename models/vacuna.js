'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vacuna extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Vacuna.belongsTo(models.Lote, {
        foreignKey: "lote_id"
      });
    }
  }
  Vacuna.init({
    lote_id: DataTypes.INTEGER,
    tipo: DataTypes.STRING,
    nombre_comercial: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Vacuna',
  });
  return Vacuna;
};