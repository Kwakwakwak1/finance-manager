/**
 * API service for making requests to the backend
 */

// Set the API URL but add a fallback flag if the API is not available
// In development, use relative URLs for proxy support
const API_URL = process.env.NODE_ENV === 'development' 
  ? '/api' 
  : (process.env.REACT_APP_API_URL || 'http://localhost:5000/api');
let API_AVAILABLE = true; // This flag indicates if the API is available

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'An error occurred');
  }
  return response.json();
};

// Helper function to log API errors without cluttering console
const logApiError = (message, error) => {
  // Don't log common CORS-related errors that clutter the console
  if (error.message && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('NetworkError') ||
      error.message.includes('Network request failed')
    )) {
    // Suppress common CORS errors
    return;
  }
  console.error(message, error);
};

// Function to check if API is available
export const checkApiAvailability = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // Reduced timeout
    
    // Use an existing endpoint instead of /health which may not exist
    const response = await fetch(`${API_URL}/expenses`, {
      signal: controller.signal,
      method: 'HEAD', // Only get headers, not the full response
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    API_AVAILABLE = response.ok;
    return API_AVAILABLE;
  } catch (error) {
    // Don't log every CORS error as it clutters the console
    if (!error.message.includes('Failed to fetch')) {
      console.warn('API server not available:', error);
    }
    API_AVAILABLE = false;
    return false;
  }
};

// The common fetch options for all requests
const getFetchOptions = (options = {}) => ({
  mode: 'cors',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {})
  },
  ...options
});

// Expense API endpoints
export const expenseApi = {
  getAll: async () => {
    // If API is not available, throw error immediately
    if (!API_AVAILABLE) {
      throw new Error('API not available');
    }
    
    try {
      const response = await fetch(`${API_URL}/expenses`, getFetchOptions());
      return handleResponse(response);
    } catch (error) {
      logApiError('Error fetching expenses:', error);
      API_AVAILABLE = false; // Mark API as unavailable
      throw error;
    }
  },
  
  getById: async (id) => {
    if (!API_AVAILABLE) {
      throw new Error('API not available');
    }
    
    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, getFetchOptions());
      return handleResponse(response);
    } catch (error) {
      logApiError(`Error fetching expense ${id}:`, error);
      API_AVAILABLE = false;
      throw error;
    }
  },
  
  create: async (expense) => {
    if (!API_AVAILABLE) {
      throw new Error('API not available');
    }
    
    try {
      const response = await fetch(`${API_URL}/expenses`, getFetchOptions({
        method: 'POST',
        body: JSON.stringify(expense),
      }));
      return handleResponse(response);
    } catch (error) {
      logApiError('Error creating expense:', error);
      API_AVAILABLE = false;
      throw error;
    }
  },
  
  update: async (id, expense) => {
    if (!API_AVAILABLE) {
      throw new Error('API not available');
    }
    
    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, getFetchOptions({
        method: 'PUT',
        body: JSON.stringify(expense),
      }));
      return handleResponse(response);
    } catch (error) {
      logApiError(`Error updating expense ${id}:`, error);
      API_AVAILABLE = false;
      throw error;
    }
  },
  
  toggle: async (id) => {
    if (!API_AVAILABLE) {
      throw new Error('API not available');
    }
    
    try {
      const response = await fetch(`${API_URL}/expenses/${id}/toggle`, getFetchOptions({
        method: 'PATCH',
      }));
      return handleResponse(response);
    } catch (error) {
      logApiError(`Error toggling expense ${id}:`, error);
      API_AVAILABLE = false;
      throw error;
    }
  },
  
  delete: async (id) => {
    if (!API_AVAILABLE) {
      throw new Error('API not available');
    }
    
    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, getFetchOptions({
        method: 'DELETE',
      }));
      return handleResponse(response);
    } catch (error) {
      logApiError(`Error deleting expense ${id}:`, error);
      API_AVAILABLE = false;
      throw error;
    }
  },
};

// Income API endpoints
export const incomeApi = {
  getAll: async () => {
    if (!API_AVAILABLE) {
      throw new Error('API not available');
    }
    
    try {
      const response = await fetch(`${API_URL}/incomes`, getFetchOptions());
      return handleResponse(response);
    } catch (error) {
      logApiError('Error fetching incomes:', error);
      API_AVAILABLE = false;
      throw error;
    }
  },
  
  getById: async (id) => {
    if (!API_AVAILABLE) {
      throw new Error('API not available');
    }
    
    try {
      const response = await fetch(`${API_URL}/incomes/${id}`, getFetchOptions());
      return handleResponse(response);
    } catch (error) {
      logApiError(`Error fetching income ${id}:`, error);
      API_AVAILABLE = false;
      throw error;
    }
  },
  
  create: async (income) => {
    if (!API_AVAILABLE) {
      throw new Error('API not available');
    }
    
    try {
      const response = await fetch(`${API_URL}/incomes`, getFetchOptions({
        method: 'POST',
        body: JSON.stringify(income),
      }));
      return handleResponse(response);
    } catch (error) {
      logApiError('Error creating income:', error);
      API_AVAILABLE = false;
      throw error;
    }
  },
  
  update: async (id, income) => {
    if (!API_AVAILABLE) {
      throw new Error('API not available');
    }
    
    try {
      const response = await fetch(`${API_URL}/incomes/${id}`, getFetchOptions({
        method: 'PUT',
        body: JSON.stringify(income),
      }));
      return handleResponse(response);
    } catch (error) {
      logApiError(`Error updating income ${id}:`, error);
      API_AVAILABLE = false;
      throw error;
    }
  },
  
  delete: async (id) => {
    if (!API_AVAILABLE) {
      throw new Error('API not available');
    }
    
    try {
      const response = await fetch(`${API_URL}/incomes/${id}`, getFetchOptions({
        method: 'DELETE',
      }));
      return handleResponse(response);
    } catch (error) {
      logApiError(`Error deleting income ${id}:`, error);
      API_AVAILABLE = false;
      throw error;
    }
  },
};

// Goal API endpoints
export const goalApi = {
  getAll: async () => {
    if (!API_AVAILABLE) {
      throw new Error('API not available');
    }
    
    try {
      const response = await fetch(`${API_URL}/goals`, getFetchOptions());
      return handleResponse(response);
    } catch (error) {
      logApiError('Error fetching goals:', error);
      API_AVAILABLE = false;
      throw error;
    }
  },
  
  getById: async (id) => {
    if (!API_AVAILABLE) {
      throw new Error('API not available');
    }
    
    try {
      const response = await fetch(`${API_URL}/goals/${id}`, getFetchOptions());
      return handleResponse(response);
    } catch (error) {
      logApiError(`Error fetching goal ${id}:`, error);
      API_AVAILABLE = false;
      throw error;
    }
  },
  
  create: async (goal) => {
    if (!API_AVAILABLE) {
      throw new Error('API not available');
    }
    
    try {
      const response = await fetch(`${API_URL}/goals`, getFetchOptions({
        method: 'POST',
        body: JSON.stringify(goal),
      }));
      return handleResponse(response);
    } catch (error) {
      logApiError('Error creating goal:', error);
      API_AVAILABLE = false;
      throw error;
    }
  },
  
  update: async (id, goal) => {
    if (!API_AVAILABLE) {
      throw new Error('API not available');
    }
    
    try {
      const response = await fetch(`${API_URL}/goals/${id}`, getFetchOptions({
        method: 'PUT',
        body: JSON.stringify(goal),
      }));
      return handleResponse(response);
    } catch (error) {
      logApiError(`Error updating goal ${id}:`, error);
      API_AVAILABLE = false;
      throw error;
    }
  },
  
  delete: async (id) => {
    if (!API_AVAILABLE) {
      throw new Error('API not available');
    }
    
    try {
      const response = await fetch(`${API_URL}/goals/${id}`, getFetchOptions({
        method: 'DELETE',
      }));
      return handleResponse(response);
    } catch (error) {
      logApiError(`Error deleting goal ${id}:`, error);
      API_AVAILABLE = false;
      throw error;
    }
  },
};