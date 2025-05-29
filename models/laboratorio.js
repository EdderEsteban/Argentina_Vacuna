'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Laboratorio extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Laboratorio.hasMany(models.Lote, {
        foreignKey: 'id_laboratorio',
        as: 'lote'
      });
    }
  }

  Laboratorio.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Ya existe un laboratorio con este nombre'
      },
      validate: {
        notEmpty: {
          msg: 'El nombre es obligatorio'
        },
        len: {
          args: [3, 100],
          msg: 'El nombre debe tener entre 3 y 100 caracteres'
        }
      }
    },
    nacionalidad: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La nacionalidad es obligatoria'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Laboratorio',
    tableName: 'Laboratorios',
    paranoid: true, // Borrado lógico
    indexes: [
      {
        fields: ['nombre']
      }
    ]
  });

  return Laboratorio;
};