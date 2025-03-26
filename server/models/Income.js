const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Income = sequelize.define('income', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  person: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  source: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  frequency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isGross: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  taxRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.25,
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  clientId: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  timestamps: true,
  underscored: true,
});

module.exports = Income;