const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/incomeController');

// GET all incomes
router.get('/', incomeController.getAllIncomes);

// GET income by id
router.get('/:id', incomeController.getIncomeById);

// POST new income
router.post('/', incomeController.createIncome);

// PUT update income
router.put('/:id', incomeController.updateIncome);

// DELETE income
router.delete('/:id', incomeController.deleteIncome);

// PATCH toggle income active state
router.patch('/:id/toggle', incomeController.toggleIncome);

module.exports = router;