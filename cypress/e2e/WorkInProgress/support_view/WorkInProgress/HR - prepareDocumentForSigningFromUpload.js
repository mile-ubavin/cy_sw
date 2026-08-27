describe('hrManagement - prepare doc for signing (HappyPath)', () => {
  // Admin User has check New Delivery In HR Pag
  function checkNewDeliveryInHrPage() {
    const collectedLinkTexts = []; // Array to store all link texts

    cy.get('.side-menu>ul>navigation-item>.navigation-item>a')
      .find('.user-label-wrap')
      .each(($el) => {
        cy.wrap($el)
          .invoke('text')
          .then((text) => {
            collectedLinkTexts.push(text.trim()); // Collect each link text in the array
            cy.log('Collected Link Text:', text.trim());
          });
      })
      .wait(2500)
      .then(() => {
        // After collecting all link texts, perform a single check
        const hasAccessToHRPage = collectedLinkTexts.some((text) =>
          ['Erhaltene Sendungen', 'Received Shipments'].includes(text)
        );
        //Check if Admin has access to HR page in SW
        if (hasAccessToHRPage) {
          // Find the specific elements and check their visibility
          cy.get('.side-menu>ul>navigation-item>.navigation-item>a')
            .contains(/Erhaltene Sendungen|Received Shipments/)
            .should('be.visible')
            .click();
          cy.log('Confirmed: HR page link is visible to the Admin.'); // Log if HR page access is detected
          cy.wait(2500);
        } else {
          // Verify that elements with specified texts are not visible
          cy.get('.side-menu>ul>navigation-item>.navigation-item>a')
            .contains(/Erhaltene Sendungen|Received Shipments/)
            .should('not.exist');
          cy.log('Confirmed: HR page link is not visible to the Admin.'); // Log if HR page access is not detected
          cy.wait(2500);
        }
      });
  }

  // Admin User Check New Delivery Received In HR page
  function adminUserChecksNewDeliveryReceivedInHRpage() {
    // cy.fixture('supportView.json').as('payslipSW');
    // cy.get('@payslipSW').then((payslipJson) => {
    //   cy.visit(payslipJson.baseUrl); // Visit base URL from fixture
    //   cy.url().should('include', payslipJson.baseUrl); // Validate the URL

    cy.fixture('supportView.json').as('payslipSW');
    // cy.get('@payslipSW').then((payslipJson) => {
    //   cy.visit(payslipJson.baseUrl); // Visit base URL from fixture
    //   cy.url().should('include', payslipJson.baseUrl); // Validate the URL
    cy.get('@payslipSW').then((payslipJson) => {
      cy.loginToSupportViewAdmin();
      cy.wait(1500);

      //Switch to HR page
      checkNewDeliveryInHrPage();

      // Validate latest HR delivery
      cy.log('Checking for the latest HR delivery received date for AQUA GmbH');

      // Find the row with Company Name "AQUA GmbH" and get the corresponding Datum
      cy.get('cdk-table>cdk-row').each(($row) => {
        cy.wrap($row)
          .find('.cdk-column-companyName')
          .invoke('text')
          .then((companyName) => {
            if (companyName.trim() === 'AQUA GmbH') {
              // If companyName matches, get the date from the corresponding Datum cell
              cy.wrap($row)

                .find(
                  '.cdk-column-userDataUpdateDate .cell-content-wrap .inline-div > div'
                )

                .invoke('text')
                .then((receivedDateText) => {
                  // Log original received date text
                  cy.log(`Original Received Date Text: ${receivedDateText}`);

                  // Extract date and time parts
                  const datePart = receivedDateText.trim().split(' ')[0]; // "dd.mm.yyyy"
                  const timePart = receivedDateText
                    .trim()
                    .split(' ')[1]
                    .slice(0, 5); // "hh:mm" (removing seconds)

                  // Format to match "dd.mm.yyyy hh:mm" with leading zeros
                  const [day, month, year] = datePart
                    .split('.')
                    .map((v) => v.padStart(2, '0'));
                  const formattedReceivedDate = `${day}.${month}.${year} ${timePart}`;
                  cy.log(`Formatted Received Date: ${formattedReceivedDate}`);

                  // Parse uploadDateTime with consistent formatting
                  const [uploadDay, uploadMonth, uploadYear] = uploadDateTime
                    .split(' ')[0]
                    .split('.');
                  const [uploadHour, uploadMinute] = uploadDateTime
                    .split(' ')[1]
                    .split(':');
                  const formattedUploadDate = `${uploadDay.padStart(
                    2,
                    '0'
                  )}.${uploadMonth.padStart(
                    2,
                    '0'
                  )}.${uploadYear} ${uploadHour}:${uploadMinute}`;

                  // Create tolerance range by adding 1 minute
                  const uploadDate = new Date(
                    uploadYear,
                    uploadMonth - 1,
                    uploadDay,
                    uploadHour,
                    uploadMinute
                  );
                  const uploadDatePlusOneMinute = new Date(
                    uploadDate.getTime() + 60000
                  );

                  // Format uploadDatePlusOneMinute to match "dd.mm.yyyy hh:mm"
                  const formattedUploadDatePlusOneMinute = `${uploadDatePlusOneMinute
                    .getDate()
                    .toString()
                    .padStart(2, '0')}.${(
                    uploadDatePlusOneMinute.getMonth() + 1
                  )
                    .toString()
                    .padStart(
                      2,
                      '0'
                    )}.${uploadDatePlusOneMinute.getFullYear()} ${uploadDatePlusOneMinute
                    .getHours()
                    .toString()
                    .padStart(2, '0')}:${uploadDatePlusOneMinute
                    .getMinutes()
                    .toString()
                    .padStart(2, '0')}`;

                  cy.log(`Upload Date: ${formattedUploadDate}`);
                  cy.log(
                    `Upload Date + 1 Min: ${formattedUploadDatePlusOneMinute}`
                  );

                  // Compare the received date with both possible dates
                  expect([
                    formattedUploadDate,
                    formattedUploadDatePlusOneMinute,
                  ]).to.include(formattedReceivedDate);
                });
            }
          });
      });

      cy.wait(3000);
      //Click on magic link button
      // cy.get('.action-buttons>button>.mdc-button__label').click({
      //   force: true,
      // });

      // // .filter((index, el) => {
      // //   const text = Cypress.$(el).text().trim();
      // //   return text === ' Open E-Box ' || text === 'Nächste';
      // // })
      // // cy.get('button[data-action="openEbox"]').click(); // Replace with the actual selector

      // cy.intercept(
      //   'POST',
      //   'https://supportviewpayslip.edeja.com/be/supportView/v1/person/magicLink/createByGroup',
      //   {
      //     statusCode: 200,
      //     body: {
      //       groupId: '654cb8556d84491d20c20525',
      //       personId: '665efbfcdd2ca31e8c083c8a',
      //       sourceType: 'HR_MANAGEMENT',
      //     },
      //   }
      // ).as('magicLinkRequest');
      // cy.window().then((win) => {
      //   cy.stub(win, 'open')
      //     .callsFake((url) => {
      //       // Simulate navigation in the same tab by changing the window location
      //       win.location.href = url;
      //     })
      //     .as('windowOpen');
      // });
      // // cy.wait('@magicLinkRequest').then((interception) => {
      // //   expect(interception.response.statusCode).to.eq(200);
      // //   const { magicLink } = interception.response.body;

      // //   // Verify that the stubbed window.open method was called with the correct magic link
      // //   cy.get('@windowOpen').should('be.calledWith', magicLink, '_blank');

      // //   // Assert that the current URL is the magic link
      // //   cy.url().should('eq', magicLink);
      // // });
      // cy.wait(3000);
      // //Remove Cookie
      // cy.get('body').then(($body) => {
      //   if ($body.find('#onetrust-policy-title').is(':visible')) {
      //     // If the cookie bar is visible, click on it and remove it
      //     cy.get('#onetrust-accept-btn-handler').click();
      //   } else {
      //     // Log that the cookie bar was not visible
      //     cy.log('Cookie bar not visible');
      //   }
      // }); //End Remove Cookie
      //Logout

      cy.get('.logout-icon ').click();
      cy.wait(2000);
      cy.get('.confirm-buttons > :nth-child(2)').click();
      cy.log('Test completed successfully.');
      cy.wait(2500);
    }); //end
  }
  //-------------------End Custom Function-------------------

  // Define a variable to store the formatted date and time after document upload
  var uploadDateTime;

  //Prepare document For Signing - From Upload Button
  it('prepareDocumentForSigningFromUpload', () => {
    // Load credentials (un/pw) and user data from 'supportView.json'
    // cy.fixture('supportView.json').as('payslipSW');
    // cy.get('@payslipSW').then((payslipJson) => {
    //   cy.visit(payslipJson.baseUrl); // Visit base URL from fixture
    //   cy.url().should('include', payslipJson.baseUrl); // Validate the URL

    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      cy.loginToSupportViewAdmin();

      // Wait for login to complete
      cy.wait(1500);

      //Click On Upload Button
      cy.get('.upload__document>.mdc-button__label>.upload__document__text')
        .contains(
          /Upload Personal Document|Personalisierte Dokumente hochladen/i
        )
        .should('be.visible') // Optional: Ensure the button is visible before interacting
        .click(); // Click the button
      cy.wait(1500);

      //Check number of Upload buttons
      cy.get('.buttons-wrapper > button:visible') // Select only visible buttons
        .then((buttons) => {
          const buttonCount = buttons.length; // Count the number of visible buttons
          if (buttonCount === 2) {
            cy.log('OK: The number of visible buttons is 2.');
            expect(buttonCount).to.equal(2); // Add assertion to confirm it's 2
          } else if (buttonCount === 1) {
            cy.log('INVALID: The number of visible buttons is 1.');
            expect(buttonCount).to.equal(
              2,
              'Expected 2 visible buttons but found only 1.'
            ); // Fail the test
          }
        });
      cy.wait(3000);
      //Click on upload button
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
          cy.wrap($button).invoke('css', 'border', '3px solid red');

          // Wait for 3 seconds
          cy.wait(3000);

          // Click the button
          cy.wrap($button).click();
        });

      cy.wait(1500);

      //Uplad valid document (1 A4 pdf file)
      cy.upload305Dictionary();
      cy.wait(2000);
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

      //Prepare doc for signing
      cy.get('.controls > .ng-star-inserted').click({ force: true });
      cy.wait(4500);
      cy.get('.signatures-container>.signature-actions>a').click({
        force: true,
      }); //open add new signature dialog
      cy.wait(2000);
      cy.get('input[formcontrolname="signee"]')
        .clear()
        .type('HR Document - Prepared From Upload Button'); // Enter signee name
      //Confirm Signee name
      cy.get('.mat-mdc-dialog-actions>button>.mdc-button__label')
        .filter((index, el) => {
          const text = Cypress.$(el).text().trim();
          return text === 'NEXT' || text === 'WEITER';
        })
        .click({ multiple: true, force: true });
      cy.wait(2500);

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

      //Click on Save button
      cy.get('.tempSave').click({ force: true });
      cy.wait(1500);
      // //Confirm Save temporaly dialog
      // cy.get('.mat-mdc-dialog-actions > .mat-accent >.mdc-button__label')
      //   .filter((index, el) => {
      //     const text = Cypress.$(el).text().trim();
      //     return text === 'SAVE TEMPORARY' || text === 'VORLÄUFIG SPEICHERN';
      //   })
      //   .click({ force: true });
      cy.wait(8000);

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

      //Logout
      cy.get('.logout-icon ').click();
      cy.wait(2000);
      cy.get('.confirm-buttons > :nth-child(2)').click();

      cy.log('Test completed successfully.');
      cy.wait(4500);
    });
  }); //end it

  //Sign HR Delivery
  it('Ebox user signing HR delivery', () => {
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      // cy.visit(payslipJson.baseUrl_04_egEbox); // Taken from base URL
      // cy.url().should('include', payslipJson.baseUrl_04_egEbox); // Validate URL on the login page
      // cy.wait(2000);

      // //Remove Cookie
      // cy.get('body').then(($body) => {
      //   if ($body.find('#onetrust-policy-title').is(':visible')) {
      //     // If the cookie bar is visible, click on it and remove it
      //     cy.get('#onetrust-accept-btn-handler').click();
      //   } else {
      //     // Log that the cookie bar was not visible
      //     cy.log('Cookie bar not visible');
      //   }
      // }); //End Remove Cookie

      // // Login to E-Box
      // cy.get(':nth-child(1) > .ng-invalid > .input > .input__field-input').type(
      //   payslipJson.username_egEbox
      // );
      // cy.get('.ng-invalid > .input > .input__field-input').type(
      //   payslipJson.password_egEbox
      // );
      // cy.wait(1000);
      // cy.get('button[type="submit"]').click();

      cy.loginToEgEbox();

      // //Open latest created deivery
      // cy.intercept(
      //   'GET',
      //   '**/hybridsign/backend_t/document/v1/getDocument/**'
      // ).as('getDocument');
      // cy.intercept('GET', '**/getIdentifications?**').as('getIdentifications');
      // cy.get('.mdc-data-table__content>tr>.subject-sender-cell')
      //   .eq(0)
      //   .click({ force: true });

      // cy.wait(['@getIdentifications'], { timeout: 37000 }).then(
      //   (interception) => {
      //     // Log the intercepted response
      //     cy.log('Intercepted response:', interception.response);

      //     // Assert the response status code
      //     expect(interception.response.statusCode).to.eq(200);
      //   }
      // );
      // Wait for login to complete
      cy.wait(7500);
      // Assert that the unsigned icon is visible
      cy.get('app-deliveries-signature-actions > .unsigned')
        .first()
        .should('be.visible') // Validation check
        .then(($icon) => {
          // Apply green border to mark validation as successful
          cy.wrap($icon).invoke('css', 'border', '3px solid green');
          cy.log(
            'Validation passed: Unsigned icon is visible and marked in green.'
          );
        });
      cy.wait(3500);
      //Click on latest created deivery

      cy.intercept(
        'GET',
        '**/hybridsign/backend_t/document/v1/getDocument/**'
      ).as('getDocument');
      cy.intercept('GET', '**/getIdentifications?**').as('getIdentifications');
      cy.get('.mdc-data-table__content>tr>.subject-sender-cell')
        .eq(0)
        .click({ force: true });

      cy.wait(['@getDocument', '@getIdentifications'], { timeout: 13000 }).then(
        (interception) => {
          // Log the intercepted response
          cy.log('Intercepted response:', interception.response);

          // Optional: Assert the response status code
          // expect(interception.response.statusCode).to.eq(200);

          // Optional: Assert response body or other properties
          // Example: expect(interception.response.body).to.have.property('key', 'value');
        }
      );
      // cy.wait(14000);

      // Scroll to the bottom of the PDF viewer or page
      // cy.pause();

      // cy.get('.content-container>.scroll-container').eq(1).scrollTo('bottom', {
      //   duration: 500,
      //   ensureScrollable: false,
      // });

      //Scroll to the bottom of the PDF viewer or page

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

      // Generate a random 4-digit number and use it in the title
      //let randomNumber = Math.floor(1000 + Math.random() * 9000);
      const title = `HR Delivery (pdf) - ${uploadDateTime}`; // Use formatted date and time in title

      // Loop through all signature buttons
      cy.get('.touch-signature-button').each(($button, index, $list) => {
        // Click the current signature button
        cy.wrap($button).click({ force: true });

        // Simulate signing on the canvas
        cy.get('.sign-canvas')
          .then((res) => console.log(res[0].getBoundingClientRect())) // Log canvas dimensions for debugging
          .trigger('mouseover') // Hover over the canvas
          .trigger('mousedown', { which: 1, eventConstructor: 'MouseEvent' }) // Simulate mouse press
          .trigger('mousemove', {
            which: 1,
            screenX: 410, // Adjust these coordinates as needed
            screenY: 530,
            clientX: 530,
            clientY: 560,
            pageX: 500,
            pageY: 600,
            eventConstructor: 'MouseEvent',
          }); // Simulate mouse drag to draw the signature

        cy.get('.sign-canvas').trigger('mouseup', { force: true }); // Simulate releasing the mouse
        cy.wait(2000); // Wait for the signing action to complete

        // Confirm the signature
        cy.get(
          '.mat-sign-actions-desktop > .mat-accent > .mat-mdc-button-touch-target'
        ).click({ force: true });

        // Wait for success notification
        cy.wait(7000);
        // cy.get('.success-notification>.notification-message')
        //   .should('be.visible') // Ensure the success message is visible
        //   .should('have.text', ' Signatur wurde erfolgreich erstellt. '); // Verify success message text

        // Log the progress of signature signing
        cy.log(`Signature ${index + 1} of ${$list.length} completed.`);
      });

      // Check if the Save button is enabled after all signatures are completed
      cy.get('.save > .mdc-button__label').then(($button) => {
        // If the Save button is enabled, click it
        if (!$button.is(':disabled')) {
          cy.log('All signatures are signed, clicking Save.');
          cy.wait(1500); // Wait before clicking the Save button
          cy.get('.save > .mdc-button__label').click({ force: true });
          cy.wait(4500);
        } else {
          // Log a message if the Save button is disabled
          cy.log('Save button is disabled. Ensure all signatures are signed.');
        }
      });
      cy.wait(4500);
      // Assert that the signed icon is visible
      cy.get('app-deliveries-signature-actions > .signed')
        .first()
        .should('be.visible') // Validation check
        .then(($icon) => {
          // Apply green border to mark validation as successful
          cy.wrap($icon).invoke('css', 'border', '3px solid green');
          cy.log(
            'Validation passed: Unsigned icon is visible and marked in green.'
          );
        });
      cy.wait(3500);
      //******************************************************************** */

      // Logout
      cy.get('.user-title').click();
      cy.wait(1500);
      cy.get('.logout-title > a').click();
      cy.url().should('include', payslipJson.baseUrl_04_egEbox); // Validate url
      cy.log('Test completed successfully.');
    });
  });

  // Admin User is able to check new HR Delivery received in HR page
  it.only('Admin User checks new delivery received in the HR page in SW', () => {
    adminUserChecksNewDeliveryReceivedInHRpage();
  });
}); //end describe
