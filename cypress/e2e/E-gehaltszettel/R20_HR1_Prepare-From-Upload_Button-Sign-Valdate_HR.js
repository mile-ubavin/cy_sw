describe('HR1_Prepare-From-Upload_Button-Sign-Valdate_HR', () => {
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

  //Prepare document For Signing - From Upload Button
  it('Prepare document For Signing - From Upload Button', () => {
    cy.loginToSupportViewAdmin();
    cy.wait(1500);

    // remove popup if present
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      }
    });

    cy.get('.upload__document>.mdc-button__label>.upload__document__text')
      .contains(/Upload Personal Document|Personalisierte Dokumente hochladen/i)
      .click();

    cy.wait(3000);

    cy.get('.buttons-wrapper>button')
      .contains(
        /Prepare Document For Signing|Dokument zur Unterzeichnung vorbereiten/i
      )
      .click();

    cy.upload305Dictionary();
    cy.wait(2000);

    cy.get(
      '.mat-mdc-text-field-wrapper>div>.mat-mdc-form-field-infix>mat-select[aria-haspopup="listbox"]'
    ).click();

    cy.get('div[role="listbox"]>.mdc-list-item>.mdc-list-item__primary-text')
      .contains('PDFTABDictionary-305')
      .click();

    //Click on dropdown button
    cy.get(
      '.mat-mdc-text-field-wrapper>div>.mat-mdc-form-field-infix>mat-select[aria-haspopup="listbox"]'
    ).click();
    cy.wait(2500);

    // Find the dropdown item and check if it's selected
    cy.get('div[role="listbox"]>.mdc-list-item>.mdc-list-item__primary-text')
      .contains('PDFTABDictionary-305') // Find the dropdown item directly by its text
      .then(($el) => {
        // Navigate to the parent element to locate the checkbox state indicator
        cy.wrap($el)

          .should('exist')
          .click(); // Ensure the checkbox exists
      });
    cy.wait(3500);

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

    //Add Signee name
    const signee = `HR Document - ${uploadDateTime} for Test Signee`;

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
        screenX: 1080,
        screenY: 430,
        clientX: 1080,
        clientY: 430,
        pageX: 1080,
        pageY: 430,
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
      .contains(/Send|Senden/i)
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

    // Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url'
    cy.log('Test completed successfully.');
    cy.wait(2500);
  });

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
