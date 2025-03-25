import React, { useState, useEffect, useMemo } from 'react';
import { Container, Tabs, Tab } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import PersonManager from './components/PersonManager';
import IncomeManager from './components/IncomeManager';
import { defaultFinancialData } from './data/expenseData';
import { formatExpensesForFile } from './utils/dataUtils';
import { updateExpenseDataFile } from './services/fileService';
import { FilterProvider } from './context/FilterContext';
import './App.css';

function App() {
  const [expenses, setExpenses] = useState(() => {
    // Load expenses from localStorage if available
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      return JSON.parse(savedExpenses);
    } else {
      // Use the default financial data instead of just 3 sample expenses
      const defaultExpenses = defaultFinancialData.expenses.map(expense => {
        // Generate a random date within the last 30 days for more realistic data
        const randomDate = new Date();
        randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
        
        return {
          ...expense,
          id: uuidv4(),
          title: expense.name,
          date: randomDate.toISOString(),
          active: true
        };
      });
      
      console.log(`Loaded ${defaultExpenses.length} default expenses`);
      return defaultExpenses;
    }
  });

  const [incomes, setIncomes] = useState(() => {
    // Load incomes from localStorage if available
    const savedIncomes = localStorage.getItem('incomes');
    if (savedIncomes) {
      return JSON.parse(savedIncomes);
    } else {
      // Use the default financial data
      const defaultIncomes = defaultFinancialData.incomes.map(income => {
        return {
          ...income,
          id: uuidv4(),
          isGross: true,
          taxRate: 0.25
        };
      });
      
      console.log(`Loaded ${defaultIncomes.length} default incomes`);
      return defaultIncomes;
    }
  });

  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expensesTabKey, setExpensesTabKey] = useState('list');
  const [showImportedData, setShowImportedData] = useState(true); // Set to true since we're now using the default data

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Save incomes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('incomes', JSON.stringify(incomes));
  }, [incomes]);

  // Add new expense
  const addExpense = (expense) => {
    setExpenses([...expenses, { ...expense, id: uuidv4() }]);
  };

  // Delete expense
  const deleteExpense = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter((expense) => expense.id !== id));
    }
  };

  // Toggle expense active state
  const toggleExpense = (id) => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === id ? { ...expense, active: !expense.active } : expense
      )
    );
  };

  // Edit expense
  const editExpense = (updatedExpense) => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === updatedExpense.id ? {
          ...updatedExpense,
          // Keep the name property if it exists
          name: expense.name || updatedExpense.name
        } : expense
      )
    );
  };

  // Add new income
  const addIncome = (income) => {
    setIncomes([...incomes, income]);
  };

  // Update income
  const updateIncome = (updatedIncome) => {
    setIncomes(
      incomes.map((income) =>
        income.id === updatedIncome.id ? updatedIncome : income
      )
    );
  };

  // Delete income
  const deleteIncome = (id) => {
    setIncomes(incomes.filter((income) => income.id !== id));
  };

  // Update person name for all expenses
  const updatePersonName = (oldName, newName) => {
    if (!oldName || !newName) return 0;
    
    let count = 0;
    
    // Update expenses
    setExpenses(
      expenses.map(expense => {
        if (expense.person === oldName) {
          count++;
          return { ...expense, person: newName };
        }
        return expense;
      })
    );
    
    // Update incomes
    setIncomes(
      incomes.map(income => {
        if (income.person === oldName) {
          return { ...income, person: newName };
        }
        return income;
      })
    );
    
    return count;
  };

  // Save current expenses as default data
  const saveAsDefault = async () => {
    try {
      // Format the expenses and incomes for the file
      const formattedData = formatExpensesForFile(expenses, incomes);
      
      // Update the file
      const success = await updateExpenseDataFile(formattedData);
      
      if (success) {
        console.log('Default data updated successfully');
      } else {
        console.error('Failed to update default data');
      }
      
      return success;
    } catch (error) {
      console.error('Error saving default data:', error);
      return false;
    }
  };

  // Reset to default expense data
  const importDefaultData = () => {
    if (window.confirm('This will replace your current expenses and incomes with the default data. Continue?')) {
      // Reset expenses
      const defaultExpenses = defaultFinancialData.expenses.map(expense => {
        // Generate a random date within the last 30 days for more realistic data
        const randomDate = new Date();
        randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
        
        return {
          ...expense,
          id: uuidv4(),
          title: expense.name,
          date: randomDate.toISOString(),
          active: true
        };
      });
      
      // Reset incomes
      const defaultIncomes = defaultFinancialData.incomes.map(income => {
        return {
          ...income,
          id: uuidv4(),
          isGross: true,
          taxRate: 0.25
        };
      });
      
      setExpenses(defaultExpenses);
      setIncomes(defaultIncomes);
      setShowImportedData(true);
    }
  };

  // Clear all expenses and local storage
  const clearExpenses = () => {
    if (window.confirm('This will remove all your expenses, incomes, and clear saved data. Are you sure?')) {
      setExpenses([]);
      setIncomes([]);
      localStorage.removeItem('expenses');
      localStorage.removeItem('incomes');
      setShowImportedData(false);
    }
  };

  // Get unique persons from expenses
  const getUniquePersons = () => {
    const personsFromExpenses = [...new Set(expenses.filter(expense => expense.person).map(expense => expense.person))];
    const personsFromIncomes = [...new Set(incomes.filter(income => income.person).map(income => income.person))];
    
    // Combine and remove duplicates
    return [...new Set([...personsFromExpenses, ...personsFromIncomes])];
  };

  // Memoize the unique persons to avoid recalculating on every render
  const uniquePersons = useMemo(() => getUniquePersons(), [expenses, incomes]);

  return (
    <FilterProvider>
      <div className="app">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <Container className="main-container">
          {activeTab === 'dashboard' && (
            <Dashboard expenses={expenses} incomes={incomes} />
          )}
          
          {activeTab === 'expenses' && (
            <div>
              <h2 className="mb-4">Expense Tracker</h2>
              <Tabs
                activeKey={expensesTabKey}
                onSelect={(k) => setExpensesTabKey(k)}
                className="mb-3"
              >
                <Tab eventKey="list" title="Expense List">
                  <ExpenseList
                    expenses={expenses}
                    onDelete={deleteExpense}
                    onToggle={toggleExpense}
                    onEdit={(expense) => {
                      setExpenseToEdit(expense);
                      setExpensesTabKey('add');
                    }}
                  />
                </Tab>
                <Tab eventKey="add" title={expenseToEdit ? 'Edit Expense' : 'Add Expense'}>
                  <ExpenseForm
                    onAdd={addExpense}
                    onEdit={editExpense}
                    expenseToEdit={expenseToEdit}
                    resetEdit={() => setExpenseToEdit(null)}
                    existingPersons={uniquePersons}
                  />
                </Tab>
              </Tabs>
            </div>
          )}
          
          {activeTab === 'income' && (
            <IncomeManager
              incomes={incomes}
              onAdd={addIncome}
              onUpdate={updateIncome}
              onDelete={deleteIncome}
              existingPersons={uniquePersons}
            />
          )}
          
          {activeTab === 'manage-people' && (
            <PersonManager
              expenses={expenses}
              incomes={incomes}
              updatePersonName={updatePersonName}
            />
          )}
          
          {activeTab === 'settings' && (
            <div className="settings-container">
              <h2 className="mb-4">Settings</h2>
              <div className="settings-section">
                <h3>Data Management</h3>
                <div className="settings-actions">
                  <button onClick={importDefaultData} className="btn btn-secondary">
                    Import Default Data
                  </button>
                  <button onClick={saveAsDefault} className="btn btn-primary">
                    Save Current Data as Default
                  </button>
                  <button onClick={clearExpenses} className="btn btn-danger">
                    Clear All Data
                  </button>
                </div>
              </div>
              <div className="settings-info">
                <p>
                  {showImportedData && expenses.length > 0 ? 
                    'You are currently using imported sample data. Feel free to modify or add expenses.' :
                    'You are using your own data. You can always import sample data if needed.'}
                </p>
                <p>
                  <strong>Note:</strong> All data is stored locally in your browser.
                </p>
              </div>
            </div>
          )}
        </Container>
        
        <footer className="footer mt-auto py-3">
          <Container>
            <p className="text-center text-muted">&copy; {new Date().getFullYear()} Financial Manager</p>
          </Container>
        </footer>
      </div>
    </FilterProvider>
  );
}

export default App;
