describe('Broadcast delivery to Specific User', () => {
  // Helper function to parse German date/time format (dd.mm.yyyy hh:mm)
  function parseGermanDateTime(dateTimeStr) {
    const [datePart, timePart] = dateTimeStr.split(' ');
    const [day, month, year] = datePart.split('.').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute);
  }

  let uploadDateTime = ''; // Variable to store upload date & time across tests

  // Disable HR Management on Company and Update Admin Roles
  it('Disable HR Management on Company and Update Admin Roles', () => {
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
          'getSearchResult',
        );

        cy.get('button[type="submit"]').click();

        // Search for companmy after execute Edit company
        cy.wait(['@getSearchResult'], { timeout: 27000 }).then(
          (interception) => {
            // Log the intercepted response
            cy.log('Intercepted response:', interception.response);

            // Assert the response status code
            expect(interception.response.statusCode).to.eq(200);
          },
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
      Cypress.env('username_supportViewAdmin'),
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

  //DH Send Delivery to Specific user, when HR role is enabled
  it.only('DH Send Delivery to selected-specific user', () => {
    // ===== STEP 1: Login to DocumentHub =====
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

    // Login to DocumentHub using custom command
    cy.loginToDH();
    cy.wait(2000);
    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);
    cy.wait(1500);

    // Click on Single Person Upload button
    cy.get('#workspace-single-person-upload')
      .should('be.visible') // Ensure the elements are visible
      .each(($el) => {
        // Iterate through each of the elements
        // Check if the text matches either "Single Person Upload" or "Einzelperson Hochladen"
        if ($el.text().match(/Single Perso|Einzelperson Hochladen/i)) {
          // Highlight the element for debugging (optional)
          cy.wrap($el).invoke(
            'attr',
            'style',
            'border: 2px solid black; padding: 2px;',
          );
          cy.wait(2000);
          // Click the element
          cy.wrap($el).click({ force: true });
        }
      });

    //Check dialog title
    cy.get('main>header>h1')
      .should('be.visible')
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Send Delivers To Select Users|Dokumente an ausgewählte Benutzer senden/i,
        );
      });

    cy.wait(1500);

    //Validate subtitle
    cy.get('main>p')
      .should('be.visible')
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Upload Document for selected users|Dokumente für ausgewählte Benutzer hochladen/i,
        );
      });

    //check Info message under upload area
    cy.get('#file-requirements')
      .should('be.visible') // Ensure the elements are visible
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Only .pdf files up to 13 pages allowed for printing|Nur .pdf bis zu 13 Seiten beim Druck zulässig/i,
        );
      });

    cy.wait(1500);
    //upload invalid PDF file
    cy.DHcreateNewUser_viaCSV();
    cy.wait(2000);

    //check Error message for upload invalid file
    cy.get('#file-list span')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Only pdf files are supported|Es werden nur PDF-Dateien unterstützt/i,
        );
      });
    cy.wait(1500);

    //Remove invalid uploaded file
    cy.get('button[aria-label="Remove 1_createUser.csv"]').click();
    cy.wait(1500);

    //Upload valid PDF file
    cy.DHmassUpload();
    cy.wait(2000);

    // Capture the current date and time in the specified format
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0'); // Ensure two digits
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = now.getFullYear();
    const formattedDate = `${day}.${month}.${year}`; // Ensures dd.mm.yyyy format

    const formattedTime = now
      .toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      .trim(); // Trim to remove leading spaces

    uploadDateTime = `${formattedDate} ${formattedTime}`; // Store the value in a variable
    cy.log(`Upload DateTime: ${uploadDateTime}`); // Log the stored uploadDateTime

    //// ===== VALIDATE "Select company" DROPDOWN =====

    // Validate label for company dropdown
    cy.get('section label')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();
        expect(trimmedText).to.match(/Select company|Firma auswählen/i);
      });
    cy.wait(1500);
    // Open Company dropdown
    cy.get('main >section div[role="combobox"]').click({ force: true });
    cy.wait(1000);

    // Define companies to select from dropdown
    const toCompanies = ['AQUA GmbH'];

    // Wait for dropdown options to appear and locate the list container
    cy.get('[role="listbox"], [role="menu"], ul[role="presentation"]')
      .should('be.visible') // Ensure dropdown is visible
      .find('li, [role="option"]') // Find all list items in the dropdown
      .each(($option) => {
        // Iterate through each dropdown option
        const text = $option.text().trim(); // Extract and trim the option text
        cy.log(`Found option: ${text}`); // Log each found option for debugging

        // Check if current option matches any company in toCompanies array
        if (toCompanies.includes(text)) {
          cy.log(`Matching company found: ${text}`); // Log when match is found

          // Find and select AQUA company from dropdown
          cy.wrap($option)
            .find('span') // Locate checkbox element
            .then(($checkbox) => {
              // Check if checkbox element exists
              if ($checkbox.length > 0) {
                // Determine if checkbox is already checked (multiple attribute checks)
                const isChecked =
                  $checkbox.is(':checked') || // Standard checked state
                  $checkbox.attr('aria-checked') === 'true' || // ARIA checked state
                  $checkbox.attr('data-checked') === 'true'; // Custom data attribute

                // Click checkbox only if not already checked
                if (!isChecked) {
                  cy.wrap($checkbox).click({ force: true }); // Force click to enable
                  cy.log(`Checkbox for "${text}" enabled`); // Log success
                } else {
                  cy.log(`Checkbox for "${text}" already enabled`); // Log already enabled
                }
              } else {
                // If no checkbox found, click the option itself (some dropdowns work this way)
                cy.wrap($option).click({ force: true }); // Click the entire option
                cy.log(`Clicked option "${text}"`); // Log option click
              }
            });
        }
      });

    cy.wait(1000); // Wait for selection to be processed
    // Close dropdown by pressing ESC key
    cy.get('body').type('{esc}'); // Send ESC key to body to close dropdown
    cy.wait(500); // Wait for dropdown to close

    // Validate label for Subject input field
    cy.get('section label')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();
        expect(trimmedText).to.match(/Subject|Betreff/i);
      });
    cy.wait(1500);

    //Check if Subject field is mandatory
    cy.get('input[placeholder="Enter the subject"]')
      .should('be.visible')
      .click()
      .clear() // Ensure field is empty
      .blur(); // Use blur() instead of focusOut()

    cy.wait(500);

    //Check validation message for Subject field
    cy.get('div[role="alert"]')
      .should('be.visible') // Ensure the elements are visible
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Subject field is mandatory|Betreff-Feld ist obligatorisch/i,
        );
      });

    cy.wait(1500);

    // Add Delivery Title/Subject
    const title = `Document To Specific Person (pdf) - ${uploadDateTime}`;
    cy.log(`Title for the document: ${title}`); // Log the title to check

    cy.get('input[placeholder="Enter the subject"]').clear().type(title);
    cy.wait(1500);

    cy.findByPlaceholderText(/select recipients/i).click({ force: true });

    // Select recipient from visible dropdown list (text may include name + id in parentheses)
    const recipientValue = 'AQUA Testuser (ABBA000100279311)';
    const recipientNeedle = recipientValue.toLowerCase().replace(/\s+/g, '');

    cy.get('ul[role="listbox"], [role="listbox"], .MuiAutocomplete-popper')
      .filter(':visible')
      .first()
      .should('be.visible')
      .within(() => {
        cy.get('li, [role="option"]')
          .should('have.length.greaterThan', 0)
          .then(($options) => {
            const match = [...$options].find((el) => {
              const rawText = (el.textContent || '').trim();
              const normalized = rawText.toLowerCase().replace(/\s+/g, '');
              return (
                normalized.includes(recipientNeedle) ||
                rawText.toLowerCase().includes(recipientValue.toLowerCase())
              );
            });

            expect(
              match,
              `Recipient option containing "${recipientValue}" was not found`,
            ).to.exist;

            cy.wrap(match)
              .scrollIntoView()
              .then(($row) => {
                const $checkbox = $row.find(
                  'input[type="checkbox"], [role="checkbox"]',
                );
                if ($checkbox.length > 0) {
                  cy.wrap($checkbox).first().click({ force: true });
                } else {
                  cy.wrap($row).click({ force: true });
                }
              });
          });
      });

    cy.log(`Upload DateTime to verify: ${uploadDateTime}`);

    cy.intercept('POST', '**/deliveryHandler/checkDocumentProcessingStatus').as(
      'processDocuments',
    );

    //Click on Mass Upload - Weiter button
    cy.get('#upload').should('be.enabled').click();

    cy.wait('@processDocuments', { timeout: 50000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('Documents processed successfully');
    });
    cy.wait(1500);
    //Check Success message after document processing
    cy.get('#document-uploaded')
      .should('be.visible')
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(/Document successfully uploaded|/i);
      });

    cy.wait(1500);

    //Click on button to Send Mass delivery
    cy.get('#cancel').should('be.enabled').click();
    cy.wait(1500);

    // Verify confirm sending documents dialog title
    cy.get('#dialog-title')
      .should('be.visible')
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Confirm sending documents|Bestätigung des Versands/i,
        );
      });

    //Verify confirm sending documents dialog content
    cy.get('div[aria-labelledby="dialog-title"] .MuiTypography-body1')
      .should('be.visible')
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        const isEnglishText = trimmedText
          .toLowerCase()
          .includes(
            'by using this feature documents will be sent to all active users',
          );
        const isGermanText = trimmedText
          .toLowerCase()
          .includes(
            'durch die nutzung dieser funktion werden dokumente an alle aktiven benutzer gesendet',
          );
        expect(
          isEnglishText || isGermanText,
          'Dialog should show confirmation message in English or German',
        ).to.be.true;
      });

    //Comfirm sending documents by clicking on confirm button in dialog
    cy.get('div[aria-labelledby="dialog-title"] button')
      .should('be.visible')
      .each(($button) => {
        const buttonText = $button.text().trim();
        cy.log(`Found button: ${buttonText}`);

        // Check if button text matches Confirm (English) or Bestätigen (German)
        if (buttonText.match(/Confirm|Bestätigen/i)) {
          cy.log(`Clicking button: ${buttonText}`);
          cy.wrap($button).click({ force: true });
          return false; // Stop iteration after finding the match
        }
      });
    cy.wait(2000);

    //Close latest dialog - Click on Fertig/Done button
    cy.contains('button', /Fertig|Done|Finish/i)
      .should('be.visible')
      .click({ force: true });

    cy.wait(1000);

    //Validate Home page url
    const baseUrl = Cypress.env('dh_baseUrl');
    cy.url().should('include', `${baseUrl}home`);

    // Logout from DH
    cy.get('.MuiButton-text').click();
    cy.wait(1000);
    cy.get('li[role="menuitem"]')
      .contains(/Abmelden|Logout/i)
      .click();
    cy.url().should('include', Cypress.env('dh_baseUrl'));
    cy.log('Upload finished successfully.');
    cy.wait(2500);
  }); //end it

  // Login to e-Box and open delivery if timestamps match logic
  it.only('Login to e-Box and Open Delivery', () => {
    // Log into e-Box
    cy.loginToEgEbox();
    cy.wait(2000);

    // Retrieve upload time stored in previous test
    let uploadDateTime = Cypress.env('uploadDateTime');

    // If uploadDateTime is not set (test run in isolation), generate current time
    if (!uploadDateTime) {
      const now = new Date();
      const formattedDate = now.toLocaleDateString('de-DE'); // Format: dd.mm.yyyy
      const formattedTime = now.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      uploadDateTime = `${formattedDate} ${formattedTime}`;
      cy.log(
        `Upload DateTime not found, using current time: ${uploadDateTime}`,
      );
    } else {
      cy.log(`Stored Upload DateTime: ${uploadDateTime}`);
    }

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

        cy.log(`Upload DateTime: ${uploadDateTime}`);
        cy.log(`Read DateTime: ${readClean}`);
        cy.log(`Upload Parsed: ${uploadParsed}`);
        cy.log(`Read Parsed: ${readParsed}`);
        cy.log(`Difference: ${diffMin.toFixed(2)} minutes`);

        // --- Apply the condition: times match or within ±1 minute ---
        if (diffMin <= 1) {
          cy.log(
            `✓ Test PASSED: Difference is ${diffMin.toFixed(2)} minutes (within ±1 minute tolerance)`,
          );

          // Intercept backend calls for document load
          cy.intercept('GET', '**/getDocument/**').as('getDocument');
          cy.intercept('GET', '**/getIdentifications?**').as(
            'getIdentifications',
          );

          // Click on the latest delivery
          cy.get('.mdc-data-table__content>tr>.subject-sender-cell')
            .eq(0)

            .click({ force: true });

          // Open the latest delivery
          cy.get('.delivery-document').click({ force: true });

          // Wait for identifications response
          cy.wait(['@getIdentifications'], { timeout: 57000 }).then(
            (interception) => {
              expect(interception.response.statusCode).to.eq(200);
            },
          );

          // Scroll to bottom of the delivery
          cy.get('.content-container>.scroll-container')
            .eq(1)
            .scrollTo('bottom', { duration: 500, ensureScrollable: false });
          cy.wait(3500);
        } else {
          // FAIL: difference > 1 minute
          const errorMsg = `✗ Test FAILED: readDateTime (${readClean}) differs by ${diffMin.toFixed(2)} minutes from uploadDateTime (${uploadDateTime}). Maximum allowed: 1 minute.`;
          cy.log(errorMsg);

          // Log out the user before failing
          cy.get('.user-title').click({ force: true });
          cy.wait(1000);
          cy.get('.logout-title > a').click();
          cy.url().should('include', Cypress.env('baseUrl_egEbox'));

          // Throw error to fail test
          throw new Error(errorMsg);
        }
        // Log out the user after successful validation
        cy.get('.user-title').click({ force: true });
        cy.wait(1000);
        cy.get('.logout-title > a').click();
        cy.url().should('include', Cypress.env('baseUrl_egEbox'));
      });
  });

  //Admin user check Reporting email and delte all emails
  it.only('Yopmail - Get Reporting email and delte all emails', () => {
    cy.on('uncaught:exception', (err) => {
      // Ignore known Yopmail app-side exception to keep test focused on mail assertions.
      if (
        err.message &&
        err.message.includes(
          "Cannot read properties of null (reading 'postMessage')",
        )
      ) {
        return false;
      }
    });

    // Visit Yopmail
    cy.visit('https://yopmail.com/en/');

    // Enter the support admin email
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));

    // Click the refresh button
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    cy.wait(4500);

    // Define email subject function and open the matched email.
    function emailSubject(index) {
      cy.iframe('#ifinbox')
        .find('.mctn > .m > button > .lms', { timeout: 20000 })
        .eq(index)
        .invoke('text')
        .then((subject) => {
          const normalizedSubject = subject.trim().replace(/\s+/g, ' ');
          expect(normalizedSubject).to.include('Versandreport DocuHub Portal');
        });

      cy.iframe('#ifinbox')
        .find('.mctn > .m > button', { timeout: 20000 })
        .eq(index)
        .click({ force: true });
    }

    // Access the inbox iframe and validate the email subject
    emailSubject(0); // Validate subject of Reporting email

    cy.iframe('#ifmail')
      .find('#mail > div', { timeout: 20000 })
      .invoke('text')
      .then((text) => {
        const normalizedText = text.trim().replace(/\s+/g, ' ');
        expect(normalizedText).to.include(
          'Sie haben 1 Sendung(en) erfolgreich digital in das DocuHub Portal Ihrer Benutzer*innen eingeliefert',
        );
        expect(normalizedText).to.include(
          'Zusätzlich haben Sie 0 Sendung(en) erfolgreich über den postalischen Weg als Brief versendet. Das Dokument wird von uns über das „Einfach Brief“-Portal gedruckt, kurvertiert und an die Adresse des Benutzers versendet.',
        );
        expect(normalizedText).to.include('Ihr DocuHub Team');
      });

    // Delete all emails
    cy.get('.menu>div>#delall')
      .should('not.be.disabled')
      .click({ force: true });
    cy.wait(2500);
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

  // Disable Company Admin and Customer Creator Roles and Enable HR and View E-Box Roles
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

    //Disable ViewEbox And DataSubmitter Roles for specific Admin user

    //List of roles to disable
    const rolesToDisable = [
      ['Company Admin', 'Firmen-Administrator'],
      ['Customer Creator', 'Nutzeranlage'],
      ['Data Submitter', 'Versand'],
      // ['View E-Box', 'E-Box ansehen'],
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

  //DH Send Delivery to Specific user, when HR role is enabled
  it('DH Send Delivery to selected-specific user', () => {
    // ===== STEP 1: Login to DocumentHub =====
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

    // Login to DocumentHub using custom command
    cy.loginToDH();
    cy.wait(2000);
    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);
    cy.wait(1500);

    // Click on Single Person Upload button
    cy.get('#workspace-single-person-upload')
      .should('be.visible') // Ensure the elements are visible
      .each(($el) => {
        // Iterate through each of the elements
        // Check if the text matches either "Single Person Upload" or "Einzelperson Hochladen"
        if ($el.text().match(/Single Perso|Einzelperson Hochladen/i)) {
          // Highlight the element for debugging (optional)
          cy.wrap($el).invoke(
            'attr',
            'style',
            'border: 2px solid black; padding: 2px;',
          );
          cy.wait(2000);
          // Click the element
          cy.wrap($el).click({ force: true });
        }
      });

    //Check dialog title
    cy.get('main>header>h1')
      .should('be.visible')
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Send Delivers To Select Users|Dokumente an ausgewählte Benutzer senden/i,
        );
      });

    cy.wait(1500);

    //Validate subtitle
    cy.get('main>p')
      .should('be.visible')
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Upload Document for selected users|Dokumente für ausgewählte Benutzer hochladen/i,
        );
      });

    //check Info message under upload area
    cy.get('#file-requirements')
      .should('be.visible') // Ensure the elements are visible
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Only .pdf files up to 13 pages allowed for printing|Nur .pdf bis zu 13 Seiten beim Druck zulässig/i,
        );
      });

    cy.wait(1500);
    //upload invalid PDF file
    cy.DHcreateNewUser_viaCSV();
    cy.wait(2000);

    //check Error message for upload invalid file
    cy.get('#file-list span')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Only pdf files are supported|Es werden nur PDF-Dateien unterstützt/i,
        );
      });
    cy.wait(1500);

    //Remove invalid uploaded file
    cy.get('button[aria-label="Remove 1_createUser.csv"]').click();
    cy.wait(1500);

    //Upload valid PDF file
    cy.DHmassUpload();
    cy.wait(2000);

    // Capture the current date and time in the specified format
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0'); // Ensure two digits
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = now.getFullYear();
    const formattedDate = `${day}.${month}.${year}`; // Ensures dd.mm.yyyy format

    const formattedTime = now
      .toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      .trim(); // Trim to remove leading spaces

    uploadDateTime = `${formattedDate} ${formattedTime}`; // Store the value in a variable
    cy.log(`Upload DateTime: ${uploadDateTime}`); // Log the stored uploadDateTime

    //// ===== VALIDATE "Select company" DROPDOWN =====

    // Validate label for company dropdown
    cy.get('section label')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();
        expect(trimmedText).to.match(/Select company|Firma auswählen/i);
      });
    cy.wait(1500);
    // Open Company dropdown
    cy.get('main >section div[role="combobox"]').click({ force: true });
    cy.wait(1000);

    // Define companies to select from dropdown
    const toCompanies = ['AQUA GmbH'];

    // Wait for dropdown options to appear and locate the list container
    cy.get('[role="listbox"], [role="menu"], ul[role="presentation"]')
      .should('be.visible') // Ensure dropdown is visible
      .find('li, [role="option"]') // Find all list items in the dropdown
      .each(($option) => {
        // Iterate through each dropdown option
        const text = $option.text().trim(); // Extract and trim the option text
        cy.log(`Found option: ${text}`); // Log each found option for debugging

        // Check if current option matches any company in toCompanies array
        if (toCompanies.includes(text)) {
          cy.log(`Matching company found: ${text}`); // Log when match is found

          // Find and select AQUA company from dropdown
          cy.wrap($option)
            .find('span') // Locate checkbox element
            .then(($checkbox) => {
              // Check if checkbox element exists
              if ($checkbox.length > 0) {
                // Determine if checkbox is already checked (multiple attribute checks)
                const isChecked =
                  $checkbox.is(':checked') || // Standard checked state
                  $checkbox.attr('aria-checked') === 'true' || // ARIA checked state
                  $checkbox.attr('data-checked') === 'true'; // Custom data attribute

                // Click checkbox only if not already checked
                if (!isChecked) {
                  cy.wrap($checkbox).click({ force: true }); // Force click to enable
                  cy.log(`Checkbox for "${text}" enabled`); // Log success
                } else {
                  cy.log(`Checkbox for "${text}" already enabled`); // Log already enabled
                }
              } else {
                // If no checkbox found, click the option itself (some dropdowns work this way)
                cy.wrap($option).click({ force: true }); // Click the entire option
                cy.log(`Clicked option "${text}"`); // Log option click
              }
            });
        }
      });

    cy.wait(1000); // Wait for selection to be processed
    // Close dropdown by pressing ESC key
    cy.get('body').type('{esc}'); // Send ESC key to body to close dropdown
    cy.wait(500); // Wait for dropdown to close

    // Validate label for Subject input field
    cy.get('section label')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();
        expect(trimmedText).to.match(/Subject|Betreff/i);
      });
    cy.wait(1500);

    //Check if Subject field is mandatory
    cy.get('input[placeholder="Enter the subject"]')
      .should('be.visible')
      .click()
      .clear() // Ensure field is empty
      .blur(); // Use blur() instead of focusOut()

    cy.wait(500);

    //Check validation message for Subject field
    cy.get('div[role="alert"]')
      .should('be.visible') // Ensure the elements are visible
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Subject field is mandatory|Betreff-Feld ist obligatorisch/i,
        );
      });

    cy.wait(1500);

    // Add Delivery Title/Subject
    const title = `Document To Specific Person (pdf) - ${uploadDateTime}`;
    cy.log(`Title for the document: ${title}`); // Log the title to check

    cy.get('input[placeholder="Enter the subject"]').clear().type(title);
    cy.wait(1500);

    cy.findByPlaceholderText(/select recipients/i).click({ force: true });

    // Select recipient from visible dropdown list (text may include name + id in parentheses)
    const recipientValue = 'AQUA Testuser (ABBA000100279311)';
    const recipientNeedle = recipientValue.toLowerCase().replace(/\s+/g, '');

    cy.get('ul[role="listbox"], [role="listbox"], .MuiAutocomplete-popper')
      .filter(':visible')
      .first()
      .should('be.visible')
      .within(() => {
        cy.get('li, [role="option"]')
          .should('have.length.greaterThan', 0)
          .then(($options) => {
            const match = [...$options].find((el) => {
              const rawText = (el.textContent || '').trim();
              const normalized = rawText.toLowerCase().replace(/\s+/g, '');
              return (
                normalized.includes(recipientNeedle) ||
                rawText.toLowerCase().includes(recipientValue.toLowerCase())
              );
            });

            expect(
              match,
              `Recipient option containing "${recipientValue}" was not found`,
            ).to.exist;

            cy.wrap(match)
              .scrollIntoView()
              .then(($row) => {
                const $checkbox = $row.find(
                  'input[type="checkbox"], [role="checkbox"]',
                );
                if ($checkbox.length > 0) {
                  cy.wrap($checkbox).first().click({ force: true });
                } else {
                  cy.wrap($row).click({ force: true });
                }
              });
          });
      });

    cy.log(`Upload DateTime to verify: ${uploadDateTime}`);

    cy.intercept('POST', '**/deliveryHandler/checkDocumentProcessingStatus').as(
      'processDocuments',
    );

    //Click on Mass Upload - Weiter button
    cy.get('#upload').should('be.enabled').click();

    cy.wait('@processDocuments', { timeout: 50000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('Documents processed successfully');
    });
    cy.wait(1500);
    //Check Success message after document processing
    cy.get('#document-uploaded')
      .should('be.visible')
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(/Document successfully uploaded|/i);
      });

    cy.wait(1500);

    //Click on button to Send Mass delivery
    cy.get('#cancel').should('be.enabled').click();
    cy.wait(1500);

    // Verify confirm sending documents dialog title
    cy.get('#dialog-title')
      .should('be.visible')
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Confirm sending documents|Bestätigung des Versands/i,
        );
      });

    //Verify confirm sending documents dialog content
    cy.get('div[aria-labelledby="dialog-title"] .MuiTypography-body1')
      .should('be.visible')
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        const isEnglishText = trimmedText
          .toLowerCase()
          .includes(
            'by using this feature documents will be sent to all active users',
          );
        const isGermanText = trimmedText
          .toLowerCase()
          .includes(
            'durch die nutzung dieser funktion werden dokumente an alle aktiven benutzer gesendet',
          );
        expect(
          isEnglishText || isGermanText,
          'Dialog should show confirmation message in English or German',
        ).to.be.true;
      });

    //Comfirm sending documents by clicking on confirm button in dialog
    cy.get('div[aria-labelledby="dialog-title"] button')
      .should('be.visible')
      .each(($button) => {
        const buttonText = $button.text().trim();
        cy.log(`Found button: ${buttonText}`);

        // Check if button text matches Confirm (English) or Bestätigen (German)
        if (buttonText.match(/Confirm|Bestätigen/i)) {
          cy.log(`Clicking button: ${buttonText}`);
          cy.wrap($button).click({ force: true });
          return false; // Stop iteration after finding the match
        }
      });
    cy.wait(2000);

    //Close latest dialog - Click on Fertig button
    cy.get('button[type="button"]')
      .should('be.visible')
      .each(($button) => {
        const buttonText = $button.text().trim();
        cy.log(`Found button: ${buttonText}`);

        // Check if button text matches Fertig (German) or Done/Finish (English)
        if (buttonText.match(/Fertig|Done|Finish/i)) {
          cy.log(`Clicking button: ${buttonText}`);
          cy.wrap($button).click({ force: true });
          return false; // Stop iteration after finding the match
        }
      });

    cy.wait(1000);

    //Validate Home page url
    const baseUrl = Cypress.env('dh_baseUrl');
    cy.url().should('include', `${baseUrl}home`);

    // Logout from DH
    cy.get('.MuiButton-text').click();
    cy.wait(1000);
    cy.get('li[role="menuitem"]')
      .contains(/Abmelden|Logout/i)
      .click();
    cy.url().should('include', Cypress.env('dh_baseUrl'));
    cy.log('Upload finished successfully.');
    cy.wait(2500);
  }); //end it

  // Login to e-Box and open delivery if timestamps match logic
  it('Login to e-Box and Open Delivery', () => {
    // Log into e-Box
    cy.loginToEgEbox();
    cy.wait(2000);

    // Retrieve upload time stored in previous test
    let uploadDateTime = Cypress.env('uploadDateTime');

    // If uploadDateTime is not set (test run in isolation), generate current time
    if (!uploadDateTime) {
      const now = new Date();
      const formattedDate = now.toLocaleDateString('de-DE'); // Format: dd.mm.yyyy
      const formattedTime = now.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      uploadDateTime = `${formattedDate} ${formattedTime}`;
      cy.log(
        `Upload DateTime not found, using current time: ${uploadDateTime}`,
      );
    } else {
      cy.log(`Stored Upload DateTime: ${uploadDateTime}`);
    }

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

        cy.log(`Upload DateTime: ${uploadDateTime}`);
        cy.log(`Read DateTime: ${readClean}`);
        cy.log(`Upload Parsed: ${uploadParsed}`);
        cy.log(`Read Parsed: ${readParsed}`);
        cy.log(`Difference: ${diffMin.toFixed(2)} minutes`);

        // --- Apply the condition: times match or within ±1 minute ---
        if (diffMin <= 1) {
          cy.log(
            `✓ Test PASSED: Difference is ${diffMin.toFixed(2)} minutes (within ±1 minute tolerance)`,
          );

          // Intercept backend calls for document load
          cy.intercept('GET', '**/getDocument/**').as('getDocument');
          cy.intercept('GET', '**/getIdentifications?**').as(
            'getIdentifications',
          );

          // Click on the latest delivery
          cy.get('.mdc-data-table__content>tr>.subject-sender-cell')
            .eq(0)

            .click({ force: true });

          // Open the latest delivery
          cy.get('.delivery-document').click({ force: true });

          // Wait for identifications response
          cy.wait(['@getIdentifications'], { timeout: 57000 }).then(
            (interception) => {
              expect(interception.response.statusCode).to.eq(200);
            },
          );

          // Scroll to bottom of the delivery
          cy.get('.content-container>.scroll-container')
            .eq(1)
            .scrollTo('bottom', { duration: 500, ensureScrollable: false });
          cy.wait(3500);
        } else {
          // FAIL: difference > 1 minute
          const errorMsg = `✗ Test FAILED: readDateTime (${readClean}) differs by ${diffMin.toFixed(2)} minutes from uploadDateTime (${uploadDateTime}). Maximum allowed: 1 minute.`;
          cy.log(errorMsg);

          // Log out the user before failing
          cy.get('.user-title').click({ force: true });
          cy.wait(1000);
          cy.get('.logout-title > a').click();
          cy.url().should('include', Cypress.env('baseUrl_egEbox'));

          // Throw error to fail test
          throw new Error(errorMsg);
        }
        // Log out the user after successful validation
        cy.get('.user-title').click({ force: true });
        cy.wait(1000);
        cy.get('.logout-title > a').click();
        cy.url().should('include', Cypress.env('baseUrl_egEbox'));
      });
  });

  //Admin user check Reporting email and delte all emails
  it('Yopmail - Get Reporting email and delte all emails', () => {
    cy.on('uncaught:exception', (err) => {
      // Ignore known Yopmail app-side exception to keep test focused on mail assertions.
      if (
        err.message &&
        err.message.includes(
          "Cannot read properties of null (reading 'postMessage')",
        )
      ) {
        return false;
      }
    });

    // Visit Yopmail
    cy.visit('https://yopmail.com/en/');

    // Enter the support admin email
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));

    // Click the refresh button
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    cy.wait(4500);

    // Define email subject function and open the matched email.
    function emailSubject(index) {
      cy.iframe('#ifinbox')
        .find('.mctn > .m > button > .lms', { timeout: 20000 })
        .eq(index)
        .invoke('text')
        .then((subject) => {
          const normalizedSubject = subject.trim().replace(/\s+/g, ' ');
          expect(normalizedSubject).to.include('Versandreport DocuHub Portal');
        });

      cy.iframe('#ifinbox')
        .find('.mctn > .m > button', { timeout: 20000 })
        .eq(index)
        .click({ force: true });
    }

    // Access the inbox iframe and validate the email subject
    emailSubject(0); // Validate subject of Reporting email

    cy.iframe('#ifmail')
      .find('#mail > div', { timeout: 20000 })
      .invoke('text')
      .then((text) => {
        const normalizedText = text.trim().replace(/\s+/g, ' ');
        expect(normalizedText).to.include(
          'Sie haben 1 Sendung(en) erfolgreich digital in das DocuHub Portal Ihrer Benutzer*innen eingeliefert',
        );
        expect(normalizedText).to.include(
          'Zusätzlich haben Sie 0 Sendung(en) erfolgreich über den postalischen Weg als Brief versendet. Das Dokument wird von uns über das „Einfach Brief“-Portal gedruckt, kurvertiert und an die Adresse des Benutzers versendet.',
        );
        expect(normalizedText).to.include('Ihr DocuHub Team');
      });

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
}); //end describe
