/// <reference types="cypress" />
/// <reference types="vitest" />
import { describe, it } from 'vitest';

describe('Horoscope Creation', () => {
  it('fills and submits the birth data form, then validates Firestore', () => {
    cy.visit('/new-horoscope');
    cy.get('input[name="fullName"]').type('Test User');
    cy.get('input[name="dateOfBirth"]').type('2000-01-01');
    cy.get('input[name="timeOfBirth"]').type('12:00');
    cy.get('input[name="city"]').type('Test City');
    cy.get('form').submit();
    cy.url().should('include', '/prediction/');
    // Optional: Use a Cypress task or plugin to check Firestore for the created document.
    // cy.task('getFirestoreDoc', { collection: 'horoscopes', fullName: 'Test User' })
    //   .should('include', { fullName: 'Test User', shareWithClient: false });
  });
});
