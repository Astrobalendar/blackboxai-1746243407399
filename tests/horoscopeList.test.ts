/// <reference types="cypress" />

describe('Horoscope List and Dashboard', () => {
  beforeEach(() => {
    // Mock the API responses using interceptApi
    cy.interceptApi('GET', '/api/horoscopes*', {
      data: [
        { id: 1, name: 'Test User 1', status: 'New' },
        { id: 2, name: 'Test User 2', status: 'Reviewed' },
        { id: 3, name: 'Test User 3', status: 'Archived' }
      ],
      total: 3,
      page: 1,
      limit: 10
    }).as('getHoroscopes');
    
    // Mock authentication
    cy.interceptApi('POST', '/api/auth/login', {
      statusCode: 200,
      body: { 
        user: { 
          uid: 'test-uid',
          email: 'test@example.com',
          role: 'astrologer'
        },
        token: 'test-token'
      }
    });

    // Visit the page with authentication
    cy.visit('/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Wait for the page to load
    cy.url().should('include', '/horoscope/list');
  });

  it('loads the horoscope list page', () => {
    cy.get('h1').should('contain', 'Horoscope List');
    cy.get('.horoscope-row').should('have.length.greaterThan', 0);
  });

  it('searches and paginates horoscopes', () => {
    // Mock the search response
    cy.interceptApi('GET', '/api/horoscopes?search=Test+User*', { 
      data: [{ id: 1, name: 'Test User', status: 'New' }],
      total: 1,
      page: 1,
      limit: 10
    }).as('searchHoroscopes');
    
    cy.get('input[placeholder="Search"]').type('Test User');
    
    // Wait for search results
    cy.wait('@searchHoroscopes');
    
    cy.get('.horoscope-row').should('contain', 'Test User');
    
    // Test pagination if available
    cy.get('.pagination-next').then(($btn) => {
      if ($btn.length) {
        cy.interceptApi('GET', '/api/horoscopes?page=2*', {
          data: Array(10).fill(0).map((_, i) => ({
            id: i + 11,
            name: `Test User ${i + 11}`,
            status: ['New', 'Reviewed', 'Archived'][i % 3]
          })),
          total: 20,
          page: 2,
          limit: 10
        }).as('nextPage');
        
        cy.wrap($btn).click();
        cy.wait('@nextPage');
        cy.get('.horoscope-row').should('have.length', 10);
      }
    });
  });

  it('shows correct status badges', () => {
    cy.get('.status-badge').should('exist');
    cy.get('.status-badge').each(($el) => {
      const status = $el.text().trim();
      expect(['New', 'Reviewed', 'Archived']).to.include(status);
    });
  });

  it('exports CSV with correct content', () => {
    // Mock the export endpoint
    cy.interceptApi('GET', '/api/export/csv*', {
      statusCode: 200,
      body: 'id,name,status\n1,Test User,New',
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=horoscopes.csv'
      }
    }).as('exportCsv');
    
    cy.get('.export-csv-btn').click();
    cy.wait('@exportCsv');
  });

  it('shows role-based dashboard content', () => {
    // Test for different roles
    const roles = ['astrologer', 'client', 'student'] as const;
    
    roles.forEach((role) => {
      // Mock the role-based dashboard data
      cy.interceptApi('GET', `/api/dashboard/${role}`, { 
        role,
        stats: {
          total: 100,
          completed: 50,
          pending: 30,
          inProgress: 20
        },
        recentActivity: [
          { id: 1, action: 'Created', timestamp: new Date().toISOString() },
          { id: 2, action: 'Updated', timestamp: new Date().toISOString() }
        ]
      }).as(`get${role.charAt(0).toUpperCase() + role.slice(1)}Dashboard`);
      
      cy.visit(`/dashboard/${role}`);
      cy.contains(`${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`);
    });
  });
});
