'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MovimientoLote extends Model {
    static associate(models) {
      this.belongsTo(models.Lote, { foreignKey: 'id_lote', as: 'lote' });
      this.belongsTo(models.Ubicacion, { foreignKey: 'id_ubicacion_origen', as: 'origen' });
      this.belongsTo(models.Ubicacion, { foreignKey: 'id_ubicacion_destino', as: 'destino' });
      this.belongsTo(models.Usuario, { foreignKey: 'id_usuario_origen', as: 'usuarioOrigen' });
      this.belongsTo(models.Usuario, { foreignKey: 'id_usuario_destino', as: 'usuarioDestino' });
      this.belongsTo(models.Estado, { foreignKey: 'id_estado', as: 'estado' });
    }
  }

  MovimientoLote.init({
    id_lote: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { notNull: { msg: 'El lote es requerido' } }
    },
    id_ubicacion_origen: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        esDiferenteDestino(value) {
          if (value && value === this.id_ubicacion_destino) {
            throw new Error('Origen y destino no pueden ser iguales');
          }
        }
      }
    },
    id_ubicacion_destino: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { notNull: { msg: 'El destino es requerido' } }
    },
    id_usuario_origen: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_usuario_destino: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fecha_recepcion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: { args: [1], msg: 'La cantidad mínima es 1' } }
    },
    fecha_movimiento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
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
    }
  }, {
    sequelize,
    modelName: 'MovimientoLote',
    tableName: 'MovimientoLotes',
    paranoid: true
  });

  return MovimientoLote;
};