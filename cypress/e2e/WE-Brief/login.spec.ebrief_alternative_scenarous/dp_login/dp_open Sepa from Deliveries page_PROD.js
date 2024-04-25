describe('Open SEPA from deliveries page DATAPART E-Box', () => {
  // Login and Logout
  it('Open SEPA from deliveries page', function () {
    cy.loginToEgEboxAsStudent();

    // Open SEPA from deliveries page
    cy.get('.sepa-payment-btn > #undefined > .mdc-button__label').click();
    cy.wait(2500);

    // Read data from datapart.json file
    cy.fixture('datapart.json').then((datapart) => {
      // Type data into input field
      cy.get('#mat-input-8[formcontrolname="accountOwner"]')
        .click({ force: true })
        .clear({ force: true })
        .type(datapart.accountOwner, { force: true });
      cy.get('#mat-input-9[formcontrolname="street"]')
        .click({ force: true })
        .clear({ force: true })
        .type(datapart.street, { force: true });
      cy.get('#mat-input-10[formcontrolname="houseNr"]')
        .click({ force: true })
        .clear({ force: true })
        .type(datapart.houseNr, { force: true });
      cy.get('#mat-input-11[formcontrolname="postalCode"]')
        .click({ force: true })
        .clear({ force: true })
        .type(datapart.postalCode, { force: true });
      //Scroll to bottom
      cy.get('.mat-mdc-dialog-content').scrollTo('bottom', { duration: 2000 });
      cy.get('#mat-input-12[formcontrolname="city"]')
        .click({ force: true })
        .clear({ force: true })
        .type(datapart.city, { force: true });
      cy.get('#mat-input-13[formcontrolname="iban"]')
        .click({ force: true })
        .clear({ force: true })
        .type(datapart.iban, { force: true });
      cy.get('#mat-input-14[formcontrolname="bic"]')
        .click({ force: true })
        .clear({ force: true })
        .type(datapart.bic, { force: true });
      cy.get('#mat-input-15[formcontrolname="city2"]')
        .click({ force: true })
        .clear({ force: true })
        .type(datapart.city2, { force: true });
      cy.get('.mat-mdc-dialog-content').scrollTo('bottom');
      cy.wait(2000);
    }); //end read data from json
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
    cy.url().should(
      'include',
      'https://datapart.post-business-solutions.at/pf.datapart/'
    ); // => true
  }); //End IT
});
