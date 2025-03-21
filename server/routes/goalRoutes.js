const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');

// GET all goals
router.get('/', goalController.getAllGoals);

// GET goal by id
router.get('/:id', goalController.getGoalById);

// POST new goal
router.post('/', goalController.createGoal);

// PUT update goal
router.put('/:id', goalController.updateGoal);

// DELETE goal
router.delete('/:id', goalController.deleteGoal);

module.exports = router;