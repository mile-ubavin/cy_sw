describe('Login/Logout to DATAPART E-Box', () => {
  // Login and Logout
  it('Login and Logout', function () {
    cy.loginToEgEboxAsStudent();
    cy.get(
      '.side-menu-section-desktop>.arrow-icon>button[aria-label="Benutzereinstellungen öffnen"]'
    ).click();
    cy.wait(1500);
    //cy.get('ul >.user-settings-title>a ').click();
    cy.get('[tabindex="1"] > a').click();
    //Submit button is disabled
    cy.get('button[type="submit"]').should('be.disabled');
    //Check title
    cy.get('h1').should('have.text', 'Passwort zurücksetzen');

    //Generate random string (invalid old pass) 5-8 characters
    const generateRandomString = (length) => {
      const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
      let randomString = '';
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
      }
      return randomString;
    };
    const randomLength = Math.floor(Math.random() * 3) + 5; // Generate a random length between 5 and 7
    const randomValue = generateRandomString(randomLength);

    cy.get('input[formcontrolname="oldPassword"]').type(randomValue);
    //Click on show/hide icon
    cy.get('mat-icon[data-mat-icon-name="login_username-password_invisible"]')
      .eq(0)
      .click();

    cy.get('#mat-mdc-error-5').should(
      'have.text',
      ' Die minimale Länge ist 8. '
    );
    cy.wait(1500);
    //Enter vaid pass
    cy.get('input[formcontrolname="oldPassword"]').clear();
    //Enter old pass taken from json file
    cy.fixture('datapart.json').then((datapart) => {
      cy.get('input[formcontrolname="oldPassword"]').type(
        datapart.password_student,
        {
          force: true,
        }
      );
    });
    cy.wait(1500);

    //newPassword and newPasswordConfirm are less than 8 characters (and match)

    cy.get('input[formcontrolname="newPassword"]').type(randomValue);
    //Click on show/hide icon

    cy.get('mat-icon[data-mat-icon-name="login_username-password_invisible"]')
      .eq(0)
      .click();

    cy.get('#mat-mdc-error-8').should(
      'have.text',
      ' Die minimale Länge ist 8. Die Passwörter müssen übereinstimmen.'
    );
    cy.get('#mat-mdc-error-10').should(
      'have.text',
      'Die Passwörter müssen übereinstimmen.'
    );
    cy.get('input[formcontrolname="newPasswordConfirm"]').type(randomValue);
    //Click on show/hide icon
    cy.get('mat-icon[data-mat-icon-name="login_username-password_invisible"]')
      .eq(0)
      .click();
    cy.get('#mat-mdc-error-12').should(
      'have.text',
      ' Die minimale Länge ist 8. '
    );
    cy.wait(2000);

    //newPassword and newPasswordConfirm are NOT MATCH and its longer than 8 characters

    cy.get('input[formcontrolname="newPassword"]').clear().type('Test1234!');
    cy.get('#mat-mdc-error-14').should(
      'have.text',
      'Die Passwörter müssen übereinstimmen.'
    );
    cy.get('input[formcontrolname="newPasswordConfirm"]')
      .clear()
      .type('Test12345');
    cy.get('#mat-mdc-error-15').should(
      'have.text',
      'Die Passwörter müssen übereinstimmen.'
    );
    //Submit button is disabled
    cy.get('button[type="submit"]').should('be.disabled');
    cy.wait(2000);

    //newPassword and newPasswordConfirm are MATCH and its longer than 8 characters
    cy.get('input[formcontrolname="newPasswordConfirm"]')
      .clear()
      .type('Test1234!');
    cy.get('button[type="submit"]').should('be.enabled');
    cy.wait(1500);
    cy.get('button[type="submit"]').click();
    cy.wait(2000);

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
});
