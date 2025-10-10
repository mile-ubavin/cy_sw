describe('Register User from xml file', () => {
  let extractedUsername = '';
  let extractedPassword = '';

  //Enable xml teplates by Masteruser
  it('Enable XML templates by Masteruser', () => {
    cy.loginToSupportViewMaster(); // Login as a master user
    cy.wait(1500);

    //Remove pop up
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(1500);

    cy.intercept('GET', '**/group/template/tenant/**').as('apiRequest');

    // Search for Group section
    cy.get('#searchButton>span').click(); // Click on the search button

    // Search for Group by Display Name using the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(0)
      .type(Cypress.env('company')); // Use the company name from the cypress.config.js
    cy.wait(1500);

    // Find and click the search button
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    // Search for XML Templates button and click it
    cy.get('.mdc-button__label')
      .contains(/Assign XML Template|XML Template zuweisen/i)
      .should('be.visible')
      .click();

    // Get the array of search criteria names from Cypress environment variables
    const enableXML = Cypress.env('enableXML');
    const searchCriteria = enableXML.map((item) => item.name); // Extract all names

    cy.log('Search Criteria:', searchCriteria);

    // Process the response and enable XML templates from the JSON file
    cy.wait('@apiRequest').then((interception) => {
      cy.log(`Status Code: ${interception.response.statusCode}`);
      const responseBody = interception.response.body;
      cy.log('Response Body:', responseBody);
      findAndCheckElement(searchCriteria);
    });

    const findAndCheckElement = (searchCriteria) => {
      // Iterate through each row in the table
      cy.get('table > tbody > tr')
        .each(($row) => {
          // Check if any search criteria match the row text
          const rowText = $row.text();
          searchCriteria.forEach((criteria) => {
            if (rowText.includes(criteria)) {
              // Check the corresponding checkbox if the criteria match
              cy.wrap($row)
                .find('td:first-child input[type="checkbox"]')
                .check({ force: true });
            }
          });
        })
        .then(() => {
          // Check for the presence of a next page button
          cy.get(
            '.dictionary-xml__table>.additional-elements>.mat-mdc-paginator>div>div>.mat-mdc-paginator-range-actions>.mat-mdc-paginator-navigation-next'
          ).then(($nextButton) => {
            if (!$nextButton.prop('disabled')) {
              $nextButton.click();
              cy.wait(500);
              findAndCheckElement(searchCriteria); // Recursively check the next page
            }
          });
        });
    };

    // Save the changes
    cy.get('.dictionary-xml__actions>button>.title')
      .contains(/Save|Übernehmen/i)
      .should('be.visible')
      .click();

    // Verify the success message
    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /XML template was assigned successfully|XML Template wurde erfolgreich zugewiesen/
        );
      });

    // Logout
    cy.get('.logout-icon').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl'));
    cy.log('Test completed successfully.');
    cy.wait(2500);
  });

  //Enable Craete user Role
  it('Enable Craete user Roles ', () => {
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
      .should('be.visible')
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

  //Register User from xml file
  it('Register User from xml file', () => {
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
    cy.wait(1500);

    //Click On Upload Personal Document Button
    cy.get('.upload__document>.mdc-button__label>.upload__document__text')
      .contains(/Upload Personal Document|Personalisierte Dokumente hochladen/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    //Click on Upload Document button
    cy.get('body').then(($body) => {
      if ($body.find('.buttons-wrapper>button').length > 0) {
        cy.get('.buttons-wrapper>button>.title')
          .filter((index, el) => {
            const text = Cypress.$(el).text().trim();
            return text === 'Upload Document' || text === 'Dokument hochladen';
          })
          .click();
        cy.wait(1500);
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(1500);

    //Upload XML file
    cy.createNewUserFromXMLfile();
    cy.wait(2500);

    cy.intercept(
      'POST',
      '**/deliveryHandler/checkDocumentProcessingStatus**'
    ).as('completeCheckingDocumentProcessingStatus');
    cy.wait(2500);
    cy.get('.dialog-actions>button>.title')
      .contains(/Upload Personal Document|Personalisierte Dokumente hochladen/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button

    cy.wait(['@completeCheckingDocumentProcessingStatus'], {
      timeout: 37000,
    }).then((interception) => {
      // Log the intercepted response
      cy.log('Intercepted response:', interception.response);

      // Assert the response status code
      expect(interception.response.statusCode).to.eq(200);
    });

    //Waiting For Success Message

    // cy.intercept(
    //   'POST',
    //   '**/deliveryHandler/checkDocumentProcessingStatus**'
    // ).as('waitingForMessage');
    // cy.wait(2500);
    // cy.wait(['@waitingForMessage'], {
    //   timeout: 27000,
    // }).then((interception) => {
    //   // Log the intercepted response
    //   cy.log('Intercepted response:', interception.response);

    //   // Assert the response status code
    //   expect(interception.response.statusCode).to.eq(200);
    // });
    cy.wait(4000);

    // Verify success message, after uplading document
    cy.get('.list-item-status>.success')
      .should('be.visible') // Ensure it's visible first
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Document successfully uploaded|Dokument erfolgreich hochgeladen/
        );
      });
    cy.wait(2500);

    //Click on Send button, to process delivery
    cy.get('.dialog-actions>button>.title')
      .contains(/Send|Senden /i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    // //Confirm dialog for sending delivery to all users from selected company
    // cy.get('.title')
    //   .contains(/Confirm|Bestätigen/i)
    //   .should('be.visible') // Optional: Ensure the button is visible before interacting
    //   .click(); // Click the button
    // cy.wait(1500);

    // Verify the success message
    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible') // Ensure it's visible first
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /We are processing in the background|Wir verarbeiten im Hintergrund/
        );
      });
    cy.wait(2500);

    //Search for user

    // Search for Group by Display Name
    cy.get('#searchButton>span').click();
    const companyName = Cypress.env('company');
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(1)
      .type(companyName);
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(2500);

    // Switch to user section
    // cy.get('.action-buttons > .mdc-button').eq(4).click();

    //Switch to User page
    cy.get('.action-buttons>.mdc-button>.mdc-button__label')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'User' || text === 'Benutzer';
      })
      .click({ force: true });
    cy.wait(2500);

    const usersToSearch = ['jat']; // Add more usernames as needed

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
            // No results found → fail test and stop execution
            throw new Error(`ERRROR -> User "${userName}" not found.`);
          } else {
            // User exists
            cy.get('.cdk-row').should('exist');
            cy.log(`User "${userName}" found.`);
          }
        });
      };

      cy.wait(1500);
      searchUser(userName);
    });

    cy.wait(2500);

    // Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url'
    cy.log('Test completed successfully.');
    cy.wait(2500);
  });

  //Yopmail - Extract Username & Password from Registration email
  it('Extract Username & Password from Registration email', () => {
    cy.visit('https://yopmail.com/en/');

    // Access email inbox
    cy.get('#login').type(Cypress.env('companyEmail'));
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    cy.wait(1500);

    // Validate subject
    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .eq(0)
      .should('include.text', 'Neuer Benutzer angelegt e-Gehaltszettel Portal');

    //Extract un/pw from email body
    cy.iframe('#ifmail')
      .find('p')
      .invoke('text')
      .then((emailBody) => {
        cy.log('Full Email Body:', emailBody);

        // Extract username and password
        const usernameMatch = emailBody.match(/Benutzername:\s*([\S]+)/);
        const passwordMatch = emailBody.match(/Passwort:\s*([\S]+)/);

        if (usernameMatch && passwordMatch) {
          extractedUsername = usernameMatch[1].trim();
          extractedPassword = passwordMatch[1].trim();

          //Set credentials and store it as extractedUsername, extractedPassword in the cyperss.config.js file
          cy.task('setCredentials', { extractedUsername, extractedPassword });

          cy.log(`Stored Username: ${extractedUsername}`);
          cy.log(`Stored Password: ${extractedPassword}`);
        }
        cy.wait(2500);
      });
  });

  //1st time Login to E-Box with Extracted Credentials
  it('1st time Login to E-Box with Extracted Credentials', () => {
    cy.wait(1500);

    cy.visit(Cypress.env('baseUrl_egEbox'));
    cy.wait(3000);

    // Remove Cookie Banner
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click();
      } else {
        cy.log('Cookie bar not visible');
      }

      //Get credentials from cyperss.config.js file
      cy.task('getCredentials').then((creds) => {
        cy.log(`Username: ${creds.extractedUsername}`);
        cy.log(`Password: ${creds.extractedPassword}`);

        // Type username and password
        cy.get(':nth-child(1) > .ng-invalid > .input > .input__field-input')
          .should('be.visible')
          .type(`${creds.extractedUsername}`);

        cy.wait(1500);

        cy.get('.ng-invalid > .input > .input__field-input')
          .should('be.visible')
          .type(`${creds.extractedPassword}`);

        // Validate API request after login
        cy.intercept('POST', '**/rest/v2/deliveries**').as(
          'openDeliveriesPage'
        );
        // Submit login
        cy.get('button[type="submit"]').click();
        cy.wait(1500);

        //Wail until deliveries page became load
        cy.wait('@openDeliveriesPage', { timeout: 37000 }).then(
          (interception) => {
            cy.log('Intercepted response:', interception.response);
            expect(interception.response.statusCode).to.eq(200);

            cy.wait(2500);

            // Logout
            cy.get('.user-title').click();
            cy.wait(1500);
            cy.get('.logout-title > a').click();
            cy.url().should('include', Cypress.env('baseUrl_egEbox')); // Validate URL
            cy.log('Test completed successfully.');
          }
        );
      });
    });
  });

  // Delete e-box user by Masteruser
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

    cy.task('getCredentials').then((creds) => {
      cy.log(`Username: ${creds.extractedUsername}`);

      // Search for the user
      cy.get('.search-label').click();

      // Type the username as a search criterion
      cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
        .clear() // Clear any previous input
        .type(`${creds.extractedUsername}`);

      // Click on the submit button to search
      cy.get('button[type="submit"]').click();

      // Click the delete button (adjust the selector as per your app)
      cy.get('button')
        .contains(/Delete|DSGVO-Löschung/)
        .click();
      cy.wait(2000);
      // Confirm delete in the confirmation dialog
      cy.get('.confirm-buttons > button')
        .filter((index, button) => {
          return (
            Cypress.$(button).text().trim() === 'YES' ||
            Cypress.$(button).text().trim() === 'JA'
          );
        })
        .click();
      cy.wait(2000);
      // Log the deletion
      cy.log(`User ${creds.extractedUsername} has been deleted.`);

      //Search for just deleted user
      cy.get('#searchButton').click({ force: true });
      cy.wait(1500);

      cy.get('button[type="submit"]').click(); //Click on Search button
      cy.wait(2500);

      //Already deleted user is not founded

      cy.get('.mat-mdc-paginator-range-actions>.mat-mdc-paginator-range-label')
        .invoke('css', 'border', '1px solid blue')
        .invoke('text') // Get the text of the element
        .then((text) => {
          // Trim the text and validate it
          const trimmedText = text.trim();
          expect(trimmedText).to.match(/0 of 0|0 von 0/);
        });

      cy.wait(2500);
    }); // end get crdentals

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

  //Yopmail - Clear inbox
  it('Yopmail - Clear inbox', () => {
    // Visit yopmail application or login page
    cy.visit('https://yopmail.com/en/');
    cy.get('#login').type(Cypress.env('companyEmail'));
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    cy.wait(1500);

    // Delete all emails if the button is not disabled
    cy.get('.menu>div>#delall')
      .should('not.be.disabled')
      .click({ force: true });
    cy.wait(2500);
  }); //end it
});
