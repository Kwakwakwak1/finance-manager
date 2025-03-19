import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, ListGroup, Alert } from 'react-bootstrap';
import './PersonManager.css';

const PersonManager = ({ expenses, incomes = [], updatePersonName, saveAsDefault }) => {
  const [persons, setPersons] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState('');
  const [newName, setNewName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Extract unique persons from expenses and incomes
  useEffect(() => {
    // Get unique persons from expenses
    const expensePersons = expenses.length > 0 
      ? [...new Set(expenses.filter(expense => expense.person).map(expense => expense.person))]
      : [];
    
    // Get unique persons from incomes
    const incomePersons = incomes.length > 0
      ? [...new Set(incomes.filter(income => income.person).map(income => income.person))]
      : [];
    
    // Combine and remove duplicates
    const uniquePersons = [...new Set([...expensePersons, ...incomePersons])];
    
    setPersons(uniquePersons);
    
    if (uniquePersons.length > 0 && !selectedPerson) {
      setSelectedPerson(uniquePersons[0]);
    }
  }, [expenses, incomes, selectedPerson]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedPerson || !newName) {
      return;
    }
    
    // Call the parent function to update all expenses for this person
    const count = updatePersonName(selectedPerson, newName);
    
    // Show success message
    setSuccessMessage(`Updated ${count} expenses for "${selectedPerson}" to "${newName}"`);
    setShowSuccess(true);
    
    // Reset form
    setNewName('');
    setSelectedPerson(newName); // Select the new name
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleSaveAsDefault = () => {
    saveAsDefault();
    setSuccessMessage('Current expenses and incomes saved as default data!');
    setShowSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  // Count expenses and incomes per person
  const expenseCounts = {};
  const incomeCounts = {};
  
  persons.forEach(person => {
    expenseCounts[person] = expenses.filter(expense => expense.person === person).length;
    incomeCounts[person] = incomes.filter(income => income.person === person).length;
  });

  return (
    <Card className="person-manager-card mb-4">
      <Card.Body>
        <Card.Title>Manage Persons</Card.Title>
        
        {showSuccess && (
          <Alert variant="success" className="mt-3">
            {successMessage}
          </Alert>
        )}
        
        <Row>
          <Col md={6}>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Select Person</Form.Label>
                <Form.Select
                  value={selectedPerson}
                  onChange={(e) => setSelectedPerson(e.target.value)}
                  required
                >
                  <option value="">Select a person</option>
                  {persons.map(person => (
                    <option key={person} value={person}>{person}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>New Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter new name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </Form.Group>
              
              <Button 
                variant="primary" 
                type="submit"
                disabled={!selectedPerson || !newName}
              >
                Update Person Name
              </Button>
            </Form>
            
            <div className="mt-4">
              <Button 
                variant="success" 
                onClick={handleSaveAsDefault}
              >
                Save Current Data as Default
              </Button>
            </div>
          </Col>
          
          <Col md={6}>
            <h5>Persons and Data Counts</h5>
            <ListGroup>
              {persons.map(person => (
                <ListGroup.Item key={person} className="d-flex justify-content-between align-items-center">
                  {person}
                  <div>
                    <span className="badge bg-primary rounded-pill me-2">{expenseCounts[person]} expenses</span>
                    <span className="badge bg-success rounded-pill">{incomeCounts[person]} incomes</span>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default PersonManager; 