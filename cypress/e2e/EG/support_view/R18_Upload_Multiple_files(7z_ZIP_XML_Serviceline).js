describe('Upload Multiple Files (xml, txt, serviceline, pdf, zip, 7z)', () => {
  //Disable hrManagement flag on Company
  it('Disable hrManagement flag on Company', () => {
    //Import credentials (un/pw) from 'supportView.json' file

    cy.loginToSupportViewMaster();
    cy.wait(1500);

    //Remove pop up dilaog
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(2500);

    //Search for Company by Display Name
    cy.get('#searchButton>span').click(); //Click on search button
    cy.wait(1000);
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      // Use the company name from the cypress.config.js
      const companyName = Cypress.env('company');
      // Search for Group by Display Name using the company name
      cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
        .eq(0)
        .type(companyName);
    });
    //Find the Search button by button name and click on it
    cy.wait(1500);
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    //Switch to user section
    cy.get('.action-buttons > .mdc-button').eq(0).click();
    cy.wait(1500);
    //Scroll to the botton
    cy.get('.mat-mdc-dialog-content').scrollTo('bottom');
    cy.wait(2500);

    //Uncheck HR checkbox
    cy.get('#hrManagementEnabled').then(($checkbox) => {
      if ($checkbox.is(':checked')) {
        // If the checkbox is checked, uncheck it
        cy.get('#hrManagementEnabled').uncheck({ force: true });
        cy.log('HR role was enabled, now disabled.');

        // Save Edit Company dialog
        cy.get('button[type="submit"]').click();
      } else {
        // If the checkbox is already disabled
        cy.log('HR role is already disabled.');
        cy.get('.close[data-mat-icon-name="close"]').click();
      }
    });
    //Close Edit Company dialog
    cy.wait(2500);
    //Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    // cy.url().should('include', payslipJson.baseUrl); // Validate url'
    cy.log('Test completed successfully.');
    cy.wait(2500);
  }); //end it

  //Enable All Roles, except HR Role
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
      .eq(1)
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

  //Admin user can Upload Multiple files (xml, txt, serviceline, pdf, zip, 7z) - Remove inapropriate uploaded file
  it('Upload Multiple files (xml, txt, serviceline, pdf, zip, 7z)', () => {
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

    //Upload Multiple files (xml, txt, serviceline, pdf, zip, 7z)
    cy.uploadMultipleTestFiles();

    cy.wait(2500);

    // Select Company
    cy.get('.mdc-floating-label').click({
      force: true,
    });
    cy.wait(1500);

    const toCompanies = ['ServiceLine'];
    cy.get('mat-option[role="option"]>.mdc-list-item__primary-text')
      .should('exist') // Ensure checkbox labels exist
      .each(($label) => {
        const text = $label.text().trim();
        if (toCompanies.includes(text)) {
          // Target the specific checkbox
          cy.wrap($label)
            .parent()
            .find('.mdc-list-item__primary-text') // Locate the checkbox input
            .then(($checkboxInput) => {
              if (!$checkboxInput.is(':checked')) {
                // Enable the role if not already checked
                cy.wrap($checkboxInput).click({ force: true });
                cy.log(`Checkbox for "${text}" was not enabled; now enabled.`);
              } else {
                // Role is already enabled
                cy.log(`Checkbox for "${text}" is already enabled.`);
              }
            });
        }
      });

    // Wait for the deselection process to complete
    cy.wait(1000);
    // Focus out
    cy.get('body').type('{esc}');
    cy.wait(1500);

    // Function: Wait until receive response -> success: false
    function waitForFailedProcessing() {
      return cy
        .wait('@compelteUpload/PorcessingFiles', { timeout: 27000 })
        .then((interception) => {
          //get value from response
          const success = interception.response.body?.success;

          if (success === false) {
            cy.log('Received expected response -> success: false');
            return cy.wrap(interception); // Important: wrap sync value
          }

          cy.log('Ignoring success: true, checking again...');
          return waitForFailedProcessing(); // Recursive call
        });
    }

    cy.intercept(
      'POST',
      '**/deliveryHandler/checkDocumentProcessingStatus**'
    ).as('compelteUpload/PorcessingFiles');

    // Click on Upload Personal Document button
    cy.get('.dialog-actions>button>.title')
      .contains(/Upload Personal Document|Personalisierte Dokumente hochladen/i)
      .should('be.visible')
      .click();

    // Start recursive waiting
    waitForFailedProcessing().then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });
    cy.wait(1500);

    //Remove invalid files from the list
    cy.get('.list-item-header > .list-item-status > .danger')
      .should('be.visible')
      .each(($danger) => {
        // Highlight the danger icon
        cy.wrap($danger).invoke(
          'css',
          'text-decoration',
          'underline red solid 2px'
        );

        cy.wait(2500);
        // Go up to the parent .list-item-header and find the delete icon
        cy.wrap($danger)
          .closest('.list-item-header') // Go to the row container
          .find('.list-item-control .mat-icon[data-mat-icon-name="trash"]')
          .should('be.visible')
          .click({ force: true });

        cy.log('Clicked delete icon for a row with red danger message');
      });
    // cy.wait(['@completeCheckingDocumentProcessingStatus'], {
    //   timeout: 27000,
    // }).then((interception) => {
    //   // Log the intercepted response
    //   cy.log('Intercepted response:', interception.response);

    //   // Assert the response status code
    //   expect(interception.response.statusCode).to.eq(200);
    // });

    // Verify warning message, after uplading document
    cy.get('.list-item-status>.warning')
      .should('be.visible') // Ensure it's visible first
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /File contain non valid invoices|Die Datei enthält ungültige Rechnungen/
        );
      });
    cy.wait(2500);

    cy.get('.dialog-actions>button>.title')
      .contains(/Send|Senden /i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

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

    // Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url'
    cy.log('Test completed successfully.');
    cy.wait(2500);
  });

  //Login to e-Box, count the number of latest received deliveries and open one of them
  it('Opens a random delivery from the latest unread', () => {
    //Define number of Latest Received Deliveries
    const numberOfLatestReceivedDeliveries = 8;

    cy.intercept('POST', '**/rest/v2/deliveries').as('postDeliveries');
    cy.loginToEgEbox();

    cy.wait('@postDeliveries').then((interception) => {
      const deliveries = interception.response.body.deliveries;

      // Filter unread deliveries
      const unreadDeliveries = deliveries.filter((d) => d.read === false);

      // Find the most recent date (exact timestamp)
      const latestDate = new Date(
        Math.max(...unreadDeliveries.map((d) => new Date(d.date)))
      );

      // Format latest date with +2 hour offset (for UI match)
      const offsetDate = new Date(latestDate.getTime() + 2 * 60 * 60 * 1000);
      const latestMinute = offsetDate.toISOString().slice(0, 16); // e.g., 2025-05-28T10:31

      // Filter unread deliveries that match the latest date+time (to the minute)
      const latestUnreadDeliveries = unreadDeliveries.filter((d) => {
        const localDate = new Date(
          new Date(d.date).getTime() + 2 * 60 * 60 * 1000
        );
        return localDate.toISOString().slice(0, 16) === latestMinute;
      });

      // Assert expected number of latest unread deliveries
      expect(
        latestUnreadDeliveries.length,
        `Expected ${numberOfLatestReceivedDeliveries} deliveries at ${latestMinute}, but got ${latestUnreadDeliveries.length}`
      ).to.eq(numberOfLatestReceivedDeliveries);

      // Pick a random delivery from the latest group
      const randomDelivery =
        latestUnreadDeliveries[
          Math.floor(Math.random() * latestUnreadDeliveries.length)
        ];
      const { subject } = randomDelivery;
      // Open one of the latest received deiveries

      cy.intercept('GET', '**/getIdentifications?**').as('getIdentifications');
      cy.wait(10000);

      cy.get('.mdc-data-table__content>tr>.subject-sender-cell').each(
        ($el, index) => {
          const text = $el.text().trim();
          if (text === subject) {
            cy.wait(2000);
            cy.wrap($el).click({ force: true });
            cy.log(`Opened delivery: ${text}`);
            return false; // stop iteration
          }
        }
      );

      cy.wait(['@getIdentifications'], { timeout: 77000 }).then(
        (interception) => {
          // Assert the response status code
          expect(interception.response.statusCode).to.eq(200);
        }
      );

      // Logout after test
      cy.get('.user-title').click();
      cy.wait(1500);
      cy.get('.logout-title > a').click();
      cy.url().should('include', Cypress.env('baseUrl_egEbox'));
      cy.log('Test completed successfully.');
    });
  });

  //Yopmail - Validate email
  it('Yopmail - Validate email', () => {
    cy.visit('https://yopmail.com/en/');
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));
    cy.get('#refreshbut > .md > .material-icons-outlined').click();

    const emailSubject = (index) => {
      cy.iframe('#ifinbox')
        .find('.mctn > .m > button > .lms')
        .eq(index)
        .should('include.text', 'Versandreport e-Gehaltszettel Portal');
    };

    const normalize = (str) => str.replace(/\s+/g, ' ').trim();

    const emailBody = () => {
      cy.iframe('#ifmail')
        .find('#mail > div')
        .invoke('text')
        .then((rawText) => {
          const actualText = normalize(rawText).toLowerCase();
          cy.log('Normalized Email Body:\n' + actualText);

          const expectedParts = [
            'sie haben 8 sendung(en) erfolgreich digital in das e-gehaltszettel portal ihrer benutzer*innen eingeliefert',
            'zusätzlich haben sie 0 sendung(en) erfolgreich über den postalischen weg als brief versendet',
            '3 sendung(en) die sie elektronisch verschicken wollten, konnten nicht zugestellt werden',
            'folgende personalnummern sind davon betroffen:',
            'system biller id: invalid, personalnummern: abba000100279311',
            'ihr e-gehaltszettel team',
          ];

          expectedParts.forEach((part, index) => {
            const expected = normalize(part).toLowerCase();
            const found = actualText.includes(expected);

            //     cy.log(
            //       `Validating part #${index + 1}: ${found ? 'FOUND' : 'MISSING'}`
            //     );
            expect(found, `Missing expected part #${index + 1}`).to.be.true;
          });
        });
    };

    emailSubject(0);
    emailBody();
  });

  //Enable hrManagement flag on Company
  it('Enable hrManagement flag on Company', () => {
    //Import credentials (un/pw) from 'supportView.json' file

    cy.loginToSupportViewMaster();
    cy.wait(1500);

    //Remove pop up dilaog
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(2500);

    //Search for Company by Display Name
    cy.get('#searchButton>span').click(); //Click on search button
    cy.wait(1000);
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      // Use the company name from the cypress.config.js
      const companyName = Cypress.env('company');
      // Search for Group by Display Name using the company name
      cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
        .eq(0)
        .type(companyName);
    });
    //Find the Search button by button name and click on it
    cy.wait(1500);
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    //Switch to user section
    cy.get('.action-buttons > .mdc-button').eq(0).click();
    cy.wait(1500);
    //Scroll to the botton
    cy.get('.mat-mdc-dialog-content').scrollTo('bottom');
    cy.wait(2500);
    //Check checkbox
    cy.get('#hrManagementEnabled').then(($checkbox) => {
      if (!$checkbox.is(':checked')) {
        // If the checkbox is not checked, enable it
        cy.get('#hrManagementEnabled').check();
        cy.log('Checkbox was not enabled, now enabled.');
        //Save Edit Company dialog
        cy.get('button[type="submit"]').click();
      } else {
        // If the checkbox is already enabled
        cy.log('Checkbox is already enabled.');
        cy.get('.close[data-mat-icon-name="close"]').click();
      }
      //Close Edit Company dialog
      cy.wait(2500);
      //Logout
      cy.get('.logout-icon ').click();
      cy.wait(2000);
      cy.get('.confirm-buttons > :nth-child(2)').click();
      // cy.url().should('include', payslipJson.baseUrl); // Validate url'
      cy.log('Test completed successfully.');
      cy.wait(2500);
    }); //end
  }); //end it

  //Disable Company Admin and Customer Creator Roles and Enable HR and View E-Box Roles
  it('Disable Company Admin and Customer Creator Roles and Enable HR and View E-Box Roles', () => {
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
      .eq(1)
      .type(Cypress.env('company')); // Use the company name from the cypress.config.js
    cy.wait(1500);
    //Find the Search button by button name and click on it
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    // Switch on Admin User page
    cy.get('.mdc-button__label')
      // Find the button containing "Admin User" or "Admin Benutzer" button
      .contains(/Admin User|Admin Benutzer/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    // Switch on Admin user's Role dilaog
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

    //Disable ViewEbox And DataSubmitter Roles for specific Admin user

    //List of roles to disable
    const rolesToDisable = [
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

        // Check if text exists in either English or German in rolesToDisable
        if (rolesToDisable.some(([en, de]) => text === en || text === de)) {
          cy.wrap($label)
            .parent()
            .find('input[type="checkbox"]') // Locate the checkbox input
            .then(($checkboxInput) => {
              cy.wrap($checkboxInput)
                .invoke('prop', 'checked')
                .then((isChecked) => {
                  if (isChecked) {
                    // Disable the role if it is currently checked
                    cy.wrap($checkboxInput).click({ force: true });
                    cy.log(`Checkbox for "${text}" was enabled; now disabled.`);
                  } else {
                    cy.log(`Checkbox for "${text}" is already disabled.`);
                  }
                });
            });
        }
      });
    cy.wait(1500);

    // Enable HR and View E-Box Roles, for specific Admin user
    const rolesToEnable = [
      ['View E-Box', 'E-Box ansehen'],
      ['HR Manager', 'HR Manager'],
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

  //Admin (with HR pemission), Upload Multiple files (xml, txt, serviceline, pdf, zip, 7z) - Remove inapropriate uploaded file
  it('Upload Multiple files (xml, txt, serviceline, pdf, zip, 7z)', () => {
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

    //Upload Multiple files (xml, txt, serviceline, pdf, zip, 7z)
    cy.uploadMultipleTestFiles();

    cy.wait(2500);

    // Select Company
    cy.get('.mdc-floating-label').click({
      force: true,
    });
    cy.wait(1500);

    const toCompanies = ['ServiceLine'];
    cy.get('mat-option[role="option"]>.mdc-list-item__primary-text')
      .should('exist') // Ensure checkbox labels exist
      .each(($label) => {
        const text = $label.text().trim();
        if (toCompanies.includes(text)) {
          // Target the specific checkbox
          cy.wrap($label)
            .parent()
            .find('.mdc-list-item__primary-text') // Locate the checkbox input
            .then(($checkboxInput) => {
              if (!$checkboxInput.is(':checked')) {
                // Enable the role if not already checked
                cy.wrap($checkboxInput).click({ force: true });
                cy.log(`Checkbox for "${text}" was not enabled; now enabled.`);
              } else {
                // Role is already enabled
                cy.log(`Checkbox for "${text}" is already enabled.`);
              }
            });
        }
      });

    // Wait for the deselection process to complete
    cy.wait(1000);
    // Focus out
    cy.get('body').type('{esc}');
    cy.wait(1500);

    // Function: Wait until receive response -> success: false
    function waitForFailedProcessing() {
      return cy
        .wait('@compelteUpload/PorcessingFiles', { timeout: 27000 })
        .then((interception) => {
          //get value from response
          const success = interception.response.body?.success;

          if (success === false) {
            cy.log('Received expected response -> success: false');
            return cy.wrap(interception); // Important: wrap sync value
          }

          cy.log('Ignoring success: true, checking again...');
          return waitForFailedProcessing(); // Recursive call
        });
    }

    cy.intercept(
      'POST',
      '**/deliveryHandler/checkDocumentProcessingStatus**'
    ).as('compelteUpload/PorcessingFiles');

    // Click on Upload Personal Document button
    cy.get('.dialog-actions>button>.title')
      .contains(/Upload Personal Document|Personalisierte Dokumente hochladen/i)
      .should('be.visible')
      .click();

    // Start recursive waiting
    waitForFailedProcessing().then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });
    cy.wait(1500);

    //Remove invalid files from the list
    cy.get('.list-item-header > .list-item-status > .danger')
      .should('be.visible')
      .each(($danger) => {
        // Highlight the danger icon
        cy.wrap($danger).invoke(
          'css',
          'text-decoration',
          'underline red solid 2px'
        );

        cy.wait(2500);
        // Go up to the parent .list-item-header and find the delete icon
        cy.wrap($danger)
          .closest('.list-item-header') // Go to the row container
          .find('.list-item-control .mat-icon[data-mat-icon-name="trash"]')
          .should('be.visible')
          .click({ force: true });

        cy.log('Clicked delete icon for a row with red danger message');
      });
    // cy.wait(['@completeCheckingDocumentProcessingStatus'], {
    //   timeout: 27000,
    // }).then((interception) => {
    //   // Log the intercepted response
    //   cy.log('Intercepted response:', interception.response);

    //   // Assert the response status code
    //   expect(interception.response.statusCode).to.eq(200);
    // });

    // Verify warning message, after uplading document
    cy.get('.list-item-status>.warning')
      .should('be.visible') // Ensure it's visible first
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /File contain non valid invoices|Die Datei enthält ungültige Rechnungen/
        );
      });
    cy.wait(2500);

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

    // Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url'
    cy.log('Test completed successfully.');
    cy.wait(2500);
  });

  //Login to e-Box, count the number of latest received deliveries and open one of them
  it('Opens a random delivery from the latest unread', () => {
    //Define number of Latest Received Deliveries
    const numberOfLatestReceivedDeliveries = 8;

    cy.intercept('POST', '**/rest/v2/deliveries').as('postDeliveries');
    cy.loginToEgEbox();

    cy.wait('@postDeliveries').then((interception) => {
      const deliveries = interception.response.body.deliveries;

      // Filter unread deliveries
      const unreadDeliveries = deliveries.filter((d) => d.read === false);

      // Find the most recent date (exact timestamp)
      const latestDate = new Date(
        Math.max(...unreadDeliveries.map((d) => new Date(d.date)))
      );

      // Format latest date with +2 hour offset (for UI match)
      const offsetDate = new Date(latestDate.getTime() + 2 * 60 * 60 * 1000);
      const latestMinute = offsetDate.toISOString().slice(0, 16); // e.g., 2025-05-28T10:31

      // Filter unread deliveries that match the latest date+time (to the minute)
      const latestUnreadDeliveries = unreadDeliveries.filter((d) => {
        const localDate = new Date(
          new Date(d.date).getTime() + 2 * 60 * 60 * 1000
        );
        return localDate.toISOString().slice(0, 16) === latestMinute;
      });

      // Assert expected number of latest unread deliveries
      expect(
        latestUnreadDeliveries.length,
        `Expected ${numberOfLatestReceivedDeliveries} deliveries at ${latestMinute}, but got ${latestUnreadDeliveries.length}`
      ).to.eq(numberOfLatestReceivedDeliveries);

      // Pick a random delivery from the latest group
      const randomDelivery =
        latestUnreadDeliveries[
          Math.floor(Math.random() * latestUnreadDeliveries.length)
        ];
      const { subject } = randomDelivery;

      // Open one of latest received deiveries

      cy.intercept('GET', '**/getIdentifications?**').as('getIdentifications');

      cy.get('.mdc-data-table__content>tr>.subject-sender-cell').each(
        ($el, index) => {
          const text = $el.text().trim();
          if (text === subject) {
            cy.wrap($el).click({ force: true });
            cy.log(`Opened delivery: ${text}`);
            return false; // stop iteration
          }
        }
      );

      cy.wait(['@getIdentifications'], { timeout: 57000 }).then(
        (interception) => {
          // Log the intercepted response
          cy.log('Intercepted response:', interception.response);

          // Assert the response status code
          expect(interception.response.statusCode).to.eq(200);
        }
      );

      // Logout after test
      cy.get('.user-title').click();
      cy.wait(1500);
      cy.get('.logout-title > a').click();
      cy.url().should('include', Cypress.env('baseUrl_egEbox'));
      cy.log('Test completed successfully.');
    });
  });

  //Yopmail - Validate email
  it('Yopmail - Validate email', () => {
    cy.visit('https://yopmail.com/en/');
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));
    cy.get('#refreshbut > .md > .material-icons-outlined').click();

    const emailSubject = (index) => {
      cy.iframe('#ifinbox')
        .find('.mctn > .m > button > .lms')
        .eq(index)
        .should('include.text', 'Versandreport e-Gehaltszettel Portal');
    };

    const normalize = (str) => str.replace(/\s+/g, ' ').trim();

    const emailBody = () => {
      cy.iframe('#ifmail')
        .find('#mail > div')
        .invoke('text')
        .then((rawText) => {
          const actualText = normalize(rawText).toLowerCase();
          cy.log('Normalized Email Body:\n' + actualText);

          const expectedParts = [
            'sie haben 8 sendung(en) erfolgreich digital in das e-gehaltszettel portal ihrer benutzer*innen eingeliefert',
            'zusätzlich haben sie 0 sendung(en) erfolgreich über den postalischen weg als brief versendet',
            '3 sendung(en) die sie elektronisch verschicken wollten, konnten nicht zugestellt werden',
            'folgende personalnummern sind davon betroffen:',
            'system biller id: invalid, personalnummern: abba000100279311',
            'ihr e-gehaltszettel team',
          ];

          expectedParts.forEach((part, index) => {
            const expected = normalize(part).toLowerCase();
            const found = actualText.includes(expected);

            //     cy.log(
            //       `Validating part #${index + 1}: ${found ? 'FOUND' : 'MISSING'}`
            //     );
            expect(found, `Missing expected part #${index + 1}`).to.be.true;
          });
        });
    };

    emailSubject(0);
    emailBody();
  });
}); //end describe
