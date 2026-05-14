/**
 * Page Object Model: DH Self-Registration Page
 * 
 * Purpose: Encapsulate registration form interactions
 * Pattern: Page Object Model with method chaining
 * AI-Generated: Based on DH HTML structure
 */

import { registrationSelectors as selectors } from '../selectors/dh-registration.selectors.js';

export class RegistrationPage {
  
  /**
   * Visit the registration page
   */
  visit() {
    cy.visit(Cypress.env('dh_baseUrl') + '/register');
    this.removeCookieBanner();
    return this;
  }

  /**
   * Remove cookie banner if present
   */
  removeCookieBanner() {
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-accept-btn-handler').length > 0) {
        cy.get('#onetrust-accept-btn-handler').click();
        cy.wait(500);
      }
    });
    return this;
  }

  /**
   * Fill company data section
   * @param {Object} companyData - {companyName, uidNumber}
   */
  fillCompanyData(companyData) {
    cy.get(selectors.companyData.companyName)
      .should('be.visible')
      .clear()
      .type(companyData.companyName);
    
    cy.get(selectors.companyData.uidNumber)
      .clear()
      .type(companyData.uidNumber);
    
    cy.log(`Company Data filled: ${companyData.companyName}`);
    return this;
  }

  /**
   * Fill address section
   * @param {Object} address - {street, doorNumber, postalCode, city}
   */
  fillAddress(address) {
    cy.get(selectors.address.street)
      .should('be.visible')
      .clear()
      .type(address.street);
    
    cy.get(selectors.address.doorNumber)
      .clear()
      .type(address.doorNumber);
    
    cy.get(selectors.address.postalCode)
      .clear()
      .type(address.postalCode);
    
    cy.get(selectors.address.city)
      .clear()
      .type(address.city);
    
    cy.log(`Address filled: ${address.street} ${address.doorNumber}, ${address.postalCode} ${address.city}`);
    return this;
  }

  /**
   * Fill personal data section
   * @param {Object} personalData - {firstName, lastName}
   */
  fillPersonalData(personalData) {
    cy.get(selectors.personalData.firstName)
      .should('be.visible')
      .clear()
      .type(personalData.firstName);
    
    cy.get(selectors.personalData.lastName)
      .clear()
      .type(personalData.lastName);
    
    cy.log(`Personal Data filled: ${personalData.firstName} ${personalData.lastName}`);
    return this;
  }

  /**
   * Fill user data section (email & username)
   * @param {Object} userData - {email, username}
   */
  fillUserData(userData) {
    cy.get(selectors.userData.email)
      .should('be.visible')
      .clear()
      .type(userData.email);
    
    cy.get(selectors.userData.confirmEmail)
      .clear()
      .type(userData.email); // Same as email
    
    cy.get(selectors.userData.username)
      .clear()
      .type(userData.username);
    
    cy.log(`User Data filled: ${userData.email}, ${userData.username}`);
    return this;
  }

  /**
   * Fill password section
   * @param {string} password
   */
  fillPassword(password) {
    cy.get(selectors.password.password)
      .should('be.visible')
      .clear()
      .type(password);
    
    cy.get(selectors.password.confirmPassword)
      .clear()
      .type(password);
    
    cy.log('Password filled');
    return this;
  }

  /**
   * Verify password strength indicators
   */
  verifyPasswordStrength() {
    cy.get(selectors.password.strengthIndicator)
      .should('be.visible')
      .within(() => {
        // All indicators should show green checkmarks
        cy.get('svg.MuiSvgIcon-colorSuccess').should('have.length', 5);
      });
    
    cy.log('Password strength validated');
    return this;
  }

  /**
   * Accept terms and conditions
   */
  acceptTerms() {
    cy.get(selectors.terms.checkbox)
      .should('not.be.checked')
      .check({ force: true })
      .should('be.checked');
    
    cy.log('Terms accepted');
    return this;
  }

  /**
   * Handle captcha (if present)
   * Note: Friendly Captcha auto-solves for legitimate users
   */
  handleCaptcha() {
    cy.get('body').then(($body) => {
      if ($body.find(selectors.captcha.restartButton).is(':visible')) {
        cy.get(selectors.captcha.restartButton).click();
        cy.wait(3000); // Wait for captcha to solve
      }
    });
    
    cy.log('Captcha handled');
    return this;
  }

  /**
   * Submit the registration form
   */
  submit() {
    cy.get(selectors.submitButton)
      .should('be.visible')
      .should('not.be.disabled')
      .click();
    
    cy.log('Registration form submitted');
    return this;
  }

  /**
   * Verify success message
   * @param {string} expectedMessage - Expected success message pattern
   */
  verifySuccessMessage(expectedMessage = /erfolgreich|success/i) {
    cy.get(selectors.snackbar, { timeout: 10000 })
      .should('be.visible')
      .invoke('text')
      .should('match', expectedMessage);
    
    cy.log('Success message verified');
    return this;
  }

  /**
   * Complete full registration flow
   * @param {Object} registrationData - Complete registration data
   */
  completeRegistration(registrationData) {
    this.fillCompanyData(registrationData.company);
    this.fillAddress(registrationData.address);
    this.fillPersonalData(registrationData.personal);
    this.fillUserData(registrationData.user);
    this.fillPassword(registrationData.password);
    this.verifyPasswordStrength();
    this.acceptTerms();
    this.handleCaptcha();
    this.submit();
    
    cy.log('Full registration completed');
    return this;
  }
}

export default new RegistrationPage();
