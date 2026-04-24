///<reference types="cypress" />

describe('DH Mass upload', () => {
  // Helper function to parse German date/time format (dd.mm.yyyy hh:mm)
  function parseGermanDateTime(dateTimeStr) {
    const [datePart, timePart] = dateTimeStr.split(' ');
    const [day, month, year] = datePart.split('.').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute);
  }

  let uploadDateTime = ''; // Variable to store upload date & time across tests

  //Uplad pdf - From Mass Upload Button
  it('DH - mass upload', () => {
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

    // Click on Massupload button
    cy.get('#workspace-mass-upload-action')
      .should('be.visible') // Ensure the elements are visible
      .each(($el) => {
        // Iterate through each of the elements
        // Check if the text matches either "Reset password" or "Passwort zurücksetzen"
        if ($el.text().match(/Massensversand|Mass Upload/i)) {
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
          /Choose one ore more documents|Wählen Sie eines oder mehrere Dokumente aus/i,
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

    //Remove all selected company
    cy.get('button[title="Clear"]')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      .wait(1500)
      .click();

    cy.wait(1500);

    //Check validation when no company is selected
    cy.get('.e1sv65i421>span')
      .should('be.visible') // Ensure the elements are visible
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Company field is required|Empfänger-Feld ist obligatorisch/i,
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
        expect(trimmedText).to.match(
          /By using this feature documents will be sent to all active users. Please confirm this procedure.|Durch die Nutzung dieser Funktion werden Dokumente an alle aktiven Benutzer gesendet. Bitte bestätigen Sie dieses Verfahren./i,
        );
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

  //Admin user check Reporting email
  it('Count Users and verified Reporting email', () => {
    // ===== STEP 1: Login to DocumentHub =====
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

    // Check employee count and expand page size if more than 10
    cy.intercept('GET', '**/person/fromGroup/**').as('getEmployeesExpanded');
    cy.get('tbody>tr').then(($rows) => {
      const visibleCount = $rows.length;
      cy.log(`Visible employee rows: ${visibleCount}`);

      if (visibleCount >= 10) {
        // Table may be paginated — select a page size larger than visible count
        const pageSizes = [20, 50, 100];
        const neededSize = pageSizes.find((s) => s > visibleCount) || 100;
        cy.log(
          `More than 10 employees visible — expanding page size to ${neededSize}`,
        );

        cy.get('div[aria-haspopup="listbox"]').last().click({ force: true });
        cy.wait(500);
        cy.get(`li[data-value="${neededSize}"]`).click({ force: true });
        cy.wait('@getEmployeesExpanded', { timeout: 15000 });
        cy.wait(1000);
      } else {
        cy.log(
          `Employee count (${visibleCount}) is 10 or fewer, no expansion needed`,
        );
      }
    });

    cy.pause(); // Pause here to review the counts in the console before assertions

    // Variables to store counts - track users and delivery types
    let activeUsersCount = 0; // Count of users with "Aktiv" status - used for total validation
    let sendToPrintUsersCount = 0; // Count of users with "Druck/Print" delivery type - expected postal deliveries
    let deliveryTypeElectronicalCount = 0; // Count of users with "Elektronisch" delivery type - expected digital deliveries
    let statusInactiveCount = 0; // Count of users with "Inaktiv" status - tracked but not used in validation

    // Iterate through each row to count users and their delivery types
    cy.get('tbody>tr').then(($rows) => {
      const totalRows = $rows.length; // Get total number of rows in the table
      cy.log(`Total Users in table: ${totalRows}`); // Log total rows for debugging

      // Process each row to check status and delivery type
      $rows.each((rowIndex, row) => {
        const $row = Cypress.$(row); // Wrap row in Cypress jQuery object
        const $cells = $row.find('td'); // Get all cells in the current row

        let isActiveUser = false; // Flag to track if current row is an active user
        let hasElektronisch = false; // Flag to track if user has electronic delivery
        let hasDruck = false; // Flag to track if user has print/postal delivery

        // Check all cells in this row to find status and delivery type
        $cells.each((cellIndex, cell) => {
          const cellValue = Cypress.$(cell).text().trim(); // Get cell text and remove whitespace

          // Check if user is Active (German or English)
          if (cellValue === 'Aktiv' || cellValue === 'Active') {
            isActiveUser = true; // Mark user as active
          }

          // Check if user is Inactive (German or English)
          if (cellValue === 'Inaktiv' || cellValue === 'Inactive') {
            statusInactiveCount++; // Increment inactive count
          }

          // Check delivery type - Elektronisch (German or English)
          if (
            cellValue === 'Elektronisch' ||
            cellValue === 'Electronic' ||
            cellValue === 'Digital'
          ) {
            hasElektronisch = true; // Mark user as having electronic delivery
          }

          // Check delivery type - Druck/Print (check for all possible values)
          if (
            cellValue === 'Druck' ||
            cellValue === 'Print' ||
            cellValue === 'Druck/Print'
          ) {
            hasDruck = true; // Mark user as having print/postal delivery
          }
        });

        // Count active users and their delivery types
        if (isActiveUser) {
          activeUsersCount++; // Increment active user count

          // Only count delivery types for active users
          if (hasElektronisch) {
            deliveryTypeElectronicalCount++; // Increment electronic delivery count
          }
          if (hasDruck) {
            sendToPrintUsersCount++; // Increment print/postal delivery count
          }
        }
      });

      // Log summary after processing all rows
      cy.log(`\n========== SUMMARY ==========`);
      // cy.log(`Total cells processed: ${$cells.length}`);
      cy.log(`Active Users Count: ${activeUsersCount}`); // Total active users found in table
      cy.log(`Inactive Users Count: ${statusInactiveCount}`); // Total inactive users found in table
      cy.log(`Elektronisch Delivery Count: ${deliveryTypeElectronicalCount}`); // Expected digital deliveries from table
      cy.log(`Druck/Print Delivery Count: ${sendToPrintUsersCount}`); // Expected postal deliveries from table

      // Validate that required counts are not zero (except inactive can be 0)
      expect(
        activeUsersCount,
        'Active Users count should be greater than 0',
      ).to.be.greaterThan(0);
      expect(
        deliveryTypeElectronicalCount,
        'Elektronisch Delivery count should be greater than 0',
      ).to.be.greaterThan(0);

      // Validate that sum of delivery types matches active users
      const totalDeliveries =
        deliveryTypeElectronicalCount + sendToPrintUsersCount;
      cy.log(
        `Validation: Total deliveries (${totalDeliveries}) should match active users (${activeUsersCount})`,
      );

      // Calculate sendToElChannel INSIDE .then() where counts are valid
      const sendToElChannel = Math.max(
        activeUsersCount - sendToPrintUsersCount,
        0,
      );
      cy.log(`SendToElChannel (digital deliveries): ${sendToElChannel}`);

      // Store counts in Cypress environment variables for later use
      Cypress.env('activeUsers', activeUsersCount);
      Cypress.env('sendToPrintUsers', sendToPrintUsersCount);
      Cypress.env('sendToElChannel', sendToElChannel);
      Cypress.env('deliveryTypeElectronical', deliveryTypeElectronicalCount);
      Cypress.env('inactiveUsers', []);
    });

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
        .should('include.text', 'Versandreport DocuHub Portal');
    }

    // Define email body function
    function emailBody() {
      cy.iframe('#ifmail')
        .find('#mail > div')
        .invoke('text')
        .then((text) => {
          text = text.trim();

          // Read counts from Cypress.env (set inside the counting .then() block)
          const sendToElChannel = Cypress.env('sendToElChannel');
          const sendToPrintUsersCount = Cypress.env('sendToPrintUsers');
          const deliveryTypeElectronicalCount = Cypress.env(
            'deliveryTypeElectronical',
          );

          cy.log(`[emailBody] sendToElChannel: ${sendToElChannel}`);
          cy.log(`[emailBody] sendToPrintUsers: ${sendToPrintUsersCount}`);
          cy.log(
            `[emailBody] deliveryTypeElectronical: ${deliveryTypeElectronicalCount}`,
          );

          const successMessage = `Sie haben ${sendToElChannel} Sendung(en) erfolgreich digital in das e-Gehaltszettel Portal Ihrer Benutzer*innen eingeliefert`;
          const postalMessage = `Zusätzlich haben Sie ${sendToPrintUsersCount} Sendung(en) erfolgreich über den postalischen Weg als Brief versendet. Das Dokument wird von uns über das „Einfach Brief“-Portal gedruckt, kuvertiert und an die Adresse des Benutzers versendet`;

          // Prepare inactive users message if any exist
          let inactiveUsersMessage = '';
          if (Cypress.env('inactiveUsers').length > 0) {
            const inactiveUsersList = Cypress.env('inactiveUsers').join(', ');
            inactiveUsersMessage = `Folgende Personalnummern sind davon betroffen:\nSystem Biller Id: ${Cypress.env(
              'company',
            )}, Personalnummern: ${inactiveUsersList}`;
          }

          // Normalize whitespace for comparison
          const normalizedText = text.replace(/\s+/g, ' ');
          cy.log(`Email Body (normalized): ${normalizedText}`);

          // Extract actual counts from email using regex
          const digitalSuccessMatch = normalizedText.match(
            /Sie haben (\d+) Sendung\(en\) erfolgreich digital/,
          );
          const actualDigitalSuccess = digitalSuccessMatch
            ? parseInt(digitalSuccessMatch[1])
            : 0;

          const postalSuccessMatch = normalizedText.match(
            /Zusätzlich haben Sie (\d+) Sendung\(en\) erfolgreich über den postalischen Weg/,
          );
          const actualPostalSuccess = postalSuccessMatch
            ? parseInt(postalSuccessMatch[1])
            : 0;

          const digitalFailedMatch = normalizedText.match(
            /(\d+) Sendung\(en\) die Sie elektronisch verschicken wollten, konnten nicht zugestellt werden/,
          );
          const actualDigitalFailed = digitalFailedMatch
            ? parseInt(digitalFailedMatch[1])
            : 0;

          const postalFailedMatch = normalizedText.match(
            /(\d+) Sendung\(en\) die Sie postalisch als Brief verschicken wollten/,
          );
          const actualPostalFailed = postalFailedMatch
            ? parseInt(postalFailedMatch[1])
            : 0;

          cy.log(`========== EMAIL COUNTS ==========`);
          cy.log(`Digital Success: ${actualDigitalSuccess}`);
          cy.log(`Postal Success: ${actualPostalSuccess}`);
          cy.log(`Digital Failed: ${actualDigitalFailed}`);
          cy.log(`Postal Failed: ${actualPostalFailed}`);

          // Validate: successful digital deliveries
          // Digital success in email should equal elektronisch count from table
          expect(
            actualDigitalSuccess,
            `Digital success (${actualDigitalSuccess}) should equal Elektronisch count from table (${deliveryTypeElectronicalCount})`,
          ).to.equal(deliveryTypeElectronicalCount);

          // Validate: successful postal deliveries
          // Postal success should be 0 if there were failures, otherwise should match table count
          const expectedPostalSuccess = Math.max(
            sendToPrintUsersCount - actualPostalFailed,
            0,
          );
          expect(
            actualPostalSuccess,
            `Postal success (${actualPostalSuccess}) should be ${expectedPostalSuccess} (table: ${sendToPrintUsersCount}, failed: ${actualPostalFailed})`,
          ).to.equal(expectedPostalSuccess);

          // Log summary for verification
          cy.log(`========== VALIDATION SUMMARY ==========`);
          cy.log(
            `✓ Digital deliveries validated: ${actualDigitalSuccess} successful`,
          );
          cy.log(
            `✓ Postal deliveries validated: ${actualPostalSuccess} successful, ${actualPostalFailed} failed`,
          );
          cy.log(
            `✓ Total attempted deliveries: ${
              actualDigitalSuccess +
              actualPostalSuccess +
              actualDigitalFailed +
              actualPostalFailed
            }`,
          );
        });
    }

    // Validate email subject and body
    emailSubject(0);
    emailBody();
  });
});
