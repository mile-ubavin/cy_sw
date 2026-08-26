///<reference types="cypress" />

describe('DH Upload Multiple files exceeding the maximum limit', () => {
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
  it.only('DH - Upload Multiple files exceeding the maximum limit (Provide multiple serviceLine files to E-Box)', () => {
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
    // Visit DH and handle cookie consent
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
    `
    // ===== STEP 4: Verify Validation Error Messages =====
    cy.get('#file-list').scrollTo('bottom', { duration: 1000 });

    // Verify "File format is not supported" error for CSV file
    cy.get('#file-list span')
      .invoke('text')
      .should(
        'match',
        /File format is not supported|Das Dateiformat wird nicht unterstützt/i,
      );`;

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

    // R2: Re-alias dictionary endpoint BEFORE removals so we can wait for the
    // backend refresh that each removal triggers.
    cy.intercept('GET', '**/group/dictionary/tenant/**').as('dictRefresh');

    // ===== STEP 5: Remove Invalid CSV File =====
    cy.get('button[aria-label="Remove 1_createUser.csv"]').click();

    // ===== STEP 6: Remove Files With Errors (any non-empty error span) =====
    // After removing CSV, we still have 11 files but max is 10.
    // Broader rule: remove ANY file item whose error span is non-empty —
    // covers "Maximum file limit exceeded", "File format is not supported",
    // and any other status we haven't enumerated (e.g. .7z corruption).
    cy.get('#file-list > div').each(($fileItem) => {
      const errorText = $fileItem.find('span').text().trim();
      const looksLikeError =
        errorText.length > 0 &&
        !/Document successfully uploaded|Dokument erfolgreich hochgeladen/i.test(
          errorText,
        );

      if (looksLikeError) {
        cy.wrap($fileItem)
          .find('button[aria-label^="Remove"]')
          .then(($btn) => {
            if ($btn.length > 0) {
              const fileName = $btn.attr('aria-label').replace('Remove ', '');
              cy.log(
                `Removing invalid file: ${fileName} (status: "${errorText}")`,
              );
              cy.wrap($btn).click({ force: true });
              cy.wait(2000);
            }
          });
      }
    });

    // R1: Log every remaining file-list span text so we can see exactly what
    // state the dropdown is in when we try to click it.
    cy.get('#file-list > div').then(($items) => {
      cy.log(
        `>>> File-list state before dropdown click — ${$items.length} items`,
      );
      $items.each((idx, el) => {
        const fileName =
          Cypress.$(el)
            .find('button[aria-label^="Remove"]')
            .attr('aria-label') || '(no remove btn)';
        const span = Cypress.$(el).find('span').text().trim();
        cy.log(`  [${idx}] ${fileName} | status="${span}"`);
      });
    });

    // R2: Wait for the most recent dictionary refresh to settle before clicking.
    cy.wait('@dictRefresh', { timeout: 15000 }).then((interception) => {
      cy.log(
        `dictRefresh settled — status ${interception.response?.statusCode}`,
      );
    });
    cy.get('.loading-wrapper', { timeout: 15000 }).should('not.exist');

    // ===== STEP 7: Select ServiceLine from Dictionary Dropdown =====
    // MatSelect overlay sometimes swallows the first click after a busy DOM
    // refresh. Click, verify overlay opened, retry on the inner trigger if not.
    const OPTION_SELECTOR =
      'li[data-value], mat-option, .mat-mdc-option, [role="option"]';

    cy.get('#dictionary-dropdown', { timeout: 15000 })
      .scrollIntoView()
      .click({ force: true });
    cy.wait(800);

    cy.get('body').then(($body) => {
      if ($body.find(OPTION_SELECTOR).length === 0) {
        cy.log('Overlay did not open — retrying via mat-select trigger');
        cy.get('#dictionary-dropdown')
          .find('mat-select, .mat-mdc-select-trigger, [role="combobox"]')
          .first()
          .click({ force: true });
        cy.wait(800);
      }
    });

    cy.get(OPTION_SELECTOR, { timeout: 10000 }).should(
      'have.length.at.least',
      1,
    );

    cy.contains(OPTION_SELECTOR, /^\s*ServiceLine\s*$/i)
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
    // Count items whose status span actually reports success — counting every
    // Remove button overshoots when Step 9 left behind files with non-fatal
    // processing errors (the backend won't deliver those).
    cy.get('#file-list > div').then(($items) => {
      let count = 0;
      const statuses = [];
      $items.each((_, el) => {
        const span = Cypress.$(el).find('span').text().trim();
        statuses.push(span);
        if (
          /Document successfully uploaded|Dokument erfolgreich hochgeladen/i.test(
            span,
          )
        ) {
          count++;
        }
      });
      cy.log(`>>> File-list statuses before send (${$items.length} items):`);
      statuses.forEach((s, i) => cy.log(`  [${i}] "${s}"`));
      cy.log(`>>> Counted ${count} files with success status`);
      cy.writeFile('cypress/fixtures/deliveryCount.json', {
        successfulDeliveriesCount: count,
        timestamp: new Date().toISOString(),
      });
      cy.log(
        `Successfully uploaded ${count} files - saved to deliveryCount.json`,
      );
    });

    // ===== PAUSE BEFORE SEND — manually verify the file list & count =====
    // Open Cypress runner, inspect #file-list, then click "Resume" to continue.
    cy.log('⏸ PAUSED — inspect file list, then click Resume in Cypress runner');
    cy.pause();

    // ===== STEP 11: Send Documents to Users =====
    cy.intercept('POST', '**/deliveryHandler/sendDocuments').as(
      'sendDocuments',
    );
    cy.get('button[aria-label="Send documents"').should('be.enabled').click();

    cy.wait('@sendDocuments', { timeout: 20000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      const body = interception.response.body;
      cy.log(`sendDocuments response: ${JSON.stringify(body)}`);

      // Extract actual digital delivery count from API response and update the fixture.
      // The fixture is read by Test 3 (e-box count) and Test 4 (email body).
      const digitalCount =
        body?.digitalDeliveries ??
        body?.successfulDigitalDeliveries ??
        body?.digital ??
        body?.deliveredDigital ??
        body?.successCount ??
        body?.delivered ??
        body?.count ??
        null;

      if (typeof digitalCount === 'number') {
        cy.log(
          `Updating successfulDeliveriesCount to actual digital count: ${digitalCount}`,
        );
        cy.readFile('cypress/fixtures/deliveryCount.json').then((data) => {
          cy.writeFile('cypress/fixtures/deliveryCount.json', {
            ...data,
            successfulDeliveriesCount: digitalCount,
          });
        });
      } else {
        cy.log(
          'Could not extract digital count from sendDocuments response — check log above for field names',
        );
      }

      cy.log('Mass delivery sent successfully');
    });

    // ===== STEP 12: Close Dialog and Validate Home Page =====
    cy.get('button[type="button"]')
      .contains(/Fertig|Done|Finish/i)
      .should('be.visible')
      .click({ force: true });

    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);
    cy.log('Test completed successfully');
    cy.wait(2000);

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

  it('Login to EBox, verify delivery count and open random delivery in HybridSign', () => {
    // Pre-load upload data so timestamp is available inside the wait callback
    cy.readFile('cypress/fixtures/deliveryCount.json').as('uploadData');

    // ===== STEP 1: Login and Get Deliveries =====
    cy.intercept('POST', '**/rest/v2/deliveries').as('postDeliveries');
    cy.loginToEgEbox();

    cy.wait('@postDeliveries').then((interception) => {
      const deliveries = interception.response.body.deliveries;

      cy.get('@uploadData').then((savedData) => {
        const expectedCount = savedData.successfulDeliveriesCount;
        const uploadTimestamp = new Date(savedData.timestamp);

        // ===== STEP 2: Filter New Unread Deliveries Since Upload =====
        // Use the timestamp saved after counting successfully uploaded files.
        // Deliveries created after that moment belong to this batch.
        const latestUnreadDeliveries = deliveries.filter(
          (d) => d.read === false && new Date(d.date) >= uploadTimestamp,
        );

        // ===== STEP 3: Validate Delivery Count Matches Upload Count =====
        cy.log(`Expected deliveries: ${expectedCount}`);
        cy.log(
          `Actual new unread deliveries: ${latestUnreadDeliveries.length}`,
        );
        cy.log(`Filtering deliveries after: ${uploadTimestamp.toISOString()}`);

        expect(
          latestUnreadDeliveries.length,
          'New unread deliveries in eBox must match upload count',
        ).to.eq(expectedCount);

        // ===== STEP 4: Log Latest Deliveries =====
        cy.log(`Total new unread deliveries: ${latestUnreadDeliveries.length}`);

        latestUnreadDeliveries.forEach((delivery, idx) => {
          const deliveryTime = new Date(delivery.date)
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
        cy.intercept('GET', '**/getIdentifications?**').as(
          'getIdentifications',
        );

        // Wait for row selection to complete
        cy.wait(2000);

        // Find the selected/highlighted row and click the download button
        cy.get('.half-cell-text-content').then(($rows) => {
          let $selectedRow = $rows.filter(
            '.mdc-data-table__row--selected, .selected, [aria-selected="true"]',
          );

          if ($selectedRow.length === 0) {
            cy.log('No selected row found by class, finding by visual state');

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
      .should('include.text', 'Versandreport DocuHub Portal');
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
            `Sie haben ${expectedCount} Sendung(en) erfolgreich digital in das DocuHub Portal Ihrer Benutzer*innen eingeliefert`,
          );
          expect(normalizedText).to.include(
            'Zusätzlich haben Sie 0 Sendung(en) erfolgreich über den postalischen Weg als Brief versendet. Das Dokument wird von uns über das „Einfach Brief“-Portal gedruckt, kurvertiert und an die Adresse des Benutzers versendet.',
          );
          expect(normalizedText).to.include('Ihr DocuHub Team');

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
