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
      Usuario.hasMany(models.Aplicacion, {
        foreignKey: 'id_usuario',
        as: 'aplicaciones'
      });
      Usuario.belongsToMany(models.Ubicacion, {
        through: models.UsuarioUbicacion,
        foreignKey: 'id_usuario',
        otherKey: 'id_ubicacion',
        as: 'ubicaciones'
      });
    }

  }

  Usuario.init({
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
        }
      }
    },
    dni: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: {
        msg: 'Este DNI ya está registrado'
      },
      validate: {
        is: {
          args: /^\d{7,8}$/,
          msg: 'DNI debe contener 7 u 8 dígitos'
        }
      }
    },
    correo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        msg: 'Este correo ya está registrado'
      },
      validate: {
        isEmail: {
          msg: 'Debe ser un correo válido'
        }
      }
    },
    telefono: {
      type: DataTypes.STRING(20),
      validate: {
        is: {
          args: /^\+?\d{7,15}$/,
          msg: 'Formato de teléfono inválido'
        }
      }
    },
    usuario: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        msg: 'Nombre de usuario no disponible'
      },
      validate: {
        len: {
          args: [4, 50],
          msg: 'El usuario debe tener entre 4 y 50 caracteres'
        }
      }
    },
    password: {
      type: DataTypes.STRING(64),
      allowNull: false,
      validate: {
        len: {
          args: [8, 64],
          msg: 'La contraseña debe tener entre 8 y 64 caracteres'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'Usuarios',
    paranoid: true,
    defaultScope: {
      attributes: {
        exclude: ['password']  // No mostrar password por defecto
      }
    }
  });

  return Usuario;
};