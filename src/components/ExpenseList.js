import React, { useState, useEffect } from 'react';
import { Row, Col, Form, InputGroup, Button, Card, Modal } from 'react-bootstrap';
import Expense from './Expense';
import ExpenseForm from './ExpenseForm';
import { calculateMonthlyAmount } from '../data/expenseData';
import { useFilter } from '../context/FilterContext';
import './ExpenseList.css';

const ExpenseList = ({ expenses, onDelete, onToggle, onEdit }) => {
  console.log('ExpenseList render, onEdit type:', typeof onEdit);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showMonthlyEquivalent, setShowMonthlyEquivalent] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Use the global filter context
  const { 
    selectedUsers, 
    availableUsers, 
    handleUserFilterChange, 
    handleSelectAllUsers,
    filterDataBySelectedUsers,
    updateAvailableUsers
  } = useFilter();

  // Update available users when expenses change
  useEffect(() => {
    if (expenses.length > 0) {
      updateAvailableUsers(expenses, []);
    }
  }, [expenses, updateAvailableUsers]);

  // Get unique categories from expenses
  const categories = [...new Set(expenses.map(expense => expense.category))];

  // Apply both the global user filter and local filters
  const filteredExpenses = filterDataBySelectedUsers(expenses).filter(expense => {
    const matchesSearch = expense.title 
      ? expense.title.toLowerCase().includes(searchTerm.toLowerCase())
      : expense.name 
        ? expense.name.toLowerCase().includes(searchTerm.toLowerCase()) 
        : true;
    const matchesCategory = filterCategory === '' || expense.category === filterCategory;
    const matchesActive = filterActive === 'all' || 
                         (filterActive === 'active' && expense.active) || 
                         (filterActive === 'inactive' && !expense.active);
    
    return matchesSearch && matchesCategory && matchesActive;
  });

  // Sort expenses
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortBy === 'amount') {
      const aAmount = showMonthlyEquivalent && a.frequency ? calculateMonthlyAmount(a.amount, a.frequency) : a.amount;
      const bAmount = showMonthlyEquivalent && b.frequency ? calculateMonthlyAmount(b.amount, b.frequency) : b.amount;
      return sortDirection === 'asc' ? aAmount - bAmount : bAmount - aAmount;
    } else if (sortBy === 'title') {
      const aTitle = a.title || a.name || '';
      const bTitle = b.title || b.name || '';
      return sortDirection === 'asc' 
        ? aTitle.localeCompare(bTitle) 
        : bTitle.localeCompare(aTitle);
    } else if (sortBy === 'category') {
      return sortDirection === 'asc' 
        ? a.category.localeCompare(b.category) 
        : b.category.localeCompare(a.category);
    } else if (sortBy === 'person') {
      // Handle null/undefined person values
      const aPerson = a.person || '';
      const bPerson = b.person || '';
      return sortDirection === 'asc' 
        ? aPerson.localeCompare(bPerson) 
        : bPerson.localeCompare(aPerson);
    } else {
      // Default sort by date
      return sortDirection === 'asc' 
        ? new Date(a.date) - new Date(b.date) 
        : new Date(b.date) - new Date(a.date);
    }
  });

  // Handle form open
  const handleShowForm = () => {
    setExpenseToEdit(null);
    setShowForm(true);
  };

  // Handle form close
  const handleCloseForm = () => {
    setShowForm(false);
    setExpenseToEdit(null);
  };

  // Handle edit expense
  const handleEditExpense = (expense) => {
    setExpenseToEdit(expense);
    setShowForm(true);
  };

  // Handle add expense
  const handleAddExpense = (expenseData) => {
    console.log('Adding expense:', expenseData);
    onEdit(expenseData);
    setSuccessMessage(`Added new expense "${expenseData.title}"`);
    setShowSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
    
    handleCloseForm();
  };

  // Handle update expense
  const handleUpdateExpense = (expenseData) => {
    console.log('Updating expense:', expenseData);
    onEdit(expenseData);
    setSuccessMessage(`Updated expense "${expenseData.title}"`);
    setShowSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
    
    handleCloseForm();
  };

  // Calculate total for active expenses (always use monthly equivalent)
  const activeTotal = filteredExpenses
    .filter(expense => expense.active)
    .reduce((total, expense) => {
      let amount = expense.amount;
      // Always apply frequency calculation for the total if frequency exists and is not monthly
      if (expense.frequency && expense.frequency !== 'monthly') {
        amount = calculateMonthlyAmount(expense.amount, expense.frequency);
      }
      return total + amount;
    }, 0);

  // Calculate non-monthly equivalent total (only used for display when toggle is off)
  const nonMonthlyActiveTotal = filteredExpenses
    .filter(expense => expense.active)
    .reduce((total, expense) => total + expense.amount, 0);

  return (
    <div className="expense-list">
      <Card className="filter-card mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="mb-0">Manage Expenses</h3>
            <Button 
              variant="primary" 
              onClick={handleShowForm}
            >
              Add New Expense
            </Button>
          </div>
          
          {showSuccess && (
            <div className="alert alert-success mt-2 mb-3">
              {successMessage}
            </div>
          )}
          
          <Row className="align-items-end">
            <Col md={3} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label>Search</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button 
                      variant="outline-secondary"
                      onClick={() => setSearchTerm('')}
                    >
                      Clear
                    </Button>
                  )}
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={2} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label>Person</Form.Label>
                <div>
                  <Form.Select
                    value={selectedUsers.includes('all') ? '' : selectedUsers.join(',')}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        handleSelectAllUsers(true);
                      } else {
                        handleUserFilterChange(e.target.value);
                      }
                    }}
                  >
                    <option value="">All Persons</option>
                    {availableUsers.map(person => (
                      <option key={person} value={person}>{person}</option>
                    ))}
                  </Form.Select>
                </div>
              </Form.Group>
            </Col>
            <Col md={2} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Sort By</Form.Label>
                <InputGroup>
                  <Form.Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    <option value="title">Title</option>
                    <option value="category">Category</option>
                    <option value="person">Person</option>
                  </Form.Select>
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col>
              <Form.Check
                type="switch"
                id="monthly-equivalent"
                label="Show monthly equivalent amounts for individual expenses"
                checked={showMonthlyEquivalent}
                onChange={(e) => setShowMonthlyEquivalent(e.target.checked)}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="mb-4 total-card">
        <h3>
          Total Active Expenses: <span className="text-primary">${activeTotal.toFixed(2)}</span>
          <small className="ms-2">(Monthly Equivalent)</small>
        </h3>
        <p>Showing {sortedExpenses.length} of {expenses.length} expenses</p>
        {!selectedUsers.includes('all') && (
          <div className="filter-badge">
            Filtered by: {selectedUsers.join(', ')}
            <Button 
              variant="link" 
              size="sm" 
              className="ms-2" 
              onClick={() => handleSelectAllUsers(true)}
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {sortedExpenses.length === 0 ? (
        <div className="text-center p-5 empty-state">
          <h4>No expenses found</h4>
          <p>Try adjusting your filters or add a new expense.</p>
        </div>
      ) : (
        sortedExpenses.map(expense => (
          <Expense
            key={expense.id}
            expense={expense}
            onDelete={onDelete}
            onToggle={onToggle}
            onEdit={handleEditExpense}
            showMonthlyEquivalent={showMonthlyEquivalent}
          />
        ))
      )}
      
      {/* Expense Form Modal */}
      <Modal show={showForm} onHide={handleCloseForm} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{expenseToEdit ? 'Edit Expense' : 'Add New Expense'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {console.log('Modal rendering, handleAddExpense type:', typeof handleAddExpense)}
          {console.log('Modal rendering, handleUpdateExpense type:', typeof handleUpdateExpense)}
          <ExpenseForm 
            addExpense={handleAddExpense} 
            editExpense={handleUpdateExpense} 
            expenseToEdit={expenseToEdit}
            setExpenseToEdit={setExpenseToEdit}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ExpenseList; 