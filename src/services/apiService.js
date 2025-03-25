/**
 * API service for making requests to the backend
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'An error occurred');
  }
  return response.json();
};

// Expense API endpoints
export const expenseApi = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/expenses`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/expenses/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching expense ${id}:`, error);
      throw error;
    }
  },
  
  create: async (expense) => {
    try {
      const response = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  },
  
  update: async (id, expense) => {
    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error updating expense ${id}:`, error);
      throw error;
    }
  },
  
  toggle: async (id) => {
    try {
      const response = await fetch(`${API_URL}/expenses/${id}/toggle`, {
        method: 'PATCH',
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error toggling expense ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'DELETE',
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error deleting expense ${id}:`, error);
      throw error;
    }
  },
};

// Income API endpoints
export const incomeApi = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/incomes`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching incomes:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/incomes/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching income ${id}:`, error);
      throw error;
    }
  },
  
  create: async (income) => {
    try {
      const response = await fetch(`${API_URL}/incomes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(income),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error creating income:', error);
      throw error;
    }
  },
  
  update: async (id, income) => {
    try {
      const response = await fetch(`${API_URL}/incomes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(income),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error updating income ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await fetch(`${API_URL}/incomes/${id}`, {
        method: 'DELETE',
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error deleting income ${id}:`, error);
      throw error;
    }
  },
};

// Goal API endpoints
export const goalApi = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/goals`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching goals:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/goals/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching goal ${id}:`, error);
      throw error;
    }
  },
  
  create: async (goal) => {
    try {
      const response = await fetch(`${API_URL}/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goal),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  },
  
  update: async (id, goal) => {
    try {
      const response = await fetch(`${API_URL}/goals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goal),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error updating goal ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await fetch(`${API_URL}/goals/${id}`, {
        method: 'DELETE',
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error deleting goal ${id}:`, error);
      throw error;
    }
  },
};