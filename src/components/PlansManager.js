import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Badge, Tab, Tabs, Modal, ListGroup, ToggleButton, ButtonGroup } from 'react-bootstrap';
import { usePlans } from '../context/PlansContext';
import { calculateMonthlyAmount } from '../data/expenseData';
import './PlansManager.css';

const PlansManager = ({ expenses, incomes }) => {
  const { 
    plans, 
    activePlanIds,
    createPlan, 
    updatePlan, 
    deletePlan, 
    togglePlanExpense, 
    togglePlanIncome,
    togglePlanVisibility,
    calculatePlanImpact
  } = usePlans();

  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses');
  const [peopleInPlan, setPeopleInPlan] = useState([]);
  const [peopleEnabledStatus, setPeopleEnabledStatus] = useState({});
  const [editedPlanName, setEditedPlanName] = useState('');
  const [editedPlanDescription, setEditedPlanDescription] = useState('');

  // Get the selected plan
  const selectedPlan = plans.find(plan => plan.id === selectedPlanId);

  // Calculate the impact of the selected plan
  const planImpact = selectedPlanId ? calculatePlanImpact(selectedPlanId) : null;

  // Update people list when a plan is selected
  useEffect(() => {
    if (selectedPlan) {
      // Extract unique people from expenses and incomes in the plan
      const peopleFromExpenses = [...new Set(selectedPlan.expenses.map(expense => expense.person))];
      const peopleFromIncomes = [...new Set(selectedPlan.incomes.map(income => income.person))];
      const uniquePeople = [...new Set([...peopleFromExpenses, ...peopleFromIncomes])].filter(Boolean);
      
      setPeopleInPlan(uniquePeople);
      
      // Initialize the enabled status for each person
      const statusMap = {};
      uniquePeople.forEach(person => {
        // Check if all expenses for this person are enabled
        const personExpenses = selectedPlan.expenses.filter(expense => expense.person === person);
        const personIncomes = selectedPlan.incomes.filter(income => income.person === person);
        
        // A person is considered enabled if all their expenses and incomes are enabled
        const allExpensesEnabled = personExpenses.length > 0 && 
          personExpenses.every(expense => expense.enabled);
        
        const allIncomesEnabled = personIncomes.length > 0 && 
          personIncomes.every(income => income.enabled);
        
        // If the person has both expenses and incomes, both must be enabled
        // If they only have one type, that type must be enabled
        if (personExpenses.length > 0 && personIncomes.length > 0) {
          statusMap[person] = allExpensesEnabled && allIncomesEnabled;
        } else if (personExpenses.length > 0) {
          statusMap[person] = allExpensesEnabled;
        } else if (personIncomes.length > 0) {
          statusMap[person] = allIncomesEnabled;
        } else {
          statusMap[person] = false;
        }
      });
      
      setPeopleEnabledStatus(statusMap);
      
      // Set edited plan name and description to current values
      setEditedPlanName(selectedPlan.name);
      setEditedPlanDescription(selectedPlan.description || '');
    }
  }, [selectedPlan]);

  // Create a new plan
  const handleCreatePlan = () => {
    if (newPlanName.trim()) {
      const planId = createPlan(newPlanName, newPlanDescription);
      setNewPlanName('');
      setNewPlanDescription('');
      setShowNewPlanModal(false);
      setSelectedPlanId(planId);
    }
  };

  // Delete the selected plan
  const handleDeletePlan = () => {
    if (selectedPlanId && window.confirm('Are you sure you want to delete this plan?')) {
      deletePlan(selectedPlanId);
      setSelectedPlanId(null);
      setEditMode(false);
    }
  };

  // Toggle edit mode and handle saving if needed
  const handleEditToggle = () => {
    if (editMode) {
      // If we're exiting edit mode, save any name/description changes
      if (selectedPlanId && editedPlanName.trim() && 
         (editedPlanName !== selectedPlan.name || editedPlanDescription !== (selectedPlan.description || ''))) {
        updatePlan(selectedPlanId, {
          ...selectedPlan,
          name: editedPlanName,
          description: editedPlanDescription
        });
      }
      
      // Reset to original values when exiting edit mode without saving
      setEditedPlanName(selectedPlan.name);
      setEditedPlanDescription(selectedPlan.description || '');
    }
    
    setEditMode(!editMode);
  };

  // Handle toggling expense enabled/disabled in a plan
  const handleToggleExpense = (expenseId, enabled) => {
    if (selectedPlanId) {
      // Get the expense being toggled
      const expense = selectedPlan.expenses.find(e => e.id === expenseId);
      if (expense) {
        // Force update the person's enabled status if needed
        if (enabled && !peopleEnabledStatus[expense.person]) {
          setPeopleEnabledStatus({
            ...peopleEnabledStatus,
            [expense.person]: true
          });
        }
      }
      
      // Toggle the expense
      togglePlanExpense(selectedPlanId, expenseId, enabled);
    }
  };

  // Handle toggling income enabled/disabled in a plan
  const handleToggleIncome = (incomeId, enabled) => {
    if (selectedPlanId) {
      // Get the income being toggled
      const income = selectedPlan.incomes.find(i => i.id === incomeId);
      if (income) {
        // Force update the person's enabled status if needed
        if (enabled && !peopleEnabledStatus[income.person]) {
          setPeopleEnabledStatus({
            ...peopleEnabledStatus,
            [income.person]: true
          });
        }
      }
      
      // Toggle the income
      togglePlanIncome(selectedPlanId, incomeId, enabled);
    }
  };

  // Toggle all expenses and incomes for a person
  const handleTogglePerson = (person, enabled) => {
    if (!selectedPlanId) return;
    
    // Update the UI state immediately
    setPeopleEnabledStatus({
      ...peopleEnabledStatus,
      [person]: enabled
    });
    
    // Create a new expenses array with updated enabled values
    const updatedExpenses = selectedPlan.expenses.map(expense => {
      if (expense.person === person) {
        return { ...expense, enabled };
      }
      return expense;
    });
    
    // Create a new incomes array with updated enabled values
    const updatedIncomes = selectedPlan.incomes.map(income => {
      if (income.person === person) {
        return { ...income, enabled };
      }
      return income;
    });
    
    // Update the plan object with modified expenses and incomes
    updatePlan(selectedPlanId, {
      ...selectedPlan,
      expenses: updatedExpenses,
      incomes: updatedIncomes
    });
  };

  // Format currency amount
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Container fluid className="plans-manager-container">
      <h2 className="page-title">Financial Planning</h2>
      <p className="page-description">
        Create "what-if" scenarios to see how changes in your expenses and income would affect your finances.
      </p>

      <Row>
        <Col md={3} className="plans-sidebar">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Your Plans</h5>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setShowNewPlanModal(true)}
              >
                <i className="bi bi-plus-circle"></i> New Plan
              </Button>
            </Card.Header>
            <ListGroup variant="flush">
              {plans.length === 0 ? (
                <ListGroup.Item className="text-center text-muted">
                  No plans yet. Create your first plan!
                </ListGroup.Item>
              ) : (
                plans.map(plan => (
                  <ListGroup.Item 
                    key={plan.id}
                    active={selectedPlanId === plan.id}
                    className="d-flex justify-content-between align-items-center plan-list-item"
                    onClick={() => {
                      setSelectedPlanId(plan.id);
                      setEditMode(false);
                    }}
                  >
                    <div>
                      <div className="plan-name">{plan.name}</div>
                      <small className="text-muted">
                        Created: {new Date(plan.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <ToggleButton
                      id={`toggle-visibility-${plan.id}`}
                      type="checkbox"
                      variant={activePlanIds.includes(plan.id) ? "outline-success" : "outline-secondary"}
                      checked={activePlanIds.includes(plan.id)}
                      value="1"
                      onChange={() => togglePlanVisibility(plan.id)}
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <i className={`bi ${activePlanIds.includes(plan.id) ? 'bi-eye-fill' : 'bi-eye'}`}></i>
                    </ToggleButton>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Col>
        
        <Col md={9}>
          {selectedPlan ? (
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div className="w-75">
                  {!editMode ? (
                    <>
                      <h4 className="mb-1">{selectedPlan.name}</h4>
                      {selectedPlan.description && <small className="text-muted">{selectedPlan.description}</small>}
                    </>
                  ) : (
                    <Form className="plan-name-edit">
                      <Form.Group className="mb-3">
                        <Form.Label>Plan Name</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={editedPlanName}
                          onChange={(e) => setEditedPlanName(e.target.value)}
                          placeholder="Plan Name"
                        />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Description (Optional)</Form.Label>
                        <Form.Control 
                          as="textarea" 
                          rows={2} 
                          value={editedPlanDescription}
                          onChange={(e) => setEditedPlanDescription(e.target.value)}
                          placeholder="Plan Description (optional)"
                        />
                      </Form.Group>
                    </Form>
                  )}
                </div>
                <div>
                  <Button 
                    variant={editMode ? "outline-primary" : "primary"} 
                    size="sm" 
                    className="mr-2"
                    onClick={handleEditToggle}
                  >
                    <i className={`bi ${editMode ? 'bi-eye' : 'bi-pencil'}`}></i> {editMode ? "View Impact" : "Edit Plan"}
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={handleDeletePlan}
                  >
                    <i className="bi bi-trash"></i> Delete
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                {editMode ? (
                  <>
                    {peopleInPlan.length > 0 && (
                      <Card className="mb-4 border-light person-toggles-card">
                        <Card.Body>
                          <Card.Title className="mb-3">
                            <i className="bi bi-people"></i> Enable/Disable by Person
                          </Card.Title>
                          <Row className="person-toggles-container">
                            {peopleInPlan.map(person => (
                              <Col key={person} md={4} sm={6} className="mb-2">
                                <div className="d-flex align-items-center person-toggle">
                                  <Form.Check 
                                    type="switch"
                                    id={`person-toggle-${person}`}
                                    label={person}
                                    checked={peopleEnabledStatus[person] || false}
                                    onChange={(e) => handleTogglePerson(person, e.target.checked)}
                                  />
                                </div>
                              </Col>
                            ))}
                          </Row>
                          <small className="text-muted mt-3 d-block">
                            Toggle all expenses and incomes for a specific person at once
                          </small>
                        </Card.Body>
                      </Card>
                    )}
                  
                    <Tabs
                      activeKey={activeTab}
                      onSelect={(k) => setActiveTab(k)}
                      className="mb-3"
                    >
                      <Tab eventKey="expenses" title="Expenses">
                        <div className="plan-table-container">
                          <Table striped bordered hover responsive className="plan-table">
                            <thead>
                              <tr>
                                <th width="90">Enabled</th>
                                <th width="130">Person</th>
                                <th>Expense</th>
                                <th width="130">Category</th>
                                <th width="110" className="text-right">Amount</th>
                                <th width="110">Frequency</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedPlan.expenses.map(expense => {
                                return (
                                  <tr 
                                    key={expense.id} 
                                    className={!expense.enabled ? 'disabled-item' : ''}
                                  >
                                    <td className="text-center">
                                      <Form.Check 
                                        type="switch"
                                        id={`expense-switch-${expense.id}`}
                                        checked={expense.enabled}
                                        onChange={(e) => handleToggleExpense(expense.id, e.target.checked)}
                                      />
                                    </td>
                                    <td>{expense.person}</td>
                                    <td>{expense.name || expense.title}</td>
                                    <td>{expense.category}</td>
                                    <td className="text-right">
                                      {formatCurrency(expense.amount)}
                                    </td>
                                    <td>{expense.frequency || 'monthly'}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </Table>
                        </div>
                      </Tab>
                      <Tab eventKey="incomes" title="Incomes">
                        <div className="plan-table-container">
                          <Table striped bordered hover responsive className="plan-table">
                            <thead>
                              <tr>
                                <th width="90">Enabled</th>
                                <th width="130">Person</th>
                                <th width="130">Source</th>
                                <th>Name</th>
                                <th width="110" className="text-right">Amount</th>
                                <th width="110">Frequency</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedPlan.incomes.map(income => {
                                return (
                                  <tr 
                                    key={income.id} 
                                    className={!income.enabled ? 'disabled-item' : ''}
                                  >
                                    <td className="text-center">
                                      <Form.Check 
                                        type="switch"
                                        id={`income-switch-${income.id}`}
                                        checked={income.enabled}
                                        onChange={(e) => handleToggleIncome(income.id, e.target.checked)}
                                      />
                                    </td>
                                    <td>{income.person}</td>
                                    <td>{income.source}</td>
                                    <td>{income.name}</td>
                                    <td className="text-right">
                                      {formatCurrency(income.amount)}
                                    </td>
                                    <td>{income.frequency}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </Table>
                        </div>
                      </Tab>
                    </Tabs>
                  </>
                ) : planImpact ? (
                  <div className="plan-impact">
                    <Row className="mb-4">
                      <Col md={6}>
                        <Card className="text-center h-100">
                          <Card.Body>
                            <h6 className="text-muted">Monthly Financial Impact</h6>
                            <h3 className={planImpact.monthlySavings >= 0 ? 'text-success' : 'text-danger'}>
                              {planImpact.monthlySavings >= 0 ? '+' : ''}{formatCurrency(planImpact.monthlySavings)}/month
                            </h3>
                            <p className="text-muted">
                              {planImpact.monthlySavings >= 0 
                                ? 'You would save this amount monthly' 
                                : 'Your expenses would increase by this amount monthly'}
                            </p>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="text-center h-100">
                          <Card.Body>
                            <h6 className="text-muted">Annual Financial Impact</h6>
                            <h3 className={planImpact.annualSavings >= 0 ? 'text-success' : 'text-danger'}>
                              {planImpact.annualSavings >= 0 ? '+' : ''}{formatCurrency(planImpact.annualSavings)}/year
                            </h3>
                            <p className="text-muted">
                              {planImpact.annualSavings >= 0 
                                ? 'Projected yearly savings' 
                                : 'Projected yearly increase in expenses'}
                            </p>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Row className="mb-4">
                      <Col md={6}>
                        <Card className="h-100">
                          <Card.Body>
                            <h5>Current Financial Situation</h5>
                            <Table>
                              <tbody>
                                <tr>
                                  <td>Monthly Income:</td>
                                  <td className="text-right">{formatCurrency(planImpact.currentMonthlyIncome)}</td>
                                </tr>
                                <tr>
                                  <td>Monthly Expenses:</td>
                                  <td className="text-right">{formatCurrency(planImpact.currentMonthlyExpenses)}</td>
                                </tr>
                                <tr className="font-weight-bold">
                                  <td>Monthly Balance:</td>
                                  <td className={`text-right ${planImpact.currentMonthlyBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {formatCurrency(planImpact.currentMonthlyBalance)}
                                  </td>
                                </tr>
                              </tbody>
                            </Table>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="h-100">
                          <Card.Body>
                            <h5>Plan Projection</h5>
                            <Table>
                              <tbody>
                                <tr>
                                  <td>Monthly Income:</td>
                                  <td className="text-right">{formatCurrency(planImpact.planMonthlyIncome)}</td>
                                </tr>
                                <tr>
                                  <td>Monthly Expenses:</td>
                                  <td className="text-right">{formatCurrency(planImpact.planMonthlyExpenses)}</td>
                                </tr>
                                <tr className="font-weight-bold">
                                  <td>Monthly Balance:</td>
                                  <td className={`text-right ${planImpact.planMonthlyBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {formatCurrency(planImpact.planMonthlyBalance)}
                                  </td>
                                </tr>
                              </tbody>
                            </Table>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <div className="text-right mt-3">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => setEditMode(true)}
                      >
                        <i className="bi bi-pencil"></i> Make Adjustments
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-5 text-muted">
                    <p>There was an error calculating the plan impact. Please try again.</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          ) : (
            <div className="text-center py-5">
              <h4 className="text-muted">Select a plan or create a new one</h4>
              <p>Financial plans help you visualize changes to your expenses and income.</p>
              <Button 
                variant="primary" 
                onClick={() => setShowNewPlanModal(true)}
              >
                <i className="bi bi-plus-circle"></i> Create New Plan
              </Button>
            </div>
          )}
        </Col>
      </Row>

      {/* New Plan Modal */}
      <Modal show={showNewPlanModal} onHide={() => setShowNewPlanModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Financial Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Plan Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g., 'Budget Reduction Plan'" 
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                placeholder="Describe your financial plan goals"
                value={newPlanDescription}
                onChange={(e) => setNewPlanDescription(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewPlanModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreatePlan} disabled={!newPlanName.trim()}>
            Create Plan
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PlansManager; 