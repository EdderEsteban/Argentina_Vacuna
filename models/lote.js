'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Lote extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relación con Laboratorio
      Lote.belongsTo(models.Laboratorio, {
        foreignKey: 'id_laboratorio',
        as: 'laboratorio'
      });

      // Relación con Vacuna
      Lote.hasMany(models.Vacuna, {
        foreignKey: 'id_lote',
        as: 'vacunas'
      });
    }
  }

  Lote.init({
    num_lote: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        msg: 'Este número de lote ya existe'
      },
      validate: {
        notEmpty: {
          msg: 'El número de lote es obligatorio'
        }
      }
    },
    id_laboratorio: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: 1,
          msg: 'Debe haber al menos 1 unidad en el lote'
        }
      }
    },
    fecha_fab: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: {
          msg: 'Fecha de fabricación inválida'
        },
        noEsFutura(value) {
          if (new Date(value) > new Date()) {
            throw new Error('La fecha de fabricación no puede ser futura');
          }
        }
      }
    },
    fecha_venc: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: {
          msg: 'Fecha de vencimiento inválida'
        },
        esPosteriorAFabricacion(value) {
          if (this.fecha_fab && value <= this.fecha_fab) {
            throw new Error('La fecha de vencimiento debe ser posterior a la de fabricación');
          }
        }
      }
    },
    fecha_compra: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: {
          msg: 'Fecha de compra inválida'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Lote',
    tableName: 'Lotes',
    paranoid: true,
    hooks: {
      async beforeValidate(lote) {
        if (lote.id_laboratorio) {
          const laboratorio = await sequelize.models.Laboratorio.findByPk(lote.id_laboratorio);
          if (!laboratorio) throw new Error('Laboratorio no encontrado');
        }
      }
    }
  });

  return Lote;
};