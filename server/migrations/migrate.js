const { sequelize } = require('../config/database');
const { Income, Expense, Goal } = require('../models');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Default data from expenseData.js
const { defaultFinancialData } = require('../../src/data/expenseData');

const migrateData = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    logger.info('Database connection established');

    // Sync models with database
    await sequelize.sync({ force: true });
    logger.info('Database tables created');

    // Import incomes
    const incomes = defaultFinancialData.incomes.map(income => ({
      person: income.person,
      source: income.source,
      name: income.name,
      amount: income.amount,
      frequency: income.frequency,
      isGross: income.isGross,
      taxRate: income.taxRate,
      clientId: uuidv4()
    }));
    
    await Income.bulkCreate(incomes);
    logger.info(`${incomes.length} incomes imported successfully`);

    // Import expenses
    const expenses = defaultFinancialData.expenses.map(expense => {
      // Generate a random date within the last 30 days for more realistic data
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
      
      return {
        person: expense.person,
        name: expense.name,
        title: expense.name,
        amount: expense.amount,
        frequency: expense.frequency,
        category: expense.category,
        date: randomDate,
        active: true,
        clientId: uuidv4()
      };
    });
    
    await Expense.bulkCreate(expenses);
    logger.info(`${expenses.length} expenses imported successfully`);

    // Import goals
    const goals = defaultFinancialData.goals.map(goal => ({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      priority: goal.priority,
      clientId: uuidv4()
    }));
    
    await Goal.bulkCreate(goals);
    logger.info(`${goals.length} goals imported successfully`);

    logger.info('Default data migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error(`Data migration failed: ${error.message}`);
    process.exit(1);
  }
};

migrateData();