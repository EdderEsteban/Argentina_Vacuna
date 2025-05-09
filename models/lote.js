'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Lote extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Lote.belongsTo(models.Laboratorio, {
        foreignKey: "id",
        targetKey: "id_laboratorio"
      });
      Lote.hasMany(models.Vacuna, {
        foreignKey: "lote_id", 
      });
    }
  }
  Lote.init({
    num_lote: DataTypes.STRING,
    id_laboratorio: DataTypes.INTEGER,
    cantidad: DataTypes.INTEGER,
    fecha_fab: DataTypes.DATEONLY,
    fecha_venc: DataTypes.DATEONLY,
    fecha_compra: DataTypes.DATEONLY
  }, {
    sequelize,
    modelName: 'Lote',
  });
  return Lote;
};