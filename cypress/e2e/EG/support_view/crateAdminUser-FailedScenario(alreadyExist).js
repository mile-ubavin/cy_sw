describe('LoginAsAdminUser-CreateNewAdmin-Logout-BS', () => {
  //Login as Admin User to sw
  it(`login`, function () {
    cy.loginToSupportViewAdmin() //SupportView - using custom commands
      //Optional
      .wait(2000);
    cy.get(':nth-child(7) > .mdc-button > .mdc-button__label').click(); //Switch to Admin section
    cy.intercept(
      'POST',
      'https://supportviewpayslip.edeja.com/be/supportView/v1/person/editXUser'
    ).as('apiRequest');
    cy.get('.mdc-button__label').click(); //open Crete Admin User dialog

    // Access adminUser.json from the fixture folder
    cy.fixture('adminUser.json').then((fixtureData) => {
      const firstName = fixtureData.firstName;
      const lastName = fixtureData.lastName;
      const username = fixtureData.username;
      const email = fixtureData.email;

      cy.get('#mat-input-0').type(firstName);
      cy.get('#mat-input-1').type(lastName);
      cy.get('#mat-input-2').type(username);
      cy.get('#mat-input-3').type(email);
    });
    cy.get('form.ng-star-inserted > .mat-focus-indicator').click(); //Click on Submit button
    //Check language
    cy.get('.mat-select-placeholder')
      .invoke('text')
      .then((selectedLanguage) => {
        if (selectedLanguage === 'English' || selectedLanguage === 'Deutch') {
          // Code to execute when the selected language is English
          cy.log('Selected language is English '); //lang is English
          //Error message
          cy.get('.mat-simple-snack-bar-content').should(
            'have.text',
            'Failed to create person'
          );
          //Verify labels depending on transalte (Eng)
          cy.get('#mat-dialog-title-0').should('have.text', 'Create user');
          cy.get('#mat-form-field-label-1').should('have.text', 'First name*');
          cy.get('#mat-form-field-label-3').should('have.text', 'Last Name*');
          cy.get('#mat-form-field-label-5').should('have.text', 'Username*');
          cy.get('#mat-form-field-label-7').should('have.text', 'Email*');

          cy.get(
            '.ng-submitted > .mat-focus-indicator > .mat-button-wrapper'
          ).should('have.text', 'Submit');
          // });
        } else {
          // Code to execute when the selected language is German
          cy.log('Selected language is German'); //lang is German
          //Error message
          cy.get('.mat-simple-snack-bar-content').should(
            'have.text',
            'Benutzer konnte nicht erstellt werden'
          );
          //Verify labels depending on transalte (Eng)
          cy.get('#mat-dialog-title-0').should(
            'have.text',
            'Neuen Benutzer Anlegen'
          );
          cy.get('#mat-form-field-label-1').should('have.text', 'Vorname*');
          cy.get('#mat-form-field-label-3').should('have.text', 'Nachname*');
          cy.get('#mat-form-field-label-5').should(
            'have.text',
            'Benutzername*'
          );
          cy.get('#mat-form-field-label-7').should('have.text', 'Email*');
        }
      });
    cy.get('.mat-snack-bar-container').should('be.visible');
    cy.get('.mat-simple-snack-bar-content')
      .should('have.css', 'color') // Check the color property
      .and('eq', 'rgb(255, 255, 255)'); //Red color
    cy.wait(1500);

    cy.wait('@apiRequest').then((interception) => {
      // Log the status code to the Cypress console
      cy.log(`Status Code: ${interception.response.statusCode}`);

      // Checking Status Code from response
      expect(interception.response.statusCode).to.eq(400);
      cy.wait(2000);
      cy.get('.close').click(); //Close Create user dialog
    });
    cy.wait(7000); //to close error message
    cy.get('.mat-snack-bar-container').should('not.exist');
    // //Logout;
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url();
    cy.should('include', 'https://supportviewpayslip.edeja.com/fe/login'); // Validate url
  }); //end it
});
