describe('HR2_Prepare-From_Delivery_To_Specific_User-Sign-Validate_HR', () => {
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

  //Prepare document For Signing - From Send Delivery to specific user
  it('Send Delivery to specific user', () => {
    cy.loginToSupportViewAdmin(); // Login as a master user
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

    // Search for Group section
    cy.get('#searchButton>span').click(); // Click on the search button

    // Search for Group by Display Name using the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(0)
      .type(Cypress.env('company')); // Use the company name from the cypress.config.js
    cy.wait(1500);

    // Find and click the search button
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(2500);

    // Click the "User" button within the action buttons
    cy.get('.action-buttons > button > .mdc-button__label')
      .last() // Select the last matched element
      .click(); // Click the matched "User" button
    cy.wait(2500);

    //Click on Select users to deliver documents button
    cy.get('.button-wraper>button>.mdc-button__label')
      .contains(
        /Select users to deliver documents|Benutzer für die Zustellung von Dokumenten auswählen/i
      )
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    // Search for the specific user by name
    cy.get('.dictionary-xml__search-container-input>input').type(
      Cypress.env('username_egEbox')
    );
    cy.wait(3500);

    // Find and check the checkbox in the row if it's not already checked
    cy.get('input[type="checkbox"]').eq(1).click();

    cy.wait(2500);
    //Click on Next buton
    cy.get('button>.title')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Next' || text === 'Nächste';
      })
      .click();
    cy.wait(1500);

    //Click on Prepare Document For Signing
    cy.get('.buttons-wrapper>button')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return (
          text === 'Prepare Document For Signing' ||
          text === 'Dokument zur Unterzeichnung vorbereiten'
        );
      })
      .then(($button) => {
        // Add red border to the button for visibility
        cy.wrap($button).invoke('css', 'border', '2px solid blue');

        // Wait for 3 seconds
        cy.wait(3000);

        // Click the button
        cy.wrap($button).click();
      });

    //Uplad valid document (x1 A4 pdf file)
    cy.massUpload();
    cy.wait(2000);
    //Add Title
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

    cy.wait(2500);
    //Add Delivery Title
    const title = `HR Delivery For Specific User (pdf) - ${uploadDateTime}`;

    cy.get('input[formcontrolname="subject"]').clear().type(title);
    cy.wait(1500);
    //Open init session
    cy.intercept('GET', '**/assets/maintanance-config/**').as('initSession');
    //Click on Open Hybridsign button
    cy.get('.controls > .ng-star-inserted')
      .contains(/Hybridsign|Senden /i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    cy.wait(['@initSession'], {
      timeout: 27000,
    }).then((interception) => {
      // Assert the response status code
      expect(interception.response.statusCode).to.eq(200);
    });

    //Prepare doc for signing
    cy.wait(2500);
    cy.get('.signatures-container>.signature-actions>a').click({
      force: true,
    }); //open add new signature dialog
    cy.wait(2000);

    //Add Signee name
    const signee = `HR Document Created - ${uploadDateTime}, for Test Signee`;

    cy.get('input[formcontrolname="signee"]').clear().type(signee); // Enter signee name
    cy.wait(2500);

    //Confirm Signee name
    cy.get('.mat-mdc-dialog-actions>button>.mdc-button__label')
      .contains(/NEXT|WEITER/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(4500);

    //Change position of siganture dialog
    cy.get('.signature-methods')
      .trigger('mouseover')
      .trigger('mousedown', { which: 1, eventConstructor: 'MouseEvent' })
      .trigger('mousemove', {
        which: 1,
        screenX: 750,
        screenY: 800,
        clientX: 750,
        clientY: 800,
        pageX: 750,
        pageY: 800,
        eventConstructor: 'MouseEvent',
      })
      .trigger('mouseup', { force: true });
    cy.get(
      '.placer-actions > .mat-accent > .mat-mdc-button-touch-target'
    ).click({
      force: true,
    });
    cy.wait(2500);

    //
    cy.intercept(
      'POST',
      '**/deliveryHandler/checkDocumentProcessingStatus**'
    ).as('checkDocumentProcessingStatus');

    //Click on Finalize button   Abschließen
    cy.get('.tempSave>.mdc-button__label')
      .contains(/Finalize|Abschließen/i)
      .click({ force: true }); // Click the button

    // cy.get('.tempSave').click({ force: true });

    cy.wait(['@checkDocumentProcessingStatus'], { timeout: 37000 }).then(
      (interception) => {
        // Log the intercepted response
        cy.log('Intercepted response:', interception.response);

        // Assert the response status code
        expect(interception.response.statusCode).to.eq(200);
      }
    );

    cy.wait(6000);

    cy.get('.dialog-footer>.dialog-actions>button>.title')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Send' || text === 'Senden';
      })
      .click();
    cy.wait(3000);

    cy.get(
      '.mat-mdc-dialog-component-host>.dialog-container>.dialog-footer>.controls>button>.title'
    )
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Confirm' || text === 'Bestätigen';
      })
      .click({ force: true });
    cy.wait(3000);

    // Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url'
    cy.log('Test completed successfully.');
    cy.wait(2500);
  }); //end it

  //Sign HR Delivery
  it('Sign HR Delivery - From E-Box', () => {
    cy.loginToEgEbox();
    cy.wait(2500);

    // Reuse existing uploadDateTime (from previous test) if needed
    const existingUploadDateTime = Cypress.env('uploadDateTime') || '';
    cy.log(`Existing Upload DateTime: ${existingUploadDateTime}`);

    // Assert that the unsigned icon is visible
    cy.get('app-deliveries-signature-actions > .unsigned')
      .first()
      .should('be.visible')
      .then(($icon) => {
        cy.wrap($icon).invoke('css', 'border', '3px solid green');
        cy.log(
          'Validation passed: Unsigned icon is visible and marked in green.'
        );
      });

    cy.wait(3500);

    // Open latest created delivery
    cy.intercept(
      'GET',
      '**/hybridsign/backend_t/document/v1/getDocument/**'
    ).as('getDocument');
    cy.intercept('GET', '**/getIdentifications?**').as('getIdentifications');

    cy.get('.mdc-data-table__content>tr>.subject-sender-cell')
      .eq(0)
      .click({ force: true });

    cy.wait('@getIdentifications', { timeout: 57000 }).then((interception) => {
      cy.log('Intercepted response:', interception.response);
      expect(interception.response.statusCode).to.eq(200);
    });

    // Scroll to bottom of the PDF viewer
    cy.get('.content-container>.scroll-container')
      .eq(1)
      .scrollTo('bottom', { duration: 500, ensureScrollable: false });

    cy.wait(3500);

    // Loop through all signature buttons
    cy.get('.touch-signature-button').each(($button, index, $list) => {
      cy.wrap($button).click({ force: true });

      // Simulate signing on the canvas
      cy.get('.sign-canvas')
        .trigger('mouseover')
        .trigger('mousedown', { which: 1, eventConstructor: 'MouseEvent' })
        .trigger('mousemove', {
          which: 1,
          screenX: 410,
          screenY: 530,
          clientX: 530,
          clientY: 560,
          pageX: 500,
          pageY: 600,
          eventConstructor: 'MouseEvent',
        })
        .trigger('mouseup', { force: true });

      cy.wait(2000);

      // Confirm the signature
      cy.get(
        '.mat-sign-actions-desktop > .mat-accent > .mat-mdc-button-touch-target'
      ).click({ force: true });

      cy.wait(7000);

      cy.log(`Signature ${index + 1} of ${$list.length} completed.`);
    });

    // Save only if enabled
    cy.get('.save > .mdc-button__label').then(($button) => {
      if (!$button.is(':disabled')) {
        cy.log('All signatures are signed, clicking Save.');
        cy.wait(1500);
        cy.wrap($button).click({ force: true });
        cy.wait(4500);

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
        cy.log(`Updated Upload DateTime after signing: ${newUploadDateTime}`);
      } else {
        cy.log('Save button is disabled. Ensure all signatures are signed.');
      }
    });

    cy.wait(4500);

    // Assert signed icon is visible
    cy.get('app-deliveries-signature-actions > .signed')
      .first()
      .should('be.visible')
      .then(($icon) => {
        cy.wrap($icon).invoke('css', 'border', '3px solid green');
        cy.log(
          'Validation passed: Signed icon is visible and marked in green.'
        );
      });

    cy.wait(3500);

    // Logout
    cy.get('.user-title').click();
    cy.wait(1500);
    cy.get('.logout-title > a').click();
    cy.url().should('include', Cypress.env('baseUrl_egEbox'));

    cy.log('Test completed successfully.');
  });

  // HR Admin validates delivery date/time in HR page, and check if matches signed time from E-Box
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
        const uploadedTime = parseDateTime(normalizedUpload); // SupportView timezone
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
  it('Yopmail - Get Reporting email and clear inbox', () => {
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
