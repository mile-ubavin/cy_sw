describe('R03_Admn user - Create E-Box User - Manually', () => {
  //Enable All Roles (except HR Role)
  it('Enable All Roles, except HR Role for Specific Admin', () => {
    // Login as a Master-User using custom command
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

    // Search for Company by Display Name
    cy.get('#searchButton>span').click(); //Click on search button
    cy.wait(1000);
    // Search for Group by Display Name using the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(0)
      .type(Cypress.env('company')); // Use the company name from the cypress.config.js
    cy.wait(1500);
    //Find the Search button by button name and click on it
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    //Click On Admin UserbButton
    cy.get('.mdc-button__label')
      // Find the button containing "Admin User" or "Admin Benutzer" button
      .contains(/Admin User|Admin Benutzer/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    //Search For Admin And Open Role Dialog

    //Search for Aqua Admin
    cy.get('.search').click({ force: true });
    //Search for Admin using username
    cy.get('input[formcontrolname="userName"]').type(
      Cypress.env('username_supportViewAdmin')
    );
    // Click on Search for Admin User button
    cy.get('button[type="submit"]').click();
    cy.wait(2000);
    //Click on Role
    cy.get('.mdc-button__label')
      .contains(/Rechte|Rights/i) // Find the button containing "Rechte" or "Rights"
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button

    // Enable All Roles, except HR Role, for specific Admin user
    const rolesToEnable = [
      ['Company Admin', 'Firmen-Administrator'],
      ['Customer Creator', 'Nutzeranlage'],
      ['Data Submitter', 'Versand'],
      ['View E-Box', 'E-Box ansehen'],
      // ['HR Manager', 'HR Manager'],
    ];

    cy.get('.mat-mdc-checkbox > div > .mdc-label')
      .should('exist') // Ensure checkbox labels exist
      .each(($label) => {
        const text = $label.text().trim();

        // Check if text matches any role in either English or German
        if (rolesToEnable.some(([en, de]) => text === en || text === de)) {
          cy.wrap($label)
            .parent()
            .find('input[type="checkbox"]') // Locate the checkbox input
            .then(($checkboxInput) => {
              cy.wrap($checkboxInput)
                .invoke('prop', 'checked')
                .then((isChecked) => {
                  if (!isChecked) {
                    // Enable the role if it's not already checked
                    cy.wrap($checkboxInput).click({ force: true });
                    cy.log(
                      `Checkbox for "${text}" was not enabled; now enabled.`
                    );
                  } else {
                    cy.log(`Checkbox for "${text}" is already enabled.`);
                  }
                });
            });
        }
      });

    cy.wait(1500);

    // Submit the changes
    cy.get('button[type="submit"]').click();
    cy.wait(1500);

    // Verify the success message
    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible') // Ensure it's visible first
      .invoke('text') // Get the text of the element
      .then((snackText) => {
        const trimmedText = snackText.trim();
        expect(trimmedText).to.match(/Rights updated|Rechte aktualisiert/);
      });

    cy.wait(3000);
    // Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url'
    cy.log('Test completed successfully.');
    cy.wait(2500);
  }); //end it

  // Precondition: Search for the user and if user exists, proceed with deletion
  it('Search for the user and if user(s) exists, proceed with deletion', () => {
    // Login as Master User using a custom command
    const user = Cypress.env('createUser')[0];
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

    //Search for Group by Display Name
    cy.get('#searchButton>span').click(); //Click on search button
    // Use the company name from the cypress.config.js
    const companyName = Cypress.env('company');
    // Search for Group by Display Name using the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(1)
      .type(companyName);
    //Find the Search button by button name and click on it
    cy.get('.search-dialog>form>div>.mat-primary').click();
    //Switch to user section
    cy.get('.action-buttons > .mdc-button').eq(4).click();

    // Array of users to delete
    const usersToDelete = [user.username]; // Add more usernames as needed

    usersToDelete.forEach((userName) => {
      const searchAndDeleteUser = (userName) => {
        cy.get('.search-label').click();

        // Search for the user
        cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
          .clear()
          .type(userName);
        cy.get('button[type="submit"]').click();

        // Wait for the search results
        cy.wait(2000);

        // Check if "No results" message exists (indicating user does not exist)
        cy.get('body').then(($body) => {
          if ($body.find('.cdk-row').length === 0) {
            cy.log(`User ${userName} not found or already deleted.`);
            cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click();
          } else {
            // If user exists, proceed with deletion
            cy.get('cdk-row').should('exist');
            cy.log(`User ${userName} found. Proceeding with deletion.`);

            cy.get('button')
              .contains(/Delete|DSGVO-Löschung/)
              .should('be.visible')
              .click();

            // Wait for confirmation dialog and confirm deletion
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

      // Optional wait between deletions (if needed)
      cy.wait(1000);
    });

    //Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url
    cy.wait(1500);
    // Completion message at the end of the test
    cy.log('The tests have been completed successfully.');
    cy.wait(3000);
  }); //end it

  //Login As Admin user and Create User Manually
  it('Login As Admin user and Create User Manually', () => {
    // Login as Admin User using a custom command
    cy.loginToSupportViewAdmin();
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

    cy.get('.action-buttons>.mdc-button>.mdc-button__label')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'User' || text === 'Benutzer';
      })
      .click({ force: true });

    // Function to create a user
    function createUser(user) {
      // Click 'Create User' button
      cy.get('button > .mdc-button__label')
        .filter((index, el) => {
          const text = Cypress.$(el).text().trim();
          return text === 'Create/Update' || text === 'Anlegen/Updaten';
        })
        .click({ force: true });

      cy.wait(1500);

      // Click on Manual Creation
      cy.get('.create_user_dialog_content>.buttons-wrapper>button')
        .filter((index, el) => {
          const text = Cypress.$(el).text().trim();
          return text === 'Manuel Creation' || text === 'Manuelle Anlage';
        })
        .click();

      // Fill in user details
      cy.get('mat-select[formControlName="salutation"]').click();
      cy.get('mat-option').eq(0).click({ force: true });

      cy.get('input[formcontrolname="firstName"]').type(user.firstName);
      cy.get('input[formcontrolname="lastName"]').type(user.lastName);
      cy.get('input')
        .filter((index, input) => {
          const placeholder = Cypress.$(input).attr('placeholder');
          return (
            placeholder &&
            (placeholder.trim() === 'Account Number *' ||
              placeholder.trim() === 'Personalnummer *')
          );
        })
        .click()
        .type(user.username);

      cy.get('input[formcontrolname="email"]').type(user.email);

      // Select phone number prefix
      cy.get(
        ':nth-child(4) > .mat-mdc-form-field-type-mat-select > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix'
      ).click();
      cy.wait(500);
      cy.get('.mdc-list-item').eq(0).click();

      // Fill phone number fields
      cy.get('input[formcontrolname="countryCodePhoneNum"]')
        .click({ force: true })
        .type(user.countryCodePhoneNum);
      cy.get('input[formcontrolname="netNumberPhoneNum"]').type(
        user.netNumberPhoneNum
      );
      cy.get('input[formcontrolname="subscriberNumberPhoneNum"]').type(
        user.subscriberNumberPhoneNum
      );

      // Fill in address if available
      if (user.streetName) {
        cy.get('input[formcontrolname="streetName"]').type(user.streetName);
        cy.get('input[formcontrolname="streetNumber"]').type(user.streetNumber);
        cy.get('input[formcontrolname="doorNumber"]').type(user.doorNumber);
        cy.get('input[formcontrolname="zipCode"]').type(user.zipCode);
        cy.get('input[formcontrolname="city"]').type(user.city);
      }

      // Fill in title
      cy.get('input[formcontrolname="prefixedTitle"]').type(user.prefixedTitle);

      //cy.get('button[type="submit"]').click({ force: true });
      cy.wait(1500);
      // Submit the form
      cy.get('button[color="primary"]>.mdc-button__label')
        .filter((index, button) => {
          return (
            Cypress.$(button).text().trim() === 'Submit' ||
            Cypress.$(button).text().trim() === 'Absenden'
          );
        })
        .click({ force: true });
      cy.wait(1500);
    } //end create usr function

    // Create the first user (with address)
    createUser(Cypress.env('createUser')[0]);

    // Access the first Admin User object from cypress.config.js
    const user = Cypress.env('createUser')[0];

    // Validate success message
    cy.get('sv-multiple-notifications>.messages>p')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();

        // Check if the text matches either English or German success message
        expect(trimmedText).to.be.oneOf([
          'User created', // English
          'Benutzer angelegt', // German
        ]);

        // //Download credentials
        // cy.get('.download-bttn').click();
        // cy.wait(1000);

        // // Get the latest downloaded PDF file
        // const downloadsDir = `${Cypress.config(
        //   'fileServerFolder'
        // )}/cypress/downloads/`;
        // cy.task('getDownloadedPdf', downloadsDir).then((filePath) => {
        //   expect(filePath).to.not.be.null; // Assert the file exists
        //   cy.log(`Latest PDF File Path: ${filePath}`);
        //   cy.wait(3000);
        //   // Read the PDF content and open in the same tab using a Blob
        //   cy.readFile(filePath, 'binary').then((pdfBinary) => {
        //     const pdfBlob = Cypress.Blob.binaryStringToBlob(
        //       pdfBinary,
        //       'application/pdf'
        //     );
        //     const pdfUrl = URL.createObjectURL(pdfBlob);

        //     // Open the PDF in the same tab
        //     cy.window().then((win) => {
        //       win.location.href = pdfUrl; // Loads the PDF in the same window
        //     });
        //   });
        // });

        cy.wait(2500);

        //Skip download e-box user's credentials
        cy.get('.wrapper>.cancel-bttn').click();
        cy.wait(1500);

        // Logout
        cy.get('.logout-icon ').click();
        cy.wait(2000);
        cy.get('.confirm-buttons > :nth-child(2)').click();
        cy.url().should('include', Cypress.env('baseUrl')); // Validate url'
        cy.log('Test completed successfully.');
        cy.wait(2500);
      });
  }); //end it

  //Yopmail - Confirm email and Change password
  it('Yopmail - Confirm email and Change password', () => {
    // Visit yopmail application
    cy.visit('https://yopmail.com/en/');

    // Access the first Admin User object from cypress.config.js
    const user = Cypress.env('createUser')[0];
    cy.get('#login').type(user.email);
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
        //Wait for Cookie bar
        cy.wait(15000);

        // // //Remove Cooki dialog (if shown)
        // if (cy.iframe('#ifmail').find('#onetrust-accept-btn-handler')) {
        //   cy.iframe('#ifmail').find('#onetrust-accept-btn-handler').click();
        // } else {
        //   cy.log('Cookie dialog is not shown');
        // }

        // Remove Cookie dialog (if shown)
        cy.iframe('#ifmail').then(($iframe) => {
          if ($iframe.find('#onetrust-policy-title').is(':visible')) {
            cy.wrap($iframe)
              .find('#onetrust-accept-btn-handler')
              .click({ force: true });
            cy.log('Cookie dialog closed.');
          } else {
            cy.log('Cookie dialog not visible.');
          }
        });
        cy.wait(1500);

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
        cy.wait(5000);
        //Reset Password email

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

          .type(Cypress.env('password_egEbox')); //fill the 2nd input field
        cy.iframe('#ifmail').find('.input-eye-icon').eq(1).click(); //Click on Show password icon
        cy.iframe('#ifmail').find('.button').click(); //Click on confirm button

        cy.wait(2000);
      });
  });

  //Login to ebox 1st time
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
    const user = Cypress.env('createUser')[0];
    // Continue with Login
    cy.log(Cypress.env('companyPrefix'));
    cy.get(':nth-child(1) > .ng-invalid > .input > .input__field-input').type(
      Cypress.env('companyPrefix') + user.username
    );

    //Cypress.env('manualAddress')
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
    // Logout
    cy.get('.user-title').click();
    cy.wait(1500);
    cy.get('.logout-title > a').click();
    //cy.url().should('include', payslipJson.baseUrl_egEbox); // Validate url
    cy.url().should('include', Cypress.env('baseUrl_egEbox')); // Validate url
    cy.log('Test completed successfully.');
  }); //end it

  //Delete Alredy created Users by Master User
  it('Login As Master User - Delete Alredy created Users', () => {
    // Login as Master User using a custom command
    const user = Cypress.env('createUser')[0];
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

    //Search for Group by Display Name
    cy.get('#searchButton>span').click(); //Click on search button
    // Use the company name from the cypress.config.js
    const companyName = Cypress.env('company');
    // Search for Group by Display Name using the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(1)
      .type(companyName);
    //Find the Search button by button name and click on it
    cy.get('.search-dialog>form>div>.mat-primary').click();
    //Switch to user section
    cy.get('.action-buttons > .mdc-button').eq(4).click();

    // Array of users to delete
    const usersToDelete = [user.username]; // Add more usernames as needed

    // usersToDelete.forEach((userName, index) => {
    //   // Function to search for and delete a user
    //   const searchAndDeleteUser = (userName) => {
    //     // Search for the user
    //     cy.get('.search-label').click();

    //     // Type the username as a search criterion
    //     cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
    //       .clear() // Clear any previous input
    //       .type(userName);

    //     // Click on the submit button to search
    //     cy.get('button[type="submit"]').click();

    //     // Wait for search results to load (adjust as needed for dynamic loading)
    //     cy.get('body').then(($body) => {
    //       if ($body.find('.no-results-message').length > 0) {
    //         // If the user doesn't exist or is already deleted
    //         cy.log(`User ${userName} not found or already deleted.`);

    //         // Reset the search by clicking on the reset button
    //         cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click();

    //         // Proceed with the next search criteria
    //         if (index < usersToDelete.length - 1) {
    //           cy.log(
    //             `Proceeding with the next user: ${usersToDelete[index + 1]}`
    //           );
    //         }
    //       } else {
    //         // If the user is found, proceed with the deletion
    //         cy.log(`User ${userName} found. Proceeding with deletion.`);

    //         // Click the delete button (adjust the selector as per your app)
    //         cy.get('button')
    //           .contains(/Delete|DSGVO-Löschung/)
    //           .click();
    //         cy.wait(2000);
    //         // Confirm delete in the confirmation dialog
    //         cy.get('.confirm-buttons > button')
    //           .filter((index, button) => {
    //             return (
    //               Cypress.$(button).text().trim() === 'YES' ||
    //               Cypress.$(button).text().trim() === 'JA'
    //             );
    //           })
    //           .click();
    //         cy.wait(2000);
    //         // Log the deletion
    //         cy.log(`User ${userName} has been deleted.`);

    // Array of users to delete
    //const usersToDelete = ['manualAddress', 'manualNoAddress'];

    usersToDelete.forEach((userName) => {
      const searchAndDeleteUser = (userName) => {
        cy.get('.search-label').click();

        // Search for the user
        cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
          .clear()
          .type(userName);
        cy.get('button[type="submit"]').click();

        // Wait for the search results
        cy.wait(2000);

        // Check if "No results" message exists (indicating user does not exist)
        cy.get('body').then(($body) => {
          if ($body.find('.cdk-row').length === 0) {
            cy.log(`User ${userName} not found or already deleted.`);
            cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click();
          } else {
            // If user exists, proceed with deletion
            cy.get('cdk-row').should('exist');
            cy.log(`User ${userName} found. Proceeding with deletion.`);

            cy.get('button')
              .contains(/Delete|DSGVO-Löschung/)
              .should('be.visible')
              .click();

            // Wait for confirmation dialog and confirm deletion
            cy.get('.confirm-buttons > button')
              .contains(/YES|JA/)
              .should('be.visible')
              .click();

            cy.log(`User ${userName} has been deleted.`);

            // Reset the search to clear out the search pill
            //  cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click();
          }
        });
      };
      cy.wait(1500);
      searchAndDeleteUser(userName);

      // Optional wait between deletions (if needed)
      cy.wait(1000);
    });

    //Search for just deleted Admin user
    cy.get('#searchButton').click({ force: true });
    cy.wait(1500);

    cy.get('button[type="submit"]').click(); //Click on Search button
    cy.wait(2500);

    //Already deleted Admin user is not founded

    cy.get('.mat-mdc-paginator-range-actions>.mat-mdc-paginator-range-label')
      .invoke('css', 'border', '1px solid blue')
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(/0 of 0|0 von 0/);
        //    });

        cy.wait(2500);
        //     }
        //     });
        //    };
        // Call the function to search and delete user
        //  searchAndDeleteUser(userName);

        // Optional wait between deletions (if needed)
        cy.wait(1000);
      });

    //Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url
    cy.wait(1500);
    // Completion message at the end of the test
    cy.log('The tests have been completed successfully.');
    cy.wait(3000);
  }); //end it

  it('Yopmail - Clear inbox', () => {
    const user = Cypress.env('createUser')[0];

    // Visit Yopmail with an extended timeout
    cy.visit('https://yopmail.com/en/', { timeout: 90000 });

    // Ensure the login field is visible before typing
    cy.get('#login', { timeout: 30000 })
      .should('be.visible')
      .type(user.email)
      .type('{enter}');

    // Ensure the inbox iframe is loaded
    cy.frameLoaded('#ifinbox');

    // Wait for inbox content to appear
    cy.wait(3000);

    // Check if inbox is empty or has emails
    // cy.iframe('#ifinbox').then(($iframe) => {
    //   const emails = $iframe.find('.mctn > .m'); // Selector for emails
    //   const emptyInboxMessage = $iframe.find('.bname').text().trim(); // Check for "No new messages" text

    //   if (emails.length > 0) {
    //     cy.log(
    //       `Inbox contains ${emails.length} email(s), proceeding with deletion.`
    //     );

    //     // Click delete all emails button if enabled
    //     cy.get('.menu>div>#delall')
    //       .should('not.be.disabled')
    //       .click({ force: true });

    //     cy.wait(2500);
    //   } else if (
    //     emptyInboxMessage.includes('No new messages') ||
    //     emails.length === 0
    //   ) {
    //     cy.log('Inbox is empty, skipping deletion.');
    //   } else {
    //     cy.log('Could not determine inbox state.');
    //   }
    // });
  });

  //Yopmail - Clear inbox
  it('Yopmail - Clear inbox', () => {
    const user = Cypress.env('createUser')[0];

    // Visit yopmail application or login page
    cy.visit('https://yopmail.com/en/');
    cy.get('#login').type(user.email);
    cy.wait(1500);
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    cy.wait(1500);
    // Delete all emails if the button is not disabled
    cy.get('.menu>div>#delall')
      .should('not.be.disabled')
      .click({ force: true });
    cy.wait(2500);
  }); //end it

  it.skip('getCookie and Store it as a global variabile', () => {
    cy.intercept('POST', '**/login/user').as('getToken'); // Intercept login request
    cy.loginToSupportViewAdmin(); // Perform login
    cy.wait(1500);

    cy.wait('@getToken', { timeout: 37000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);

      // Extract 'set-cookie' header
      const setCookieHeaders = interception.response.headers['set-cookie'];
      cy.log('Set-Cookie Headers:', setCookieHeaders);

      if (setCookieHeaders && setCookieHeaders.length > 0) {
        // Find the header that contains SV_AUTH
        const authCookie = setCookieHeaders.find((cookie) =>
          cookie.startsWith('SV_AUTH=')
        );

        if (authCookie) {
          // Extract the SV_AUTH value
          const match = authCookie.match(/SV_AUTH=([^;]+)/);
          if (match) {
            const authCookieValue = match[1];
            cy.log('Extracted SV_AUTH Cookie:', authCookieValue);

            // Store in Cypress env variable
            Cypress.env('authCookieValue', authCookieValue);
          }
        }
      }
      cy.wait(2500);
    });
  });
}); //end describe
