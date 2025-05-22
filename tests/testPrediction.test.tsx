/// <reference types="cypress" />

describe('Test Prediction Generator', () => {
  beforeEach(() => {
    // Set up any test data or mocks here if needed
  });

  it('generates and displays a test prediction', () => {
    // Mock the successful API response
    cy.interceptApi('POST', '/api/prediction', {
      status: 'success',
      data: {
        prediction: 'This is a test prediction',
        id: 'test-prediction-123'
      }
    });
    
    cy.visit('/TestPrediction');
    cy.contains('Generate Test Prediction').click();
    cy.contains('Test Prediction Result');
  });

  it('shows error on failure', () => {
    // Mock the failed API response
    cy.interceptApi('POST', '/api/prediction', {
      statusCode: 500,
      body: { error: 'Failed to generate prediction' }
    });
    
    cy.visit('/TestPrediction');
    cy.contains('Generate Test Prediction').click();
    cy.contains('Failed to generate test prediction');
  });
});
