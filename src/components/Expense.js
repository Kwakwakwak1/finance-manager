import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import ActionMenu from './ActionMenu';
import { calculateMonthlyAmount } from '../data/expenseData';
import './Expense.css';

const Expense = ({ expense, onDelete, onToggle, onEdit, showMonthlyEquivalent }) => {
  // Helper function to format frequency for display
  const formatFrequency = (frequency) => {
    if (!frequency) return '';
    
    // Capitalize first letter
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };

  // Calculate monthly equivalent if needed
  const monthlyEquivalent = showMonthlyEquivalent && expense.frequency 
    ? calculateMonthlyAmount(expense.amount, expense.frequency)
    : null;

  return (
    <Card 
      className={`expense-card mb-3 ${expense.active ? '' : 'inactive'}`}
    >
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <div className="expense-info">
            <div className="expense-title">
              {expense.title || expense.name}
              {expense.person && (
                <Badge bg="secondary" className="ms-2 person-badge">{expense.person}</Badge>
              )}
              {!expense.active && (
                <Badge bg="warning" text="dark" className="ms-2 inactive-badge">Inactive</Badge>
              )}
            </div>
            <div className="expense-amount">
              <span className="amount-value">${expense.amount.toFixed(2)}</span>
              {expense.frequency && (
                <span className="frequency-badge">({formatFrequency(expense.frequency)})</span>
              )}
              {monthlyEquivalent && (
                <span className="monthly-equivalent">
                  = ${monthlyEquivalent.toFixed(2)}/mo
                </span>
              )}
            </div>
            <div className="expense-details">
              <span className="detail-item category-item">
                <i className="bi bi-tag me-1"></i> {expense.category}
              </span>
              <span className="detail-item date-item">
                <i className="bi bi-calendar-date me-1"></i> {new Date(expense.date).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="expense-actions">
            <Button
              variant="outline-primary"
              size="sm"
              className="me-2 edit-button"
              onClick={() => onEdit(expense)}
            >
              <i className="bi bi-pencil"></i> Edit
            </Button>
            <ActionMenu 
              onEdit={() => onEdit(expense)}
              onDelete={() => onDelete(expense.id)}
              onToggle={() => onToggle(expense.id)}
              isActive={expense.active}
            />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Expense; 