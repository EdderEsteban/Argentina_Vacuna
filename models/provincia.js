'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Provincia extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Provincia.hasMany(models.Ubicacion, {
        foreignKey: 'id_provincia',
        as: 'ubicaciones'
      });
    }
  }
  Provincia.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  }, {
    sequelize,
    modelName: 'Provincia',
    tableName: 'Provincias',
    paranoid: true,
    timestamps: true
  });
  return Provincia;
};