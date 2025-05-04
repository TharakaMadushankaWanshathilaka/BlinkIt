/// <reference types="cypress" />

// Prevent application errors from failing tests
Cypress.on('uncaught:exception', () => false)

describe('Registration Scenarios', () => {
  const uniqueEmail = () => `user${Date.now()}1@example.com`
  const existingEmail = Cypress.env('adminEmail')  // assume this email already in DB
  const strongPassword = 'Strong@123'
  const weakPassword = 'Abc123'

  beforeEach(() => {
    // Desktop viewport so form is visible
    cy.viewport(1280, 720)
    cy.clearCookies()
    cy.clearLocalStorage()

    // Stub global fetches your app makes on mount
    const stubEmpty = { statusCode: 200, body: { success: true, error: false, message: '', data: [] } }
    cy.intercept('GET', '**/api/cart/get', stubEmpty)
    cy.intercept('GET', '**/api/address/get', stubEmpty)
    cy.intercept('GET', '**/api/order/order-list', stubEmpty)
    cy.intercept('GET', '**/api/category/get', stubEmpty)
    cy.intercept('GET', '**/api/subcategory/get', stubEmpty)
    cy.intercept('GET', '**/api/product/get', stubEmpty)

    // stub user-details as logged out
    cy.intercept('GET', '**/api/user/user-details', { statusCode: 200, body: { success: true, error: false, message: '', data: null } })

    // visit register page
    cy.visit('/register')
  })

  it('TC001 – register with all valid inputs', () => {
    const email = uniqueEmail()
    cy.intercept('POST', '**/api/user/register', {
      statusCode: 201,
      body: { success: true, error: false, message: 'Registration Successful' }
    }).as('postRegister')

    cy.get('#name').type('Test User')
    cy.get('#email').type(email)
    cy.get('#password').type(strongPassword)
    cy.get('#confirmPassword').type(strongPassword)
    cy.get('form').contains('Register').should('not.be.disabled').click()

    cy.wait('@postRegister')
    cy.contains('Registration Successful').should('be.visible')
    // ensure navigation to login
    cy.url().should('include', '/login')
  })

  it('TC002 – register with missing required fields', () => {
    // name blank
    cy.get('#email').type(uniqueEmail())
    cy.get('#password').type(strongPassword)
    cy.get('#confirmPassword').type(strongPassword)
    cy.get('form').contains('Register').should('be.disabled')
  })

  it('TC003 – register with invalid email format', () => {
    cy.get('#name').type('Test User')
    cy.get('#email').type('plainText')
    cy.get('#password').type(strongPassword)
    cy.get('#confirmPassword').type(strongPassword)
    cy.get('form').contains('Register').click()

    cy.get('#email').then($el => {
      expect($el[0].validationMessage)
        .to.include("include an '@' in the email address")
    })
  })

  it('TC004 – register with weak password', () => {
    cy.get('#name').type('Test User')
    cy.get('#email').type(uniqueEmail())
    cy.get('#password').type(weakPassword)
    cy.get('#confirmPassword').type(weakPassword)
    // inline error appears before submit
    cy.contains('Password must be at least 8 characters long').should('be.visible')
    cy.get('form').contains('Register').click()
    cy.contains('Please enter a stronger password.').should('be.visible')
  })

  it('TC005 – register with password mismatch', () => {
    cy.get('#name').type('Test User')
    cy.get('#email').type(uniqueEmail())
    cy.get('#password').type(strongPassword)
    cy.get('#confirmPassword').type(strongPassword + 'X')
    cy.get('form').contains('Register').click()
    cy.contains('Password and confirm password must be the same').should('be.visible')
  })

  it('TC006 – register with existing email', () => {
    cy.intercept('POST', '**/api/user/register', {
      statusCode: 400,
      body: { success: false, error: true, message: 'Already register email' }
    }).as('postRegisterExists')

    cy.get('#name').type('Test User')
    cy.get('#email').type(existingEmail)
    cy.get('#password').type(strongPassword)
    cy.get('#confirmPassword').type(strongPassword)
    cy.get('form').contains('Register').click()

    cy.wait('@postRegisterExists')
    cy.contains('Already register email').should('be.visible')
  })

  it('TC007 – toggle password visibility', () => {
    cy.get('#password').type(strongPassword)
    cy.get('form').find('svg').first().click()   // eye icon
    cy.get('#password').should('have.attr', 'type', 'text')
    cy.get('form').find('svg').first().click()
    cy.get('#password').should('have.attr', 'type', 'password')
  })
})
