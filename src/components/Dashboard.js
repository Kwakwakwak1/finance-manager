import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Button } from 'react-bootstrap';
import { calculateMonthlyAmount } from '../data/expenseData';
import { useFilter } from '../context/FilterContext';
import { usePlans } from '../context/PlansContext';
import './Dashboard.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ expenses, incomes, setActiveTab }) => {
  const [categoryData, setCategoryData] = useState({ labels: [], data: [] });
  const [monthlyData, setMonthlyData] = useState({ labels: [], data: [] });
  const [personIncomeExpenseData, setPersonIncomeExpenseData] = useState({});
  const [showPlanComparison, setShowPlanComparison] = useState(false);
  
  // Use the global filter context
  const { 
    selectedUsers, 
    availableUsers, 
    updateAvailableUsers, 
    handleUserFilterChange, 
    handleSelectAllUsers,
    filterDataBySelectedUsers 
  } = useFilter();

  // Use the global plans context with fallback values to prevent errors
  const plansContext = usePlans();
  
  // Log for debugging
  useEffect(() => {
    if (!plansContext) {
      console.warn('Dashboard: Plans context is not available');
    } else {
      console.log('Dashboard: Plans context loaded successfully', 
        { plansCount: plansContext.plans?.length || 0 });
    }
  }, [plansContext]);
  
  const { 
    plans = [], 
    activePlanIds = [], 
    calculatePlanImpact = () => ({ monthlySavings: 0, annualSavings: 0 }),
    getActivePlans = () => []
  } = plansContext || {};

  // Update available users when expenses or incomes change
  useEffect(() => {
    if (expenses.length > 0 || incomes.length > 0) {
      updateAvailableUsers(expenses, incomes);
    }
  }, [expenses, incomes, updateAvailableUsers]);

  // Process chart data
  useEffect(() => {
    if (expenses.length === 0) return;
    
    // Use the filtered expenses from the context
    const filteredExpenses = filterDataBySelectedUsers(expenses);
    
    // Process category data
    const categories = {};
    filteredExpenses.forEach(expense => {
      if (expense.active) {
        if (categories[expense.category]) {
          categories[expense.category] += expense.amount;
        } else {
          categories[expense.category] = expense.amount;
        }
      }
    });
    
    const categoryLabels = Object.keys(categories);
    const categoryValues = Object.values(categories);
    
    setCategoryData({
      labels: categoryLabels,
      data: categoryValues
    });
    
    // Process monthly data for the last 6 months
    const months = {};
    const today = new Date();
    
    // Initialize last 6 months with 0
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthLabel = month.toLocaleString('default', { month: 'short', year: '2-digit' });
      months[monthLabel] = 0;
    }
    
    filteredExpenses.forEach(expense => {
      if (expense.active) {
        const expenseDate = new Date(expense.date);
        const monthLabel = expenseDate.toLocaleString('default', { month: 'short', year: '2-digit' });
        
        // Only count expenses from the last 6 months
        if (months[monthLabel] !== undefined) {
          months[monthLabel] += expense.amount;
        }
      }
    });
    
    setMonthlyData({
      labels: Object.keys(months),
      data: Object.values(months)
    });
    
    // Process income vs expense data for each person
    const personData = {};
    
    // Get all unique persons from both expenses and incomes
    const allPersons = [...new Set([
      ...expenses.filter(expense => expense.person).map(expense => expense.person),
      ...incomes.filter(income => income.person).map(income => income.person)
    ])];
    
    allPersons.forEach(person => {
      // Calculate total monthly expenses for this person
      const personExpenses = expenses.filter(expense => 
        expense.person === person && expense.active
      );
      
      const totalMonthlyExpenses = personExpenses.reduce((sum, expense) => {
        return sum + calculateMonthlyAmount(expense.amount, expense.frequency || 'monthly');
      }, 0);
      
      // Calculate total monthly income for this person
      const personIncomes = incomes.filter(income => income.person === person);
      
      const totalMonthlyIncome = personIncomes.reduce((sum, income) => {
        const monthlyAmount = calculateMonthlyAmount(income.amount, income.frequency);
        // Apply tax rate if it's gross income
        return sum + (income.isGross 
          ? monthlyAmount * (1 - (income.taxRate || 0.25)) 
          : monthlyAmount);
      }, 0);
      
      // Calculate balance (income - expenses)
      const balance = totalMonthlyIncome - totalMonthlyExpenses;
      
      personData[person] = {
        income: totalMonthlyIncome,
        expenses: totalMonthlyExpenses,
        balance: balance,
        // Group expenses by category for this person
        expensesByCategory: personExpenses.reduce((categories, expense) => {
          const monthlyAmount = calculateMonthlyAmount(expense.amount, expense.frequency || 'monthly');
          if (categories[expense.category]) {
            categories[expense.category] += monthlyAmount;
          } else {
            categories[expense.category] = monthlyAmount;
          }
          return categories;
        }, {})
      };
    });
    
    setPersonIncomeExpenseData(personData);
    
  }, [expenses, selectedUsers, incomes, filterDataBySelectedUsers]);

  // Generate comparison chart data for plans
  const generatePlanComparisonData = () => {
    const activePlans = getActivePlans();
    if (activePlans.length === 0) return null;

    // Get current monthly expenses
    const currentMonthlyExpenses = expenses.reduce((sum, expense) => {
      if (expense.active) {
        return sum + calculateMonthlyAmount(expense.amount, expense.frequency || 'monthly');
      }
      return sum;
    }, 0);

    // Prepare data for chart
    const labels = ['Current'];
    const expensesData = [currentMonthlyExpenses];
    const savingsData = [0];  // Current has no savings (reference point)
    const backgroundColors = ['rgba(54, 162, 235, 0.7)'];
    const borderColors = ['rgba(54, 162, 235, 1)'];
    const savingsBackgroundColors = ['rgba(255, 99, 132, 0)'];
    const savingsBorderColors = ['rgba(255, 99, 132, 0)'];

    // Add data for each active plan
    activePlans.forEach(plan => {
      const impact = calculatePlanImpact(plan.id);
      labels.push(plan.name);
      expensesData.push(impact.planMonthlyExpenses);
      savingsData.push(impact.monthlySavings);
      
      // Use different colors for each plan
      if (impact.monthlySavings >= 0) {
        backgroundColors.push('rgba(40, 167, 69, 0.7)');
        borderColors.push('rgba(40, 167, 69, 1)');
        savingsBackgroundColors.push('rgba(40, 167, 69, 0.3)');
        savingsBorderColors.push('rgba(40, 167, 69, 1)');
      } else {
        backgroundColors.push('rgba(220, 53, 69, 0.7)');
        borderColors.push('rgba(220, 53, 69, 1)');
        savingsBackgroundColors.push('rgba(220, 53, 69, 0.3)');
        savingsBorderColors.push('rgba(220, 53, 69, 1)');
      }
    });

    return {
      labels,
      datasets: [
        {
          label: 'Monthly Expenses',
          data: expensesData,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
        {
          label: 'Monthly Savings',
          data: savingsData,
          backgroundColor: savingsBackgroundColors,
          borderColor: savingsBorderColors,
          borderWidth: 1,
        }
      ]
    };
  };

  // Calculate category comparison data for plans
  const generateCategoryComparisonData = () => {
    const activePlans = getActivePlans();
    if (activePlans.length === 0) return null;

    // Get unique categories from current expenses
    const allCategories = [...new Set(expenses.map(expense => expense.category))];
    
    // Calculate current category totals
    const currentCategoryTotals = {};
    expenses.forEach(expense => {
      if (expense.active) {
        const monthlyAmount = calculateMonthlyAmount(expense.amount, expense.frequency || 'monthly');
        if (currentCategoryTotals[expense.category]) {
          currentCategoryTotals[expense.category] += monthlyAmount;
        } else {
          currentCategoryTotals[expense.category] = monthlyAmount;
        }
      }
    });

    // Prepare datasets for the chart
    const datasets = [{
      label: 'Current',
      data: allCategories.map(category => currentCategoryTotals[category] || 0),
      backgroundColor: 'rgba(54, 162, 235, 0.7)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }];

    // Colors for plans
    const planColors = [
      { bg: 'rgba(40, 167, 69, 0.7)', border: 'rgba(40, 167, 69, 1)' },
      { bg: 'rgba(255, 193, 7, 0.7)', border: 'rgba(255, 193, 7, 1)' },
      { bg: 'rgba(111, 66, 193, 0.7)', border: 'rgba(111, 66, 193, 1)' },
      { bg: 'rgba(23, 162, 184, 0.7)', border: 'rgba(23, 162, 184, 1)' },
    ];

    // Add dataset for each active plan
    activePlans.forEach((plan, index) => {
      // Calculate plan category totals
      const planCategoryTotals = {};
      plan.expenses.forEach(expense => {
        if (expense.enabled && expense.active) {
          const monthlyAmount = calculateMonthlyAmount(expense.amount, expense.frequency || 'monthly');
          if (planCategoryTotals[expense.category]) {
            planCategoryTotals[expense.category] += monthlyAmount;
          } else {
            planCategoryTotals[expense.category] = monthlyAmount;
          }
        }
      });

      // Add dataset for this plan
      datasets.push({
        label: plan.name,
        data: allCategories.map(category => planCategoryTotals[category] || 0),
        backgroundColor: planColors[index % planColors.length].bg,
        borderColor: planColors[index % planColors.length].border,
        borderWidth: 1,
      });
    });

    return {
      labels: allCategories,
      datasets
    };
  };

  // Chart options and data
  const categoryChartData = {
    labels: categoryData.labels,
    datasets: [
      {
        label: 'Spending by Category',
        data: categoryData.data,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#8AC926', '#1982C4', '#6A4C93', '#F15BB5'
        ],
        borderWidth: 1,
      },
    ],
  };

  const monthlyChartData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Monthly Spending',
        data: monthlyData.data,
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        tension: 0.4,
      },
    ],
  };

  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Spending by Category',
        font: {
          size: 16,
        },
      },
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Monthly Spending Trend',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Expenses from Income',
        font: {
          size: 16,
        },
      },
    },
  };

  const comparisonOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Plan Comparison - Monthly Expenses',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount ($)'
        }
      }
    }
  };

  const categoryComparisonOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Category Expenses Comparison',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount ($)'
        }
      }
    }
  };

  // Calculate summary statistics for filtered expenses
  const filteredExpenses = filterDataBySelectedUsers(expenses);
  
  const totalActive = filteredExpenses
    .filter(expense => expense.active)
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  // Find highest category
  let highestCategory = { name: 'None', amount: 0 };
  if (categoryData.labels.length > 0) {
    const maxIndex = categoryData.data.indexOf(Math.max(...categoryData.data));
    highestCategory = {
      name: categoryData.labels[maxIndex],
      amount: categoryData.data[maxIndex] || 0,
    };
  }

  // Plan comparison data
  const planComparisonData = generatePlanComparisonData();
  const categoryComparisonData = generateCategoryComparisonData();

  return (
    <div className="dashboard">
      <h2 className="mb-4">Financial Dashboard</h2>
      
      <Row className="mb-4">
        <Col md={8}>
          <Card className="filter-card">
            <Card.Body>
              <Form>
                <Form.Group>
                  <Form.Label>Filter by Person</Form.Label>
                  <div className="d-flex flex-wrap">
                    <Form.Check
                      type="checkbox"
                      id="user-all"
                      label="All Users"
                      className="me-3 mb-2"
                      checked={selectedUsers.includes('all')}
                      onChange={(e) => handleSelectAllUsers(e.target.checked)}
                    />
                    {availableUsers.map(user => (
                      <Form.Check
                        key={user}
                        type="checkbox"
                        id={`user-${user}`}
                        label={user}
                        className="me-3 mb-2"
                        checked={selectedUsers.includes(user)}
                        onChange={() => handleUserFilterChange(user)}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <Form.Group>
                <Form.Label>Show Plan Comparisons</Form.Label>
                <Form.Check 
                  type="switch"
                  id="plan-comparison-switch"
                  label={showPlanComparison ? "Enabled" : "Disabled"}
                  checked={showPlanComparison}
                  onChange={() => setShowPlanComparison(!showPlanComparison)}
                />
              </Form.Group>
              <div>
                <small className="d-block text-muted mb-1">Active Plans: {activePlanIds.length}</small>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setActiveTab('plans')}
                >
                  Manage Plans
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={4}>
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Total Active Expenses</Card.Title>
              <div className="summary-value">${totalActive.toFixed(2)}</div>
              <Card.Text>
                <small>{selectedUsers.includes('all') ? '100.0% of all expenses' : 'Filtered expenses'}</small>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Highest Spending Category</Card.Title>
              <div className="summary-value">{highestCategory.name}</div>
              <Card.Text>
                <small>${highestCategory.amount.toFixed(2)}</small>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Total Expenses Tracked</Card.Title>
              <div className="summary-value">{filteredExpenses.length}</div>
              <Card.Text>
                <small>Active: {filteredExpenses.filter(e => e.active).length} | Inactive: {filteredExpenses.filter(e => !e.active).length}</small>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Plan Comparison Charts */}
      {showPlanComparison && planComparisonData && (
        <Row className="mb-4">
          <Col md={12}>
            <Card className="chart-card plan-comparison-card">
              <Card.Header>
                <h5>Financial Plan Comparisons</h5>
                <p className="text-muted mb-0">
                  Compare your current expenses with your financial plans
                </p>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col lg={6} className="mb-4 mb-lg-0">
                    <Bar options={comparisonOptions} data={planComparisonData} height={100} />
                  </Col>
                  <Col lg={6}>
                    {categoryComparisonData && (
                      <Bar options={categoryComparisonOptions} data={categoryComparisonData} height={100} />
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      
      <Row className="mb-4">
        <Col md={12}>
          <Card className="chart-card">
            <Card.Body>
              <Line options={lineOptions} data={monthlyChartData} height={100} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={12}>
          <Card className="chart-card">
            <Card.Body>
              <Bar options={barOptions} data={categoryChartData} height={100} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Person-specific income vs expense charts */}
      {!selectedUsers.includes('all') && selectedUsers.length > 0 && (
        <Row className="mb-4">
          <Col md={12}>
            <h3 className="mb-3">Person-Specific Analysis</h3>
          </Col>
          
          {selectedUsers.map(person => {
            const personData = personIncomeExpenseData[person];
            
            if (!personData) return null;
            
            // Create income vs expense pie chart data
            const incomeExpenseData = {
              labels: ['Balance', 'Expenses'],
              datasets: [
                {
                  data: [Math.max(0, personData.balance), personData.expenses],
                  backgroundColor: [
                    '#4BC0C0', // Balance/Remaining Income (green)
                    '#FF6384'  // Expenses (red)
                  ],
                  borderWidth: 1,
                }
              ]
            };
            
            // Create expense by category pie chart data
            const categoryLabels = Object.keys(personData.expensesByCategory);
            const categoryValues = Object.values(personData.expensesByCategory);
            
            const expenseCategoryData = {
              labels: categoryLabels,
              datasets: [
                {
                  data: categoryValues,
                  backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#8AC926', '#1982C4', '#6A4C93', '#F15BB5'
                  ],
                  borderWidth: 1,
                }
              ]
            };
            
            return (
              <Col md={6} key={person} className="mb-4">
                <Card className="person-card">
                  <Card.Header>
                    <h4>{person}'s Financial Summary</h4>
                  </Card.Header>
                  <Card.Body>
                    <Row className="mb-4">
                      <Col md={6}>
                        <div className="text-center mb-2">
                          <h5>Monthly Expenses from Income</h5>
                        </div>
                        <Pie data={incomeExpenseData} options={pieOptions} />
                      </Col>
                      <Col md={6}>
                        <div className="text-center mb-2">
                          <h5>Expenses by Category</h5>
                        </div>
                        <Pie 
                          data={expenseCategoryData} 
                          options={{
                            ...pieOptions,
                            plugins: {
                              ...pieOptions.plugins,
                              title: {
                                ...pieOptions.plugins.title,
                                text: 'Expenses by Category'
                              }
                            }
                          }} 
                        />
                      </Col>
                    </Row>
                    <div className="financial-summary mt-4">
                      <div className="d-flex justify-content-between mb-2">
                        <div>Monthly Income:</div>
                        <div className="text-success fw-bold">${personData.income.toFixed(2)}</div>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <div>Monthly Expenses:</div>
                        <div className="text-danger fw-bold">${personData.expenses.toFixed(2)}</div>
                      </div>
                      <div className="d-flex justify-content-between">
                        <div>Monthly Balance:</div>
                        <div className={`fw-bold ${personData.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                          ${personData.balance.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
      
      {/* Individual financial summaries when 'All Users' is selected */}
      {selectedUsers.includes('all') && Object.keys(personIncomeExpenseData).length > 0 && (
        <Row className="mb-4">
          <Col md={12}>
            <h3 className="mb-3">Individual Financial Summaries</h3>
          </Col>
          
          {Object.entries(personIncomeExpenseData).map(([person, personData]) => (
            <Col md={6} lg={4} key={person} className="mb-4">
              <Card className="person-summary-card">
                <Card.Header>
                  <h5>{person}</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col xs={4}>
                      <div className="summary-mini income">
                        <small>Income</small>
                        <div className="amount">${personData.income.toFixed(2)}</div>
                      </div>
                    </Col>
                    <Col xs={4}>
                      <div className="summary-mini expenses">
                        <small>Expenses</small>
                        <div className="amount">${personData.expenses.toFixed(2)}</div>
                      </div>
                    </Col>
                    <Col xs={4}>
                      <div className={`summary-mini balance ${personData.balance >= 0 ? 'positive' : 'negative'}`}>
                        <small>Balance</small>
                        <div className="amount">${personData.balance.toFixed(2)}</div>
                      </div>
                    </Col>
                  </Row>
                  
                  <div className="mt-3">
                    <div className="progress-container">
                      <div className="progress-label">
                        <span>Expenses to Income Ratio</span>
                        <span>{personData.income > 0 
                          ? `${Math.min(100, (personData.expenses / personData.income * 100)).toFixed(0)}%` 
                          : 'N/A'}
                        </span>
                      </div>
                      <div className="progress">
                        <div 
                          className={`progress-bar ${personData.expenses > personData.income ? 'bg-danger' : 'bg-success'}`}
                          role="progressbar" 
                          style={{ 
                            width: personData.income > 0 
                              ? `${Math.min(100, (personData.expenses / personData.income * 100))}%` 
                              : '0%' 
                          }}
                          aria-valuenow={personData.income > 0 ? Math.min(100, (personData.expenses / personData.income * 100)) : 0}
                          aria-valuemin="0" 
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="mt-3 w-100"
                    onClick={() => handleUserFilterChange(person)}
                  >
                    View Detailed Analysis
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Dashboard; 