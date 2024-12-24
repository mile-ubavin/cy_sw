describe('R04_Create User -Manual.js', () => {
  // M A S T E R    U S E R - CHECK DOES 'SEND TO EINFACHBRIEF' IS ENABLED
  // it.skip('Login As Master User - Check does eGehaltszettelEnabled is set to true', () => {
  //   // Login as Master User using a custom command
  //   cy.loginToSupportViewMaster();
  //   cy.wait(3500);
  //   //Search for Company by Display Name
  //   cy.get('#searchButton>span').click(); //Click on search button
  //   cy.wait(1000);
  //   cy.fixture('supportView.json').as('payslipSW');
  //   cy.get('@payslipSW').then((payslipJson) => {
  //     // Use the company name from the JSON file
  //     const companyName = payslipJson.company;
  //     // Search for Group by Display Name using the company name
  //     cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
  //       .eq(1)
  //       .type(companyName);

  //     cy.wait(1500);
  //     //Find the Search button by button name and click on it
  //     cy.get('.search-dialog>form>div>.mat-primary').click();
  //     cy.wait(1500);

  //     cy.pause();
  //     //Switch to user section
  //     cy.get('.action-buttons > .mdc-button').eq(0).click();

  //     cy.wait(1500);
  //     //Scroll to the botton
  //     cy.get('.mat-mdc-dialog-content').scrollTo('bottom');

  //     //Check checkbox
  //     cy.get('#eGehaltszettelEnabled').then(($checkbox) => {
  //       if (!$checkbox.is(':checked')) {
  //         // If the checkbox is not checked, enable it
  //         cy.get('#hrManagementEnabled').check();
  //         cy.log('Checkbox was not enabled, now enabled.');
  //         //Save Edit Company dialog
  //         cy.get('button[type="submit"]').click();
  //       } else {
  //         // If the checkbox is already enabled
  //         cy.log('Checkbox is already enabled.');
  //         cy.get('.close[data-mat-icon-name="close"]').click();
  //       }
  //       //Close Edit Company dialog
  //       cy.wait(3000);
  //       //Logout
  //       cy.get('.logout-icon ').click();
  //       cy.wait(2000);
  //       cy.get('.confirm-buttons > :nth-child(2)').click();
  //       cy.url();
  //       cy.should('include', 'https://supportviewpayslip.edeja.com/fe/login'); // Validate url
  //       cy.wait(1500);
  //     });
  //   }); //end fixture
  // }); //end it

  // MASTERUSER - CREATE USER MANUAL FROM SW

  it('Login As AdminUser - Create User Manually', () => {
    // Login as Master User using a custom command
    cy.loginToSupportViewMaster();
    cy.wait(3500);
    //Search for Company by Display Name
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

      //Find the Search button by button name and click on it
      cy.get('.search-dialog>form>div>.mat-primary').click();
      cy.wait(1500);

      cy.get('.action-buttons>.mdc-button>.mdc-button__label')
        .filter((index, el) => {
          const text = Cypress.$(el).text().trim();
          return text === 'User' || text === 'Benutzer';
        })
        .click({ force: true });

      // Function to create a user
      function createUser(user) {
        // Click 'Create User' button
        cy.get('button > .mdc-button__label')
          .filter((index, el) => {
            const text = Cypress.$(el).text().trim();
            return text === 'Create user' || text === 'Neuen Benutzer Anlegen';
          })
          .click({ force: true });

        cy.wait(1500);

        // Click on Manual Creation
        cy.get('.create_user_dialog_content>.buttons-wrapper>button')
          .filter((index, el) => {
            const text = Cypress.$(el).text().trim();
            return text === 'Manuel Creation' || text === 'Manuelle Anlage';
          })
          .click();

        // Fill in user details
        cy.get('mat-select[formControlName="salutation"]').click();
        cy.get('mat-option').eq(0).click({ force: true });

        cy.get('input[formcontrolname="firstName"]').type(user.firstName);
        cy.get('input[formcontrolname="lastName"]').type(user.lastName);
        cy.get('input')
          .filter((index, input) => {
            const placeholder = Cypress.$(input).attr('placeholder');
            return (
              placeholder &&
              (placeholder.trim() === 'Account Number *' ||
                placeholder.trim() === 'Personalnummer *')
            );
          })
          .click()
          .type(user.username);

        cy.get('input[formcontrolname="email"]').type(user.email);

        // Select phone number prefix
        cy.get(
          ':nth-child(4) > .mat-mdc-form-field-type-mat-select > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix'
        ).click();
        cy.wait(500);
        cy.get('.mdc-list-item').eq(0).click();

        // Fill phone number fields
        cy.get('input[formcontrolname="countryCodePhoneNum"]')
          .click({ force: true })
          .type(user.countryCodePhoneNum);
        cy.get('input[formcontrolname="netNumberPhoneNum"]').type(
          user.netNumberPhoneNum
        );
        cy.get('input[formcontrolname="subscriberNumberPhoneNum"]').type(
          user.subscriberNumberPhoneNum
        );

        // Fill in address if available
        if (user.streetName) {
          cy.get('input[formcontrolname="streetName"]').type(user.streetName);
          cy.get('input[formcontrolname="streetNumber"]').type(
            user.streetNumber
          );
          cy.get('input[formcontrolname="doorNumber"]').type(user.doorNumber);
          cy.get('input[formcontrolname="zipCode"]').type(user.zipCode);
          cy.get('input[formcontrolname="city"]').type(user.city);
        }

        // Fill in title
        cy.get('input[formcontrolname="prefixedTitle"]').type(
          user.prefixedTitle
        );

        //cy.get('button[type="submit"]').click({ force: true });
        cy.wait(1500);
        // Submit the form
        cy.get('button[color="primary"]>.mdc-button__label')
          .filter((index, button) => {
            return (
              Cypress.$(button).text().trim() === 'Submit' ||
              Cypress.$(button).text().trim() === 'Absenden'
            );
          })
          .click({ force: true });
        cy.wait(1500);
      } //end create usr function

      // Create the first user (with address)
      createUser(payslipJson.createUser[0]);

      // Validate Confirm Address dialog
      // cy.wait(1500);
      // cy.get('send-to-print-promt .ng-star-inserted').then((elements) => {
      //   const extractedValues = Array.from(elements).map((el) =>
      //     el.innerText.trim()
      //   );
      //   cy.log('Extracted Values:', extractedValues);

      //   // Validate the extracted values match the address data from the fixture
      //   expect(extractedValues[0]).to.contain(
      //     payslipJson.createUser[0].streetName
      //   );
      //   expect(extractedValues[1]).to.contain(
      //     payslipJson.createUser[0].streetNumber
      //   );
      //   expect(extractedValues[2]).to.contain(
      //     payslipJson.createUser[0].doorNumber
      //   );
      //   expect(extractedValues[3]).to.contain(
      //     payslipJson.createUser[0].zipCode
      //   );
      //   expect(extractedValues[4]).to.contain(payslipJson.createUser[0].city);
      //   expect(extractedValues[5]).to.satisfy(
      //     (value) => value.includes('Austria') || value.includes('Österreich')
      //   );
      // });
      // cy.wait(1500);
      // // Confirm-close Address in the dialog
      // cy.get(
      //   'app-confirmation-dialog>.dialog-container>.dialog-footer>.dialog-actions>button>.title'
      // )
      //   .filter((index, buttonTitle) => {
      //     return (
      //       Cypress.$(buttonTitle).text().trim() === 'Confirm' ||
      //       Cypress.$(buttonTitle).text().trim() === 'Bestätigen'
      //     );
      //   })
      //   .click({ force: true });

      // // Wait for user creation process
      // cy.wait(2000);

      // Create the second user (without address)
      // createUser(payslipJson.createUserNoAddress[0]);

      // cy.get('send-to-print-promt .ng-star-inserted').then((elements) => {
      //   const extractedValues = Array.from(elements).map((el) =>
      //     el.innerText.trim()
      //   );
      //   cy.log('Extracted Values:', extractedValues);

      //   // Assuming the order is Street, House Number, Door Number, etc.
      //   expect(extractedValues[0]).to.contain('');
      //   expect(extractedValues[1]).to.contain('');
      //   expect(extractedValues[2]).to.contain('');
      //   expect(extractedValues[3]).to.contain('');
      //   expect(extractedValues[4]).to.contain('');
      //   expect(extractedValues[5]).to.contain('');
      // });

      // // Validate and confirm second user creation
      // cy.wait(1500);
      // cy.get(
      //   'app-confirmation-dialog>.dialog-container>.dialog-footer>.dialog-actions>button>.title'
      // )
      //   .filter((index, buttonTitle) => {
      //     return (
      //       Cypress.$(buttonTitle).text().trim() === 'Confirm' ||
      //       Cypress.$(buttonTitle).text().trim() === 'Bestätigen'
      //     );
      //   })
      //   .click({ force: true });

      // Validate success message
      cy.get('sv-multiple-notifications>.messages>p')
        .invoke('text')
        .then((text) => {
          const trimmedText = text.trim();

          // Check if the text matches either English or German success message
          expect(trimmedText).to.be.oneOf([
            'User created', // English
            'Benutzer angelegt', // German
          ]);

          //Download credentials
          cy.get('.download-bttn').click();
          cy.wait(1000);

          // Get the latest downloaded PDF file
          const downloadsDir =
            'C:\\Users\\mubavin\\Cypress\\EG\\cypress-automatison-framework\\cypress\\downloads\\';
          cy.task('getDownloadedPdf', downloadsDir).then((filePath) => {
            expect(filePath).to.not.be.null; // Assert the file exists
            cy.log(`Latest PDF File Path: ${filePath}`);
            cy.wait(3000);
            // Read the PDF content and open in the same tab using a Blob
            cy.readFile(filePath, 'binary').then((pdfBinary) => {
              const pdfBlob = Cypress.Blob.binaryStringToBlob(
                pdfBinary,
                'application/pdf'
              );
              const pdfUrl = URL.createObjectURL(pdfBlob);

              // Open the PDF in the same tab
              cy.window().then((win) => {
                win.location.href = pdfUrl; // Loads the PDF in the same window
              });
            });
          });
          cy.wait(3500);
        });

      //********************* Yopmail *********************
      const user = payslipJson.createUser[0];

      // Visit yopmail application or login page
      cy.visit('https://yopmail.com/en/');
      cy.get('#login').type(user.email);
      cy.get('#refreshbut > .md > .material-icons-outlined').click();
      cy.iframe('#ifinbox')
        .find('.mctn > .m > button > .lms')
        .eq(0)
        .should('include.text', 'Ihr neuer Benutzer im e-Gehaltszettel Portal'); //Validate subject of Verification email

      cy.iframe('#ifmail')
        .find(
          '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span'
        )
        .invoke('text')
        .then((innerText) => {
          const startIndex =
            innerText.indexOf('Hier ist Ihr Benutzername:') +
            'Hier ist Ihr Benutzername:'.length;
          const endIndex = innerText.indexOf('Bitte bestätigen Sie');

          const usernameFromEmailBody = innerText
            .substring(startIndex, endIndex)
            .trim();

          cy.log('Captured text:', usernameFromEmailBody);

          //Confirm Email Address  - by clicking on "Jetzt E-Mail Adresse bestätigen" button from Comfirmation email

          let initialUrl;
          cy.iframe('#ifmail')
            .find(
              '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span>a'
            )
            .should('include.text', 'Jetzt E-Mail Adresse bestätigen')
            .invoke('attr', 'href')
            .then((href) => {
              // Log link text
              cy.log(`The href attribute is: ${href}`);
            });

          cy.iframe('#ifmail')
            .find(
              '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span>a'
            )
            .invoke('attr', 'target', '_self') //prevent opening in new tab
            .click();
          cy.wait(4000);
          // cy.iframe("#ifmail")
          //   .find("#onetrust-accept-btn-handler")
          //   .should("exist")
          //   .click(); // if exist, Remove Cookie bar
          cy.iframe('#ifmail').find('.button').click();
          cy.wait(3000);

          //Reload inbox

          cy.get('#refresh').click(); //Click on Refresh inbox icon
          cy.wait(2000);
          //Reset Pasword email

          cy.iframe('#ifinbox')
            .find('.mctn > .m > button > .lms')
            .eq(0)

            .should(
              'include.text',
              'Passwort zurücksetzen e-Gehaltszettel Portal'
            ); //Validate subject of Verification email
          let initialUrl_pass;
          cy.iframe('#ifmail')
            .find(
              '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a'
            )
            .should('include.text', 'Neues Passwort erstellen ')
            .invoke('attr', 'href')
            .then((href) => {
              // Log link text
              cy.log(`The href attribute is: ${href}`);
            });
          cy.iframe('#ifmail')
            .find(
              '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a'
            )
            .invoke('attr', 'target', '_self') //prevent opening in new tab
            .click();
          cy.wait(1500);
          // cy.iframe("#ifmail")
          //   .find("#onetrust-accept-btn-handler")
          //   .should("exist")
          //   .click(); // Remove Cookie bar

          //Fill the Set password form
          cy.iframe('#ifmail')
            .find('.input__field-input')
            .eq(0)
            .click()
            .type(payslipJson.password_egEbox); //fill the 1st input field
          cy.iframe('#ifmail').find('.input-eye-icon').eq(0).click(); //Click on Show password icon

          cy.iframe('#ifmail')
            .find('.input__field-input')
            .eq(1)
            .type(payslipJson.password_egEbox); //fill the 2nd input field
          cy.iframe('#ifmail').find('.input-eye-icon').eq(1).click(); //Click on Show password icon
          cy.iframe('#ifmail').find('.button').click(); //Click on confirm button

          //********************* Login to ebox 1st time *********************

          cy.then(() => {
            cy.log('Captured text:', usernameFromEmailBody);
            // Use usernameFromEmailBody in subsequent Cypress commands
            // cy.iframe("#ifmail")
            //   .find('.input__field-input[placeholder="Benutzername"]')
            //   .type(usernameFromEmailBody);

            // // Fill in the login form using a password
            // cy.iframe("#ifmail")
            //   .find('.input__field-input[placeholder="Passwort"]')
            //   .type(password);

            // // Click the login button
            // cy.iframe("#ifmail").find('button[type="submit"]').click();

            // //logout
            // cy.iframe("#ifmail")
            //   .find(
            //     ".mat-menu-trigger > .mat-tooltip-trigger > #undefined > .mat-button-wrapper > .button-content-wrap"
            //   )
            //   .click();
            // cy.get(".logout-title > a").click();

            cy.visit(payslipJson.baseUrl_egEbox); //Visit EG E-box login page

            // Wait for the cookie bar to appear
            // cy.wait(1000).then(() => {
            //   cy.get("#onetrust-policy-title").should("be.visible");
            //   cy.get("#onetrust-accept-btn-handler").click(); //Remove Cookie bar
            // });

            cy.get('#onetrust-policy-title')
              .should('be.visible')
              .then(() => {
                // If the cookie bar is visible, click on it and remove it
                cy.get('#onetrust-accept-btn-handler').click();
              })
              .wrap(Promise.resolve())
              .then(() => {
                // Continue with Login
                cy.get(
                  ':nth-child(1) > .ng-invalid > .input > .input__field-input'
                ).type(usernameFromEmailBody);
                cy.get('.ng-invalid > .input > .input__field-input').type(
                  payslipJson.password_egEbox
                );
                cy.wait(1000);
                cy.get('button[type="submit"]').click(); //Login to E-Brief
                cy.wait(3000);

                // Logout
                cy.get('.user-title').click();
                cy.wait(1500);
                cy.get('.logout-title > a').click();
                cy.url().should('include', payslipJson.baseUrl_egEbox); // Validate url
                cy.log('Test completed successfully.');
              });
          });
        });

      //------------------------------------------------------------------------------------------------------------------------///
      // cy.wait(2500);
      // //Logout
      // cy.get('.logout-icon ').click();
      // cy.wait(2000);
      // cy.get('.confirm-buttons > :nth-child(2)').click();
      // cy.log('Test completed successfully.');
      // cy.wait(2500);
    }); //end fixture
  });

  // M A S T E R    U S E R - DELETE ALREADY CREATED USERS
  it('Login As Master User - Delete Alredy created Users', () => {
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
      //Switch to user section
      cy.get('.action-buttons > .mdc-button').eq(4).click();

      // Array of users to delete
      const usersToDelete = ['manualAddress']; // Add more usernames as needed

      usersToDelete.forEach((userName, index) => {
        // Function to search for and delete a user
        const searchAndDeleteUser = (userName) => {
          // Search for the user
          cy.get('.search-label').click();

          // Type the username as a search criterion
          cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
            .clear() // Clear any previous input
            .type(userName);

          // Click on the submit button to search
          cy.get('button[type="submit"]').click();

          // Wait for search results to load (adjust as needed for dynamic loading)
          cy.get('body').then(($body) => {
            if ($body.find('.no-results-message').length > 0) {
              // If the user doesn't exist or is already deleted
              cy.log(`User ${userName} not found or already deleted.`);

              // Reset the search by clicking on the reset button
              cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click();

              // Proceed with the next search criteria
              if (index < usersToDelete.length - 1) {
                cy.log(
                  `Proceeding with the next user: ${usersToDelete[index + 1]}`
                );
              }
            } else {
              // If the user is found, proceed with the deletion
              cy.log(`User ${userName} found. Proceeding with deletion.`);

              // Click the delete button (adjust the selector as per your app)
              cy.get('button')
                .contains(/Delete|DSGVO-Löschung/)
                .click();

              // Confirm delete in the confirmation dialog
              cy.get('.confirm-buttons > button')
                .filter((index, button) => {
                  return (
                    Cypress.$(button).text().trim() === 'YES' ||
                    Cypress.$(button).text().trim() === 'JA'
                  );
                })
                .click();

              // Log the deletion
              cy.log(`User ${userName} has been deleted.`);

              // Reset the search to clear out the search pill
              cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click();
            }
          });
        };

        // Call the function to search and delete user
        searchAndDeleteUser(userName);

        // Optional wait between deletions (if needed)
        cy.wait(1000);
      });

      //Logout
      cy.get('.logout-icon ').click();
      cy.wait(2000);
      cy.get('.confirm-buttons > :nth-child(2)').click();
      cy.url();
      cy.should('include', 'https://supportviewpayslip.edeja.com/fe/login'); // Validate url
      cy.wait(1500);
    });
    // Completion message at the end of the test
    cy.log('The tests have been completed successfully.');
    cy.wait(3000);
  }); //end it

  //Y O P M A I L
  it('Yopmail - Clear inbox', () => {
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      // Take data from User (json)
      const user = payslipJson.createUser[0];

      // Visit yopmail application or login page
      cy.visit('https://yopmail.com/en/');
      cy.get('#login').type(user.email);
      cy.wait(1500);
      cy.get('#refreshbut > .md > .material-icons-outlined').click();
      cy.wait(1500);
      // Delete all emails if the button is not disabled
      cy.get('.menu>div>#delall')
        .should('not.be.disabled')
        .click({ force: true });
      cy.wait(2500);
    });
  }); //end fixture
}); //end describe
