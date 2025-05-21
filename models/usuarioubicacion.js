'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UsuarioUbicacion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relación con Usuario
      this.belongsTo(models.Usuario, {
        foreignKey: 'id_usuario',
        as: 'usuario'
      });
      
      // Relación con Ubicacion
      this.belongsTo(models.Ubicacion, {
        foreignKey: 'id_ubicacion',
        as: 'ubicacion'
      });
    }
  }
  UsuarioUbicacion.init({
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Usuarios',
        key: 'id'
      }
    },
    id_ubicacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Ubicaciones',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'UsuarioUbicacion',
    tableName: 'UsuarioUbicaciones', 
    timestamps: true,
    paranoid: false, // No necesita borrado lógico
    indexes: [
      {
        unique: true,
        fields: ['id_usuario', 'id_ubicacion']
      },
      {
        name: 'idx_ubicacion_usuario',
        fields: ['id_ubicacion'] // Para búsquedas desde ubicación
      }
    ]
  });

  return UsuarioUbicacion;
};