const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Goal = sequelize.define('goal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  targetAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currentAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  priority: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'medium',
  },
  clientId: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  timestamps: true,
  underscored: true,
});

module.exports = Goal;