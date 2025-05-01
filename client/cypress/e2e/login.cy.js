/// <reference types="cypress" />

describe('Login Scenarios', () => {
  const userEmail = Cypress.env('userEmail');
  const userPassword = Cypress.env('userPassword');
  const adminEmail = Cypress.env('adminEmail');
  const adminPassword = Cypress.env('adminPassword');

  beforeEach(() => {
    // ── stub the API calls your App makes on mount ─────────────────────────
    cy.intercept('GET', '**/api/product/get', {
      statusCode: 200,
      body: { success: true, error: false, message: '', data: [] }
    }).as('getProducts');

    cy.intercept('GET', '**/api/subcategory/get', {
      statusCode: 200,
      body: { success: true, error: false, message: '', data: [] }
    }).as('getSubcategories');

    // stub login page assets
    cy.visit('/login');
  });

  afterEach(() => {
    // clear auth state between tests
    cy.clearCookies();
    cy.clearLocalStorage();
    // optional explicit logout request if your app persists sessions server-side
    // cy.request('POST', '/api/user/logout');
  });

  it('TC001 – USER login with correct credential', () => {
    cy.intercept('POST', '**/api/user/login', { statusCode: 200, body: { success: true, error: false, message: 'Login successfully', data: { accesstoken: 'user-token', refreshToken: 'user-refresh' } } }).as('postLogin');
    cy.intercept('GET', '**/api/user/user-details', { statusCode: 200, body: { success: true, error: false, message: 'user details', data: { role: 'USER' } } }).as('getUserDetails');

    cy.get('#email').type(userEmail);
    cy.get('#password').type(userPassword);
    cy.get('button[type=submit]').click();

    cy.wait('@postLogin');
    cy.wait('@getUserDetails');

    cy.contains('Login successfully').should('be.visible');
    cy.url().should('eq', Cypress.config('baseUrl') + '/');

    // verify user cannot access admin-only routes
    cy.visit('/dashboard/category');
    cy.contains('Do not have permission').should('be.visible');
  });

  it('TC002 – valid email with incorrect password', () => {
    cy.intercept('POST', '**/api/user/login', { statusCode: 400, body: { success: false, error: true, message: 'Check your password' } }).as('postLoginFail');

    cy.get('#email').type(userEmail);
    cy.get('#password').type('wrongPassword');
    cy.get('button[type=submit]').click();

    cy.wait('@postLoginFail');
    cy.contains('Check your password').should('be.visible');
  });

  it('TC003 – invalid email with correct password', () => {
    cy.intercept('POST', '**/api/user/login', { statusCode: 400, body: { success: false, error: true, message: 'User not register' } }).as('postLoginNoUser');

    cy.get('#email').type('notregistered@example.com');
    cy.get('#password').type(userPassword);
    cy.get('button[type=submit]').click();

    cy.wait('@postLoginNoUser');
    cy.contains('User not register').should('be.visible');
  });

  it('TC004 – email as plain text (non-email format)', () => {
    cy.intercept('POST', '**/api/user/login').as('loginAttempt');

    cy.get('#email').type('plaintext');
    cy.get('#password').type('whatever123');
    cy.get('button[type=submit]').click();

    cy.get('#email').then($el => {
      expect($el[0].validationMessage).to.equal("Please include an '@' in the email address. 'plaintext' is missing an '@'.");
    });

    cy.get('@loginAttempt.all').should('have.length', 0);
  });

  it('TC005 – ADMIN login with valid credential', () => {
    // stub admin login
    cy.intercept('POST', '**/api/user/login', { statusCode: 200, body: { success: true, error: false, message: 'Login successfully', data: { accesstoken: 'admin-token', refreshToken: 'admin-refresh' } } }).as('postLoginAdmin');
    cy.intercept('GET', '**/api/user/user-details', { statusCode: 200, body: { success: true, error: false, message: 'user details', data: { role: 'ADMIN' } } }).as('getAdminDetails');

    cy.get('#email').type(adminEmail);
    cy.get('#password').type(adminPassword);
    cy.get('button[type=submit]').click();

    cy.wait('@postLoginAdmin');
    cy.wait('@getAdminDetails');

    cy.contains('Login successfully').should('be.visible');
    cy.url().should('eq', Cypress.config('baseUrl') + '/');

    // verify admin can perform category endpoints
    cy.intercept('POST', '**/api/category/add-category', { statusCode: 200, body: { success: true, data: {} } }).as('addCategory');
    cy.intercept('PUT', '**/api/category/update/**', { statusCode: 200, body: { success: true, data: {} } }).as('updateCategory');
    cy.intercept('DELETE', '**/api/category/delete/**', { statusCode: 200, body: { success: true, data: {} } }).as('deleteCategory');

    cy.visit('/dashboard/category');
    // e.g. click add, update, delete buttons and wait for stubs
    // cy.get('[data-cy=add]').click(); cy.wait('@addCategory');
    cy.contains('Do not have permission').should('not.exist');
  });
});
