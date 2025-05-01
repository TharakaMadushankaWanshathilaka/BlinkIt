/// <reference types="cypress" />

describe('Login Functionality Tests', () => {

  beforeEach(() => {
    cy.visit('/login');
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  // 1. USER login with correct credentials
  it('TC001: USER Login with correct credentials', () => {
    cy.get('input[name=email]').type(Cypress.env('userEmail'));
    cy.get('input[name=password]').type(Cypress.env('userPassword'));
    cy.get('button[type=submit]').click();

    cy.contains('Login successfully', { matchCase: false }).should('exist');
    cy.url().should('eq', 'http://localhost:3000/');

    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.user.role).to.equal('USER');
    });

    cy.visit('/dashboard/category');
    cy.contains('Do not have permission').should('exist');
  });

  // 2. Valid email + Invalid password
  it('TC002: USER Login with wrong password', () => {
    cy.get('input[name=email]').type(Cypress.env('userEmail'));
    cy.get('input[name=password]').type('wrongpassword');
    cy.get('button[type=submit]').click();

    cy.contains('Check your password').should('exist');
  });

  // 3. Invalid email + Correct password
  it('TC003: USER Login with unregistered email', () => {
    cy.get('input[name=email]').type('invalid@email.com');
    cy.get('input[name=password]').type(Cypress.env('userPassword'));
    cy.get('button[type=submit]').click();

    cy.contains('User not register').should('exist');
  });

  // 4. Invalid email format (frontend only)
  it('TC004: Email input with invalid format', () => {
    cy.get('input[name=email]').type('invalidemail');
    cy.get('input[name=email]').then(($input) => {
      expect($input[0].checkValidity()).to.be.false;
    });
  });

  // 5. ADMIN login with correct credentials
  it('TC005: ADMIN Login with correct credentials', () => {
    cy.get('input[name=email]').type(Cypress.env('adminEmail'));
    cy.get('input[name=password]').type(Cypress.env('adminPassword'));
    cy.get('button[type=submit]').click();

    cy.contains('Login successfully', { matchCase: false }).should('exist');
    cy.url().should('eq', 'http://localhost:3000/');

    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.user.role).to.equal('ADMIN');
    });

    cy.visit('/dashboard/category');
    cy.contains('Do not have permission').should('not.exist');
  });
});
