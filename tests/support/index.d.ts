/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      /**
       * Login as a specific user role
       * @example cy.loginAs('admin')
       */
      loginAs(role: 'admin' | 'astrologer' | 'client' | 'student'): Chainable<void>;
      
      /**
       * Intercept API calls with a mock response
       * @example cy.interceptApi('GET', '/api/users', { users: [] })
       */
      interceptApi(
        method: string, 
        url: string, 
        response: any, 
        alias?: string
      ): Chainable<null>;
    }
  }
}

export {}; // This file needs to be a module
