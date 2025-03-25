# FinanceManager - Dev Guidelines

## Build and Test Commands
- `npm start` - Start development server
- `npm run build` - Create production build
- `npm test` - Run all tests
- `npm test -- -t "test name"` - Run specific test
- `npm run lint` - Run ESLint (add this command to package.json)

## Coding Style

### Imports/Structure
- React imports first, then third-party libraries, then local imports
- Group CSS imports last
- Use named imports over default where possible

### Naming Conventions
- Components: PascalCase (ExpenseForm)
- Functions/Variables: camelCase (handleSubmit)
- Constants: UPPER_SNAKE_CASE (EXPENSE_CATEGORIES)
- Files: Component files match component name

### React Guidelines
- Use functional components with hooks
- Props destructuring in function parameters
- Group state declarations at the top of component
- JSDoc comments for utility functions

### Error Handling
- Use try/catch for async operations
- Provide meaningful error messages
- Avoid silent failures, log errors to console

### Formatting
- Use 2-space indentation
- Single quotes for strings
- Semicolons required
- Maximum line length: 100 characters