const { Expense } = require('../models');
const logger = require('../utils/logger');

// Get all expenses
exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      order: [['created_at', 'DESC']]
    });
    return res.status(200).json(expenses);
  } catch (error) {
    logger.error(`Error fetching expenses: ${error.message}`);
    return res.status(500).json({ message: 'Error fetching expenses', error: error.message });
  }
};

// Get expense by id
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    return res.status(200).json(expense);
  } catch (error) {
    logger.error(`Error fetching expense ${req.params.id}: ${error.message}`);
    return res.status(500).json({ message: 'Error fetching expense', error: error.message });
  }
};

// Create new expense
exports.createExpense = async (req, res) => {
  try {
    const { 
      person, 
      name, 
      title,
      amount, 
      frequency, 
      category, 
      date,
      active,
      clientId 
    } = req.body;
    
    if (!person || !name || !amount || !frequency || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const expense = await Expense.create({
      person,
      name,
      title: title || name,
      amount,
      frequency,
      category,
      date: date || new Date(),
      active: active !== undefined ? active : true,
      clientId
    });
    
    return res.status(201).json(expense);
  } catch (error) {
    logger.error(`Error creating expense: ${error.message}`);
    return res.status(500).json({ message: 'Error creating expense', error: error.message });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    const { 
      person, 
      name, 
      title,
      amount, 
      frequency, 
      category, 
      date,
      active 
    } = req.body;
    
    await expense.update({
      person: person || expense.person,
      name: name || expense.name,
      title: title || expense.title,
      amount: amount !== undefined ? amount : expense.amount,
      frequency: frequency || expense.frequency,
      category: category || expense.category,
      date: date || expense.date,
      active: active !== undefined ? active : expense.active
    });
    
    return res.status(200).json(expense);
  } catch (error) {
    logger.error(`Error updating expense ${req.params.id}: ${error.message}`);
    return res.status(500).json({ message: 'Error updating expense', error: error.message });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    await expense.destroy();
    return res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting expense ${req.params.id}: ${error.message}`);
    return res.status(500).json({ message: 'Error deleting expense', error: error.message });
  }
};

// Toggle expense active state
exports.toggleExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    await expense.update({ active: !expense.active });
    return res.status(200).json(expense);
  } catch (error) {
    logger.error(`Error toggling expense ${req.params.id}: ${error.message}`);
    return res.status(500).json({ message: 'Error toggling expense', error: error.message });
  }
};