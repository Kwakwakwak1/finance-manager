/**
 * Service for handling file operations
 * In a real application, this would make API calls to a backend server
 */

import { validateData } from '../utils/dataUtils';

/**
 * Updates the expenseData.js file with the provided content
 * @param {string} content - The new content for the file
 * @returns {Promise<boolean>} - Whether the update was successful
 */
export const updateExpenseDataFile = async (content) => {
  try {
    // In a real application, this would make an API call to update the file
    // For this example, we'll just log the content
    console.log('File content to be saved:');
    console.log(content);
    
    // Simulate a successful API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  } catch (error) {
    console.error('Error updating file:', error);
    return false;
  }
};

/**
 * Exports all data to a JSON file for backup
 * @param {Object} data - The data to export
 * @returns {Promise<void>} - Promise that resolves when file is downloaded
 */
export const exportData = async (data) => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `finance-manager-export-${currentDate}.json`;
    
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error exporting data:', error);
    return Promise.reject(error);
  }
};

/**
 * Imports data from a JSON file
 * @param {File} file - The file to import
 * @returns {Promise<Object>} - The imported data
 */
export const importData = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        resolve(data);
      } catch (error) {
        console.error('Error parsing import file:', error);
        reject(new Error('Invalid file format. Please upload a valid JSON file.'));
      }
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      reject(new Error('Failed to read the file. Please try again.'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Validates imported data against the expected schema
 * @param {Object} data - The data to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateImportedData = (data) => {
  return validateData(data);
};

/**
 * Create a data backup
 * @param {Object} data - The data to backup
 * @returns {Promise<boolean>} - Whether the backup was successful
 */
export const createBackup = async (data) => {
  try {
    const backupData = JSON.stringify(data);
    localStorage.setItem('financeManagerBackup', backupData);
    localStorage.setItem('backupTimestamp', new Date().toISOString());
    return true;
  } catch (error) {
    console.error('Error creating backup:', error);
    return false;
  }
};

/**
 * Restore data from backup
 * @returns {Promise<Object|null>} - The restored data or null if no backup
 */
export const restoreFromBackup = async () => {
  try {
    const backupData = localStorage.getItem('financeManagerBackup');
    if (!backupData) return null;
    
    return JSON.parse(backupData);
  } catch (error) {
    console.error('Error restoring from backup:', error);
    return null;
  }
}; 