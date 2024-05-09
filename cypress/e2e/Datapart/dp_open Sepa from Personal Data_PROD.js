describe('Open Sepa from Personal Datao DATAPART E-Box', () => {
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
    cy.wait(2500);
    // Read data from datapart.json file
    cy.fixture('datapart.json').then((datapart) => {
      // Fill the sepa form

      cy.get('input[formcontrolname="accountOwner"]')
        .click({ force: true })
        .clear({ force: true })
        .type(datapart.accountOwner, { force: true });
      cy.get('input[formcontrolname="street"]')
        .click({ force: true })
        .clear({ force: true })
        .type(datapart.street, { force: true });
      cy.get('input[formcontrolname="houseNr"]')
        .click({ force: true })
        .clear({ force: true })
        .type(datapart.houseNr, { force: true });
      cy.get('input[formcontrolname="postalCode"]')
        .click({ force: true })
        .clear({ force: true })
        .type(datapart.postalCode, { force: true });
      //Scroll to bottom
      cy.get('.mat-mdc-dialog-content').scrollTo('bottom', { duration: 2000 });
      cy.get('input[formcontrolname="city"]')
        .click({ force: true })
        .clear({ force: true })
        .type(datapart.city, { force: true });
      cy.get('input[formcontrolname="iban"]')
        .click({ force: true })
        .clear({ force: true })
        .type(datapart.iban, { force: true });
      cy.get('input[formcontrolname="bic"]')
        .click({ force: true })
        .clear({ force: true })
        .type(datapart.bic, { force: true });
      cy.get('input[formcontrolname="city2"]')
        .click({ force: true })
        .clear({ force: true })
        .type(datapart.city2, { force: true });
      cy.get('.mat-mdc-dialog-content').scrollTo('bottom');
      cy.wait(2000);
    }); //end - Fill the sepa form

    //Submit SEPA form
    cy.get('.submit-button').click({ force: true });
    cy.wait(2500);
    //Sign Sepa using Touch Signature
    cy.get('.touch-signature-button > .mdc-button__label').click({
      force: true,
    });
    cy.get('.sign-canvas')
      .then((res) => console.log(res[0].getBoundingClientRect()))
      .trigger('mouseover')
      .trigger('mousedown', { which: 1, eventConstructor: 'MouseEvent' })
      .trigger('mousemove', {
        which: 1,
        screenX: 410,
        screenY: 530,
        clientX: 530,
        clientY: 560,
        pageX: 500,
        pageY: 600,
        eventConstructor: 'MouseEvent',
      });

    cy.get('.sign-canvas').trigger('mouseup', { force: true });
    cy.wait(2000);
    cy.get(
      '.mat-sign-actions-desktop > .mat-accent > .mat-mdc-button-touch-target'
    ).click({ force: true });

    cy.get('.success-notification>.notification-message')
      .should('be.visible')
      .should('have.text', ' Signatur wurde erfolgreich erstellt. ');
    cy.wait(2000);
    //Cancel saving Sepa
    cy.get('.exit > .mdc-button__label').click();
    cy.wait(2000);
    //Confirm Cancel dialog
    cy.get(
      '.mdc-dialog__container>.mat-mdc-dialog-surface>.mat-mdc-dialog-component-host>.mat-mdc-dialog-actions>.mat-accent'
    ).click({ force: true });

    //Logout
    cy.get(
      '.side-menu-section-desktop>.arrow-icon>button[aria-label="Benutzereinstellungen öffnen"]'
    ).click();
    cy.wait(3000);
    cy.get('.logout-title > a').click({ force: true });
    cy.fixture('datapart.json').as('datapart');
    cy.get('@datapart').then((datapartJson) => {
      cy.visit(datapartJson.baseUrl); //Taken from base url
      cy.url().should('include', datapartJson.baseUrl); //Validating url on the login page
    });
  }); //End IT
});
