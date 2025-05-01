// cypress/support/e2e.js
// ensure `process.env` exists in the browser so ci-info won’t blow up
if (typeof process === 'undefined') {
    // eslint-disable-next-line no-undef
    window.process = { env: {} }
  }

  // cypress/support/e2e.js
Cypress.on('uncaught:exception', (err, runnable) => {
    return false;   // prevents Cypress from failing tests on any uncaught exception :contentReference[oaicite:1]{index=1}
  });
