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
    console.log('ULAZ');
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
        cy.get('button[type="submit"]').click();
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
  } //end function

  // Activate Ebox User For Selected Company
  // function activateEboxUserForSelectedCompany() {
  //   // Search for 'Aqua' Group, by Display Name
  //   cy.get('#searchButton>span').click(); //Click on search button
  //   cy.fixture('supportView.json').as('payslipSW');
  //   cy.get('@payslipSW').then((payslipJson) => {
  //     // Use the company name from the JSON file
  //     const companyName = payslipJson.company;
  //     const EBoxUser = payslipJson.username_egEbox;
  //     // Search for Group by Display Name using the company name
  //     cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
  //       .eq(1)
  //       .type(companyName);
  //     //Find the Search button by button name and click on it
  //     cy.get('.search-dialog>form>div>.mat-primary').click();
  //     cy.wait(1500);

  //     // Switch to User page, by clicking on User button
  //     cy.get('.ng-star-inserted .action-buttons button')
  //       .last()
  //       .click({ force: true });
  //     //Ebox User
  //     // Find the row with the target username and check the button state
  //     cy.get('cdk-table > cdk-row').each(($row) => {
  //       cy.wrap($row)
  //         .find('.cdk-column-username .cell-content-wrap .inline-div div')
  //         .invoke('text')
  //         .then((username) => {
  //           if (username.trim() === EBoxUser) {
  //             cy.log(`Found User: ${username.trim()}`);
  //             cy.wait(2000);
  //             // Skip if "Deactivate" or "Deaktivieren" button is shown;
  //             cy.wrap($row)
  //               .find('button')
  //               .then(($buttons) => {
  //                 const buttonTexts = $buttons
  //                   .map((i, el) => Cypress.$(el).text().trim())
  //                   .get();

  //                 if (
  //                   buttonTexts.includes('Deactivate') ||
  //                   buttonTexts.includes('Deaktivieren')
  //                 ) {
  //                   cy.log(
  //                     'Skipping Activate if Activate or Aktivieren button is visible'
  //                   );
  //                   return false; // Skip this row
  //                 } else {
  //                   // Click "Activate" or "Aktivierung" button
  //                   cy.wrap($row)
  //                     .find('button')
  //                     .contains(/Activate|Aktivierung/)
  //                     .click({ force: true });
  //                   cy.log('Activated the user.');
  //                 }
  //               });
  //             // Exit the loop early once the correct user is found and processed
  //             return false;
  //           }
  //         });
  //     });
  //   });
  // }

  function activateEboxUserForSelectedCompany() {
    // Search for 'Aqua' Group by Display Name
    cy.get('#searchButton>span').click(); // Click on the search button
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      // Use the company name from the cypress.config.js
      const companyName = Cypress.env('company');

      const EBoxUser = Cypress.env('username_egEbox');

      // Search for Group by Display Name using the company name
      cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
        .eq(1)
        .type(companyName);

      //Find the Search button by button name and click on it
      cy.get('.search-dialog>form>div>.mat-primary').click();
      cy.wait(1500);

      // Switch to User page by clicking the User button
      cy.get('.ng-star-inserted .action-buttons button')
        .last()
        .click({ force: true });

      // Click on Search button in the User section
      cy.get('.search').click({ multiple: true });
      cy.wait(1500);

      // Search by username
      cy.get('input[formcontrolname="userName"]').type(EBoxUser);
      cy.wait(500);
      cy.get('button[type="submit"]').click();
      cy.wait(500); // Allow the table to load fully
      // Find the row with the target username
      cy.get('.action-buttons>button>.mdc-button__label').each(($button) => {
        // Get the button text
        const buttonText = $button.text().trim();

        // Log the button text for debugging
        cy.log('Button text:', buttonText);

        // Skip if "Deactivate" or "Deaktivieren" is visible
        if (buttonText === 'Deactivate' || buttonText === 'Deaktivieren') {
          cy.log('Skipping as user is already activated.');
          return false; // Exit the loop early
        }

        // Click "Activate" or "Aktivierung" button
        if (buttonText === 'Activate' || buttonText === 'Aktivierung') {
          cy.wrap($button)
            .click({ force: true })
            .then(() => {
              cy.log('Activated the user successfully.');
            });

          return false; // Exit the loop early
        }
      });

      // Exit the loop early once the correct user is found
      return false;
    });
  }

  // Deactivate Ebox User For Selected Company
  // function deactivateEboxUserForSelectedCompany() {
  //   // Search for 'Aqua' Group, by Display Name
  //   cy.get('#searchButton>span').click(); //Click on search button
  //   cy.fixture('supportView.json').as('payslipSW');
  //   cy.get('@payslipSW').then((payslipJson) => {
  //     // Use the company name from the JSON file
  //     const companyName = payslipJson.company;
  //     const EBoxUser = payslipJson.username_egEbox;
  //     // Search for Group by Display Name using the company name
  //     cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
  //       .eq(1)
  //       .type(companyName);
  //     //Find the Search button by button name and click on it
  //     cy.get('.search-dialog>form>div>.mat-primary').click();
  //     cy.wait(1500);

  //     // Switch to User page, by clicking on User button
  //     cy.get('.ng-star-inserted .action-buttons button')
  //       .last()
  //       .click({ force: true });
  //     //Ebox User

  //     // Find the row with the target username and check the button state
  //     cy.get('cdk-table > cdk-row').each(($row) => {
  //       cy.wrap($row)
  //         .find('.cdk-column-username .cell-content-wrap .inline-div div')
  //         .invoke('text')
  //         .then((username) => {
  //           if (username.trim() === EBoxUser) {
  //             cy.log(`Found User: ${username.trim()}`);
  //             cy.wait(2000);
  //             // Skip if "Deactivate" or "Deaktivieren" button is shown;
  //             cy.wrap($row)
  //               .find('button')
  //               .then(($buttons) => {
  //                 const buttonTexts = $buttons
  //                   .map((i, el) => Cypress.$(el).text().trim())
  //                   .get();

  //                 if (
  //                   buttonTexts.includes('Aactivate') ||
  //                   buttonTexts.includes('Aktivieren')
  //                 ) {
  //                   cy.log(
  //                     'Skipping Deactivating action, if Deactivate or Deaktivieren button is visible'
  //                   );
  //                   return false; // Skip this row
  //                 } else {
  //                   // Click "Activate" or "Aktivierung" button
  //                   cy.wrap($row)
  //                     .find('button')
  //                     .contains(/Deactivate|Deaktivierung/)
  //                     .click({ force: true });
  //                   cy.log('Deactivated the user.');
  //                 }
  //               });
  //             // Exit the loop early once the correct user is found and processed
  //             return false;
  //           }
  //         });
  //     });
  //   });
  // }

  function deactivateEboxUserForSelectedCompany() {
    // Search for 'Aqua' Group by Display Name
    cy.get('#searchButton>span').click(); // Click on the search button
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      const companyName = Cypress.env('company');

      const EBoxUser = Cypress.env('username_egEbox');

      // Search for Group by Display Name using the company name
      cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
        .eq(1)
        .type(companyName);

      //Find the Search button by button name and click on it
      cy.get('.search-dialog>form>div>.mat-primary').click();
      cy.wait(1500);

      // Switch to User page by clicking the User button
      cy.get('.ng-star-inserted .action-buttons button')
        .last()
        .click({ force: true });

      // Click on Search button in the User section
      cy.get('.search').click({ multiple: true });
      cy.wait(1500);

      // Search by username
      cy.get('input[formcontrolname="userName"]').type(EBoxUser);
      cy.wait(500);
      cy.get('button[type="submit"]').click();
      cy.wait(500); // Allow the table to load fully
      // Find the row with the target username
      cy.get('.action-buttons>button>.mdc-button__label').each(($button) => {
        // Get the button text
        const buttonText = $button.text().trim();

        // Log the button text for debugging
        cy.log('Button text:', buttonText);

        if (buttonText === 'Activate' || buttonText === 'Aktivierung') {
          cy.log('Skipping as user is already deactivated.');
          return false; // Exit the loop early
        }

        // Click "Deactivate" button
        if (buttonText === 'Deactivate' || buttonText === 'Deaktivieren') {
          cy.wrap($button)
            .click({ force: true })
            .then(() => {
              cy.log('User is successfully deactivated.');
            });

          return false; // Exit the loop early
        }
      });

      // Exit the loop early once the correct user is found
      return false;
    });
  }

  // Admin User Checks New Delivery Received In HR page
  function adminUserChecksNewDeliveryReceivedInHRpage() {
    cy.fixture('supportView.json').as('payslipSW');
    // cy.get('@payslipSW').then((payslipJson) => {
    //   cy.visit(payslipJson.baseUrl); // Visit base URL from fixture
    //   cy.url().should('include', payslipJson.baseUrl); // Validate the URL
    cy.get('@payslipSW').then((payslipJson) => {
      cy.loginToSupportViewAdmin();

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

      // Logout
      cy.get('.logout-icon ').click();
      cy.wait(2000);
      cy.get('.confirm-buttons > :nth-child(2)').click();
      cy.url().should('include', Cypress.env('baseUrl')); // Validate url'
    }); //end
  }

  //-------------------End Custom Function-------------------

  // Define a variable to store the formatted date and time after document upload
  var uploadDateTime;
  //  Enable hrManagement' flag, on the Edit Company dialog
  it('Enable hrManagement flag on Company', () => {
    //Import credentials (un/pw) from 'supportView.json' file

    cy.loginToSupportViewMaster();
    //Search for Company by Display Name
    cy.get('#searchButton>span').click(); //Click on search button
    cy.wait(1000);
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      // Use the company name from the cypress.config.js
      const companyName = Cypress.env('company');
      // Search for Group by Display Name using the company name
      cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
        .eq(0)
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
      // cy.url().should('include', payslipJson.baseUrl); // Validate url'
      cy.log('Test completed successfully.');
      cy.wait(2500);
    }); //end
  }); //end it

  //Disable hrManagement on the Admin Users Role dilaog
  it('Disable hrManagement Admin Users Role', () => {
    //Login as a Master-User
    cy.loginToSupportViewMaster();
    cy.wait(1500);
    //Search for 'Aqua' Group, by Display Name
    cy.get('#searchButton>span').click(); //Click on search button
    cy.wait(1000);

    // Use the company name from the cypress.config.js
    const companyName = Cypress.env('company');
    // Search for Group by Display Name using the company name
    cy.get('input[formcontrolname="groupDescription"]').type(companyName);

    //Click on Search button
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    //Click on Admin User button
    cy.get('.action-buttons>button>.mdc-button__label')
      .contains(/Admin User|Admin Benutzer/)
      .click({ force: true });

    //Search for specific Admin User by username (aquaAdmin)

    const adminUser = Cypress.env('username_supportViewAdmin');
    //Click on Search icon
    cy.get('.search').click({ force: true });

    // Search for Admin by Admin username
    cy.get('input[formcontrolname="userName"]').type(adminUser);
    cy.wait(1500);
    //Click on Search button
    cy.get('button[type="submit"]').click();
    cy.wait(2000);

    // Switch to Admin user's Role dilaog
    cy.get('.action-buttons>button>.mdc-button__label');
    cy.contains(/Rechte|Rights/i).click();
    cy.wait(2000);

    //Disable HR Role (Admin user)
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
    cy.log('HR Role is successfully disabled');
    cy.wait(3000);

    //Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.log('Test completed successfully.');
    cy.wait(2500);
  }); //end it

  //Check if Admin has access to HR page in SW (before enabling )
  it('Check if Admin has access to HR page in SW (before enabling )', () => {
    // Load credentials (un/pw) and user data from 'supportView.json'
    cy.loginToSupportViewAdmin();

    // Wait for login to complete
    cy.wait(1500);

    //Check if Admin has access to HR page in SW
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
    cy.wait(2500);

    //Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    // cy.url().should('include', payslipJson.baseUrl); // Validate url'
    cy.log('Test completed successfully.');
    cy.wait(2500);
  }); //end it

  //Enable Hr And Disable DataSubmitter Roles
  it('enableHrAndDisableDataSubmitterRoles', () => {
    //Login as a Master-User
    //Login as a Master-User
    cy.loginToSupportViewMaster();
    cy.wait(1500);
    //Search for 'Aqua' Group, by Display Name
    cy.get('#searchButton>span').click(); //Click on search button
    cy.wait(1000);

    // Use the company name from the cypress.config.js
    const companyName = Cypress.env('company');
    // Search for Group by Display Name using the company name
    cy.get('input[formcontrolname="groupDescription"]').type(companyName);

    //Click on Search button
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    //Click on Admin User button
    cy.get('.action-buttons>button>.mdc-button__label')
      .contains(/Admin User|Admin Benutzer/)
      .click({ force: true });

    //Search for specific Admin User by username (aquaAdmin)

    const adminUser = Cypress.env('username_supportViewAdmin');
    //Click on Search icon
    cy.get('.search').click({ force: true });

    // Search for Admin by Admin username
    cy.get('input[formcontrolname="userName"]').type(adminUser);
    cy.wait(1500);
    //Click on Search button
    cy.get('button[type="submit"]').click();
    cy.wait(2000);

    // Switch to Admin user's Role dilaog
    cy.get('.action-buttons>button>.mdc-button__label');
    cy.contains(/Rechte|Rights/i).click();
    cy.wait(2000);

    //Enable HR Role (Admin user)

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
        cy.get('button[type="submit"]').click();
      }
    });
    cy.wait(3000);

    //Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.log('Test completed successfully.');
    cy.wait(2500);
  }); //end it

  //Deactivate E-Box user
  it('Deactivate E-Box User', () => {
    // Login as a Master-User
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      //   cy.visit(payslipJson.baseUrl); // Taken from base URL
      //   cy.url().should('include', payslipJson.baseUrl); // Validate URL on the login page

      //   // Login to SW
      //   cy.get('input[formcontrolname="username"]').type(
      //     payslipJson.username_supportViewMaster
      //   );
      //   cy.get('input[formcontrolname="password"]').type(
      //     payslipJson.password_supportViewMaster
      //   );
      //   cy.get('button[type="submit"]').click();
      cy.loginToSupportViewMaster();
      // Wait for login to complete
      cy.wait(2000);
      //Activte E-Box user using function
      deactivateEboxUserForSelectedCompany();
      cy.wait(2500);
      //Logout
      cy.get('.logout-icon ').click();
      cy.wait(2000);
      cy.get('.confirm-buttons > :nth-child(2)').click();
      // cy.url().should('include', payslipJson.baseUrl); // Validate url'
      cy.log('Test completed successfully.');
      cy.wait(2500);
    });
  }); // end it

  //Hide Upload Button-if User is deactivated
  it('Hide Upload Button-if User is deactivated', () => {
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(Cypress.env('baseUrl_egEbox'), {
        failOnStatusCode: false,
      });
      cy.wait(3500);
      // Validate URL on the login page
      cy.url().should('include', Cypress.env('baseUrl_egEbox'));

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
      cy.get('input[placeholder="Benutzername"]').type(
        Cypress.env('username_egEbox')
      );
      cy.get('input[type="password"]').type(Cypress.env('password_egEbox'));
      cy.intercept('POST', '**/rest/v2/deliveries**').as('getDeliveries');
      cy.get('button[type="submit"]').click(); //Login

      cy.wait(['@getDeliveries'], { timeout: 20000 }).then((interception) => {
        // Log the intercepted response
        cy.log('Intercepted response:', interception.response);

        // Assert the response status code
        expect(interception.response.statusCode).to.eq(200);
      });
      cy.url().should('include', '/deliveries'); // => validate url
      // Wait for login to complete
      cy.wait(2000);
      // Check visibility of Upload Delivery button - Button should be hidden
      cy.get('#toolbar-toggle_upload').should('not.exist');
      cy.wait(1500);
      cy.log('Expected Result: Upload button is not visible');
      cy.wait(1500);
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
      //cy.url().should('include', payslipJson.baseUrl_egEbox); // Validate url
      cy.url().should('include', Cypress.env('baseUrl_egEbox')); // Validate url
      cy.log('Test completed successfully.');
    });
  });

  //Activate E-Box user
  it.only('Activate E-Box User', () => {
    // Login as a Master-User
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      // cy.visit(payslipJson.baseUrl); // Taken from base URL
      // cy.url().should('include', payslipJson.baseUrl); // Validate URL on the login page
      // // Login to SW
      // cy.get('input[formcontrolname="username"]').type(
      //   payslipJson.username_supportViewMaster
      // );
      // cy.get('input[formcontrolname="password"]').type(
      //   payslipJson.password_supportViewMaster
      // );
      // cy.get('button[type="submit"]').click();
      // cy.get('@payslipSW').then((payslipJson) => {
      //   cy.visit(payslipJson.baseUrl); // Taken from base URL
      //   cy.url().should('include', payslipJson.baseUrl); // Validate URL on the login page
      //   // Login to SW
      //   cy.get('input[formcontrolname="username"]').type(
      //     payslipJson.username_supportViewMaster
      //   );
      //   cy.get('input[formcontrolname="password"]').type(
      //     payslipJson.password_supportViewMaster
      //   );
      //   cy.get('button[type="submit"]').click();
      cy.loginToSupportViewMaster();
      // Wait for login to complete
      cy.wait(2000);
      //Activte E-Box user using function
      activateEboxUserForSelectedCompany();
      cy.wait(2500);

      //Logout
      cy.get('.logout-icon ').click();
      cy.wait(2000);
      cy.get('.confirm-buttons > :nth-child(2)').click();
      // cy.url().should('include', payslipJson.baseUrl); // Validate url'
      cy.log('Test completed successfully.');
      cy.wait(2500);
    });
  }); // end it

  //Crete HR delivery from E-Box
  it.only('crete HR delivery from E-Box', () => {
    cy.visit(Cypress.env('baseUrl_egEbox'), {
      failOnStatusCode: false,
    });
    cy.wait(3500);
    // Validate URL on the login page
    cy.url().should('include', Cypress.env('baseUrl_egEbox'));

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

    cy.get('input[placeholder="Benutzername"]').type(
      Cypress.env('username_egEbox')
    );
    cy.get('input[type="password"]').type(Cypress.env('password_egEbox'));
    cy.intercept('POST', '**/rest/v2/deliveries**').as('getDeliveries');
    cy.get('button[type="submit"]').click(); //Login

    cy.wait(['@getDeliveries'], { timeout: 37000 }).then((interception) => {
      // Log the intercepted response
      cy.log('Intercepted response:', interception.response);

      // Assert the response status code
      expect(interception.response.statusCode).to.eq(200);
    });
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

    // Generate a random 4-digit number and use it in the title
    let randomNumber = Math.floor(1000 + Math.random() * 9000);
    const title = `HR Delivery (pdf) - ${uploadDateTime}`; // Use formatted date and time in title
    cy.get('input[name="deliveryTitle"]').type(title);
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

  // Admin User is able to check new HR Delivery received in HR page
  it.only('Admin User checks new delivery received in the HR page in SW', () => {
    //adminUserChecksNewDeliveryReceivedInHRpage();
    cy.loginToSupportViewAdmin();

    // Wait for login to complete
    cy.wait(1500);

    //Switch to HR page
    // checkNewDeliveryInHrPage();
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

    // Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url'
  });

  //Confirm HR Role On Assign Admin To Companies
  it.skip('confirmHrRoleOnAssignAdminToCompanies', () => {
    // Login as a Master-User
    cy.fixture('supportView.json').as('payslipSW');
    // cy.get('@payslipSW').then((payslipJson) => {
    // cy.visit(payslipJson.baseUrl); // Taken from base URL
    // cy.url().should('include', payslipJson.baseUrl); // Validate URL on the login page

    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(payslipJson.baseUrl, {
        failOnStatusCode: false,
      });

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
