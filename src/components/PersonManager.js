import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, ListGroup, Alert, Table, Modal, Badge } from 'react-bootstrap';
import ActionMenu from './ActionMenu';
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
    if (window.confirm('Are you sure you want to delete this person? This will not delete their expenses or incomes.')) {
      onDelete(id);
      setSuccessMessage('Person deleted successfully');
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
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
    <div className="person-manager">
      <h2 className="mb-4">Manage Persons</h2>
      
      {showSuccess && (
        <Alert variant="success" className="mb-4">
          {successMessage}
        </Alert>
      )}
      
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Person List</h4>
          <Button 
            variant="primary" 
            size="sm"
            onClick={handleShowAddForm}
          >
            <i className="bi bi-plus-lg me-1"></i> Add New Person
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="person-table mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Data</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {persons.map(person => (
                <tr key={person.id} className={!person.isActive ? 'table-secondary' : ''}>
                  <td className="fw-medium">{person.name}</td>
                  <td>{person.description}</td>
                  <td>
                    <Badge bg={person.isActive ? "success" : "secondary"} className="status-badge">
                      {person.isActive ? 'Active' : 'Hidden'}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg="primary" className="data-badge me-2">
                      {expenseCounts[person.name] || 0} expenses
                    </Badge>
                    <Badge bg="info" className="data-badge">
                      {incomeCounts[person.name] || 0} incomes
                    </Badge>
                  </td>
                  <td className="text-center">
                    <ActionMenu 
                      onEdit={() => handleShowEditForm(person)}
                      onDelete={() => handleDelete(person.id)}
                      onToggle={() => handleToggleActive(person.id)}
                      isActive={person.isActive}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <h4 className="mb-0">Legacy Name Update</h4>
        </Card.Header>
        <Card.Body>
          <p className="text-muted mb-3">
            Update a person's name across all expenses and incomes. This is for backward compatibility only.
          </p>
          <Form onSubmit={handleNameUpdate}>
            <Row className="align-items-end">
              <Col md={4} className="mb-3 mb-md-0">
                <Form.Group>
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
                    {uniquePersonNames.map(name => (
                      <option key={name} value={name}>{name} (not in person list)</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3 mb-md-0">
                <Form.Group>
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
              <Col md={4}>
                <Button type="submit" variant="primary" className="w-100">
                  Update Person Name
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
      
      <div className="d-grid">
        <Button 
          variant="success" 
          size="lg" 
          onClick={handleSaveAsDefault}
          className="save-default-btn"
        >
          <i className="bi bi-download me-2"></i>
          Save Current Data as Default
        </Button>
      </div>

      {/* Person Form Modal */}
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
                placeholder="Enter name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="E.g. Father, Mother, Son, etc."
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active (visible in filters and dropdowns)"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={handleCloseForm}>
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