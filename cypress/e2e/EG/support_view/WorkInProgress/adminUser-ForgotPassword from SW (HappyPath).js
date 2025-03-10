/// <reference types="cypress" />

describe('adminUser-ForgotPassword from SW (HappyPath)', () => {
  it('adminUser-triggerForgotPasswordFromSW', () => {
    cy.visit(Cypress.env('baseUrl'), {
      failOnStatusCode: false,
    });
    cy.url().should('include', '/login'); //Validating url on the login page
    cy.get('.forgot-password-button').click();
    //Check title
    //cy.get('h2').contains('Forgot Password');

    cy.get('.mat-mdc-input-element').type(
      Cypress.env('username_supportViewAdmin')
    );
    //click on resetPass button
    cy.get('#reset_password_dialog-reset').click();
    //validate resetPass success message
    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible') // Ensure it's visible first
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /E-Mail for resetting the password was sent|Aktuelles Passwort/
        );
      });
    cy.wait(2500);
  }); //end it

  it('Yopmail - Reset Pass 1st time and Login to SW with new pass end Change it to Test1234', () => {
    // Visit Yopmail
    cy.visit('https://yopmail.com/en/');

    // Enter the support admin email
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));

    // Click the refresh button
    cy.get('#refreshbut > .md > .material-icons-outlined').click();

    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .eq(0)

      .should('include.text', 'Passwort zurücksetzen e-Gehaltszettel Portal'); //Validate subject of Verification email

    cy.iframe('#ifmail')
      .find(
        '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a'
      )
      .should('include.text', 'Neues Passwort erstellen ')
      .invoke('attr', 'href')
      .then((href) => {
        // Log link text
        cy.log(`The href attribute is: ${href}`);
      });
    cy.iframe('#ifmail')
      .find(
        '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a'
      )
      .invoke('attr', 'target', '_self') //prevent opening in new tab
      .click();
    cy.wait(4500);

    // Function to generate a random password
    function generateRandomPassword() {
      const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
      const numbers = '0123456789';
      const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';

      const allChars = upperCase + lowerCase + numbers + specialChars;

      const getRandom = (chars) =>
        chars[Math.floor(Math.random() * chars.length)];

      let password = '';
      password += getRandom(upperCase);
      password += getRandom(lowerCase);
      password += getRandom(numbers);
      password += getRandom(specialChars);

      // Generate a random length between 8 and 64 characters
      const randomLength = Math.floor(Math.random() * (64 - 8 + 1)) + 8;

      // Fill the remaining characters to reach the random length
      for (let i = 4; i < randomLength; i++) {
        password += getRandom(allChars);
      }

      // Shuffle the password to ensure randomness
      password = password
        .split('')
        .sort(() => 0.5 - Math.random())
        .join('');

      return password;
    }
    // Now, simulate filling in the reset password form
    const newPassword = generateRandomPassword();
    cy.log(`Generated password: ${newPassword}`);

    //Fill the Set password form
    cy.iframe('#ifmail')
      .find('input[formcontrolname="newPassword"]')
      .eq(1)
      .click({ force: true })
      .type(newPassword); //fill the newPassword
    cy.iframe('#ifmail')
      .find('mat-icon[data-mat-icon-name="password_invisible"]')
      .eq(2)
      .click({ force: true }); //Click on Show password icon

    cy.iframe('#ifmail')
      .find('input[formcontrolname="confirmedNewPassword"]')
      .eq(1)
      .type(newPassword); //fill the confirmedNewPassword
    cy.iframe('#ifmail')
      .find('.mat-mdc-button-touch-target')
      .eq(4)
      .click({ force: true }); //Click on Show password icon //Click on Show password icon

    //Confirm Reset Password dialog
    cy.iframe('#ifmail')
      .find('button>.mdc-button__label>.title')
      .eq(1)
      .contains(/Save|Übernehmen/i)

      .click({ force: true }); // Click the button; //Click on confirm button

    cy.iframe('#ifmail')
      .find('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .invoke('text')
      .then((text) => {
        cy.log(`Snackbar text: "${text}"`); // Log to see any hidden characters
      });

    cy.iframe('#ifmail')
      .find('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label', {
        timeout: 6000,
      })
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Password successfully reset|Passwort erfolgreich zurückgesetzt/i
        );
      });

    cy.wait(2000);

    // New Admin is Logging into SW using Credentials taken from emails
    cy.wait(2500);
    cy.intercept('GET', '**/supportView/v1/generalInfo**').as('visitURL');
    // cy.get('button[type="submit"]').click();
    cy.visit(Cypress.env('baseUrl'), {
      failOnStatusCode: false,
    });

    cy.wait(['@visitURL'], { timeout: 27000 }).then((interception) => {
      // Log the intercepted response
      cy.log('Intercepted response:', interception.response);

      // Optional: Assert the response status code
      expect(interception.response.statusCode).to.eq(200);
    });

    // Validate that the login page URL includes '/login'
    cy.url().should('include', '/login');

    // Enter credentials and submit the form
    cy.get('.username').type(Cypress.env('username_supportViewAdmin'));
    cy.get('.password').type(newPassword);
    cy.wait(1000);
    cy.get('.login-button').click(); //Trigger Login to SW
    // cy.url().should('include', '/dashboard/groups'); // => validate url
    // });
    cy.wait(1000);

    cy.visit(Cypress.env('dashboardURL'), {
      failOnStatusCode: false,
    });
    cy.wait(5500);

    //Remove pop up
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });

    cy.wait(2500);
    //Change Password
    cy.get('.menu-trigger>.mat-mdc-menu-trigger>.user-display-name').click({
      force: true,
    });
    cy.wait(2000);
    //Click on Change password button
    cy.get('.password-bttn').click({ force: true });
    cy.wait(1500);
    //Eter valid data into Change Password form

    cy.get('input[formcontrolname="oldPassword"]').type(newPassword);
    //Click on eye icon
    cy.get('button>mat-icon[data-mat-icon-name="password_invisible"]')
      .eq(0)
      .click({ force: true });
    cy.wait(1000);
    cy.get('input[formcontrolname="newPassword"]').type(
      Cypress.env('password_supportViewAdmin')
    );
    //Click on eye icon
    cy.get('button>mat-icon[data-mat-icon-name="password_invisible"]')
      .eq(0)
      .click({ force: true });
    cy.wait(1000);
    cy.get('input[formcontrolname="confirmedNewPassword"]').type(
      Cypress.env('password_supportViewAdmin')
    );
    //Click on eye icon
    cy.get('button>mat-icon[data-mat-icon-name="password_invisible"]')
      .eq(0)
      .click({ force: true });
    cy.wait(1000);

    cy.wait(2500);
    //Submit Change Passwor form
    cy.get('.button-container>button[type="submit"]').click({
      force: true,
    });

    //Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.log('Test completed successfully.');
    cy.wait(2500);
  });

  it.skip('Yopmail - Reset Pass 1st time', () => {
    // Visit Yopmail
    cy.visit('https://yopmail.com/en/');

    // Enter the support admin email
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));

    // Click the refresh button
    cy.get('#refreshbut > .md > .material-icons-outlined').click();

    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .eq(0)

      .should('include.text', 'Passwort zurücksetzen e-Gehaltszettel Portal'); //Validate subject of Verification email

    cy.iframe('#ifmail')
      .find(
        '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a'
      )
      .should('include.text', 'Neues Passwort erstellen ')
      .invoke('attr', 'href')
      .then((href) => {
        // Log link text
        cy.log(`The href attribute is: ${href}`);
      });
    cy.iframe('#ifmail')
      .find(
        '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a'
      )
      .invoke('attr', 'target', '_self') //prevent opening in new tab
      .click();
    cy.wait(4500);

    //Fill the Set password form
    cy.iframe('#ifmail')
      .find('input[formcontrolname="newPassword"]')
      .eq(1)
      .click({ force: true })
      .type(Cypress.env('password_egEbox')); //fill the 1st input field
    cy.iframe('#ifmail')
      .find('mat-icon[data-mat-icon-name="password_invisible"]')
      .eq(2)
      .click({ force: true }); //Click on Show password icon

    cy.iframe('#ifmail')
      .find('input[formcontrolname="confirmedNewPassword"]')
      .eq(1)
      .type(Cypress.env('password_egEbox')); //fill the 1st input field
    cy.iframe('#ifmail')
      .find('.mat-mdc-button-touch-target')
      .eq(4)
      .click({ force: true }); //Click on Show password icon //Click on Show password icon

    //Confirm Reset Password dialog
    cy.iframe('#ifmail')
      .find('button>.mdc-button__label>.title')
      .eq(1)
      .contains(/Save|Übernehmen/i)

      .click({ force: true }); // Click the button; //Click on confirm button

    cy.iframe('#ifmail')
      .find('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .invoke('text')
      .then((text) => {
        cy.log(`Snackbar text: "${text}"`); // Log to see any hidden characters
      });

    cy.iframe('#ifmail')
      .find('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label', {
        timeout: 6000,
      })
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Password successfully reset|Passwort erfolgreich zurückgesetzt/i
        );
      });

    //   cy.wait(2000);
  });

  it('Yopmail - Use reset pw link more than one', () => {
    // Visit Yopmail
    cy.visit('https://yopmail.com/en/');

    // Enter the support admin email
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));

    // Click the refresh button
    cy.get('#refreshbut > .md > .material-icons-outlined').click();

    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .eq(0)

      .should('include.text', 'Passwort zurücksetzen e-Gehaltszettel Portal'); //Validate subject of Verification email

    cy.iframe('#ifmail')
      .find(
        '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a'
      )
      .should('include.text', 'Neues Passwort erstellen ')
      .invoke('attr', 'href')
      .then((href) => {
        // Log link text
        cy.log(`The href attribute is: ${href}`);
      });
    cy.iframe('#ifmail')
      .find(
        '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a'
      )
      .invoke('attr', 'target', '_self') //prevent opening in new tab
      .click();
    cy.wait(4500);

    //Fill the Set password form
    cy.iframe('#ifmail')
      .find('input[formcontrolname="newPassword"]')
      .eq(1)
      .click({ force: true })
      .type(Cypress.env('password_egEbox')); //fill the 1st input field
    cy.iframe('#ifmail')
      .find('mat-icon[data-mat-icon-name="password_invisible"]')
      .eq(2)
      .click({ force: true }); //Click on Show password icon

    cy.iframe('#ifmail')
      .find('input[formcontrolname="confirmedNewPassword"]')
      .eq(1)
      .type(Cypress.env('password_egEbox')); //fill the 1st input field
    cy.iframe('#ifmail')
      .find('.mat-mdc-button-touch-target')
      .eq(4)
      .click({ force: true }); //Click on Show password icon //Click on Show password icon

    //Confirm Reset Password dialog
    cy.iframe('#ifmail')
      .find('button>.mdc-button__label>.title')
      .eq(1)
      .contains(/Save|Übernehmen/i)

      .click({ force: true }); // Click the button; //Click on confirm button

    cy.iframe('#ifmail')
      .find('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .invoke('text')
      .then((text) => {
        cy.log(`Snackbar text: "${text}"`); // Log to see any hidden characters
      });

    cy.iframe('#ifmail')
      .find('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label', {
        timeout: 6000,
      })
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Restart password failed|Passwortrücksetzen fehlgeschlagen/i
        );
      });
  });

  it('Admin user login to SW using Reverted pass', () => {
    cy.loginToSupportViewAdmin();
    // Wait for login to complete
    cy.wait(1500);

    //Remove pop up
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(3500);

    // Logout
    cy.get('.logout-icon').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate URL
    cy.log('Test completed successfully.');
    cy.wait(2500);
  });

  //Work in progress
  it('Yopmail - Reset Pass 1st time and Login to SW with new pass end Change it to Test1234', () => {
    // Visit Yopmail
    cy.visit('https://yopmail.com/en/');

    // Enter the support admin email
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));

    // Click the refresh button
    cy.get('#refreshbut > .md > .material-icons-outlined').click();

    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .eq(0)

      .should('include.text', 'Passwort zurücksetzen e-Gehaltszettel Portal'); //Validate subject of Verification email

    cy.iframe('#ifmail')
      .find(
        '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a'
      )
      .should('include.text', 'Neues Passwort erstellen ')
      .invoke('attr', 'href')
      .then((href) => {
        // Log link text
        cy.log(`The href attribute is: ${href}`);
      });
    cy.iframe('#ifmail')
      .find(
        '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a'
      )
      .invoke('attr', 'target', '_self') //prevent opening in new tab
      .click();
    cy.wait(4500);

    // Function to generate a random password
    function generateRandomPassword() {
      const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
      const numbers = '0123456789';
      const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';

      const allChars = upperCase + lowerCase + numbers + specialChars;

      const getRandom = (chars) =>
        chars[Math.floor(Math.random() * chars.length)];

      let password = '';
      password += getRandom(upperCase);
      password += getRandom(lowerCase);
      password += getRandom(numbers);
      password += getRandom(specialChars);

      // Generate a random length between 8 and 64 characters
      const randomLength = Math.floor(Math.random() * (64 - 8 + 1)) + 8;

      // Fill the remaining characters to reach the random length
      for (let i = 4; i < randomLength; i++) {
        password += getRandom(allChars);
      }

      // Shuffle the password to ensure randomness
      password = password
        .split('')
        .sort(() => 0.5 - Math.random())
        .join('');

      return password;
    }
    // Now, simulate filling in the reset password form
    const newPassword = generateRandomPassword();
    cy.log(`Generated password: ${newPassword}`);

    //Fill the Set password form
    cy.iframe('#ifmail')
      .find('input[formcontrolname="newPassword"]')
      .eq(1)
      .click({ force: true })
      .type(newPassword); //fill the newPassword
    cy.iframe('#ifmail')
      .find('mat-icon[data-mat-icon-name="password_invisible"]')
      .eq(2)
      .click({ force: true }); //Click on Show password icon

    cy.iframe('#ifmail')
      .find('input[formcontrolname="confirmedNewPassword"]')
      .eq(1)
      .type(newPassword); //fill the confirmedNewPassword
    cy.iframe('#ifmail')
      .find('.mat-mdc-button-touch-target')
      .eq(4)
      .click({ force: true }); //Click on Show password icon //Click on Show password icon

    //Confirm Reset Password dialog
    cy.iframe('#ifmail')
      .find('button>.mdc-button__label>.title')
      .eq(1)
      .contains(/Save|Übernehmen/i)

      .click({ force: true }); // Click the button; //Click on confirm button

    cy.iframe('#ifmail')
      .find('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .invoke('text')
      .then((text) => {
        cy.log(`Snackbar text: "${text}"`); // Log to see any hidden characters
      });

    cy.iframe('#ifmail')
      .find('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label', {
        timeout: 6000,
      })
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Password successfully reset|Passwort erfolgreich zurückgesetzt/i
        );
      });

    cy.wait(2000);

    // New Admin is Logging into SW using Credentials taken from emails
    cy.wait(2500);
    cy.intercept('GET', '**/supportView/v1/generalInfo**').as('visitURL');
    // cy.get('button[type="submit"]').click();
    cy.visit(Cypress.env('baseUrl'), {
      failOnStatusCode: false,
    });

    cy.wait(['@visitURL'], { timeout: 27000 }).then((interception) => {
      // Log the intercepted response
      cy.log('Intercepted response:', interception.response);

      // Optional: Assert the response status code
      expect(interception.response.statusCode).to.eq(200);
    });

    // Validate that the login page URL includes '/login'
    cy.url().should('include', '/login');

    // Enter credentials and submit the form
    cy.get('.username').type(Cypress.env('username_supportViewAdmin'));
    cy.get('.password').type(newPassword);
    cy.wait(1000);
    cy.get('.login-button').click(); //Trigger Login to SW
    // cy.url().should('include', '/dashboard/groups'); // => validate url
    // });
    cy.wait(1000);

    cy.visit(Cypress.env('dashboardURL'), {
      failOnStatusCode: false,
    });
    cy.wait(5500);

    //Remove pop up
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });

    cy.wait(2500);
    //Change Password
    cy.get('.menu-trigger>.mat-mdc-menu-trigger>.user-display-name').click({
      force: true,
    });
    cy.wait(2000);
    //Click on Change password button
    cy.get('.password-bttn').click({ force: true });
    cy.wait(1500);
    //Eter valid data into Change Password form

    cy.get('input[formcontrolname="oldPassword"]').type(newPassword);
    //Click on eye icon
    cy.get('button>mat-icon[data-mat-icon-name="password_invisible"]')
      .eq(0)
      .click({ force: true });
    cy.wait(1000);
    cy.get('input[formcontrolname="newPassword"]').type(
      Cypress.env('password_supportViewAdmin')
    );
    //Click on eye icon
    cy.get('button>mat-icon[data-mat-icon-name="password_invisible"]')
      .eq(0)
      .click({ force: true });
    cy.wait(1000);
    cy.get('input[formcontrolname="confirmedNewPassword"]').type(
      Cypress.env('password_supportViewAdmin')
    );
    //Click on eye icon
    cy.get('button>mat-icon[data-mat-icon-name="password_invisible"]')
      .eq(0)
      .click({ force: true });
    cy.wait(1000);

    cy.wait(2500);
    //Submit Change Passwor form
    cy.get('.button-container>button[type="submit"]').click({
      force: true,
    });

    //Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.log('Test completed successfully.');
    cy.wait(2500);
  });
});
