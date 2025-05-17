/// <reference types="cypress" />
/// <reference types="vitest" />
// @ts-check
import { describe, it } from 'vitest';

describe('Public Prediction Sharing & QR', () => {
  const sharedDocId = 'SHARED_DOC_ID';
  const unsharedDocId = 'UNSHARED_DOC_ID';
  const invalidDocId = 'INVALID_DOC_ID';

  it('shows public prediction with QR and export', () => {
    cy.clearCookies();
    cy.visit(`/prediction/${sharedDocId}`);
    cy.get('canvas').should('exist'); // QR code
    cy.contains('Export Prediction as PDF');
    cy.get('[data-testid="edit-controls"]').should('not.exist');
  });

  it('blocks when unshared', () => {
    cy.clearCookies();
    cy.visit(`/prediction/${unsharedDocId}`);
    cy.contains('not authorized');
  });

  it('shows not found for invalid docId', () => {
    cy.visit(`/prediction/${invalidDocId}`);
    cy.contains('not found');
  });
});
