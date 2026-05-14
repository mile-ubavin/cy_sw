/**
 * Yopmail Page Object
 * 
 * Purpose: Handle email confirmation workflow for DH registration
 * Pattern: Page Object Model
 * AI-Generated: Based on existing E-gehaltszettel patterns
 */

import { yopmailSelectors as selectors } from '../selectors/dh-registration.selectors.js';

export class YopmailPage {
  
  /**
   * Visit Yopmail and access specific inbox
   * @param {string} email - Full email address (e.g., 'test@yopmail.com')
   */
  visitInbox(email) {
    // Extract username from email (before @)
    const username = email.split('@')[0];
    
    cy.visit('https://yopmail.com/en/');
    cy.wait(1500);
    
    cy.get(selectors.loginInput)
      .should('be.visible')
      .clear()
      .type(username);
    
    cy.get(selectors.refreshButton).click();
    cy.wait(2000);
    
    cy.log(`Opened Yopmail inbox for: ${email}`);
    return this;
  }

  /**
   * Verify registration email received
   * @param {string} expectedSubject - Expected email subject pattern
   */
  verifyRegistrationEmail(expectedSubject = /Neuer Benutzer.*DocuHub/i) {
    cy.iframe(selectors.inboxIframe)
      .find(selectors.emailSubject)
      .eq(0)
      .should('be.visible')
      .invoke('text')
      .should('match', expectedSubject);
    
    cy.log('Registration email verified in inbox');
    return this;
  }

  /**
   * Click on the first email to open it
   */
  openLatestEmail() {
    cy.iframe(selectors.inboxIframe)
      .find(selectors.emailSubject)
      .eq(0)
      .click();
    
    cy.wait(1500);
    cy.log('Opened latest email');
    return this;
  }

  /**
   * Extract credentials from email body
   * @returns {Cypress.Chainable} - Promise resolving to {username, password}
   */
  extractCredentials() {
    return cy.iframe(selectors.mailIframe)
      .find('p, div, td')
      .invoke('text')
      .then((emailBody) => {
        cy.log('Email Body:', emailBody);

        // Extract username and password using regex
        const usernameMatch = emailBody.match(/Benutzername:\s*([\S]+)|Username:\s*([\S]+)/i);
        const passwordMatch = emailBody.match(/Passwort:\s*([\S]+)|Password:\s*([\S]+)/i);

        const extractedUsername = usernameMatch ? (usernameMatch[1] || usernameMatch[2]).trim() : null;
        const extractedPassword = passwordMatch ? (passwordMatch[1] || passwordMatch[2]).trim() : null;

        if (!extractedUsername || !extractedPassword) {
          throw new Error('Could not extract credentials from email');
        }

        cy.log(`Extracted Username: ${extractedUsername}`);
        cy.log(`Extracted Password: ${extractedPassword}`);

        return { username: extractedUsername, password: extractedPassword };
      });
  }

  /**
   * Click confirmation/activation link in email
   */
  clickConfirmationLink() {
    cy.iframe(selectors.mailIframe)
      .find(selectors.confirmationLink)
      .first()
      .should('be.visible')
      .then(($link) => {
        const href = $link.attr('href');
        cy.log(`Confirmation link found: ${href}`);
        cy.visit(href);
      });
    
    cy.wait(2000);
    cy.log('Clicked confirmation link');
    return this;
  }

  /**
   * Verify specific text in email body
   * @param {string|RegExp} expectedText
   */
  verifyEmailContains(expectedText) {
    cy.iframe(selectors.mailIframe)
      .find('p, div, td')
      .invoke('text')
      .should('match', expectedText instanceof RegExp ? expectedText : new RegExp(expectedText, 'i'));
    
    cy.log(`Verified email contains: ${expectedText}`);
    return this;
  }

  /**
   * Complete full email confirmation workflow
   * @param {string} email - Email address to check
   * @returns {Cypress.Chainable} - Promise with extracted credentials
   */
  completeEmailConfirmation(email) {
    this.visitInbox(email);
    this.verifyRegistrationEmail();
    
    return this.extractCredentials();
  }
}

export default new YopmailPage();
