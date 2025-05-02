/// <reference types="cypress" />

// ── Prevent your app's uncaught exceptions from failing the tests ───────────
Cypress.on('uncaught:exception', () => false)

describe('Login Scenarios', () => {
  const userEmail     = Cypress.env('userEmail')
  const userPassword  = Cypress.env('userPassword')
  const adminEmail    = Cypress.env('adminEmail')
  const adminPassword = Cypress.env('adminPassword')

  beforeEach(() => {
    // ── run at a desktop‐sized viewport so the form’s Login button is visible ──
    cy.viewport(1280, 720)                                                 // :contentReference[oaicite:0]{index=0}

    cy.clearCookies()
    cy.clearLocalStorage()

    // ── Stub every global fetch your App makes on mount ──────────────────────
    const stubEmpty = { statusCode: 200, body: { success: true, error: false, message: '', data: [] } }
    cy.intercept('GET',  '**/api/cart/get',         stubEmpty).as('getCart')
    cy.intercept('GET',  '**/api/address/get',      stubEmpty).as('getAddress')
    cy.intercept('GET',  '**/api/order/order-list', stubEmpty).as('getOrders')
    cy.intercept('GET',  '**/api/category/get',     stubEmpty).as('getCategories')
    cy.intercept('POST', '**/api/subcategory/get',  stubEmpty).as('postSubcategories')  // :contentReference[oaicite:1]{index=1}
    cy.intercept('GET',  '**/api/product/get',      stubEmpty).as('getProducts')

    // ── Stub user‐details so response.data is never undefined ────────────────
    cy.intercept('GET', '**/api/user/user-details', {
      statusCode: 200,
      body: { success: true, error: false, message: '', data: null }
    }).as('getUserDetailsStub')

    // ── Now mount your login page ────────────────────────────────────────────
    cy.visit('/login')
  })

  it('TC001 – USER login with correct credential', () => {
    cy.intercept('POST', '**/api/user/login', {
      statusCode: 200,
      body: {
        success: true, error: false, message: 'Login successfully',
        data: { accesstoken: 'user-token', refreshToken: 'user-refresh' }
      }
    }).as('postLogin')

    cy.intercept('GET', '**/api/user/user-details', {
      statusCode: 200,
      body: { success: true, error: false, message: 'user details', data: { role: 'USER' } }
    }).as('getUserDetails')

    cy.get('#email').should('exist').type(userEmail)
    cy.get('#password').should('exist').type(userPassword)
    // scope to the form so we click the form’s Login button, not the hidden nav button
    cy.get('form').contains('Login').should('be.visible').click()           // :contentReference[oaicite:2]{index=2}

    cy.wait('@postLogin')
    cy.wait('@getUserDetails')

    cy.contains('Login successfully').should('be.visible')
    cy.url().should('eq', Cypress.config('baseUrl') + '/')

    // verify user cannot access admin‐only route
    cy.visit('/dashboard/category')
    cy.contains('Do not have permission').should('be.visible')
  })

  it('TC002 – valid email with incorrect password', () => {
    cy.intercept('POST', '**/api/user/login', {
      statusCode: 400, body: { success: false, error: true, message: 'Check your password' }
    }).as('postLoginFail')

    cy.get('#email').type(userEmail)
    cy.get('#password').type('wrongPassword')
    cy.get('form').contains('Login').click()

    cy.wait('@postLoginFail')
    cy.contains('Check your password').should('be.visible')
  })

  it('TC003 – invalid email with correct password', () => {
    cy.intercept('POST', '**/api/user/login', {
      statusCode: 400, body: { success: false, error: true, message: 'User not register' }
    }).as('postLoginNoUser')

    cy.get('#email').type('notregistered@example.com')
    cy.get('#password').type(userPassword)
    cy.get('form').contains('Login').click()

    cy.wait('@postLoginNoUser')
    cy.contains('User not register').should('be.visible')
  })

  it('TC004 – email as plain text (non-email format)', () => {
    cy.intercept('POST', '**/api/user/login').as('loginAttempt')

    cy.get('#email').type('plaintext')
    cy.get('#password').type('whatever123')
    cy.get('form').contains('Login').click()

    cy.get('#email').then($el => {
      expect($el[0].validationMessage)
        .to.equal("Please include an '@' in the email address. 'plaintext' is missing an '@'.")
    })

    cy.get('@loginAttempt.all').should('have.length', 0)
  })

  it('TC005 – ADMIN login with valid credential', () => {
    cy.intercept('POST', '**/api/user/login', {
      statusCode: 200,
      body: {
        success: true, error: false, message: 'Login successfully',
        data: { accesstoken: 'admin-token', refreshToken: 'admin-refresh' }
      }
    }).as('postLoginAdmin')

    cy.intercept('GET', '**/api/user/user-details', {
      statusCode: 200, body: { success: true, error: false, message: 'user details', data: { role: 'ADMIN' } }
    }).as('getAdminDetails')

    cy.get('#email').type(adminEmail)
    cy.get('#password').type(adminPassword)
    cy.get('form').contains('Login').should('be.visible').click()

    cy.wait('@postLoginAdmin')
    cy.wait('@getAdminDetails')

    cy.contains('Login successfully').should('be.visible')
    cy.url().should('eq', Cypress.config('baseUrl') + '/')

    // verify admin can access category management
    cy.visit('/dashboard/category')
    cy.contains('Do not have permission').should('not.exist')
  })
})
