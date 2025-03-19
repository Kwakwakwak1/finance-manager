import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, ListGroup, Alert, Modal, Table } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { FREQUENCY_OPTIONS, calculateMonthlyAmount } from '../data/expenseData';
import './IncomeManager.css';

const IncomeManager = ({ expenses, incomes, addIncome, updateIncome, deleteIncome, persons }) => {
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [incomeToEdit, setIncomeToEdit] = useState(null);
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

  // Reset form when closing
  const resetForm = () => {
    setFormData({
      id: '',
      person: persons.length > 0 ? persons[0] : '',
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
      updateIncome(incomeData);
      setSuccessMessage(`Updated income "${incomeData.name}" for ${incomeData.person}`);
    } else {
      // Add new income with a unique ID
      addIncome({
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
      deleteIncome(id);
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

  // Group incomes by person
  const incomesByPerson = {};
  persons.forEach(person => {
    incomesByPerson[person] = incomes.filter(income => income.person === person);
  });

  return (
    <Card className="income-manager-card mb-4">
      <Card.Body>
        <Card.Title>Manage Income Sources</Card.Title>
        
        {showSuccess && (
          <Alert variant="success" className="mt-3">
            {successMessage}
          </Alert>
        )}
        
        <Button 
          variant="primary" 
          onClick={handleShowForm}
          className="mb-4"
        >
          Add New Income Source
        </Button>
        
        {persons.length > 0 ? (
          <Row>
            {persons.map(person => (
              <Col md={6} key={person} className="mb-4">
                <Card>
                  <Card.Header>
                    <h5>{person}'s Income Sources</h5>
                  </Card.Header>
                  <Card.Body>
                    {incomesByPerson[person].length > 0 ? (
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>Source</th>
                            <th>Name</th>
                            <th>Amount</th>
                            <th>Frequency</th>
                            <th>Monthly Equiv.</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {incomesByPerson[person].map(income => {
                            const monthlyAmount = calculateMonthlyAmount(income.amount, income.frequency);
                            const netMonthly = income.isGross 
                              ? calculateNetIncome(monthlyAmount, income.taxRate) 
                              : monthlyAmount;
                            
                            return (
                              <tr key={income.id}>
                                <td>{income.source}</td>
                                <td>{income.name}</td>
                                <td>
                                  ${income.amount.toFixed(2)}
                                  {income.isGross && <span className="badge bg-info ms-1">Gross</span>}
                                </td>
                                <td>{FREQUENCY_OPTIONS.find(f => f.value === income.frequency)?.label || income.frequency}</td>
                                <td>
                                  ${netMonthly.toFixed(2)}
                                  <small className="d-block text-muted">
                                    {income.isGross && `After ${(income.taxRate * 100).toFixed(0)}% tax`}
                                  </small>
                                </td>
                                <td>
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    className="me-2"
                                    onClick={() => handleEditIncome(income)}
                                  >
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => handleDeleteIncome(income.id)}
                                  >
                                    Delete
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <th colSpan={4} className="text-end">Total Monthly Income:</th>
                            <th>
                              ${incomesByPerson[person]
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
                      <p className="text-center">No income sources added yet.</p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <p>No persons available. Please add persons in the Person Manager.</p>
        )}
        
        {/* Income Form Modal */}
        <Modal show={showForm} onHide={handleCloseForm} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{incomeToEdit ? 'Edit Income Source' : 'Add New Income Source'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Person</Form.Label>
                    <Form.Select
                      name="person"
                      value={formData.person}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a person</option>
                      {persons.map(person => (
                        <option key={person} value={person}>{person}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Source</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. Company Name, Investment"
                      name="source"
                      value={formData.source}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Income Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. Salary, Dividends, Freelance Work"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Amount</Form.Label>
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
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
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
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="This is gross income (before taxes)"
                      name="isGross"
                      checked={formData.isGross}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tax Rate ({(formData.taxRate * 100).toFixed(0)}%)</Form.Label>
                    <Form.Range
                      name="taxRate"
                      value={formData.taxRate}
                      onChange={handleChange}
                      min="0"
                      max="0.5"
                      step="0.01"
                      disabled={!formData.isGross}
                    />
                    <small className="text-muted">
                      Only applies if income is gross
                    </small>
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={handleCloseForm} className="me-2">
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {incomeToEdit ? 'Update Income' : 'Add Income'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Card.Body>
    </Card>
  );
};

export default IncomeManager; 