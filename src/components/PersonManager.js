import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, ListGroup, Alert, Table, Modal, Badge } from 'react-bootstrap';
import './PersonManager.css';

const PersonManager = ({ 
  expenses, 
  incomes, 
  persons, 
  updatePersonName, 
  saveAsDefault, 
  onAdd, 
  onUpdate, 
  onDelete, 
  onToggleActive 
}) => {
  const [selectedPerson, setSelectedPerson] = useState('');
  const [newName, setNewName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // For person form modal
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });
  const [editMode, setEditMode] = useState(false);
  const [personToEdit, setPersonToEdit] = useState(null);
  
  // Reset form when modal closes
  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({
      name: '',
      description: '',
      isActive: true,
    });
    setEditMode(false);
    setPersonToEdit(null);
  };
  
  // Show form for adding a new person
  const handleShowAddForm = () => {
    setEditMode(false);
    setPersonToEdit(null);
    setFormData({
      name: '',
      description: '',
      isActive: true,
    });
    setShowForm(true);
  };
  
  // Show form for editing an existing person
  const handleShowEditForm = (person) => {
    setEditMode(true);
    setPersonToEdit(person);
    setFormData({
      id: person.id,
      name: person.name,
      description: person.description || '',
      isActive: person.isActive,
    });
    setShowForm(true);
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  // Handle person form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editMode && personToEdit) {
      onUpdate(formData);
    } else {
      onAdd(formData);
    }
    
    // Show success message
    setSuccessMessage(`Person ${editMode ? 'updated' : 'added'} successfully!`);
    setShowSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
    
    // Close the form
    handleCloseForm();
  };
  
  // Handle person name update (legacy functionality)
  const handleNameUpdate = (e) => {
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

  // Handle toggling person active status
  const handleToggleActive = (id) => {
    onToggleActive(id);
    
    const person = persons.find(p => p.id === id);
    setSuccessMessage(`${person?.name} is now ${person?.isActive ? 'inactive' : 'active'}`);
    setShowSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };
  
  // Handle delete person
  const handleDelete = (id) => {
    onDelete(id);
  };
  
  // Handle save as default
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
    expenseCounts[person.name] = expenses.filter(expense => expense.person === person.name).length;
    incomeCounts[person.name] = incomes.filter(income => income.person === person.name).length;
  });

  // List of unique person names from expenses/incomes that might not be in the persons table yet
  const uniquePersonNames = [...new Set([
    ...expenses.map(e => e.person),
    ...incomes.map(i => i.person)
  ])].filter(name => name && !persons.some(p => p.name === name));

  return (
    <div>
      <Card className="person-manager-card mb-4">
        <Card.Body>
          <Card.Title className="d-flex justify-content-between align-items-center">
            <span>Manage Persons</span>
            <Button 
              variant="primary" 
              onClick={handleShowAddForm}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Add New Person
            </Button>
          </Card.Title>
          
          {showSuccess && (
            <Alert variant="success" className="mt-3">
              {successMessage}
            </Alert>
          )}
          
          <Table striped bordered hover responsive className="mt-4">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Data</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {persons.map(person => (
                <tr key={person.id} className={!person.isActive ? 'table-secondary' : ''}>
                  <td>{person.name}</td>
                  <td>{person.description}</td>
                  <td>
                    {person.isActive ? (
                      <Badge bg="success">Active</Badge>
                    ) : (
                      <Badge bg="secondary">Hidden</Badge>
                    )}
                  </td>
                  <td>
                    <Badge bg="primary" className="me-2">
                      {expenseCounts[person.name] || 0} expenses
                    </Badge>
                    <Badge bg="info">
                      {incomeCounts[person.name] || 0} incomes
                    </Badge>
                  </td>
                  <td>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleShowEditForm(person)}
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button 
                      variant={person.isActive ? "outline-secondary" : "outline-success"} 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleToggleActive(person.id)}
                      title={person.isActive ? "Hide person" : "Show person"}
                    >
                      <i className={`bi ${person.isActive ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(person.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          {uniquePersonNames.length > 0 && (
            <div className="mt-4">
              <h5>Persons found in expenses/incomes but not registered:</h5>
              <ul className="list-group">
                {uniquePersonNames.map(name => (
                  <li key={name} className="list-group-item d-flex justify-content-between align-items-center">
                    {name}
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => {
                        setFormData({
                          name,
                          description: '',
                          isActive: true,
                        });
                        setShowForm(true);
                      }}
                    >
                      Register
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-4">
            <h5>Legacy Name Update</h5>
            <p className="text-muted">Update a person's name across all expenses and incomes. This is for backward compatibility only.</p>
            <Form onSubmit={handleNameUpdate} className="row">
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Person</Form.Label>
                  <Form.Select
                    value={selectedPerson}
                    onChange={(e) => setSelectedPerson(e.target.value)}
                    required
                  >
                    <option value="">Select a person</option>
                    {persons.map(person => (
                      <option key={person.id} value={person.name}>{person.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={4}>
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
              </Col>
              
              <Col md={4} className="d-flex align-items-end">
                <Button 
                  variant="primary" 
                  type="submit"
                  className="mb-3"
                  disabled={!selectedPerson || !newName}
                >
                  Update Person Name
                </Button>
              </Col>
            </Form>
          </div>
          
          <div className="mt-4">
            <Button 
              variant="success" 
              onClick={handleSaveAsDefault}
            >
              <i className="bi bi-save me-2"></i>
              Save Current Data as Default
            </Button>
          </div>
        </Card.Body>
      </Card>
      
      {/* Person Add/Edit Form Modal */}
      <Modal show={showForm} onHide={handleCloseForm}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit Person' : 'Add New Person'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter person name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter person description (optional)"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Person is active"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <Form.Text className="text-muted">
                Inactive persons will not be displayed in expense and income lists, but their data will be preserved.
              </Form.Text>
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={handleCloseForm} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editMode ? 'Update' : 'Add'} Person
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PersonManager; 