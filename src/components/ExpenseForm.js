import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { FREQUENCY_OPTIONS, EXPENSE_CATEGORIES } from '../data/expenseData';
import './ExpenseForm.css';

const ExpenseForm = ({ addExpense, editExpense, expenseToEdit, setExpenseToEdit }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    active: true,
    frequency: 'monthly', // Default frequency
    person: '' // Added person field
  });

  // If expenseToEdit is provided, populate the form with its data
  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        title: expenseToEdit.title || expenseToEdit.name || '',
        amount: expenseToEdit.amount.toString(),
        category: expenseToEdit.category,
        date: new Date(expenseToEdit.date).toISOString().split('T')[0],
        active: expenseToEdit.active,
        frequency: expenseToEdit.frequency || 'monthly',
        person: expenseToEdit.person || ''
      });
    }
  }, [expenseToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.amount || !formData.category) {
      alert('Please fill in all required fields.');
      return;
    }

    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString()
    };

    if (expenseToEdit) {
      // Preserve the name property if it exists
      console.log('Submitting edit for expense:', expenseToEdit.id);
      console.log('editExpense function:', typeof editExpense);
      
      if (typeof editExpense === 'function') {
        editExpense({ 
          ...expenseData, 
          id: expenseToEdit.id,
          name: expenseToEdit.name || expenseData.title // Keep the name property
        });
      } else {
        console.error('editExpense is not a function:', editExpense);
        alert('There was an error updating the expense. Please try again later.');
      }
    } else {
      console.log('Submitting new expense');
      console.log('addExpense function:', typeof addExpense);
      
      if (typeof addExpense === 'function') {
        addExpense({
          ...expenseData,
          name: expenseData.title // Add the name property for consistency
        });
      } else {
        console.error('addExpense is not a function:', addExpense);
        alert('There was an error adding the expense. Please try again later.');
      }
    }

    // Reset form
    setFormData({
      title: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      active: true,
      frequency: 'monthly',
      person: ''
    });
  };

  const handleCancel = () => {
    setExpenseToEdit(null);
    setFormData({
      title: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      active: true,
      frequency: 'monthly',
      person: ''
    });
  };

  // Using categories from our data file
  const categories = Object.values(EXPENSE_CATEGORIES);

  return (
    <Form onSubmit={handleSubmit} className="expense-form">
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              placeholder="e.g., Grocery Shopping"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Amount ($)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              name="amount"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Frequency</Form.Label>
            <Form.Select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              required
            >
              {FREQUENCY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Person</Form.Label>
            <Form.Control
              type="text"
              name="person"
              placeholder="e.g., K, T, M"
              value={formData.person}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3 mt-4">
            <Form.Check
              type="checkbox"
              label="Active"
              name="active"
              checked={formData.active}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex justify-content-end mt-3">
        <Button variant="primary" type="submit">
          {expenseToEdit ? 'Update' : 'Add'} Expense
        </Button>
      </div>
    </Form>
  );
};

export default ExpenseForm; 