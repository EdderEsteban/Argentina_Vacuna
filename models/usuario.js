'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Definir la asociación
      Usuario.belongsTo(models.Rol, {
        foreignKey: 'id',
        target_Key: 'id_rol'
      });    }
  }
  Usuario.init({
    id_rol: DataTypes.INTEGER,
    Nombre: DataTypes.STRING,
    Apellido: DataTypes.STRING,
    DNI: DataTypes.STRING,
    Correo: DataTypes.STRING,
    Telefono: DataTypes.STRING,
    usuario: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Usuario',
  });
  return Usuario;
};