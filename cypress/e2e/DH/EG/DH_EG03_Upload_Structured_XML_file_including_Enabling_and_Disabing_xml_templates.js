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

  it('DH - Upload structured XML  - after enabling template', () => {
    let uploadDateTime = ''; // Global variable to store upload date & time
    // // Visit AUT
    // cy.visit(Cypress.env('dh_baseUrl'));
    // cy.url().should('include', Cypress.env('dh_baseUrl'));
    // cy.wait(1500);

    // // Remove Cookie dialog if present
    // cy.get('body').then(($body) => {
    //   if ($body.find('#onetrust-policy-title').is(':visible')) {
    //     cy.get('#onetrust-accept-btn-handler').click({ force: true });
    //   } else {
    //     cy.log('Cookie bar not visible');
    //   }
    // });
    // cy.wait(1500);

    // // Click Login button (first page)
    // cy.get('button[id=":r0:"]').contains('Login').click();
    // cy.wait(2000);

    // // --- Keycloak Login ---
    // cy.get('input[id="username"]').type(Cypress.env('email_supportViewAdmin'));
    // cy.get('input[name="password"]').type(
    //   Cypress.env('password_supportViewAdmin')
    // );

    // // Intercept backend call after login
    // cy.intercept('GET', '**/generalInfo').as('generalInfo');

    // // Click Keycloak Login Button
    // cy.get('button#kc-login').contains('Jetzt einloggen').click();

    // // Wait & Assert response
    // cy.wait('@generalInfo', { timeout: 15000 }).then((interception) => {
    //   expect(interception.response.statusCode).to.eq(200);
    //   cy.log('Login successful, generalInfo loaded');
    // });

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

    //Click on Admin User page
    cy.intercept('POST', '**/activityLog/bertUserLogs').as('bertUserLogs');
    cy.get('nav ul li div span')
      .should('be.visible') // Ensure the elements are visible
      .each(($el) => {
        // Iterate through each of the elements
        // Check if the text matches either "Arbeitsbereich" (German) or "Workspace" (English)
        if ($el.text().match(/Arbeitsbereich|Workspace/i)) {
          // Highlight the element for debugging (optional)
          cy.wrap($el).invoke(
            'attr',
            'style',
            'border: 2px solid black; padding: 2px;'
          );
          cy.wait(2000);
          // Click the element
          cy.wrap($el).click();
        }
      });
    cy.wait('@bertUserLogs', { timeout: 10000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('Navigated to Arbeitsbereich page');
    });

    cy.wait(1500);
    // Click on Upload Personal Document button
    cy.get('#send-action-cards-grid > div > div')
      .should('be.visible') // Ensure the elements are visible
      .each(($el) => {
        // Iterate through each of the elements

        // Check if the text matches either "Persönliches Dokument" or "Upload Personal Document"
        if (
          $el.text().match(/Persönliches Dokument|Upload Personal Document/i)
        ) {
          // Highlight the element for debugging (optional)
          cy.wrap($el).invoke(
            'attr',
            'style',
            'border: 2px solid black; padding: 2px;'
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
          /Personal Document Upload|Upload Document/i
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
          /Wählen Sie eines oder mehrere Dokumente aus|Wählen Sie eines oder mehrere Dokumente aus/i
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
          /Max 10 Personal Documents und 10MB, .pdf, .xml, .zip, .7z, .txt|Max 10 Personal Documents und 10MB, .pdf, .xml, .zip, .7z, .txt/i
        );
      });

    cy.wait(1500);

    //Upload XML file
    cy.DHuploadStructuredXMLfile();
    cy.wait(2500);

    //Click on Weiter button
    cy.intercept('POST', '**/checkDocumentProcessingStatus').as(
      'checkDocumentProcessingStatus'
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
        }
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
          /XML template not valid|XML ist ungültig/i
        );
      });

    cy.wait(1500);
    //Check if Weiter button is disabled
    cy.get('button[aria-label="Send documents').should('be.disabled');
    cy.wait(1500);

    // Remove invalid uploaded file (305 Dictionary) and mark it before clickinga on remove button
    cy.get(
      'button[aria-label="Remove XML_Structured(ABBA000100279311_L103-ISS).xml"]'
    )
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      .wait(2000)
      .click();
    cy.wait(1500);
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

  it('DH - Upload structured XML  - after enabling template', () => {
    let uploadDateTime = ''; // Global variable to store upload date & time
    // // Visit AUT
    // cy.visit(Cypress.env('dh_baseUrl'));
    // cy.url().should('include', Cypress.env('dh_baseUrl'));
    // cy.wait(1500);

    // // Remove Cookie dialog if present
    // cy.get('body').then(($body) => {
    //   if ($body.find('#onetrust-policy-title').is(':visible')) {
    //     cy.get('#onetrust-accept-btn-handler').click({ force: true });
    //   } else {
    //     cy.log('Cookie bar not visible');
    //   }
    // });
    // cy.wait(1500);

    // // Click Login button (first page)
    // cy.get('button[id=":r0:"]').contains('Login').click();
    // cy.wait(2000);

    // // --- Keycloak Login ---
    // cy.get('input[id="username"]').type(Cypress.env('email_supportViewAdmin'));
    // cy.get('input[name="password"]').type(
    //   Cypress.env('password_supportViewAdmin')
    // );

    // // Intercept backend call after login
    // cy.intercept('GET', '**/generalInfo').as('generalInfo');

    // // Click Keycloak Login Button
    // cy.get('button#kc-login').contains('Jetzt einloggen').click();

    // // Wait & Assert response
    // cy.wait('@generalInfo', { timeout: 15000 }).then((interception) => {
    //   expect(interception.response.statusCode).to.eq(200);
    //   cy.log('Login successful, generalInfo loaded');
    // });

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

    //Click on Admin User page
    cy.intercept('POST', '**/activityLog/bertUserLogs').as('bertUserLogs');
    cy.get('nav ul li div span')
      .should('be.visible') // Ensure the elements are visible
      .each(($el) => {
        // Iterate through each of the elements
        // Check if the text matches either "Arbeitsbereich" (German) or "Workspace" (English)
        if ($el.text().match(/Arbeitsbereich|Workspace/i)) {
          // Highlight the element for debugging (optional)
          cy.wrap($el).invoke(
            'attr',
            'style',
            'border: 2px solid black; padding: 2px;'
          );
          cy.wait(2000);
          // Click the element
          cy.wrap($el).click();
        }
      });
    cy.wait('@bertUserLogs', { timeout: 10000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('Navigated to Arbeitsbereich page');
    });

    cy.wait(1500);
    // Click on Upload Personal Document button
    cy.get('#send-action-cards-grid > div > div')
      .should('be.visible') // Ensure the elements are visible
      .each(($el) => {
        // Iterate through each of the elements

        // Check if the text matches either "Persönliches Dokument" or "Upload Personal Document"
        if (
          $el.text().match(/Persönliches Dokument|Upload Personal Document/i)
        ) {
          // Highlight the element for debugging (optional)
          cy.wrap($el).invoke(
            'attr',
            'style',
            'border: 2px solid black; padding: 2px;'
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
          /Personal Document Upload|Upload Document/i
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
          /Wählen Sie eines oder mehrere Dokumente aus|Wählen Sie eines oder mehrere Dokumente aus/i
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
          /Max 10 Personal Documents und 10MB, .pdf, .xml, .zip, .7z, .txt|Max 10 Personal Documents und 10MB, .pdf, .xml, .zip, .7z, .txt/i
        );
      });

    cy.wait(1500);

    //Upload XML file
    cy.DHuploadStructuredXMLfile();
    cy.wait(2500);

    // //Click on Weiter button
    // cy.intercept('POST', '**/checkDocumentProcessingStatus').as(
    //   'checkDocumentProcessingStatus'
    // );

    // cy.get('button[aria-label="Weiter zum nächsten Schritt"]')
    //   .should('be.enabled')
    //   .click();

    // function waitUntilProcessingDone() {
    //   cy.wait('@checkDocumentProcessingStatus', { timeout: 15000 }).then(
    //     (interception) => {
    //       const body = interception.response.body;

    //       cy.log(`processingOver: ${body.processingOver}`);

    //       const isDone =
    //         body.processingOver === true || body.processingOver === 'true';

    //       if (isDone) {
    //         expect(isDone).to.eq(true); // ← final assertion FIXED
    //       } else {
    //         waitUntilProcessingDone(); // ← keep waiting
    //       }
    //     }
    //   );
    // }

    // waitUntilProcessingDone();
    // cy.wait(2000);

    // //Check Error message after document processing for invalid dictionary
    // cy.get('#file-list>div>div>div>div>span')
    //   .should('be.visible')
    //   .invoke('text') // Get the text of the element

    //   .then((text) => {
    //     // Trim the text and validate it
    //     const trimmedText = text.trim();
    //     expect(trimmedText).to.match(
    //       /Meta data could not be extracted|Metadaten konnten nicht extrahiert werden/i
    //     );
    //   });

    // cy.wait(1500);
    // //Check if Weiter button is disabled
    // cy.get('button[aria-label="Send documents').should('be.disabled');
    // cy.wait(1500);

    // // Remove invalid uploaded file (305 Dictionary) and mark it before clickinga on remove button
    // cy.get(
    //   'button[aria-label="Remove 305_Dictionary_(AQUA_ABBA000100279311).pdf"]'
    // )
    //   .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
    //   .wait(2000)
    //   .click();
    // cy.wait(1500);

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
      'checkDocumentProcessingStatus'
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
            }
          );
        }
      }
    );

    //Check Success message after document processing
    cy.get('#file-list>div>div>div>div>span')
      .should('be.visible')
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Document successfully uploaded|Document successfully uploaded/i
        );
      });

    cy.wait(1500);

    cy.intercept('POST', '**/deliveryHandler/sendDocuments').as(
      'sendMassDelivery'
    );
    //Click on butrton to Send Mass delivery
    cy.get('button[aria-label="Send documents"').should('be.enabled').click();

    cy.wait('@sendMassDelivery', { timeout: 20000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('Structured XML sent successfully');
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
        `Upload DateTime not found, using current time: ${uploadDateTime}`
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

          // // Log out the user immediately
          // cy.get('.user-title').click({ force: true });
          // cy.wait(1000);
          // cy.get('.logout-title > a').click();
          // cy.url().should('include', Cypress.env('baseUrl_egEbox'));

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
}); //end describe
