describe('Sepa Invalid BIC', () => {
  // Login using custom command
  it('Open Sepa from Personal Data', function () {
    cy.loginToEgEboxAsStudent();

    //Open Sepa from Personal Data

    cy.get(
      '.side-menu-section-desktop>.arrow-icon>button[aria-label="Benutzereinstellungen öffnen"]'
    ).click();
    cy.wait(3000);
    cy.get('ul > [aria-label="Benutzereinstellungen öffnen"]').click();
    // Click on the element to scroll to it without ensuring it's scrollable
    cy.get('.custom-settings-datapart').click({ force: true });
    cy.scrollTo('bottom', { ensureScrollable: false, duration: 1000 });
    cy.wait(1500);
    //Open sepa in hs
    cy.get('#open-hybridsign').click();
    cy.wait(7500);
    // Read data from configuration file
    // Fill the sepa form
    cy.get('input[formcontrolname="accountOwner"]')
      .click({ force: true })
      .clear({ force: true })
      .type(Cypress.env('accountOwner'), { force: true });
    cy.get('input[formcontrolname="street"]')
      .click({ force: true })
      .clear({ force: true })
      .type(Cypress.env('street'), { force: true });
    cy.get('input[formcontrolname="houseNr"]')
      .click({ force: true })
      .clear({ force: true })
      .type(Cypress.env('houseNr'), { force: true });
    cy.get('input[formcontrolname="postalCode"]')
      .click({ force: true })
      .clear({ force: true })
      .type(Cypress.env('postalCode'), { force: true });
    //Scroll to bottom
    cy.get('.mat-mdc-dialog-content').scrollTo('bottom', {
      duration: 2000,
    });
    cy.get('input[formcontrolname="city"]')
      .click({ force: true })
      .clear({ force: true })
      .type(Cypress.env('city'), { force: true });
    cy.get('input[formcontrolname="iban"]')
      .click({ force: true })
      .clear({ force: true })
      .type(Cypress.env('iban'), { force: true });
    cy.get('input[formcontrolname="bic"]')
      .click({ force: true })
      .clear({ force: true })
      .type(Cypress.env('bic') + ' - INVALID BIC', { force: true }); // invalid BIC
    cy.get('input[formcontrolname="city2"]')
      .click({ force: true })
      .clear({ force: true })
      .type(Cypress.env('city2'), { force: true });
    cy.get('.mat-mdc-dialog-content').scrollTo('bottom');
    cy.wait(2000);

    //Submit SEPA form
    cy.get('.submit-button').click({ force: true });
    cy.wait(2500);
    cy.get(
      '.pdf-viewer-header>hslib-notifications-container>.error-notification>.notification-message'
    ).should(
      'include.text',
      ' Der eingegebene BIC ist ungültig. Bitte überprüfen Sie Ihre Eingabe. '
    );
    cy.log('Test completed successfully.');
    cy.wait(2500);
    //Logout
    cy.get(
      '.side-menu-section-desktop>.arrow-icon>button[aria-label="Benutzereinstellungen öffnen"]'
    ).click();
    cy.wait(3000);
    cy.get('.logout-title > a').click({ force: true });
    cy.url().should('include', Cypress.env('baseUrl')); // Validate URL
    cy.log('Test completed successfully.');
    cy.wait(2500);
  }); //End IT
});
