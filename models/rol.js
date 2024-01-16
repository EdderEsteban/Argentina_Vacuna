'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rol extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Definir la asociación
      Rol.hasMany(models.Usuario, {
        foreignKey: 'id_rol'
      });
    }
  }
  Rol.init({
    Rol: DataTypes.STRING,
    Crear: DataTypes.BOOLEAN,
    Borrar: DataTypes.BOOLEAN,
    Editar: DataTypes.BOOLEAN,
    Leer: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Rol',
  });
  return Rol;
};