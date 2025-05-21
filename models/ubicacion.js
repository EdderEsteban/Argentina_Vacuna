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
        'Centro Vacunacion'
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
    timestamps: true,
    validate: {
      provinciaRequerida() {
        if (
          (this.tipo === 'Deposito Provincial' || this.tipo === 'Centro Vacunacion') &&
          !this.id_provincia
        ) {
          throw new Error('LEl campo provincia es obligatorio para centros de vacunación y depósitos provinciales');
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
    }
  });
  return Ubicacion;
};