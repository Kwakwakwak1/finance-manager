import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Alert } from 'react-bootstrap';
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
import { expenseApi, incomeApi, goalApi } from './services/apiService';
import './App.css';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiConnected, setApiConnected] = useState(true);

  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expensesTabKey, setExpensesTabKey] = useState('list');
  const [showImportedData, setShowImportedData] = useState(true); // Set to true since we're now using the default data

  // Fetch data from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Load data from API
        const [expensesData, incomesData, goalsData] = await Promise.all([
          expenseApi.getAll(),
          incomeApi.getAll(),
          goalApi.getAll()
        ]);
        
        setExpenses(expensesData);
        setIncomes(incomesData);
        setGoals(goalsData);
        setApiConnected(true);
        setError(null);
      } catch (err) {
        console.error('Error fetching data from API:', err);
        setError('Oops!!! Failed to load data from server. Using local storage as fallback.');
        setApiConnected(false);
        
        // Fallback to localStorage if API fails
        const savedExpenses = localStorage.getItem('expenses');
        const savedIncomes = localStorage.getItem('incomes');
        
        if (savedExpenses) {
          setExpenses(JSON.parse(savedExpenses));
        } else {
          // Use default data if no localStorage data
          const defaultExpenses = defaultFinancialData.expenses.map(expense => {
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
          
          setExpenses(defaultExpenses);
        }
        
        if (savedIncomes) {
          setIncomes(JSON.parse(savedIncomes));
        } else {
          // Use default data if no localStorage data
          const defaultIncomes = defaultFinancialData.incomes.map(income => {
            return {
              ...income,
              id: uuidv4(),
              isGross: true,
              taxRate: 0.25
            };
          });
          
          setIncomes(defaultIncomes);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Save to localStorage as backup
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('expenses', JSON.stringify(expenses));
    }
  }, [expenses, loading]);
  
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('incomes', JSON.stringify(incomes));
    }
  }, [incomes, loading]);

  // Add new expense
  const addExpense = async (expense) => {
    try {
      if (apiConnected) {
        const newExpense = await expenseApi.create(expense);
        setExpenses([...expenses, newExpense]);
      } else {
        // Fallback to local state if API is not connected
        setExpenses([...expenses, { ...expense, id: uuidv4() }]);
      }
    } catch (err) {
      console.error('Error adding expense:', err);
      setError('Failed to add expense. Please try again.');
      // Fallback to local state
      setExpenses([...expenses, { ...expense, id: uuidv4() }]);
    }
  };

  // Delete expense
  const deleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        if (apiConnected) {
          await expenseApi.delete(id);
        }
        setExpenses(expenses.filter((expense) => expense.id !== id));
      } catch (err) {
        console.error('Error deleting expense:', err);
        setError('Failed to delete expense. Please try again.');
      }
    }
  };

  // Toggle expense active state
  const toggleExpense = async (id) => {
    try {
      if (apiConnected) {
        await expenseApi.toggle(id);
      }
      setExpenses(
        expenses.map((expense) =>
          expense.id === id ? { ...expense, active: !expense.active } : expense
        )
      );
    } catch (err) {
      console.error('Error toggling expense:', err);
      setError('Failed to update expense. Please try again.');
    }
  };

  // Edit expense
  const editExpense = async (updatedExpense) => {
    try {
      if (apiConnected) {
        const response = await expenseApi.update(updatedExpense.id, updatedExpense);
        setExpenses(
          expenses.map((expense) =>
            expense.id === updatedExpense.id ? response : expense
          )
        );
      } else {
        setExpenses(
          expenses.map((expense) =>
            expense.id === updatedExpense.id ? {
              ...updatedExpense,
              name: expense.name || updatedExpense.name
            } : expense
          )
        );
      }
    } catch (err) {
      console.error('Error updating expense:', err);
      setError('Failed to update expense. Please try again.');
      // Fallback to local update
      setExpenses(
        expenses.map((expense) =>
          expense.id === updatedExpense.id ? {
            ...updatedExpense,
            name: expense.name || updatedExpense.name
          } : expense
        )
      );
    }
  };

  // Add new income
  const addIncome = async (income) => {
    try {
      if (apiConnected) {
        const newIncome = await incomeApi.create(income);
        setIncomes([...incomes, newIncome]);
      } else {
        setIncomes([...incomes, { ...income, id: uuidv4() }]);
      }
    } catch (err) {
      console.error('Error adding income:', err);
      setError('Failed to add income. Please try again.');
      // Fallback to local state
      setIncomes([...incomes, { ...income, id: uuidv4() }]);
    }
  };

  // Update income
  const updateIncome = async (updatedIncome) => {
    try {
      if (apiConnected) {
        const response = await incomeApi.update(updatedIncome.id, updatedIncome);
        setIncomes(
          incomes.map((income) =>
            income.id === updatedIncome.id ? response : income
          )
        );
      } else {
        setIncomes(
          incomes.map((income) =>
            income.id === updatedIncome.id ? updatedIncome : income
          )
        );
      }
    } catch (err) {
      console.error('Error updating income:', err);
      setError('Failed to update income. Please try again.');
      // Fallback to local update
      setIncomes(
        incomes.map((income) =>
          income.id === updatedIncome.id ? updatedIncome : income
        )
      );
    }
  };

  // Delete income
  const deleteIncome = async (id) => {
    try {
      if (apiConnected) {
        await incomeApi.delete(id);
      }
      setIncomes(incomes.filter((income) => income.id !== id));
    } catch (err) {
      console.error('Error deleting income:', err);
      setError('Failed to delete income. Please try again.');
    }
  };

  // Update person name for all expenses and incomes
  const updatePersonName = async (oldName, newName) => {
    if (!oldName || !newName) return 0;
    
    let count = 0;
    
    try {
      // Update expenses
      const updatedExpenses = expenses.map(expense => {
        if (expense.person === oldName) {
          count++;
          return { ...expense, person: newName };
        }
        return expense;
      });
      
      // Update incomes
      const updatedIncomes = incomes.map(income => {
        if (income.person === oldName) {
          return { ...income, person: newName };
        }
        return income;
      });
      
      setExpenses(updatedExpenses);
      setIncomes(updatedIncomes);
      
      if (apiConnected) {
        // Update each expense in the database
        const expensePromises = updatedExpenses
          .filter(expense => expense.person === newName)
          .map(expense => expenseApi.update(expense.id, expense));
        
        // Update each income in the database
        const incomePromises = updatedIncomes
          .filter(income => income.person === newName)
          .map(income => incomeApi.update(income.id, income));
        
        await Promise.all([...expensePromises, ...incomePromises]);
      }
      
      return count;
    } catch (err) {
      console.error('Error updating person name:', err);
      setError('Failed to update all records. Some changes may not have been saved.');
      return count;
    }
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
  const importDefaultData = async () => {
    if (window.confirm('This will replace your current expenses and incomes with the default data. Continue?')) {
      try {
        setLoading(true);
        
        if (apiConnected) {
          // Call the database migration script through the API
          // This would be implemented in a real application
          alert('This would trigger a database reset to default data in a production environment');
          
          // Fetch the default data from the API
          const [expensesData, incomesData, goalsData] = await Promise.all([
            expenseApi.getAll(),
            incomeApi.getAll(), 
            goalApi.getAll()
          ]);
          
          setExpenses(expensesData);
          setIncomes(incomesData);
          setGoals(goalsData);
        } else {
          // Fallback to local implementation if API is not connected
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
        }
        
        setShowImportedData(true);
      } catch (err) {
        console.error('Error resetting to default data:', err);
        setError('Failed to reset to default data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Clear all expenses and local storage
  const clearExpenses = async () => {
    if (window.confirm('This will remove all your expenses, incomes, and clear saved data. Are you sure?')) {
      try {
        setLoading(true);
        
        if (apiConnected) {
          // In a real application, we would have an API endpoint to clear all data
          // This is a placeholder for a bulk delete operation
          alert('This would delete all data from the database in a production environment');
        }
        
        setExpenses([]);
        setIncomes([]);
        setGoals([]);
        localStorage.removeItem('expenses');
        localStorage.removeItem('incomes');
        setShowImportedData(false);
      } catch (err) {
        console.error('Error clearing data:', err);
        setError('Failed to clear all data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Get unique persons from expenses
  const getUniquePersons = () => {
    const personsFromExpenses = [...new Set(expenses.filter(expense => expense.person).map(expense => expense.person))];
    const personsFromIncomes = [...new Set(incomes.filter(income => income.person).map(income => income.person))];
    
    // Combine and remove duplicates
    return [...new Set([...personsFromExpenses, ...personsFromIncomes])];
  };

  return (
    <div className="app">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {loading ? (
        <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading your financial data...</p>
          </div>
        </Container>
      ) : (
        <Container className="main-container">
          {error && <Alert variant="warning" onClose={() => setError(null)} dismissible>{error}</Alert>}
          
          {!apiConnected && (
            <Alert variant="info">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Oopssss!! Operating in offline mode. Changes will be saved to local storage only.
            </Alert>
          )}
          
          {activeTab === 'dashboard' ? (
            <Dashboard expenses={expenses} incomes={incomes} goals={goals} />
          ) : (
            <div>
              <div className="d-flex justify-content-end mb-4">
                <button 
                  className="btn btn-outline-secondary me-2" 
                  onClick={importDefaultData}
                  disabled={loading || (showImportedData && expenses.length === defaultFinancialData.expenses.length)}
                >
                  {loading ? 'Loading...' : 'Reset to Default Data'}
                </button>
                <button 
                  className="btn btn-outline-danger" 
                  onClick={clearExpenses}
                  disabled={loading}
                >
                  Clear All Data
                </button>
              </div>
            
              <Tabs
                activeKey={expensesTabKey}
                onSelect={(k) => setExpensesTabKey(k)}
                className="mb-4"
              >
                <Tab eventKey="list" title="Expenses">
                  <ExpenseForm 
                    addExpense={addExpense} 
                    editExpense={editExpense}
                    expenseToEdit={expenseToEdit}
                    setExpenseToEdit={setExpenseToEdit}
                  />
                  <ExpenseList 
                    expenses={expenses}
                    onDelete={deleteExpense}
                    onToggle={toggleExpense}
                    onEdit={setExpenseToEdit}
                  />
                </Tab>
                <Tab eventKey="income" title="Income">
                  <IncomeManager 
                    expenses={expenses}
                    incomes={incomes}
                    addIncome={addIncome}
                    updateIncome={updateIncome}
                    deleteIncome={deleteIncome}
                    persons={getUniquePersons()}
                  />
                </Tab>
                <Tab eventKey="manage" title="Manage Persons">
                  <PersonManager 
                    expenses={expenses}
                    incomes={incomes}
                    updatePersonName={updatePersonName}
                    saveAsDefault={saveAsDefault}
                  />
                </Tab>
              </Tabs>
            </div>
          )}
        </Container>
      )}
      
      <footer className="footer mt-auto py-3">
        <Container>
          <p className="text-center text-muted">&copy; {new Date().getFullYear()} Financial Manager</p>
        </Container>
      </footer>
    </div>
  );
}

export default App;
