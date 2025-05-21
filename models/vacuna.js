'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Vacuna extends Model {
    static associate(models) {
      Vacuna.belongsTo(models.Lote, {
        foreignKey: 'id_lote',
        as: 'lote'
      });

      Vacuna.belongsTo(models.Estado, {
        foreignKey: 'id_estado',
        as: 'estado'
      });

      Vacuna.hasOne(models.Aplicacion, {
        foreignKey: 'id_vacuna',
        as: 'aplicacion'
      });
    }
  }

  Vacuna.init({
    id_lote: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        async existeLote(value) {
          const lote = await sequelize.models.Lote.findByPk(value);
          if (!lote) throw new Error('Lote no encontrado');
        }
      }
    },
    id_estado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        async esEstadoValido(value) {
          const estado = await sequelize.models.Estado.findByPk(value);
          if (!estado) throw new Error('Estado no válido');
        }
      }
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El tipo de vacuna es obligatorio'
        }
      }
    },
    nombre_comercial: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre comercial es obligatorio'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Vacuna',
    tableName: 'Vacunas',
    paranoid: true,
    hooks: {
      async beforeValidate(vacuna) {
        // Solo validaciones básicas que no dupliquen lógica de triggers
        if (vacuna.id_lote) {
          const lote = await sequelize.models.Lote.findByPk(vacuna.id_lote);
          if (!lote) throw new Error('Lote no encontrado');
        }
        
        if (vacuna.id_estado) {
          const estado = await sequelize.models.Estado.findByPk(vacuna.id_estado);
          if (!estado) throw new Error('Estado no válido');
        }
      }
    }
  });

  return Vacuna;
};