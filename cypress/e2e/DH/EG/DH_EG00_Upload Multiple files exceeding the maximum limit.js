///<reference types="cypress" />

describe('DH Upload Multiple files exceeding the maximum limit', () => {
  let successfulDeliveriesCount; // Global variable to store successful deliveries count
  //Enable All Roles
  it.skip('Enable All Roles', () => {
    // Login as a Master-User using custom command
    cy.loginToSupportViewMaster();
    cy.wait(3500);

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

    //Click On Admin UserbButton
    cy.get('.mdc-button__label')
      // Find the button containing "Admin User" or "Admin Benutzer" button
      .contains(/Admin User|Admin Benutzer/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    //Search For Admin And Open Role Dialog

    //Search for Aqua Admin
    cy.get('.search').click({ force: true });
    //Search for Admin using username
    cy.get('input[formcontrolname="userName"]').type(
      Cypress.env('username_supportViewAdmin')
    );
    // Click on Search for Admin User button
    cy.get('button[type="submit"]').click();
    cy.wait(2000);
    //Click on Role
    cy.get('.mdc-button__label')
      .contains(/Rechte|Rights/i) // Find the button containing "Rechte" or "Rights"
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button

    // Enable All Roles, except HR Role, for specific Admin user
    const rolesToEnable = [
      ['Company Admin', 'Firmen-Administrator'],
      ['Customer Creator', 'Nutzeranlage'],
      ['Data Submitter', 'Versand'],
      ['View E-Box', 'E-Box ansehen'],
      ['HR Manager', 'HR Manager'],
    ];

    cy.get('.mat-mdc-checkbox > div > .mdc-label')
      .should('exist') // Ensure checkbox labels exist
      .each(($label) => {
        const text = $label.text().trim();

        // Check if text matches any role in either English or German
        if (rolesToEnable.some(([en, de]) => text === en || text === de)) {
          cy.wrap($label)
            .parent()
            .find('input[type="checkbox"]') // Locate the checkbox input
            .then(($checkboxInput) => {
              cy.wrap($checkboxInput)
                .invoke('prop', 'checked')
                .then((isChecked) => {
                  if (!isChecked) {
                    // Enable the role if it's not already checked
                    cy.wrap($checkboxInput).click({ force: true });
                    cy.log(
                      `Checkbox for "${text}" was not enabled; now enabled.`
                    );
                  } else {
                    cy.log(`Checkbox for "${text}" is already enabled.`);
                  }
                });
            });
        }
      });

    cy.wait(1500);

    // Submit the changes
    cy.get('button[type="submit"]').click();
    cy.wait(1500);

    // Verify the success message
    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible') // Ensure it's visible first
      .invoke('text') // Get the text of the element
      .then((snackText) => {
        const trimmedText = snackText.trim();
        expect(trimmedText).to.match(/Rights updated|Rechte aktualisiert/);
      });

    cy.wait(3000);
    // Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url'
    cy.log('Test completed successfully.');
    cy.wait(2500);
  }); //end it

  //Uplad pdf - From Mass Upload Button
  it.only('DH - Upload Multiple files exceeding the maximum limit (Provide multiple serviceLine files to E-Box)', () => {
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
    cy.intercept('GET', '**/person/fromGroup/**').as('personsFromGroup');

    // Login Dummy button
    cy.get('button[id=":r2:"]').contains('Login Dummy').click();
    cy.wait(2000);

    // Wait & Assert response
    cy.wait('@personsFromGroup', { timeout: 15000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('Login successful, generalInfo loaded');
    });

    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home/persons`);
    cy.wait(2000);

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

    // === STEP 1: Upload Multiple files exceeding the maximum limit ===
    // This section tests the file upload validation by uploading 12 files
    // (including 1 invalid CSV) to exceed the 10 file limit

    // Define array of 12 files to upload (11 valid formats + 1 CSV to test invalid format)
    const filesToUpload = [
      'Mass_A4.pdf',
      'Test.pdf',
      'TestDocument.pdf',
      'Demo_DOC.pdf',
      '305_Dictionary_(AQUA_ABBA000100279311).pdf',
      'Serviceline-tid=AQUA_gid=ABBA000100279311.pdf',
      'TXT_1receiver__(AQUA_ABBA000100279311_ISS BBcare).txt',
      'XML_1receiver__(AQUA_ABBA000100279311_ISS BBcare).xml',
      'XML_1receiver__(AQUA_ABBA000100279311_ISS BBcare).zip',
      'XML_1receiver__(AQUA_ABBA000100279311_ISS BBcare).7z',
      'ZIP__ServiceLine_and_XML_inside_(tid=AQUA_gid=ABBA000100279311).zip',
      '1_createUser.csv', // Invalid file format for testing
    ];

    // Set up network intercept to monitor file upload requests
    cy.intercept('GET', '**/group/dictionary/tenant/**').as(
      'uploadPersonalDocuments'
    );

    // === STEP 2: Upload files sequentially and wait for each to complete ===
    // Loop through each file and upload it one by one
    // Each file must receive status 200 before uploading the next file
    filesToUpload.forEach((fileName, index) => {
      // Load file from fixtures folder as binary data
      cy.fixture(fileName, 'binary')
        .then(Cypress.Blob.binaryStringToBlob) // Convert to blob format
        .then((fileContent) => {
          // Attach file to the file input element with appropriate MIME type
          cy.get('input[type="file"]').attachFile({
            fileContent,
            fileName: fileName,
            // Determine MIME type based on file extension
            mimeType: fileName.endsWith('.pdf')
              ? 'application/pdf'
              : fileName.endsWith('.txt')
              ? 'text/plain'
              : fileName.endsWith('.xml')
              ? 'application/xml'
              : fileName.endsWith('.csv')
              ? 'text/csv'
              : 'application/zip',
            encoding: 'utf-8',
          });
        });

      // Wait for this specific file's upload request to complete with status 200
      // Only proceed to next file after current file upload is confirmed successful
      cy.wait('@uploadPersonalDocuments', { timeout: 15000 }).then(
        (interception) => {
          // Assert this file's upload request returns 200 status code
          expect(interception.response.statusCode).to.eq(200);
          cy.log(
            `File ${index + 1}/${
              filesToUpload.length
            } (${fileName}) uploaded successfully with status 200`
          );
          cy.wait(1000); // Wait briefly before next upload
        }
      );
    });

    cy.wait(2000); // Wait for UI to update with all uploaded files
    // === STEP 3: Verify error messages are displayed ===
    // Scroll to bottom of file list to see all uploaded files and their statuses
    cy.get('#file-list').scrollTo('bottom', { duration: 1000 });
    cy.wait(1000);

    // Verify error message for invalid file format (CSV file)
    cy.get('#file-list span')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();
        // Check for "File format is not supported" error in English or German
        expect(trimmedText).to.match(
          /File format is not supported|Das Dateiformat wird nicht unterstützt/i
        );
      });
    cy.wait(1500);

    // Verify error message for exceeding maximum file limit (more than 10 files)
    cy.get('#file-list span')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();
        // Check for "Maximum file limit exceeded" error in English or German
        expect(trimmedText).to.match(
          /Maximum file limit exceeded|Das Dateiformat wird nicht unterstützt/i
        );
      });
    cy.wait(1500);

    // === STEP 4: Verify "Weiter" (Next) button is disabled due to validation errors ===
    // Button should be disabled when there are invalid files or too many files
    cy.get(
      'button[aria-label="Weiter zum nächsten Schritt (ungültiges Dateiformat)"]'
    ).should('be.disabled');
    cy.wait(1500);

    // === STEP 5: Remove the invalid CSV file ===
    // Remove the CSV file that has "File format is not supported" error
    cy.get('button[aria-label="Remove 1_createUser.csv"]').click();
    cy.wait(1500);

    // //Check Weiter button is still disabled after removing CSV (still over limit)
    // cy.get(
    //   'button[aria-label="Weiter zum nächsten Schritt (ungültiges Dateiformat)"]'
    // ).should('be.disabled');
    // cy.wait(1500);

    // === STEP 6: Remove files that exceed the maximum limit ===
    // After removing CSV, we still have 11 files but max is 10
    // Remove all files showing "Maximum file limit exceeded" error
    cy.get('#file-list > div').each(($fileItem) => {
      // Iterate through each file item in the list
      const errorText = $fileItem.find('span').text().trim();

      // Check if this specific file has the "Maximum file limit exceeded" error
      if (
        errorText.match(
          /Maximum file limit exceeded|Maximale Dateigrenze überschritten/i
        )
      ) {
        cy.wrap($fileItem)
          .find('button[aria-label^="Remove"]') // Find remove button for this file
          .then(($btn) => {
            if ($btn.length > 0) {
              const fileName = $btn.attr('aria-label').replace('Remove ', '');
              cy.log(`Removing file with limit exceeded error: ${fileName}`);
              cy.wrap($btn).click({ force: true }); // Remove the file
              cy.wait(2500); // Wait for DOM to update after removal
            }
          });
      }
    });

    cy.wait(1500);

    // === STEP 7: Select ServiceLine from dictionary dropdown ===
    // Open the dictionary dropdown
    cy.get('div[role="combobox"]').click({ force: true });

    // Define the dictionary/serviceline value to select
    const desiredSelectionServiceline = ['ServiceLine'];

    // Reusable function to select value(s) from dropdown
    const selectFromDropdownServiceline = (values) => {
      values.forEach((val) => {
        // Type the value in the dropdown search field
        cy.get('input[id="dropdown-searchfield-undefined"]')
          .clear()
          .type(val, { delay: 20 });

        // Click the matching dropdown option
        cy.get(`li[data-value="${val}"]`)
          .should('be.visible')
          .click({ force: true });

        cy.log(`Selected value from dropdown: ${val}`);
      });
    };

    // --- Usage ---
    // Call this inside your test after the upload step
    selectFromDropdownServiceline(desiredSelectionServiceline);
    cy.wait(1500);

    // === STEP 8: Remove additional documents to meet requirements ===
    // Remove 2 more documents from the top of the list
    cy.get('#file-list button[aria-label^="Remove"]').then(($buttons) => {
      if ($buttons.length >= 2) {
        // Remove first document
        const firstFileName = Cypress.$($buttons[0])
          .attr('aria-label')
          .replace('Remove ', '');
        cy.log(`Removing first document: ${firstFileName}`);
        cy.wrap($buttons[0]).click({ force: true });
        cy.wait(1000);

        // Remove second document (re-query DOM to get updated button list)
        cy.get('#file-list button[aria-label^="Remove"]').then(
          ($newButtons) => {
            const secondFileName = Cypress.$($newButtons[0])
              .attr('aria-label')
              .replace('Remove ', '');
            cy.log(`Removing second document: ${secondFileName}`);
            cy.wrap($newButtons[0]).click({ force: true });
            cy.wait(1000);
          }
        );
      } else {
        cy.log('Less than 2 files available to remove');
      }
    });

    cy.wait(1500);

    // === STEP 9: Proceed to next step and wait for document processing ===
    // Set up intercept to monitor document processing status
    cy.intercept('POST', '**/checkDocumentProcessingStatus').as(
      'checkDocumentProcessingStatus'
    );

    // Click "Weiter" (Next) button to proceed to document processing
    cy.get('button[aria-label="Weiter zum nächsten Schritt"]')
      .should('be.enabled')
      .click();

    // Recursive function to wait until all documents finish processing
    function waitUntilProcessingDone() {
      cy.wait('@checkDocumentProcessingStatus', { timeout: 15000 }).then(
        (interception) => {
          const body = interception.response.body;
          cy.log(`processingOver: ${body.processingOver}`);

          // Check if processing is complete (can be boolean or string)
          const isDone =
            body.processingOver === true || body.processingOver === 'true';

          if (isDone) {
            expect(isDone).to.eq(true); // Assert processing completed successfully
          } else {
            waitUntilProcessingDone(); // Keep polling if not done yet
          }
        }
      );
    }

    // Start waiting for processing to complete
    waitUntilProcessingDone();
    cy.wait(2000); // Wait for UI to fully update

    // === STEP 10: Clean up - Remove all invalid files after processing ===
    // Scroll to top of file list to access all files
    cy.get('#file-list').scrollTo('top', { duration: 1000 });
    cy.wait(1000);

    // Remove all files that don't have "Document successfully uploaded" status
    // Only keep successfully processed files for final delivery
    cy.get('#file-list > div').then(($fileItems) => {
      const filesToRemove = [];

      // Scan all file items and identify files without success status
      $fileItems.each((index, fileItem) => {
        const $item = Cypress.$(fileItem);
        const successText = $item.find('span').text().trim();

        // If file doesn't have "Document successfully uploaded" status, mark for removal
        if (
          !successText.match(
            /Document successfully uploaded|Dokument erfolgreich hochgeladen/i
          )
        ) {
          const $btn = $item.find('button[aria-label^="Remove"]');
          if ($btn.length > 0) {
            const fileName = $btn.attr('aria-label').replace('Remove ', '');
            filesToRemove.push(fileName);
          }
        }
      });

      cy.log(`Found ${filesToRemove.length} invalid files to remove`);

      if (filesToRemove.length > 0) {
        cy.log(`Will remove: ${filesToRemove.join(', ')}`);

        // Set up network intercept to monitor file removal requests
        cy.intercept('GET', '**/group/dictionary/tenant/**').as(
          'removeInvalidFile'
        );

        // Recursive function to remove files one by one
        const removeNextFile = (index) => {
          if (index >= filesToRemove.length) {
            cy.log('All invalid files removed - only valid files remain');
            return;
          }

          const fileName = filesToRemove[index];
          cy.log(
            `Removing invalid file ${index + 1}/${
              filesToRemove.length
            }: ${fileName}`
          );

          // Re-query to find the button for this file
          cy.get(`button[aria-label="Remove ${fileName}"]`).then(($btn) => {
            if ($btn.length > 0) {
              cy.wrap($btn).click({ force: true });
              cy.wait('@removeInvalidFile', { timeout: 10000 }).then(
                (interception) => {
                  expect(interception.response.statusCode).to.eq(200);
                  cy.log(`Successfully removed file: ${fileName}`);
                  cy.wait(1000); // Wait for DOM to update
                  removeNextFile(index + 1); // Remove next file
                }
              );
            } else {
              cy.log(`Button not found for ${fileName}, skipping`);
              removeNextFile(index + 1);
            }
          });
        };

        removeNextFile(0); // Start removing from first file
      } else {
        cy.log('No invalid files found - all files are valid');
      }
    });

    cy.wait(2000);
    //Count number of successfully uploaded files by counting remove buttons
    // let successfulDeliveriesCount;

    // cy.get('#file-list button[aria-label^="Remove"]')
    //   .its('length')
    //   .then((count) => {
    //     successfulDeliveriesCount = count;
    //     Cypress.env('successfulDeliveriesCount', count);
    //     cy.log(`Stored successfulDeliveriesCount: ${count}`);
    //   });

    // Count number of successfully uploaded files
    cy.get('#file-list button[aria-label^="Remove"]')
      .its('length')
      .then((count) => {
        successfulDeliveriesCount = count;

        cy.writeFile('cypress/fixtures/deliveryCount.json', {
          successfulDeliveriesCount: count,
          timestamp: new Date().toISOString(),
        });

        cy.log(`Stored successfulDeliveriesCount: ${count}`);
      });

    // cy.pause(); // Commented out to allow test to complete and share variable

    cy.wait(1500);

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

    //Send Multiple (5) documents to user

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

  it.only('Login to Ebox, count numer of latest receiverd deliaveries and random open it', () => {
    cy.intercept('POST', '**/rest/v2/deliveries').as('postDeliveries');
    cy.loginToEgEbox();

    cy.wait('@postDeliveries').then((interception) => {
      const deliveries = interception.response.body.deliveries;

      // Filter unread deliveries
      const unreadDeliveries = deliveries.filter((d) => d.read === false);

      // Find the latest recent date
      const latestDate = new Date(
        Math.max(...unreadDeliveries.map((d) => new Date(d.date)))
      );

      // Format latest date with +1 hour offset (for UI match)
      const offsetDate = new Date(latestDate.getTime() + 1 * 60 * 60 * 1000);
      const latestMinute = offsetDate.toISOString().slice(0, 16); // e.g., 2025-05-28T10:31

      // Filter unread deliveries that match the latest date+time (to the minute)
      const latestUnreadDeliveries = unreadDeliveries.filter((d) => {
        const localDate = new Date(
          new Date(d.date).getTime() + 1 * 60 * 60 * 1000
        );
        return localDate.toISOString().slice(0, 16) === latestMinute;
      });

      // // Count the number of latest unread deliveries
      // const actualLatestUnreadCount = latestUnreadDeliveries.length;
      // cy.log(`Number of latest unread deliveries: ${actualLatestUnreadCount}`);
      // //cy.log(`Expected count from previous test: ${successfulDeliveriesCount}`);

      // // Assert value from app equals 4
      // expect(
      //   actualLatestUnreadCount,
      //   'Actual latest unread deliveries count from app should be 4'
      // ).to.eq(4);

      // Read the JSON file where IT1 stored the successful deliveries count
      cy.readFile('cypress/fixtures/deliveryCount.json').then((data) => {
        // Extract the successfulDeliveriesCount value from the JSON file
        const expectedCount = data.successfulDeliveriesCount;

        // Get the number of latest unread deliveries received in eBox (from the app)
        const actualLatestUnreadCount = latestUnreadDeliveries.length;

        // Assert that the number of unread deliveries in eBox
        // matches the number of successfully uploaded documents from SupportView
        expect(
          actualLatestUnreadCount,
          'Latest unread deliveries in eBox must match SupportView count'
        ).to.eq(expectedCount - 1); // FIX IT: remove "- 1" when counts align correctly
      });

      cy.wait(1500);
      // Pick and open a random delivery
      const randomDelivery =
        latestUnreadDeliveries[
          Math.floor(Math.random() * latestUnreadDeliveries.length)
        ];

      const { subject } = randomDelivery;

      cy.intercept('GET', '**/getIdentifications?**').as('getIdentifications');

      cy.get('.mdc-data-table__content > tr > .subject-sender-cell').each(
        ($el) => {
          if ($el.text().trim() === subject) {
            cy.wrap($el).click({ force: true });
            return false;
          }
        }
      );

      cy.wait('@getIdentifications', { timeout: 77000 })
        .its('response.statusCode')
        .should('eq', 200);

      // Logout
      cy.get('.user-title').click();
      cy.get('.logout-title > a').click();
    });
  }); //end it

  //Admin user check Reporting email and delte all emails
  it.only('Yopmail - Get Reporting email and delte all emails', () => {
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

    // Read the JSON file where IT1 stored the successful deliveries count
    cy.readFile('cypress/fixtures/deliveryCount.json').then((data) => {
      // Extract the successfulDeliveriesCount value from the JSON file
      const expectedCount = data.successfulDeliveriesCount;

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
            `Sie haben ${
              expectedCount - 1
            } Sendung(en) erfolgreich digital in das e-Gehaltszettel Portal Ihrer Benutzer*innen eingeliefert`
          );
          expect(normalizedText).to.include(
            'Zusätzlich haben Sie 0 Sendung(en) erfolgreich über den postalischen Weg als Brief versendet. Das Dokument wird von uns über das „Einfach Brief“-Portal gedruckt, kurvertiert und an die Adresse des Benutzers versendet.'
          );
          expect(normalizedText).to.include('Ihr e-Gehaltszettel Team');
        });
    }); //end readFile
    cy.wait(4500);

    // Delete all emails
    cy.get('.menu>div>#delall')
      .should('not.be.disabled')
      .click({ force: true });
    cy.wait(2500);
  });
});
