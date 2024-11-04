/// <reference types="cypress" />
describe('Login/Logout to ebrief base scenario', () => {
  //Login via Kiam, Logout
  /// <reference types="Cypress" />
  describe('Login/Logout to ebrief base scenario', () => {
    it('Login, Logout', function () {
      // Visit the e-brief website
      cy.visit('https://www.e-brief.at/fe_t');
      cy.url().should('include', 'fe_t'); // Validate URL contains 'fe_t'

      // Check if the login button is visible and enabled
      cy.get('button[type="submit"]').should('be.visible').and('be.enabled');
      cy.contains('Jetzt Anmelden').click(); // Click 'Jetzt Anmelden' button

      // Validate redirection to Kiam login page
      cy.url().should('include', 'https://kiamabn.b2clogin.com/');

      // User credentials
      const username_kiam = 'kiam.t.mile@yopmail.com';
      const password_kiam = 'Test1234!';

      // Fill in the login form
      cy.get('#signInName').type(username_kiam);
      cy.get('#password').type(password_kiam);
      cy.get('#showPassword').click(); // Optionally show/hide password

      // Submit login form
      cy.get('#next').click();

      // Validate that the user is redirected to the deliveries page after login
      cy.url().should('include', '/deliveries');

      // Wait for the page to fully load
      cy.get('.user-title').should('be.visible');

      // Logout process
      cy.get('.user-title').click(); // Click on user title to open dropdown
      cy.get('[color="primary-reverse"] > .button').click(); // Click on Logout button

      // Validate redirection back to the login page
      cy.url().should('include', '/fe_t');

      // Log success
      cy.log('Test completed successfully.');
    });
  });
});
