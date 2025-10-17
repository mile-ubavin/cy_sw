describe('Upload valid Serviceline files, validate Success and Warring messages', () => {
  // --- Helper: Parse datetime from "dd.mm.yyyy hh:mm" (German format)
  function parseGermanDateTime(dateTimeStr) {
    const [datePart, timePart] = dateTimeStr.split(' ');
    const [day, month, year] = datePart.split('.').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute);
  }

  // Disable HR and Enable 'Company Admin', 'Customer Creator' and 'View E-Box' Roles
  it('Disable HR and Enable Company Admin, Customer Creator and View E-Box Roles', () => {
    // Login as Master user
    cy.loginToSupportViewMaster();
    cy.wait(1500);

    // Close release note popup if it exists
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });

    // Open the company search dialog
    cy.get('#searchButton>span').click();
    cy.wait(1000);

    // Type the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(0)
      .type(Cypress.env('company'));

    // Click search
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    // Open Edit Company dialog
    cy.get('.action-buttons > .mdc-button').eq(0).click();
    cy.wait(1000);

    // Scroll to bottom to ensure HR checkbox is visible
    cy.get('.mat-mdc-dialog-content').scrollTo('bottom');
    cy.wait(1000);

    // Disable HR Management flag if enabled (on Company)
    cy.get('#hrManagementEnabled').then(($checkbox) => {
      if ($checkbox.is(':checked')) {
        cy.get('#hrManagementEnabled').uncheck({ force: true });
        cy.log('HR Management was enabled, now disabled.');

        cy.intercept('GET', '**/assets/maintanance-config/**').as(
          'getSearchResult'
        );

        cy.get('button[type="submit"]').click();

        // Search for companmy after execute Edit company
        cy.wait(['@getSearchResult'], { timeout: 27000 }).then(
          (interception) => {
            // Log the intercepted response
            cy.log('Intercepted response:', interception.response);

            // Assert the response status code
            expect(interception.response.statusCode).to.eq(200);
          }
        );

        cy.wait(2500);

        // Open the company search dialog
        cy.get('#searchButton>span').click();
        cy.wait(1000);

        // Type the company name
        cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
          .eq(0)
          .type(Cypress.env('company'));

        // Click search
        cy.get('.search-dialog>form>div>.mat-primary').click();
        cy.wait(1500);
      } else {
        cy.log('HR Management is already disabled.');
        cy.get('.close[data-mat-icon-name="close"]').click();
      }
    });

    cy.wait(2000);

    // Navigate to Admin User section
    cy.get('.mdc-button__label')
      .contains(/Admin User|Admin Benutzer/i)
      .should('be.visible')
      .click();

    // Search for specific admin user
    cy.get('.search').click({ force: true });
    cy.get('input[formcontrolname="userName"]').type(
      Cypress.env('username_supportViewAdmin')
    );
    cy.get('button[type="submit"]').click();
    cy.wait(2000);

    // Open Rights dialog
    cy.get('.mdc-button__label')
      .contains(/Rechte|Rights/i)
      .should('be.visible')
      .click();

    // Define roles to enable
    const rolesToEnable = [
      ['Company Admin', 'Firmen-Administrator'],
      ['Customer Creator', 'Nutzeranlage'],
      ['Data Submitter', 'Versand'],
      ['View E-Box', 'E-Box ansehen'],
    ];

    // Define roles to disable
    const rolesToDisable = [['HR Manager', 'HR Manager']];

    // Loop through each role label and enable/disable accordingly
    cy.get('.mat-mdc-checkbox > div > .mdc-label')
      .should('exist')
      .each(($label) => {
        const text = $label.text().trim();

        // Find the checkbox element related to the label
        cy.wrap($label)
          .parent()
          .find('input[type="checkbox"]')
          .then(($checkboxInput) => {
            cy.wrap($checkboxInput)
              .invoke('prop', 'checked')
              .then((isChecked) => {
                // Enable roles from rolesToEnable list
                if (
                  rolesToEnable.some(([en, de]) => text === en || text === de)
                ) {
                  if (!isChecked) {
                    cy.wrap($checkboxInput).click({ force: true });
                    cy.log(`Enabled role: "${text}"`);
                  } else {
                    cy.log(`ℹRole "${text}" already enabled`);
                  }
                }

                // Disable roles from rolesToDisable list
                if (
                  rolesToDisable.some(([en, de]) => text === en || text === de)
                ) {
                  if (isChecked) {
                    cy.wrap($checkboxInput).click({ force: true });
                    cy.log(`Disabled role: "${text}"`);
                  } else {
                    cy.log(`Role "${text}" already disabled`);
                  }
                }
              });
          });
      });

    cy.wait(1000);

    // Save updated roles
    cy.get('button[type="submit"]').click();
    cy.wait(1000);

    // Verify success message in English or German
    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible')
      .invoke('text')
      .then((snackText) => {
        const trimmed = snackText.trim();
        expect(trimmed).to.match(/Rights updated|Rechte aktualisiert/);
      });

    // Logout from SupportView
    cy.get('.logout-icon').click();
    cy.wait(1500);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl'));
    cy.log('Test completed successfully — HR disabled and roles updated.');
  });

  //Admin user Upload can upload valid serviceLine File
  it('Upload valid serviceLine file and validate Success message', () => {
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

    // Upload serviceLine file
    cy.uploadServiceLine();

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

    cy.intercept(
      'POST',
      '**/deliveryHandler/checkDocumentProcessingStatus**'
    ).as('completeCheckingDocumentProcessingStatus');

    cy.get('.dialog-actions>button>.title')
      .contains(/Upload Personal Document|Personalisierte Dokumente hochladen/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button

    cy.wait(['@completeCheckingDocumentProcessingStatus'], {
      timeout: 57000,
    }).then((interception) => {
      // Log the intercepted response
      cy.log('Intercepted response:', interception.response);

      // Assert the response status code
      expect(interception.response.statusCode).to.eq(200);
    });

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

    cy.get('.dialog-actions>button>.title')
      .contains(/Send|Senden /i)
      .then(($button) => {
        if (!$button.is(':disabled')) {
          cy.wait(1500);
          cy.wrap($button).click({ force: true });
          cy.wait(500);

          // Capture current time (upload time) and fomat dateTime in German format
          const now = new Date();
          const formattedDate = now.toLocaleDateString('de-DE'); // Format: dd.mm.yyyy
          const formattedTime = now.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
          const uploadDateTime = `${formattedDate} ${formattedTime}`;
          cy.log(`Upload DateTime: ${uploadDateTime}`);

          // Save globally for later validation
          Cypress.env('uploadDateTime', uploadDateTime);
          cy.wait(2500);
        } else {
          cy.log('Save button is disabled');
        }
      });

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

  // Login to e-Box and open delivery if timestamps match logic
  it('Login to e-Box and Open Delivery', () => {
    // Log into e-Box
    cy.loginToEgEbox();
    cy.wait(2000);

    // Retrieve upload time stored in previous test
    const uploadDateTime = Cypress.env('uploadDateTime');
    expect(uploadDateTime, 'Upload datetime must exist').to.exist;
    cy.log(`Stored Upload DateTime: ${uploadDateTime}`);

    // Find latest delivery and extract its date/time
    cy.get('.date-of-delivery-cell > .half-cell-text-content')
      .first() // latest delivery
      .should('be.visible')
      .invoke('text')
      .then((readTextRaw) => {
        // Clean text (remove commas/spaces)
        const readClean = readTextRaw
          .replace(',', ' ')
          .replace(/\s+/g, ' ')
          .trim();

        // --- Convert both datetimes to comparable JS Date objects ---
        const uploadParsed = parseGermanDateTime(uploadDateTime);
        const readParsed = parseGermanDateTime(readClean);

        // --- Calculate difference in milliseconds ---
        const diffMs = Math.abs(readParsed - uploadParsed);
        const diffMin = diffMs / (1000 * 60);

        cy.log(`Upload: ${uploadParsed}`);
        cy.log(`Read:   ${readParsed}`);
        cy.log(`Difference: ${diffMin.toFixed(2)} minutes`);

        // --- Apply the condition ---
        if (
          readParsed.getTime() === uploadParsed.getTime() || // exact same minute
          readParsed.getTime() === uploadParsed.getTime() + 60000 // within +1 minute
        ) {
          cy.log(
            'Difference between upload and read dateTime should be max 1 minute'
          );

          // Intercept backend calls for document load
          cy.intercept('GET', '**/getDocument/**').as('getDocument');
          cy.intercept('GET', '**/getIdentifications?**').as(
            'getIdentifications'
          );

          // Open the latest delivery
          cy.get('.mdc-data-table__content>tr>.subject-sender-cell')
            .eq(0)
            .click({ force: true });

          // Wait for identifications response
          cy.wait(['@getIdentifications'], { timeout: 57000 }).then(
            (interception) => {
              expect(interception.response.statusCode).to.eq(200);
            }
          );

          // Scroll to bottom of the delivery
          cy.get('.content-container>.scroll-container')
            .eq(1)
            .scrollTo('bottom', { duration: 500, ensureScrollable: false });
          cy.wait(3500);
        } else {
          // FAIL: difference > 1 minute
          const errorMsg = `ERROR: readDateTime (${readClean}) not within 1 minute of uploadDateTime (${uploadDateTime})`;
          cy.log(errorMsg);

          // Throw error to fail test
          throw new Error(errorMsg);
        }
        // Log out the user immediately
        cy.get('.user-title').click({ force: true });
        cy.wait(1000);
        cy.get('.logout-title > a').click();
        cy.url().should('include', Cypress.env('baseUrl_egEbox'));
      });
  });

  //Admin user check Reporting email
  it('Yopmail - Get Reporting email', () => {
    // Visit Yopmail
    cy.visit('https://yopmail.com/en/');

    // Enter the support admin email
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));

    // Click the refresh button
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    //Custom functions:
    // Define email subject function
    function emailSubject(index) {
      cy.iframe('#ifinbox')
        .find('.mctn > .m > button > .lms')
        .eq(index)
        .should('include.text', 'Versandreport e-Gehaltszettel Portal');
    }

    // Access the inbox iframe and validate the email subject
    emailSubject(0); // Validate subject of Reporting email

    cy.iframe('#ifmail')
      .find('#mail > div')
      .invoke('text') // Get the text content
      .then((text) => {
        // Log the email body text
        cy.log('Email Body Text:', text);

        // Normalize spaces for comparison
        const normalizedText = text.trim().replace(/\s+/g, ' '); // Normalize extra spaces

        // Validate that the email body contains the expected text
        expect(normalizedText).to.include(
          'Sie haben 1 Sendung(en) erfolgreich digital in das e-Gehaltszettel Portal Ihrer Benutzer*innen eingeliefert'
        );
        expect(normalizedText).to.include(
          'Zusätzlich haben Sie 0 Sendung(en) erfolgreich über den postalischen Weg als Brief versendet. Das Dokument wird von uns über das „Einfach Brief“-Portal gedruckt, kurvertiert und an die Adresse des Benutzers versendet.'
        );
        expect(normalizedText).to.include('Ihr e-Gehaltszettel Team');
      });

    cy.wait(4500);

    // Switch to the second email
    //cy.iframe('#ifinbox').find('.mctn > .m > button > .lms').eq(1).click();

    // emailSubject(1); // Validate subject of second email
    // cy.wait(1500);
    // emailBody(); // Validate second email body

    //cy.wait(4500);
  });

  // Enable HR and View E-Box and Disable Company Admin and Customer Creator Roles
  it('Enable HR and View E-Box and Disable Company Admin and Customer Creator Roles', () => {
    // Login as Master user
    cy.loginToSupportViewMaster();
    cy.wait(1500);

    // Close release note popup if it exists
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });

    // Open the company search dialog
    cy.get('#searchButton>span').click();
    cy.wait(1000);

    // Type the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(0)
      .type(Cypress.env('company'));

    // Click search
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    // Open Edit Company dialog
    cy.get('.action-buttons > .mdc-button').eq(0).click();
    cy.wait(1000);

    // Scroll to bottom to ensure HR checkbox is visible
    cy.get('.mat-mdc-dialog-content').scrollTo('bottom');
    cy.wait(1000);

    // Disable HR Management flag if enabled (on Company)
    cy.get('#hrManagementEnabled').then(($checkbox) => {
      if ($checkbox.is(':checked')) {
        cy.get('#hrManagementEnabled').uncheck({ force: true });
        cy.log('HR Management was enabled, now disabled.');

        cy.intercept('GET', '**/assets/maintanance-config/**').as(
          'getSearchResult'
        );

        cy.get('button[type="submit"]').click();

        // Search for companmy after execute Edit company
        cy.wait(['@getSearchResult'], { timeout: 27000 }).then(
          (interception) => {
            // Log the intercepted response
            cy.log('Intercepted response:', interception.response);

            // Assert the response status code
            expect(interception.response.statusCode).to.eq(200);
          }
        );

        cy.wait(2500);

        // Open the company search dialog
        cy.get('#searchButton>span').click();
        cy.wait(1000);

        // Type the company name
        cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
          .eq(0)
          .type(Cypress.env('company'));

        // Click search
        cy.get('.search-dialog>form>div>.mat-primary').click();
        cy.wait(1500);
      } else {
        cy.log('HR Management is already disabled.');
        cy.get('.close[data-mat-icon-name="close"]').click();
      }
    });

    cy.wait(2000);

    // Navigate to Admin User section
    cy.get('.mdc-button__label')
      .contains(/Admin User|Admin Benutzer/i)
      .should('be.visible')
      .click();

    // Search for specific admin user
    cy.get('.search').click({ force: true });
    cy.get('input[formcontrolname="userName"]').type(
      Cypress.env('username_supportViewAdmin')
    );
    cy.get('button[type="submit"]').click();
    cy.wait(2000);

    // Open Rights dialog
    cy.get('.mdc-button__label')
      .contains(/Rechte|Rights/i)
      .should('be.visible')
      .click();

    // Define roles to enable
    const rolesToEnable = [
      ['Company Admin', 'Firmen-Administrator'],
      ['Customer Creator', 'Nutzeranlage'],
      ['Data Submitter', 'Versand'],
      ['View E-Box', 'E-Box ansehen'],
    ];

    // Define roles to disable
    const rolesToDisable = [['HR Manager', 'HR Manager']];

    // Loop through each role label and enable/disable accordingly
    cy.get('.mat-mdc-checkbox > div > .mdc-label')
      .should('exist')
      .each(($label) => {
        const text = $label.text().trim();

        // Find the checkbox element related to the label
        cy.wrap($label)
          .parent()
          .find('input[type="checkbox"]')
          .then(($checkboxInput) => {
            cy.wrap($checkboxInput)
              .invoke('prop', 'checked')
              .then((isChecked) => {
                // Enable roles from rolesToEnable list
                if (
                  rolesToEnable.some(([en, de]) => text === en || text === de)
                ) {
                  if (!isChecked) {
                    cy.wrap($checkboxInput).click({ force: true });
                    cy.log(`Enabled role: "${text}"`);
                  } else {
                    cy.log(`ℹRole "${text}" already enabled`);
                  }
                }

                // Disable roles from rolesToDisable list
                if (
                  rolesToDisable.some(([en, de]) => text === en || text === de)
                ) {
                  if (isChecked) {
                    cy.wrap($checkboxInput).click({ force: true });
                    cy.log(`Disabled role: "${text}"`);
                  } else {
                    cy.log(`Role "${text}" already disabled`);
                  }
                }
              });
          });
      });

    cy.wait(1000);

    // Save updated roles
    cy.get('button[type="submit"]').click();
    cy.wait(1000);

    // Verify success message in English or German
    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible')
      .invoke('text')
      .then((snackText) => {
        const trimmed = snackText.trim();
        expect(trimmed).to.match(/Rights updated|Rechte aktualisiert/);
      });

    // Logout from SupportView
    cy.get('.logout-icon').click();
    cy.wait(1500);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl'));
    cy.log('Test completed successfully — HR disabled and roles updated.');
  });

  //Admin user Upload can upload valid serviceLine File
  it('Upload valid serviceLine file and validate Success message', () => {
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

    // Upload serviceLine file
    cy.uploadServiceLine();

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

    cy.intercept(
      'POST',
      '**/deliveryHandler/checkDocumentProcessingStatus**'
    ).as('completeCheckingDocumentProcessingStatus');

    cy.get('.dialog-actions>button>.title')
      .contains(/Upload Personal Document|Personalisierte Dokumente hochladen/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button

    cy.wait(['@completeCheckingDocumentProcessingStatus'], {
      timeout: 57000,
    }).then((interception) => {
      // Log the intercepted response
      cy.log('Intercepted response:', interception.response);

      // Assert the response status code
      expect(interception.response.statusCode).to.eq(200);
    });

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

    cy.get('.dialog-actions>button>.title')
      .contains(/Send|Senden /i)
      .then(($button) => {
        if (!$button.is(':disabled')) {
          cy.wait(1500);
          cy.wrap($button).click({ force: true });
          cy.wait(500);

          // Capture current time (upload time) and fomat dateTime in German format
          const now = new Date();
          const formattedDate = now.toLocaleDateString('de-DE'); // Format: dd.mm.yyyy
          const formattedTime = now.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
          const uploadDateTime = `${formattedDate} ${formattedTime}`;
          cy.log(`Upload DateTime: ${uploadDateTime}`);

          // Save globally for later validation
          Cypress.env('uploadDateTime', uploadDateTime);
          cy.wait(2500);
        } else {
          cy.log('Save button is disabled');
        }
      });

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

  // Login to e-Box and open delivery if timestamps match logic
  it('Login to e-Box and Open Delivery', () => {
    // Log into e-Box
    cy.loginToEgEbox();
    cy.wait(2000);

    // Retrieve upload time stored in previous test
    const uploadDateTime = Cypress.env('uploadDateTime');
    expect(uploadDateTime, 'Upload datetime must exist').to.exist;
    cy.log(`Stored Upload DateTime: ${uploadDateTime}`);

    // Find latest delivery and extract its date/time
    cy.get('.date-of-delivery-cell > .half-cell-text-content')
      .first() // latest delivery
      .should('be.visible')
      .invoke('text')
      .then((readTextRaw) => {
        // Clean text (remove commas/spaces)
        const readClean = readTextRaw
          .replace(',', ' ')
          .replace(/\s+/g, ' ')
          .trim();

        // --- Convert both datetimes to comparable JS Date objects ---
        const uploadParsed = parseGermanDateTime(uploadDateTime);
        const readParsed = parseGermanDateTime(readClean);

        // --- Calculate difference in milliseconds ---
        const diffMs = Math.abs(readParsed - uploadParsed);
        const diffMin = diffMs / (1000 * 60);

        cy.log(`Upload: ${uploadParsed}`);
        cy.log(`Read:   ${readParsed}`);
        cy.log(`Difference: ${diffMin.toFixed(2)} minutes`);

        // --- Apply the condition ---
        if (
          readParsed.getTime() === uploadParsed.getTime() || // exact same minute
          readParsed.getTime() === uploadParsed.getTime() + 60000 // within +1 minute
        ) {
          cy.log(
            'Difference between upload and read dateTime should be max 1 minute'
          );

          // Intercept backend calls for document load
          cy.intercept('GET', '**/getDocument/**').as('getDocument');
          cy.intercept('GET', '**/getIdentifications?**').as(
            'getIdentifications'
          );

          // Open the latest delivery
          cy.get('.mdc-data-table__content>tr>.subject-sender-cell')
            .eq(0)
            .click({ force: true });

          // Wait for identifications response
          cy.wait(['@getIdentifications'], { timeout: 57000 }).then(
            (interception) => {
              expect(interception.response.statusCode).to.eq(200);
            }
          );

          // Scroll to bottom of the delivery
          cy.get('.content-container>.scroll-container')
            .eq(1)
            .scrollTo('bottom', { duration: 500, ensureScrollable: false });
          cy.wait(3500);
        } else {
          // FAIL: difference > 1 minute
          const errorMsg = `ERROR: readDateTime (${readClean}) not within 1 minute of uploadDateTime (${uploadDateTime})`;
          cy.log(errorMsg);

          // Throw error to fail test
          throw new Error(errorMsg);
        }
        // Log out the user immediately
        cy.get('.user-title').click({ force: true });
        cy.wait(1000);
        cy.get('.logout-title > a').click();
        cy.url().should('include', Cypress.env('baseUrl_egEbox'));
      });
  });

  //Admin user check Reporting email and delte all emails
  it('Yopmail - Get Reporting email and delte all emails', () => {
    // Visit Yopmail
    cy.visit('https://yopmail.com/en/');

    // Enter the support admin email
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));

    // Click the refresh button
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    //Custom functions:
    // Define email subject function
    function emailSubject(index) {
      cy.iframe('#ifinbox')
        .find('.mctn > .m > button > .lms')
        .eq(index)
        .should('include.text', 'Versandreport e-Gehaltszettel Portal');
    }

    // Access the inbox iframe and validate the email subject
    emailSubject(0); // Validate subject of Reporting email

    cy.iframe('#ifmail')
      .find('#mail > div')
      .invoke('text') // Get the text content
      .then((text) => {
        // Log the email body text
        cy.log('Email Body Text:', text);

        // Normalize spaces for comparison
        const normalizedText = text.trim().replace(/\s+/g, ' '); // Normalize extra spaces

        // Validate that the email body contains the expected text
        expect(normalizedText).to.include(
          'Sie haben 1 Sendung(en) erfolgreich digital in das e-Gehaltszettel Portal Ihrer Benutzer*innen eingeliefert'
        );
        expect(normalizedText).to.include(
          'Zusätzlich haben Sie 0 Sendung(en) erfolgreich über den postalischen Weg als Brief versendet. Das Dokument wird von uns über das „Einfach Brief“-Portal gedruckt, kurvertiert und an die Adresse des Benutzers versendet.'
        );
        expect(normalizedText).to.include('Ihr e-Gehaltszettel Team');
      });

    cy.wait(4500);

    // Delete all emails
    cy.get('.menu>div>#delall')
      .should('not.be.disabled')
      .click({ force: true });
    cy.wait(2500);
  });

  //Enable All Roles
  it('Enable All Roles', () => {
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
}); //end describe
