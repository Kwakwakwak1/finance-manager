import React from 'react';
import { Button, Card, Badge } from 'react-bootstrap';
import './Expense.css';

const Expense = ({ expense, onDelete, onToggle, onEdit }) => {
  console.log('Expense component, onEdit type:', typeof onEdit);
  
  // Helper function to format frequency for display
  const formatFrequency = (frequency) => {
    if (!frequency) return '';
    
    // Capitalize first letter
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };

  // Safe edit handler
  const handleEdit = () => {
    if (typeof onEdit === 'function') {
      onEdit(expense);
    } else {
      console.error('onEdit is not a function in Expense component');
      alert('There was an error editing this expense. Please try again later.');
    }
  };

  return (
    <Card 
      className={`expense-card mb-3 ${expense.active ? '' : 'inactive'}`}
    >
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <Card.Title className="d-flex align-items-center">
              {expense.title || expense.name}
              {expense.person && (
                <Badge bg="secondary" className="ms-2">{expense.person}</Badge>
              )}
            </Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              ${expense.amount.toFixed(2)} 
              {expense.frequency && (
                <span className="frequency-badge"> ({formatFrequency(expense.frequency)})</span>
              )}
            </Card.Subtitle>
            <Card.Text>
              <small>Category: {expense.category}</small>
              <br />
              <small>Date: {new Date(expense.date).toLocaleDateString()}</small>
            </Card.Text>
          </div>
          <div className="expense-actions">
            <Button 
              variant="outline-primary" 
              size="sm" 
              className="me-2"
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button 
              variant="outline-danger" 
              size="sm" 
              className="me-2"
              onClick={() => onDelete(expense.id)}
            >
              Delete
            </Button>
            <Button 
              variant={expense.active ? "outline-warning" : "outline-success"} 
              size="sm"
              onClick={() => onToggle(expense.id)}
            >
              {expense.active ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Expense; 