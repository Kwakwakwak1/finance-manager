import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { calculateMonthlyAmount } from '../data/expenseData';

const PlansContext = createContext();

export const usePlans = () => {
  return useContext(PlansContext);
};

export const PlansProvider = ({ children, expenses, incomes }) => {
  const [plans, setPlans] = useState([]);
  const [activePlanIds, setActivePlanIds] = useState([]);

  // Debug logging for provider 
  useEffect(() => {
    console.log('PlansProvider initialized', { 
      hasExpenses: Boolean(expenses?.length),
      hasIncomes: Boolean(incomes?.length)
    });
  }, [expenses, incomes]);

  // Load plans from localStorage on component mount
  useEffect(() => {
    const savedPlans = localStorage.getItem('financialPlans');
    if (savedPlans) {
      try {
        const parsedPlans = JSON.parse(savedPlans);
        setPlans(parsedPlans);
        console.log(`PlansProvider: Loaded ${parsedPlans.length} plans from localStorage`);
      } catch (error) {
        console.error('PlansProvider: Error parsing saved plans:', error);
        localStorage.removeItem('financialPlans');
      }
    } else {
      console.log('PlansProvider: No saved plans found in localStorage');
    }
  }, []);

  // Save plans to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('financialPlans', JSON.stringify(plans));
  }, [plans]);

  // Create a new financial plan
  const createPlan = (name, description = '') => {
    try {
      if (!Array.isArray(expenses) || !Array.isArray(incomes)) {
        console.error("Cannot create plan: expenses or incomes are not arrays", {
          expenses,
          incomes
        });
        return null;
      }
      
      const newPlan = {
        id: uuidv4(),
        name,
        description,
        createdAt: new Date().toISOString(),
        expenses: expenses.map(expense => ({
          ...expense,
          enabled: true
        })),
        incomes: incomes.map(income => ({
          ...income,
          enabled: true
        }))
      };
      setPlans([...plans, newPlan]);
      console.log('Plan created successfully:', newPlan.name);
      return newPlan.id;
    } catch (error) {
      console.error('Error creating plan:', error);
      return null;
    }
  };

  // Update an existing plan
  const updatePlan = (planId, updatedPlan) => {
    setPlans(plans.map(plan => 
      plan.id === planId ? { ...plan, ...updatedPlan } : plan
    ));
  };

  // Delete a plan
  const deletePlan = (planId) => {
    setPlans(plans.filter(plan => plan.id !== planId));
    setActivePlanIds(activePlanIds.filter(id => id !== planId));
  };

  // Toggle expense enabled/disabled in a plan
  const togglePlanExpense = (planId, expenseId, enabled) => {
    setPlans(plans.map(plan => {
      if (plan.id === planId) {
        return {
          ...plan,
          expenses: plan.expenses.map(expense => 
            expense.id === expenseId ? { ...expense, enabled } : expense
          )
        };
      }
      return plan;
    }));
  };

  // Toggle income enabled/disabled in a plan
  const togglePlanIncome = (planId, incomeId, enabled) => {
    setPlans(plans.map(plan => {
      if (plan.id === planId) {
        return {
          ...plan,
          incomes: plan.incomes.map(income => 
            income.id === incomeId ? { ...income, enabled } : income
          )
        };
      }
      return plan;
    }));
  };

  // Toggle a plan's visibility in comparison charts
  const togglePlanVisibility = (planId) => {
    if (activePlanIds.includes(planId)) {
      setActivePlanIds(activePlanIds.filter(id => id !== planId));
    } else {
      setActivePlanIds([...activePlanIds, planId]);
    }
  };

  // Calculate financial impact of a plan (monthly savings/spending difference)
  const calculatePlanImpact = (planId) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return { monthlySavings: 0, annualSavings: 0 };

    // Calculate current total monthly expenses
    const currentMonthlyExpenses = expenses.reduce((total, expense) => {
      if (expense.active) {
        return total + calculateMonthlyAmount(expense.amount, expense.frequency || 'monthly');
      }
      return total;
    }, 0);

    // Calculate current total monthly income
    const currentMonthlyIncome = incomes.reduce((total, income) => {
      const monthlyAmount = calculateMonthlyAmount(income.amount, income.frequency);
      return total + (income.isGross ? monthlyAmount * (1 - (income.taxRate || 0.25)) : monthlyAmount);
    }, 0);

    // Calculate plan's total monthly expenses
    const planMonthlyExpenses = plan.expenses.reduce((total, expense) => {
      if (expense.enabled && expense.active) {
        return total + calculateMonthlyAmount(expense.amount, expense.frequency || 'monthly');
      }
      return total;
    }, 0);

    // Calculate plan's total monthly income
    const planMonthlyIncome = plan.incomes.reduce((total, income) => {
      if (income.enabled) {
        const monthlyAmount = calculateMonthlyAmount(income.amount, income.frequency);
        return total + (income.isGross ? monthlyAmount * (1 - (income.taxRate || 0.25)) : monthlyAmount);
      }
      return total;
    }, 0);

    // Calculate monthly and annual savings/difference
    const currentMonthlyBalance = currentMonthlyIncome - currentMonthlyExpenses;
    const planMonthlyBalance = planMonthlyIncome - planMonthlyExpenses;
    const monthlySavings = planMonthlyBalance - currentMonthlyBalance;
    const annualSavings = monthlySavings * 12;

    return {
      monthlySavings,
      annualSavings,
      currentMonthlyExpenses,
      planMonthlyExpenses,
      currentMonthlyIncome,
      planMonthlyIncome,
      currentMonthlyBalance,
      planMonthlyBalance
    };
  };

  // Get the active plans for comparison
  const getActivePlans = () => {
    return plans.filter(plan => activePlanIds.includes(plan.id));
  };

  const value = {
    plans,
    setPlans,
    activePlanIds,
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanExpense,
    togglePlanIncome,
    togglePlanVisibility,
    calculatePlanImpact,
    getActivePlans
  };

  // Debug information before rendering
  console.log('PlansProvider rendering with value:', {
    hasPlans: Boolean(plans.length),
    hasActivePlans: Boolean(activePlanIds.length),
    isChildrenFunction: typeof children === 'function'
  });

  // Always provide the context values to all children
  return (
    <PlansContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </PlansContext.Provider>
  );
}; 