describe('Enable and Disable XML templates provided from JSON', () => {
  //Admin user Upload XML template before ebabling templated
  // it('Failed upload XML template - before enabling template', () => {
  //   cy.loginToSupportViewAdmin();
  //   // Wait for login to complete
  //   cy.wait(1500);

  //   // Click On Upload Personal Document Button
  //   cy.get('.upload__document>.mdc-button__label>.upload__document__text')
  //     .contains(/Upload Personal Document|Personalisierte Dokumente hochladen/i)
  //     .should('be.visible') // Ensure the button is visible before interacting
  //     .click(); // Click the button
  //   cy.wait(1500);

  //   // Click on Upload Document button
  //   cy.get('.buttons-wrapper>button>.title')
  //     .contains(/Upload Document|Dokument hochladen/i)
  //     .should('be.visible') // Ensure the button is visible before interacting
  //     .click(); // Click the button
  //   cy.wait(1500);

  //   // Upload XML file
  //   cy.uploadXMLfile();
  //   cy.wait(1500);

  //   cy.intercept(
  //     'POST',
  //     '**/deliveryHandler/checkDocumentProcessingStatus**'
  //   ).as('completeCheckingDocumentProcessingStatus');

  //   cy.get('.dialog-actions>button>.title')
  //     .contains(/Upload Personal Document|Personalisierte Dokumente hochladen/i)
  //     .should('be.visible') // Ensure the button is visible before interacting
  //     .click(); // Click the button

  //   // Wait for the response and check the `processingOver` flag
  //   // cy.wait('@completeCheckingDocumentProcessingStatus', { timeout: 27000 })
  //   //   .its('response.body')
  //   //   .should('have.property', 'processingOver', true);
  //   // cy.wait(1500);

  //   const checkProcessingStatus = () => {
  //     cy.wait('@completeCheckingDocumentProcessingStatus', { timeout: 27000 })
  //       .its('response.body.processingOver')
  //       .then((processingOver) => {
  //         if (!processingOver) {
  //           cy.log('Processing not complete, retrying...');
  //           cy.wait(2000); // Wait for a short period before retrying
  //           checkProcessingStatus(); // Retry
  //         } else {
  //           cy.log('Processing complete.');
  //         }
  //       });
  //   };

  //   checkProcessingStatus();

  //   //Check validation message
  //   cy.get('.list-item-status>.danger')
  //     .should('be.visible')
  //     .invoke('text')
  //     .then((text) => {
  //       const trimmedText = text.trim();
  //       expect(trimmedText).to.match(
  //         /XML template not valid|XML ist ungültig/i
  //       );
  //     });
  //   cy.wait(2000);

  //   //Close Upload document dialog
  //   cy.get('mat-icon[data-mat-icon-name="close"]').click();
  //   cy.wait(1500);

  //   // Logout
  //   cy.get('.logout-icon').click();
  //   cy.wait(2000);
  //   cy.get('.confirm-buttons > :nth-child(2)').click();
  //   cy.url().should('include', Cypress.env('baseUrl')); // Validate URL
  //   cy.log('Test completed successfully.');
  //   cy.wait(2500);
  // });

  //Enable xml teplates by Masteruser
  it('Enable XML templates by Masteruser', () => {
    cy.loginToSupportViewMaster(); // Login as a master user
    cy.intercept('GET', '**/group/template/tenant/**').as('apiRequest');

    // Search for Group section
    cy.get('#searchButton>span').click(); // Click on the search button

    // Search for Group by Display Name using the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(1)
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

  // //Admin user Upload XML template
  // it('Upload XML template', () => {
  //   cy.loginToSupportViewAdmin();
  //   // Wait for login to complete
  //   cy.wait(1500);

  //   //Click On Upload Personal Document Button
  //   cy.get('.upload__document>.mdc-button__label>.upload__document__text')
  //     .contains(/Upload Personal Document|Personalisierte Dokumente hochladen/i)
  //     .should('be.visible') // Optional: Ensure the button is visible before interacting
  //     .click(); // Click the button
  //   cy.wait(1500);

  //   //Click on Upload Document button
  //   cy.get('.buttons-wrapper>button>.title')
  //     .contains(/Upload Document|Dokument hochladen/i)
  //     .should('be.visible') // Optional: Ensure the button is visible before interacting
  //     .click(); // Click the button
  //   cy.wait(1500);

  //   //Upload XML file
  //   cy.uploadXMLfile();
  //   cy.wait(2500);

  //   cy.intercept(
  //     'POST',
  //     '**/deliveryHandler/checkDocumentProcessingStatus**'
  //   ).as('completeCheckingDocumentProcessingStatus');

  //   cy.get('.dialog-actions>button>.title')
  //     .contains(/Upload Personal Document|Personalisierte Dokumente hochladen/i)
  //     .should('be.visible') // Optional: Ensure the button is visible before interacting
  //     .click(); // Click the button

  //   cy.wait(['@completeCheckingDocumentProcessingStatus'], {
  //     timeout: 27000,
  //   }).then((interception) => {
  //     // Log the intercepted response
  //     cy.log('Intercepted response:', interception.response);

  //     // Assert the response status code
  //     expect(interception.response.statusCode).to.eq(200);
  //   });

  //   cy.get('.dialog-actions>button>.title')
  //     .contains(/Send|Senden /i)
  //     .should('be.visible') // Optional: Ensure the button is visible before interacting
  //     .click(); // Click the button
  //   cy.wait(1500);

  //   // //Confirm dialog for sending delivery to all users from selected company
  //   // cy.get('.title')
  //   //   .contains(/Confirm|Bestätigen/i)
  //   //   .should('be.visible') // Optional: Ensure the button is visible before interacting
  //   //   .click(); // Click the button
  //   // cy.wait(1500);

  //   // Verify the success message
  //   cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
  //     .should('be.visible') // Ensure it's visible first
  //     .invoke('text') // Get the text of the element
  //     .then((text) => {
  //       // Trim the text and validate it
  //       const trimmedText = text.trim();
  //       expect(trimmedText).to.match(
  //         /We are processing in the background|Wir verarbeiten im Hintergrund/
  //       );
  //     });
  //   cy.wait(2500);

  //   // Logout
  //   cy.get('.logout-icon ').click();
  //   cy.wait(2000);
  //   cy.get('.confirm-buttons > :nth-child(2)').click();
  //   cy.url().should('include', Cypress.env('baseUrl')); // Validate url'
  //   cy.log('Test completed successfully.');
  //   cy.wait(2500);
  // });

  // //Login to e-Box and Open Delivery
  // it('Ebox user Open delivery', () => {
  //   cy.loginToEgEbox();

  //   //Open latest created deivery
  //   cy.intercept(
  //     'GET',
  //     '**/hybridsign/backend_t/document/v1/getDocument/**'
  //   ).as('getDocument');
  //   cy.intercept('GET', '**/getIdentifications?**').as('getIdentifications');
  //   cy.get('.mdc-data-table__content>tr>.subject-sender-cell')
  //     .eq(0)
  //     .click({ force: true });

  //   cy.wait(['@getIdentifications'], { timeout: 37000 }).then(
  //     (interception) => {
  //       // Log the intercepted response
  //       cy.log('Intercepted response:', interception.response);

  //       // Assert the response status code
  //       expect(interception.response.statusCode).to.eq(200);
  //     }
  //   );

  //   // Scroll to the bottom of the PDF viewer or page
  //   cy.get('.content-container>.scroll-container').eq(1).scrollTo('bottom', {
  //     duration: 500,
  //     ensureScrollable: false,
  //   });
  //   cy.wait(3500);

  //   // Logout
  //   cy.get('.user-title').click();
  //   cy.wait(1500);
  //   cy.get('.logout-title > a').click();
  //   cy.url().should('include', Cypress.env('baseUrl_egEbox')); // Validate url
  //   cy.log('Test completed successfully.');
  // });

  // //Admin user check Reporting email
  // it.skip('Yopmail - Get Reporting email', () => {
  //   // Visit Yopmail
  //   cy.visit('https://yopmail.com/en/');

  //   // Enter the support admin email
  //   cy.get('#login').type(Cypress.env('email_supportViewAdmin'));

  //   // Click the refresh button
  //   cy.get('#refreshbut > .md > .material-icons-outlined').click();
  //   //Custom functions:
  //   // Define email subject function
  //   function emailSubject(index) {
  //     cy.iframe('#ifinbox')
  //       .find('.mctn > .m > button > .lms')
  //       .eq(index)
  //       .should('include.text', 'Versandreport e-Gehaltszettel Portal');
  //   }
  //   // Define email body function
  //   function emailBody() {
  //     cy.iframe('#ifmail')
  //       .find('#mail > div')
  //       .then(($div) => {
  //         const text = $div.text().trim();
  //         expect(
  //           text.includes(
  //             '1 Sendung(en) die Sie postalisch als Brief verschicken wollten, konnte(n) nicht ordnungsgemäß zugestellt werden, bitte überprüfen Sie die Daten der Mitarbeiter*innen, oder wenden Sie sich an unseren Kundenservice e-gehaltszettel@post.at'
  //           ) ||
  //             text.includes(
  //               'Zusätzlich haben Sie 1 Sendung(en) erfolgreich über den postalischen Weg als Brief versendet. Das Dokument wird von uns über das „Einfach Brief“-Portal  gedruckt, kurvertiert und an die Adresse des Benutzers versendet'
  //             )
  //         ).to.be.true; // OR condition
  //       });
  //   }

  //   // Access the inbox iframe and validate the email subject
  //   emailSubject(0); // Validate subject of Reporting email
  //   emailBody(); // Validate email body

  //   // Wait to ensure the email content is loaded
  //   cy.wait(4500);

  //   // // Switch to the second email
  //   // cy.iframe('#ifinbox').find('.mctn > .m > button > .lms').eq(1).click();

  //   // emailSubject(1); // Validate subject of second email
  //   // cy.wait(1500);
  //   // emailBody(); // Validate second email body

  //   // Delete all emails if the button is not disabled
  //   cy.get('.menu>div>#delall')
  //     .should('not.be.disabled')
  //     .click({ force: true });
  //   cy.wait(4500);
  // });

  //Disable xml teplates by Masteruser
  it('Disable XML templates by Masteruser', () => {
    cy.loginToSupportViewMaster(); // Login as a master user
    cy.intercept('GET', '**/group/template/tenant/**').as('apiRequest');

    // Search for Group section
    cy.get('#searchButton>span').click(); // Click on the search button

    // Search for Group by Display Name using the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(1)
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
}); //end describe
