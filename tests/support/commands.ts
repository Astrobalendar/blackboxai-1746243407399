// ***********************************************
// Custom Cypress Commands with TypeScript Support
// ***********************************************

/// <reference types="cypress" />

// Type definitions for API response structure
interface ApiResponse<T = any> {
  statusCode?: number;
  data?: T;
  message?: string;
  error?: string;
  [key: string]: any;
}

// User role types
type UserRole = 'admin' | 'astrologer' | 'client' | 'student';

// User data interface
interface UserData {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  [key: string]: any;
}

// Extend Cypress Chainable interface
declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      /**
       * Login as a specific user role
       * @example cy.loginAs('admin')
       */
      loginAs(role: UserRole): Chainable<{ user: UserData; token: string }>;
      
      /**
       * Intercept API calls with a mock response
       * @example cy.interceptApi('GET', '/api/users', { users: [] })
       * @example cy.interceptApi('GET', '/api/users', { users: [] }, 'getUsers')
       */
      interceptApi<T = Record<string, any>>(
        method: string, 
        url: string, 
        response: T,
        alias?: string | {
          statusCode?: number;
          delay?: number;
          alias?: string;
        },
        options?: {
          statusCode?: number;
          delay?: number;
        }
      ): Chainable<null>;
    }
  }
  
  // Extend Window interface for type safety in tests
  interface Window {
    Cypress?: any;
    localStorage: Storage;
    sessionStorage: Storage;
  }
}

// Custom command implementations
const loginAs = (role: UserRole): Cypress.Chainable<{ user: UserData; token: string }> => {
  const user: UserData = {
    id: `test-${role}-id`,
    email: `${role}@example.com`,
    role,
    name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`
  };

  const response = {
    user,
    token: `test-token-${role}-${Date.now()}`
  };

  // Mock the login API response
  cy.intercept('POST', '/api/auth/callback/credentials', {
    statusCode: 200,
    body: response
  }).as('loginRequest');

  // Visit login page and submit form
  cy.visit('/login');
  cy.get('input[name="email"]').clear().type(user.email);
  cy.get('input[name="password"]').clear().type('testpassword');
  cy.get('button[type="submit"]').click();

  // Wait for login to complete and return the response
  return cy.wait('@loginRequest').then(() => response);
};

const interceptApi = <T = Record<string, any>>(
  method: string,
  url: string,
  response: T,
  aliasOrOptions?: string | {
    statusCode?: number;
    delay?: number;
    alias?: string;
  },
  options: {
    statusCode?: number;
    delay?: number;
  } = {}
): Cypress.Chainable<null> => {
  // Handle different parameter patterns
  let alias: string;
  let statusCode = 200;
  let delay = 0;

  if (typeof aliasOrOptions === 'string') {
    alias = aliasOrOptions;
  } else if (aliasOrOptions) {
    alias = aliasOrOptions.alias || `intercepted-${method}-${url.replace(/[^a-z0-9]/gi, '-')}`;
    statusCode = aliasOrOptions.statusCode ?? statusCode;
    delay = aliasOrOptions.delay ?? delay;
  } else {
    alias = `intercepted-${method}-${url.replace(/[^a-z0-9]/gi, '-')}`;
  }

  // Apply options overrides if provided
  statusCode = options.statusCode ?? statusCode;
  delay = options.delay ?? delay;

  // Set up the intercept with proper typing
  cy.intercept(
    {
      method: method.toUpperCase(),
      url: new RegExp(`^${url.replace(/\//g, '\\/').replace(/\*/g, '.*')}$`),
    },
    (req) => {
      req.reply({
        statusCode,
        body: response,
        delay,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  ).as(alias);

  return cy.wrap(null);
};

// Register commands with proper TypeScript support
Cypress.Commands.add('loginAs', loginAs);

// Register interceptApi with explicit type assertion to handle the complex signature
Cypress.Commands.add(
  'interceptApi',
  <T = Record<string, any>>(
    method: string,
    url: string,
    response: T,
    aliasOrOptions?: string | { statusCode?: number; delay?: number; alias?: string },
    options?: { statusCode?: number; delay?: number }
  ) => {
    return interceptApi(method, url, response, aliasOrOptions, options);
  }
);

// Export types for use in test files
export type { ApiResponse, UserData, UserRole };

// This file needs to be a module
export {};
