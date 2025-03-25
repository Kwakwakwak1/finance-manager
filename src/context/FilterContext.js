import React, { createContext, useState, useContext, useCallback, useRef } from 'react';

const FilterContext = createContext();

export const useFilter = () => useContext(FilterContext);

export const FilterProvider = ({ children }) => {
  const [selectedUsers, setSelectedUsers] = useState(['all']);
  const [availableUsers, setAvailableUsers] = useState([]);
  
  // Use ref to store previous users for comparison without causing re-renders
  const prevUsersRef = useRef([]);

  // Update available users based on expenses and incomes
  const updateAvailableUsers = useCallback((expenses, incomes) => {
    const usersFromExpenses = expenses
      .filter(expense => expense.person)
      .map(expense => expense.person);
    
    const usersFromIncomes = incomes
      .filter(income => income.person)
      .map(income => income.person);
    
    const allUsers = [...new Set([...usersFromExpenses, ...usersFromIncomes])];
    
    // Sort to ensure consistent comparison
    const sortedNewUsers = [...allUsers].sort();
    const sortedPrevUsers = [...prevUsersRef.current].sort();
    
    // Only update state if the users list has actually changed
    if (JSON.stringify(sortedNewUsers) !== JSON.stringify(sortedPrevUsers)) {
      setAvailableUsers(allUsers);
      prevUsersRef.current = allUsers;
    }
  }, []);

  // Handle user filter change
  const handleUserFilterChange = useCallback((value) => {
    // If a specific user is selected
    if (value !== 'all') {
      // If "All Users" is currently selected, switch to just this user
      setSelectedUsers(prev => {
        if (prev.includes('all')) {
          return [value];
        }
        
        // If the user is already selected
        if (prev.includes(value)) {
          // Don't allow deselecting if it's the only user selected
          if (prev.length === 1) {
            return prev;
          }
          // Otherwise remove this user from selection
          return prev.filter(user => user !== value);
        } else {
          // Add this user to the current selection
          return [...prev, value];
        }
      });
    } else {
      // If "All Users" is selected
      setSelectedUsers(['all']);
    }
  }, []);

  // Handle "Select All" option
  const handleSelectAllUsers = useCallback((checked) => {
    if (checked) {
      setSelectedUsers(['all']);
    } else {
      // If unchecking "all", don't select any user
      setSelectedUsers([]);
    }
  }, []);

  // Filter data based on selected users
  const filterDataBySelectedUsers = useCallback((data) => {
    if (!data || !Array.isArray(data)) return [];
    if (selectedUsers.includes('all')) return data;
    return data.filter(item => item.person && selectedUsers.includes(item.person));
  }, [selectedUsers]);

  const value = {
    selectedUsers,
    availableUsers,
    updateAvailableUsers,
    handleUserFilterChange,
    handleSelectAllUsers,
    filterDataBySelectedUsers
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}; 