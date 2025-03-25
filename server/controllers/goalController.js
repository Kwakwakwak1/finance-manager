const { Goal } = require('../models');
const logger = require('../utils/logger');

// Get all goals
exports.getAllGoals = async (req, res) => {
  try {
    const goals = await Goal.findAll({
      order: [['created_at', 'DESC']]
    });
    return res.status(200).json(goals);
  } catch (error) {
    logger.error(`Error fetching goals: ${error.message}`);
    return res.status(500).json({ message: 'Error fetching goals', error: error.message });
  }
};

// Get goal by id
exports.getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findByPk(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    return res.status(200).json(goal);
  } catch (error) {
    logger.error(`Error fetching goal ${req.params.id}: ${error.message}`);
    return res.status(500).json({ message: 'Error fetching goal', error: error.message });
  }
};

// Create new goal
exports.createGoal = async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, priority, clientId } = req.body;
    
    if (!name || !targetAmount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const goal = await Goal.create({
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      priority: priority || 'medium',
      clientId
    });
    
    return res.status(201).json(goal);
  } catch (error) {
    logger.error(`Error creating goal: ${error.message}`);
    return res.status(500).json({ message: 'Error creating goal', error: error.message });
  }
};

// Update goal
exports.updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findByPk(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    const { name, targetAmount, currentAmount, priority } = req.body;
    
    await goal.update({
      name: name || goal.name,
      targetAmount: targetAmount !== undefined ? targetAmount : goal.targetAmount,
      currentAmount: currentAmount !== undefined ? currentAmount : goal.currentAmount,
      priority: priority || goal.priority
    });
    
    return res.status(200).json(goal);
  } catch (error) {
    logger.error(`Error updating goal ${req.params.id}: ${error.message}`);
    return res.status(500).json({ message: 'Error updating goal', error: error.message });
  }
};

// Delete goal
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findByPk(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    await goal.destroy();
    return res.status(200).json({ message: 'Goal deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting goal ${req.params.id}: ${error.message}`);
    return res.status(500).json({ message: 'Error deleting goal', error: error.message });
  }
};