/// <reference types="cypress" />

describe('Basic Smoke Tests', () => {
  beforeEach(() => {
    // Mock the API responses
    cy.intercept('GET', '/api/auth/session', { statusCode: 200, body: { user: null } });
  });

  it('successfully loads the home page', () => {
    cy.visit('/');
    cy.get('h1').should('contain', 'Welcome to Astrobalendar');
  });

  it('can navigate to login page', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('button[type="submit"]').should('contain', 'Sign In');
  });

  it('shows error on invalid login', () => {
    // Mock the login API response
    cy.intercept('POST', '/api/auth/callback/credentials', {
      statusCode: 401,
      body: { error: 'Invalid credentials' }
    });

    cy.visit('/login');
    cy.get('input[name="email"]').type('invalid@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Check for error message
    cy.get('[data-testid="error-message"]').should('be.visible');
  });

  it('can navigate to signup page', () => {
    cy.visit('/signup');
    cy.get('input[name="fullName"]').should('exist');
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('button[type="submit"]').should('contain', 'Create Account');
  });
});
