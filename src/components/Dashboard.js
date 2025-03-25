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

const Dashboard = ({ expenses, incomes }) => {
  const [categoryData, setCategoryData] = useState({ labels: [], data: [] });
  const [monthlyData, setMonthlyData] = useState({ labels: [], data: [] });
  const [personIncomeExpenseData, setPersonIncomeExpenseData] = useState({});
  
  // Use the global filter context instead of local state
  const { 
    selectedUsers, 
    availableUsers, 
    updateAvailableUsers, 
    handleUserFilterChange, 
    handleSelectAllUsers,
    filterDataBySelectedUsers 
  } = useFilter();

  // Update available users when expenses or incomes change
  useEffect(() => {
    if (expenses.length > 0 || incomes.length > 0) {
      updateAvailableUsers(expenses, incomes);
    }
  }, [expenses, incomes, updateAvailableUsers]);

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

  return (
    <div className="dashboard">
      <h2 className="mb-4">Financial Dashboard</h2>
      
      <Row className="mb-4">
        <Col md={12}>
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
                    
                    <Row>
                      <Col md={4}>
                        <div className="summary-box income">
                          <h6>Monthly Income</h6>
                          <div className="amount">${personData.income.toFixed(2)}</div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="summary-box expenses">
                          <h6>Monthly Expenses</h6>
                          <div className="amount">${personData.expenses.toFixed(2)}</div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className={`summary-box balance ${personData.balance >= 0 ? 'positive' : 'negative'}`}>
                          <h6>Monthly Balance</h6>
                          <div className="amount">${personData.balance.toFixed(2)}</div>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
      
      {/* All persons summary when "All Users" is selected */}
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