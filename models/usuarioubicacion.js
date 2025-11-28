'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UsuarioUbicacion extends Model {
    static associate(models) {
      this.belongsTo(models.Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
      this.belongsTo(models.Ubicacion, { foreignKey: 'id_ubicacion', as: 'ubicacion' });
      this.belongsTo(models.Rol, { foreignKey: 'id_rol', as: 'rol' });
    }
  }

  UsuarioUbicacion.init({
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    id_ubicacion: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    id_rol: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'UsuarioUbicacion',
    tableName: 'UsuarioUbicaciones',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['id_usuario', 'id_ubicacion', 'id_rol'] }
    ]
  });

  return UsuarioUbicacion;
};