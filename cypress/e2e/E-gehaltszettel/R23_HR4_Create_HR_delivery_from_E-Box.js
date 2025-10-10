describe('HR4_Create_HR_delivery_from_E-Box', () => {
  let uploadDateTime; // shared across tests

  before(() => {
    // prepare document and capture uploadDateTime
    const now = new Date();
    const formattedDate = now.toLocaleDateString('de-DE');
    const formattedTime = now.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    uploadDateTime = `${formattedDate} ${formattedTime}`;
    Cypress.env('uploadDateTime', uploadDateTime);
  });

  //Crete HR delivery from E-Box
  it('crete HR delivery from E-Box', () => {
    cy.loginToEgEbox();
    cy.wait(2500);

    cy.url().should('include', '/deliveries'); // => validate url
    // Wait for login to complete
    cy.wait(2000);
    // Check visibility of Upload Delivery button - Button should be hidden
    cy.get('#toolbar-toggle_upload')
      .invoke('css', 'border', '3px solid green')
      .should('be.visible');
    cy.wait(500);

    // Create Upload Delivery
    cy.get('#toolbar-toggle_upload').click();
    cy.upload_attachment(); // Upload PDF documents from fixtures folder - custom command
    cy.wait(2000);

    // Capture the current date and time in the specified format
    const now = new Date();
    const formattedDate = now.toLocaleDateString('de-DE'); // Format as dd.mm.yyyy
    const formattedTime = now.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    uploadDateTime = `${formattedDate} ${formattedTime}`;
    cy.log(`Upload DateTime: ${uploadDateTime}`);

    const title = `HR Delivery Created from E-Box - ${uploadDateTime}`; // Use formatted date and time in title
    cy.get('input[name="deliveryTitle"]').type(title);
    cy.wait(2000);

    //Select Cpmpany from the Dropdown
    cy.get('mat-select[formcontrolname="companies"]').click();

    const toCompanies = ['AQUA GmbH'];
    cy.get('div[role="listbox"]>mat-option>.mdc-list-item__primary-text')
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
    cy.wait(2000);

    //Click on Send button
    cy.get('button[type="submit"]')
      .contains(/Send|Speichern/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click({ force: true });
    cy.wait(3000);

    // Logout
    cy.get('.user-title').click();
    cy.wait(1500);
    cy.get('.logout-title > a').click();
    cy.url().should('include', Cypress.env('baseUrl_egEbox')); // Validate url
    cy.log('Test completed successfully.');
  });

  // Admin validates delivery date/time in HR page matches signed time from E-Box
  it('Admin validates delivery date/time in HR page matches signed time from E-Box', () => {
    // Step 1: Login as SupportView Admin
    cy.loginToSupportViewAdmin();
    cy.wait(1500);

    // Step 2: Get the stored uploadDateTime from E-Box signing test
    const uploadDateTime = Cypress.env('uploadDateTime');
    expect(uploadDateTime, 'Upload DateTime must exist').to.not.be.empty;
    cy.log(`Comparing with Upload DateTime: ${uploadDateTime}`);

    // Step 3: Navigate to HR page (Received Shipments)
    cy.contains(
      '.side-menu>ul>navigation-item>.navigation-item>a',
      /Erhaltene Sendungen|Received Shipments/
    )
      .should('be.visible') // HR page link must be visible
      .click(); // Open the page

    cy.wait(2000);

    // Step 4: Open search dialog
    cy.get('#searchButton>span').click();

    // Step 5: Enter Account Number of user who received HR delivery
    cy.get('input[name="accountNumber"]').type(
      Cypress.env('accountNumber_egEbox')
    );

    // Step 6: Enter Company Name from config
    cy.get('input[name="companyName"]').type(Cypress.env('company'));

    // Step 7: Execute the search
    cy.get('button[color="primary"]').click();
    cy.wait(2000);

    // Step 8: Extract DateTime (Datum column from first row of results)
    cy.get('.cdk-column-userDataUpdateDate>div>div>div')
      .should('not.be.empty') // Must not be empty
      .invoke('text')
      .then((docText) => {
        cy.log(`Extracted DateTime from SupportView: ${docText}`);

        // Step 9: Normalize helper (remove commas/spaces)
        const normalize = (val) => val.replace(',', ' ').trim();

        // Step 10: Parse date string (dd.mm.yyyy HH:mm:ss → Date object, +2h)
        const parseDateTime = (dateTimeStr) => {
          const [datePart, timePart] = dateTimeStr.split(' ');
          const [day, month, year] = datePart.split('.').map(Number);
          const [hour, minute] = timePart.split(':').map(Number);

          // Add +2h to match expected local time
          return new Date(year, month - 1, day, hour + 2, minute || 0);
        };

        // Step 11: Normalize both timestamps (E-Box & SupportView)
        const normalizedUpload = normalize(uploadDateTime);
        const normalizedDoc = normalize(docText);

        // Step 12: Convert both into Date objects
        const uploadedTime = parseDateTime(normalizedUpload);
        const extractedTime = parseDateTime(normalizedDoc);

        // Step 13: Allow time drift of up to +1 min
        const minAllowedTime = new Date(uploadedTime);
        const maxAllowedTime = new Date(uploadedTime);
        maxAllowedTime.setMinutes(uploadedTime.getMinutes() + 1);

        // Step 14: Assert SupportView time is >= E-Box upload time
        expect(
          extractedTime,
          'Extracted SupportView time should be >= upload time'
        ).to.be.at.least(minAllowedTime);

        // Step 15: Assert SupportView time is <= E-Box upload time + 1 min
        expect(
          extractedTime,
          'Extracted SupportView time should be <= upload time + 1 min'
        ).to.be.at.most(maxAllowedTime);

        // Step 16: Log success validation
        cy.log(
          `SupportView DateTime (${normalizedDoc}) is within 1 min of UploadDateTime (${normalizedUpload}).`
        );

        // // Step 17: Click on magic link button
        // cy.wait(3000);
        // cy.get('.action-buttons>button>.mdc-button__label')
        //   .parent()
        //   // .invoke('removeAttr', 'target') // Remove target="_blank"
        //   .click({ force: true });

        // // Step 18:  Prevent opening (e-Box) in new tab
        // cy.intercept('POST', '/supportView/v1/person/magicLink/createByGroup', {
        //   statusCode: 200,
        // }).as('magicLinkRequest');
        // cy.window().then((win) => {
        //   cy.stub(win, 'open')
        //     .callsFake((url) => {
        //       // Simulate navigation in the same tab by changing the window location
        //       win.location.href = url;
        //     })
        //     .as('windowOpen');
        // });

        cy.wait(4000);
      });
  });

  //Admin user check Reporting email and clear inbox
  it.skip('Yopmail - Get Reporting email and clear inbox', () => {
    // Visit Yopmail
    cy.visit('https://yopmail.com/en/');

    const user = Cypress.env('email_supportViewAdmin');

    // Enter the support admin email
    cy.get('#login').type(`${user}`);

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

    // Access the inbox iframe
    cy.get('iframe#ifinbox').then(($iframe) => {
      const $body = $iframe.contents().find('body');

      // Wrap iframe body for Cypress commands
      cy.wrap($body).then(($inbox) => {
        if ($inbox.find('.mctn .lm').length === 0) {
          // No emails → skip delete
          cy.log(`Inbox for ${user} is empty. Skipping delete.`);
        } else {
          // Emails exist → check delete button in main page
          cy.get('#delall').then(($btn) => {
            if (!$btn.is(':disabled')) {
              cy.wrap($btn).click({ force: true });
              cy.log(`All emails deleted for ${user}`);
            } else {
              cy.log(`Delete button disabled for ${user}`);
            }
          });
        }
      });
    });
  });
}); //end describe
