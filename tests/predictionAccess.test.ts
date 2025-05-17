/// <reference types="cypress" />
/// <reference types="vitest" />
import { describe, it } from 'vitest';

describe('Prediction View Access Control', () => {
  const sharedDocId = 'SHARED_DOC_ID';
  const unsharedDocId = 'UNSHARED_DOC_ID';
  const invalidDocId = 'INVALID_DOC_ID';

  it('shows editable controls for astrologer', () => {
    cy.loginAs('astrologer'); // custom command
    cy.visit(`/prediction/${sharedDocId}`);
    cy.get('[data-testid="edit-controls"]').should('exist');
    cy.get('[data-testid="feedback-tools"]').should('exist');
  });

  it('shows read-only for client (shared)', () => {
    cy.loginAs('client');
    cy.visit(`/prediction/${sharedDocId}`);
    cy.get('[data-testid="edit-controls"]').should('not.exist');
    cy.get('[data-testid="feedback-tools"]').should('not.exist');
  });

  it('shows public view for anonymous (shared)', () => {
    cy.clearCookies();
    cy.visit(`/prediction/${sharedDocId}`);
    cy.get('canvas').should('exist'); // QR code
    cy.contains('Export Prediction as PDF');
    cy.get('[data-testid="edit-controls"]').should('not.exist');
  });

  it('blocks anonymous (unshared)', () => {
    cy.clearCookies();
    cy.visit(`/prediction/${unsharedDocId}`);
    cy.contains('not authorized');
  });

  it('shows not found for invalid docId', () => {
    cy.visit(`/prediction/${invalidDocId}`);
    cy.contains('not found');
  });
});
