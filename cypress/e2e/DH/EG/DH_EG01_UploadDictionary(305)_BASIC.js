///<reference types="cypress" />

describe('DH Upload Dictionary (305)', () => {
  it('Enable pdfDictionary by Masteruser', () => {
    cy.loginToSupportViewMaster(); // Login as a master user

    // Remove pop-up if present
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      }
    });

    cy.intercept('GET', '**/group/template/tenant/**').as('apiRequest');

    // Search for Group section
    cy.get('#searchButton>span').click();

    // Search for Group by Display Name using the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(0)
      .type(Cypress.env('company'));

    // Find and click the search button
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    // Search for  PDF Dictionary button and click on it
    cy.get('.mdc-button__label')
      .contains(/Assign PDF Dictionary|PDF Dictionary zuweisen/i)
      .should('be.visible')
      .click();

    // Get dictionary names from JSON
    const enablePDFDictionary = Cypress.env('enablePDFDictionary');
    cy.log('enablePDFDictionary:', enablePDFDictionary);

    if (!enablePDFDictionary || enablePDFDictionary.length === 0) {
      throw new Error('No dictionary names found in Cypress.env');
    }

    const searchCriteria = enablePDFDictionary.map((item) => item.name);
    cy.log('Search Criteria:', searchCriteria);

    // Ensure the table is visible before processing
    cy.get('table > tbody', { timeout: 10000 }).should('be.visible');

    //Enable PDF Dictionary according Search Criteria
    cy.get('table > tbody > tr').each(($row) => {
      const rowText = $row.text().trim();
      cy.log(`Checking row: ${rowText}`);

      // If row matches any criteria, check the checkbox
      searchCriteria.forEach((criteria) => {
        if (rowText.includes(criteria)) {
          cy.wrap($row)
            .find('td>input[type="checkbox"]')
            .should('exist')
            .check({ force: true });
          cy.log(`Checked: ${criteria}`);
        }
      });
    });
    cy.wait(1500);
    // Check if next page exists and navigate
    cy.get('.mat-mdc-paginator-navigation-next').then(($nextButton) => {
      if (!$nextButton.prop('disabled')) {
        cy.wrap($nextButton).click();
        cy.wait(500);
        findAndCheckElement(searchCriteria); // Recursively check next page
      } else {
        cy.log('No more pages to check');
      }
    });
    //}
    cy.wait(2000);
    // Save the changes
    cy.get('button>.title')
      .contains(/Save|Übernehmen/i)
      .should('be.visible')
      .click();

    // Verify the success message
    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /PDF Dictionary has been assigned successfully|PDF Dictionary wurde erfolgreich zugewiesen/,
        );
      });

    // Logout
    cy.get('.logout-icon').click();
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl'));
    cy.log('Test completed successfully.');
  });

  //Enable All Roles
  it.skip('Enable All Roles', () => {
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

  //Uplad pdf - From Mass Upload Button
  it.only('DH - Upload pdfDictionary 305_Dictionary (verify Error and Success messages)', () => {
    let uploadDateTime = ''; // Global variable to store upload date & time

    // Visit AUT
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.url().should('include', Cypress.env('dh_baseUrl'));
    cy.wait(1500);

    // Remove Cookie dialog if present
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      } else {
        cy.log('Cookie bar not visible');
      }
    });
    cy.wait(1500);

    // --- Login ---
    cy.get('input[placeholder="Username"]').type(
      Cypress.env('email_supportViewAdmin'),
    );
    cy.get('input[type="password"]').type(
      Cypress.env('password_supportViewAdmin'),
    );

    // Intercept backend call after login
    cy.intercept('GET', '**/generalInfo').as('generalInfo');

    // Click on Login Button
    cy.get('button[type="submit"]').click();
    cy.wait(2000);

    // Wait & Assert response
    cy.wait('@generalInfo', { timeout: 15000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('Login successful, generalInfo loaded');
    });

    cy.wait(1500);
    // Click on Upload Personal Document button
    cy.get('#send-action-cards-grid > div > div')
      .should('be.visible') // Ensure the elements are visible
      .each(($el) => {
        // Iterate through each of the elements

        // Check if the text matches either "Persönliches Dokument" or "Upload Personal Document"
        if ($el.text().match(/Persönliches Dokument|Personal Document/i)) {
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
    cy.get('#send-action-cards-grid>div>div')
      .should('be.visible')
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Personal Document Upload|Upload Document/i,
        );
      });

    cy.wait(1500);

    // //Validate subtitle
    // cy.get('main>p')
    //   .should('be.visible')
    //   .invoke('text') // Get the text of the element
    //   .then((text) => {
    //     // Trim the text and validate it
    //     const trimmedText = text.trim();
    //     expect(trimmedText).to.match(
    //       /Wählen Sie eines oder mehrere Dokumente aus|Wählen Sie eines oder mehrere Dokumente aus/i,
    //     );
    //   });

    //check Info message under upload area
    cy.get('#file-requirements')
      .should('be.visible') // Ensure the elements are visible
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Maximum file size is 50 MB and a maximum of 10 documents can be uploaded. Allowed file types are .pdf, .xml, .zip, .7z and .txt.|Maximum file size is 50 MB and a maximum of 10 documents can be uploaded. Allowed file types are .pdf, .xml, .zip, .7z and .txt./i,
        );
      });

    cy.wait(1500);

    //Upload valid PDF file - 305 Dictionary
    cy.DHupload305Dictionary();
    cy.wait(2500);

    // Select valid dictionary 305 from dropdown
    // Wait for file upload to complete and dropdown to become available
    cy.wait(1500);

    // Find and click the combobox dropdown
    cy.get('div[role="combobox"]', { timeout: 10000 })
      .should('exist') // Ensure element exists in DOM
      .should('be.visible') // Wait for element to be visible
      .should('not.be.disabled') // Ensure it's not disabled
      .scrollIntoView() // Scroll element into view
      .wait(500) // Small wait after scroll
      .click(); // Click to open dropdown (try without force first)

    cy.wait(1500);
    // --- PDF Dictionary/Serviceline values you want to select ---
    // One value:
    const selectInvalidDictionary = ['PDFTABDictionary-301'];

    // Or multiple values:
    // const desiredSelection = ['PDFTABDictionary-200', 'PDFTABDictionary-301', , 'PDFTABDictionary-305', 'ServiceLine'];

    // --- Reusable dropdown selector ---
    const selectInvalidDictionaryFromDropdown = (values) => {
      values.forEach((val) => {
        // Type value in search field
        cy.get('input[id="dropdown-searchfield-undefined"]')
          .clear()
          .type(val, { delay: 20 });

        // Click the matching element
        cy.get(`li[data-value="${val}"]`)
          .should('be.visible')
          .click({ force: true });

        cy.log(`Selected value from dropdown: ${val}`);
      });
    };

    // --- Usage ---
    // Call this inside your test after the upload step
    selectInvalidDictionaryFromDropdown(selectInvalidDictionary);

    //Click on Weiter button
    cy.intercept('POST', '**/checkDocumentProcessingStatus').as(
      'checkDocumentProcessingStatus',
    );

    cy.get('button[aria-label="Weiter zum nächsten Schritt"]')
      .should('be.enabled')
      .click();

    function waitUntilProcessingDone() {
      cy.wait('@checkDocumentProcessingStatus', { timeout: 15000 }).then(
        (interception) => {
          const body = interception.response.body;

          cy.log(`processingOver: ${body.processingOver}`);

          const isDone =
            body.processingOver === true || body.processingOver === 'true';

          if (isDone) {
            expect(isDone).to.eq(true); // ← final assertion FIXED
          } else {
            waitUntilProcessingDone(); // ← keep waiting
          }
        },
      );
    }

    waitUntilProcessingDone();
    cy.wait(2000);

    //Check Error message after document processing for invalid dictionary
    cy.get('#file-list>div>div>div>div>span')
      .should('be.visible')
      .invoke('text') // Get the text of the element

      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Meta data could not be extracted|Metadaten konnten nicht extrahiert werden/i,
        );
      });

    cy.wait(1500);
    //Check if Weiter button is disabled
    cy.get('button[aria-label="Send documents').should('be.disabled');
    cy.wait(1500);

    // Remove invalid uploaded file (305 Dictionary) and mark it before clickinga on remove button
    cy.get(
      'button[aria-label="Remove 305_Dictionary_(AQUA_ABBA000100279311).pdf"]',
    )
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      .wait(2000)
      .click();
    cy.wait(1500);

    //Re-Upload valid PDF file - 305 Dictionary
    cy.DHupload305Dictionary();
    cy.wait(2000);

    // Select valid dictionary 305 from dropdown
    // Ensure dropdown is visible and ready before clicking
    cy.get('div[role="combobox"]')
      .should('be.visible') // Wait for element to be visible
      .should('not.be.disabled') // Ensure it's not disabled
      .click({ force: true }); // Click to open dropdown

    // --- PDF Dictionary/Serviceline values you want to select ---
    // One value:
    const desiredSelection = ['PDFTABDictionary-305'];

    // Or multiple values:
    // const desiredSelection = ['PDFTABDictionary-200', 'PDFTABDictionary-301', , 'PDFTABDictionary-305', 'ServiceLine'];

    // --- Reusable dropdown selector ---
    const selectFromDropdown = (values) => {
      values.forEach((val) => {
        // Type value in search field
        cy.get('input[id="dropdown-searchfield-undefined"]')
          .clear()
          .type(val, { delay: 20 });

        // Click the matching element
        cy.get(`li[data-value="${val}"]`)
          .should('be.visible')
          .click({ force: true });

        cy.log(`Selected value from dropdown: ${val}`);
      });
    };

    // --- Usage ---
    // Call this inside your test after the upload step
    selectFromDropdown(desiredSelection);

    cy.wait(1500);

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

    //cy.log(`Upload DateTime to verify: ${uploadDateTime}`);

    cy.intercept('POST', '**/checkDocumentProcessingStatus').as(
      'checkDocumentProcessingStatus',
    );
    //Click on Weiter button
    cy.get('button[aria-label="Weiter zum nächsten Schritt"]')
      .should('be.enabled')
      .click();

    cy.wait('@checkDocumentProcessingStatus', { timeout: 15000 }).then(
      (interception) => {
        const body = interception.response.body;

        cy.log(`processingOver: ${body.processingOver}`);
        const isDone =
          body.processingOver === true || body.processingOver === 'true';
        if (isDone) {
          expect(isDone).to.eq(true); // ← final assertion FIXED
        } else {
          // Re-invoke the wait if not done

          cy.wait('@checkDocumentProcessingStatus', { timeout: 15000 }).then(
            (interception) => {
              const body = interception.response.body;

              cy.log(`processingOver: ${body.processingOver}`);
              const isDone =
                body.processingOver === true || body.processingOver === 'true';
              expect(isDone).to.eq(true); // ← final assertion FIXED
            },
          );
        }
      },
    );

    //Check Success message after document processing
    cy.get('#file-list>div>div>div>div>span')
      .should('be.visible')
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Document successfully uploaded|Document successfully uploaded/i,
        );
      });

    cy.wait(1500);

    cy.intercept('POST', '**/deliveryHandler/sendDocuments').as(
      'sendMassDelivery',
    );
    //Click on butrton to Send Mass delivery
    cy.get('button[aria-label="Send documents"').should('be.enabled').click();

    cy.wait('@sendMassDelivery', { timeout: 20000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('Mass delivery sent successfully');
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
  }); //end it

  // Login to e-Box and Open Delivery
  it('Ebox user Open delivery', () => {
    cy.loginToEgEbox();
    cy.wait(2500);

    // Open latest created delivery
    cy.intercept(
      'GET',
      '**/hybridsign/backend_t/document/v1/getDocument/**',
    ).as('getDocument');
    cy.intercept('GET', '**/getIdentifications?**').as('getIdentifications');

    cy.get('.mdc-data-table__content>tr>.subject-sender-cell')
      .eq(0)
      .click({ force: true });

    cy.wait(['@getIdentifications'], { timeout: 57000 }).then(
      (interception) => {
        cy.log('Intercepted response:', interception.response);
        expect(interception.response.statusCode).to.eq(200);
      },
    );

    // Scroll to the bottom of the PDF viewer
    // cy.get('.content-container>.scroll-container').eq(1).scrollTo('bottom', {
    //   duration: 500,
    //   ensureScrollable: false,
    // });
    cy.wait(2500);

    //Validate uploadDateTime
    // cy.log(`Upload DateTime to verify: ${uploadDateTime}`); // Log to verify the value is accessible
    // console.log('uploadDateTime', uploadDateTime);

    // // Normalize the stored uploadDateTime
    // const normalizedUploadDateTime = uploadDateTime
    //   .replace(',', ' ')
    //   .replace(/\s+/g, ' ')
    //   .trim();

    // cy.get('.field-value') // Adjust selector based on the actual document details container
    //   .invoke('text')
    //   .then((docText) => {
    //     // Normalize the extracted document DateTime
    //     const docDateTime = docText
    //       .replace(',', ' ')
    //       .replace(/\s+/g, ' ')
    //       .trim();
    //     cy.log(`Extracted DateTime from Document: '${docDateTime}'`);

    //     // Convert both to Date objects for accurate time comparison
    //     const parseDateTime = (dateTimeStr) => {
    //       const [datePart, timePart] = dateTimeStr.split(' ');
    //       const [day, month, year] = datePart.split('.').map(Number);
    //       const [hour, minute] = timePart.split(':').map(Number);
    //       return new Date(year, month - 1, day, hour, minute); // Month is 0-based in JS
    //     };

    //     const uploadedTime = parseDateTime(normalizedUploadDateTime);
    //     const extractedTime = parseDateTime(docDateTime);

    //     // Allow up to +1 minute difference
    //     const maxAllowedTime = new Date(uploadedTime);
    //     maxAllowedTime.setMinutes(uploadedTime.getMinutes() + 1);

    //     // Validate the extracted time is within range
    //     expect(extractedTime).to.be.at.least(uploadedTime);
    //     expect(extractedTime).to.be.at.most(maxAllowedTime);

    //     cy.log(
    //       `Validated: Expected ${normalizedUploadDateTime} (or +1 min) <= ${docDateTime} (actual)`
    //     );
    //   });

    // Logout
    cy.get('.user-title').click();
    cy.wait(1500);
    cy.get('.logout-title > a').click();
    cy.url().should('include', Cypress.env('baseUrl_egEbox'));
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
          'Sie haben 1 Sendung(en) erfolgreich digital in das e-Gehaltszettel Portal Ihrer Benutzer*innen eingeliefert',
        );
        expect(normalizedText).to.include(
          'Zusätzlich haben Sie 0 Sendung(en) erfolgreich über den postalischen Weg als Brief versendet. Das Dokument wird von uns über das „Einfach Brief“-Portal gedruckt, kurvertiert und an die Adresse des Benutzers versendet.',
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
});
