// cypress/support/e2e.js
// ensure `process.env` exists in the browser so ci-info won’t blow up
if (typeof process === 'undefined') {
    // eslint-disable-next-line no-undef
    window.process = { env: {} }
  }

  