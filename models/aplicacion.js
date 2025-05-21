'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Aplicacion extends Model {
    static associate(models) {
      this.belongsTo(models.Vacuna, {
        foreignKey: 'id_vacuna',
        as: 'vacuna'
      });

      this.belongsTo(models.Paciente, {
        foreignKey: 'id_paciente',
        as: 'paciente'
      });

      this.belongsTo(models.Ubicacion, {
        foreignKey: 'id_ubicacion',
        as: 'ubicacion'
      });

      this.belongsTo(models.Usuario, {
        foreignKey: 'id_usuario',
        as: 'enfermero'
      });

      this.belongsTo(models.Lote, { 
        foreignKey: 'id_lote',
        as: 'lote'
      });
    }
  }
  Aplicacion.init({
    id_vacuna: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'La vacuna es requerida' }
      }
    },
    id_paciente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El paciente es requerido' }
      }
    },
    id_ubicacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        async esCentroValido(value) {
          const ubicacion = await sequelize.models.Ubicacion.findByPk(value);
          if (!ubicacion || ubicacion.tipo !== 'Centro Vacunacion') {
            throw new Error('La ubicación debe ser un centro de vacunación');
          }
        }
      }
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        async esEnfermero(value) {
          const usuario = await sequelize.models.Usuario.findByPk(value, {
            include: { model: sequelize.models.Rol, as: 'rol' }
          });
          if (!usuario || usuario.rol.nombre !== 'Enfermero') {
            throw new Error('Solo enfermeros pueden registrar aplicaciones');
          }
        }
      }
    },
    id_lote: {
      type: DataTypes.INTEGER,  
      allowNull: false,
      validate: {
        async coincideConVacuna(value) {
          if (this.id_vacuna) {
            const vacuna = await sequelize.models.Vacuna.findByPk(this.id_vacuna);
            if (vacuna && vacuna.id_lote !== value) {
              throw new Error('El lote no coincide con la vacuna aplicada');
            }
          }
        }
      }
    },
    fecha_aplicacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: true,
        noEsFutura(value) {
          if (new Date(value) > new Date()) {
            throw new Error('La fecha no puede ser futura');
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Aplicacion',
    tableName: 'Aplicaciones',
    paranoid: true,
    hooks: {
      beforeCreate: async (aplicacion) => {
        // Validación de stock en ubicación
        const loteEnUbicacion = await sequelize.models.Stock.findOne({
          where: {
            id_lote: aplicacion.id_lote,
            id_ubicacion: aplicacion.id_ubicacion,
            cantidad: { [sequelize.Op.gt]: 0 }
          }
        });
        
        if (!loteEnUbicacion) {
          throw new Error('El lote no está disponible en esta ubicación o no tiene stock');
        }
      },
      afterCreate: async (aplicacion) => {
        // Disminuir stock automáticamente
        await sequelize.models.Stock.decrement('cantidad', {
          by: 1,
          where: {
            id_lote: aplicacion.id_lote,
            id_ubicacion: aplicacion.id_ubicacion
          }
        });
      }
    },
    indexes: [
      { fields: ['id_paciente'] },
      { fields: ['fecha_aplicacion'] },
      { fields: ['id_lote'] }  
    ]
  });

  return Aplicacion;
};