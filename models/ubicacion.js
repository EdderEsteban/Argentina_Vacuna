'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ubicacion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Ubicacion.belongsTo(models.Provincia, {
        foreignKey: 'id_provincia',
        targetKey: 'id',
        as: 'provincia'
      });
      Ubicacion.belongsToMany(models.Usuario, {
        through: models.UsuarioUbicacion,
        foreignKey: 'id_ubicacion',
        otherKey: 'id_usuario',
        as: 'usuarios'
      });
      Ubicacion.hasMany(models.UsuarioUbicacion, {
        foreignKey: 'id_ubicacion',
        as: 'usuariosUbicacion'
      });
    }
  }
  Ubicacion.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    direccion: DataTypes.STRING,
    telefono: DataTypes.STRING,
    tipo: {
      type: DataTypes.ENUM(
        'Deposito Nacional',
        'Distribucion',
        'Deposito Provincial',
        'Centro Vacunacion',
        'Centro Descarte',
        'Nivel Central'
      ),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    id_provincia: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Ubicacion',
    tableName: 'Ubicaciones',
    paranoid: true,
    timestamps: true,
    validate: {
      provinciaRequerida() {
        if (
          (this.tipo === 'Deposito Provincial' || this.tipo === 'Centro Vacunacion') &&
          !this.id_provincia
        ) {
          throw new Error('LEl campo provincia es obligatorio para centros de vacunación y depósitos provinciales');
        }
      }
    },
    hooks: {
      async beforeValidate(ubicacion, options) {
        if (ubicacion.id_provincia) {
          const provincia = await sequelize.models.Provincia.findByPk(ubicacion.id_provincia);
          if (!provincia) {
            throw new Error('La provincia especificada no existe');
          }
        }
      }
    }
  });

  return Ubicacion;
};