///<reference types="cypress" />

describe('Login to DH using keycloak and upload-send delivery', () => {
  it.only('Login to DH using keycloak ', () => {
    // Visit AUT
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.url().should('include', Cypress.env('dh_baseUrl'));
    cy.wait(1500);

    // Remove Cookie dialog if present
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      } else {
        cy.log('Cookie bar not visible');
      }
    });
    cy.wait(1500);

    // Click Login button (first page)
    cy.get('button[id=":r0:"]').contains('Login').click();
    cy.wait(2000);

    // --- Keycloak Login ---
    cy.get('input[id="username"]').type(Cypress.env('email_supportViewAdmin'));
    cy.get('input[name="password"]').type(
      Cypress.env('password_supportViewAdmin')
    );

    // Intercept backend call after login
    cy.intercept('GET', '**/generalInfo').as('generalInfo');

    // Click Keycloak Login Button
    cy.get('button#kc-login').contains('Jetzt einloggen').click();

    // Wait & Assert response
    cy.wait('@generalInfo', { timeout: 15000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('Login successful, generalInfo loaded');
    });

    // Click on Personal Document Upload button
    cy.get('div[id="send-action-cards-grid"]>div>.css-1d9g5hj')

      .should('be.visible')
      .contains('Persönliches Dokument')
      .click();

    cy.wait(1500);
    cy.DHupload305Dictionary();

    //Check if button is disabled
    cy.get(
      '.e1vpwo7r2>button[aria-label="Weiter zum nächsten Schritt (wählen Sie ein Dictionary aus)"]'
    ).should('be.disabled');

    cy.wait(1500);

    //Select valeu from dropdown
    cy.get('div[role="combobox"]').click({ force: true });

    // --- PDF Dictionary/Serviceline values you want to select ---
    // One value:
    const desiredSelection = ['PDFTABDictionary-305'];

    // Or multiple values:
    // const desiredSelection = ['PDFTABDictionary-200', 'PDFTABDictionary-301', 'ServiceLine'];

    // --- Reusable dropdown selector ---
    const selectFromDropdown = (values) => {
      values.forEach((val) => {
        // Type value in search field
        cy.get('input[id="dropdown-searchfield-undefined"]')
          .clear()
          .type(val, { delay: 20 });

        // Click the matching element
        cy.get(`li[data-value="${val}"]`)
          .should('be.visible')
          .click({ force: true });

        cy.log(`Selected value from dropdown: ${val}`);
      });
    };

    // --- Usage ---
    // Call this inside your test after the upload step
    selectFromDropdown(desiredSelection);

    cy.intercept('POST', '**/checkDocumentProcessingStatus').as(
      'checkDocumentProcessingStatus'
    );

    cy.get('button[aria-label="Weiter zum nächsten Schritt"]')
      .should('be.enabled')
      .click();

    function waitUntilProcessingDone() {
      cy.wait('@checkDocumentProcessingStatus', { timeout: 15000 }).then(
        (interception) => {
          const body = interception.response.body;

          cy.log(`processingOver: ${body.processingOver}`);

          const isDone =
            body.processingOver === true || body.processingOver === 'true';

          if (isDone) {
            expect(isDone).to.eq(true); // ← final assertion FIXED
          } else {
            waitUntilProcessingDone(); // ← keep waiting
          }
        }
      );
    }

    waitUntilProcessingDone();
    cy.wait(2000);

    // Send delivery

    cy.intercept('POST', '**/sendDocuments').as('sendDocuments');

    cy.get('button[aria-label="Send documents"]').click();

    cy.wait('@sendDocuments', { timeout: 15000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('Login successful, generalInfo loaded');
    });
    cy.wait(2000);

    //Click on Fetig button
    cy.get('button>.css-1am57kc')
      .should('be.visible')
      .contains('Fertig')
      .click({ force: true });

    //Validate Home page url
    const baseUrl = Cypress.env('dh_baseUrl');
    cy.url().should('include', `${baseUrl}home`);
  }); //end it
});
