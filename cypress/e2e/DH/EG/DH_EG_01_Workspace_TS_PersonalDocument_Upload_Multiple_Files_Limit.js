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
      Cypress.env('username_supportViewAdmin'),
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
                      `Checkbox for "${text}" was not enabled; now enabled.`,
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

  //Upload pdf - From Mass Upload Button
  it('DH - Upload Multiple files exceeding the maximum limit (Provide multiple serviceLine files to E-Box)', () => {
    let successfulDeliveriesCount; // Store count of successfully uploaded files

    // ===== HELPER FUNCTIONS =====

    // Get MIME type based on file extension
    const getMimeType = (fileName) => {
      if (fileName.endsWith('.pdf')) return 'application/pdf';
      if (fileName.endsWith('.txt')) return 'text/plain';
      if (fileName.endsWith('.xml')) return 'application/xml';
      if (fileName.endsWith('.csv')) return 'text/csv';
      return 'application/zip';
    };

    // Validate bilingual text matches expected pattern
    const validateBilingualText = (selector, pattern) => {
      cy.get(selector)
        .should('be.visible')
        .invoke('text')
        .then((text) => expect(text.trim()).to.match(pattern));
    };

    // ===== STEP 1: Login and Navigate =====
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

    // Login to SupportView
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

    // ===== STEP 2: Open Personal Document Upload Dialog =====
    cy.get('#workspace-personal-document-action')
      .should('be.visible')
      .contains(/Persönliches Dokument|Personal Document/i)
      .click({ force: true });

    // Validate dialog opened with correct title and subtitle
    validateBilingualText(
      '#personal-document-title',
      /Personal Document Upload|Upload Document/i,
    );
    validateBilingualText(
      '#personal-document-subtitle',
      /Choose one ore more documents|Wählen Sie eines oder mehrere Dokumente aus/i,
    );
    validateBilingualText(
      '#file-requirements',
      /Maximum file size is 50 MB and a maximum of 10 documents can be uploaded|Die maximale Dateigröße beträgt 50 MB und es können maximal 10 Dokumente hochgeladen werden/i,
    );

    // ===== STEP 3: Upload Multiple Files (12 files: 11 valid + 1 invalid CSV) =====
    // This tests file upload validation by exceeding the 10 file limit
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

    cy.intercept('GET', '**/group/dictionary/tenant/**').as('uploadDocument');

    // Upload each file sequentially and wait for confirmation
    filesToUpload.forEach((fileName, index) => {
      cy.fixture(fileName, 'binary')
        .then(Cypress.Blob.binaryStringToBlob)
        .then((fileContent) => {
          cy.get('input[type="file"]').attachFile({
            fileContent,
            fileName: fileName,
            mimeType: getMimeType(fileName),
            encoding: 'utf-8',
          });
        });

      cy.wait('@uploadDocument', { timeout: 15000 }).then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        cy.log(
          `File ${index + 1}/${filesToUpload.length} uploaded: ${fileName}`,
        );
      });
    });

    // ===== STEP 4: Verify Validation Error Messages =====
    cy.get('#file-list').scrollTo('bottom', { duration: 1000 });

    // Verify "File format is not supported" error for CSV file
    cy.get('#file-list span')
      .invoke('text')
      .should(
        'match',
        /File format is not supported|Das Dateiformat wird nicht unterstützt/i,
      );

    // Verify "Maximum file limit exceeded" error
    cy.get('#file-list span')
      .invoke('text')
      .should(
        'match',
        /Maximum file limit exceeded|Maximale Dateigrenze überschritten/i,
      );

    // Verify "Weiter" (Next) button is disabled due to validation errors
    cy.get('#upload')
      .should('be.visible')
      .and('be.disabled')
      .invoke('text')
      .should('match', /Weiter|Next/i);

    // ===== STEP 5: Remove Invalid CSV File =====
    cy.get('button[aria-label="Remove 1_createUser.csv"]').click();

    // ===== STEP 6: Remove Files Exceeding Maximum Limit =====
    // After removing CSV, we still have 11 files but max is 10
    cy.get('#file-list > div').each(($fileItem) => {
      const errorText = $fileItem.find('span').text().trim();

      // Remove files with "Maximum file limit exceeded" error
      if (
        errorText.match(
          /Maximum file limit exceeded|Maximale Dateigrenze überschritten/i,
        )
      ) {
        cy.wrap($fileItem)
          .find('button[aria-label^="Remove"]')
          .then(($btn) => {
            if ($btn.length > 0) {
              const fileName = $btn.attr('aria-label').replace('Remove ', '');
              cy.log(`Removing file with limit exceeded: ${fileName}`);
              cy.wrap($btn).click({ force: true });
              cy.wait(2000); // Wait for DOM to update
            }
          });
      }
    });

    // ===== STEP 7: Select ServiceLine from Dictionary Dropdown =====
    cy.get('#dictionary-dropdown').click({ force: true });
    cy.get('li[data-value="ServiceLine"]')
      .should('be.visible')
      .click({ force: true });
    cy.log('Selected ServiceLine from dictionary dropdown');

    // ===== STEP 8: Proceed to Document Processing =====
    cy.intercept('POST', '**/checkDocumentProcessingStatus').as(
      'checkProcessing',
    );
    cy.get('#upload').should('be.enabled').click();

    // Poll document processing status until complete
    function waitForProcessingComplete() {
      cy.wait('@checkProcessing', { timeout: 15000 }).then((interception) => {
        const isDone =
          interception.response.body.processingOver === true ||
          interception.response.body.processingOver === 'true';

        cy.log(`Processing status: ${isDone ? 'Complete' : 'In progress'}`);

        if (!isDone) {
          waitForProcessingComplete(); // Continue polling if not done
        }
      });
    }

    waitForProcessingComplete();

    // ===== STEP 9: Remove Invalid Files After Processing =====
    cy.get('#file-list').scrollTo('top', { duration: 1000 });

    // Collect all files without "Document successfully uploaded" status
    cy.get('#file-list > div').then(($fileItems) => {
      const filesToRemove = [];

      $fileItems.each((index, fileItem) => {
        const $item = Cypress.$(fileItem);
        const statusText = $item.find('span').text().trim();

        // Mark files without success status for removal
        if (
          !statusText.match(
            /Document successfully uploaded|Dokument erfolgreich hochgeladen/i,
          )
        ) {
          const $btn = $item.find('button[aria-label^="Remove"]');
          if ($btn.length > 0) {
            filesToRemove.push($btn.attr('aria-label').replace('Remove ', ''));
          }
        }
      });

      cy.log(`Found ${filesToRemove.length} invalid files to remove`);

      // Remove invalid files sequentially
      if (filesToRemove.length > 0) {
        cy.intercept('GET', '**/group/dictionary/tenant/**').as('removeFile');

        const removeFileRecursively = (index) => {
          if (index >= filesToRemove.length) {
            cy.log('All invalid files removed - only valid files remain');
            return;
          }

          const fileName = filesToRemove[index];
          cy.log(`Removing ${index + 1}/${filesToRemove.length}: ${fileName}`);

          cy.get(`button[aria-label="Remove ${fileName}"]`).then(($btn) => {
            if ($btn.length > 0) {
              cy.wrap($btn).click({ force: true });
              cy.wait('@removeFile', { timeout: 10000 }).then(() => {
                cy.log(`Removed: ${fileName}`);
                cy.wait(1000);
                removeFileRecursively(index + 1);
              });
            } else {
              cy.log(`Button not found for ${fileName}, skipping`);
              removeFileRecursively(index + 1);
            }
          });
        };

        removeFileRecursively(0);
      }
    });

    // ===== STEP 10: Count Successfully Uploaded Files and Save to JSON =====
    cy.get('#file-list button[aria-label^="Remove"]')
      .its('length')
      .then((count) => {
        successfulDeliveriesCount = count;

        cy.writeFile('cypress/fixtures/deliveryCount.json', {
          successfulDeliveriesCount: count,
          timestamp: new Date().toISOString(),
        });

        cy.log(
          `Successfully uploaded ${count} files - saved to deliveryCount.json`,
        );
      });

    // ===== STEP 11: Send Documents to Users =====
    cy.intercept('POST', '**/deliveryHandler/sendDocuments').as(
      'sendDocuments',
    );
    cy.get('button[aria-label="Send documents"').should('be.enabled').click();

    cy.wait('@sendDocuments', { timeout: 20000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('Mass delivery sent successfully');
    });

    // ===== STEP 12: Close Dialog and Validate Home Page =====
    cy.get('button[type="button"]')
      .contains(/Fertig|Done|Finish/i)
      .should('be.visible')
      .click({ force: true });

    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);
    cy.log('Test completed successfully');
  }); //end it

  it('Login to EBox, verify delivery count and open random delivery in HybridSign', () => {
    // ===== STEP 1: Login and Get Deliveries =====
    cy.intercept('POST', '**/rest/v2/deliveries').as('postDeliveries');
    cy.loginToEgEbox();

    cy.wait('@postDeliveries').then((interception) => {
      const deliveries = interception.response.body.deliveries;

      // ===== STEP 2: Filter Latest Unread Deliveries =====
      const unreadDeliveries = deliveries.filter((d) => d.read === false);

      // Find the most recent delivery timestamp
      const latestDate = new Date(
        Math.max(...unreadDeliveries.map((d) => new Date(d.date))),
      );

      // Apply +1 hour offset for timezone adjustment
      const offsetDate = new Date(latestDate.getTime() + 1 * 60 * 60 * 1000);
      const latestMinute = offsetDate.toISOString().slice(0, 16);

      // Get all deliveries matching the latest timestamp (to the minute)
      const latestUnreadDeliveries = unreadDeliveries.filter((d) => {
        const localDate = new Date(
          new Date(d.date).getTime() + 1 * 60 * 60 * 1000,
        );
        return localDate.toISOString().slice(0, 16) === latestMinute;
      });

      // ===== STEP 3: Validate Delivery Count Matches Upload Count =====
      cy.readFile('cypress/fixtures/deliveryCount.json').then((data) => {
        const expectedCount = data.successfulDeliveriesCount;
        const actualLatestUnreadCount = latestUnreadDeliveries.length;

        cy.log(`Expected deliveries: ${expectedCount}`);
        cy.log(`Actual latest unread deliveries: ${actualLatestUnreadCount}`);

        // Validate delivery count matches uploaded document count
        expect(
          actualLatestUnreadCount,
          'Latest unread deliveries in eBox must match SupportView count',
        ).to.eq(expectedCount); // FIX IT: remove "- 1" when counts align correctly
      });

      // ===== STEP 4: Count and Log Latest Deliveries =====
      cy.log(
        `Total latest unread deliveries: ${latestUnreadDeliveries.length}`,
      );
      cy.log(`Deliveries at timestamp: ${latestMinute}`);

      // Log all latest deliveries for debugging
      latestUnreadDeliveries.forEach((delivery, idx) => {
        const deliveryTime = new Date(
          new Date(delivery.date).getTime() + 1 * 60 * 60 * 1000,
        )
          .toISOString()
          .slice(0, 16);
        cy.log(
          `[${idx}] Subject: "${delivery.subject}" | Time: ${deliveryTime} | Read: ${delivery.read}`,
        );
      });

      // ===== STEP 5: Randomly Select a Delivery from Latest Batch =====
      const randomIndex = Math.floor(
        Math.random() * latestUnreadDeliveries.length,
      );
      const randomDelivery = latestUnreadDeliveries[randomIndex];

      cy.log(`Randomly selected delivery index: ${randomIndex}`);
      cy.log(`Selected delivery subject: "${randomDelivery.subject}"`);

      // Click on unread delivery row by finding it in the visible table
      // Since deliveries are sorted by date (newest first), count unread rows from top
      cy.get('.mdc-data-table__content > tr').then(($rows) => {
        let unreadCount = 0;
        let targetRowIndex = -1;

        // Find which visible row corresponds to our selected delivery
        for (let i = 0; i < $rows.length; i++) {
          const $row = $rows.eq(i);
          const subject = $row.find('.subject-sender-cell').text().trim();
          const rowText = $row.text();

          // Check if this row is unread (has unread indicator)
          const isUnread =
            $row.find('.mat-badge-content, .unread-indicator').length > 0 ||
            !rowText.includes('gelesen') ||
            $row.hasClass('unread');

          if (isUnread) {
            // This matches one of our latest unread deliveries
            if (unreadCount === randomIndex) {
              targetRowIndex = i;
              cy.log(`Found target row at index ${i}, subject: "${subject}"`);
              break;
            }
            unreadCount++;
          }
        }

        // Click on the identified row
        if (targetRowIndex >= 0) {
          cy.get('.half-cell-text-content')
            .eq(targetRowIndex)
            .find('.subject-sender-cell')
            .click({ force: true });
          cy.log(`Clicked on delivery row ${targetRowIndex}`);
        } else {
          // Fallback: click first unread row
          cy.log('Could not match by index, clicking first unread delivery');
          cy.get('.half-cell-text-content')
            .first()
            .find('.subject-sender-cell')
            .click({ force: true });
        }
      });

      // ===== STEP 6: Open Document in HybridSign for Selected Delivery =====
      cy.intercept('GET', '**/getIdentifications?**').as('getIdentifications');

      // Wait for row selection to complete
      cy.wait(2000);

      // Find the selected/highlighted row and click the download button
      cy.get('.half-cell-text-content').then(($rows) => {
        // Find selected row (could have various classes/attributes)
        let $selectedRow = $rows.filter(
          '.mdc-data-table__row--selected, .selected, [aria-selected="true"]',
        );

        // If no selected row found by class, find by visual indicators
        if ($selectedRow.length === 0) {
          cy.log('No selected row found by class, finding by visual state');

          // Just get the first row or use a safer approach
          cy.get('.mdc-data-table__content > tr')
            .first()
            .within(() => {
              cy.get('button[aria-label="Alle Dokumente herunterladen"]')
                .should('be.visible')
                .then(($btn) => {
                  $btn.css('border', '3px solid blue');
                  $btn.css('box-shadow', '0 0 6px blue');
                  cy.wait(1000);
                  cy.wrap($btn).click({ force: true });
                });
            });
        } else {
          cy.wrap($selectedRow)
            .first()
            .within(() => {
              cy.get('button[aria-label="Alle Dokumente herunterladen"]')
                .should('be.visible')
                .then(($btn) => {
                  $btn.css('border', '3px solid blue');
                  $btn.css('box-shadow', '0 0 6px blue');
                  cy.wait(1000);
                  cy.wrap($btn).click({ force: true });
                });
            });
        }
      });

      cy.log('Clicked "Open in HybridSign" button for selected delivery');

      // ===== STEP 6: Wait for Document to Load in HybridSign =====
      cy.wait('@getIdentifications', { timeout: 77000 })
        .its('response.statusCode')
        .should('eq', 200);
      cy.log('Document loaded successfully in HybridSign');

      // ===== STEP 7: Logout =====
      cy.get('.user-title').click();
      cy.get('.logout-title > a').click();
      cy.log('Logged out successfully');
    });
  }); //end it

  //Yopmail - Verify Reporting Email Content
  it('Yopmail - Verify reporting email and delete all emails', () => {
    // ===== STEP 1: Access Yopmail Inbox =====
    cy.visit('https://yopmail.com/en/');
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));
    cy.get('#refreshbut > .md > .material-icons-outlined').click();

    // ===== STEP 2: Validate Email Subject =====
    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .eq(0)
      .should('include.text', 'Versandreport e-Gehaltszettel Portal');
    cy.log('Reporting email subject validated');

    // ===== STEP 3: Read Expected Count and Validate Email Body =====
    cy.readFile('cypress/fixtures/deliveryCount.json').then((data) => {
      const expectedCount = data.successfulDeliveriesCount;

      cy.iframe('#ifmail')
        .find('#mail > div')
        .invoke('text')
        .then((text) => {
          const normalizedText = text.trim().replace(/\s+/g, ' ');

          cy.log(`Expected delivery count: ${expectedCount}`);
          cy.log('Validating email body content...');

          // Validate successful digital deliveries message
          expect(normalizedText).to.include(
            `Sie haben ${
              expectedCount - 1
            } Sendung(en) erfolgreich digital in das e-Gehaltszettel Portal Ihrer Benutzer*innen eingeliefert`,
          );
          expect(normalizedText).to.include(
            'Zusätzlich haben Sie 0 Sendung(en) erfolgreich über den postalischen Weg als Brief versendet. Das Dokument wird von uns über das „Einfach Brief“-Portal gedruckt, kurvertiert und an die Adresse des Benutzers versendet.',
          );
          expect(normalizedText).to.include('Ihr e-Gehaltszettel Team');

          cy.log('Email body content validated successfully');
        });
    });

    // ===== STEP 4: Delete All Emails =====
    cy.get('.menu>div>#delall')
      .should('not.be.disabled')
      .click({ force: true });
    cy.log('All emails deleted from inbox');
  }); //end it
});
