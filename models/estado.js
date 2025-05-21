'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Estado extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Estado.hasMany(models.Vacuna, {
        foreignKey: 'id_estado',
        as: 'vacunas'
      });
    }
  }

  Estado.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Este estado ya existe'
      },
      validate: {
        notEmpty: {
          msg: 'El nombre del estado es obligatorio'
        }
      }
    },
    codigo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isUppercase: true
      }
    }
  }, {
    sequelize,
    modelName: 'Estado',
    tableName: 'Estados',
    timestamps: true,
    paranoid: true
  });

  return Estado;
};