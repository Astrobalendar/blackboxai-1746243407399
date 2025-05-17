// ***********************************************************
// This file contains global test setup and custom commands
// ***********************************************************

// Import custom commands and type definitions
import './commands';
import './index.d.ts';

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Log the error but don't fail the test
  console.error('Uncaught exception:', err);
  return false;
});

// Global test setup
beforeEach(() => {
  // Reset mocks and clear local storage between tests
  cy.window().then((win: Window) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
  
  // Reset any test-specific state
  cy.clearCookies();
  
  // Set default intercepts for common API calls
  cy.intercept('GET', '/api/auth/session', { statusCode: 200, body: { user: null } });
  
  // Clear any remaining local storage
  cy.clearLocalStorage();
  
  // Ensure session storage is cleared
  cy.window().then((win: Window) => {
    win.sessionStorage.clear();
  });
});
