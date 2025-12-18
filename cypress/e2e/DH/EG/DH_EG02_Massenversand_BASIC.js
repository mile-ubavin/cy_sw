///<reference types="cypress" />

describe('DH Mass upload', () => {
  //Uplad pdf - From Mass Upload Button
  it('DH - mass upload', () => {
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
    cy.get('nav ul li div span')
      .should('be.visible') // Ensure the elements are visible
      .each(($el) => {
        // Iterate through each of the elements
        // Check if the text matches either "Reset password" or "Passwort zurücksetzen"
        if ($el.text().match(/Arbeitsbereich|Arbeitsbereich/i)) {
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

    cy.wait(1500);

    // Click on Massupload button
    cy.get('#send-action-cards-grid > div > div')
      .should('be.visible') // Ensure the elements are visible
      .each(($el) => {
        // Iterate through each of the elements
        // Check if the text matches either "Reset password" or "Passwort zurücksetzen"
        if ($el.text().match(/Massensversand|Massupload/i)) {
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

    //Check dialog title
    cy.get('main>header>h1')
      .should('be.visible')
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(/Massensversand|Mass Upload/i);
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
          /Nur .pdf bis zu 13 Seiten beim Druck zulässig|Nur .pdf bis zu 13 Seiten beim Druck zulässig/i
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
          /Only pdf files are supported|Es werden nur PDF-Dateien unterstützt/i
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
          /Subject is required|Betreff-Feld ist obligatorisch/i
        );
      });

    cy.wait(1500);

    // Add Delivery Title/Subject
    const title = `Document From MassUpload (pdf) - ${uploadDateTime}`;
    cy.log(`Title for the document: ${title}`); // Log the title to check

    cy.get('input[placeholder="Enter the subject"]').clear().type(title);
    cy.wait(1500);

    // Open Company dropdown
    cy.get('button[title="Open"]').click({ force: true });
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

          // Find and check the checkbox within this option
          cy.wrap($option)
            .find('input[type="checkbox"], span[role="checkbox"]') // Locate checkbox element
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

    //Remove selected company
    cy.get('button[variant="basic"]')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      .wait(1500)
      .click();

    cy.wait(1500);

    //Check validation when no company is selected
    cy.get('.e1ogpr0j4>span')
      .should('be.visible') // Ensure the elements are visible
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Empfänger-Feld ist obligatorisch|Empfänger-Feld ist obligatorisch/i
        );
      });

    cy.wait(1500);

    // Open Company dropdown
    cy.get('button[title="Open"]').click({ force: true });
    cy.wait(1000);

    // Re-select the same company
    cy.get('[role="listbox"], [role="menu"], ul[role="presentation"]')
      .should('be.visible')
      .find('li, [role="option"]')
      .each(($option) => {
        const text = $option.text().trim();

        if (toCompanies.includes(text)) {
          cy.log(`Re-adding company: ${text}`);

          cy.wrap($option)
            .find('input[type="checkbox"], span[role="checkbox"]')
            .then(($checkbox) => {
              if ($checkbox.length > 0) {
                const isChecked =
                  $checkbox.is(':checked') ||
                  $checkbox.attr('aria-checked') === 'true' ||
                  $checkbox.attr('data-checked') === 'true';

                if (!isChecked) {
                  cy.wrap($checkbox).click({ force: true });
                  cy.log(`Checkbox for "${text}" re-enabled`);
                } else {
                  cy.log(`ℹCheckbox for "${text}" already enabled`);
                }
              } else {
                cy.wrap($option).click({ force: true });
                cy.log(`Option "${text}" re-clicked`);
              }
            });
        }
      });

    // Close dropdown by pressing ESC key
    cy.get('body').type('{esc}'); // Send ESC key to body to close dropdown
    cy.wait(500); // Wait for dropdown to close

    cy.log(`Upload DateTime to verify: ${uploadDateTime}`);

    //Click on Weiter button
    cy.get('button[aria-label="Weiter zum nächsten Schritt"]')
      .should('be.enabled')
      .click();

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
      '**/hybridsign/backend_t/document/v1/getDocument/**'
    ).as('getDocument');
    cy.intercept('GET', '**/getIdentifications?**').as('getIdentifications');

    cy.get('.mdc-data-table__content>tr>.subject-sender-cell')
      .eq(0)
      .click({ force: true });

    cy.wait(['@getIdentifications'], { timeout: 57000 }).then(
      (interception) => {
        cy.log('Intercepted response:', interception.response);
        expect(interception.response.statusCode).to.eq(200);
      }
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

  //Admin user check Reporting email
  it('Count Users and verified Reporting email', () => {
    // Visit DH
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
    cy.wait(500);

    // Variables to store counts - track users and delivery types
    let activeUsersCount = 0; // Count of users with "Aktiv" status
    let sendToPrintUsersCount = 0; // Count of users with "Druck/Print" delivery type
    let deliveryTypeElectronicalCount = 0; // Count of users with "Elektronisch" delivery type
    let statusInactiveCount = 0; // Count of users with "Inaktiv" status (can be 0)

    // Iterate through each row to count users and their delivery types
    cy.get('tbody>tr').then(($rows) => {
      const totalRows = $rows.length;
      cy.log(`Total Users in table: ${totalRows}`);

      // Process each row to check status and delivery type
      $rows.each((rowIndex, row) => {
        const $row = Cypress.$(row);
        const $cells = $row.find('td');

        let isActiveUser = false;
        let hasElektronisch = false;
        let hasDruck = false;

        // Check all cells in this row
        $cells.each((cellIndex, cell) => {
          const cellValue = Cypress.$(cell).text().trim();

          // Check if user is Active
          if (cellValue === 'Aktiv' || cellValue === 'Active') {
            isActiveUser = true;
          }

          // Check if user is Inactive
          if (cellValue === 'Inaktiv' || cellValue === 'Inactive') {
            statusInactiveCount++;
          }

          // Check delivery type - Elektronisch
          if (cellValue === 'Elektronisch' || cellValue === 'Electronic') {
            hasElektronisch = true;
          }

          // Check delivery type - Druck/Print (check for all possible values)
          if (
            cellValue === 'Druck' ||
            cellValue === 'Print' ||
            cellValue === 'Druck/Print'
          ) {
            hasDruck = true;
          }
        });

        // Count active users
        if (isActiveUser) {
          activeUsersCount++;

          // Only count delivery types for active users
          if (hasElektronisch) {
            deliveryTypeElectronicalCount++;
          }
          if (hasDruck) {
            sendToPrintUsersCount++;
          }
        }
      });

      // Log summary after processing all cells
      cy.log(`\n========== SUMMARY ==========`);
      // cy.log(`Total cells processed: ${$cells.length}`);
      cy.log(`Active Users Count: ${activeUsersCount}`);
      cy.log(`Inactive Users Count: ${statusInactiveCount}`);
      cy.log(`Elektronisch Delivery Count: ${deliveryTypeElectronicalCount}`);
      cy.log(`Druck/Print Delivery Count: ${sendToPrintUsersCount}`);

      // Validate that required counts are not zero (except inactive can be 0)
      expect(
        activeUsersCount,
        'Active Users count should be greater than 0'
      ).to.be.greaterThan(0);
      expect(
        deliveryTypeElectronicalCount,
        'Elektronisch Delivery count should be greater than 0'
      ).to.be.greaterThan(0);

      // Validate that sum of delivery types matches active users
      const totalDeliveries =
        deliveryTypeElectronicalCount + sendToPrintUsersCount;
      cy.log(
        `Validation: Total deliveries (${totalDeliveries}) should match active users (${activeUsersCount})`
      );

      // Store counts in Cypress environment variables for later use
      Cypress.env('activeUsers', activeUsersCount);
      Cypress.env('sendToPrintUsers', sendToPrintUsersCount);
      Cypress.env('inactiveUsers', []);
    });

    // Calculate sendToElChannel - electronic deliveries excluding print
    // This represents users who will receive documents digitally
    const sendToElChannel = Math.max(
      activeUsersCount - sendToPrintUsersCount,
      0
    );
    cy.log(`SendToElChannel (digital deliveries): ${sendToElChannel}`);

    // Visit Yopmail
    cy.visit('https://yopmail.com/en/');

    // Enter the support admin email
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));

    // Click the refresh button
    cy.get('#refreshbut > .md > .material-icons-outlined').click();

    // Wait for email to load
    cy.wait(4500);

    // Define email subject function
    function emailSubject(index) {
      cy.iframe('#ifinbox')
        .find('.mctn > .m > button > .lms')
        .eq(index)
        .should('include.text', 'Versandreport e-Gehaltszettel Portal');
    }

    // Define email body function
    function emailBody() {
      cy.iframe('#ifmail')
        .find('#mail > div')
        .invoke('text')
        .then((text) => {
          text = text.trim();

          const successMessage = `Sie haben ${sendToElChannel} Sendung(en) erfolgreich digital in das e-Gehaltszettel Portal Ihrer Benutzer*innen eingeliefert`;
          const postalMessage = `Zusätzlich haben Sie ${sendToPrintUsersCount} Sendung(en) erfolgreich über den postalischen Weg als Brief versendet. Das Dokument wird von uns über das „Einfach Brief“-Portal gedruckt, kuvertiert und an die Adresse des Benutzers versendet`;

          // Prepare inactive users message if any exist
          let inactiveUsersMessage = '';
          if (Cypress.env('inactiveUsers').length > 0) {
            const inactiveUsersList = Cypress.env('inactiveUsers').join(', ');
            inactiveUsersMessage = `Folgende Personalnummern sind davon betroffen:\nSystem Biller Id: ${Cypress.env(
              'company'
            )}, Personalnummern: ${inactiveUsersList}`;
          }

          // Assert email contains either success message, postal message, or inactive users info
          expect(
            text.includes(successMessage) ||
              text.includes(postalMessage) ||
              text.includes(inactiveUsersMessage)
          ).to.be.true;

          // Validate electronic delivery count in email
          if (sendToElChannel > 0) {
            expect(text).to.include(
              `${sendToElChannel} Sendung(en) erfolgreich digital`
            );
            cy.log(
              `Validated ${sendToElChannel} electronic deliveries in email`
            );
          }

          // Validate postal delivery count in email
          if (sendToPrintUsersCount > 0) {
            expect(text).to.include(
              `${sendToPrintUsersCount} Sendung(en) erfolgreich über den postalischen Weg`
            );
            cy.log(
              `Validated ${sendToPrintUsersCount} postal deliveries in email`
            );
          }

          // Log email content for debugging
          cy.log(`Email Content: ${text}`);
          if (inactiveUsersMessage) {
            cy.log(`Inactive Users Info: ${inactiveUsersMessage}`);
          }

          cy.log(`Email content validation passed`);
        });
    }

    // Validate email subject and body
    emailSubject(0);
    emailBody();
  });
});
