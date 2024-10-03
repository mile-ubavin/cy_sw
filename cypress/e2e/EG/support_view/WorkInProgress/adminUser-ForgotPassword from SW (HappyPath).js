/// <reference types="Cypress" />

describe('adminUser-ForgotPassword from SW (HappyPath)', () => {
  it('adminUser-triggerForgotPasswordFromSW', () => {
    //Trigger Forgot Password for AdminUser

    //Import credentials (un/pw) from 'supportView.json' file
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(payslipJson.baseUrl); //Taken from base url
      cy.url().should('include', payslipJson.baseUrl); //Validating url on the login page
      cy.wait(2000);
      cy.get('.forgot-password-button').click();
      //Check title
      //cy.get('h2').contains('Forgot Password');

      // Load the en.json fixture before your test
      cy.fixture('English.json').then((translations) => {
        const forgotPasswordText = translations['Forgot Password']; // Access the translation key
        const forgotPasswordLabelText =
          translations['E-mail address / user name'];
        const resettingPasswordSuccessMessage =
          translations['E-Mail for resetting the password was sent'];

        // Translation value
        cy.get('.dialog-title').should('include.text', forgotPasswordText);
        cy.get('.dialog-query').should(
          'include.text',
          'Please enter your user name. Please note that you will only receive the information to reset your password if you have a verified e-mail address. If this is not the case, please contact your HR department.'
        );
        cy.get('.dialog-title').should('include.text', forgotPasswordText);
        cy.get('.mdc-floating-label').should(
          'include.text',
          forgotPasswordLabelText
        );
        cy.get('.mat-mdc-input-element').type(
          payslipJson.username_supportViewAdmin
        );
        //click on resetPass button
        cy.get('#reset_password_dialog-reset').click();
        //validate resetPass success message
        cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label').should(
          'include.text',
          resettingPasswordSuccessMessage
        );
      });
    });
    cy.wait(2000);
  }); //end it

  it('Yopmail - Reset Password (Random generated valid Password', () => {
    // Visit Yopmail
    cy.visit('https://yopmail.com/en/');

    // Load fixture data
    cy.fixture('supportView.json').as('payslipSW');

    // Enter the support admin email
    cy.get('@payslipSW').then((payslipJson) => {
      cy.get('#login').type(payslipJson.email_supportViewAdmin);
    });

    // Click the refresh button
    cy.get('#refreshbut > .md > .material-icons-outlined').click();

    // Access the inbox iframe and validate the email subject
    cy.frameLoaded('#ifinbox'); // Ensure the iframe is loaded
    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .eq(0)
      .should('include.text', 'Passwort zurücksetzen e-Gehaltszettel Portal'); // Validate subject of FP email

    // Extract the reset password link from the email
    cy.iframe('#ifmail')
      .find(
        '#mail > div > div:nth-child(2) > div:nth-child(3) > table > tbody > tr > td > p:nth-child(4) > span > a'
      )
      .should('include.text', 'Neues Passwort erstellen ')
      .invoke('attr', 'href')
      .then((href) => {
        // Log the href attribute
        cy.log(`The href attribute is: ${href}`);
      });

    // Extract the Reset Password link
    // Step 1: Extract the reset password link from the email
    cy.iframe('#ifmail')
      .find(
        '#mail > div > div:nth-child(2) > div:nth-child(3) > table > tbody > tr > td > p:nth-child(4) > span > a'
      )
      .invoke('attr', 'href') // Get the href attribute (the link)
      .then((resetPasswordLink) => {
        // Step 2: Store the link in a constant
        const resetPassword = resetPasswordLink;
        const resettingPasswordSuccessMessage =
          // Log the reset password link for debugging purposes
          cy.log('Reset Password Link:', resetPassword);

        // Step 3: Visit the reset password link
        cy.visit(resetPassword); // Navigate to the reset password page using the extracted link

        // Fill the New Password field
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
        // Now, simulate filling in the reset password form
        //const newPassword = generateRandomPassword();

        cy.get('input[formcontrolname="newPassword"]')
          .eq(1) // Assuming the second visible input is for password confirmation
          .type(newPassword); // Enter the password confirmation
        cy.get(
          '#mat-mdc-dialog-1 > .mdc-dialog__container > .mat-mdc-dialog-surface > .mat-mdc-dialog-component-host > .change-password-page > .change-password-form-wrapper > .form > :nth-child(4) > .mdc-button > .mat-mdc-button-touch-target'
        ).click({ force: true });

        // Fill the Confirm Password field
        cy.get('input[formcontrolname="confirmedNewPassword"]')
          .eq(1) // Assuming the second visible input is for password confirmation
          .type(newPassword); // Enter the password confirmation
        cy.get(
          '#mat-mdc-dialog-1 > .mdc-dialog__container > .mat-mdc-dialog-surface > .mat-mdc-dialog-component-host > .change-password-page > .change-password-form-wrapper > .form > :nth-child(5) > .mdc-button > .mat-mdc-button-touch-target'
        ).click({ force: true });
        cy.wait(1500);
        cy.get(
          '#mat-mdc-dialog-1 > .mdc-dialog__container > .mat-mdc-dialog-surface > .mat-mdc-dialog-component-host > .change-password-page > .button-wrapper > .button-container > .submit-bttn > .mat-mdc-button-touch-target'
        ).click({ force: true }); // Click the Save button

        //Validate Succes message
        cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label').should(
          'include.text',
          'Password successfully reset'
        );
        //Login to sw
        cy.fixture('supportView.json').as('payslipSW');
        cy.get('@payslipSW').then((payslipJson) => {
          cy.get('input[formcontrolname="username"]').type(
            payslipJson.username_supportViewAdmin
          );
          cy.get('input[formcontrolname="password"]').type(newPassword);
          cy.get('button[type="submit"]').click();
        });

        //Logout
        cy.get('.logout-icon ').click();
        cy.wait(2000);
        cy.get('.confirm-buttons > :nth-child(2)').click();
        cy.url();
        cy.should('include', 'https://supportviewpayslip.edeja.com/fe/login'); // Validate url
        cy.wait(3000);
      });
  }); //end it

  // ***************SET OLD PASSWORD*************************

  it('adminUser-triggerForgotPasswordFromSW', () => {
    //Trigger Forgot Password for AdminUser

    //Import credentials (un/pw) from 'supportView.json' file
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(payslipJson.baseUrl); //Taken from base url
      cy.url().should('include', payslipJson.baseUrl); //Validating url on the login page
      cy.wait(2000);
      cy.get('.forgot-password-button').click();
      //Check title
      //cy.get('h2').contains('Forgot Password');

      // Load the en.json fixture before your test
      cy.fixture('English.json').then((translations) => {
        const forgotPasswordText = translations['Forgot Password']; // Access the translation key
        const forgotPasswordLabelText =
          translations['E-mail address / user name'];
        const resettingPasswordSuccessMessage =
          translations['E-Mail for resetting the password was sent'];

        // Translation value
        cy.get('.dialog-title').should('include.text', forgotPasswordText);
        cy.get('.dialog-query').should(
          'include.text',
          'Please enter your user name. Please note that you will only receive the information to reset your password if you have a verified e-mail address. If this is not the case, please contact your HR department.'
        );
        cy.get('.dialog-title').should('include.text', forgotPasswordText);
        cy.get('.mdc-floating-label').should(
          'include.text',
          forgotPasswordLabelText
        );
        cy.get('.mat-mdc-input-element').type(
          payslipJson.username_supportViewAdmin
        );
        //click on resetPass button
        cy.get('#reset_password_dialog-reset').click();
        //validate resetPass success message
        cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label').should(
          'include.text',
          resettingPasswordSuccessMessage
        );
      });
    });
    cy.wait(2000);
  }); //end it

  it('Yopmail - Set Old Password', () => {
    // Visit Yopmail
    cy.visit('https://yopmail.com/en/');

    // Load fixture data
    cy.fixture('supportView.json').as('payslipSW');

    // Enter the support admin email
    cy.get('@payslipSW').then((payslipJson) => {
      cy.get('#login').type(payslipJson.email_supportViewAdmin);
      // });//end get values from json

      // Click the refresh button
      cy.get('#refreshbut > .md > .material-icons-outlined').click();

      // Access the inbox iframe and validate the email subject
      cy.frameLoaded('#ifinbox'); // Ensure the iframe is loaded
      cy.iframe('#ifinbox')
        .find('.mctn > .m > button > .lms')
        .eq(0)
        .should('include.text', 'Passwort zurücksetzen e-Gehaltszettel Portal'); // Validate subject of FP email

      // Extract the reset password link from the email
      cy.iframe('#ifmail')
        .find(
          '#mail > div > div:nth-child(2) > div:nth-child(3) > table > tbody > tr > td > p:nth-child(4) > span > a'
        )
        .should('include.text', 'Neues Passwort erstellen ')
        .invoke('attr', 'href')
        .then((href) => {
          // Log the href attribute
          cy.log(`The href attribute is: ${href}`);
        });

      // Extract the Reset Password link
      // Step 1: Extract the reset password link from the email
      cy.iframe('#ifmail')
        .find(
          '#mail > div > div:nth-child(2) > div:nth-child(3) > table > tbody > tr > td > p:nth-child(4) > span > a'
        )
        .invoke('attr', 'href') // Get the href attribute (the link)
        .then((resetPasswordLink) => {
          // Step 2: Store the link in a constant
          const resetPassword = resetPasswordLink;

          // Log the reset password link for debugging purposes
          cy.log('Reset Password Link:', resetPassword);

          // Step 3: Visit the reset password link
          cy.visit(resetPassword); // Navigate to the reset password page using the extracted link

          // Fill the New Password field

          cy.get('input[formcontrolname="newPassword"]')
            .eq(1) // Assuming the second visible input is for password confirmation
            .type(payslipJson.password_supportViewAdmin); // Enter the password confirmation
          cy.get(
            '#mat-mdc-dialog-1 > .mdc-dialog__container > .mat-mdc-dialog-surface > .mat-mdc-dialog-component-host > .change-password-page > .change-password-form-wrapper > .form > :nth-child(4) > .mdc-button > .mat-mdc-button-touch-target'
          ).click({ force: true });

          // Fill the Confirm Password field
          cy.get('input[formcontrolname="confirmedNewPassword"]')
            .eq(1) // Assuming the second visible input is for password confirmation
            .type(payslipJson.password_supportViewAdmin); // Enter the password confirmation
          cy.get(
            '#mat-mdc-dialog-1 > .mdc-dialog__container > .mat-mdc-dialog-surface > .mat-mdc-dialog-component-host > .change-password-page > .change-password-form-wrapper > .form > :nth-child(5) > .mdc-button > .mat-mdc-button-touch-target'
          ).click({ force: true });
          cy.wait(1500);
          cy.get(
            '#mat-mdc-dialog-1 > .mdc-dialog__container > .mat-mdc-dialog-surface > .mat-mdc-dialog-component-host > .change-password-page > .button-wrapper > .button-container > .submit-bttn > .mat-mdc-button-touch-target'
          ).click({ force: true }); // Click the Save button
        }); //end get values from json
      //Validate Succes message
      cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label').should(
        'include.text',
        'Password successfully reset'
      );
      //Login to sw
      cy.fixture('supportView.json').as('payslipSW');
      cy.get('@payslipSW').then((payslipJson) => {
        cy.get('input[formcontrolname="username"]').type(
          payslipJson.username_supportViewAdmin
        );
        cy.get('input[formcontrolname="password"]').type(
          payslipJson.password_supportViewAdmin
        );
        cy.get('button[type="submit"]').click();
      });

      //Logout
      cy.get('.logout-icon ').click();
      cy.wait(2000);
      cy.get('.confirm-buttons > :nth-child(2)').click();
      cy.url();
      cy.should('include', 'https://supportviewpayslip.edeja.com/fe/login'); // Validate url
      cy.wait(3000);
    });
  });
});
