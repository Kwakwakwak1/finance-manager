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
import { expenseApi, incomeApi, goalApi, personApi, checkApiAvailability } from './services/apiService';
import './App.css';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [goals, setGoals] = useState([]);
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiConnected, setApiConnected] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showImportedData, setShowImportedData] = useState(true); // Set to true since we're now using the default data

  // Fetch data from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // First check if the API is available
        const isApiAvailable = await checkApiAvailability();
        setApiConnected(isApiAvailable);
        
        if (isApiAvailable) {
          // Load data from API
          const [expensesData, incomesData, goalsData, personsData] = await Promise.all([
            expenseApi.getAll(),
            incomeApi.getAll(),
            goalApi.getAll(),
            personApi.getAll()
          ]);
          
          setExpenses(expensesData);
          setIncomes(incomesData);
          setGoals(goalsData);
          setPersons(personsData);
          setError(null);
        } else {
          // Silently switch to local storage without throwing error
          throw new Error('API_UNAVAILABLE');
        }
      } catch (err) {
        if (err.message !== 'API_UNAVAILABLE') {
          console.error('Error fetching data from API:', err);
        }
        setError('Using locally stored data - changes will be saved in your browser.');
        setApiConnected(false);
        
        // Fallback to localStorage if API fails
        const savedExpenses = localStorage.getItem('expenses');
        const savedIncomes = localStorage.getItem('incomes');
        const savedPersons = localStorage.getItem('persons');
        
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
        
        if (savedPersons) {
          setPersons(JSON.parse(savedPersons));
        } else {
          // Create persons from unique names in expenses and incomes
          const personsFromExpenses = new Set(defaultFinancialData.expenses.map(expense => expense.person));
          const personsFromIncomes = new Set(defaultFinancialData.incomes.map(income => income.person));
          const uniquePersonNames = [...new Set([...personsFromExpenses, ...personsFromIncomes])];
          
          // Convert to person objects
          const defaultPersons = uniquePersonNames.map(name => ({
            id: uuidv4(),
            name,
            isActive: true,
            description: '',
          }));
          
          setPersons(defaultPersons);
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
  
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('persons', JSON.stringify(persons));
    }
  }, [persons, loading]);

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
    // console.log('App.js editExpense called with:', updatedExpense);
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
        // Fallback to local state if API is not connected
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
    if (window.confirm('Are you sure you want to delete this income?')) {
      try {
        if (apiConnected) {
          await incomeApi.delete(id);
        }
        setIncomes(incomes.filter((income) => income.id !== id));
      } catch (err) {
        console.error('Error deleting income:', err);
        setError('Failed to delete income. Please try again.');
      }
    }
  };

  // Person management functions
  const addPerson = async (newPerson) => {
    try {
      if (apiConnected) {
        const createdPerson = await personApi.create(newPerson);
        setPersons([...persons, createdPerson]);
      } else {
        // Fallback to local state
        const personWithId = { ...newPerson, id: uuidv4() };
        setPersons([...persons, personWithId]);
      }
    } catch (err) {
      console.error('Error adding person:', err);
      setError('Failed to add person. Please try again.');
      // Fallback to local state
      const personWithId = { ...newPerson, id: uuidv4() };
      setPersons([...persons, personWithId]);
    }
  };

  const updatePerson = async (updatedPerson) => {
    try {
      // Fetch the old person data to get the old name for updating expenses/incomes
      const oldPerson = persons.find(p => p.id === updatedPerson.id);
      
      if (apiConnected) {
        const response = await personApi.update(updatedPerson.id, updatedPerson);
        setPersons(persons.map(p => p.id === updatedPerson.id ? response : p));
        
        // If name changed, update related expenses and incomes
        if (oldPerson && oldPerson.name !== updatedPerson.name) {
          // Update expenses
          const updatedExpenses = expenses.map(expense => {
            if (expense.person === oldPerson.name) {
              return { ...expense, person: updatedPerson.name };
            }
            return expense;
          });
          
          // Update incomes
          const updatedIncomes = incomes.map(income => {
            if (income.person === oldPerson.name) {
              return { ...income, person: updatedPerson.name };
            }
            return income;
          });
          
          setExpenses(updatedExpenses);
          setIncomes(updatedIncomes);
          
          // If API connected, update each expense and income in the database
          if (apiConnected) {
            const expensePromises = updatedExpenses
              .filter(expense => expense.person === updatedPerson.name)
              .map(expense => expenseApi.update(expense.id, expense));
            
            const incomePromises = updatedIncomes
              .filter(income => income.person === updatedPerson.name)
              .map(income => incomeApi.update(income.id, income));
            
            await Promise.all([...expensePromises, ...incomePromises]);
          }
        }
      } else {
        // Local update
        setPersons(persons.map(p => p.id === updatedPerson.id ? updatedPerson : p));
        
        // If name changed, update related expenses and incomes
        if (oldPerson && oldPerson.name !== updatedPerson.name) {
          // Update expenses
          setExpenses(expenses.map(expense => {
            if (expense.person === oldPerson.name) {
              return { ...expense, person: updatedPerson.name };
            }
            return expense;
          }));
          
          // Update incomes
          setIncomes(incomes.map(income => {
            if (income.person === oldPerson.name) {
              return { ...income, person: updatedPerson.name };
            }
            return income;
          }));
        }
      }
    } catch (err) {
      console.error('Error updating person:', err);
      setError('Failed to update person. Please try again.');
      // Fallback to local update
      setPersons(persons.map(p => p.id === updatedPerson.id ? updatedPerson : p));
    }
  };

  const togglePersonActive = async (id) => {
    try {
      const person = persons.find(p => p.id === id);
      if (!person) return;
      
      const updatedPerson = { ...person, isActive: !person.isActive };
      
      if (apiConnected) {
        await personApi.toggleActive(id);
        setPersons(persons.map(p => p.id === id ? updatedPerson : p));
      } else {
        // Local toggle
        setPersons(persons.map(p => p.id === id ? updatedPerson : p));
      }
    } catch (err) {
      console.error('Error toggling person active status:', err);
      setError('Failed to update person status. Please try again.');
    }
  };

  const deletePerson = async (id) => {
    if (window.confirm('Are you sure you want to delete this person? This will NOT delete related expenses or incomes.')) {
      try {
        const personToDelete = persons.find(p => p.id === id);
        
        if (apiConnected) {
          await personApi.delete(id);
        }
        
        setPersons(persons.filter(p => p.id !== id));
        
        // Optionally: Update expenses and incomes with this person to have no person or a default value
        const personName = personToDelete?.name;
        if (personName) {
          // We're not deleting expenses/incomes, just updating them to have no person
          // This is optional, and could be handled differently as needed
        }
      } catch (err) {
        console.error('Error deleting person:', err);
        setError('Failed to delete person. Please try again.');
      }
    }
  };

  // Update person name
  const updatePersonName = async (oldName, newName) => {
    if (!oldName || !newName) return 0;
    
    let count = 0;
    
    try {
      // Find the person by name
      const personToUpdate = persons.find(p => p.name === oldName);
      
      if (personToUpdate) {
        // Update the person record first
        await updatePerson({
          ...personToUpdate,
          name: newName
        });
      }
      
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
          const [expensesData, incomesData, goalsData, personsData] = await Promise.all([
            expenseApi.getAll(),
            incomeApi.getAll(), 
            goalApi.getAll(),
            personApi.getAll()
          ]);
          
          setExpenses(expensesData);
          setIncomes(incomesData);
          setGoals(goalsData);
          setPersons(personsData);
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
          
          // Create persons from unique names in default expenses and incomes
          const personsFromExpenses = new Set(defaultFinancialData.expenses.map(expense => expense.person));
          const personsFromIncomes = new Set(defaultFinancialData.incomes.map(income => income.person));
          const uniquePersonNames = [...new Set([...personsFromExpenses, ...personsFromIncomes])];
          
          // Convert to person objects
          const defaultPersons = uniquePersonNames.map(name => ({
            id: uuidv4(),
            name,
            isActive: true,
            description: '',
          }));
          
          setExpenses(defaultExpenses);
          setIncomes(defaultIncomes);
          setPersons(defaultPersons);
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
        setPersons([]);
        localStorage.removeItem('expenses');
        localStorage.removeItem('incomes');
        localStorage.removeItem('persons');
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

  // Memoize the unique persons to avoid recalculating on every render
  const uniquePersons = useMemo(() => getUniquePersons(), [expenses, incomes]);

  // Get active persons for filtering
  const activePersons = useMemo(() => {
    return persons.filter(person => person.isActive).map(person => person.name);
  }, [persons]);

  return (
    <FilterProvider>
      <div className="app">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <Container className="main-container">
          {error && (
            <div className="alert alert-warning alert-dismissible fade show" role="alert">
              <strong>Notice:</strong> {error}
              <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
            </div>
          )}
          
          {!apiConnected && (
            <div className="alert alert-info mb-3">
              <i className="bi bi-cloud-slash me-2"></i>
              <strong>Offline Mode:</strong> You're working with local data stored in your browser.
              All changes will be saved locally, but won't sync with any server.
            </div>
          )}
          
          {activeTab === 'dashboard' && (
            <Dashboard expenses={expenses} incomes={incomes} activePersons={activePersons} />
          )}
          
          {activeTab === 'expenses' && (
            <div>
              <h2 className="mb-4">Expense Tracker</h2>
              <ExpenseList
                expenses={expenses}
                onDelete={deleteExpense}
                onToggle={toggleExpense}
                onEdit={editExpense}
                activePersons={activePersons}
              />
            </div>
          )}
          
          {activeTab === 'income' && (
            <IncomeManager
              incomes={incomes}
              onAdd={addIncome}
              onUpdate={updateIncome}
              onDelete={deleteIncome}
              existingPersons={uniquePersons}
              activePersons={activePersons}
            />
          )}
          
          {activeTab === 'manage-people' && (
            <PersonManager
              expenses={expenses}
              incomes={incomes}
              persons={persons}
              updatePersonName={updatePersonName}
              saveAsDefault={saveAsDefault}
              onAdd={addPerson}
              onUpdate={updatePerson}
              onDelete={deletePerson}
              onToggleActive={togglePersonActive}
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
