import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert, Modal, Table, InputGroup, Badge } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { FREQUENCY_OPTIONS, calculateMonthlyAmount } from '../data/expenseData';
import { useFilter } from '../context/FilterContext';
import ActionMenu from './ActionMenu';
import './IncomeManager.css';

const IncomeManager = ({ incomes, onAdd, onUpdate, onDelete, onToggle, existingPersons }) => {
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [incomeToEdit, setIncomeToEdit] = useState(null);
  const [filterActive, setFilterActive] = useState('all');
  const [formData, setFormData] = useState({
    id: '',
    person: '',
    source: '',
    name: '',
    amount: '',
    frequency: 'monthly',
    isGross: true,
    taxRate: 0.25 // Default tax rate
  });

  // Use the filter context
  const { 
    selectedUsers, 
    availableUsers, 
    handleUserFilterChange, 
    handleSelectAllUsers,
    filterDataBySelectedUsers,
    updateAvailableUsers
  } = useFilter();

  // Update available users when incomes change
  useEffect(() => {
    if (incomes.length > 0) {
      updateAvailableUsers([], incomes);
    }
  }, [incomes, updateAvailableUsers]);

  // Filter incomes based on selected users and active state
  const filteredIncomes = filterDataBySelectedUsers(incomes).filter(income => {
    const matchesActive = filterActive === 'all' || 
                         (filterActive === 'active' && income.active !== false) || 
                         (filterActive === 'inactive' && income.active === false);
    return matchesActive;
  });

  // Reset form when closing
  const resetForm = () => {
    setFormData({
      id: '',
      person: existingPersons.length > 0 ? existingPersons[0] : '',
      source: '',
      name: '',
      amount: '',
      frequency: 'monthly',
      isGross: true,
      taxRate: 0.25
    });
    setIncomeToEdit(null);
  };

  // Handle form open
  const handleShowForm = () => {
    resetForm();
    setShowForm(true);
  };

  // Handle form close
  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  // Handle edit income
  const handleEditIncome = (income) => {
    setIncomeToEdit(income);
    setFormData({
      id: income.id,
      person: income.person,
      source: income.source,
      name: income.name,
      amount: income.amount,
      frequency: income.frequency,
      isGross: income.isGross,
      taxRate: income.taxRate || 0.25
    });
    setShowForm(true);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.person || !formData.source || !formData.name || !formData.amount) {
      return;
    }
    
    const incomeData = {
      ...formData,
      amount: parseFloat(formData.amount)
    };
    
    if (incomeToEdit) {
      // Update existing income
      onUpdate(incomeData);
      setSuccessMessage(`Updated income "${incomeData.name}" for ${incomeData.person}`);
    } else {
      // Add new income with a unique ID
      onAdd({
        ...incomeData,
        id: uuidv4()
      });
      setSuccessMessage(`Added new income "${incomeData.name}" for ${incomeData.person}`);
    }
    
    // Show success message
    setShowSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
    
    // Close form and reset
    handleCloseForm();
  };

  // Handle delete income
  const handleDeleteIncome = (id) => {
    if (window.confirm('Are you sure you want to delete this income source?')) {
      onDelete(id);
      setSuccessMessage('Income source deleted successfully');
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
  };

  // Calculate net income from gross
  const calculateNetIncome = (gross, taxRate) => {
    return gross * (1 - taxRate);
  };

  // Group incomes by person based on filtered incomes
  const incomesByPerson = {};
  
  // Only include persons from filtered incomes or from the selected users
  const personsToShow = selectedUsers.includes('all') 
    ? existingPersons 
    : selectedUsers;
  
  personsToShow.forEach(person => {
    incomesByPerson[person] = filteredIncomes.filter(income => income.person === person);
  });

  // Format frequency for display
  const formatFrequency = (frequency) => {
    const option = FREQUENCY_OPTIONS.find(f => f.value === frequency);
    return option ? option.label : frequency;
  };

  return (
    <div className="income-manager">
      <h2 className="mb-4">Income Manager</h2>
      
      <Card className="filter-card mb-4">
        <Card.Body>
          <Row>
            <Col md={8}>
              <Form.Group>
                <Form.Label>Filter by Person</Form.Label>
                <div className="d-flex flex-wrap">
                  <Form.Check
                    type="checkbox"
                    id="income-user-all"
                    label="All Users"
                    className="me-3 mb-2"
                    checked={selectedUsers.includes('all')}
                    onChange={(e) => handleSelectAllUsers(e.target.checked)}
                  />
                  {availableUsers.map(user => (
                    <Form.Check
                      key={user}
                      type="checkbox"
                      id={`income-user-${user}`}
                      label={user}
                      className="me-3 mb-2"
                      checked={selectedUsers.includes(user)}
                      onChange={() => handleUserFilterChange(user)}
                    />
                  ))}
                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
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
          </Row>
        </Card.Body>
      </Card>
      
      {/* Success Alert */}
      {showSuccess && (
        <Alert variant="success" className="mb-4">
          {successMessage}
        </Alert>
      )}
      
      {personsToShow.map(person => (
        <Card key={person} className="mb-4 income-card">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">{person}'s Income</h4>
            <div className="income-header-actions">
              <Button variant="primary" size="sm" onClick={handleShowForm}>
                <i className="bi bi-plus-lg me-1"></i> Add Income
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            {incomesByPerson[person] && incomesByPerson[person].length > 0 ? (
              <Table responsive hover className="income-table mb-0">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Name</th>
                    <th>Amount</th>
                    <th>Frequency</th>
                    <th>Monthly Equiv.</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incomesByPerson[person].map(income => {
                    const monthlyAmount = calculateMonthlyAmount(income.amount, income.frequency);
                    const netMonthly = income.isGross 
                      ? calculateNetIncome(monthlyAmount, income.taxRate) 
                      : monthlyAmount;
                    
                    return (
                      <tr 
                        key={income.id} 
                        className={income.active === false ? 'table-secondary income-inactive' : ''}
                      >
                        <td>
                          <div className="income-source fw-medium">{income.source}</div>
                        </td>
                        <td>{income.name}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="fw-medium">${income.amount.toFixed(2)}</span>
                            {income.isGross && (
                              <Badge bg="info" className="ms-2 gross-badge">Gross</Badge>
                            )}
                          </div>
                        </td>
                        <td>{formatFrequency(income.frequency)}</td>
                        <td>
                          <div className="fw-medium">${netMonthly.toFixed(2)}</div>
                          {income.isGross && (
                            <small className="text-muted">
                              After {(income.taxRate * 100).toFixed(0)}% tax
                            </small>
                          )}
                        </td>
                        <td className="text-center">
                          <ActionMenu 
                            onEdit={() => handleEditIncome(income)}
                            onDelete={() => handleDeleteIncome(income.id)}
                            onToggle={() => onToggle(income.id)}
                            isActive={income.active !== false}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="table-group-divider">
                  <tr>
                    <th colSpan={4} className="text-end">Total Monthly Income:</th>
                    <th>
                      ${incomesByPerson[person]
                        .filter(income => income.active !== false)
                        .reduce((sum, income) => {
                          const monthlyAmount = calculateMonthlyAmount(income.amount, income.frequency);
                          return sum + (income.isGross 
                            ? calculateNetIncome(monthlyAmount, income.taxRate) 
                            : monthlyAmount);
                        }, 0)
                        .toFixed(2)}
                    </th>
                    <th></th>
                  </tr>
                </tfoot>
              </Table>
            ) : (
              <div className="p-4 text-center">
                <p className="mb-0">No income sources added yet.</p>
              </div>
            )}
          </Card.Body>
        </Card>
      ))}

      {personsToShow.length === 0 && (
        <Card className="mb-4">
          <Card.Body className="text-center p-4">
            <p>No persons available or selected. Please add or select persons.</p>
            <Button variant="primary" onClick={() => handleSelectAllUsers(true)}>Show All Persons</Button>
          </Card.Body>
        </Card>
      )}

      {/* Add Income Button (Fixed) */}
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

      {/* Income Form Modal */}
      <Modal show={showForm} onHide={handleCloseForm}>
        <Modal.Header closeButton>
          <Modal.Title>{incomeToEdit ? 'Edit Income Source' : 'Add Income Source'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Person</Form.Label>
              <Form.Select
                name="person"
                value={formData.person}
                onChange={handleChange}
                required
              >
                <option value="">Select Person</option>
                {existingPersons.map(person => (
                  <option key={person} value={person}>{person}</option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Source</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Employer, Freelance, Rental"
                name="source"
                value={formData.source}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Salary, Side Job, Property Income"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Amount</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>$</InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Frequency</Form.Label>
                  <Form.Select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                  >
                    {FREQUENCY_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="This is gross income (before taxes)"
                name="isGross"
                checked={formData.isGross}
                onChange={handleChange}
              />
            </Form.Group>
            
            {formData.isGross && (
              <Form.Group className="mb-3">
                <Form.Label>Tax Rate ({(formData.taxRate * 100).toFixed(0)}%)</Form.Label>
                <Form.Range
                  name="taxRate"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={formData.taxRate}
                  onChange={handleChange}
                />
                <div className="d-flex justify-content-between">
                  <small>0%</small>
                  <small>50%</small>
                </div>
              </Form.Group>
            )}
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {incomeToEdit ? 'Update' : 'Add'} Income
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default IncomeManager; 