describe('Open SEPA from deliveries page DATAPART E-Box', () => {
  it('Open SEPA from deliveries page', function () {
    // Login using custom command
    cy.loginToEgEboxAsStudent();

    // Check if the element to open user settings is visible
    cy.get('.mobile-chat-container>div>#joe-bubble-unread')
      .should('be.visible')
      .then(($btn) => {
        if ($btn.length > 0) {
          // Click on the element to open user settings

          cy.get('.mobile-chat-container>div>#joe-bubble-unread').click({
            force: true,
          });
          cy.get(
            '.fbots-chat-footer-main>.selectize-control>.selectize-input>input'
          )
            .click()
            .type('Sepa');
          cy.wait(1500);
          cy.get(
            '.single>.selectize-dropdown-content>.option>.highlight'
          ).click({
            force: true,
          });
          cy.wait(4500);
          cy.pause();
          cy.get('.joe-radio-list-btn > :nth-child(2)').click();
          //Open sepa in hs
          cy.wait(8500);
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
            .type(Cypress.env('bic'), { force: true });
          cy.get('input[formcontrolname="city2"]')
            .click({ force: true })
            .clear({ force: true })
            .type(Cypress.env('city2'), { force: true });
          cy.get('.mat-mdc-dialog-content').scrollTo('bottom');
          cy.wait(2000);

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
        } //end if
        //Logout
        cy.get(
          '.side-menu-section-desktop>.arrow-icon>button[aria-label="Benutzereinstellungen öffnen"]'
        ).click();
        cy.wait(3000);
        cy.get('.logout-title > a').click({ force: true });
        cy.url().should('include', Cypress.env('baseUrl')); // Validate URL
        cy.log('Test completed successfully.');
        cy.wait(2500);
      });
  }); //End IT
});
