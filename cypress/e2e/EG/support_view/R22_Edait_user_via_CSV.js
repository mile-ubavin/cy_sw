describe('Master - Create User from CSV and Update User data', () => {
  // Precondition: Search for the user and if user exists, proceed with deletion
  it('Search for the user and if user(s) exist, proceed with deletion', () => {
    const user = Cypress.env('createUser')[0];
    cy.loginToSupportViewMaster();
    cy.wait(3500);

    // Remove pop up if exists
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(1500);

    // Search for Group by Display Name
    cy.get('#searchButton>span').click();
    const companyName = Cypress.env('company');
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(1)
      .type(companyName);
    cy.get('.search-dialog>form>div>.mat-primary').click();

    // Switch to user section
    cy.get('.action-buttons > .mdc-button').eq(4).click();

    // Array of users to delete
    const usersToDelete = ['ottoTestuser']; // Add more usernames as needed

    usersToDelete.forEach((userName) => {
      const searchAndDeleteUser = (userName) => {
        cy.get('.search-label').click();

        // Search for the user
        cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
          .clear()
          .type(userName);
        cy.get('button[type="submit"]').click();

        cy.wait(2000);

        // Check results
        cy.get('body').then(($body) => {
          if ($body.find('.cdk-row').length === 0) {
            cy.log(`User ${userName} not found or already deleted.`);
            // Close search dialog if needed
            cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click({
              force: true,
            });
          } else {
            // User exists -> proceed with deletion
            cy.get('.cdk-row').should('exist');
            cy.log(`User ${userName} found. Proceeding with deletion.`);

            cy.contains('button', /Delete|DSGVO-Löschung/)
              .should('be.visible')
              .click();

            cy.get('.confirm-buttons > button')
              .contains(/YES|JA/)
              .should('be.visible')
              .click();

            cy.log(`User ${userName} has been deleted.`);
          }
        });
      };

      cy.wait(1500);
      searchAndDeleteUser(userName);
      cy.wait(1000);
    });

    // Logout
    cy.get('.logout-icon').click();
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl'));
    cy.log('The tests have been completed successfully.');
  });

  // A D M I N   U S E R - CREATE USER FROM CSV FILE and UPDATE HIS PERSONAL DATA
  it('Login As AdminUser - Create Users from CSV file', () => {
    // Login as Master User using a custom command
    cy.loginToSupportViewMaster();
    cy.wait(3500);

    //Remove pop up
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(1500);

    //Search for Company by Display Name
    cy.get('#searchButton>span').click(); //Click on search button
    cy.wait(1000);

    // Use the company name from the cypress.config.js
    const companyName = Cypress.env('company');

    // Search for Group by Display Name using the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(0)
      .type(companyName);

    //Find the Search button by button name and click on it
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    //Create user
    cy.get('.action-buttons>.mdc-button>.mdc-button__label')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'User' || text === 'Benutzer';
      })
      .click({ force: true });
    cy.wait(2500);

    //Click on create User button
    cy.get('.button-wraper>button > .mdc-button__label')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Create user' || text === 'Neuen Benutzer Anlegen';
      })
      .click({ force: true });
    cy.wait(1500);

    //Click on Upload CSV button
    cy.get('.create_user_dialog_content>.buttons-wrapper>button')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'CSV uploading' || text === 'CSV Anlage';
      })
      .click();

    //Register new user via: CSV file
    cy.createNewUser_viaCSV();
    cy.get('#mat-select-value-3 > .mat-mdc-select-placeholder').click();
    cy.get('div.cdk-overlay-pane').should('exist'); // Ensure the overlay pane is present
    cy.get('div.cdk-overlay-pane mat-option').should(
      'have.length.greaterThan',
      0
    );

    //Select Company prefix
    cy.wait(1500);
    cy.get('mat-option').eq(0).click();
    cy.wait(1500);

    cy.intercept('POST', '**/supportView/v1/person/fromGroup/**').as(
      'uploadCSV'
    );

    //Click on  Create Users button
    cy.get('.dialog-actions>button>.title')
      .contains(/Create Users|Benutzer Anlegen/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    // cy.wait(10000);
    cy.wait(['@uploadCSV'], {
      timeout: 57000,
    }).then((interception) => {
      // Log the intercepted response
      cy.log('Intercepted response:', interception.response);

      // Assert the response status code
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.wait(2000);
    // //Validate success message
    // cy.get('sv-multiple-notifications>.messages>p')
    //   .invoke('text')
    //   .then((text) => {
    //     const trimmedText = text.trim();

    //     // Check if the text matches either English or German message
    //     expect(trimmedText).to.be.oneOf([
    //       '1 User was created', // English
    //       'Anzahl fehlgeschlagener Importe: 1', // German
    //     ]);
    //   });
    // //cy.wait(7500);
    // // Wait until the success message disappears completely
    // cy.get('sv-multiple-notifications>.messages>p', { timeout: 20000 }).should(
    //   'not.exist'
    // );

    const usersToSearch = ['ottoTestuser']; // Add more usernames as needed

    usersToSearch.forEach((userName) => {
      const searchUser = (userName) => {
        cy.get('.search-label').click();

        // Search for the user
        cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
          .clear()
          .type(userName);

        cy.get('button[type="submit"]').click();

        cy.wait(2000);

        // Check search results
        cy.get('body').then(($body) => {
          if ($body.find('.cdk-row').length === 0) {
            cy.log(`User ${userName} not found.`);
            // Optionally close the search dialog if needed
            cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click({
              force: true,
            });
          } else {
            cy.get('.cdk-row').should('exist');
            cy.log(`User ${userName} found.`);
          }
        });
      };

      cy.wait(1500);
      searchUser(userName);
      cy.wait(1000);
    });

    cy.wait(2500);

    //Logout
    cy.get('.logout-icon ').click({ force: true });
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url
    cy.wait(1500);
  }); //end it

  //Y O P M A I L
  it('Yopmail - Confirm email and Change password', () => {
    // Visit yopmail application
    cy.visit('https://yopmail.com/en/');

    // Get csv user email from cypress.config.js
    const csvTestuser = Cypress.env('csvTestuser')[0];
    cy.get('#login').type(csvTestuser.email);

    //cy.get('#login').type('new-csv.testuser@yopmail.com');

    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    cy.wait(1500);
    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .eq(0)
      .should('include.text', 'Ihr neuer Benutzer im e-Gehaltszettel Portal'); //Validate subject of Verification email

    cy.iframe('#ifmail')
      .find(
        '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span'
      )
      .invoke('text')
      .then((innerText) => {
        const startIndex =
          innerText.indexOf('Hier ist Ihr Benutzername:') +
          'Hier ist Ihr Benutzername:'.length;
        const endIndex = innerText.indexOf('Bitte bestätigen Sie');

        const usernameFromEmailBody = innerText
          .substring(startIndex, endIndex)
          .trim();

        cy.log('Captured text:', usernameFromEmailBody);

        //Confirm Email Address  - by clicking on "Jetzt E-Mail Adresse bestätigen" button from Comfirmation email
        cy.wait(1500);
        let initialUrl;
        cy.iframe('#ifmail')
          .find(
            '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span>a'
          )
          .should('include.text', 'Jetzt E-Mail Adresse bestätigen')
          .invoke('attr', 'href')
          .then((href) => {
            // Log link text
            cy.log(`The href attribute is: ${href}`);
          });

        cy.iframe('#ifmail')
          .find(
            '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span>a'
          )
          .invoke('attr', 'target', '_self') //prevent opening in new tab
          .click();

        // // Remove Cookie dialog (if shown)
        // cy.iframe('#ifmail')
        //   .find('#onetrust-accept-btn-handler', { timeout: 5000 })
        //   .its('length')
        //   .then((length) => {
        //     if (length > 0) {
        //       cy.iframe('#ifmail').find('#onetrust-accept-btn-handler').click();
        //       cy.log('Cookie dialog accepted.');
        //     } else {
        //       cy.log('Cookie dialog is not shown.');
        //     }
        //   });

        //Wait for Cookie bar
        cy.wait(15000);

        //Remove Cooki dialog (if shown)
        if (cy.iframe('#ifmail').find('#onetrust-accept-btn-handler')) {
          cy.iframe('#ifmail').find('#onetrust-accept-btn-handler').click();
        } else {
          cy.log('Cookie dialog is not shown');
        }

        // Remove Cookie dialog (if shown)
        // cy.iframe('#ifmail')
        //   .find('#onetrust-accept-btn-handler', { timeout: 3000 })
        //   .then(($btn) => {
        //     if ($btn.length > 0 && $btn.is(':visible')) {
        //       cy.wrap($btn).click();
        //       cy.log('Cookie dialog was shown and clicked.');
        //     } else {
        //       cy.log('Cookie dialog is not shown.');
        //     }
        //   });

        // cy.iframe('#ifmail')
        //   .find('#onetrust-accept-btn-handler')
        //   .then(($btn) => {
        //     if ($btn.length) {
        //       cy.wrap($btn).click();
        //     } else {
        //       cy.log('Cookie dialog is not shown');
        //     }
        //   });

        // cy.iframe('#ifmail').find('#onetrust-accept-btn-handler').click();

        cy.wait(8000);
        cy.iframe('#ifmail').find('.button').click();
        //Reload inbox

        cy.get('#refresh').click({ force: true }); //Click on Refresh inbox icon
        cy.wait(15000);
        //Reset Pasword email

        cy.iframe('#ifinbox')
          .find('.mctn > .m > button > .lms')
          .eq(0)

          .should(
            'include.text',
            'Passwort zurücksetzen e-Gehaltszettel Portal'
          ); //Validate subject of Verification email

        let initialUrl_pass;
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
        cy.wait(2500);

        //Fill the Set password form
        cy.iframe('#ifmail')
          .find('.input__field-input')
          .eq(0)
          .click()
          .type(Cypress.env('password_egEbox')); //fill the 1st input field

        cy.iframe('#ifmail').find('.input-eye-icon').eq(0).click(); //Click on Show password icon

        cy.iframe('#ifmail')
          .find('.input__field-input')
          .eq(1)

          .type(Cypress.env('password_egEbox')); //fill the 1st input field
        cy.iframe('#ifmail').find('.input-eye-icon').eq(1).click(); //Click on Show password icon
        cy.iframe('#ifmail').find('.button').click(); //Click on confirm button

        cy.wait(2000);
      });
  });

  //Login to e-Box 1st time
  it('Login to e-Box 1st time', () => {
    cy.visit(Cypress.env('baseUrl_egEbox'));
    cy.wait(5000);

    // Wait for the cookie bar to appear
    //Remove Cookie
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        // If the cookie bar is visible, click on it and remove it
        cy.get('#onetrust-accept-btn-handler').click();
      } else {
        // Log that the cookie bar was not visible
        cy.log('Cookie bar not visible');
      }
    }); //End Remove Cookie
    cy.wait(1500);
    // Create the first user (with address)

    // Access the first Admin User object from cypress.config.js
    const csvUser = Cypress.env('csvTestuser')[0];
    // Continue with Login
    cy.log(Cypress.env('companyPrefix'));
    cy.get(':nth-child(1) > .ng-invalid > .input > .input__field-input').type(
      // Cypress.env('companyPrefix') + 'ottoTestuser'
      Cypress.env('companyPrefix') + csvUser.accountNumber
    );

    cy.get('.ng-invalid > .input > .input__field-input').type(
      Cypress.env('password_egEbox')
    );

    // cy.wait(6000);

    // cy.wait(10000);
    // cy.visit(Cypress.env('eboxDeliveryPage'), {
    //   failOnStatusCode: false,
    // });
    cy.wait(5500);

    cy.intercept('POST', '**/rest/v2/deliveries**').as('openDeliveriesPage');
    cy.wait(1000);
    cy.get('button[type="submit"]').click(); //Login to E-Box
    cy.wait(['@openDeliveriesPage'], { timeout: 37000 }).then(
      (interception) => {
        // Log the intercepted response
        cy.log('Intercepted response:', interception.response);

        // Assert the response status code
        expect(interception.response.statusCode).to.eq(200);
        cy.wait(2500);
      }
    );
    cy.wait(7000);
    cy.pause();

    // Logout
    cy.get('.user-title').click();
    cy.wait(1500);
    cy.get('.logout-title > a').click();
    //cy.url().should('include', payslipJson.baseUrl_egEbox); // Validate url
    cy.url().should('include', Cypress.env('baseUrl_egEbox')); // Validate url
    cy.log('Test completed successfully.');
  });

  // A D M I N   U S E R - UPDATE USER PERSONAL DATA
  it('Login As AdminUser - updateUser from CSV file', () => {
    // Login as Master User using a custom command
    cy.loginToSupportViewMaster();
    cy.wait(3500);

    //Remove pop up
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(1500);

    //Search for Company by Display Name
    cy.get('#searchButton>span').click(); //Click on search button
    cy.wait(1000);

    // Use the company name from the cypress.config.js
    const companyName = Cypress.env('company');

    // Search for Group by Display Name using the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(0)
      .type(companyName);

    //Find the Search button by button name and click on it
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    //Switch to User page
    cy.get('.action-buttons>.mdc-button>.mdc-button__label')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'User' || text === 'Benutzer';
      })
      .click({ force: true });
    cy.wait(2500);

    const usersToSearch = ['ottoTestuser']; // Add more usernames as needed

    usersToSearch.forEach((userName) => {
      const searchUser = (userName) => {
        cy.get('.search-label').click();

        // Search for the user
        cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
          .clear()
          .type(userName);

        cy.get('button[type="submit"]').click();

        cy.wait(2000);

        // Check search results
        cy.get('body').then(($body) => {
          if ($body.find('.cdk-row').length === 0) {
            cy.log(`User ${userName} not found.`);
            // Optionally close the search dialog if needed
            cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click({
              force: true,
            });
          } else {
            cy.get('.cdk-row').should('exist');
            cy.log(`User ${userName} found.`);
          }
        });
      };

      cy.wait(1500);
      searchUser(userName);
      cy.wait(1000);
    });

    //UPDATE USER`S DATA VIA CSV FILE

    //>>> 1.Test scenario -> updateUser:false

    //Click on create User button
    cy.get('.button-wraper>button > .mdc-button__label')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Create user' || text === 'Neuen Benutzer Anlegen';
      })
      .click({ force: true });
    cy.wait(1500);

    //Click on Upload CSV button
    cy.get('.create_user_dialog_content>.buttons-wrapper>button')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'CSV uploading' || text === 'CSV Anlage';
      })
      .click();

    //Upload CSV file
    cy.createNewUser_viaCSV();

    cy.get('mat-select[formcontrolname="companyPrefix"]').click();
    //cy.get('#mat-select-value-3 > .mat-mdc-select-placeholder').click();
    cy.get('div.cdk-overlay-pane').should('exist'); // Ensure the overlay pane is present
    cy.get('div.cdk-overlay-pane mat-option').should(
      'have.length.greaterThan',
      0
    );
    //Select Company prefix
    cy.wait(1500);
    cy.get('mat-option').eq(0).click();
    cy.wait(1500);

    cy.intercept('POST', '**/supportView/v1/person/fromGroup/**').as(
      'uploadCSV'
    );

    //Click on  Create Users button
    cy.get('.dialog-actions>button>.title')
      .contains(/Create Users|Benutzer Anlegen/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    // cy.wait(10000);
    cy.wait(['@uploadCSV'], {
      timeout: 57000,
    }).then((interception) => {
      // Log the intercepted response
      cy.log('Intercepted response:', interception.response);

      // Assert the response status code
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.wait(2000);
    //Validate success message
    cy.get('sv-multiple-notifications>.messages>p')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();

        // Check if the text matches either English or German message
        expect(trimmedText).to.be.oneOf([
          '1 User was skipped, because he already exists', // English
          '1 Benutzer wurde übersprungen, da er bereits existiert.', // German
        ]);
      });

    cy.wait(5000);

    //>>> 2.Test scenario ->invalidEmailFormat

    //Click on create User button
    cy.get('.button-wraper>button > .mdc-button__label')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Create user' || text === 'Neuen Benutzer Anlegen';
      })
      .click({ force: true });
    cy.wait(1500);

    //Click on Upload CSV button
    cy.get('.create_user_dialog_content>.buttons-wrapper>button')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'CSV uploading' || text === 'CSV Anlage';
      })
      .click();

    //invalidEmail_updateUserViaCSVFailed
    cy.invalidEmail__updateUserViaCSVFailed();

    cy.get('mat-select[formcontrolname="companyPrefix"]').click();
    //cy.get('#mat-select-value-3 > .mat-mdc-select-placeholder').click();
    cy.get('div.cdk-overlay-pane').should('exist'); // Ensure the overlay pane is present
    cy.get('div.cdk-overlay-pane mat-option').should(
      'have.length.greaterThan',
      0
    );
    //Select Company prefix
    cy.wait(1500);
    cy.get('mat-option').eq(0).click();
    cy.wait(1500);

    cy.intercept('POST', '**/supportView/v1/person/fromGroup/**').as(
      'uploadCSV'
    );

    //Click on  Create Users button
    cy.get('.dialog-actions>button>.title')
      .contains(/Create Users|Benutzer Anlegen/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    // cy.wait(10000);
    cy.wait(['@uploadCSV'], {
      timeout: 57000,
    }).then((interception) => {
      // Log the intercepted response
      cy.log('Intercepted response:', interception.response);

      // Assert the response status code
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.wait(2000);
    //Validate Error message
    cy.get('sv-multiple-notifications>.messages>p')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();

        // Check if the text matches either English or German message
        expect(trimmedText).to.be.oneOf([
          'Number of failed imports: 1', // English
          'Anzahl fehlgeschlagener Importe: 1', // German
        ]);
      });
    cy.wait(5000);

    //>>> 3.Test scenario ->invalid (Non AT) ZIP code

    //Click on create User button
    cy.get('.button-wraper>button > .mdc-button__label')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Create user' || text === 'Neuen Benutzer Anlegen';
      })
      .click({ force: true });
    cy.wait(1500);

    //Click on Upload CSV button
    cy.get('.create_user_dialog_content>.buttons-wrapper>button')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'CSV uploading' || text === 'CSV Anlage';
      })
      .click();

    //invalidZIP_updateUserViaCSVFailed
    cy.invalidZipCode__updateUserViaCSVFailed();

    cy.get('mat-select[formcontrolname="companyPrefix"]').click();
    //cy.get('#mat-select-value-3 > .mat-mdc-select-placeholder').click();
    cy.get('div.cdk-overlay-pane').should('exist'); // Ensure the overlay pane is present
    cy.get('div.cdk-overlay-pane mat-option').should(
      'have.length.greaterThan',
      0
    );
    //Select Company prefix
    cy.wait(1500);
    cy.get('mat-option').eq(0).click();
    cy.wait(1500);

    cy.intercept('POST', '**/supportView/v1/person/fromGroup/**').as(
      'uploadCSV'
    );

    //Click on  Create Users button
    cy.get('.dialog-actions>button>.title')
      .contains(/Create Users|Benutzer Anlegen/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    // cy.wait(10000);
    cy.wait(['@uploadCSV'], {
      timeout: 57000,
    }).then((interception) => {
      // Log the intercepted response
      cy.log('Intercepted response:', interception.response);

      // Assert the response status code
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.wait(2000);
    //Validate Error message
    cy.get('sv-multiple-notifications>.messages>p')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();

        // Check if the text matches either English or German message
        expect(trimmedText).to.be.oneOf([
          'Number of failed imports: 1', // English
          'Anzahl fehlgeschlagener Importe: 1', // German
        ]);
      });
    cy.wait(5000);

    //>>> 4.Test scenario ->Update user`s data

    //Click on create User button
    cy.get('.button-wraper>button > .mdc-button__label')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Create user' || text === 'Neuen Benutzer Anlegen';
      })
      .click({ force: true });
    cy.wait(1500);

    //Click on Upload CSV button
    cy.get('.create_user_dialog_content>.buttons-wrapper>button')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'CSV uploading' || text === 'CSV Anlage';
      })
      .click();

    //Update new user via: CSV file
    cy.updateUser_viaCSV();
    cy.get('mat-select[formcontrolname="companyPrefix"]').click();
    //cy.get('#mat-select-value-3 > .mat-mdc-select-placeholder').click();
    cy.get('div.cdk-overlay-pane').should('exist'); // Ensure the overlay pane is present
    cy.get('div.cdk-overlay-pane mat-option').should(
      'have.length.greaterThan',
      0
    );
    //Select Company prefix
    cy.wait(1500);
    cy.get('mat-option').eq(0).click();
    cy.wait(1500);

    cy.intercept('POST', '**/supportView/v1/person/fromGroup/**').as(
      'uploadCSV'
    );

    //Click on  Create Users button
    cy.get('.dialog-actions>button>.title')
      .contains(/Create Users|Benutzer Anlegen/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    // cy.wait(10000);
    cy.wait(['@uploadCSV'], {
      timeout: 57000,
    }).then((interception) => {
      // Log the intercepted response
      cy.log('Intercepted response:', interception.response);

      // Assert the response status code
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.wait(2000);

    //Validate success message
    cy.get('sv-multiple-notifications>.messages>p')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();

        // Check if the text matches either English or German message
        expect(trimmedText).to.be.oneOf([
          '1 User was updated', // English
          '1 Benutzer wurde aktualisiert', // German
        ]);
      });
    //cy.wait(7500);
    // Wait until the success message disappears completely
    cy.get('sv-multiple-notifications>.messages>p', { timeout: 20000 }).should(
      'not.exist'
    );

    cy.wait(4000);

    //Search for user and check updated data

    //const usersToSearch = ['ottoTestuser']; // Add more usernames as needed

    usersToSearch.forEach((userName) => {
      const searchUser = (userName) => {
        cy.get('.search-label').click();

        // Search for the user
        cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
          .clear()
          .type(userName);

        cy.get('button[type="submit"]').click();

        cy.wait(2000);

        // Check search results
        cy.get('body').then(($body) => {
          if ($body.find('.cdk-row').length === 0) {
            cy.log(`User ${userName} not found.`);
            // Optionally close the search dialog if needed
            cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click({
              force: true,
            });
          } else {
            cy.get('.cdk-row').should('exist');
            cy.log(`User ${userName} found.`);
          }
        });
      };

      cy.wait(1500);
      searchUser(userName);
      cy.wait(1000);
    });
    cy.wait(4500);

    //Logout
    cy.get('.logout-icon ').click({ force: true });
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url
    cy.wait(1500);
  }); //end it

  //Login to e-Box and check does email is nor confirm anymore
  it('Login to e-Box and check does email is nor confirm anymore', () => {
    cy.visit(Cypress.env('baseUrl_egEbox'));
    cy.wait(5000);

    // Wait for the cookie bar to appear
    //Remove Cookie
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        // If the cookie bar is visible, click on it and remove it
        cy.get('#onetrust-accept-btn-handler').click();
      } else {
        // Log that the cookie bar was not visible
        cy.log('Cookie bar not visible');
      }
    }); //End Remove Cookie
    cy.wait(1500);
    // Create the first user (with address)

    // Access the first Admin User object from cypress.config.js
    const csvUser = Cypress.env('csvTestuser')[0];
    // Continue with Login
    cy.log(Cypress.env('companyPrefix'));
    cy.get(':nth-child(1) > .ng-invalid > .input > .input__field-input').type(
      // Cypress.env('companyPrefix') + 'ottoTestuser'
      Cypress.env('companyPrefix') + csvUser.accountNumber
    );

    cy.get('.ng-invalid > .input > .input__field-input').type(
      Cypress.env('password_egEbox')
    );

    // cy.wait(6000);

    // cy.wait(10000);
    // cy.visit(Cypress.env('eboxDeliveryPage'), {
    //   failOnStatusCode: false,
    // });
    cy.wait(5500);

    cy.intercept('POST', '**/rest/v2/deliveries**').as('openDeliveriesPage');
    cy.wait(1000);
    cy.get('button[type="submit"]').click(); //Login to E-Box
    cy.wait(['@openDeliveriesPage'], { timeout: 37000 }).then(
      (interception) => {
        // Log the intercepted response
        cy.log('Intercepted response:', interception.response);

        // Assert the response status code
        expect(interception.response.statusCode).to.eq(200);
        cy.wait(2500);
      }
    );
    cy.wait(7000);

    //Validate banner text in case that email address is not verified
    cy.get('.banner__content')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();

        // Check if the text matches either English or German message
        expect(trimmedText).to.be.oneOf([
          'Your email address is not verified', // English
          'Ihre E-Mail Adresse ist nicht verifiziert', // German
        ]);
      });

    cy.pause();
    // Logout
    cy.get('.user-title').click();
    cy.wait(1500);
    cy.get('.logout-title > a').click();
    //cy.url().should('include', payslipJson.baseUrl_egEbox); // Validate url
    cy.url().should('include', Cypress.env('baseUrl_egEbox')); // Validate url
    cy.log('Test completed successfully.');
  });

  // M A S T E R    U S E R - DELETE ALREADY CREATED USERS
  it('Search for the user and if user(s) exist, proceed with deletion', () => {
    const user = Cypress.env('createUser')[0];
    cy.loginToSupportViewMaster();
    cy.wait(3500);

    // Remove pop up if exists
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(1500);

    // Search for Group by Display Name
    cy.get('#searchButton>span').click();
    const companyName = Cypress.env('company');
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(1)
      .type(companyName);
    cy.get('.search-dialog>form>div>.mat-primary').click();

    // Switch to user section
    cy.get('.action-buttons > .mdc-button').eq(4).click();

    // Array of users to delete
    const usersToDelete = ['ottoTestuser']; // Add more usernames as needed

    usersToDelete.forEach((userName) => {
      const searchAndDeleteUser = (userName) => {
        cy.get('.search-label').click();

        // Search for the user
        cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
          .clear()
          .type(userName);
        cy.get('button[type="submit"]').click();

        cy.wait(2000);

        // Check results
        cy.get('body').then(($body) => {
          if ($body.find('.cdk-row').length === 0) {
            cy.log(`User ${userName} not found or already deleted.`);
            // Close search dialog if needed
            cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click({
              force: true,
            });
          } else {
            // User exists -> proceed with deletion
            cy.get('.cdk-row').should('exist');
            cy.log(`User ${userName} found. Proceeding with deletion.`);

            cy.contains('button', /Delete|DSGVO-Löschung/)
              .should('be.visible')
              .click();

            cy.get('.confirm-buttons > button')
              .contains(/YES|JA/)
              .should('be.visible')
              .click();

            cy.log(`User ${userName} has been deleted.`);
          }
        });
      };

      cy.wait(1500);
      searchAndDeleteUser(userName);
      cy.wait(1000);
    });

    // Logout
    cy.get('.logout-icon').click();
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl'));
    cy.log('The tests have been completed successfully.');
  });

  //Y O P M A I L
  it('Yopmail - Clear inbox', () => {
    const legacyTestuser = Cypress.env('legacyTestuser')[0];

    // Visit yopmail application or login page
    cy.visit('https://yopmail.com/en/');
    // Access the first Admin User object from cypress.config.js
    const csvTestuser = Cypress.env('csvTestuser')[0];
    cy.get('#login').type(csvTestuser.email);
    cy.wait(1500);
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    cy.wait(3500);
    // Delete all emails if the button is not disabled
    cy.get('.menu>div>#delall')
      .should('not.be.disabled')
      .click({ force: true });
    cy.wait(2500);
  }); //end it
}); //end describe
