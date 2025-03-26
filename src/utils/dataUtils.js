/**
 * Utility functions for managing expense and income data
 */

/**
 * Formats the current expenses and incomes into a string that can be used to update the expenseData.js file
 * @param {Array} expenses - The current expenses array
 * @param {Array} incomes - The current incomes array (optional)
 * @returns {string} - Formatted string for the data in expenseData.js
 */
export const formatExpensesForFile = (expenses, incomes = []) => {
  // Group expenses by person
  const expensesByPerson = {};
  
  expenses.forEach(expense => {
    const person = expense.person || 'Unknown';
    if (!expensesByPerson[person]) {
      expensesByPerson[person] = [];
    }
    expensesByPerson[person].push(expense);
  });
  
  // Format the data
  let formattedData = 'export const defaultFinancialData = {\n';
  
  // Format incomes
  formattedData += '  incomes: [\n';
  
  if (incomes.length > 0) {
    incomes.forEach((income, index) => {
      formattedData += `    { person: "${income.person || 'Unknown'}", source: "${income.source}", name: "${income.name}", amount: ${income.amount}, frequency: "${income.frequency}", isGross: ${income.isGross}, taxRate: ${income.taxRate} }`;
      
      // Add comma if not the last income
      if (index < incomes.length - 1) {
        formattedData += ',';
      }
      
      formattedData += '\n';
    });
  } else {
    // Default incomes if none provided
    formattedData += '    { person: "Kristopher", source: "Apple", name: "Software Engineer Salary", amount: 8333.33, frequency: "monthly", isGross: true, taxRate: 0.33 },  // 100k annually\n';
    formattedData += '    { person: "Kristopher", source: "Freelance", name: "iOS Development", amount: 2000, frequency: "monthly", isGross: true, taxRate: 0.25 },\n';
    formattedData += '    { person: "Kristopher", source: "Investments", name: "Dividend Income", amount: 500, frequency: "quarterly", isGross: false, taxRate: 0 },\n';
    formattedData += '    { person: "Taylor", source: "Rental", name: "Property Income", amount: 1500, frequency: "monthly", isGross: true, taxRate: 0.20 },\n';
    formattedData += '    { person: "Taylor", source: "Company XYZ", name: "UX Designer Salary", amount: 6250, frequency: "monthly", isGross: true, taxRate: 0.28 }\n';
  }
  
  formattedData += '  ],\n';
  formattedData += '  taxRate: 0.33,\n';
  
  // Format expenses
  formattedData += '  expenses: [\n';
  
  // Add each expense
  const allPersons = Object.keys(expensesByPerson).sort();
  
  allPersons.forEach((person, personIndex) => {
    const personExpenses = expensesByPerson[person];
    
    personExpenses.forEach((expense, index) => {
      const name = expense.title || expense.name || 'Unnamed Expense';
      const amount = expense.amount || 0;
      const frequency = expense.frequency || 'monthly';
      const category = expense.category || 'Other';
      
      formattedData += `    { person: "${person}", name: "${name}", amount: ${amount}, frequency: "${frequency}", category: EXPENSE_CATEGORIES.${getCategoryKey(category)} }`;
      
      // Add comma if not the last expense
      const isLastExpense = personIndex === allPersons.length - 1 && index === personExpenses.length - 1;
      if (!isLastExpense) {
        formattedData += ',';
      }
      
      formattedData += '\n';
    });
  });
  
  formattedData += '  ],\n';
  formattedData += '  goals: [\n';
  formattedData += '    { name: "Emergency Fund", targetAmount: 25000, currentAmount: 5000, priority: "high" },\n';
  formattedData += '    { name: "Down Payment", targetAmount: 100000, currentAmount: 15000, priority: "medium" },\n';
  formattedData += '    { name: "Vacation Fund", targetAmount: 5000, currentAmount: 1000, priority: "low" }\n';
  formattedData += '  ]\n';
  formattedData += '};\n';
  
  return formattedData;
};

/**
 * Gets the category key from the category value
 * @param {string} categoryValue - The category value (e.g., "Housing")
 * @returns {string} - The category key (e.g., "HOUSING")
 */
const getCategoryKey = (categoryValue) => {
  // Convert the category value to uppercase and replace spaces with underscores
  return categoryValue.toUpperCase().replace(/\s+/g, '_');
};

/**
 * Updates the expenseData.js file with the current expenses and incomes
 * @param {Array} expenses - The current expenses array
 * @param {Array} incomes - The current incomes array (optional)
 * @returns {Promise<boolean>} - Whether the update was successful
 */
export const updateExpenseDataFile = async (expenses, incomes = []) => {
  try {
    const formattedData = formatExpensesForFile(expenses, incomes);
    
    // In a real application, this would make an API call to update the file
    // For this example, we'll just log the formatted data
    console.log('Updated financial data:');
    console.log(formattedData);
    
    // In a real application, you would return whether the API call was successful
    return true;
  } catch (error) {
    console.error('Error updating financial data file:', error);
    return false;
  }
};

/**
 * Validates data against the expected schema for import/export
 * @param {Object} data - The data to validate
 * @returns {Object} - Object with isValid boolean and errors array
 */
export const validateData = (data) => {
  const errors = [];
  
  // Check if data is an object
  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Invalid data format: Not a valid JSON object'] };
  }
  
  // Validate expenses
  if (data.expenses) {
    if (!Array.isArray(data.expenses)) {
      errors.push('Expenses must be an array');
    } else {
      data.expenses.forEach((expense, index) => {
        if (!expense.id) errors.push(`Expense #${index + 1} is missing an ID`);
        if (!expense.amount && expense.amount !== 0) errors.push(`Expense #${index + 1} is missing an amount`);
        if (!expense.title && !expense.name) errors.push(`Expense #${index + 1} is missing a name/title`);
      });
    }
  } else {
    errors.push('Missing expenses data');
  }
  
  // Validate incomes
  if (data.incomes) {
    if (!Array.isArray(data.incomes)) {
      errors.push('Incomes must be an array');
    } else {
      data.incomes.forEach((income, index) => {
        if (!income.id) errors.push(`Income #${index + 1} is missing an ID`);
        if (!income.amount && income.amount !== 0) errors.push(`Income #${index + 1} is missing an amount`);
        if (!income.source) errors.push(`Income #${index + 1} is missing a source`);
      });
    }
  } else {
    errors.push('Missing incomes data');
  }
  
  // Validate persons
  if (data.persons) {
    if (!Array.isArray(data.persons)) {
      errors.push('Persons must be an array');
    } else {
      data.persons.forEach((person, index) => {
        if (!person.id) errors.push(`Person #${index + 1} is missing an ID`);
        if (!person.name) errors.push(`Person #${index + 1} is missing a name`);
      });
    }
  } else {
    errors.push('Missing persons data');
  }
  
  // Validate goals (optional)
  if (data.goals && !Array.isArray(data.goals)) {
    errors.push('Goals must be an array');
  }
  
  // Validate plans (optional)
  if (data.plans) {
    if (!Array.isArray(data.plans)) {
      errors.push('Plans must be an array');
    } else {
      data.plans.forEach((plan, index) => {
        if (!plan.id) errors.push(`Plan #${index + 1} is missing an ID`);
        if (!plan.name) errors.push(`Plan #${index + 1} is missing a name`);
        
        // Validate expenses within plan
        if (plan.expenses) {
          if (!Array.isArray(plan.expenses)) {
            errors.push(`Plan #${index + 1} has invalid expenses format`);
          } else {
            plan.expenses.forEach((expense, expIndex) => {
              if (!expense.id) errors.push(`Plan #${index + 1}, Expense #${expIndex + 1} is missing an ID`);
              if (expense.enabled === undefined) errors.push(`Plan #${index + 1}, Expense #${expIndex + 1} is missing enabled status`);
            });
          }
        } else {
          errors.push(`Plan #${index + 1} is missing expenses array`);
        }
        
        // Validate incomes within plan
        if (plan.incomes) {
          if (!Array.isArray(plan.incomes)) {
            errors.push(`Plan #${index + 1} has invalid incomes format`);
          } else {
            plan.incomes.forEach((income, incIndex) => {
              if (!income.id) errors.push(`Plan #${index + 1}, Income #${incIndex + 1} is missing an ID`);
              if (income.enabled === undefined) errors.push(`Plan #${index + 1}, Income #${incIndex + 1} is missing enabled status`);
            });
          }
        } else {
          errors.push(`Plan #${index + 1} is missing incomes array`);
        }
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}; 