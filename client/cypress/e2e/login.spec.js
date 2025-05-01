/// <reference types="cypress" />

describe('Login Functionality Tests', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.clearCookies();
      cy.clearLocalStorage();
    });

    // Test Case 1: Valid USER Login
    it('TC001: Valid USER Login', () => {
      cy.get('input[name=email]').type(Cypress.env('userEmail'));
      cy.get('input[name=password]').type(Cypress.env('userPassword'));
      cy.get('button[type=submit]').click();

      // Check toast and redirection
      cy.contains('Login successfully', { matchCase: false }).should('exist');
      cy.url().should('eq', 'http://localhost:3000/');

      // Check if user role is USER
      cy.window().its('store').invoke('getState').then((state) => {
        expect(state.user.role).to.equal('USER');
      });

      // USER should be blocked from admin routes
      cy.visit('/dashboard/category');
      cy.contains('Do not have permission').should('exist');
    });

    // Test Case 2: Valid Email, Wrong Password
    it('TC002: Invalid Password', () => {
      cy.get('input[name=email]').type(Cypress.env('userEmail'));
      cy.get('input[name=password]').type('wrongpassword');
      cy.get('button[type=submit]').click();

      cy.contains('Check your password').should('exist');
    });

    // Test Case 3: Invalid Email, Correct Password
    it('TC003: Unregistered Email', () => {
      cy.get('input[name=email]').type('invalid@email.com');
      cy.get('input[name=password]').type(Cypress.env('userPassword'));
      cy.get('button[type=submit]').click();

      cy.contains('User not register').should('exist');
    });

    // Test Case 4: Email Format Validation
    it('TC004: Invalid Email Format', () => {
      cy.get('input[name=email]').type('invalidemail');
      cy.get('input[name=email]').then(($input) => {
        expect($input[0].checkValidity()).to.be.false;
      });
    });

    // Test Case 5: Valid ADMIN Login
    it('TC005: Valid ADMIN Login', () => {
      cy.get('input[name=email]').type(Cypress.env('adminEmail'));
      cy.get('input[name=password]').type(Cypress.env('adminPassword'));
      cy.get('button[type=submit]').click();

      cy.contains('Login successfully', { matchCase: false }).should('exist');

      // ADMIN should be able to access admin route
      cy.visit('/dashboard/category');
      cy.contains('Do not have permission').should('not.exist');

      cy.window().its('store').invoke('getState').then((state) => {
        expect(state.user.role).to.equal('ADMIN');
      });
    });
  });
