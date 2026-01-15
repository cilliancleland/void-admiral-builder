# Testing Documentation

This document outlines the testing strategy and test coverage for the Army Builder application.

## Test Setup

The application uses **Vitest** as the test runner with **React Testing Library** for component testing.

### Installation
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Configuration
- **Vite config**: `vite.config.ts` includes vitest configuration
- **Setup file**: `src/test/setup.ts` configures jest-dom matchers
- **Package scripts**:
  - `npm test` - Run tests in watch mode
  - `npm run test:run` - Run tests once
  - `npm run test:ui` - Run tests with UI
  - `npm run test:coverage` - Run tests with coverage

## Test Categories

### 1. Component Unit Tests
- **ShipCard.test.tsx**: Tests individual ship card rendering and interactions
- **ArmyList.test.tsx**: Tests army list display and ship removal functionality

### 2. Integration Tests
- **App.test.tsx**: Tests full application flow including faction selection, ship addition, and squadron cost calculations

## Test Coverage

### Component Tests
- ✅ Ship information display (size, points, hull, speed, shields, flak)
- ✅ User interactions (button clicks, form selections)
- ✅ Component rendering with different props
- ✅ Error states and loading states

### Business Logic Tests
- ✅ Squadron cost multiplier (3x cost)
- ✅ Squadron weapon multiplier (3x weapon selections)
- ✅ Army sorting by points (descending)
- ✅ Points calculation and total tracking

### Integration Tests
- ✅ Data fetching from JSON files
- ✅ Faction selection workflow
- ✅ Ship addition to army
- ✅ End-to-end army building flow

## Test Structure

```
src/
├── components/
│   ├── ShipCard.test.tsx
│   ├── ArmyList.test.tsx
│   └── ...
├── App.test.tsx
└── test/
    ├── setup.ts
    └── README.md
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Test Best Practices

1. **Use descriptive test names** that explain what behavior is being tested
2. **Test user interactions** rather than implementation details
3. **Mock external dependencies** (API calls, data fetching)
4. **Test edge cases** (empty states, error conditions)
5. **Use appropriate queries** (getByRole, getByText, etc.)
6. **Keep tests independent** and isolated

## Future Test Additions

- **E2E Tests**: Using Playwright or Cypress for full user workflows
- **Visual Regression Tests**: Using tools like Chromatic or Percy
- **Performance Tests**: Testing component render performance
- **Accessibility Tests**: Ensuring WCAG compliance
- **Cross-browser Tests**: Testing in different browsers