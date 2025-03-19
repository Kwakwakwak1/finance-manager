import React, { useState } from 'react';
import { Row, Col, Form, InputGroup, Button, Card } from 'react-bootstrap';
import Expense from './Expense';
import { calculateMonthlyAmount } from '../data/expenseData';
import './ExpenseList.css';

const ExpenseList = ({ expenses, onDelete, onToggle, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [filterPerson, setFilterPerson] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showMonthlyEquivalent, setShowMonthlyEquivalent] = useState(false);

  // Get unique categories from expenses
  const categories = [...new Set(expenses.map(expense => expense.category))];
  
  // Get unique persons from expenses
  const persons = [...new Set(expenses.filter(expense => expense.person).map(expense => expense.person))];

  // Filter expenses based on search term, category, person, and active status
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title 
      ? expense.title.toLowerCase().includes(searchTerm.toLowerCase())
      : expense.name 
        ? expense.name.toLowerCase().includes(searchTerm.toLowerCase()) 
        : true;
    const matchesCategory = filterCategory === '' || expense.category === filterCategory;
    const matchesPerson = filterPerson === '' || expense.person === filterPerson;
    const matchesActive = filterActive === 'all' || 
                         (filterActive === 'active' && expense.active) || 
                         (filterActive === 'inactive' && !expense.active);
    
    return matchesSearch && matchesCategory && matchesPerson && matchesActive;
  });

  // Sort expenses
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortBy === 'amount') {
      const aAmount = showMonthlyEquivalent && a.frequency ? calculateMonthlyAmount(a.amount, a.frequency) : a.amount;
      const bAmount = showMonthlyEquivalent && b.frequency ? calculateMonthlyAmount(b.amount, b.frequency) : b.amount;
      return sortDirection === 'asc' ? aAmount - bAmount : bAmount - aAmount;
    } else if (sortBy === 'title') {
      return sortDirection === 'asc' 
        ? a.title.localeCompare(b.title) 
        : b.title.localeCompare(a.title);
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

  // Calculate total for active expenses (always use monthly equivalent)
  const activeTotal = expenses
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
  const nonMonthlyActiveTotal = expenses
    .filter(expense => expense.active)
    .reduce((total, expense) => total + expense.amount, 0);

  return (
    <div className="expense-list">
      <Card className="filter-card mb-4">
        <Card.Body>
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
                <Form.Select
                  value={filterPerson}
                  onChange={(e) => setFilterPerson(e.target.value)}
                >
                  <option value="">All Persons</option>
                  {persons.map(person => (
                    <option key={person} value={person}>{person}</option>
                  ))}
                </Form.Select>
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
            onEdit={onEdit}
          />
        ))
      )}
    </div>
  );
};

export default ExpenseList; 