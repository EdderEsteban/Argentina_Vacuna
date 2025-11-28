'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SolicitudesAcceso extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Aquí puedes definir asociaciones si es necesario en el futuro
      // Por ejemplo, si una solicitud de acceso está relacionada con un usuario
      // SolicitudesAcceso.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  SolicitudesAcceso.init({
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre es obligatorio'
        },
        len: {
          args: [2, 100],
          msg: 'El nombre debe tener entre 2 y 100 caracteres'
        }
      }
    },
    apellido: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El apellido es obligatorio'
        },
        len: {
          args: [2, 100],
          msg: 'El apellido debe tener entre 2 y 100 caracteres'
        }
      }
    },
    dni: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El DNI es obligatorio'
        }
      }
    },
    correo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: {
          msg: 'Debe proporcionar un email válido'
        },
        notEmpty: {
          msg: 'El correo es obligatorio'
        }
      }
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: {
          args: /^[0-9+\-\s()]+$/,
          msg: 'El teléfono solo puede contener números, espacios y los caracteres + - ( )'
        }
      }
    },
    motivo: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El motivo es obligatorio'
        },
        len: {
          args: [10, 1000],
          msg: 'El motivo debe tener entre 10 y 1000 caracteres'
        }
      }
    },
    estado: {
      type: DataTypes.ENUM('Pendiente', 'Aprobado', 'Rechazado'),
      allowNull: false,
      defaultValue: 'Pendiente'
    }
  }, {
    sequelize,
    modelName: 'SolicitudesAcceso',
    tableName: 'SolicitudesAcceso',
    paranoid: true, // Habilita borrado lógico
    timestamps: true, // Habilita createdAt y updatedAt
    indexes: [
      {
        fields: ['estado']
      },
      {
        fields: ['correo']
      }
    ]
  });

  return SolicitudesAcceso;
};