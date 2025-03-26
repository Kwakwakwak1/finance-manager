import React, { useState } from 'react';
import { Card, Button, Form, Alert, ProgressBar, Modal } from 'react-bootstrap';
import { exportData, importData, validateImportedData, createBackup } from '../../services/fileService';
import './DataManagement.css';

const DataManagement = ({ 
  expenses, 
  incomes, 
  persons, 
  goals,
  plans,
  setExpenses,
  setIncomes, 
  setPersons,
  setGoals,
  setPlans
}) => {
  const [importFile, setImportFile] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Modal state
  const [showClearModal, setShowClearModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedData, setImportedData] = useState(null);
  const [importValidation, setImportValidation] = useState({ isValid: true, errors: [] });

  // Handle export of all data
  const handleExport = async () => {
    try {
      setError(null);
      setSuccess(null);
      setIsExporting(true);
      setProgress(10);
      
      // Create data backup before export
      await createBackup({ expenses, incomes, persons, goals, plans });
      setProgress(30);
      
      // Prepare data for export
      const exportPayload = {
        expenses,
        incomes,
        persons,
        goals,
        plans,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      setProgress(60);
      
      // Export the data
      await exportData(exportPayload);
      
      setProgress(100);
      setSuccess('Data exported successfully!');
      
      // Reset progress after a delay
      setTimeout(() => {
        setProgress(0);
        setIsExporting(false);
      }, 1000);
    } catch (err) {
      setError(`Export failed: ${err.message}`);
      setIsExporting(false);
      setProgress(0);
    }
  };

  // Handle file selection for import
  const handleFileChange = (e) => {
    setImportFile(e.target.files[0]);
    setError(null);
    setSuccess(null);
  };

  // Prepare for import by reading and validating the file
  const prepareImport = async () => {
    if (!importFile) {
      setError('Please select a file to import');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setIsImporting(true);
      setProgress(20);
      
      // Create data backup before import
      await createBackup({ expenses, incomes, persons, goals, plans });
      setProgress(40);
      
      // Read the import file
      const data = await importData(importFile);
      setProgress(70);
      
      // Validate the imported data
      const validation = validateImportedData(data);
      setImportValidation(validation);
      
      if (validation.isValid) {
        setImportedData(data);
        setShowImportModal(true);
      } else {
        setError(`Import validation failed: ${validation.errors.join(', ')}`);
      }
      
      setProgress(100);
      
      // Reset progress after a delay
      setTimeout(() => {
        setProgress(0);
        setIsImporting(false);
      }, 1000);
    } catch (err) {
      setError(`Import failed: ${err.message}`);
      setIsImporting(false);
      setProgress(0);
    }
  };

  // Complete the import after confirmation
  const completeImport = () => {
    if (!importedData) return;
    
    try {
      // Update the application state with imported data
      if (importedData.expenses) setExpenses(importedData.expenses);
      if (importedData.incomes) setIncomes(importedData.incomes);
      if (importedData.persons) setPersons(importedData.persons);
      if (importedData.goals) setGoals(importedData.goals);
      if (importedData.plans) setPlans(importedData.plans);
      
      setSuccess('Data imported successfully!');
      setShowImportModal(false);
      setImportFile(null);
      setImportedData(null);
    } catch (err) {
      setError(`Failed to apply imported data: ${err.message}`);
    }
  };

  // Handle clearing all data
  const handleClearAllData = () => {
    setShowClearModal(true);
  };

  // Confirm clearing all data
  const confirmClearAllData = async () => {
    try {
      // Create data backup before clearing
      await createBackup({ expenses, incomes, persons, goals, plans });
      
      // Clear all data
      setExpenses([]);
      setIncomes([]);
      setPersons([]);
      setGoals([]);
      setPlans([]);
      
      setSuccess('All data has been cleared successfully.');
      setShowClearModal(false);
    } catch (err) {
      setError(`Failed to clear data: ${err.message}`);
      setShowClearModal(false);
    }
  };

  return (
    <div className="data-management-container">
      <Card className="mb-4">
        <Card.Header as="h5">Data Management</Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          {(isExporting || isImporting) && progress > 0 && (
            <ProgressBar 
              animated 
              now={progress} 
              label={`${Math.round(progress)}%`} 
              className="mb-3" 
            />
          )}
          
          <div className="data-management-section">
            <h5>Export Data</h5>
            <p>Export all your financial data to a file that you can save as a backup.</p>
            <Button 
              variant="primary" 
              onClick={handleExport}
              disabled={isExporting || isImporting}
            >
              {isExporting ? 'Exporting...' : 'Export All Data'}
            </Button>
          </div>
          
          <div className="data-management-section">
            <h5>Import Data</h5>
            <p>Import previously exported financial data.</p>
            <Form.Group controlId="importFile" className="mb-3">
              <Form.Control 
                type="file" 
                onChange={handleFileChange}
                accept=".json"
                disabled={isExporting || isImporting}
              />
            </Form.Group>
            <Button 
              variant="outline-primary" 
              onClick={prepareImport}
              disabled={!importFile || isExporting || isImporting}
            >
              {isImporting ? 'Preparing Import...' : 'Import Data'}
            </Button>
          </div>
          
          <div className="data-management-section">
            <h5>Clear All Data</h5>
            <p className="text-danger">This will permanently delete all your financial data.</p>
            <Button 
              variant="danger" 
              onClick={handleClearAllData}
              disabled={isExporting || isImporting}
            >
              Clear All Data
            </Button>
          </div>
        </Card.Body>
      </Card>
      
      {/* Clear All Data Confirmation Modal */}
      <Modal show={showClearModal} onHide={() => setShowClearModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">⚠️ Warning: Destructive Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            You are about to delete <strong>ALL</strong> of your financial data. This includes:
          </p>
          <ul>
            <li>{expenses.length} expense records</li>
            <li>{incomes.length} income records</li>
            <li>{persons.length} persons</li>
            <li>{goals ? goals.length : 0} goals</li>
            <li>{plans ? plans.length : 0} financial plans</li>
          </ul>
          <p className="text-danger">
            <strong>This action cannot be undone!</strong> A backup will be created automatically, 
            but you will need to import it to restore your data.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmClearAllData}>
            Yes, Clear All Data
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Import Confirmation Modal */}
      <Modal show={showImportModal} onHide={() => setShowImportModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Data Import</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            You are about to import the following data:
          </p>
          <ul>
            <li>{importedData?.expenses?.length || 0} expense records</li>
            <li>{importedData?.incomes?.length || 0} income records</li>
            <li>{importedData?.persons?.length || 0} persons</li>
            <li>{importedData?.goals?.length || 0} goals</li>
            <li>{importedData?.plans?.length || 0} financial plans</li>
          </ul>
          <p>
            This will replace your current data. A backup has been created automatically.
          </p>
          {!importValidation.isValid && (
            <Alert variant="warning">
              <strong>Warning:</strong> The imported data has some issues:
              <ul>
                {importValidation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImportModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={completeImport}>
            Confirm Import
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DataManagement; 