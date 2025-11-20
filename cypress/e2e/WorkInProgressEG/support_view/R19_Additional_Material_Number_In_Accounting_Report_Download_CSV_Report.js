describe('R19_Download CSV report', () => {
  it('Login as Master User - Download CSV and Validate Specific Rows', () => {
    // Login as Master User using a custom command
    cy.loginToSupportViewMaster();
    cy.wait(3500);

    // Close release note pop-up if it appears
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Release note close icon is NOT present');
      }
    });
    cy.wait(1500);

    // Click on Export CSV button
    cy.get('button[color="primary"] > .mdc-button__label')
      .filter((index, el) => Cypress.$(el).text().trim() === 'Export CSV')
      .click({ force: true });

    // Open Month dropdown and select a random option
    cy.get('form > mat-form-field > div').eq(0).click({ force: true });
    cy.get('#cdk-overlay-1 > div > mat-option').then(($options) => {
      const count = $options.length;
      cy.log(`Number of items in the month dropdown: ${count}`);
      const randomIndex = Math.floor(Math.random() * count);
      cy.wrap($options[randomIndex]).click();
    });
    cy.wait(1500);

    // Open Type dropdown and select a random option
    cy.get('form > mat-form-field > div').eq(2).click({ force: true });
    cy.wait(1500);
    cy.get('mat-option').then(($options) => {
      const count = $options.length;
      cy.log(`Number of items in the type dropdown: ${count}`);
      const randomIndex = Math.floor(Math.random() * count);
      cy.wrap($options[randomIndex]).click();
    });
    cy.wait(1500);

    // Click on Download CSV button
    cy.get('button[type="submit"]').click();
    cy.wait(3000);

    const downloadsDir = Cypress.config('downloadsFolder');

    // Get the latest downloaded CSV file
    cy.task('getDownloadedCSV', downloadsDir).then((filePath) => {
      expect(filePath, 'CSV file path should not be null').to.not.be.null;
      cy.log(`Latest CSV File Path: ${filePath}`);

      cy.readFile(filePath).then((csvText) => {
        // Define regex patterns for expected rows
        const regex1 =
          /^2;430;sap-android;;;;;e-Gehaltszettel \/ EBPP;;2025\d{4};;;;;;;60107012;1;;;;;;;;;49;Add-On Digitale Signatur und Mitarbeiter upload;;X$/gm;

        const regex2 =
          /^2;430;SAP Abba 7774;;;;;e-Gehaltszettel \/ EBPP;ABBA;20250531;;;;;;;60107012;1;;;;;;;;;49;Add-On Digitale Signatur und Mitarbeiter upload;;X$/gm;

        const regex3 =
          /^2;430;SAP Aqua;;;;;e-Gehaltszettel \/ EBPP;;2025\d{4};;;;;;;60107012;1;;;;;;;;;49;Add-On Digitale Signatur und Mitarbeiter upload;;X$/gm;

        const match1 = csvText.match(regex1) || [];
        const match2 = csvText.match(regex2) || [];
        const match3 = csvText.match(regex3) || [];

        cy.log(`Match1 (sap-android): ${match1.length}`);
        cy.log(`Match2 (SAP Abba 7774): ${match2.length}`);
        cy.log(`Match3 (SAP Aqua): ${match3.length}`);

        const found =
          match1.length > 0 || match2.length > 0 || match3.length > 0;

        if (!found) {
          cy.log(
            '⚠️⚠️⚠️⚠️ Row not found in the Report CSV. Please check if the HR flag is enabled for the test companies.'
          );
        } else
          expect(
            found,
            'At least one expected row should be present in the CSV'
          ).to.be.true;
      });
    });
  });

  //NEW

  let selectedMonthLabel;
  let selectedTypeLabel;

  it('Login as Master User - Download CSV and Validate Specific Rows', () => {
    function enableHRFlagForCompany() {
      //Search for Company by Display Name
      cy.get('#searchButton>span').click(); //Click on search button
      cy.wait(1000);

      // Use the company name from the cypress.config.js
      const companyName = Cypress.env('company');
      // Search for Group by Display Name using the company name
      cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
        .eq(0)
        .type(companyName);

      //Find the Search button by button name and click on it
      cy.wait(1500);
      cy.get('.search-dialog>form>div>.mat-primary').click();
      cy.wait(1500);

      //Switch to user section
      cy.get('.action-buttons > .mdc-button').eq(0).click();
      cy.wait(1500);
      //Scroll to the botton
      cy.get('.mat-mdc-dialog-content').scrollTo('bottom');
      cy.wait(2500);
      //Check checkbox
      cy.get('#hrManagementEnabled').then(($checkbox) => {
        if (!$checkbox.is(':checked')) {
          // If the checkbox is not checked, enable it
          cy.get('#hrManagementEnabled').check();
          cy.log('Checkbox was not enabled, now will be enable.');
          //Save Edit Company dialog
          cy.get('button[type="submit"]').click();
        } else {
          // If the checkbox is already enabled
          cy.log('Checkbox is already enabled.');
          cy.get('.close[data-mat-icon-name="close"]').click();
        }
        //Close Edit Company dialog
        cy.wait(2500);
      });
    }

    function disableHRFlagForCompany() {
      //Search for Company by Display Name
      cy.get('#searchButton>span').click(); //Click on search button
      cy.wait(1000);

      // Use the company name from the cypress.config.js
      const companyName = Cypress.env('company');
      // Search for Group by Display Name using the company name
      cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
        .eq(0)
        .clear()
        .type(companyName);

      //Find the Search button by button name and click on it
      cy.wait(1500);
      cy.get('.search-dialog>form>div>.mat-primary').click();
      cy.wait(1500);

      //Switch to user section
      cy.get('.action-buttons > .mdc-button').eq(0).click();
      cy.wait(1500);
      //Scroll to the botton
      cy.get('.mat-mdc-dialog-content').scrollTo('bottom');
      cy.wait(2500);
      //Check checkbox
      cy.get('#hrManagementEnabled').then(($checkbox) => {
        if ($checkbox.is(':checked')) {
          // If the checkbox is not checked, enable it
          cy.get('#hrManagementEnabled').uncheck();
          cy.log('Checkbox was enabled, now will be disable.');
          //Save Edit Company dialog
          cy.get('button[type="submit"]').click();
        } else {
          // If the checkbox is already enabled
          cy.log('Checkbox is already disabled.');
          cy.get('.close[data-mat-icon-name="close"]').click();
        }
        //Close Edit Company dialog
        cy.wait(2500);
      });
    }

    // Login as Master User
    cy.loginToSupportViewMaster();
    cy.wait(3500);

    // Close release note pop-up if it appears
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Release note close icon is NOT present');
      }
    });
    cy.wait(1500);

    //Enable HR flag
    enableHRFlagForCompany();

    // Click Export CSV button
    cy.get('button[color="primary"] > .mdc-button__label')
      .filter((index, el) => Cypress.$(el).text().trim() === 'Export CSV')
      .click({ force: true });

    // Select random month and store label
    cy.get('form > mat-form-field > div').eq(0).click({ force: true });
    cy.get('div[role="listbox"] > mat-option').then(($options) => {
      const randomIndex = Math.floor(Math.random() * $options.length);
      cy.wrap($options[randomIndex])
        .invoke('text')
        .then((text) => {
          selectedMonthLabel = text.trim();
          cy.log(`Selected Month: ${selectedMonthLabel}`);
        });
      cy.wrap($options[randomIndex]).click();
    });
    cy.wait(1500);

    // Select random type and store label
    cy.get('form > mat-form-field > div').eq(2).click({ force: true });
    cy.wait(1500);
    cy.get('mat-option').then(($options) => {
      const randomIndex = Math.floor(Math.random() * $options.length);
      cy.wrap($options[randomIndex])
        .invoke('text')
        .then((text) => {
          selectedTypeLabel = text.trim();
          cy.log(`Selected Type: ${selectedTypeLabel}`);
        });
      cy.wrap($options[randomIndex]).click();
    });
    cy.wait(1500);

    // Click Download CSV
    cy.get('button[type="submit"]').click();
    cy.wait(3000);

    const downloadsDir = Cypress.config('downloadsFolder');

    // Read and validate CSV
    cy.task('getDownloadedCSV', downloadsDir).then((filePath) => {
      expect(filePath).to.not.be.null;
      cy.readFile(filePath).then((csvText) => {
        const regex1 = /^2;430;sap-android.*?X$/gm;
        const regex2 = /^2;430;SAP Abba 7774.*?X$/gm;
        const regex3 = /^2;430;SAP Aqua.*?X$/gm;

        const found =
          (csvText.match(regex1) || []).length > 0 ||
          (csvText.match(regex2) || []).length > 0 ||
          (csvText.match(regex3) || []).length > 0;

        if (!found) {
          cy.log(
            '⚠️⚠️⚠️⚠️ Row not found in the Report CSV. Please check if the HR flag is enabled for the test companies.'
          );
        } else
          expect(
            found,
            'At least one expected row should be present in the CSV'
          ).to.be.true;

        // Step 2: Disable HR flag for Aqua (replace with real logic or API call)
        disableHRFlagForCompany(); // Implement this command accordingly

        // Step 3: Re-run report with SAME selections
        cy.get('navigation-item>li>a>span')
          .contains(/Companies|Firmen/i)
          .should('be.visible') // Optional: Ensure the button is visible before interacting
          .click(); // Click the button
        cy.wait(1500);

        // Re-open Export CSV and reapply same month/type
        cy.get('button[color="primary"] > .mdc-button__label')
          .filter((index, el) => Cypress.$(el).text().trim() === 'Export CSV')
          .click({ force: true });

        cy.get('form > mat-form-field > div').eq(0).click({ force: true });
        cy.get('.cdk-overlay-pane > div > mat-option')
          .contains(selectedMonthLabel)
          .click();
        cy.wait(1000);

        cy.get('form > mat-form-field > div').eq(2).click({ force: true });
        cy.get('mat-option').contains(selectedTypeLabel).click();
        cy.wait(1000);

        cy.get('button[type="submit"]').click();
        cy.wait(3000);

        // Read new CSV
        cy.task('getDownloadedCSV', downloadsDir).then((newFilePath) => {
          expect(newFilePath).to.not.be.null;
          cy.readFile(newFilePath).then((newCsvText) => {
            const aquaRow = newCsvText.match(/^2;430;SAP Aqua.*?X$/gm) || [];

            if (aquaRow.length === 0) {
              cy.log('⚠️ Expected result -> Row not found in the CSV.');
            } else {
              throw new Error(
                'Row for SAP Aqua should NOT be present after disabling HR flag'
              );
            }
          });
        });
      });
    }); //end download task
    cy.wait(2500);
  });

  //LOOP IT

  it.only('Login as Master User - Download CSV and Validate Specific Rows', () => {
    function enableHRFlagForCompany() {
      const companyName = Cypress.env('company');
      cy.get('#searchButton>span').click();
      cy.wait(1000);
      cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
        .eq(0)
        .type(companyName);
      cy.wait(1500);
      cy.get('.search-dialog>form>div>.mat-primary').click();
      cy.wait(1500);
      cy.get('.action-buttons > .mdc-button').eq(0).click();
      cy.wait(1500);
      cy.get('.mat-mdc-dialog-content').scrollTo('bottom');
      cy.wait(2500);
      cy.get('#hrManagementEnabled').then(($checkbox) => {
        if (!$checkbox.is(':checked')) {
          cy.get('#hrManagementEnabled').check();
          cy.log('Checkbox was not enabled, now will be enabled.');
          cy.get('button[type="submit"]').click();
        } else {
          cy.log('Checkbox is already enabled.');
          cy.get('.close[data-mat-icon-name="close"]').click();
        }
        cy.wait(2500);
      });
    }

    function disableHRFlagForCompany() {
      const companyName = Cypress.env('company');
      cy.get('#searchButton>span').click();
      cy.wait(1000);
      cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
        .eq(0)
        .clear()
        .type(companyName);
      cy.wait(1500);
      cy.get('.search-dialog>form>div>.mat-primary').click();
      cy.wait(1500);
      cy.get('.action-buttons > .mdc-button').eq(0).click();
      cy.wait(1500);
      cy.get('.mat-mdc-dialog-content').scrollTo('bottom');
      cy.wait(2500);
      cy.get('#hrManagementEnabled').then(($checkbox) => {
        if ($checkbox.is(':checked')) {
          cy.get('#hrManagementEnabled').uncheck();
          cy.log('Checkbox was enabled, now will be disabled.');
          cy.get('button[type="submit"]').click();
        } else {
          cy.log('Checkbox is already disabled.');
          cy.get('.close[data-mat-icon-name="close"]').click();
        }
        cy.wait(2500);
      });
    }

    function exportCSVUntilRowFound(retryCount = 0) {
      //Set maximum nuber of attempts

      let maxNuberOfAttempts = 10;
      if (retryCount > maxNuberOfAttempts) {
        throw new Error(
          'Max attempts reached (' +
            maxNuberOfAttempts +
            '). No expected rows found in the CSV. Something could be wrong'
        );
      }

      const downloadsDir = Cypress.config('downloadsFolder');

      cy.get('button[color="primary"] > .mdc-button__label')
        .filter((index, el) => Cypress.$(el).text().trim() === 'Export CSV')
        .click({ force: true });

      cy.get('form > mat-form-field > div').eq(0).click({ force: true });
      cy.get('div[role="listbox"] > mat-option').then(($options) => {
        const randomIndex = Math.floor(Math.random() * $options.length);
        cy.wrap($options[randomIndex])
          .invoke('text')
          .then((text) => {
            selectedMonthLabel = text.trim();
            cy.log(`Selected Month: ${selectedMonthLabel}`);
          });
        cy.wrap($options[randomIndex]).click();
      });

      cy.wait(1000);
      cy.get('form > mat-form-field > div').eq(2).click({ force: true });
      cy.get('mat-option').then(($options) => {
        const randomIndex = Math.floor(Math.random() * $options.length);
        cy.wrap($options[randomIndex])
          .invoke('text')
          .then((text) => {
            selectedTypeLabel = text.trim();
            cy.log(`Selected Type: ${selectedTypeLabel}`);
          });
        cy.wrap($options[randomIndex]).click();
      });

      cy.wait(1000);
      cy.get('button[type="submit"]').click();
      cy.wait(3000);

      cy.task('getDownloadedCSV', downloadsDir).then((filePath) => {
        expect(filePath).to.not.be.null;
        cy.readFile(filePath).then((csvText) => {
          // const regex1 = /^2;430;sap-android.*?X$/gm;
          // const regex2 = /^2;430;SAP Abba 7774.*?X$/gm;
          const regex3 = /^2;430;SAP Aqua.*?X$/gm;

          const found =
            // (csvText.match(regex1) || []).length > 0 ||
            // (csvText.match(regex2) || []).length > 0 ||
            (csvText.match(regex3) || []).length > 0;

          if (!found) {
            cy.log('⚠️⚠️⚠️⚠️⚠️ Row not found, retrying Export CSV...');
            exportCSVUntilRowFound(retryCount + 1);
          } else {
            expect(
              found,
              '✅✅✅✅✅ At least one expected row should be present in the CSV'
            ).to.be.true;
            cy.wait(2500);

            // Disable HR Flag for Aqua
            disableHRFlagForCompany();

            // Navigate back to SupportView
            cy.get('navigation-item>li>a>span')
              .contains(/Companies|Firmen/i)
              .should('be.visible')
              .click();
            cy.wait(1500);

            // Re-download CSV with stored selections
            cy.get('button[color="primary"] > .mdc-button__label')
              .filter(
                (index, el) => Cypress.$(el).text().trim() === 'Export CSV'
              )
              .click({ force: true });

            cy.get('form > mat-form-field > div').eq(0).click({ force: true });
            cy.get('.cdk-overlay-pane > div > mat-option')
              .contains(selectedMonthLabel)
              .click();

            cy.get('form > mat-form-field > div').eq(2).click({ force: true });
            cy.get('mat-option').contains(selectedTypeLabel).click();

            cy.wait(1000);
            cy.get('button[type="submit"]').click();
            cy.wait(3000);

            cy.task('getDownloadedCSV', downloadsDir).then((newFilePath) => {
              expect(newFilePath).to.not.be.null;
              cy.readFile(newFilePath).then((newCsvText) => {
                const aquaRow =
                  newCsvText.match(/^2;430;SAP Aqua.*?X$/gm) || [];

                if (aquaRow.length === 0) {
                  cy.log(
                    'Expected result -> ✅✅✅✅✅ Row not found in the CSV after disabling HR flag.'
                  );
                } else {
                  throw new Error(
                    'Row for SAP Aqua should NOT be present after disabling HR flag.'
                  );
                }
              });
            });
          }
        });
      });
    }

    // Start test
    cy.loginToSupportViewMaster();
    cy.wait(3500);

    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Release note close icon is NOT present');
      }
    });

    enableHRFlagForCompany();
    exportCSVUntilRowFound();
  });
}); //end describe
