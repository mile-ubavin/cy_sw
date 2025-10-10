describe('HR prepare_Document_For_Signing_From_Mass_Upload', () => {
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

  //Prepare document For Signing - From Mass Upload button
  it('HR Admin can Upload Document From Mass Upload button', () => {
    cy.fixture('supportView.json').as('payslipSW');
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

    //Click On Mass Upload Button
    cy.get('.upload__document>.mdc-button__label>.upload__document__text')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Mass Upload' || text === 'Massensendung hochladen';
      })
      .click();

    //Click on Upload Document button if button is visible (When MCA have HR role anabled in min one group)
    cy.get('body').then(($body) => {
      if ($body.find('.buttons-wrapper>button').length > 0) {
        cy.get('.buttons-wrapper>button')
          .filter((index, el) => {
            const text = Cypress.$(el).text().trim();
            return (
              text === 'Prepare Document For Signing' ||
              text === 'Dokument zur Unterzeichnung vorbereiten'
            );
          })
          .click();
        cy.wait(1500);
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(1500);

    //Click on Mass Upload Document button if button is visible (When MCA does not have HR role enable)
    cy.get('body').then(($body) => {
      if ($body.find('.buttons-wrapper>button').length > 0) {
        cy.get('.buttons-wrapper>button')
          .filter((index, el) => {
            const text = Cypress.$(el).text().trim();
            return text === 'Mass Upload' || text === 'Massensendung hochladen';
          })
          .click();
        cy.wait(1500);
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(1500);

    // Upload valid document (1 A4 pdf file)
    cy.massUpload();
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

    // Add Delivery Title
    const title = `HR Document From MassUpload (pdf) - ${uploadDateTime}`;
    cy.log(`Title for the document: ${title}`); // Log the title to check

    cy.get('input[formcontrolname="subject"]').clear().type(title);
    cy.wait(1500);

    // Select Company
    cy.get('.broadcast-companies').click();
    cy.wait(1000);
    cy.get('mat-option[role="option"]>.mdc-list-item__primary-text').click({
      multiple: true,
    });
    cy.wait(1500);
    const toCompanies = ['AQUA GmbH - AQUA'];
    cy.get('mat-option[role="option"]>.mdc-list-item__primary-text')
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

    // Wait for the deselection process to complete
    cy.wait(1000);
    // Focus out
    cy.get('body').type('{esc}');
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
      timeout: 57000,
    }).then((interception) => {
      // Assert the response status code
      expect(interception.response.statusCode).to.eq(200);
    });

    //Prepare doc for signing
    cy.get('.controls > .ng-star-inserted').click({ force: true });
    cy.wait(4500);
    cy.get('.signatures-container>.signature-actions>a').click({
      force: true,
    }); //open add new signature dialog
    cy.wait(2000);
    cy.get('input[formcontrolname="signee"]')
      .clear()
      .type('HR Document Signature 1 - Change position of signature dialog'); //Clear Input field & Enter signee name
    //Confirm Signee name

    cy.get('.mat-mdc-dialog-actions>button>.mdc-button__label')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'NEXT' || text === 'WEITER';
      })
      .click({ multiple: true, force: true });
    cy.wait(1500);

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

  //Admin user check Reporting email
  it.skip('Count Users and verified Reporting email', () => {
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

    // Switch to User page
    cy.get('.action-buttons>button>.mdc-button__label')
      .filter((index, button) => {
        const buttonText = Cypress.$(button).text().trim();
        return buttonText === 'User' || buttonText === 'Benutzer';
      })
      .click();

    cy.wait(2500);

    // Variables to store counts and inactive user account numbers
    let activeUsersCount = 0;
    let sendToPrintUsersCount = 0;
    let inactiveUsers = [];

    // Count Active Users & Get Inactive Users' Account Numbers
    cy.get('.cdk-column-active>.cell-content-wrap>div>div>div')
      .each(($el, index) => {
        const isActive = ['Yes', 'Ja'].includes($el.text().trim());

        if (isActive) {
          activeUsersCount++;
        } else {
          // Get AccountNumber of inactive user
          cy.get('.cdk-column-accountNumbers>.cell-content-wrap>div>div')
            .eq(index)
            .invoke('text')
            .then((accountNumber) => {
              inactiveUsers.push(accountNumber.trim());
            });
        }
      })
      .then(() => {
        Cypress.env('activeUsers', activeUsersCount);
        Cypress.env('inactiveUsers', inactiveUsers);
        cy.log(`Active Users Count: ${activeUsersCount}`);
        cy.log(`Inactive Users: ${JSON.stringify(inactiveUsers)}`);
      });

    // Count SendToPrint Users (Ignoring 'Yes' for SendToPrintChannel)
    cy.get('.cdk-column-sendToPrint>.cell-content-wrap>div>div>div')
      .each(($el) => {
        const sendToPrintText = $el.text().trim();
        if (sendToPrintText === 'Yes' || sendToPrintText === 'Ja') {
          // Correct comparison
          sendToPrintUsersCount++;
        }
      })
      .then(() => {
        Cypress.env('sendToPrintUsers', sendToPrintUsersCount);
        cy.log(`SendToPrint Users Count: ${sendToPrintUsersCount}`);

        // Calculate sendToElChannel but exclude users where sendToPrint is 'Yes' or 'Ja'
        const sendToElChannel = Math.max(
          activeUsersCount - sendToPrintUsersCount,
          0
        );
        cy.log(
          `SendToElChannel (excluding SendToPrint=YES/JA): ${sendToElChannel}`
        );
        cy.wait(2000);

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
                const inactiveUsersList =
                  Cypress.env('inactiveUsers').join(', ');
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

              // Log to console for debugging
              cy.log(`Email Content: ${text}`);
              if (inactiveUsersMessage) {
                cy.log(`Inactive Users Info Added: ${inactiveUsersMessage}`);
              }
            });
        }

        // Validate email subject and body
        emailSubject(0);
        emailBody();
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
