'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rol extends Model {
    static associate(models) {
      Rol.hasMany(models.Usuario, {
        foreignKey: 'id_rol',
        as: 'usuarios'
      });
    }
  }

  Rol.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Ya existe un rol con este nombre'
      },
      validate: {
        notEmpty: {
          msg: 'El nombre del rol es obligatorio'
        },
        len: {
          args: [3, 50],
          msg: 'El nombre debe tener entre 3 y 50 caracteres'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Rol',
    tableName: 'Roles',
    paranoid: true  // Borrado lógico
  });

  return Rol;
};