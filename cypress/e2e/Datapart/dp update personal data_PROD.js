describe('Login/Logout to DATAPART E-Box', () => {
  // Login and Logout
  it('Login and Logout', function () {
    cy.loginToEgEboxAsStudent();
    cy.get(
      '.side-menu-section-desktop>.arrow-icon>button[aria-label="Benutzereinstellungen öffnen"]'
    ).click();
    cy.wait(1500);
    cy.get('ul > [aria-label="Benutzereinstellungen öffnen"]').click();
    // Click on the element to scroll to it without ensuring it's scrollable
    cy.get('.custom-settings-datapart').click({ force: true });
    //Empty email and phone (in personal data)
    cy.wait(1500);
    cy.get('input[formcontrolname="mail"]').clear({ force: true });
    cy.get('input[formcontrolname="phone"]').clear({ force: true });
    cy.get("button[type='submit']").should('be.disabled');
    cy.wait(1500);
    cy.reload();
    cy.wait(1500);
    //Personal data - email
    cy.get('input[formcontrolname="mail"]').then(($input) => {
      const inputText = 'invalid format';
      const currentValue = $input.val().trim();
      if (currentValue !== '') {
        // Clear the input field if it's not empty
        cy.get('input[formcontrolname="mail"]').clear({ force: true });
      }
      // Type the text into the input field
      cy.get('input[formcontrolname="mail"]').type(inputText, { force: true });

      // Validate the error message
      cy.get('.ng-invalid>div>mat-error>mat-error').should('be.visible');
      cy.get('.ng-invalid>div>mat-error>mat-error').should(
        'include.text',
        ' Bitte geben Sie eine gültige E-Mail-Adresse an '
      );
      cy.wait(1500);
      //Enter valid email taken from json file
      cy.get('input[formcontrolname="mail"]').clear({ force: true });
      cy.fixture('datapart.json').then((datapart) => {
        cy.get('input[formcontrolname="mail"]').type(datapart.email, {
          force: true,
        });
      });
      cy.wait(1500);
    }); //end email

    //Personal data - phoneNumber
    cy.get('input[formcontrolname="phone"]').then(($input) => {
      const inputText = 'invalid phone format';
      const currentPhoneValue = $input.val().trim();
      if (currentPhoneValue !== '') {
        // Clear the input field if it's not empty
        cy.get('input[formcontrolname="phone"]').clear({ force: true });
      }
      // Type the text into the input field
      cy.get('input[formcontrolname="phone"]').type(inputText, { force: true });

      // Validate the error message
      cy.get('.ng-invalid>div>mat-error>mat-error').should('be.visible');
      cy.get('.ng-invalid>div>mat-error>mat-error').should(
        'include.text',
        'Bitte geben Sie eine gültige Telefonnummer ein'
      );
      cy.wait(1500);
      //Enter valid phoneNumber taken from json file
      cy.get('input[formcontrolname="phone"]').clear({ force: true });
      cy.fixture('datapart.json').then((datapart) => {
        cy.get('input[formcontrolname="phone"]').type(datapart.phone, {
          force: true,
        });
      });
      cy.wait(1500);
    }); //end phone
    cy.get("button[type='submit']").should('be.enabled');
    cy.get("button[type = 'submit']").click();

    //Logout
    cy.get(
      '.side-menu-section-desktop>.arrow-icon>button[aria-label="Benutzereinstellungen öffnen"]'
    ).click();
    cy.wait(3000);
    cy.get('.logout-title > a').click({ force: true });
    cy.url().should(
      'include',
      'https://datapart.post-business-solutions.at/pf.datapart/'
    );
  }); //end it
});
