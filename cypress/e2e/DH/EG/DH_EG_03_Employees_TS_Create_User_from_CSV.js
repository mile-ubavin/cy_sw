describe('Admin User - Create User via CSV', () => {
  //Precondition: Clear user`s email inbox if its not an empty
  it('Yopmail - Clear inbox', () => {
    // Visit yopmail application or login page
    cy.visit('https://yopmail.com/en/');

    // Access the first Admin User object from cypress.config.js
    const csvTestuser = Cypress.env('csvTestuser')[0];

    // Enter email and refresh
    cy.get('#login')
      .type(csvTestuser.email)
      .should('have.value', csvTestuser.email);
    cy.get('#refreshbut').click();

    // Wait for inbox to load
    cy.wait(2000);

    // Access the inbox iframe
    cy.get('iframe#ifinbox').then(($iframe) => {
      const $body = $iframe.contents().find('body');

      // Wrap iframe body for Cypress commands
      cy.wrap($body).then(($inbox) => {
        if ($inbox.find('.mctn .lm').length === 0) {
          // No emails → skip delete
          cy.log(`Inbox for ${csvTestuser.email} is empty. Skipping delete.`);
        } else {
          // Emails exist → check delete button in main page
          cy.get('#delall').then(($btn) => {
            if (!$btn.is(':disabled')) {
              cy.wrap($btn).click({ force: true });
              cy.log(`All emails deleted for ${csvTestuser.email}`);
            } else {
              cy.log(`Delete button disabled for ${csvTestuser.email}`);
            }
          });
        }
      });
    });
  });

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
    const usersToDelete = ['ottoTestuser', 'emmaTestuser']; // Add more usernames as needed

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
      Cypress.env('username_supportViewAdmin'),
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
                      `Checkbox for "${text}" was not enabled; now enabled.`,
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

  //  Create new user via CSV file (base and alternative scenrios)
  it('Login As AdminUser to DH - Create Users from CSV file', () => {
    //
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

    // Click on Admin User button (from sidebar navigation menu)
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

    //>>> 1.Alternative Test scenario ->(updateUser:true) Try to Update 1 non exiting user

    //Click on Upload CSV button
    cy.get('#employee-upload-csv').should('be.visible').click();

    cy.wait(1500);

    // Validate Title of Create User via CSV dialog
    cy.get('header>h1')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/CSV Import|CSV Import/);
      });

    cy.wait(500);

    // Validate subtitle
    cy.get('main>p')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Select a CSV file to create multiple users at once|Wählen Sie eine CSV-Datei aus, um mehrere Benutzer gleichzeitig anzulegen/,
        );
      });

    cy.wait(1500);
    cy.DHupdateExistingUser_viaCSV();
    cy.wait(2500);

    cy.intercept('POST', '**/person/uploadCsv').as('uploadCSV');

    // Click on Create/Update button (multi-language support)
    cy.get('main[role="main"] > nav > button')
      .contains(/Anzlegen\/Updaten|Create\/Update/i)
      .click();

    // Wait for request & assert
    cy.wait('@uploadCSV', { timeout: 15000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('Successful import');
    });

    // Validate CSV import user dialog with support for both EN and DE versions
    cy.get('#dialog-title')
      .should('be.visible') // Ensure the dialog title is visible
      .invoke('text') // Get the text content of the h4 element
      .then((text) => {
        const trimmedText = text.trim(); // Trim any leading/trailing whitespace
        // Validate that the text matches either the German or English version
        expect(trimmedText).to.match(/CSV Import Result|CSV Import Ergebnis/i); // Case-insensitive match
      });

    cy.wait(500);

    //Validate CSV import user dialog
    cy.get('div[role="dialog"]>div:nth-child(2)>div>div>div>span')
      .should('be.visible') // Ensure the dialog title is visible
      .invoke('text') // Get the text content of the h4 element
      .then((text) => {
        const trimmedText = text.trim(); // Trim any leading/trailing whitespace
        // Validate that the text matches either the German or English version
        expect(trimmedText).to.match(
          /Attempted to update 1 non-existing user|Versucht 1 nicht existierenden Benutzer zu aktualisieren/i,
        ); // Case-insensitive match
      });

    cy.wait(1500);

    //Close button
    cy.get('    div[role="dialog"]>div:nth-child(3)>button>div')
      .should('be.visible')
      .wait(1000)
      .contains(/OK|OK/i) // DE + EN
      .click();

    cy.wait(1500);

    //Scroll UP
    cy.scrollTo('top', { behavior: 'smooth' });
    cy.wait(500);

    // Click on "Upload csv file" button with validation
    cy.get('#employee-upload-csv')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
      .should('be.visible')
      .click();
    cy.wait(500);

    //Upload noexisting User via CSV
    cy.DHupload305Dictionary();
    cy.wait(2500);
    //Validate Error message
    cy.get('div[role="status"] span')
      .should('be.visible')
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /File format not supported|Das Dateiformat wird nicht unterstützt/,
        );
      });
    cy.wait(2500);

    //Click on Delete document - for deletioon of already uploaded document
    cy.get('#delete').click();
    cy.wait(1500);

    //Create new user via CSV
    cy.DHcreateNewUser_viaCSV();
    cy.wait(2500);

    //Validate Company prefix label
    cy.get('#csv-upload-prefix-dropdown-label')
      .should('be.visible') // Ensure the label is visible
      .invoke('text') // Get the text of the label
      .then((text) => {
        const trimmedText = text.trim(); // Trim any leading/trailing whitespace
        expect(trimmedText).to.match(/Company Prefix|Firmenpräfix/i); // Validate against both English and German
      });

    //select Company prefix
    cy.get('#csv-upload-prefix-dropdown').click({
      force: true,
    });
    cy.wait(1000);
    //cy.get("ul[role='listbox'] > li:nth-of-type(1)").click({ force: true });
    cy.get("ul[role='listbox'] > li")
      .should('be.visible')
      .each(($el) => {
        const text = $el.text().trim().toLowerCase();
        cy.log('***************************', text);

        if (text === 'aqua - aqua') {
          cy.wrap($el).click({ force: true });
        }
      });

    cy.wait(1500);

    //Click on Create/Update button
    cy.get('main[role="main"] > nav > button')
      .contains(/Anzlegen\/Updaten|Create\/Update/i) // Regex to match both texts
      .click();

    //cy.get('.e6eoyw38>.linkbtn--primary').click({ force: true });

    // Validate CSV import user dialog with support for both EN and DE versions
    //Validate Title of CSV import user dialog with support for both EN and DE versions
    cy.get('div[role="dialog"] > div:nth-child(1) > h4')
      .should('be.visible') // Ensure the dialog title is visible
      .invoke('text') // Get the text content of the h4 element
      .then((text) => {
        const trimmedText = text.trim(); // Trim any leading/trailing whitespace
        // Validate that the text matches either the German or English version
        expect(trimmedText).to.match(/CSV Import Result|CSV Import Ergebnis/i); // Case-insensitive match
      });

    cy.wait(500);

    //Validate CSV import user dialog
    cy.get('div[role="dialog"]>div:nth-child(2)>div>div>div>span')
      .should('be.visible') // Ensure the dialog title is visible
      .invoke('text') // Get the text content of the h4 element
      .then((text) => {
        const trimmedText = text.trim(); // Trim any leading/trailing whitespace
        // Validate that the text matches either the German or English version
        expect(trimmedText).to.match(
          /1 Benutzer wurde erstellt|1 user was created/i,
        ); // Case-insensitive match
      });

    cy.wait(1500);

    //Close button
    cy.get('div[role="dialog"]>div:nth-child(3)>button>div')
      .should('be.visible')
      .wait(1000)
      .contains(/OK|OK/i) // DE + EN
      .click();

    cy.wait(1500);

    // ===== Alternative Scenario 2: Try to Update 2 Non-Existing Users =====
    cy.log('>>> Alternative Scenario 2: Try to Update 2 Non-Existing Users');

    // Scroll to top to ensure "Upload CSV" button is visible
    cy.scrollTo('top', { duration: 500 });
    cy.wait(500);

    // Click on Upload CSV button
    cy.get('#employee-upload-csv').should('be.visible').click();
    cy.wait(1500);

    // Upload CSV file with 2 users that don't exist
    cy.DHupdateTwoNonExistingUsers_viaCSV();
    cy.wait(2500);

    // Select Company Prefix
    //select Company prefix
    cy.get('#csv-upload-prefix-dropdown').click({
      force: true,
    });
    cy.wait(1000);
    //cy.get("ul[role='listbox'] > li:nth-of-type(1)").click({ force: true });
    cy.get("ul[role='listbox'] > li")
      .should('be.visible')
      .each(($el) => {
        const text = $el.text().trim().toLowerCase();
        cy.log('***************************', text);

        if (text === 'aqua - aqua') {
          cy.wrap($el).click({ force: true });
        }
      });

    cy.wait(1500);

    cy.intercept('POST', '**/person/uploadCsv').as('updateTwoNonExisting');

    // Click on Create/Update button
    cy.get('main[role="main"] > nav > button')
      .contains(/Anzlegen\/Updaten|Create\/Update/i)
      .click();

    // Wait for request and validate response
    cy.wait('@updateTwoNonExisting', { timeout: 15000 }).then(
      (interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const response = interception.response.body;
        cy.log('Update Two Non-Existing Users Response:', response);

        // Validate that it shows attempted to update 2 non-existing users
        cy.get('div[role="dialog"]>div:nth-child(2)>div>div>div>span')
          .should('be.visible')
          .invoke('text')
          .then((text) => {
            expect(text.trim()).to.match(
              /Attempted to update 2 non-existing user|Versucht 2 nicht existierenden Benutzer zu aktualisieren/i,
            );
          });
      },
    );

    cy.wait(1500);

    // Close dialog
    cy.get('div[role="dialog"]>div:nth-child(3)>button>div')
      .contains(/OK|OK/i)
      .click();
    cy.wait(1500);

    // ===== Alternative Scenario 3: Upload CSV with Mixed Valid/Invalid Data =====
    cy.log('>>> Alternative Scenario 3: Upload CSV with Duplicate Entries');

    // Scroll to top
    cy.scrollTo('top', { duration: 500 });
    cy.wait(500);

    // Click on Upload CSV button
    cy.get('#employee-upload-csv').should('be.visible').click();
    cy.wait(1500);

    // Upload CSV with duplicate user entries
    cy.DHuploadDuplicateUsers_viaCSV();
    cy.wait(2500);

    // Select Company Prefix
    cy.get('#csv-upload-prefix-dropdown').click({ force: true });
    cy.wait(1000);

    // Select "AQUA - aqua" prefix
    cy.get("ul[role='listbox'] > li")
      .should('be.visible')
      .each(($el) => {
        const text = $el.text().trim().toLowerCase();
        if (text === 'aqua - aqua') {
          cy.wrap($el).click({ force: true });
        }
      });
    cy.wait(1500);

    cy.intercept('POST', '**/person/uploadCsv').as('uploadDuplicates');

    // Click on Create/Update button
    cy.get('main[role="main"] > nav > button')
      .contains(/Anzlegen\/Updaten|Create\/Update/i)
      .click();

    // Wait for request and validate
    cy.wait('@uploadDuplicates', { timeout: 15000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('Duplicate Upload Response:', interception.response.body);

      // Validate result message
      cy.get('#dialog-title')
        .should('be.visible')
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.match(
            /CSV Import Result|CSV Import Ergebnis/i,
          );
        });
    });

    cy.wait(1500);

    // Close dialog
    cy.get('div[role="dialog"]>div:nth-child(3)>button>div')
      .contains(/OK|OK/i)
      .click();
    cy.wait(1500);

    // ===== Main Scenario: Create New User via CSV (Final Success) =====
    cy.log('>>> Main Scenario: Create New User via CSV');

    // Scroll to top
    cy.scrollTo('top', { duration: 500 });
    cy.wait(500);

    // Click on Upload CSV button
    cy.get('#employee-upload-csv').should('be.visible').click();
    cy.wait(1500);

    // Upload valid CSV file
    cy.DHcreateNewUser_viaCSV();
    cy.wait(2500);

    // Select Company Prefix
    cy.get('#csv-upload-prefix-dropdown').click({ force: true });
    cy.wait(1000);

    // Select "AQUA - aqua" prefix
    cy.get("ul[role='listbox'] > li")
      .should('be.visible')
      .each(($el) => {
        const text = $el.text().trim().toLowerCase();
        if (text === 'aqua - aqua') {
          cy.wrap($el).click({ force: true });
        }
      });
    cy.wait(1500);

    cy.intercept('POST', '**/person/uploadCsv').as('createNewUserCSV');

    // Click on Create/Update button
    cy.get('main[role="main"] > nav > button')
      .contains(/Anzlegen\/Updaten|Create\/Update/i)
      .click();

    // Wait for user creation request
    cy.wait('@createNewUserCSV', { timeout: 15000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('Create New User Response:', interception.response.body);

      // Validate success message
      cy.get('div[role="dialog"]>div:nth-child(2)>div>div>div>span')
        .should('be.visible')
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.match(
            /1 user was skipped because it already exists|1 Benutzer wurde übersprungen, da er bereits existiert/i,
          );
        });
    });

    cy.wait(1500);

    // Close success dialog by clicking "OK"
    cy.get('div[role="dialog"]>div:nth-child(3)>button>div')
      .contains(/OK|OK/i)
      .click();
    cy.wait(1500);

    // ===== Verify User Was Created =====
    cy.log('>>> Verifying newly created user exists in employee list');

    //Click on magnifier icon to open search field
    cy.get('.css-uinsfl>button>.MuiSvgIcon-root')
      .eq(0) // Ensure we target the first magnifier icon
      .should('be.visible')
      .click({ multiple: true });
    cy.wait(1000);

    // Search for the already created user by Personal Number
    cy.get('input[placeholder="Personal Numbers"]')
      .click()
      .should('be.visible')
      .type('ottoTestuser');
    cy.wait(2000);

    // Verify user count and data in the table
    cy.get('table tbody tr').should('have.length.at.least', 1); // Assert at least one row exists in search results
    cy.log('✓ At least 1 user found in search results'); // Log successful count verification

    // Verify detailed user data in the table row
    cy.get('table tbody tr') // Select all table body rows
      .first() // Get the first row (most recent/top user)
      .within(() => {
        // Scope all subsequent commands to within this row
        // Verify Name (combines familyName + givenName)
        // Note: Index 0 is the menu column (...), so Name is at index 1
        cy.get('td') // Get all table cells in the row
          .eq(1) // Select the 2nd cell (index 1) - Name column
          .invoke('text') // Extract text content from the cell
          .then((text) => {
            // Process the extracted text
            expect(text.trim()).to.include('Create OttO'); // Assert name contains expected value from CSV
            cy.log('✓ Name verified: Contains "Create OttO"'); // Log successful verification
          });

        // Verify Personal Number (accountNumber)
        cy.get('td') // Get all table cells in the row
          .eq(2) // Select the 3rd cell (index 2) - Personal Number column
          .invoke('text') // Extract text content from the cell
          .then((text) => {
            // Process the extracted text
            expect(text.trim()).to.equal('ottoTestuser'); // Assert exact match with accountNumber from CSV
            cy.log('✓ Personal Number verified: ottoTestuser'); // Log successful verification
          });

        // Verify Username (prefix + accountNumber)
        cy.get('td') // Get all table cells in the row
          .eq(3) // Select the 4th cell (index 3) - Username column
          .invoke('text') // Extract text content from the cell
          .then((text) => {
            // Process the extracted text
            expect(text.trim()).to.equal('aquaottoTestuser'); // Assert username = company prefix + accountNumber
            cy.log('✓ Username verified: aquaottoTestuser'); // Log successful verification
          });

        // Verify Email
        cy.get('td') // Get all table cells in the row
          .eq(4) // Select the 5th cell (index 4) - Email column
          .invoke('text') // Extract text content from the cell
          .then((text) => {
            // Process the extracted text
            expect(text.trim()).to.equal('otto.testuser@yopmail.com'); // Assert email matches CSV data
            cy.log('✓ Email verified: otto.testuser@yopmail.com'); // Log successful verification
          });

        // Verify Phone Number
        cy.get('td') // Get all table cells in the row
          .eq(5) // Select the 6th cell (index 5) - Phone Number column
          .invoke('text') // Extract text content from the cell
          .then((text) => {
            // Process the extracted text
            expect(text.trim()).to.include('+3816411111111'); // Assert phone contains expected number from CSV
            cy.log('✓ Phone Number verified: Contains +3816411111111'); // Log successful verification
          });

        // Verify Email Active (No/Yes)
        cy.get('td') // Get all table cells in the row
          .eq(6) // Select the 7th cell (index 6) - Email Active column
          .invoke('text') // Extract text content from the cell
          .then((text) => {
            // Process the extracted text
            expect(text.trim()).to.equal('No'); // Assert email is not yet activated (new user)
            cy.log('✓ Email Active verified: No'); // Log successful verification
          });

        // Verify Delivery Type
        cy.get('td') // Get all table cells in the row
          .eq(7) // Select the 8th cell (index 7) - Delivery Type column
          .invoke('text') // Extract text content from the cell
          .then((text) => {
            // Process the extracted text
            expect(text.trim()).to.equal('Digital'); // Assert delivery type is Digital (not Print)
            cy.log('✓ Delivery Type verified: Digital'); // Log successful verification
          });

        // Verify Status is Active
        cy.get('td') // Get all table cells in the row
          .eq(8) // Select the 9th cell (index 8) - Status column
          .invoke('text') // Extract text content from the cell
          .then((text) => {
            // Process the extracted text
            expect(text.trim()).to.equal('Active'); // Assert user status is Active (not Inactive)
            cy.log('✓ Status verified: Active'); // Log successful verification
          });
      });

    cy.log('User ottoTestuser successfully created with all correct data');

    cy.wait(1500);

    // Clear search by clicking the close icon or clearing the input
    cy.get('input[placeholder="Personal Numbers"]').clear();
    cy.wait(1000);

    // ===== Logout from DH =====

    cy.get('.MuiButton-text').click();
    cy.wait(1000);
    cy.get('li[role="menuitem"]')
      .contains(/Abmelden|Logout/i)
      .click();
    cy.url().should('include', Cypress.env('dh_baseUrl'));
    cy.log('Upload finished successfully.');
    cy.wait(2500);
  }); //end it

  //Yopmail - Confirm email and Change password
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
      .should('include.text', 'Ihr neuer Benutzer im DocuHub Portal'); //Validate subject of Verification email

    cy.iframe('#ifmail')
      .find(
        '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span',
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
            '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span>a',
          )
          .should('include.text', 'Jetzt E-Mail Adresse bestätigen')
          .invoke('attr', 'href')
          .then((href) => {
            // Log link text
            cy.log(`The href attribute is: ${href}`);
          });

        cy.iframe('#ifmail')
          .find(
            '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span>a',
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

          .should('include.text', 'Passwort zurücksetzen DocuHub Portal'); //Validate subject of Verification email

        let initialUrl_pass;
        cy.iframe('#ifmail')
          .find(
            '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a',
          )
          .should('include.text', 'Neues Passwort erstellen ')
          .invoke('attr', 'href')
          .then((href) => {
            // Log link text
            cy.log(`The href attribute is: ${href}`);
          });
        cy.iframe('#ifmail')
          .find(
            '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a',
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

  // DH Edit/Update existing user via CSV file
  it('Login As AdminUser to DH - Edit/Update User from CSV file', () => {
    // ===== STEP 1: Login to DocumentHub =====
    cy.visit(Cypress.env('dh_baseUrl')); // Navigate to DH base URL
    cy.url().should('include', Cypress.env('dh_baseUrl')); // Verify URL

    // Remove Cookie dialog if present
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      } else {
        cy.log('Cookie bar not visible');
      }
    });

    cy.loginToDH(); // Login using custom command
    cy.wait(2000); // Wait for login to complete
    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`); // Verify login success

    // ===== STEP 2: Navigate to Employees Section =====
    cy.scrollTo('top', { duration: 200 }); // Scroll to ensure sidebar visibility

    cy.intercept('GET', '**/person/fromGroup/**').as('getEmployees'); // Intercept employee list request
    cy.get('#nav-employees') // Click on Employees navigation
      .should('be.visible')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // Highlight for visibility
      .wait(1500)
      .click();

    cy.wait('@getEmployees', { timeout: 35000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200); // Verify successful API call
    });
    cy.wait(1500);

    // ===== STEP 3: Select Company from Dropdown =====
    const companyName = Cypress.env('company').toLowerCase();

    cy.get('#employee-select-company').click({ force: true }); // Open company dropdown
    cy.wait(1000);

    // Find and select matching company
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
    cy.wait(1000);

    // ===== STEP 4: Search for Existing User to Verify They Exist =====
    cy.scrollTo('top', { duration: 500 }); // Ensure search field is visible

    // Click on magnifier icon to open search field
    cy.get('.css-uinsfl>button>.MuiSvgIcon-root')
      .eq(0) // Target the first magnifier icon
      .should('be.visible')
      .click({ multiple: true });
    cy.wait(1000);

    // Search for user by Personal Number
    cy.get('input[placeholder="Personal Numbers"]')
      .click()
      .should('be.visible')
      .type('ottoTestuser'); // Search for the user to update
    cy.wait(2000);

    // Verify user exists in search results
    cy.get('table tbody tr').should('have.length.at.least', 1);
    cy.log('✓ User ottoTestuser found - ready for update');

    // Clear search to prepare for CSV upload
    cy.get('input[placeholder="Personal Numbers"]').clear();
    cy.wait(1000);

    // ===== STEP 5: Upload CSV to Update User =====
    cy.scrollTo('top', { duration: 500 }); // Ensure CSV upload button is visible

    // Click on Upload CSV button
    cy.get('#employee-upload-csv')
      .should('be.visible')
      .invoke('attr', 'style', 'border: 2px solid blue; padding: 2px;') // Highlight button
      .click();
    cy.wait(1500);

    // ===== STEP 6: Validate CSV Upload Dialog =====
    // Verify dialog title
    cy.get('header>h1')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/CSV Import|CSV Import/i);
      });

    // Verify dialog subtitle (same for create and update)
    cy.get('main>p')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Select a CSV file/i);
      });
    cy.wait(1000);

    // ===== STEP 7: Upload Update CSV File (with updateUser=true flag) =====
    cy.DHupdateExistingUser_viaCSV(); // Upload the update CSV file with updateUser=true
    cy.wait(2500);

    // ===== STEP 8: Select Company Prefix =====
    // Validate Company prefix label
    cy.get('#csv-upload-prefix-dropdown-label')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Company Prefix|Firmenpräfix/i);
      });

    // Select Company Prefix
    cy.get('#csv-upload-prefix-dropdown').click({ force: true });
    cy.wait(1000);

    // Select "AQUA - aqua" prefix
    cy.get("ul[role='listbox'] > li")
      .should('be.visible')
      .each(($el) => {
        const text = $el.text().trim().toLowerCase();
        if (text === 'aqua - aqua') {
          cy.wrap($el).click({ force: true });
        }
      });
    cy.wait(1500);

    // ===== STEP 9: Submit Update Request =====
    cy.intercept('POST', '**/person/uploadCsv').as('updateUserCSV'); // Intercept update request

    // Click on Create/Update button
    cy.get('main[role="main"] > nav > button')
      .contains(/Anzlegen\/Updaten|Create\/Update/i)
      .click();

    // Wait for update request and validate
    cy.wait('@updateUserCSV', { timeout: 15000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200); // Verify successful update
      cy.log('Update User Response:', interception.response.body);

      // Validate success message
      cy.get('div[role="dialog"]>div:nth-child(2)>div>div>div>span')
        .should('be.visible')
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.match(
            /1 Benutzer wurde aktualisiert|1 user was updated/i,
          );
        });
    });

    cy.wait(1500);

    // Close success dialog
    cy.get('div[role="dialog"]>div:nth-child(3)>button>div')
      .contains(/OK|OK/i)
      .click();
    cy.wait(1500);

    // ===== STEP 10: Verify User Was Updated =====
    cy.log('>>> Verifying user data was updated correctly');

    // Clear previous search
    cy.get('input[placeholder="Personal Numbers"]').clear();
    cy.wait(500);

    // Search for updated user again
    cy.get('input[placeholder="Personal Numbers"]').type('ottoTestuser');
    cy.wait(2000);

    // Verify updated data in table
    cy.get('table tbody tr')
      .first()
      .within(() => {
        // Verify updated Name
        cy.get('td')
          .eq(1) // Name column
          .invoke('text')
          .then((text) => {
            expect(text.trim()).to.include('Updated OTTO User'); // Updated name from CSV
            cy.log('✓ Name updated: Contains "Updated OTTO User"');
          });

        // Verify updated Email
        cy.get('td')
          .eq(4) // Email column
          .invoke('text')
          .then((text) => {
            expect(text.trim()).to.equal('update-csv.testuser@yopmail.com'); // Updated email from CSV
            cy.log('✓ Email updated: update-csv.testuser@yopmail.com');
          });

        // Verify updated Phone Number
        cy.get('td')
          .eq(5) // Phone column
          .invoke('text')
          .then((text) => {
            expect(text.trim()).to.include('+381642826462'); // Updated phone from CSV
            cy.log('✓ Phone updated: +381642826462');
          });
      });

    cy.log('✓✓✓ User ottoTestuser successfully updated with new data from CSV');
    cy.wait(1500);

    // Clear search
    cy.get('input[placeholder="Personal Numbers"]').clear();
    cy.wait(1000);

    // ===== STEP 11: Logout from DH =====
    cy.get('.MuiButton-text').click(); // Click user menu
    cy.wait(1000);
    cy.get('li[role="menuitem"]')
      .contains(/Abmelden|Logout/i)
      .click();
    cy.url().should('include', Cypress.env('dh_baseUrl'));
    cy.log('User update test completed successfully.');
    cy.wait(2500);
  }); //end it

  //New user -  1st time Login to e-Box
  it('Login to e-Box 1st time', () => {
    cy.visit(Cypress.env('baseUrl_egEbox'));
    cy.wait(2500);

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
      Cypress.env('companyPrefix') + csvUser.accountNumber,
    );

    cy.get('.ng-invalid > .input > .input__field-input').type(
      Cypress.env('password_egEbox'),
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
      },
    );
    cy.wait(2500);

    // Logout
    cy.get('.user-title').click();
    cy.wait(1500);
    cy.get('.logout-title > a').click();
    //cy.url().should('include', payslipJson.baseUrl_egEbox); // Validate url
    cy.url().should('include', Cypress.env('baseUrl_egEbox')); // Validate url
    cy.log('Test completed successfully.');
  });

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

  //Clear user`s email inbox
  it('Yopmail - Clear inbox', () => {
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
