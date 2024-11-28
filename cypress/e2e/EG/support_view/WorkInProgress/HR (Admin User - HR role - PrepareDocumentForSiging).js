describe('hrManagement - prepare doc for signing (HappyPath)', () => {
  //Check if Admin has access to HR page in SW

  function checkIfAdminHasAccessToHrPage() {
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
            .should('be.visible');
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
  } // end function

  // Click on Admin User button
  function clickOnAdminUserButton() {
    const collectedButtonTexts = []; // Array to store all link texts

    cy.get('.ng-star-inserted>.action-buttons>button')
      .find('.mdc-button__label')
      .each(($el) => {
        cy.wrap($el)
          .invoke('text')
          .then((text) => {
            collectedButtonTexts.push(text.trim()); // Collect each link text in the array
            cy.log('Collected Button Text:', text.trim());
          });
      })
      .then(() => {
        const isAdminUserButton = collectedButtonTexts.some((text) =>
          ['Admin User', 'Admin Benutzer'].includes(text)
        );
        //Check if Admin has access to HR page in SW
        if (isAdminUserButton) {
          // Find the specific elements and click on it
          cy.get('.ng-star-inserted>.action-buttons>button')
            .contains(/Admin User|Admin Benutzer/)
            .click({ force: true });
        }
      });
    cy.wait(1500);
  }

  // clickRoleRechteButtonForAquaUser
  function clickRoleRechteButtonForAquaUser() {
    // Locate the row that contains the user "Aqua"
    cy.wait(1500);
    cy.get('sv-table>cdk-table>cdk-row>.cdk-column-firstName') // Assumes each user is in a table row
      .contains('.cdk-column-firstName', 'Aqua') // Find the cell that contains "Aqua" in the Vorname column
      .parent() // Get the row containing this cell
      .within(() => {
        // Now, within this row, find the "Role | Rechte" button and click it
        cy.contains(/Rechte|Rights/i) // Find the button that contains the text "Rechte" or "Role"
          .click(); // Click the button
      });
  }

  // Enable HR-Manager checkbox on Admin's Role dialog
  function enableHrManagerRole() {
    // Access the input checkbox within the mat-checkbox component
    cy.get('#mat-mdc-checkbox-5-input').then(($checkboxInput) => {
      if (!$checkboxInput.is(':checked')) {
        // If the checkbox is not checked, enable it by clicking the input element directly
        cy.get('#mat-mdc-checkbox-5-input').click({ force: true });
        cy.log('Checkbox was not enabled, now enabled.');
        cy.wait(1500);

        // Save changes in the Admin's Role dialog
        cy.get('button[type="submit"]').click();
      } else {
        // If the checkbox is already enabled, close the Rights dialog
        cy.log('Checkbox is already enabled.');
        cy.wait(1500);
        cy.get('.close[data-mat-icon-name="close"]').click();
      }
    });
  }

  // Enable HR-Manager and Disable DataSubmitter roles
  function enableHrAndDisableDataSubmitterRoles() {
    // Enable HR Role
    cy.get('#mat-mdc-checkbox-5-input').then(($checkboxInput) => {
      if (!$checkboxInput.is(':checked')) {
        // If the HR Role is not checked, enable it
        cy.get('#mat-mdc-checkbox-5-input').click({ force: true });
        cy.log('Checkbox was not enabled, now enabled.');
        cy.wait(1500);
      } else {
        // HR Role is enabled
        cy.log('Checkbox is already enabled.');
        cy.wait(1500);
      }
    });
    cy.wait(1500);
    //Disable Data Submitter Role
    cy.get('#mat-mdc-checkbox-3-input').then(($checkboxInput) => {
      if ($checkboxInput.is(':checked')) {
        // If the Data Submitter Role is checked, uncheck it
        cy.get('#mat-mdc-checkbox-3-input').click({ force: true });
        cy.log('Checkbox was enabled, now disabled.');
        cy.wait(2500);
        // Save changes in the Admin's Role dialog
        cy.get('button[type="submit"]').click();
      } else {
        // If the Data Submitter Role is disabled, close the Rights dialog
        cy.log('Checkbox is already disabled.');
        cy.wait(2500);
        cy.get('.close[data-mat-icon-name="close"]').click();
      }
    });
  }

  // Disable HR-Manager checkbox on Admin's Role dialog
  function disableHrManagerRole() {
    // Access the input checkbox within the mat-checkbox component
    cy.get('#mat-mdc-checkbox-5-input').then(($checkboxInput) => {
      if ($checkboxInput.is(':checked')) {
        // If the checkbox is checked, uncheck it by clicking the input element directly
        cy.get('#mat-mdc-checkbox-5-input').click({ force: true });
        cy.log('Checkbox was enabled, now disabled.');
        cy.wait(2500);
        // Save changes in the Admin's Role dialog
        cy.get('button[type="submit"]').click();
      } else {
        // If the checkbox is already disabled, close the Rights dialog
        cy.log('Checkbox is already disabled.');
        cy.wait(2500);
        cy.get('.close[data-mat-icon-name="close"]').click();
      }
    });
  }

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

  // Activate Ebox User For Selected Company
  function activateEboxUserForSelectedCompany() {
    // Search for 'Aqua' Group, by Display Name
    cy.get('#searchButton>span').click(); //Click on search button
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      // Use the company name from the JSON file
      const companyName = payslipJson.company;
      const EBoxUser = payslipJson.username_egEbox;
      // Search for Group by Display Name using the company name
      cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
        .eq(1)
        .type(companyName);
      //Find the Search button by button name and click on it
      cy.get('.search-dialog>form>div>.mat-primary').click();
      cy.wait(1500);

      // Switch to User page, by clicking on User button
      cy.get('.ng-star-inserted .action-buttons button')
        .last()
        .click({ force: true });
      //Ebox User
      // Find the row with the target username and check the button state
      cy.get('cdk-table > cdk-row').each(($row) => {
        cy.wrap($row)
          .find('.cdk-column-username .cell-content-wrap .inline-div div')
          .invoke('text')
          .then((username) => {
            if (username.trim() === EBoxUser) {
              cy.log(`Found User: ${username.trim()}`);
              cy.wait(2000);
              // Skip if "Deactivate" or "Deaktivieren" button is shown;
              cy.wrap($row)
                .find('button')
                .then(($buttons) => {
                  const buttonTexts = $buttons
                    .map((i, el) => Cypress.$(el).text().trim())
                    .get();

                  if (
                    buttonTexts.includes('Deactivate') ||
                    buttonTexts.includes('Deaktivieren')
                  ) {
                    cy.log(
                      'Skipping Activate if Activate or Aktivieren button is visible'
                    );
                    return false; // Skip this row
                  } else {
                    // Click "Activate" or "Aktivierung" button
                    cy.wrap($row)
                      .find('button')
                      .contains(/Activate|Aktivierung/)
                      .click({ force: true });
                    cy.log('Activated the user.');
                  }
                });
              // Exit the loop early once the correct user is found and processed
              return false;
            }
          });
      });
    });
  }

  // Deactivate Ebox User For Selected Company
  function deactivateEboxUserForSelectedCompany() {
    // Search for 'Aqua' Group, by Display Name
    cy.get('#searchButton>span').click(); //Click on search button
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      // Use the company name from the JSON file
      const companyName = payslipJson.company;
      const EBoxUser = payslipJson.username_egEbox;
      // Search for Group by Display Name using the company name
      cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
        .eq(1)
        .type(companyName);
      //Find the Search button by button name and click on it
      cy.get('.search-dialog>form>div>.mat-primary').click();
      cy.wait(1500);

      // Switch to User page, by clicking on User button
      cy.get('.ng-star-inserted .action-buttons button')
        .last()
        .click({ force: true });
      //Ebox User
      // Find the row with the target username and check the button state
      cy.get('cdk-table > cdk-row').each(($row) => {
        cy.wrap($row)
          .find('.cdk-column-username .cell-content-wrap .inline-div div')
          .invoke('text')
          .then((username) => {
            if (username.trim() === EBoxUser) {
              cy.log(`Found User: ${username.trim()}`);
              cy.wait(2000);
              // Skip if "Deactivate" or "Deaktivieren" button is shown;
              cy.wrap($row)
                .find('button')
                .then(($buttons) => {
                  const buttonTexts = $buttons
                    .map((i, el) => Cypress.$(el).text().trim())
                    .get();

                  if (
                    buttonTexts.includes('Aactivate') ||
                    buttonTexts.includes('Aktivieren')
                  ) {
                    cy.log(
                      'Skipping Deactivating action, if Deactivate or Deaktivieren button is visible'
                    );
                    return false; // Skip this row
                  } else {
                    // Click "Activate" or "Aktivierung" button
                    cy.wrap($row)
                      .find('button')
                      .contains(/Deactivate|Deaktivierung/)
                      .click({ force: true });
                    cy.log('Deactivated the user.');
                  }
                });
              // Exit the loop early once the correct user is found and processed
              return false;
            }
          });
      });
    });
  }

  //-------------------End Custom Function-------------------

  // Define a variable to store the formatted date and time after document upload

  //  Enable hrManagement' flag, on the Edit Company dialog
  it('Enable hrManagement flag on Company', () => {
    //Import credentials (un/pw) from 'supportView.json' file
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(payslipJson.baseUrl); //Taken from base url
      cy.url().should('include', payslipJson.baseUrl); //Validating url on the login page
      //Login to sw
      cy.fixture('supportView.json').as('payslipSW');
      cy.get('@payslipSW').then((payslipJson) => {
        cy.get('input[formcontrolname="username"]').type(
          payslipJson.username_supportViewMaster
        );
        cy.get('input[formcontrolname="password"]').type(
          payslipJson.password_supportViewMaster
        );
        cy.get('button[type="submit"]').click();
      });

      //Search for Group by Display Name
      cy.get('#searchButton>span').click(); //Click on search button
      cy.wait(1000);
      cy.fixture('supportView.json').as('payslipSW');
      cy.get('@payslipSW').then((payslipJson) => {
        // Use the company name from the JSON file
        const companyName = payslipJson.company;
        // Search for Group by Display Name using the company name
        cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
          .eq(1)
          .type(companyName);
      });
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
          cy.log('Checkbox was not enabled, now enabled.');
          //Save Edit Company dialog
          cy.get('button[type="submit"]').click();
        } else {
          // If the checkbox is already enabled
          cy.log('Checkbox is already enabled.');
          cy.get('.close[data-mat-icon-name="close"]').click();
        }
        //Close Edit Company dialog
        cy.wait(2500);
        //Logout
        cy.get('.logout-icon ').click();
        cy.wait(2000);
        cy.get('.confirm-buttons > :nth-child(2)').click();
        cy.url().should('include', payslipJson.baseUrl); // Validate url'
        cy.log('Test completed successfully.');
        cy.wait(2500);
      }); //end
    });
  }); //end it

  // //Disable hrManagement on the Admin Users Role dilaog
  // it('Disable hrManagement Admin Users Role', () => {
  //   //Login as a Master-User
  //   cy.fixture('supportView.json').as('payslipSW');
  //   cy.get('@payslipSW').then((payslipJson) => {
  //     cy.visit(payslipJson.baseUrl); //Taken from base url
  //     cy.url().should('include', payslipJson.baseUrl); //Validating url on the login page
  //     //Login to sw
  //     cy.get('@payslipSW').then((payslipJson) => {
  //       cy.get('input[formcontrolname="username"]').type(
  //         payslipJson.username_supportViewMaster
  //       );
  //       cy.get('input[formcontrolname="password"]').type(
  //         payslipJson.password_supportViewMaster
  //       );
  //       cy.get('button[type="submit"]').click();
  //     });
  //     //Search for 'Aqua' Group, by Display Name
  //     cy.get('#searchButton>span').click(); //Click on search button
  //     cy.wait(1000);
  //     cy.fixture('supportView.json').as('payslipSW');
  //     cy.get('@payslipSW').then((payslipJson) => {
  //       // Use the company name from the JSON file
  //       const companyName = payslipJson.company;
  //       // Search for Group by Display Name using the company name
  //       cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
  //         .eq(1)
  //         .type(companyName);
  //     });
  //     cy.wait(1500);
  //     //Find the Search button by button name and click on it
  //     cy.get('.search-dialog>form>div>.mat-primary').click();
  //     cy.wait(1500);

  //     // Switch on Admin User page
  //     clickOnAdminUserButton();

  //     // Switch on Admin user's Role dilaog
  //     clickRoleRechteButtonForAquaUser();

  //     //Disable HR Role (Admin user)
  //     disableHrManagerRole();
  //     cy.log('HR Role is successfully disabled');
  //     cy.wait(3000);

  //     //Logout
  //     cy.get('.logout-icon ').click();
  //     cy.wait(2000);
  //     cy.get('.confirm-buttons > :nth-child(2)').click();
  //     cy.url().should('include', payslipJson.baseUrl); // Validate url'
  //     cy.log('Test completed successfully.');
  //     cy.wait(2500);
  //   });
  // }); //end it

  // //Check if Admin has access to HR page in SW (before enabling )
  // it('Check if Admin has access to HR page in SW (before enabling )', () => {
  //   // Load credentials (un/pw) and user data from 'supportView.json'
  //   cy.fixture('supportView.json').as('payslipSW');
  //   cy.get('@payslipSW').then((payslipJson) => {
  //     cy.visit(payslipJson.baseUrl); // Visit base URL from fixture
  //     cy.url().should('include', payslipJson.baseUrl); // Validate the URL

  //     // Login to SW as Admin User
  //     cy.get('input[formcontrolname="username"]').type(
  //       payslipJson.username_supportViewAdmin
  //     );
  //     cy.get('input[formcontrolname="password"]').type(
  //       payslipJson.password_supportViewAdmin
  //     );
  //     cy.get('button[type="submit"]').click();

  //     // Wait for login to complete
  //     cy.wait(1500);

  //     //Check if Admin has access to HR page in SW
  //     checkIfAdminHasAccessToHrPage();
  //     cy.wait(2500);
  //     //Logout
  //     cy.get('.logout-icon ').click();
  //     cy.wait(2000);
  //     cy.get('.confirm-buttons > :nth-child(2)').click();
  //     cy.url().should('include', payslipJson.baseUrl); // Validate url'
  //     cy.log('Test completed successfully.');
  //     cy.wait(2500);
  //   });
  // }); //end it

  //Enable Hr And Disable DataSubmitter Roles
  it('enableHrAndDisableDataSubmitterRoles', () => {
    //Login as a Master-User
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(payslipJson.baseUrl); //Taken from base url
      cy.url().should('include', payslipJson.baseUrl); //Validating url on the login page
      //Login to sw
      cy.get('@payslipSW').then((payslipJson) => {
        cy.get('input[formcontrolname="username"]').type(
          payslipJson.username_supportViewMaster
        );
        cy.get('input[formcontrolname="password"]').type(
          payslipJson.password_supportViewMaster
        );
        cy.get('button[type="submit"]').click();
      });
      //Search for 'Aqua' Group, by Display Name
      cy.get('#searchButton>span').click(); //Click on search button
      cy.fixture('supportView.json').as('payslipSW');
      cy.get('@payslipSW').then((payslipJson) => {
        // Use the company name from the JSON file
        const companyName = payslipJson.company;
        // Search for Group by Display Name using the company name
        cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
          .eq(1)
          .type(companyName);
      });
      //Find the Search button by button name and click on it
      cy.get('.search-dialog>form>div>.mat-primary').click();
      cy.wait(1500);

      // Switch on Admin User page
      clickOnAdminUserButton();

      // Switch on Admin user's Role dilaog
      clickRoleRechteButtonForAquaUser();

      //Enable HR Role (Admin user)
      enableHrAndDisableDataSubmitterRoles();
      cy.wait(3000);

      //Logout
      cy.get('.logout-icon ').click();
      cy.wait(2000);
      cy.get('.confirm-buttons > :nth-child(2)').click();
      cy.url().should('include', payslipJson.baseUrl); // Validate url'
      cy.log('Test completed successfully.');
      cy.wait(2500);
    });
  }); //end it

  //Prepare document For Signing - From Mass Upload Button
  it.skip('prepareDocumentForSigningMassUpload', () => {
    // Load credentials (un/pw) and user data from 'supportView.json'
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(payslipJson.baseUrl); // Visit base URL from fixture
      cy.url().should('include', payslipJson.baseUrl); // Validate the URL

      // Login to SW as Admin User
      cy.get('input[formcontrolname="username"]').type(
        payslipJson.username_supportViewAdmin
      );
      cy.get('input[formcontrolname="password"]').type(
        payslipJson.password_supportViewAdmin
      );
      cy.get('button[type="submit"]').click();

      // Wait for login to complete
      cy.wait(1500);
      //Click On Mass Upload Button
      cy.get('.upload__document>.mdc-button__label>.upload__document__text')
        .filter((index, el) => {
          const text = Cypress.$(el).text().trim();
          return text === 'Mass Upload' || text === 'Massensendung hochladen';
        })
        .click();
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
      //Click on Mass upload button
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

      //Uplad valid document (1 A4 pdf file)
      cy.massUpload();
      cy.wait(2000);

      //Add Title
      cy.get('input[formcontrolname="subject"]').clear().type('HR-MassUpload');
      cy.wait(1500);

      // Select Company
      cy.get('.broadcast-companies').click();
      cy.wait(1000);

      // Find the dropdown item and check if it's selected
      cy.get('.mdc-list-item__primary-text')
        .contains('AQUA GmbH - AQUA') // Find the dropdown item directly by its text
        .then(($el) => {
          // Navigate to the parent element to locate the checkbox state indicator
          cy.wrap($el)
            .parent()
            .find('.mat-pseudo-checkbox') // Replace with the correct class/attribute that represents the checkbox state
            .should('exist') // Ensure the checkbox exists
            .then(($checkboxInput) => {
              // Check the state of the checkbox
              const isChecked = $checkboxInput.hasClass(
                'mat-pseudo-checkbox-checked'
              );
              if (!isChecked) {
                // If the checkbox is not checked, click the item to check it
                cy.wrap($el).click();
                cy.log('Checkbox was not enabled, now enabled.');
              } else {
                // If the checkbox is already checked, log its state
                cy.log('Checkbox is already enabled.');
              }
            });
        });
      //Focus out
      cy.get('body').type('{esc}');
      cy.wait(1500);
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
      cy.wait(3000);
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

      //Logout
      cy.get('.logout-icon ').click();
      cy.wait(2000);
      cy.get('.confirm-buttons > :nth-child(2)').click();
      cy.url().should('include', payslipJson.baseUrl); // Validate url'
      cy.log('Test completed successfully.');
      cy.wait(2500);
    });
  }); //end it

  //Sign HR Delivery
  it.skip('Ebox user signing HR delivery_1 Signatures', () => {
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(payslipJson.baseUrl_egEbox); // Taken from base URL
      cy.url().should('include', payslipJson.baseUrl_egEbox); // Validate URL on the login page
      cy.wait(2000);

      //Remove Cookie
      cy.get('body').then(($body) => {
        if ($body.find('#onetrust-policy-title').is(':visible')) {
          // If the cookie bar is visible, click on it and remove it
          cy.get('#onetrust-accept-btn-handler').click();
        } else {
          // Log that the cookie bar was not visible
          cy.log('Cookie bar not visible');
        }
      }); //End Remove Cookie

      // Login to E-Box
      cy.get(':nth-child(1) > .ng-invalid > .input > .input__field-input').type(
        payslipJson.username_egEbox
      );
      cy.get('.ng-invalid > .input > .input__field-input').type(
        payslipJson.password_egEbox
      );
      cy.wait(1000);
      cy.get('button[type="submit"]').click();
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

      cy.get('.mdc-data-table__content>tr>.subject-sender-cell')
        .eq(0)
        .click({ force: true });
      cy.wait(12000);

      // Scroll to the bottom of the PDF viewer or page
      // cy.pause();

      cy.get('.content-container>.scroll-container').eq(1).scrollTo('bottom', {
        duration: 500,
        ensureScrollable: false,
      });

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
        cy.wait(5000);
        cy.get('.success-notification>.notification-message')
          .should('be.visible') // Ensure the success message is visible
          .should('have.text', ' Signatur wurde erfolgreich erstellt. '); // Verify success message text

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
      cy.url().should('include', payslipJson.baseUrl_egEbox); // Validate url
      cy.log('Test completed successfully.');
    });
  });

  // Admin User is able to check new HR Delivery received in HR page
  it.skip('Admin User checks new delivery received in the HR page in SW', () => {
    // Load credentials and user data from 'supportView.json'
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(payslipJson.baseUrl); // Visit base URL from fixture
      cy.url().should('include', payslipJson.baseUrl); // Validate the URL

      // Login to SW as Admin User
      cy.get('input[formcontrolname="username"]').type(
        payslipJson.username_supportViewAdmin
      );
      cy.get('input[formcontrolname="password"]').type(
        payslipJson.password_supportViewAdmin
      );
      cy.get('button[type="submit"]').click();
      // Wait for login to complete
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
                .first()
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
      //Logout
      cy.get('.logout-icon ').click();
      cy.wait(2000);
      cy.get('.confirm-buttons > :nth-child(2)').click();
      cy.log('Test completed successfully.');
      cy.wait(2500);
    }); //end
  });

  //Prepare document For Signing - For Specific user
  it('prepareDocumentForSpecificUser_2SiganturePlaceholders', () => {
    // Load credentials (un/pw) and user data from 'supportView.json'
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(payslipJson.baseUrl); // Visit base URL from fixture
      cy.url().should('include', payslipJson.baseUrl); // Validate the URL

      // Login to SW as Admin User
      cy.get('input[formcontrolname="username"]').type(
        payslipJson.username_supportViewAdmin
      );
      cy.get('input[formcontrolname="password"]').type(
        payslipJson.password_supportViewAdmin
      );
      cy.get('button[type="submit"]').click();

      // Wait for login to complete
      cy.wait(1500);

      // Search for 'Aqua' Group, by Display Name
      cy.get('#searchButton>span').click(); //Click on search button

      // Use the company name from the JSON file
      const companyName = payslipJson.company;
      const EBoxUser = payslipJson.username_egEbox;

      // Search for Group by Display Name using the company name
      cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
        .eq(1)
        .type(companyName);
      cy.get('.search-dialog>form>div>.mat-primary').click(); // Click Search
      cy.wait(1500);
      cy.pause();
      // Switch to User page
      cy.get('.ng-star-inserted .action-buttons button')
        .last()
        .click({ force: true });

      // Click on "Select user to deliver documents"
      cy.get('.select-users-dialog-btn').click();

      // Search for the specific user by name
      cy.get('.dictionary-xml__search-container-input>input').type(EBoxUser);
      cy.wait(3500);

      // Find the row that matches the search result
      cy.get('table tbody tr')
        .contains(EBoxUser)
        .parents('tr') // Navigate to the parent row
        .within(() => {
          // Find and check the checkbox in the row if it's not already checked
          cy.get('input[type="checkbox"]').then(($checkbox) => {
            if (!$checkbox.is(':checked')) {
              cy.wrap($checkbox).check({ force: true });
              cy.log(`${EBoxUser} checkbox is now checked.`);
            } else {
              cy.log(`${EBoxUser} checkbox was already checked.`);
            }
          });
        });
      cy.wait(2000);
      //Click on Next buton
      cy.get('button>.title')
        .filter((index, el) => {
          const text = Cypress.$(el).text().trim();
          return text === 'Next' || text === 'Nächste';
        })
        .click();
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

      cy.get('.buttons-wrapper')
        .should('be.visible') // Validation check
        .then(($icon) => {
          // Apply green border to mark validation as successful
          cy.wrap($icon).invoke('css', 'border', '3px solid green');
          cy.log(
            'Validation passed: Unsigned icon is visible and marked in green.'
          );
        });
      cy.wait(3000);
      cy.pause();
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
          cy.wrap($button).invoke('css', 'border', '3px solid red');

          // Wait for 3 seconds
          cy.wait(3000);

          // Click the button
          cy.wrap($button).click();
        });

      cy.wait(3500);

      //Uplad valid document (x1 A4 pdf file)
      cy.massUpload();
      //Add Title
      cy.get('input[formcontrolname="subject"]')

        .clear()
        .type('HR-For Specific User');
      cy.wait(1500);

      //Prepare doc for signing
      //Add signature placeholder No.1
      cy.intercept(
        'GET',
        '**/hybridsign/backend_t/document/v1/getDocument/**'
      ).as('getDocument');
      cy.intercept('GET', '**/getIdentifications?**').as('getIdentifications');
      cy.get('.controls > .ng-star-inserted').click({ force: true });
      cy.wait(['@getDocument', '@getIdentifications'], { timeout: 13000 }).then(
        (interception) => {
          // Log the intercepted response
          cy.log('Intercepted response:', interception.response);

          // Optional: Assert the response status code
          // expect(interception.response.statusCode).to.eq(200);

          // Optional: Assert response body or other properties
          // Example: expect(interception.response.body).to.have.property('key', 'value');
          // cy.wait(1500);
        }
      );

      cy.get('.signatures-container>.signature-actions>a').click({
        force: true,
      }); //open add new signature dialog
      // cy.wait(1500);
      cy.get('input[formcontrolname="signee"]')
        .clear()
        .type('HR Document Signature Placeholder No1'); //Clear Input field & Enter signee name
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
      cy.wait(1500);
      //Confirm position of Signature placholder
      cy.get(
        '.placer-actions > .mat-accent > .mat-mdc-button-touch-target'
      ).click({
        force: true,
      }); //Signature placehoder is added
      cy.wait(1500);
      //
      //
      //

      //Add signature placeholder No.2
      cy.get('.signature-actions').click({ force: true });
      cy.wait(1500);

      cy.get('.signatures-container>.signature-actions>a').click({
        force: true,
      }); //open add new signature dialog
      cy.wait(1500);
      cy.get('input[formcontrolname="signee"]')
        .clear()
        .type('HR Document Signature Placeholder No2'); //Clear Input field & Enter signee name
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
          screenX: 1080,
          screenY: 800,
          clientX: 1080,
          clientY: 800,
          pageX: 1080,
          pageY: 800,
          eventConstructor: 'MouseEvent',
        })
        .trigger('mouseup', { force: true });
      cy.wait(1500);
      cy.get(
        '.placer-actions > .mat-accent > .mat-mdc-button-touch-target'
      ).click({
        force: true,
      }); //Signature placehoder is added
      // //
      //
      //

      cy.wait(2000);
      //Click on Save button
      cy.get('.tempSave').click({ force: true });
      cy.wait(2500);

      //Confirm Save temporaly dialog
      // cy.get('.mat-mdc-dialog-actions > .mat-accent >.mdc-button__label')
      //   .filter((index, el) => {
      //     const text = Cypress.$(el).text().trim();
      //     return text === 'SAVE TEMPORARY' || text === 'VORLÄUFIG SPEICHERN';
      //   })
      //   .click({ force: true });

      cy.wait(7500);
      cy.get('.dialog-footer>.dialog-actions>button>.title')
        .filter((index, el) => {
          const text = Cypress.$(el).text().trim();
          return text === 'Send' || text === 'Senden';
        })
        .click();
      cy.wait(4500);

      cy.get(
        '.mat-mdc-dialog-component-host>.dialog-container>.dialog-footer>.controls>button>.title'
      )
        .filter((index, el) => {
          const text = Cypress.$(el).text().trim();
          return text === 'Confirm' || text === 'Bestätigen';
        })
        .click({ force: true });
      cy.wait(4500);

      //Logout
      cy.get('.logout-icon ').click();
      cy.wait(2000);
      cy.get('.confirm-buttons > :nth-child(2)').click();
      cy.url().should('include', payslipJson.baseUrl); // Validate url'
      cy.log('Test completed successfully.');
      cy.wait(2500);
    });
  }); //end it

  //Sign HR Delivery
  it('Ebox user signing HR delivery_2 Signatures', () => {
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(payslipJson.baseUrl_egEbox); // Taken from base URL
      cy.url().should('include', payslipJson.baseUrl_egEbox); // Validate URL on the login page
      cy.wait(2000);

      //Remove Cookie
      cy.get('body').then(($body) => {
        if ($body.find('#onetrust-policy-title').is(':visible')) {
          // If the cookie bar is visible, click on it and remove it
          cy.get('#onetrust-accept-btn-handler').click();
        } else {
          // Log that the cookie bar was not visible
          cy.log('Cookie bar not visible');
        }
      }); //End Remove Cookie

      // Login to E-Box
      cy.get(':nth-child(1) > .ng-invalid > .input > .input__field-input').type(
        payslipJson.username_egEbox
      );
      cy.get('.ng-invalid > .input > .input__field-input').type(
        payslipJson.password_egEbox
      );
      cy.wait(1000);
      cy.get('button[type="submit"]').click();
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

      cy.get('.content-container>.scroll-container').eq(1).scrollTo('bottom', {
        duration: 500,
        ensureScrollable: false,
      });

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
      cy.url().should('include', payslipJson.baseUrl_egEbox); // Validate url
      cy.log('Test completed successfully.');
    });
  });

  function adminUserChecksNewDeliveryReceivedInHRpage() {
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(payslipJson.baseUrl); // Visit base URL from fixture
      cy.url().should('include', payslipJson.baseUrl); // Validate the URL

      // Login to SW as Admin User
      cy.get('input[formcontrolname="username"]').type(
        payslipJson.username_supportViewAdmin
      );
      cy.get('input[formcontrolname="password"]').type(
        payslipJson.password_supportViewAdmin
      );
      cy.get('button[type="submit"]').click();
      // Wait for login to complete
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
              cy.wrap($row);

              //       .find(
              //         '.cdk-column-userDataUpdateDate .cell-content-wrap .inline-div > div'
              //       )

              //       .invoke('text')
              //       .then((receivedDateText) => {
              //         // Log original received date text
              //         cy.log(`Original Received Date Text: ${receivedDateText}`);

              //         // Extract date and time parts
              //         const datePart = receivedDateText.trim().split(' ')[0]; // "dd.mm.yyyy"
              //         const timePart = receivedDateText
              //           .trim()
              //           .split(' ')[1]
              //           .slice(0, 5); // "hh:mm" (removing seconds)

              //         // Format to match "dd.mm.yyyy hh:mm" with leading zeros
              //         const [day, month, year] = datePart
              //           .split('.')
              //           .map((v) => v.padStart(2, '0'));
              //         const formattedReceivedDate = `${day}.${month}.${year} ${timePart}`;
              //         cy.log(`Formatted Received Date: ${formattedReceivedDate}`);

              //         // Parse uploadDateTime with consistent formatting
              //         const [uploadDay, uploadMonth, uploadYear] = uploadDateTime
              //           .split(' ')[0]
              //           .split('.');
              //         const [uploadHour, uploadMinute] = uploadDateTime
              //           .split(' ')[1]
              //           .split(':');
              //         const formattedUploadDate = `${uploadDay.padStart(
              //           2,
              //           '0'
              //         )}.${uploadMonth.padStart(
              //           2,
              //           '0'
              //         )}.${uploadYear} ${uploadHour}:${uploadMinute}`;

              //         // Create tolerance range by adding 1 minute
              //         const uploadDate = new Date(
              //           uploadYear,
              //           uploadMonth - 1,
              //           uploadDay,
              //           uploadHour,
              //           uploadMinute
              //         );
              //         const uploadDatePlusOneMinute = new Date(
              //           uploadDate.getTime() + 60000
              //         );

              //         // Format uploadDatePlusOneMinute to match "dd.mm.yyyy hh:mm"
              //         const formattedUploadDatePlusOneMinute = `${uploadDatePlusOneMinute
              //           .getDate()
              //           .toString()
              //           .padStart(2, '0')}.${(
              //           uploadDatePlusOneMinute.getMonth() + 1
              //         )
              //           .toString()
              //           .padStart(
              //             2,
              //             '0'
              //           )}.${uploadDatePlusOneMinute.getFullYear()} ${uploadDatePlusOneMinute
              //           .getHours()
              //           .toString()
              //           .padStart(2, '0')}:${uploadDatePlusOneMinute
              //           .getMinutes()
              //           .toString()
              //           .padStart(2, '0')}`;

              //         cy.log(`Upload Date: ${formattedUploadDate}`);
              //         cy.log(
              //           `Upload Date + 1 Min: ${formattedUploadDatePlusOneMinute}`
              //         );

              //         // Compare the received date with both possible dates
              //         expect([
              //           formattedUploadDate,
              //           formattedUploadDatePlusOneMinute,
              //         ]).to.include(formattedReceivedDate);
              //       });
            }
          });
      });
      cy.pause();
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
  // Admin User is able to check new HR Delivery received in HR page
  it('Admin User checks new delivery received in the HR page in SW', () => {
    adminUserChecksNewDeliveryReceivedInHRpage();
  });
  ///***************************************************** */

  //Prepare document For Signing - From Upload Button
  it.skip('prepareDocumentForSigningFromUpload', () => {
    // Load credentials (un/pw) and user data from 'supportView.json'
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(payslipJson.baseUrl); // Visit base URL from fixture
      cy.url().should('include', payslipJson.baseUrl); // Validate the URL

      // Login to SW as Admin User
      cy.get('input[formcontrolname="username"]').type(
        payslipJson.username_supportViewAdmin
      );
      cy.get('input[formcontrolname="password"]').type(
        payslipJson.password_supportViewAdmin
      );
      cy.get('button[type="submit"]').click();

      // Wait for login to complete
      cy.wait(1500);

      //Click On Upload Button
      cy.get('.upload__document>.mdc-button__label>.upload__document__text')
        .filter((index, el) => {
          const text = Cypress.$(el).text().trim();
          return text === 'Upload Document' || text === 'Dokument hochladen';
        })
        .click();
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
      cy.wait(6000);

      cy.get('.dialog-footer>.dialog-actions>button>.title')
        .filter((index, el) => {
          const text = Cypress.$(el).text().trim();
          return text === 'Send' || text === 'Senden';
        })
        .click();
      cy.wait(5000);

      //Logout
      cy.get('.logout-icon ').click();
      cy.wait(2000);
      cy.get('.confirm-buttons > :nth-child(2)').click();
      cy.url().should('include', payslipJson.baseUrl); // Validate url'
      cy.log('Test completed successfully.');
      cy.wait(4500);
    });
  }); //end it

  //Sign HR Delivery
  it.skip('Ebox user signing HR delivery_1 Signatures', () => {
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(payslipJson.baseUrl_egEbox); // Taken from base URL
      cy.url().should('include', payslipJson.baseUrl_egEbox); // Validate URL on the login page
      cy.wait(2000);

      //Remove Cookie
      cy.get('body').then(($body) => {
        if ($body.find('#onetrust-policy-title').is(':visible')) {
          // If the cookie bar is visible, click on it and remove it
          cy.get('#onetrust-accept-btn-handler').click();
        } else {
          // Log that the cookie bar was not visible
          cy.log('Cookie bar not visible');
        }
      }); //End Remove Cookie

      // Login to E-Box
      cy.get(':nth-child(1) > .ng-invalid > .input > .input__field-input').type(
        payslipJson.username_egEbox
      );
      cy.get('.ng-invalid > .input > .input__field-input').type(
        payslipJson.password_egEbox
      );
      cy.wait(1000);
      cy.get('button[type="submit"]').click();
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

      cy.get('.mdc-data-table__content>tr>.subject-sender-cell')
        .eq(0)
        .click({ force: true });
      cy.wait(12000);

      // Scroll to the bottom of the PDF viewer or page
      // cy.pause();

      cy.get('.content-container>.scroll-container').eq(1).scrollTo('bottom', {
        duration: 500,
        ensureScrollable: false,
      });

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
        cy.wait(5000);
        cy.get('.success-notification>.notification-message')
          .should('be.visible') // Ensure the success message is visible
          .should('have.text', ' Signatur wurde erfolgreich erstellt. '); // Verify success message text

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
      cy.url().should('include', payslipJson.baseUrl_egEbox); // Validate url
      cy.log('Test completed successfully.');
    });
  });

  // Admin User is able to check new HR Delivery received in HR page
  it.skip('Admin User checks new delivery received in the HR page in SW', () => {
    // Load credentials and user data from 'supportView.json'
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(payslipJson.baseUrl); // Visit base URL from fixture
      cy.url().should('include', payslipJson.baseUrl); // Validate the URL

      // Login to SW as Admin User
      cy.get('input[formcontrolname="username"]').type(
        payslipJson.username_supportViewAdmin
      );
      cy.get('input[formcontrolname="password"]').type(
        payslipJson.password_supportViewAdmin
      );
      cy.get('button[type="submit"]').click();
      // Wait for login to complete
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

      cy.wait(5000);
      //Logout
      cy.get('.logout-icon ').click();
      cy.wait(2000);
      cy.get('.confirm-buttons > :nth-child(2)').click();
      cy.log('Test completed successfully.');
      cy.wait(2500);
    }); //end
  });

  ///*************

  //Deactivate E-Box user
  it.skip('Deactivate E-Box User', () => {
    // Login as a Master-User
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(payslipJson.baseUrl); // Taken from base URL
      cy.url().should('include', payslipJson.baseUrl); // Validate URL on the login page

      // Login to SW
      cy.get('input[formcontrolname="username"]').type(
        payslipJson.username_supportViewMaster
      );
      cy.get('input[formcontrolname="password"]').type(
        payslipJson.password_supportViewMaster
      );
      cy.get('button[type="submit"]').click();
    });
    // Wait for login to complete
    cy.wait(2000);
    //Activte E-Box user using function
    deactivateEboxUserForSelectedCompany();
  }); // end it

  //Hide Upload Button-if User is deactivated
  it.skip('Hide Upload Button-if User is deactivated', () => {
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(payslipJson.baseUrl_egEbox); // Taken from base URL
      cy.url().should('include', payslipJson.baseUrl_egEbox); // Validate URL on the login page
      cy.wait(2000);

      //Remove Cookie
      cy.get('body').then(($body) => {
        if ($body.find('#onetrust-policy-title').is(':visible')) {
          // If the cookie bar is visible, click on it and remove it
          cy.get('#onetrust-accept-btn-handler').click();
        } else {
          // Log that the cookie bar was not visible
          cy.log('Cookie bar not visible');
        }
      }); //End Remove Cookie

      // Login to E-Box
      cy.get(':nth-child(1) > .ng-invalid > .input > .input__field-input').type(
        payslipJson.username_egEbox
      );
      cy.get('.ng-invalid > .input > .input__field-input').type(
        payslipJson.password_egEbox
      );
      cy.wait(1000);
      cy.get('button[type="submit"]').click();
      // Wait for login to complete
      cy.wait(2000);
      // Check visibility of Upload Delivery button - Button should be hidden
      cy.get('#toolbar-toggle_upload').should('not.exist');
      cy.wait(500);
      cy.log('Expected Result: Upload button is not visible');
      cy.wait(500);
      //Upload label - sidebar should be visible
      cy.get(
        'app-inbox-filter-system-labels>div>a[aria-label="filtern nach upload"]'
      ).should('be.visible');
      cy.log('Expected Result: Upload label is not visible');
      cy.wait(2500);
      //Filter by Upload label
      cy.get(
        'app-inbox-filter-system-labels>div>a[aria-label="filtern nach upload"]'
      ).click();
      cy.wait(2500);
      // Logout
      cy.get('.user-title').click();
      cy.wait(1500);
      cy.get('.logout-title > a').click();
      cy.log('Test completed successfully.');
    });
  });

  //Activate E-Box user
  it.skip('Activate E-Box User', () => {
    // Login as a Master-User
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(payslipJson.baseUrl); // Taken from base URL
      cy.url().should('include', payslipJson.baseUrl); // Validate URL on the login page
      // Login to SW
      cy.get('input[formcontrolname="username"]').type(
        payslipJson.username_supportViewMaster
      );
      cy.get('input[formcontrolname="password"]').type(
        payslipJson.password_supportViewMaster
      );
      cy.get('button[type="submit"]').click();
      // Wait for login to complete
      cy.wait(2000);
      //Activte E-Box user using function
      activateEboxUserForSelectedCompany();
      cy.wait(2500);
      cy.pause();
      //Logout
      cy.get('.logout-icon ').click();
      cy.wait(2000);
      cy.get('.confirm-buttons > :nth-child(2)').click();
      cy.url().should('include', payslipJson.baseUrl); // Validate url'
      cy.log('Test completed successfully.');
      cy.wait(2500);
    });
  }); // end it
  var uploadDateTime;
  //Crete HR delivery from E-Box
  it('crete HR delivery from E-Box', () => {
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(payslipJson.baseUrl_egEbox); // Taken from base URL
      cy.url().should('include', payslipJson.baseUrl_egEbox); // Validate URL on the login page
      cy.wait(2000);

      //Remove Cookie
      cy.get('body').then(($body) => {
        if ($body.find('#onetrust-policy-title').is(':visible')) {
          // If the cookie bar is visible, click on it and remove it
          cy.get('#onetrust-accept-btn-handler').click();
        } else {
          // Log that the cookie bar was not visible
          cy.log('Cookie bar not visible');
        }
      }); //End Remove Cookie

      // Login to E-Box
      cy.get(':nth-child(1) > .ng-invalid > .input > .input__field-input').type(
        payslipJson.username_egEbox
      );
      cy.get('.ng-invalid > .input > .input__field-input').type(
        payslipJson.password_egEbox
      );
      cy.wait(1000);
      cy.get('button[type="submit"]').click();
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

      // Generate a random 4-digit number and use it in the title
      let randomNumber = Math.floor(1000 + Math.random() * 9000);
      const title = `HR Delivery (pdf) - ${uploadDateTime}`; // Use formatted date and time in title
      cy.get('input[name="deliveryTitle"]').type(title);

      cy.wait(2000);
      cy.contains(' Speichern ').click({ force: true });
      cy.wait(3000);
      //Upload label - sidebar should be visible
      cy.get(
        'app-inbox-filter-system-labels>div>a[aria-label="filtern nach upload"]'
      ).should('be.visible');
      cy.log('Expected Result: Upload label is not visible');
      //Filter by Upload label
      cy.get(
        'app-inbox-filter-system-labels>div>a[aria-label="filtern nach upload"]'
      ).click();
      cy.wait(3000);
      // Logout
      cy.get('.user-title').click();
      cy.wait(1500);
      cy.get('.logout-title > a').click();
      cy.url().should('include', payslipJson.baseUrl_egEbox); // Validate url
      cy.log('Test completed successfully.');
    });
  });

  // Admin User is able to check new HR Delivery received in HR page
  it('Admin User checks new delivery received in the HR page in SW', () => {
    // Load credentials and user data from 'supportView.json'
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(payslipJson.baseUrl); // Visit base URL from fixture
      cy.url().should('include', payslipJson.baseUrl); // Validate the URL

      // Login to SW as Admin User
      cy.get('input[formcontrolname="username"]').type(
        payslipJson.username_supportViewAdmin
      );
      cy.get('input[formcontrolname="password"]').type(
        payslipJson.password_supportViewAdmin
      );
      cy.get('button[type="submit"]').click();
      // Wait for login to complete
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
      cy.pause();
      cy.wait(3000);
      //Logout
      cy.get('.logout-icon ').click();
      cy.wait(2000);
      cy.get('.confirm-buttons > :nth-child(2)').click();
      cy.log('Test completed successfully.');
      cy.wait(2500);
    }); //end
  });

  // Admin User is able to prepare HR Delivery
  it.skip('Admin User is able to prepare HR Delivery', () => {
    // Load credentials and user data from 'supportView.json'
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(payslipJson.baseUrl); // Visit base URL from fixture
      cy.url().should('include', payslipJson.baseUrl); // Validate the URL

      // Login to SW as Admin User
      cy.get('input[formcontrolname="username"]').type(
        payslipJson.username_supportViewAdmin
      );
      cy.get('input[formcontrolname="password"]').type(
        payslipJson.password_supportViewAdmin
      );
      cy.get('button[type="submit"]').click();
      // Wait for login to complete
      cy.wait(1500);

      //Logout
      // cy.get('.logout-icon ').click();
      // cy.wait(2000);
      // cy.get('.confirm-buttons > :nth-child(2)').click();
      // cy.log('Test completed successfully.');
      // cy.wait(2500);
    }); //end
  });

  //Confirm HR Role On Assign Admin To Companies
  it.skip('confirmHrRoleOnAssignAdminToCompanies', () => {
    // Login as a Master-User
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(payslipJson.baseUrl); // Taken from base URL
      cy.url().should('include', payslipJson.baseUrl); // Validate URL on the login page
      // Login to SW
      cy.get('input[formcontrolname="username"]').type(
        payslipJson.username_supportViewMaster
      );
      cy.get('input[formcontrolname="password"]').type(
        payslipJson.password_supportViewMaster
      );
      cy.get('button[type="submit"]').click();
      // Wait for login to complete
      cy.wait(1500);

      // Search for 'Aqua' Group, by Display Name
      cy.get('#searchButton>span').click(); //Click on search button
      cy.fixture('supportView.json').as('payslipSW');
      cy.get('@payslipSW').then((payslipJson) => {
        // Use the company name from the JSON file
        const companyName = payslipJson.company;
        const EBoxUser = payslipJson.username_egEbox;
        const assignToCompany = 'ABBA';
        // Search for Group by Display Name using the company name
        cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
          .eq(1)
          .type(companyName);
        //Find the Search button by button name and click on it
        cy.get('.search-dialog>form>div>.mat-primary').click();
        cy.wait(1500);

        //switch to Admin User page
        clickOnAdminUserButton();
        //Switch to company
        cy.wait(1500);
        cy.get('sv-table>cdk-table>cdk-row>.cdk-column-firstName') // Assumes each user is in a table row
          .contains('.cdk-column-firstName', companyName) // Find the cell that contains "Aqua" in the Vorname column
          .parent() // Get the row containing this cell
          .within(() => {
            // Now, within this row, find the "Role | Rechte" button and click it
            cy.contains(/Companies|Firmen/i) // Find the button that contains the text "Rechte" or "Role"
              .click(); // Click the button
          });
        cy.wait(2000);
        // Asign Admin User to some Company
        cy.get(
          '.assign-admin-to-companies__search__container__input>input'
        ).type(assignToCompany);
      });
      cy.wait(2000);

      cy.get('tr.ng-star-inserted > .ng-star-inserted').then(($checkbox) => {
        if (!$checkbox.is(':checked')) {
          // Checkbox is not checked, so check it
          cy.log('Checkbox was not enabled, enabling it now.');
          cy.wrap($checkbox).click(); // Check the checkbox
          cy.wait(500); // Shorter wait to reduce delay

          // Click on Next button to move to step 2
          cy.get('.ng-star-inserted > .title').should('be.visible').click();
          cy.wait(500); // Shorter wait to reduce delay

          // Enable HR Role on the assign-admin-to-companies dialog
          cy.get('#mat-mdc-checkbox-4 > div > .mdc-checkbox')
            .should('be.visible') // Ensures checkbox is visible
            .click();

          // Save changes
          cy.get('.assign-admin-to-companies__actions > .ng-star-inserted')
            .should('be.visible')
            .click();
        } else {
          // Checkbox is already checked, uncheck it
          cy.log('Checkbox is already enabled, disabling it now.');
          cy.wrap($checkbox).click(); // Uncheck the checkbox
          cy.wait(500);

          // Save changes
          cy.get('.assign-admin-to-companies__actions > .ng-star-inserted')
            .should('be.visible')
            .click();
        }
        // Close Edit Company dialog
        cy.wait(500); // Reduced delay for a smoother flow
      });

      //Logout
      cy.get('.logout-icon ').click();
      cy.wait(2000);
      cy.get('.confirm-buttons > :nth-child(2)').click();
      cy.url().should('include', payslipJson.baseUrl); // Validate url'
      cy.log('Test completed successfully.');
      cy.wait(2500);
    });
  });

  //  *******************   TO DO *******************

  // //When Ebox User Is Disabled, Upload Button Is Not Visible,
  // it('chekUploadButton-uploadButtonIsHiddenWhenEboxUserIsDisabled', () => {

  // });

  //Assign Admin user to companies (check HR Role flag)

  //Y O P M A I L

  // it('Yopmail - Get Reporting email', () => {
  //   // Visit Yopmail
  //   cy.visit('https://yopmail.com/en/');

  //   // Load fixture data
  //   cy.fixture('supportView.json').as('payslipSW');

  //   // Enter the support admin email
  //   cy.get('@payslipSW').then((payslipJson) => {
  //     cy.get('#login').type(payslipJson.email_supportViewAdmin);
  //   });

  //   // Click the refresh button
  //   cy.get('#refreshbut > .md > .material-icons-outlined').click();
  //   //Custom functions:
  //   // Define email subject function
  //   function emailSubject(index) {
  //     cy.iframe('#ifinbox')
  //       .find('.mctn > .m > button > .lms')
  //       .eq(index)
  //       .should('include.text', 'Versandreport e-Gehaltszettel Portal');
  //   }
  //   // Define email body function
  //   function emailBody() {
  //     cy.iframe('#ifmail')
  //       .find('#mail > div')
  //       .then(($div) => {
  //         const text = $div.text().trim();
  //         expect(
  //           text.includes(
  //             '1 Sendung(en) die Sie postalisch als Brief verschicken wollten, konnte(n) nicht ordnungsgemäß zugestellt werden, bitte überprüfen Sie die Daten der Mitarbeiter*innen, oder wenden Sie sich an unseren Kundenservice e-gehaltszettel@post.at'
  //           ) ||
  //             text.includes(
  //               'Zusätzlich haben Sie 1 Sendung(en) erfolgreich über den postalischen Weg als Brief versendet. Das Dokument wird von uns über das „Einfach Brief“-Portal  gedruckt, kurvertiert und an die Adresse des Benutzers versendet'
  //             )
  //         ).to.be.true; // OR condition
  //       });
  //   }

  //   // Access the inbox iframe and validate the email subject
  //   emailSubject(0); // Validate subject of Reporting email
  //   emailBody(); // Validate email body

  //   // Wait to ensure the email content is loaded
  //   cy.wait(3500);

  //   // Switch to the second email
  //   cy.iframe('#ifinbox').find('.mctn > .m > button > .lms').eq(1).click();

  //   emailSubject(1); // Validate subject of second email
  //   cy.wait(1500);
  //   emailBody(); // Validate second email body

  //   cy.wait(2500);
  // });

  //***********************TO DO***********************

  // it('assignUserToCompanies', () => {
  //   // Login as a Master-User
  //   cy.fixture('supportView.json').as('payslipSW');
  //   cy.get('@payslipSW').then((payslipJson) => {
  //     cy.visit(payslipJson.baseUrl); // Taken from base URL
  //     cy.url().should('include', payslipJson.baseUrl); // Validate URL on the login page
  //     // Login to SW
  //     cy.get('input[formcontrolname="username"]').type(
  //       payslipJson.username_supportViewMaster
  //     );
  //     cy.get('input[formcontrolname="password"]').type(
  //       payslipJson.password_supportViewMaster
  //     );
  //     cy.get('button[type="submit"]').click();
  //     cy.wait(1500);
  //     //Activte E-Box user using function

  //     // Search for 'Aqua' Group, by Display Name
  //     cy.get('#searchButton>span').click(); //Click on search button
  //     cy.fixture('supportView.json').as('payslipSW');
  //     cy.get('@payslipSW').then((payslipJson) => {
  //       // Use the company name from the JSON file
  //       const companyName = payslipJson.company;
  //       const EBoxUser = payslipJson.username_egEbox;
  //       // Search for Group by Display Name using the company name
  //       cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
  //         .eq(1)
  //         .type(companyName);
  //       //Find the Search button by button name and click on it
  //       cy.get('.search-dialog>form>div>.mat-primary').click();
  //       cy.wait(1500);

  //       // Switch to User page, by clicking on User button
  //       cy.get('.ng-star-inserted .action-buttons button')
  //         .last()
  //         .click({ force: true });
  //       //Ebox User
  //       // Find the row with the target username and check the button state
  //       cy.get('cdk-table > cdk-row').each(($row) => {
  //         cy.wrap($row)
  //           .find('.cdk-column-username .cell-content-wrap .inline-div div')
  //           .invoke('text')
  //           .then((username) => {
  //             if (username.trim() === EBoxUser) {
  //               cy.log(`Found User: ${username.trim()}`);

  //               // Click the "Companies" or "Firmen" button in the same row
  //               cy.wrap($row)
  //                 .find('button')
  //                 .contains(/Companies|Firmen/)
  //                 .click({ force: true });

  //               // Exit the loop early once the correct user is found and clicked
  //               return false;
  //             }
  //           });
  //       });

  //       // Asign User to some Company
  //       cy.get(
  //         '.assign-users-to-companies__search__container__input>input'
  //       ).type('ABBA');
  //     });
  //     cy.wait(1500);
  //     cy.get('tr.ng-star-inserted > .ng-star-inserted').click();
  //     cy.wait(2500);
  //     //Click on Next button
  //     cy.get('.ng-star-inserted > .title').click();

  //     //Logout
  //     //  cy.get('.logout-icon ').click();
  //     //  cy.wait(2000);
  //     //  cy.get('.confirm-buttons > :nth-child(2)').click();
  //     //  cy.url().should('include', payslipJson.baseUrl); // Validate url'
  //     //  cy.log('Test completed successfully.');
  //     //  cy.wait(2500);
  //   });
  // });
}); //end describe
