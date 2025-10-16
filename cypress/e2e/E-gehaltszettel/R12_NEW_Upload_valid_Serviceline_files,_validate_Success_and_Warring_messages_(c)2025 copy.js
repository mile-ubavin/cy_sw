describe('Upload valid Serviceline files, validate Success and Warring messages', () => {
  let uploadDateTime; // shared across tests

  // Helper: Compare two datetime rounded to minute
  const compareRoundedDateTimes = (sendingRaw, readRaw) => {
    // Function to parse both ISO (e.g., 2025-10-09T12:34:00Z)
    // and custom "dd.mm.yyyy hh:mm[:ss]" formatted dates
    const parseDate = (input) => {
      // Try parsing directly as a standard ISO datetime
      const direct = new Date(input);
      // If parsing succeeds, return the Date object
      if (!isNaN(direct)) return direct;

      // If not ISO, try matching "dd.mm.yyyy hh:mm[:ss]" pattern using regex
      const match = input.match(
        /(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?/
      );

      // Destructure matched date components (day, month, year, hour, minute, seconds)
      const [, dd, mm, yyyy, hh, min, ss] = match;

      // Return JavaScript Date object (month index starts from 0)
      return new Date(yyyy, mm - 1, dd, hh, min, ss || 0);
    };

    // Function to format datetime as "dd/mm/yyyy - HH:mm" (ignoring seconds)
    const formatDateTimeAs_ddmmyyyy = (date) => {
      // Ensure day, month, hour, and minute are always two digits
      const pad = (n) => n.toString().padStart(2, '0');

      // Return formatted date string
      return `${pad(date.getDate())}/${pad(
        date.getMonth() + 1
      )}/${date.getFullYear()} - ${pad(date.getHours())}:${pad(
        date.getMinutes()
      )}`;
    };

    // Parse the upload (sending) datetime string into a Date object
    const sendingDate = parseDate(sendingRaw);

    // Parse the SupportView datetime string into a Date object
    const readDate = parseDate(readRaw);

    // Format both dates to minute precision ("dd/mm/yyyy - HH:mm")
    const sendingFormatted = formatDateTimeAs_ddmmyyyy(sendingDate);
    const readFormatted = formatDateTimeAs_ddmmyyyy(readDate);

    // Log both formatted datetime values in Cypress output for debugging
    cy.log(`Upload datetime (rounded): ${sendingFormatted}`);
    cy.log(`SupportView datetime (rounded): ${readFormatted}`);

    // Return both formatted strings for further comparison in test
    return { sendingFormatted, readFormatted };
  };

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

    // Capture and save uploadDateTime
    const now = new Date();
    const formattedDate = now.toLocaleDateString('de-DE'); // dd.mm.yyyy
    const formattedTime = now.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const uploadDateTime = `${formattedDate} ${formattedTime}`;
    cy.log(`Upload DateTime: ${uploadDateTime}`);

    // Save globally for later validation
    Cypress.env('uploadDateTime', uploadDateTime);

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

          // Update uploadDateTime here to reflect SIGNED time
          const now = new Date();
          const day = String(now.getDate()).padStart(2, '0');
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const year = now.getFullYear();
          const formattedDate = `${day}.${month}.${year}`;
          const formattedTime = now
            .toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
            .trim();

          const newUploadDateTime = `${formattedDate} ${formattedTime}`;
          Cypress.env('uploadDateTime', newUploadDateTime);
          cy.log(`Updated Upload DateTime after sending: ${newUploadDateTime}`);
        } else {
          cy.log('Save button is disabled');
        }
      });

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

  //Login to e-Box and Open Delivery
  it('Ebox user Open delivery', () => {
    cy.loginToEgEbox();
    cy.wait(5500);
    //Open latest created deivery
    cy.intercept(
      'GET',
      '**/hybridsign/backend_t/document/v1/getDocument/**'
    ).as('getDocument');
    cy.intercept('GET', '**/getIdentifications?**').as('getIdentifications');
    cy.get('.mdc-data-table__content>tr>.subject-sender-cell')
      .eq(0)
      .click({ force: true });

    cy.wait(['@getIdentifications'], { timeout: 37000 }).then(
      (interception) => {
        // Log the intercepted response
        cy.log('Intercepted response:', interception.response);

        // Assert the response status code
        expect(interception.response.statusCode).to.eq(200);
      }
    );

    // Scroll to the bottom of the PDF viewer or page
    cy.get('.content-container>.scroll-container').eq(1).scrollTo('bottom', {
      duration: 500,
      ensureScrollable: false,
    });
    cy.wait(3500);

    // Logout
    cy.get('.user-title').click();
    cy.wait(1500);
    cy.get('.logout-title > a').click();
    cy.url().should('include', Cypress.env('baseUrl_egEbox')); // Validate url
    cy.log('Test completed successfully.');
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

  //Admin user Upload can upload serviceLine file with valid and invalid tid
  it('Upload serviceLine file with valid and invalid tid and validate Warning message', () => {
    cy.loginToSupportViewAdmin();
    // Wait for login to complete
    cy.wait(1500);

    // Capture and save uploadDateTime
    const now = new Date();
    const formattedDate = now.toLocaleDateString('de-DE'); // dd.mm.yyyy
    const formattedTime = now.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const uploadDateTime = `${formattedDate} ${formattedTime}`;
    cy.log(`Upload DateTime: ${uploadDateTime}`);

    // Save globally for later validation
    Cypress.env('uploadDateTime', uploadDateTime);

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
    cy.uploadServiceLineFile_WithValidAndInvalidTid();

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
      timeout: 27000,
    }).then((interception) => {
      // Log the intercepted response
      cy.log('Intercepted response:', interception.response);

      // Assert the response status code
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.wait(4000);

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
      .then(($button) => {
        if (!$button.is(':disabled')) {
          cy.wait(1500);
          cy.wrap($button).click({ force: true });
          cy.wait(500);

          // Update uploadDateTime here to reflect SIGNED time
          const now = new Date();
          const day = String(now.getDate()).padStart(2, '0');
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const year = now.getFullYear();
          const formattedDate = `${day}.${month}.${year}`;
          const formattedTime = now
            .toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
            .trim();

          const newUploadDateTime = `${formattedDate} ${formattedTime}`;
          Cypress.env('uploadDateTime', newUploadDateTime);
          cy.log(`Updated Upload DateTime after sending: ${newUploadDateTime}`);
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

  //Login to e-Box and Open Delivery
  it('Login to e-Box and Open Delivery', () => {
    // Log in to the e-Box application using a custom command
    cy.loginToEgEbox();
    cy.wait(2000);

    // Get the stored sending datetime from Cypress environment variable
    const sendingDateTime = Cypress.env('uploadDateTime');

    // Verify that upload datetime exists — test should fail if missing
    expect(sendingDateTime, 'Upload (sending) datetime must exist').to.exist;

    // Log sendingDateTime taken from Cypress variable
    cy.log(`Raw upload datetime: ${sendingDateTime}`);

    // Find the latest delivery in the list and extract its datetime
    cy.get('.date-of-delivery-cell > .half-cell-text-content')
      .first() // get latest delivery
      .should('be.visible') // make sure the element is visible before reading text
      .invoke('text') // extract its
      .then((textRaw) => {
        // Clean extracted datetime by removing commas and excessive spaces
        const clean = textRaw.replace(',', ' ').replace(/\s+/g, ' ').trim();

        // Compare upload and read datetime using helper function
        //     The helper returns both timestamps formatted to "dd/mm/yyyy - HH:mm"
        const { sendingFormatted, readFormatted } = compareRoundedDateTimes(
          sendingDateTime,
          clean
        );

        // Check if read datetime is equal or later than upload datetime
        if (readFormatted >= sendingFormatted) {
          // If datetimes match logically, continue the test

          // Intercept the backend API calls that occur when opening a delivery
          cy.intercept('GET', '**/getDocument/**').as('getDocument');
          cy.intercept('GET', '**/getIdentifications?**').as(
            'getIdentifications'
          );

          // Click on the subject cell of the first delivery to open it
          cy.get('.mdc-data-table__content>tr>.subject-sender-cell')
            .eq(0)
            .click({ force: true });

          // Wait for the "getIdentifications" API response and validate it
          cy.wait(['@getIdentifications'], { timeout: 57000 }).then(
            (interception) => {
              // Log full response details for debugging
              cy.log('Intercepted response:', interception.response);

              // Validate status code 200 (OK)
              expect(interception.response.statusCode).to.eq(200);
            }
          );

          // Scroll to the bottom of the opened delivery view to ensure document is visible
          cy.get('.content-container>.scroll-container')
            .eq(1)
            .scrollTo('bottom', { duration: 500, ensureScrollable: false });
          cy.wait(3500);
        } else {
          // If the datetimes are not in the expected, log an error message
          cy.log(
            `Error: Upload (${sendingFormatted}) and SupportView (${readFormatted}) times are not correct.`
          );

          // Throw an error to fail the test with a clear message
          throw new Error(
            `SupportView time (${readFormatted}) does not match Upload time (${sendingFormatted})`
          );
        }
      });

    // LOG OUT from the e-Box
    cy.get('.user-title').click({ force: true }); // open user menu
    cy.wait(1000); // wait for menu animation
    cy.get('.logout-title > a').click(); // click "Logout" link
    // Verify that the URL includes the e-Box base URL (confirming successful logout)
    cy.url().should('include', Cypress.env('baseUrl_egEbox'));

    //Log a success message for final confirmation in Cypress runner
    cy.log('Test completed successfully.');
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
