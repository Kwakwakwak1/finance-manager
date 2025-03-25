const { Income } = require('../models');
const logger = require('../utils/logger');

// Get all incomes
exports.getAllIncomes = async (req, res) => {
  try {
    const incomes = await Income.findAll({
      order: [['created_at', 'DESC']]
    });
    return res.status(200).json(incomes);
  } catch (error) {
    logger.error(`Error fetching incomes: ${error.message}`);
    return res.status(500).json({ message: 'Error fetching incomes', error: error.message });
  }
};

// Get income by id
exports.getIncomeById = async (req, res) => {
  try {
    const income = await Income.findByPk(req.params.id);
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    return res.status(200).json(income);
  } catch (error) {
    logger.error(`Error fetching income ${req.params.id}: ${error.message}`);
    return res.status(500).json({ message: 'Error fetching income', error: error.message });
  }
};

// Create new income
exports.createIncome = async (req, res) => {
  try {
    const { person, source, name, amount, frequency, isGross, taxRate, clientId } = req.body;
    
    if (!person || !source || !name || !amount || !frequency) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const income = await Income.create({
      person,
      source,
      name,
      amount,
      frequency,
      isGross: isGross !== undefined ? isGross : true,
      taxRate: taxRate || 0.25,
      clientId
    });
    
    return res.status(201).json(income);
  } catch (error) {
    logger.error(`Error creating income: ${error.message}`);
    return res.status(500).json({ message: 'Error creating income', error: error.message });
  }
};

// Update income
exports.updateIncome = async (req, res) => {
  try {
    const income = await Income.findByPk(req.params.id);
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    
    const { person, source, name, amount, frequency, isGross, taxRate } = req.body;
    
    await income.update({
      person: person || income.person,
      source: source || income.source,
      name: name || income.name,
      amount: amount || income.amount,
      frequency: frequency || income.frequency,
      isGross: isGross !== undefined ? isGross : income.isGross,
      taxRate: taxRate !== undefined ? taxRate : income.taxRate
    });
    
    return res.status(200).json(income);
  } catch (error) {
    logger.error(`Error updating income ${req.params.id}: ${error.message}`);
    return res.status(500).json({ message: 'Error updating income', error: error.message });
  }
};

// Delete income
exports.deleteIncome = async (req, res) => {
  try {
    const income = await Income.findByPk(req.params.id);
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    
    await income.destroy();
    return res.status(200).json({ message: 'Income deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting income ${req.params.id}: ${error.message}`);
    return res.status(500).json({ message: 'Error deleting income', error: error.message });
  }
};