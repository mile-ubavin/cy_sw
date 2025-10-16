describe('Admin user uploads Structured XML template', () => {
  // --- Helper: Parse datetime from "dd.mm.yyyy hh:mm" (German format)
  function parseGermanDateTime(dateTimeStr) {
    const [datePart, timePart] = dateTimeStr.split(' ');
    const [day, month, year] = datePart.split('.').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute);
  }

  //Disable xml teplates by Masteruser
  it('Disable XML templates by Masteruser', () => {
    cy.loginToSupportViewMaster(); // Login as a master user
    cy.wait(2000);

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

    // Search for XML Template button and click it
    cy.get('.mdc-button__label')
      .contains(/Assign XML Template|XML Template zuweisen/i)
      .should('be.visible')
      .click();

    cy.get('table > tbody > tr').each(($el, index) => {
      cy.log(`Element ${index + 1}: ${$el.text()}`);
    });

    // Get the array of search criteria names from Cypress environment variables
    const disableXML = Cypress.env('disableXML');
    const searchCriteria = disableXML.map((item) => item.name); // Extract all names

    cy.log('Search Criteria:', searchCriteria);

    // Process the response
    cy.wait('@apiRequest').then((interception) => {
      cy.log(`Status Code: ${interception.response.statusCode}`);
      const responseBody = interception.response.body;
      cy.log('Response Body:', responseBody);

      // Filter assigned elements based on search criteria
      const assignedTrueElements = responseBody.filter(
        (item) => searchCriteria.includes(item.name) && item.assigned
      );

      if (assignedTrueElements.length > 0) {
        // Uncheck each matching element in the DOM
        assignedTrueElements.forEach((item) => {
          cy.log(`Unchecking item: ${item.name}`);
          cy.get('table > tbody > tr').each(($row) => {
            if ($row.text().includes(item.name)) {
              cy.wrap($row)
                .find('td:first-child input[type="checkbox"]')
                .should('be.visible')
                .uncheck({ force: true });
              cy.wait(500);
            }
          });
        });
      } else {
        cy.log('No items to uncheck. All items are already unchecked.');
      }
    });
    cy.wait(1000);

    // Click the save button if there are items to uncheck
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
    cy.wait(2500);

    // Logout
    cy.get('.logout-icon').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate URL
    cy.log('Test completed successfully.');
    cy.wait(2500);
  });

  //Admin user Try Upload Structured XML file before enabling templated
  it('Failed upload Structured XML file - before enabling template', () => {
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

    //Try upload StructuredXMLfile (L103 ISS), when L103 xml template is disabled

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
          .filter((_index, el) => {
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

    // Upload Structured XML file
    cy.uploadStructuredXMLfile();
    cy.wait(1500);

    cy.intercept(
      'POST',
      '**/deliveryHandler/checkDocumentProcessingStatus**'
    ).as('completeCheckingDocumentProcessingStatus');

    cy.get('.dialog-actions>button>.title')
      .contains(/Upload Personal Document|Personalisierte Dokumente hochladen/i)
      .should('be.visible') // Ensure the button is visible before interacting
      .click(); // Click the button

    const checkProcessingStatus = () => {
      cy.wait('@completeCheckingDocumentProcessingStatus', { timeout: 27000 })
        .its('response.body.processingOver')
        .then((processingOver) => {
          if (!processingOver) {
            cy.log('Processing not complete, retrying...');
            cy.wait(2000); // Wait for a short period before retrying
            checkProcessingStatus(); // Retry
          } else {
            cy.log('Processing complete.');
          }
        });
    };

    checkProcessingStatus();

    //Check validation message
    cy.get('.list-item-status>.danger')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /XML template not valid|XML ist ungültig/i
        );
      });
    cy.wait(2000);

    //Close Upload document dialog
    cy.get('mat-icon[data-mat-icon-name="close"]').click();
    cy.wait(1500);

    // Logout
    cy.get('.logout-icon').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate URL
    cy.log('Test completed successfully.');
    cy.wait(2500);
  });

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

  // Admin user uploads Structured XML template
  it('Upload XML template', () => {
    // Login to SupportView as Admin
    cy.loginToSupportViewAdmin();
    cy.wait(1500);

    // Close popup if visible
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('No popup to close');
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
          .filter((_index, el) => {
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
    cy.uploadStructuredXMLfile();
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

    // Logout after upload
    cy.get('.logout-icon').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl'));
    cy.log('Upload finished successfully.');
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

          // Log out the user immediately
          cy.get('.user-title').click({ force: true });
          cy.wait(1000);
          cy.get('.logout-title > a').click();
          cy.url().should('include', Cypress.env('baseUrl_egEbox'));

          // Throw error to fail test
          throw new Error(errorMsg);
        }
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
}); //end describe
