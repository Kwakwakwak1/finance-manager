// Financial data converted from Swift syntax
// Frequency options: daily, weekly, biweekly, monthly, quarterly, annually

export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' }
];

export const EXPENSE_CATEGORIES = {
  HOUSING: 'Housing',
  TRANSPORTATION: 'Transportation',
  SUBSCRIPTIONS: 'Subscriptions',
  UTILITIES: 'Utilities',
  HEALTHCARE: 'Healthcare',
  OTHER: 'Other',
  FOOD: 'Food',
  ENTERTAINMENT: 'Entertainment'
};

export const defaultFinancialData = {
  incomes: [
    { person: "Kristopher", source: "Apple", name: "Software Engineer Salary", amount: 8333.33, frequency: "monthly", isGross: true, taxRate: 0.33 },  // 100k annually
    { person: "Kristopher", source: "Freelance", name: "iOS Development", amount: 2000, frequency: "monthly", isGross: true, taxRate: 0.25 },
    { person: "Kristopher", source: "Investments", name: "Dividend Income", amount: 500, frequency: "quarterly", isGross: false, taxRate: 0 },
    { person: "Taylor", source: "Rental", name: "Property Income", amount: 1500, frequency: "monthly", isGross: true, taxRate: 0.20 },
    { person: "Taylor", source: "Company XYZ", name: "UX Designer Salary", amount: 6250, frequency: "monthly", isGross: true, taxRate: 0.28 }  // 75k annually
  ],
  taxRate: 0.33,
  expenses: [
    { person: "Taylor", name: "Rent", amount: 760, frequency: "monthly", category: EXPENSE_CATEGORIES.HOUSING },
    { person: "Kristopher", name: "VA Mortgage", amount: 2200, frequency: "monthly", category: EXPENSE_CATEGORIES.HOUSING },
    { person: "Kristopher", name: "Car Insurance", amount: 147.32, frequency: "monthly", category: EXPENSE_CATEGORIES.TRANSPORTATION },
    { person: "Kristopher", name: "Apple Vision Pro care+", amount: 24.99, frequency: "monthly", category: EXPENSE_CATEGORIES.SUBSCRIPTIONS },
    { person: "Kristopher", name: "iCloud 2TB", amount: 9.99, frequency: "monthly", category: EXPENSE_CATEGORIES.SUBSCRIPTIONS },
    { person: "Kristopher", name: "OpenAI", amount: 20, frequency: "monthly", category: EXPENSE_CATEGORIES.SUBSCRIPTIONS },
    { person: "Kristopher", name: "Claude AI", amount: 20, frequency: "monthly", category: EXPENSE_CATEGORIES.SUBSCRIPTIONS },
    { person: "Kristopher", name: "Water / Sanitation est.", amount: 72, frequency: "monthly", category: EXPENSE_CATEGORIES.UTILITIES },
    { person: "Kristopher", name: "Internet", amount: 64.99, frequency: "monthly", category: EXPENSE_CATEGORIES.UTILITIES },
    { person: "Kristopher", name: "Phone", amount: 173.07, frequency: "monthly", category: EXPENSE_CATEGORIES.UTILITIES },
    { person: "Kristopher", name: "Planet Fitness", amount: 25, frequency: "monthly", category: EXPENSE_CATEGORIES.SUBSCRIPTIONS },
    { person: "Kristopher", name: "Dominion Energy", amount: 256.14, frequency: "monthly", category: EXPENSE_CATEGORIES.UTILITIES },
    { person: "Taylor", name: "Work Rent / utilities", amount: 740, frequency: "monthly", category: EXPENSE_CATEGORIES.HOUSING },
    { person: "Taylor", name: "Apple Music", amount: 16.99, frequency: "monthly", category: EXPENSE_CATEGORIES.SUBSCRIPTIONS },
    { person: "Taylor", name: "Therapy", amount: 260, frequency: "monthly", category: EXPENSE_CATEGORIES.HEALTHCARE },
    { person: "Kristopher", name: "Amazon Prime", amount: 16.30, frequency: "monthly", category: EXPENSE_CATEGORIES.SUBSCRIPTIONS },
    { person: "Taylor", name: "Amazon Prime", amount: 16.30, frequency: "monthly", category: EXPENSE_CATEGORIES.SUBSCRIPTIONS },
    { person: "Taylor", name: "Dental Vision Insurance", amount: 28.4, frequency: "monthly", category: EXPENSE_CATEGORIES.HEALTHCARE },
    { person: "Taylor", name: "Electric Evergy", amount: 150, frequency: "monthly", category: EXPENSE_CATEGORIES.UTILITIES },
    { person: "Taylor", name: "Tax debt", amount: 500, frequency: "monthly", category: EXPENSE_CATEGORIES.OTHER },
    { person: "Taylor", name: "Icloud", amount: 9.99, frequency: "monthly", category: EXPENSE_CATEGORIES.SUBSCRIPTIONS },
    { person: "Taylor", name: "Wifi", amount: 70.7, frequency: "monthly", category: EXPENSE_CATEGORIES.UTILITIES },
    { person: "Taylor", name: "HBO Max", amount: 15.99, frequency: "monthly", category: EXPENSE_CATEGORIES.SUBSCRIPTIONS },
    { person: "Taylor", name: "Car insurance", amount: 155.88, frequency: "monthly", category: EXPENSE_CATEGORIES.TRANSPORTATION },
    { person: "Taylor", name: "Phone loan", amount: 54.08, frequency: "monthly", category: EXPENSE_CATEGORIES.OTHER },
    { person: "Taylor", name: "Life Insurance", amount: 25, frequency: "monthly", category: EXPENSE_CATEGORIES.HEALTHCARE },
    { person: "Taylor", name: "Chiro", amount: 50, frequency: "monthly", category: EXPENSE_CATEGORIES.HEALTHCARE },
    { person: "Taylor", name: "Chewy Food Dog Cat", amount: 80, frequency: "monthly", category: EXPENSE_CATEGORIES.OTHER },
    { person: "Taylor", name: "Health Insurance", amount: 218.51, frequency: "monthly", category: EXPENSE_CATEGORIES.HEALTHCARE },
    { person: "Taylor", name: "Oura", amount: 6, frequency: "monthly", category: EXPENSE_CATEGORIES.HEALTHCARE },
    { person: "Taylor", name: "Gas", amount: 50, frequency: "monthly", category: EXPENSE_CATEGORIES.TRANSPORTATION },
    { person: "Kristopher", name: "Groceries", amount: 300, frequency: "monthly", category: EXPENSE_CATEGORIES.FOOD },
    { person: "Taylor", name: "Groceries", amount: 300, frequency: "monthly", category: EXPENSE_CATEGORIES.FOOD },
    { person: "Junie", name: "Diapers", amount: 100, frequency: "monthly", category: EXPENSE_CATEGORIES.OTHER },
    { person: "Junie", name: "Food", amount: 100, frequency: "monthly", category: EXPENSE_CATEGORIES.FOOD },
    { person: "Junie", name: "Clothing", amount: 50, frequency: "monthly", category: EXPENSE_CATEGORIES.OTHER },
    { person: "Junie", name: "Misc", amount: 100, frequency: "monthly", category: EXPENSE_CATEGORIES.OTHER },
    { person: "Kristopher", name: "Food / Entertainment", amount: 150, frequency: "monthly", category: EXPENSE_CATEGORIES.ENTERTAINMENT },
    { person: "Taylor", name: "Food / Entertainment", amount: 150, frequency: "monthly", category: EXPENSE_CATEGORIES.ENTERTAINMENT }
  ],
  goals: [
    { name: "Emergency Fund", targetAmount: 25000, currentAmount: 5000, priority: "high" },
    { name: "Down Payment", targetAmount: 100000, currentAmount: 15000, priority: "medium" },
    { name: "Vacation Fund", targetAmount: 5000, currentAmount: 1000, priority: "low" }
  ]
};

// Helper function to calculate monthly equivalent amount based on frequency
export function calculateMonthlyAmount(amount, frequency) {
  switch (frequency) {
    case 'daily':
      return amount * 30; // Approximate days in a month
    case 'weekly':
      return amount * 4.345; // More accurate average weeks in a month (52.14 weeks per year / 12 months)
    case 'biweekly':
      return amount * 2.17; // Average bi-weekly periods in a month
    case 'monthly':
      return amount;
    case 'quarterly':
      return amount / 3;
    case 'annually':
      return amount / 12;
    default:
      return amount;
  }
}

// Helper function to calculate annual equivalent amount based on frequency
export function calculateAnnualAmount(amount, frequency) {
  switch (frequency) {
    case 'daily':
      return amount * 365;
    case 'weekly':
      return amount * 52;
    case 'biweekly':
      return amount * 26;
    case 'monthly':
      return amount * 12;
    case 'quarterly':
      return amount * 4;
    case 'annually':
      return amount;
    default:
      return amount * 12;
  }
} 