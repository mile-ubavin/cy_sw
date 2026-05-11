///<reference types="cypress" />

describe('DH_EG_03_Employees_TS_Edit_User', () => {
  //Try to Create New User when User already exist
  it('DH - Try to Create New User when accountNumber already exist', () => {
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.url().should('include', Cypress.env('dh_baseUrl'));

    // Remove Cookie dialog if present
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      } else {
        cy.log('Cookie bar not visible');
      }
    });

    // Login to SupportView using custom command
    cy.loginToDH();

    // Wait for generalInfo to confirm login success
    cy.wait(2000);

    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);
    cy.wait(1000);

    // Click on Admin User button (from sidebar navigation menu)
    cy.intercept('GET', '**/person/fromGroup/**').as('getEmployees');
    cy.get('#nav-employees')
      .should('be.visible')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      .wait(1500)
      .click();

    cy.wait('@getEmployees', { timeout: 15000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.wait(1500);

    //Select Company from dropdown
    const companyName = Cypress.env('company').toLowerCase();

    // Open the dropdown
    cy.get('#employee-select-company').click({ force: true });
    cy.wait(1000);

    // Find and click the matching option (ignore case, use contains for partial match)
    cy.get('ul[role="listbox"] > li > span')
      .should('be.visible')
      .then(($options) => {
        const match = [...$options].find((el) =>
          el.textContent.trim().toLowerCase().includes(companyName),
        );
        if (match) {
          cy.wrap(match).click({ force: true });
        } else {
          throw new Error(`No dropdown option contains: ${companyName}`);
        }
      });
    cy.wait(500);

    //Scroll to top to ensure "Create new Admin" button is visible
    cy.scrollTo('top', { duration: 500 });

    cy.pause();
    cy.wait(500);

    // Click "Create new person"
    cy.get('#employee-add-employee')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
      .wait(1000)
      .contains(/Neuen Kontakt anlegen|Create New Contact/i) // DE + EN
      .click();

    cy.wait(500);

    // Validate Title of Create User dialog
    cy.get('h2')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Neuen Kontakt anlegen|Create New Contact/,
        );
      });

    cy.wait(500);

    cy.pause();
    //Validate labels on form 1
    // cy.get('form>div:nth-of-type(2)')

    // Get user test data from cypress.config.js
    const user = Cypress.env('createUser')[0];

    //fill input fields 1st step
    cy.get('#create-user-prefixed-title').type(user.prefixedTitle);
    cy.get('#create-user-firstName').type(user.firstName);
    cy.get('#create-user-lastName').type(user.lastName);
    cy.get('#create-user-suffixed-title').type(user.prefixedTitle2);

    //select Company prefix
    cy.get('input[aria-autocomplete="list"]').click({ force: true });
    cy.wait(1000);
    //cy.get("ul[role='listbox'] > li:nth-of-type(1)").click({ force: true });
    cy.get("ul[role='listbox'] > li")
      .should('be.visible')
      .each(($el) => {
        const text = $el.text().trim().toLowerCase();
        cy.log('***************************', text);

        if (text === 'aqua - aqua' || text === 'aqua - Aqua') {
          cy.wrap($el).click({ force: true });
        }
      });

    cy.pause();
    cy.get('#create-user-accountNumber').type(user.username);
    cy.wait(1000);

    // Try Switching to 2nd step
    cy.get('#create-user-next')
      .contains(/weiter|Next/i)
      .click({ force: true });
    cy.wait(1000);

    //Validate Error message
    cy.get('div[role="alert"]>div')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Invalid person account number|Benutzer konnte nicht erstellt werden/,
        );
      });

    cy.wait(3500);
  });

  // Precondition: Search for the user and if user exists, proceed with deletion
  it('Search for the user and if user(s) exists, proceed with deletion', () => {
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
      .eq(0)
      .type(companyName);
    //Find the Search button by button name and click on it
    cy.get('.search-dialog>form>div>.mat-primary').click();
    //Switch to user section
    cy.get('.action-buttons > .mdc-button').eq(4).click();

    // Array of users to delete
    const usersToDelete = ['manualAddress', 'manualNoAddress'];

    usersToDelete.forEach((userName) => {
      const searchAndDeleteUser = (userName) => {
        cy.get('.search-label').click();

        ///person/fromGroup/

        cy.intercept('POST', '**/person/fromGroup/**').as('personFromGroup');
        cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
          .clear()
          .type(userName);
        cy.get('button[type="submit"]').click();
        cy.wait('@personFromGroup', { timeout: 10000 }).then((interception) => {
          expect(interception.response.statusCode).to.eq(200);
          cy.log('Search completed');
        });

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
            cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click();
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
    cy.wait(3000);
  }); //end it

  //Create New User when SentToPint:true
  it('DH - Create New User when SentToPint:true', () => {
    // Visit DH
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.url().should('include', Cypress.env('dh_baseUrl'));

    // Remove Cookie dialog if present
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      } else {
        cy.log('Cookie bar not visible');
      }
    });

    // Login to SupportView using custom command
    cy.loginToDH();

    // Wait for generalInfo to confirm login success
    cy.wait(2000);

    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);
    cy.wait(1000);

    // Click on Admin User button (from sidebar navigation menu)
    cy.intercept('GET', '**/person/fromGroup/**').as('getEmployees');
    cy.get('#nav-employees')
      .should('be.visible')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      .wait(1500)
      .click();

    cy.wait('@getEmployees', { timeout: 15000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.wait(1500);

    //Select Company from dropdown
    const companyName = Cypress.env('company').toLowerCase();

    // Open the dropdown
    cy.get('#employee-select-company').click({ force: true });
    cy.wait(1000);

    // Find and click the matching option (ignore case, use contains for partial match)
    cy.get('ul[role="listbox"] > li > span')
      .should('be.visible')
      .then(($options) => {
        const match = [...$options].find((el) =>
          el.textContent.trim().toLowerCase().includes(companyName),
        );
        if (match) {
          cy.wrap(match).click({ force: true });
        } else {
          throw new Error(`No dropdown option contains: ${companyName}`);
        }
      });
    cy.wait(500);

    //Scroll to top to ensure "Create new Admin" button is visible
    cy.scrollTo('top', { duration: 500 });

    cy.wait(500);

    // Click "Create new person"
    cy.get('#employee-add-employee')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
      .wait(1000)
      .contains(/Neuen Kontakt anlegen|Create New Contact/i) // DE + EN
      .click();

    cy.wait(500);

    // Validate Title of Create User dialog
    cy.get('h2')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Neuen Kontakt anlegen|Create New Contact/,
        );
      });

    cy.wait(500);

    //Validate labels on form 1
    // cy.get('form>div:nth-of-type(2)')

    // Get user test data from cypress.config.js
    const user = Cypress.env('createUser')[0];

    //fill input fields 1st step
    cy.get('#create-user-prefixed-title').type(user.prefixedTitle);
    cy.get('#create-user-firstName').type(user.firstName);

    //Enter Last Name
    cy.get('#create-user-lastName').focus().blur();
    // Validate error message for empty required field
    cy.get('div[role="alert"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Required field|Pflichtfeld/i);
      });
    cy.wait(1000);
    cy.get('#create-user-lastName').type(user.lastName);
    cy.get('#create-user-suffixed-title').type(user.prefixedTitle2);

    //Select Company prefix
    cy.get('input[aria-autocomplete="list"]').focus().blur();
    // Validate error message for empty required field
    cy.get('div[role="alert"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Required field|Pflichtfeld/i);
      });
    cy.wait(1000);

    cy.get('input[aria-autocomplete="list"]').click({ force: true });
    cy.wait(1000);
    //cy.get("ul[role='listbox'] > li:nth-of-type(1)").click({ force: true });
    cy.get("ul[role='listbox'] > li")
      .should('be.visible')
      .each(($el) => {
        const text = $el.text().trim().toLowerCase();
        cy.log('***************************', text);

        if (text === 'aqua - aqua' || text === 'aqua - Aqua') {
          cy.wrap($el).click({ force: true });
        }
      });

    //Enter Account Number
    cy.get('#create-user-accountNumber').focus().blur();
    // Validate error message for empty required field
    cy.get('div[role="alert"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Required field|Pflichtfeld/i);
      });
    cy.wait(1000);

    cy.get('#create-user-accountNumber').type(user.username);
    cy.pause();
    cy.wait(1000);

    // Switching to 2nd step
    // cy.get('#create-user-next > div:nth-of-type(1)').should(
    //   'match',
    //   /Weiter|Next/i,
    // );

    cy.get('#create-user-next').click({ force: true });

    // Switch to 2nd step

    // Create User wizzard Step:2

    //Telephone number
    cy.get('#create-user-mobileNumber').type('invalid_phone_number').blur();
    // Validate error message for invalid phone number format
    cy.get('div[role="alert"]')
      .should('be.visible')
      .should(($el) => {
        const text = $el.text().trim();
        expect(text).to.match(
          /Invalid value\. Please enter the phone number including the country code \(e\.g\., \+43(?:\.\.\.|…), \+49(?:\.\.\.|…)\)|Ungültiger Wert\. Bitte geben Sie die Telefonnummer einschließlich der Landesvorwahl ein \(z\. B\. \+43(?:\.\.\.|…), \+49(?:\.\.\.|…)\)/i,
        );
      });
    cy.wait(1000);
    //Enter valid phone number
    cy.get('#create-user-mobileNumber').clear().type('+43 1234567890');

    //Email
    cy.get('#create-user-email').type('invalid-email-format').blur();
    // Validate error message for empty required field
    cy.get('div[role="alert"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Invalid email format|Das E-Mail-Format ist ungültig/i,
        );
      });
    cy.wait(1000);

    cy.get('#create-user-email').clear().type(user.email);

    //Address data
    cy.get('#create-user-street').type(user.streetName);
    cy.get('#create-user-streetNumber').type(user.streetNumber);
    cy.get('#create-user-apartment').type(user.doorNumber);
    cy.get('#create-user-zipCode').type(user.zipCode);
    cy.get('#create-user-city').type(user.city);

    cy.wait(2000);

    // Switch to 3th (final) step
    cy.get('#create-user-next').click({ force: true });

    // Create User wizzard Step:3
    cy.wait(1500);

    //select first dropdown (Versandart) - check if enabled
    cy.get('#create-user-deliveryType').then(($dropdown) => {
      const isDisabled =
        $dropdown.attr('aria-disabled') === 'true' ||
        $dropdown.hasClass('Mui-disabled') ||
        $dropdown.find('.Mui-disabled').length > 0;

      if (isDisabled) {
        cy.log('First dropdown is disabled, skipping selection');
      } else {
        cy.wrap($dropdown).click({ force: true });
        cy.wait(500);

        //Select Digital option from dropdown
        cy.get("ul[role='listbox'] > li > span")
          .should('be.visible')
          .contains(/^digital$/i)
          .click({ force: true });

        cy.wait(500);
      }
    });

    //Select second dropdown (Zustellart) - check if enabled
    cy.get('#create-user-sendCredentials').then(($dropdown) => {
      const isDisabled =
        $dropdown.attr('aria-disabled') === 'true' ||
        $dropdown.hasClass('Mui-disabled') ||
        $dropdown.find('.Mui-disabled').length > 0;

      if (isDisabled) {
        cy.log('Second dropdown is disabled, skipping selection');
      } else {
        cy.wrap($dropdown).click({ force: true });
        cy.wait(500);

        //Select Digital option from dropdown
        cy.get("ul[role='listbox'] > li > span")
          .should('be.visible')
          .contains(/^digital$/i)
          .click({ force: true });

        cy.wait(500);
      }
    });

    cy.pause();

    cy.intercept('POST', '**/editPerson').as('editPerson');
    //Finish Create New User approach
    cy.get('#create-user-create>div:nth-of-type(1)')
      .contains(/Create|Erstellen/i)
      .click({ force: true });

    // Wait & Assert response
    cy.wait('@editPerson', { timeout: 15000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(201);
      cy.log('User is successfully created');
    });
    cy.wait(1000);

    cy.pause();

    //Download Credentials

    //Check Title
    cy.get('#dialog-title')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /New User Access Data|New User Access Data/,
        );
      });

    //Check supbtitle (text)
    cy.get('div[role="dialog"]>div:nth-of-type(2)>div>div>div')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).be.match(
          /Download user data.|Benutzersdaten herunterladen./,
        );
      });

    //Download PDF with Credentials
    cy.get('#download-user-account-pdf').click();
    cy.wait(1000);

    // Get the latest downloaded PDF file
    const downloadsDir = `${Cypress.config(
      'fileServerFolder',
    )}/cypress/downloads/`;
    cy.task('getDownloadedPdf', downloadsDir).then((filePath) => {
      expect(filePath).to.not.be.null; // Assert the file exists
      cy.log(`Latest PDF File Path: ${filePath}`);
      cy.wait(3000);
      // Read the PDF content and open in the same tab using a Blob
      cy.readFile(filePath, 'binary').then((pdfBinary) => {
        const pdfBlob = Cypress.Blob.binaryStringToBlob(
          pdfBinary,
          'application/pdf',
        );
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Open the PDF in the same tab
        cy.window().then((win) => {
          win.location.href = pdfUrl; // Loads the PDF in the same window
        });
      });
    });
    cy.wait(3500);

    // Close download Credentials dialog
    // cy.get('div[role="dialog"]>div:nth-of-type(3)>button>div:nth-of-type(1)')
    //   .should('have.length.at.least', 1)
    //   .each(($btn) => {
    //     const text = $btn.text().trim();

    //     // match DE or EN translation
    //     if (text === 'Schließen' || text === 'Schließen') {
    //       cy.wrap($btn).click({ force: true });
    //     }
    //   });

    // cy.wait(1500);

    // //Search for user by username
    // cy.get('input[placeholder="Benutzername"]').type(user.username);
  });

  //Reset Password from Persons table
  it('DH - Reset Password from Persons table', () => {
    // Visit DH application using base URL from environment configuration
    cy.visit(Cypress.env('dh_baseUrl'));
    // Validate that the current URL includes the DH base URL
    cy.url().should('include', Cypress.env('dh_baseUrl'));

    // Remove Cookie consent dialog if present on the page
    cy.get('body').then(($body) => {
      // Check if the cookie consent dialog title element is visible
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        // Click the "Accept" button to dismiss the cookie dialog
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      } else {
        // Log message if cookie banner is not visible
        cy.log('Cookie bar not visible');
      }
    });

    // Login to DH SupportView using custom command defined in commands.js
    cy.loginToDH();

    // Wait 2 seconds for login process to complete and page to stabilize
    cy.wait(2000);

    // Validate that URL now includes the home page path after successful login
    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);

    // Scroll to top of page to ensure sidebar navigation menu is visible
    cy.scrollTo('top', { duration: 200 });

    // Setup API interceptor for GET request to fetch employees from group
    cy.intercept('GET', '**/person/fromGroup/**').as('getEmployees');
    // Find the Employees navigation button in sidebar by ID
    cy.get('#nav-employees')
      // Verify the element is visible before interacting
      .should('be.visible')
      // Apply visual highlight (black border) to the element for debugging/demo
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      // Wait 1.5 seconds to allow visual observation
      .wait(1500)
      // Click the Employees navigation button
      .click();

    // Wait for the intercepted API call to complete and validate response
    cy.wait('@getEmployees', { timeout: 35000 }).then((interception) => {
      // Assert that the API response status code is 200 (Success)
      expect(interception.response.statusCode).to.eq(200);
    });

    // Wait 1.5 seconds for employees page to fully load
    cy.wait(1500);

    // Get the company name from environment config and convert to lowercase for comparison
    const companyName = Cypress.env('company').toLowerCase();

    // Click the company selection dropdown to open the list of available companies
    cy.get('#employee-select-company').click({ force: true });
    // Wait 1 second for dropdown options to appear
    cy.wait(1000);

    // Find and click the matching company option from dropdown (case-insensitive partial match)
    cy.get('ul[role="listbox"] > li > span')
      // Ensure all dropdown options are visible
      .should('be.visible')
      // Process all dropdown options to find matching company
      .then(($options) => {
        // Convert jQuery object to array and search for company name match
        const match = [...$options].find((el) =>
          // Trim whitespace, convert to lowercase, and check if it includes company name
          el.textContent.trim().toLowerCase().includes(companyName),
        );
        // If matching company option is found
        if (match) {
          // Click the matching company option
          cy.wrap(match).click({ force: true });
        } else {
          // Throw error if no matching company is found in dropdown
          throw new Error(`No dropdown option contains: ${companyName}`);
        }
      });
    // Wait 500ms for company selection to apply
    cy.wait(500);

    // Scroll to top to ensure filter toggle button is visible on screen
    cy.scrollTo('top', { duration: 500 });
    // Wait 500ms for scroll to complete
    cy.wait(500);

    // Get test user data from first entry in createUser array from cypress.config.js
    const user = Cypress.env('createUser')[0];
    // Wait 1.5 seconds for page to stabilize before interacting with filters
    cy.wait(1500);

    // Find the filter toggle button by aria-label attribute
    cy.get('button[aria-label="persons.toggleFilters"]')
      // Apply visual highlight (black border) to the filter button for debugging/demo
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      // Wait 1.5 seconds to allow visual observation
      .wait(1500)
      // Click the filter toggle button to show/hide filters bar
      .click()
      // Wait 1.5 seconds for filter bar animation to complete
      .wait(1500);

    // Find username input field (supports both English and German placeholders)
    cy.get(
      'input[placeholder*="Username"], input[placeholder*="Benutzername"]',
      // Type the username from test data into the filter input
    ).type(user.username);
    // Wait 1 second for filter to apply and table to update
    cy.wait(1000);

    // Scroll to top to ensure the action menu button (3-dot) is visible
    cy.scrollTo('top', { duration: 500 });
    // Wait 500ms for scroll to complete
    cy.wait(500);

    // Declare variable to store normalized table status (active/inactive)
    let userStatus = '';

    // Convert table status text (EN/DE) to a strict normalized value
    const normalizeTableStatus = (statusText) => {
      const normalized = statusText.trim().toLowerCase();

      if (/^active$|^aktiv$/.test(normalized)) {
        return 'active';
      }

      if (/^inactive$|^inaktiv$/.test(normalized)) {
        return 'inactive';
      }

      throw new Error(`Unexpected status text in table: ${statusText}`);
    };

    // Find the first table row in tbody
    cy.get('tbody > tr')
      .first()
      // Find the last table cell (contains status)
      .find('td')
      .last()
      // Get the text content from the status cell
      .invoke('text')
      // Store and log the user status
      .then((statusText) => {
        // Store status as lowercase for easier comparison
        userStatus = statusText.trim().toLowerCase();
        // Log the user status to Cypress console for debugging
        cy.log(`User Status: ${statusText.trim()}`);
      })
      // Chain to next step after status is captured
      .then(() => {
        // Find the "More Row actions" button (3-dot menu) in the first row
        cy.get('button[aria-label="More Row actions"]')
          .first()
          // Click the action menu button with force option
          .click({ force: true });
        // Wait 1 second for menu to open and render
        cy.wait(1000);

        // Check if user status matches "active" or "aktiv" (German) using regex
        const isActive = /active|aktiv/i.test(userStatus);

        // Conditional logic based on user activation status
        if (!isActive) {
          // User is INACTIVE - Reset Password button should NOT be available
          // Log that user is inactive
          cy.log('User is INACTIVE - Reset Password button should be hidden');
          // Find all menu item spans
          cy.get('ul[role="menu"] span')
            // Ensure menu items are visible
            .should('be.visible')
            // Iterate through each menu item
            .each(($el) => {
              // Get the text of the current menu button
              const buttonText = $el.text().trim();
              // Assert that Reset Password button does NOT exist in menu (EN/DE)
              expect(buttonText).to.not.match(
                /Reset password|Passwort zurücksetzen/i,
              );
            });

          // Close the action menu by clicking on page body (outside menu)
          cy.get('body').click(0, 0);
          // Log test completion message for inactive user scenario
          cy.log(
            'Test complete - User is inactive, Reset Password not available',
          );
        } else {
          // User is ACTIVE - Reset Password button should be visible and clickable
          // Log that user is active
          cy.log('User is ACTIVE - Reset Password button should be visible');

          // Pause test execution for manual observation/debugging
          cy.pause();

          // Setup API interceptor for POST request to reset person password
          cy.intercept('POST', '**/person/resetPersonPassword').as(
            'resetPassword',
          );

          // Find all menu item spans in the action menu
          cy.get('ul[role="menu"] span')
            // Ensure menu items are visible
            .should('be.visible')
            // Iterate through each menu item to find Reset Password button
            .each(($el) => {
              // Check if current element text matches Reset Password (EN/DE)
              if ($el.text().match(/Reset password|Passwort zurücksetzen/i)) {
                // Apply visual highlight (black border) to Reset Password button
                cy.wrap($el).invoke(
                  'attr',
                  'style',
                  'border: 2px solid black; padding: 2px;',
                );
                // Wait 2 seconds to allow visual observation of highlighted element
                cy.wait(2000);
                // Click the Reset Password button
                cy.wrap($el).click();
              }
            });

          // Wait for the intercepted reset password API call with 15 second timeout
          cy.wait('@resetPassword', { timeout: 15000 }).then((interception) => {
            // Assert that reset password API response status is 200 (Success)
            expect(interception.response.statusCode).to.eq(200);
            // Log success message to Cypress console
            cy.log('Password reset successful');
          });

          // Wait 3.5 seconds for password reset confirmation and UI updates
          cy.wait(3500);
        }
      });
  }); //End IT

  //Edit E-Box user`s data, from Persons table
  it('DH - Edit E-Box user`s data, from Persons table', () => {
    // Visit DH
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.url().should('include', Cypress.env('dh_baseUrl'));

    // Remove Cookie dialog if present
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      } else {
        cy.log('Cookie bar not visible');
      }
    });

    // Login to SupportView using custom command
    cy.loginToDH();

    // Wait for generalInfo to confirm login success
    cy.wait(2000);

    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);

    //Sclroll to top to ensure visibility of sidebar navigation menu
    cy.scrollTo('top', { duration: 200 });

    // Click on Employees button (from sidebar navigation menu)
    cy.intercept('GET', '**/person/fromGroup/**').as('getEmployees');
    cy.get('#nav-employees')
      .should('be.visible')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      .wait(1500)
      .click();

    cy.wait('@getEmployees', { timeout: 35000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.wait(1500);

    //Select Company from dropdown
    const companyName = Cypress.env('company').toLowerCase();

    // Open the dropdown
    cy.get('#employee-select-company').click({ force: true });
    cy.wait(1000);

    // Find and click the matching option (ignore case, use contains for partial match)
    cy.get('ul[role="listbox"] > li > span')
      .should('be.visible')
      .then(($options) => {
        const match = [...$options].find((el) =>
          el.textContent.trim().toLowerCase().includes(companyName),
        );
        if (match) {
          cy.wrap(match).click({ force: true });
        } else {
          throw new Error(`No dropdown option contains: ${companyName}`);
        }
      });
    cy.wait(500);

    //Scroll to top to ensure "Create new Admin" button is visible
    cy.scrollTo('top', { duration: 500 });

    cy.wait(500);

    // Get user test data from cypress.config.js
    const user = Cypress.env('createUser')[0];
    cy.wait(1500);

    //Click on filter button to open filters bar
    cy.get('button[aria-label="persons.toggleFilters"]')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
      .wait(1500)
      .click()
      .wait(1500);

    // Search for user by username
    cy.get(
      'input[placeholder*="Username"], input[placeholder*="Benutzername"]',
    ).type(user.username);
    cy.get('input[placeholder*="Name"], input[placeholder*="Name"]').type(
      user.lastName,
    );
    //cy.get('input[placeholder*="Telefonnummer"], input[placeholder*="Phone Number"]').type(user.email);
    cy.wait(1000);

    // //Move filers to right
    // cy.get('div[role="toolbar"]>button:nth-of-type(2)')
    //   .should('be.enabled')
    //   .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
    //   .wait(1500)
    //   .click();
    // cy.wait(1500);

    // //Filter by Status
    // cy.get('button>p')
    //   .should('be.visible')
    //   .contains(/Status|Status/)
    //   .click();
    // cy.wait(2000);

    // // Reset filter
    // cy.get('div[role="toolbar"] > button')
    //   .last()
    //   .should('be.visible')
    //   .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
    //   .wait(2500)

    //   .click();
    // cy.wait(200);

    // // Re-search user
    // cy.get('input[placeholder="Benutzername"]').clear().type(user.username);
    // cy.wait(1000);

    // //Togle Filters Bar HIDE
    // cy.get('#toggle-filters')
    //   .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
    //   .wait(2000)

    //   .click();

    //Togle Filters Bar SHOW

    cy.get('button[aria-label="persons.toggleFilters"]')
      .next('button')
      .should('be.visible')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
      .wait(2000)

      .click();

    //Custom Filer view

    // // 1. Open the column settings
    // cy.get('.iconbtn').eq(1).click({ force: true });

    // // 2. Wait for the MUI menu to appear (MuiPaper-root)
    // cy.get('.MuiPaper-root', { timeout: 5000 }).should('be.visible');

    // // 3. Click the desired item inside the menu
    // cy.contains('.MuiPaper-root li div', 'E-Mail Aktiv')
    //   .should('be.visible')
    //   .click({ force: true });

    // 1. Open the column settings
    //  cy.get('.iconbtn').eq(1).click({ force: true });

    // 2. Wait for the MUI menu to appear
    cy.get('li[role="menuitem"] p', { timeout: 5000 }).should('be.visible');

    // 3. Allowed values (multiple translations per item)
    const desiredSelection = [
      ['Telefonnummer', 'Phone Number'],
      ['E-Mail', 'E-Mail', 'Email'],
      ['Zustellart', 'Delivery Type'],
      ['Status', 'E-Status', 'Status'],
    ];

    // 4. Find all items in the popover
    cy.get('li[role="menuitem"] p')
      .should('have.length.greaterThan', 0)
      .each(($item) => {
        const text = $item.text().trim();
        cy.log('Found item: ' + text);

        // Search for a match in all allowed values
        const isMatch = desiredSelection.some((translations) =>
          translations.some(
            (value) => value.toLowerCase() === text.toLowerCase(),
          ),
        );

        // If match → click the element
        if (isMatch) {
          cy.log(`Clicking matching item: ${text}`);
          cy.wrap($item).scrollIntoView().click({ force: true });
        }
      });

    //Scroll to top to ensure visibility of elements
    cy.window().then((win) => {
      win.scrollTo({ top: 0, behavior: 'smooth' });
    });
    cy.wait(3000);

    //Reset Filter view
    cy.findByRole('button', { name: /Clear filter/i }).click();

    //Scroll to top to ensure visibility of elements
    cy.window().then((win) => {
      win.scrollTo({ top: 0, behavior: 'smooth' });
    });

    //Focus out clik on body to trigger potential onBlur events
    cy.get('body').click(0, 0);
    cy.wait(1000);

    /************************FilterEND******************** */

    // Open 3-dot menu
    cy.get('button[aria-label="More Row actions"]').click({ force: true });
    cy.wait(1000);

    // Choose Edit user's personal data
    cy.contains('ul[role="menu"] span', /Bearbeiten|Edit/i)
      .should('be.visible')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      .wait(2000)
      .click({ force: true });

    cy.wait(3000);

    // Reset password is covered by its own IT. For edit-user flow, only verify the action is present.
    cy.contains(
      'button, a, .linkbtn--secondary',
      /Reset password|Passwort zurücksetzen/i,
    )
      .filter(':visible')
      .first()
      .should('exist');

    //Edit user's data
    cy.get('#edit-person-title1').first().type(' - EDIT');
    cy.get('#edit-person-firstName').first().type(' - EDIT');
    cy.get('#edit-person-lastName').first().type(' - EDIT');
    cy.get('#edit-person-title2').first().type(' - EDIT');
    //Enter invalid email
    cy.get('#edit-person-email').clear().type('invalid_email_format@yopmail');

    //Validate error message
    cy.get('div[role="alert"]>div')
      .should('be.visible') // Ensure it's visible first
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Invalid email format|E-Mail-Format ist ungültig/i,
        );
      });
    cy.wait(2500);

    //Enter valid email
    cy.get('#edit-person-email').clear().type('valid_email_format@yopmail.com');
    cy.wait(1000);

    // === Helper Functions ===
    // Helper function to validate zip code error messages
    function assertZipCodeError(shouldExist, expectedMessageRegex) {
      const helperTextSelector = '.MuiFormHelperText-contained>div'; // CSS selector for Material-UI helper text

      if (shouldExist) {
        // Branch when error SHOULD exist
        cy.get(helperTextSelector) // Get the helper text element
          .should('exist') // Assert element exists in DOM
          .invoke('text') // Extract text content
          .then((text) => {
            const trimmedText = text.trim(); // Remove leading/trailing whitespace
            expect(trimmedText).to.match(expectedMessageRegex); // Validate text matches expected error pattern
          });
      } else {
        // Branch when error should NOT exist
        cy.get('body').then(($body) => {
          if ($body.find(helperTextSelector).length > 0) {
            // If helper text element exists, check it doesn't contain zip code error
            cy.get(helperTextSelector) // Get the helper text element
              .invoke('text') // Extract text content
              .then((text) => {
                const trimmedText = text.trim(); // Remove leading/trailing whitespace
                expect(trimmedText).to.not.match(
                  // Assert text does NOT match zip code error pattern
                  /Invalid format \(4 digits\)|Ungültiges Format \(4 Ziffern\)/i,
                );
              });
          }
          // If element doesn't exist, test passes (no error shown)
        });
      }
    }

    // Helper function to normalize text for comparison (remove accents, spaces, lowercase)
    const normalizeText = (value) =>
      (value || '') // Use empty string if value is null/undefined
        .toLowerCase() // Convert to lowercase
        .normalize('NFD') // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim(); // Remove leading/trailing whitespace

    // Helper function to check if country name is Austria (in any language)
    const isAustria = (text) => {
      const normalized = normalizeText(text); // Normalize the text for comparison
      return (
        normalized.includes('austria') || // Check for English name
        normalized.includes('osterreich') // Check for German name (Österreich)
      );
    };

    // Open country dropdown to load all country options
    cy.get('#edit-person-country, input[aria-autocomplete="list"]') // Find country dropdown/input field
      .first() // Get first matching element
      .click({ force: true }); // Click to open dropdown (force to bypass visibility checks)
    cy.wait(500); // Wait for dropdown animation to complete

    // Get all available country options from the dropdown
    cy.get('ul[role="listbox"]:visible [role="option"]').then(($options) => {
      const options = [...$options]; // Convert jQuery collection to array
      const atOption = options.find((el) => isAustria(el.innerText)); // Find Austria option
      const nonAtOptions = options.filter((el) => !isAustria(el.innerText)); // Get all non-Austria options

      // Validate that Austria option exists in dropdown
      expect(atOption, 'Austria option should exist').to.exist;
      // Validate that there are other countries besides Austria
      expect(
        nonAtOptions.length,
        'Non-Austria options should exist',
      ).to.be.greaterThan(0);

      // Store text content instead of element references to avoid stale element errors
      const atOptionText = atOption.innerText.trim(); // Store Austria option text
      const randomNonAtText =
        nonAtOptions[
          Math.floor(Math.random() * nonAtOptions.length) // Pick random index
        ].innerText.trim(); // Store random non-Austria country text

      // === Case 1: AT selected + Valid AT zip (4 digits) → No error ===
      cy.log('**Case 1: AT + Valid AT zip (4 digits) → No error**'); // Log test case description

      // Select Austria from currently open dropdown
      cy.contains(
        'ul[role="listbox"]:visible [role="option"]', // Selector for visible options
        atOptionText, // Text to match (Austria)
      ).click({ force: true }); // Click the Austria option
      cy.wait(500); // Wait for selection to register

      // Verify Austria is selected in the country field
      cy.get('#edit-person-country, input[aria-autocomplete="list"]') // Get country input field
        .first() // Get first matching element
        .invoke('val') // Get the value attribute
        .should('satisfy', (val) => isAustria(val)); // Assert value is Austria

      cy.get('#edit-person-zipCode').clear().type('8010'); // Clear zip field and enter valid Austrian zip (4 digits)
      cy.get('#edit-person-zipCode').blur(); // Trigger validation by removing focus
      cy.wait(1000); // Wait for validation to complete

      // Assert no error message for zip code
      assertZipCodeError(false); // Validate no zip code error is shown

      cy.wait(1500); // Wait before next test case

      // === Case 2: Change Country and Select AT → Invalid AT zip (5 digits) → Error shown ===
      cy.log(
        '**Case 2: Change Country → Select AT → Invalid zip → Error shown**', // Log test case description
      );

      // Change country: Open dropdown again
      cy.get('#edit-person-country, input[aria-autocomplete="list"]') // Find country dropdown/input field
        .first() // Get first matching element
        .click({ force: true }); // Click to open dropdown
      cy.wait(500); // Wait for dropdown animation

      // Select Austria from fresh dropdown (re-query to avoid stale element)
      cy.contains(
        'ul[role="listbox"]:visible [role="option"]', // Selector for visible options
        atOptionText, // Text to match (Austria)
      ).click({ force: true }); // Click the Austria option
      cy.wait(500); // Wait for selection to register

      // Enter invalid zip code (5 digits instead of 4)
      cy.get('#edit-person-zipCode').clear().type('11000'); // Clear zip field and enter invalid Austrian zip
      cy.get('#edit-person-zipCode').blur(); // Trigger validation by removing focus
      cy.wait(1500); // Wait for validation to complete

      // Validate error message is shown and validate text
      assertZipCodeError(
        true, // Error should exist
        /Invalid format \(4 digits\)|Ungültiges Format \(4 Ziffern\)/i, // Expected error message pattern (EN/DE)
      );

      cy.wait(1500); // Wait before next test case

      // === Case 3: Change Country and Select NON-AT → Valid zip → No error ===
      cy.log(
        '**Case 3: Change Country → Select NON-AT → Valid zip → No error**', // Log test case description
      );

      // Change country: Open dropdown again
      cy.get('#edit-person-country, input[aria-autocomplete="list"]') // Find country dropdown/input field
        .first() // Get first matching element
        .click({ force: true }); // Click to open dropdown
      cy.wait(500); // Wait for dropdown animation

      // Select non-Austria country from fresh dropdown
      cy.contains(
        'ul[role="listbox"]:visible [role="option"]', // Selector for visible options
        randomNonAtText, // Text to match (random non-Austria country)
      ).click({ force: true }); // Click the country option
      cy.wait(500); // Wait for selection to register

      // Enter valid zip code (4 digits)
      cy.get('#edit-person-zipCode').clear().type('8010'); // Clear zip field and enter 4-digit zip
      cy.get('#edit-person-zipCode').blur(); // Trigger validation by removing focus
      cy.wait(1000); // Wait for validation to complete

      // Validate error message is not visible (non-Austria countries don't validate zip format)
      assertZipCodeError(false); // Validate no zip code error is shown

      cy.wait(1500); // Wait before next test case

      // === Case 4: Keep NON-AT → Invalid AT zip → No error ===
      cy.log('**Case 4: NON-AT (already selected) → Invalid zip → No error**'); // Log test case description

      // Enter invalid zip code (country is already NON-AT from Case 3, so no re-selection needed)
      cy.get('#edit-person-zipCode').clear().type('11000'); // Clear zip field and enter 5-digit zip
      cy.get('#edit-person-zipCode').blur(); // Trigger validation by removing focus
      cy.wait(1000); // Wait for validation to complete

      // Validate error message is not visible (non-Austria countries don't validate zip format)
      assertZipCodeError(false); // Validate no zip code error is shown

      // === Final: Set Austria + Valid zip for save ===
      cy.log('**Setting Austria + Valid zip for final save**'); // Log final setup
      cy.get('#edit-person-country, input[aria-autocomplete="list"]') // Find country dropdown/input field
        .first() // Get first matching element
        .click({ force: true }); // Click to open dropdown
      cy.wait(500); // Wait for dropdown animation

      // Select Austria from fresh dropdown for final save
      cy.contains(
        'ul[role="listbox"]:visible [role="option"]', // Selector for visible options
        atOptionText, // Text to match (Austria)
      ).click({ force: true }); // Click the Austria option
      cy.wait(500); // Wait for selection to register

      cy.get('#edit-person-zipCode').clear().type('8010'); // Set valid zip code for saving
      cy.get('#edit-person-zipCode').blur(); // Trigger validation by removing focus
      cy.wait(500); // Wait for validation to complete

      assertZipCodeError(false);
    });

    cy.wait(2000);

    //Scroll to top to ensure "Save changes" button is visible
    cy.window().then((win) => {
      win.scrollTo({ top: 0, behavior: 'smooth' });
    });

    //Save changes
    cy.intercept('POST', '**/editPerson').as('editPerson');

    //Validate Button text and click on Save changes button
    cy.get('#employee-save-button')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Änderungen speichern|Save changes/i);
      });
    //Click on Save changes button
    cy.get('#employee-save-button').click({ force: true });
    cy.wait('@editPerson', { timeout: 15000 }).then((interception) => {
      expect(interception.response.statusCode).to.be.oneOf([200, 201]);
    });

    cy.wait(3000);
  }); //End IT

  //Targer Activate/Deactivate E-Box user from Persons table
  it('DH - Targer Activate/Deactivate E-Box user from Persons table', () => {
    // Visit DH application using base URL from environment configuration
    cy.visit(Cypress.env('dh_baseUrl'));
    // Validate that the current URL includes the DH base URL
    cy.url().should('include', Cypress.env('dh_baseUrl'));

    // Remove Cookie consent dialog if present on the page
    cy.get('body').then(($body) => {
      // Check if the cookie consent dialog title element is visible
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        // Click the "Accept" button to dismiss the cookie dialog
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      } else {
        // Log message if cookie banner is not visible
        cy.log('Cookie bar not visible');
      }
    });

    // Login to DH SupportView using custom command defined in commands.js
    cy.loginToDH();

    // Wait 2 seconds for login process to complete and page to stabilize
    cy.wait(2000);

    // Validate that URL now includes the home page path after successful login
    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);

    // Scroll to top of page to ensure sidebar navigation menu is visible
    cy.scrollTo('top', { duration: 200 });

    // Setup API interceptor for GET request to fetch employees from group
    cy.intercept('GET', '**/person/fromGroup/**').as('getEmployees');
    // Find the Employees navigation button in sidebar by ID
    cy.get('#nav-employees')
      // Verify the element is visible before interacting
      .should('be.visible')
      // Apply visual highlight (black border) to the element for debugging/demo
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      // Wait 1.5 seconds to allow visual observation
      .wait(1500)
      // Click the Employees navigation button
      .click();

    // Wait for the intercepted API call to complete and validate response
    cy.wait('@getEmployees', { timeout: 35000 }).then((interception) => {
      // Assert that the API response status code is 200 (Success)
      expect(interception.response.statusCode).to.eq(200);
    });

    // Wait 1.5 seconds for employees page to fully load
    cy.wait(1500);

    // Get the company name from environment config and convert to lowercase for comparison
    const companyName = Cypress.env('company').toLowerCase();

    // Click the company selection dropdown to open the list of available companies
    cy.get('#employee-select-company').click({ force: true });
    // Wait 1 second for dropdown options to appear
    cy.wait(1000);

    // Find and click the matching company option from dropdown (case-insensitive partial match)
    cy.get('ul[role="listbox"] > li > span')
      // Ensure all dropdown options are visible
      .should('be.visible')
      // Process all dropdown options to find matching company
      .then(($options) => {
        // Convert jQuery object to array and search for company name match
        const match = [...$options].find((el) =>
          // Trim whitespace, convert to lowercase, and check if it includes company name
          el.textContent.trim().toLowerCase().includes(companyName),
        );
        // If matching company option is found
        if (match) {
          // Click the matching company option
          cy.wrap(match).click({ force: true });
        } else {
          // Throw error if no matching company is found in dropdown
          throw new Error(`No dropdown option contains: ${companyName}`);
        }
      });
    // Wait 500ms for company selection to apply
    cy.wait(500);

    // Scroll to top to ensure filter toggle button is visible on screen
    cy.scrollTo('top', { duration: 500 });
    // Wait 500ms for scroll to complete
    cy.wait(500);

    // Get test user data from first entry in createUser array from cypress.config.js
    const user = Cypress.env('createUser')[0];
    // Wait 1.5 seconds for page to stabilize before interacting with filters
    cy.wait(1500);

    // Find the filter toggle button by aria-label attribute
    cy.get('button[aria-label="persons.toggleFilters"]')
      // Apply visual highlight (black border) to the filter button for debugging/demo
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      // Wait 1.5 seconds to allow visual observation
      .wait(1500)
      // Click the filter toggle button to show/hide filters bar
      .click()
      // Wait 1.5 seconds for filter bar animation to complete
      .wait(1500);

    // Find username input field (supports both English and German placeholders)
    cy.get(
      'input[placeholder*="Username"], input[placeholder*="Benutzername"]',
      // Type the username from test data into the filter input
    ).type(user.username);
    // Wait 1 second for filter to apply and table to update
    cy.wait(1000);

    // Scroll to top to ensure the action menu button (3-dot) is visible
    cy.scrollTo('top', { duration: 500 });
    // Wait 500ms for scroll to complete
    cy.wait(500);

    // Declare variable to store normalized user status from the table
    let userStatus = '';

    const normalizeTableStatus = (statusText) => {
      const normalizedStatus = statusText.trim().toLowerCase();

      if (/^active$|^aktiv$/.test(normalizedStatus)) {
        return 'active';
      }

      if (/^inactive$|^inaktiv$/.test(normalizedStatus)) {
        return 'inactive';
      }

      throw new Error(`Unexpected status text in table: ${statusText}`);
    };

    // Read user status from the last cell of the first table row BEFORE opening menu
    cy.get('tbody > tr')
      .first()
      .find('td')
      .last()
      .invoke('text')
      .then((statusText) => {
        userStatus = normalizeTableStatus(statusText);
        cy.log(
          `Initial User Status from table: ${statusText.trim()} (${userStatus})`,
        );
      })
      .then(() => {
        // Decide action from normalized table status captured at the beginning
        const isActive = userStatus === 'active';
        cy.log(`Is user active: ${isActive}`);

        // Open the 3-dot action menu after status has been captured
        cy.get('button[aria-label="More Row actions"]')
          .first()
          .should('be.visible')
          .click({ force: true });
        // Wait 1 second for the action menu to open and render
        cy.wait(1000);

        // Setup API interceptor for user status change BEFORE clicking the button
        cy.intercept('POST', '**/group/getGroupData').as('getGroupData');

        if (isActive) {
          // User is ACTIVE → Deactivate button should be visible in menu → click it
          cy.log('User is ACTIVE - clicking Deactivate button');
          cy.contains('ul[role="menu"] span', /^(Deaktivieren|Deactivate)$/i)
            .should('be.visible')
            .invoke('attr', 'style', 'border: 2px solid red; padding: 2px;')
            .wait(1500)
            .click({ force: true });
        } else {
          // User is INACTIVE → Activate button should be visible in menu → click it
          cy.log('User is INACTIVE - clicking Activate button');
          cy.contains('ul[role="menu"] span', /^(Aktivieren|Activate)$/i)
            .should('be.visible')
            .invoke('attr', 'style', 'border: 2px solid green; padding: 2px;')
            .wait(1500)
            .click({ force: true });
        }

        // Wait for the API call to complete and assert success
        cy.wait('@getGroupData', { timeout: 15000 }).then((interception) => {
          expect(interception.response.statusCode).to.be.oneOf([200, 201]);
          cy.log('API confirmed: User status successfully changed');
        });

        // Verify success toast/snackbar message is shown on screen (EN/DE)
        cy.contains(
          /successfully|erfolgreich|deactivated|deaktiviert|activated|aktiviert/i,
          { timeout: 8000 },
        ).should('be.visible');

        // Wait for UI to fully update after status change
        cy.wait(2000);

        // Verify the status cell in the table has been updated to the opposite status
        cy.get('tbody > tr')
          .first()
          .find('td')
          .last()
          .invoke('text')
          .then((updatedStatusText) => {
            const updatedStatus = normalizeTableStatus(updatedStatusText);
            const expectedStatus = isActive ? 'inactive' : 'active';

            cy.log(
              `Updated User Status from table: ${updatedStatusText.trim()} (${updatedStatus})`,
            );

            expect(updatedStatus).to.eq(expectedStatus);
          });

        cy.wait(2000);
      });
    //Logout
    cy.get('.logout-icon ').click({ force: true });
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url
    cy.wait(1500);
  }); //End IT

  //Target Activate/Deactivate E-Box user from Personal data page
  it.only('DH - Edit user - Target Activate/Deactivate E-Box user from Personal data page', () => {
    // Visit DH application using base URL from environment configuration
    cy.visit(Cypress.env('dh_baseUrl'));
    // Validate that the current URL includes the DH base URL
    cy.url().should('include', Cypress.env('dh_baseUrl'));

    // Remove Cookie consent dialog if present on the page
    cy.get('body').then(($body) => {
      // Check if the cookie consent dialog title element is visible
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        // Click the "Accept" button to dismiss the cookie dialog
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      } else {
        // Log message if cookie banner is not visible
        cy.log('Cookie bar not visible');
      }
    });

    // Login to DH SupportView using custom command defined in commands.js
    cy.loginToDH();

    // Wait 2 seconds for login process to complete and page to stabilize
    cy.wait(2000);

    // Validate that URL now includes the home page path after successful login
    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);

    // Scroll to top of page to ensure sidebar navigation menu is visible
    cy.scrollTo('top', { duration: 200 });

    // Setup API interceptor for GET request to fetch employees from group
    cy.intercept('GET', '**/person/fromGroup/**').as('getEmployees');
    // Find the Employees navigation button in sidebar by ID
    cy.get('#nav-employees')
      // Verify the element is visible before interacting
      .should('be.visible')
      // Apply visual highlight (black border) to the element for debugging/demo
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      // Wait 1.5 seconds to allow visual observation
      .wait(1500)
      // Click the Employees navigation button
      .click();

    // Wait for the intercepted API call to complete and validate response
    cy.wait('@getEmployees', { timeout: 35000 }).then((interception) => {
      // Assert that the API response status code is 200 (Success)
      expect(interception.response.statusCode).to.eq(200);
    });

    // Wait 1.5 seconds for employees page to fully load
    cy.wait(1500);

    // Get the company name from environment config and convert to lowercase for comparison
    const companyName = Cypress.env('company').toLowerCase();

    // Click the company selection dropdown to open the list of available companies
    cy.get('#employee-select-company').click({ force: true });
    // Wait 1 second for dropdown options to appear
    cy.wait(1000);

    // Find and click the matching company option from dropdown (case-insensitive partial match)
    cy.get('ul[role="listbox"] > li > span')
      // Ensure all dropdown options are visible
      .should('be.visible')
      // Process all dropdown options to find matching company
      .then(($options) => {
        // Convert jQuery object to array and search for company name match
        const match = [...$options].find((el) =>
          // Trim whitespace, convert to lowercase, and check if it includes company name
          el.textContent.trim().toLowerCase().includes(companyName),
        );
        // If matching company option is found
        if (match) {
          // Click the matching company option
          cy.wrap(match).click({ force: true });
        } else {
          // Throw error if no matching company is found in dropdown
          throw new Error(`No dropdown option contains: ${companyName}`);
        }
      });
    // Wait 500ms for company selection to apply
    cy.wait(500);

    // Scroll to top to ensure filter toggle button is visible on screen
    cy.scrollTo('top', { duration: 500 });
    // Wait 500ms for scroll to complete
    cy.wait(500);

    // Get test user data from first entry in createUser array from cypress.config.js
    const user = Cypress.env('createUser')[0];
    // Wait 1.5 seconds for page to stabilize before interacting with filters
    cy.wait(1500);

    // Find the filter toggle button by aria-label attribute
    cy.get('button[aria-label="persons.toggleFilters"]')
      // Apply visual highlight (black border) to the filter button for debugging/demo
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      // Wait 1.5 seconds to allow visual observation
      .wait(1500)
      // Click the filter toggle button to show/hide filters bar
      .click()
      // Wait 1.5 seconds for filter bar animation to complete
      .wait(1500);

    // Find username input field (supports both English and German placeholders)
    cy.get(
      'input[placeholder*="Username"], input[placeholder*="Benutzername"]',
      // Type the username from test data into the filter input
    ).type(user.username);
    // Wait 1 second for filter to apply and table to update
    cy.wait(1000);

    // Scroll to top to ensure the action menu button (3-dot) is visible
    cy.scrollTo('top', { duration: 500 });
    // Wait 500ms for scroll to complete
    cy.wait(500);

    // Declare variable to store normalized user status from the table
    let userStatus = '';

    const normalizeTableStatus = (statusText) => {
      const normalizedStatus = statusText.trim().toLowerCase();

      if (/^active$|^aktiv$/.test(normalizedStatus)) {
        return 'active';
      }

      if (/^inactive$|^inaktiv$/.test(normalizedStatus)) {
        return 'inactive';
      }

      throw new Error(`Unexpected status text in table: ${statusText}`);
    };

    // Read user status from the last cell of the first table row BEFORE opening menu
    cy.get('tbody > tr')
      .first()
      .find('td')
      .last()
      .invoke('text')
      .then((statusText) => {
        userStatus = normalizeTableStatus(statusText);
        cy.log(
          `Initial User Status from table: ${statusText.trim()} (${userStatus})`,
        );
      })
      .then(() => {
        // Decide action from normalized table status captured at the beginning
        const isActive = userStatus === 'active';
        cy.log(`Is user active: ${isActive}`);

        // Open the 3-dot action menu after status has been captured
        cy.get('button[aria-label="More Row actions"]')
          .first()
          .should('be.visible')
          .click({ force: true });
        // Wait 1 second for the action menu to open and render
        cy.wait(1000);

        // Setup API interceptor for user status change BEFORE clicking the button
        cy.intercept('POST', '**/group/getGroupData').as('getGroupData');
        //Select edit user's personal data option to navigate to personal data page
        cy.contains('ul[role="menu"] span', /Bearbeiten|Edit/i)
          .should('be.visible')
          .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
          .wait(2000)
          .click({ force: true });

        // Click on the status dropdown to open it
        cy.get('#status-dropdown-status')
          .should('be.visible')
          .invoke('attr', 'style', 'border: 2px solid blue; padding: 2px;')
          .click({ force: true });

        cy.wait(1000); // Wait for dropdown menu to open
        if (isActive) {
          // User is ACTIVE → Select Deactivate option from dropdown
          cy.log('User is ACTIVE - clicking Deactivate option');
          cy.get('ul[role="listbox"] li')
            .contains(/^(Deaktivieren|Deactivated)$/i)
            .should('be.visible')
            .invoke('attr', 'style', 'border: 2px solid red; padding: 2px;')
            .wait(500)
            .click({ force: true });
        } else {
          // User is INACTIVE → Select Activate option from dropdown
          cy.log('User is INACTIVE - clicking Activate option');
          cy.get('ul[role="listbox"] li')
            .contains(/^(Aktivieren|Active)$/i)
            .should('be.visible')
            .invoke('attr', 'style', 'border: 2px solid green; padding: 2px;')
            .wait(500)
            .click({ force: true });
        }

        // Wait for the API call to complete and assert success
        cy.wait('@getGroupData', { timeout: 15000 }).then((interception) => {
          expect(interception.response.statusCode).to.be.oneOf([200, 201]);
          cy.log('API confirmed: User status successfully changed');
        });

        // Verify success toast/snackbar message is shown on screen (EN/DE)
        cy.contains(
          /successfully|erfolgreich|deactivated|deaktiviert|activated|aktiviert/i,
          { timeout: 8000 },
        ).should('be.visible');

        // Wait for UI to fully update after status change
        cy.wait(2000);

        // Setup interceptor for edit person save BEFORE clicking Save button
        cy.intercept('POST', '**/editPerson').as('editPerson');

        // Click on Save changes button
        cy.get('#employee-save-button')
          .should('be.visible')
          .invoke('attr', 'style', 'border: 2px solid purple; padding: 2px;')
          .click({ force: true });

        // Wait for the save API call to complete
        cy.wait('@editPerson', { timeout: 15000 }).then((interception) => {
          expect(interception.response.statusCode).to.be.oneOf([200, 201]);
          cy.log(' Save API confirmed: Changes saved successfully');
        });

        cy.wait(2000);

        // Navigate back to Employees page to verify status change
        cy.get('#nav-employees')
          .should('be.visible')
          .invoke('attr', 'style', 'border: 2px solid navy; padding: 2px;')
          .click({ force: true });

        cy.wait(1500);

        // Re-select the company to see the updated employee list
        cy.get('#employee-select-company').click({ force: true });
        cy.wait(1000);

        // Find and click the matching company option from dropdown (case-insensitive partial match)
        cy.get('ul[role="listbox"] > li > span')
          .should('be.visible')
          .then(($options) => {
            const match = [...$options].find((el) =>
              el.textContent.trim().toLowerCase().includes(companyName),
            );
            if (match) {
              cy.wrap(match).click({ force: true });
            } else {
              throw new Error(`No dropdown option contains: ${companyName}`);
            }
          });

        cy.wait(500);

        // Scroll to top to ensure filter button is visible
        cy.scrollTo('top', { duration: 500 });
        cy.wait(500);

        // Open filter to search for user again
        cy.get('button[aria-label="persons.toggleFilters"]')
          .should('be.visible')
          .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;');

        cy.wait(500);

        // // Click the filter toggle button to show/hide filters bar
        // cy.get('button[aria-label="persons.toggleFilters"]').click({
        //   force: true,
        // });

        // Wait for filter input field to be visible
        cy.get(
          'input[placeholder*="Username"], input[placeholder*="Benutzername"]',
        ).should('be.visible');

        cy.wait(500);

        // Type the username into the filter input field
        cy.get(
          'input[placeholder*="Username"], input[placeholder*="Benutzername"]',
        )
          .clear()
          .type(user.username);

        cy.wait(1000);

        // Scroll to top to ensure user row is visible
        cy.scrollTo('top', { duration: 500 });
        cy.wait(500);

        // Verify the status has changed to the opposite
        cy.get('tbody > tr')
          .first()
          .find('td')
          .last()
          .invoke('text')
          .then((updatedStatusText) => {
            const updatedStatus = normalizeTableStatus(updatedStatusText);
            const expectedStatus = isActive ? 'inactive' : 'active';

            cy.log(`VERIFICATION CHECK:`);
            cy.log(`   Initial Status: ${userStatus}`);
            cy.log(`   Updated Status: ${updatedStatus}`);
            cy.log(`   Expected Status: ${expectedStatus}`);

            if (updatedStatus === expectedStatus) {
              cy.log(
                `SUCCESS: Status successfully changed from ${userStatus} to ${updatedStatus}`,
              );
            } else {
              cy.log(
                `FAILED: Status should have changed from ${userStatus} to ${expectedStatus}, but is ${updatedStatus}`,
              );
            }

            expect(updatedStatus).to.eq(
              expectedStatus,
              `Status should have changed from ${userStatus} to ${expectedStatus}`,
            );
          });

        cy.wait(2000);
      });

    cy.wait(2000);

    //Logout
    cy.get('.MuiAvatar-root')
      .should('be.visible')
      .first()
      .click({ force: true });

    // Click Logout from the opened profile menu
    cy.contains('[role="menuitem"], button, li, span', /Logout|Abmelden/i, {
      timeout: 10000,
    })
      .should('be.visible')
      .click({ force: true });
    cy.wait(2000);
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url
    cy.wait(1500);
  }); //End IT

  //Assign user to another company
  it('DH - Assign user to another company', () => {
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.url().should('include', Cypress.env('dh_baseUrl'));

    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      } else {
        cy.log('Cookie bar not visible');
      }
    });

    cy.loginToDH();
    cy.wait(2000);
    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);

    cy.scrollTo('top', { duration: 200 });

    cy.intercept('GET', '**/person/fromGroup/**').as('getEmployees');
    cy.get('#nav-employees')
      .should('be.visible')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      .wait(1500)
      .click();

    cy.wait('@getEmployees', { timeout: 35000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.wait(1500);

    const companyName = Cypress.env('company').toLowerCase();

    cy.get('#employee-select-company').click({ force: true });
    cy.wait(1000);

    cy.get('ul[role="listbox"] > li > span')
      .should('be.visible')
      .then(($options) => {
        const match = [...$options].find((el) =>
          el.textContent.trim().toLowerCase().includes(companyName),
        );

        if (match) {
          cy.wrap(match).click({ force: true });
        } else {
          throw new Error(`No dropdown option contains: ${companyName}`);
        }
      });

    cy.wait(500);
    cy.scrollTo('top', { duration: 500 });
    cy.wait(500);

    const user = Cypress.env('createUser')[0];
    cy.wait(1500);

    cy.get('button[aria-label="persons.toggleFilters"]')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      .wait(1500)
      .click()
      .wait(1500);

    cy.get(
      'input[placeholder*="Username"], input[placeholder*="Benutzername"]',
    ).type(user.username);

    cy.wait(1000);
    cy.scrollTo('top', { duration: 500 });
    cy.wait(500);

    cy.get('button[aria-label="More Row actions"]')
      .first()
      .should('be.visible')
      .click({ force: true });

    cy.wait(1000);

    cy.contains('ul[role="menu"] span', /Firmen|Companies/i)
      .should('be.visible')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      .wait(1500)
      .click({ force: true });

    cy.wait(2000);

    cy.get('tbody > tr').then(($companyRows) => {
      if ($companyRows.length <= 1) {
        cy.log(
          'Admin is assigned on only one company - skipping further action.',
        );
        return;
      }

      const companiesToAssign = ['AQUA', 'ABBA'];

      companiesToAssign.forEach((company) => {
        cy.contains('tbody > tr td:nth-child(2)', new RegExp(company, 'i'))
          .should('be.visible')
          .parents('tr')
          .first()
          .within(() => {
            cy.get('td')
              .first()
              .then(($td) => {
                const checkboxInput = $td.find('input[type="checkbox"]');

                if (checkboxInput.length) {
                  if (checkboxInput.is(':checked')) {
                    cy.log(`User already assigned to ${company}, skipping.`);
                  } else {
                    cy.wrap(checkboxInput)
                      .scrollIntoView()
                      .click({ force: true });
                  }

                  return;
                }

                const checkboxSpan = $td.find('span[role="checkbox"]');

                if (checkboxSpan.length) {
                  if (checkboxSpan.attr('aria-checked') === 'true') {
                    cy.log(`User already assigned to ${company}, skipping.`);
                  } else {
                    cy.wrap(checkboxSpan)
                      .scrollIntoView()
                      .click({ force: true });
                  }

                  return;
                }

                throw new Error(`No checkbox found for company ${company}`);
              });
          });
      });

      cy.wait(1000);

      cy.contains(
        'button, .linkbtn--primary, .linkbtn--secondary',
        /Next|Nächste/i,
      )
        .should('be.visible')
        .click({ force: true });

      cy.wait(1500);

      cy.get(
        'input[placeholder="Firmenspezifische Benutzer ID"], input[placeholder*="Company-specific"]',
      )
        .should('be.visible')
        .clear()
        .type(user.username);

      cy.intercept('POST', '**group/getGroupData').as('getGroupData');

      cy.contains(
        'button, .linkbtn--primary, .linkbtn--secondary',
        /Submit|Übernehmen|Apply|Save/i,
      )
        .should('be.visible')
        .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
        .wait(1500)
        .click({ force: true });

      cy.wait('@getGroupData', { timeout: 15000 }).then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 201]);
        cy.log('User company assignment saved successfully');
      });

      cy.contains(/successfully|erfolgreich|saved|gespeichert/i, {
        timeout: 8000,
      }).should('be.visible');

      cy.wait(2000);
    });
  }); //End IT

  //Remove user from company
  it('DH - Remove user from company', () => {
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.url().should('include', Cypress.env('dh_baseUrl'));

    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      } else {
        cy.log('Cookie bar not visible');
      }
    });

    cy.loginToDH();
    cy.wait(2000);
    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);

    cy.scrollTo('top', { duration: 200 });

    cy.intercept('GET', '**/person/fromGroup/**').as('getEmployees');
    cy.get('#nav-employees')
      .should('be.visible')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      .wait(1500)
      .click();

    cy.wait('@getEmployees', { timeout: 35000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.wait(1500);

    const companyName = Cypress.env('company').toLowerCase();

    cy.get('#employee-select-company').click({ force: true });
    cy.wait(1000);

    cy.get('ul[role="listbox"] > li > span')
      .should('be.visible')
      .then(($options) => {
        const match = [...$options].find((el) =>
          el.textContent.trim().toLowerCase().includes(companyName),
        );

        if (match) {
          cy.wrap(match).click({ force: true });
        } else {
          throw new Error(`No dropdown option contains: ${companyName}`);
        }
      });

    cy.wait(500);
    cy.scrollTo('top', { duration: 500 });
    cy.wait(500);

    const user = Cypress.env('createUser')[0];
    cy.wait(1500);

    cy.get('button[aria-label="persons.toggleFilters"]')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      .wait(1500)
      .click()
      .wait(1500);

    cy.get(
      'input[placeholder*="Username"], input[placeholder*="Benutzername"]',
    ).type(user.username);

    cy.wait(1000);
    cy.scrollTo('top', { duration: 500 });
    cy.wait(500);

    cy.get('button[aria-label="More Row actions"]')
      .first()
      .should('be.visible')
      .click({ force: true });

    cy.wait(1000);

    cy.contains('ul[role="menu"] span', /Firmen|Companies/i)
      .should('be.visible')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      .wait(1500)
      .click({ force: true });

    cy.wait(2000);

    cy.get('tbody > tr').then(($companyRows) => {
      if ($companyRows.length <= 1) {
        cy.log(
          'Admin is assigned on only one company - skipping further action.',
        );
        return;
      }

      const companiesToUnassign = ['ABBA'];

      companiesToUnassign.forEach((company) => {
        cy.contains('tbody > tr td:nth-child(2)', new RegExp(company, 'i'))
          .should('be.visible')
          .parents('tr')
          .first()
          .within(() => {
            cy.get('td')
              .first()
              .then(($td) => {
                const checkboxInput = $td.find('input[type="checkbox"]');

                if (checkboxInput.length) {
                  if (checkboxInput.is(':checked')) {
                    cy.wrap(checkboxInput)
                      .scrollIntoView()
                      .click({ force: true });
                    cy.log(
                      `Checkbox for ${company} was checked, now unchecked.`,
                    );
                  } else {
                    cy.log(`Checkbox for ${company} is already unchecked.`);
                  }

                  return;
                }

                const checkboxSpan = $td.find('span[role="checkbox"]');

                if (checkboxSpan.length) {
                  if (checkboxSpan.attr('aria-checked') === 'true') {
                    cy.wrap(checkboxSpan)
                      .scrollIntoView()
                      .click({ force: true });
                    cy.log(
                      `Checkbox for ${company} was checked, now unchecked.`,
                    );
                  } else {
                    cy.log(`Checkbox for ${company} is already unchecked.`);
                  }

                  return;
                }

                throw new Error(`No checkbox found for company ${company}`);
              });
          });
      });

      cy.wait(1000);

      cy.intercept('GET', '**group/getGroupData').as('getGroupData');

      // Click on Submit/Save button to save changes
      cy.findByRole('button', {
        name: /Submit|Ubernehmen|Übernehmen|Apply|Save/i,
      })
        .should('be.visible')
        .click({ force: true });

      cy.wait('@getGroupData', { timeout: 15000 }).then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 201]);
        cy.log('User company removal saved successfully');
      });

      cy.contains(/successfully|erfolgreich|saved|gespeichert/i, {
        timeout: 8000,
      }).should('be.visible');

      cy.wait(2000);
    });
  }); //End IT

  //Delete already created user
  it('Delete already created user', () => {
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
        cy.intercept('POST', '**/person/fromGroup/**').as('personFromGroup');
        cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
          .clear()
          .type(userName);
        cy.get('button[type="submit"]').click();
        cy.wait('@personFromGroup', { timeout: 10000 }).then((interception) => {
          expect(interception.response.statusCode).to.eq(200);
          cy.log('Search completed');
        });

        // Wait for the search results
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

  //Switch to ebox using magiclink
  it.skip('DH - Switch to ebox using magiclink', () => {
    // Visit AUT
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.url().should('include', Cypress.env('dh_baseUrl'));
    cy.wait(1500);

    // Remove Cookie dialog if present
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').length) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      } else {
        cy.log('Cookie bar not visible');
      }
    });
    cy.wait(1500);

    // Intercept backend call after login
    cy.intercept('GET', '**/generalInfo').as('generalInfo');

    // Login Dummy button
    cy.get('button[id=":r2:"]').contains('Login Dummy').click();
    cy.wait(2000);

    // Wait & Assert response
    cy.wait('@generalInfo', { timeout: 15000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('Login successful, generalInfo loaded');
    });

    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home/persons`);
    cy.wait(1000);

    //Select Company
    const companyName = Cypress.env('company').toLowerCase();

    // Open the dropdown
    cy.get('div[role="combobox"]').click({ force: true });

    // Find and click the matching option (ignore case)
    cy.get('ul[aria-labelledby=":r5:-label"] > li > span')
      .should('be.visible')
      .each(($el) => {
        const text = $el.text().trim().toLowerCase();

        if (text === companyName) {
          cy.wrap($el).click({ force: true });
        }
      });

    // Get user test data from cypress.config.js
    const user = Cypress.env('createUser')[0];
    cy.wait(1500);

    //Search for user by username
    cy.get('input[placeholder="Benutzername"]').type(user.username);
    cy.wait(1000);

    //Scroll UP
    cy.window().then((win) => {
      win.scrollTo({ top: 0, behavior: 'smooth' });
    });
    cy.wait(500);

    // Intercept any API calls that might return magic link
    cy.intercept('**/magic-link**').as('magicLinkAPI');
    cy.intercept('**/magicLink**').as('magicLinkAPI2');
    cy.intercept('GET', '**/ebox/**').as('eboxAPI');

    // Open 3-dot menu
    cy.get('button[aria-label="More Row actions"]').click({ force: true });
    cy.wait(1000);

    // Get the menu item and check its properties
    cy.get('ul[role="menu"] span')
      .contains(/Ebox öffnen|Open Ebox/i)
      .should('be.visible')
      .then(($span) => {
        // Log all parent elements to understand structure
        cy.log('🔍 Menu item structure:');
        let $current = $span;
        for (let i = 0; i < 5; i++) {
          $current = $current.parent();
          cy.log(`Level ${i}:`, $current[0]?.outerHTML?.substring(0, 200));

          // Check for any event listeners or data
          const allAttributes = {};
          Array.from($current[0]?.attributes || []).forEach((attr) => {
            allAttributes[attr.name] = attr.value;
          });
          cy.log(`Attributes:`, allAttributes);
        }
      });

    // Try removing target="_blank" if it exists and click
    cy.get('ul[role="menu"] span')
      .contains(/Ebox öffnen|Open Ebox/i)
      .parents('li')
      .first()
      .then(($li) => {
        // Remove any target="_blank" attributes
        $li.find('*').removeAttr('target');
        $li.removeAttr('target');

        // Try to find and click
        cy.wrap($li)
          .find('span')
          .contains(/Ebox öffnen|Open Ebox/i)
          .click({ force: true });
      });

    // Check if any API was called with magic link
    cy.wait(3000).then(() => {
      // Try to get magic link from intercepted requests
      cy.get('@magicLinkAPI.all').then((interceptions) => {
        if (interceptions && interceptions.length > 0) {
          cy.log('📡 Magic Link API was called:', interceptions);
        }
      });
      cy.get('@magicLinkAPI2.all').then((interceptions) => {
        if (interceptions && interceptions.length > 0) {
          cy.log('📡 Magic Link API2 was called:', interceptions);
        }
      });
    });

    // Check if URL changed (maybe it navigated)
    cy.url({ timeout: 10000 }).then((url) => {
      cy.log(`Current URL: ${url}`);
      if (url.includes('magic-link?session=')) {
        // Extract and validate the session token
        const urlObj = new URL(url);
        const sessionToken = urlObj.searchParams.get('session');
        cy.log(`🔑 Session Token: ${sessionToken}`);

        // Validate token format
        expect(sessionToken, 'Session token should exist').to.exist;
        expect(
          sessionToken,
          'Token length should be > 20',
        ).to.have.length.greaterThan(20);
        expect(sessionToken, 'Token should be alphanumeric').to.match(
          /^[A-Za-z0-9]+$/,
        );

        cy.log('Successfully navigated to user inbox via magic link');
      } else {
        cy.log(
          'URL did not change to magic link. Need to investigate further.',
        );
      }
    });

    cy.wait(2000);
  }); //End IT
});
