'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Paciente extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relación con Provincia (igual que en Ubicacion)
      Paciente.belongsTo(models.Provincia, {
        foreignKey: 'id_provincia',
        as: 'provincia'
      });
      
      // Relación con Ubicacion (para saber dónde se registró)
      Paciente.belongsTo(models.Ubicacion, {
        foreignKey: 'id_ubicacion_registro',
        as: 'ubicacionRegistro',
        hooks: true
      });
    }
  }

  Paciente.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El nombre es obligatorio' },
        len: [2, 100]
      }
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El apellido es obligatorio' }
      }
    },
    dni: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'dni_unique',
        msg: 'Este DNI ya está registrado'
      },
      validate: {
        isDNI(value) {
          if (!/^\d{7,8}$/.test(value)) {
            throw new Error('DNI debe contener 7 u 8 dígitos');
          }
        }
      }
    },
    telefono: {
      type: DataTypes.STRING,
      validate: {
        is: /^\+?[\d\s\-()]{7,}$/i
      }
    },
    correo: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      }
    },
    id_provincia: {
      type: DataTypes.INTEGER,
      validate: {
        async isValid(value) {
          if (value && !(await sequelize.models.Provincia.findByPk(value))) {
            throw new Error('Provincia no existe');
          }
        }
      }
    },
    id_ubicacion_registro: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        async isValid(value) {
          const ubicacion = await sequelize.models.Ubicacion.findByPk(value);
          if (!ubicacion || ubicacion.tipo !== 'Centro Vacunacion') {
            throw new Error('La ubicación debe ser un centro de vacunación válido');
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Paciente',
    tableName: 'Pacientes', // Plural coherente con Ubicaciones
    paranoid: true, // Borrado lógico 
    hooks: {
      beforeValidate: async (paciente) => {
        // Autocompletar provincia si viene de ubicación
        if (paciente.id_ubicacion_registro && !paciente.id_provincia) {
          const ubicacion = await sequelize.models.Ubicacion.findByPk(paciente.id_ubicacion_registro);
          if (ubicacion) paciente.id_provincia = ubicacion.id_provincia;
        }
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['dni']
      },
      {
        name: 'paciente_nombre_apellido',
        fields: ['apellido', 'nombre']
      }
    ]
  });

  return Paciente;
};