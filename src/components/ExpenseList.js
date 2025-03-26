import React, { useState, useEffect } from 'react';
import { Row, Col, Form, InputGroup, Button, Card, Modal, Table, Badge } from 'react-bootstrap';
import Expense from './Expense';
import ExpenseForm from './ExpenseForm';
import { EXPENSE_CATEGORIES, calculateMonthlyAmount } from '../data/expenseData';
import { useFilter } from '../context/FilterContext';
import ActionMenu from './ActionMenu';
import './ExpenseList.css';

const ExpenseList = ({ expenses, onDelete, onToggle, onEdit }) => {
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
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

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

  // Format frequency for display
  const formatFrequency = (frequency) => {
    if (!frequency) return '';
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };

  return (
    <div className="expense-list">
      <Card className="filter-card mb-4">
        <Card.Body>
          <Row className="mb-3">
            <Col lg={4} md={6} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label>Search</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
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
                      <i className="bi bi-x"></i>
                    </Button>
                  )}
                </InputGroup>
              </Form.Group>
            </Col>
            <Col lg={3} md={6} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {Object.keys(EXPENSE_CATEGORIES).map(key => (
                    <option key={key} value={EXPENSE_CATEGORIES[key]}>
                      {EXPENSE_CATEGORIES[key]}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col lg={2} md={4} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label>Person</Form.Label>
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
              </Form.Group>
            </Col>
            <Col lg={3} md={4} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <div className="d-flex">
                  <Form.Select
                    value={filterActive}
                    onChange={(e) => setFilterActive(e.target.value)}
                    className="me-2"
                  >
                    <option value="all">All</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </Form.Select>
                  <Button
                    variant="outline-secondary"
                    className="view-toggle-btn"
                    onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
                    title={`Switch to ${viewMode === 'cards' ? 'table' : 'card'} view`}
                  >
                    <i className={`bi bi-${viewMode === 'cards' ? 'table' : 'grid-3x3-gap'}`}></i>
                  </Button>
                </div>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={9}>
              <Form.Check
                type="switch"
                id="monthly-equivalent"
                label="Show monthly equivalent amounts"
                checked={showMonthlyEquivalent}
                onChange={(e) => setShowMonthlyEquivalent(e.target.checked)}
              />
            </Col>
            <Col md={3}>
              <Form.Group>
                <InputGroup className="sort-group">
                  <Form.Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    size="sm"
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
                    size="sm"
                  >
                    <i className={`bi bi-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {showSuccess && (
        <div className="alert alert-success mb-4">
          {successMessage}
        </div>
      )}

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
          <Button 
            variant="outline-primary"
            size="sm"
            onClick={handleShowForm}
            className="mt-2"
          >
            <i className="bi bi-plus-circle me-1"></i> Add New Expense
          </Button>
        </div>
      ) : (
        <>
          {viewMode === 'cards' ? (
            <div className="expense-cards-container">
              {sortedExpenses.map(expense => (
                <Expense
                  key={expense.id}
                  expense={expense}
                  onDelete={onDelete}
                  onToggle={onToggle}
                  onEdit={handleEditExpense}
                  showMonthlyEquivalent={showMonthlyEquivalent}
                />
              ))}
            </div>
          ) : (
            <Card className="mb-4 table-card">
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="expense-table mb-0">
                    <thead>
                      <tr>
                        <th>Expense</th>
                        <th>Category</th>
                        <th>Person</th>
                        <th>Amount</th>
                        <th>Frequency</th>
                        {showMonthlyEquivalent && <th>Monthly Equiv.</th>}
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedExpenses.map(expense => {
                        const monthlyAmount = showMonthlyEquivalent && expense.frequency 
                          ? calculateMonthlyAmount(expense.amount, expense.frequency)
                          : null;
                        
                        return (
                          <tr 
                            key={expense.id} 
                            className={!expense.active ? 'table-secondary' : ''}
                          >
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="expense-name fw-medium">
                                  {expense.title || expense.name}
                                  {!expense.active && (
                                    <Badge 
                                      bg="warning" 
                                      text="dark" 
                                      className="ms-2 inactive-badge"
                                    >
                                      Inactive
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <Badge 
                                bg="light" 
                                text="dark" 
                                className="category-badge"
                              >
                                {expense.category}
                              </Badge>
                            </td>
                            <td>
                              {expense.person && (
                                <Badge bg="secondary" className="person-badge">
                                  {expense.person}
                                </Badge>
                              )}
                            </td>
                            <td className="fw-medium">${expense.amount.toFixed(2)}</td>
                            <td>{formatFrequency(expense.frequency)}</td>
                            {showMonthlyEquivalent && (
                              <td className="monthly-amount">
                                ${monthlyAmount.toFixed(2)}
                              </td>
                            )}
                            <td className="text-center">
                              <ActionMenu 
                                onEdit={() => handleEditExpense(expense)}
                                onDelete={() => onDelete(expense.id)}
                                onToggle={() => onToggle(expense.id)}
                                isActive={expense.active}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          )}
        </>
      )}
      
      {/* Add Expense Button (Fixed) */}
      <div className="floating-action-btn">
        <Button 
          variant="primary" 
          size="lg" 
          className="rounded-circle shadow" 
          onClick={handleShowForm}
        >
          <i className="bi bi-plus-lg"></i>
        </Button>
      </div>
      
      {/* Expense Form Modal */}
      <Modal show={showForm} onHide={handleCloseForm} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{expenseToEdit ? 'Edit Expense' : 'Add New Expense'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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