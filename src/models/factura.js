const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Cliente = require('./Cliente');

const Factura = sequelize.define('Factura', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  numero: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  clienteId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Cliente,
      key: 'id'
    }
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  items: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
    // Formato: [{ descripcion, cantidad, precio_unitario, subtotal }]
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  impuestos: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'pagada', 'cancelada'),
    defaultValue: 'pendiente'
  },
  folio_fiscal: {
    type: DataTypes.STRING(50),
    unique: true
  },
  notas: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'facturas',
  timestamps: true
});

// Relaciones
Cliente.hasMany(Factura, { foreignKey: 'clienteId' });
Factura.belongsTo(Cliente, { foreignKey: 'clienteId' });

module.exports = Factura;