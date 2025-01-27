describe('Masteruser - Create Admin User From JSON', () => {
  it('MasterCreateAdminUser', () => {
    // Login as Master User using a custom command
    cy.loginToSupportViewMaster();
    cy.wait(3500);
    //Search for Company by Display Name
    cy.get('#searchButton>span').click(); //Click on search button
    cy.wait(1000);

    // Use the company name from the cypress.config.js
    const companyName = Cypress.env('company');
    // Search for Group by Display Name using the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(1)
      .type(companyName);

    cy.wait(1500);
    //Find the Search button by button name and click on it
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    // Switch on Admin User page
    cy.get('.ng-star-inserted>.action-buttons>button')
      .contains(/Admin User|Admin Benutzer/)
      .then(($button) => {
        if ($button.length > 0) {
          cy.wrap($button).click({ force: true });
        }
      });

    // Click on 'Create Admin User' button to open the dialog
    cy.get('.mat-primary>.mdc-button__label')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return (
          text === 'Create Admin User' || text === 'Admin Benutzer Anlegen'
        );
      })
      .click();
    cy.wait(1500);

    // Access the first Admin User object from cypress.config.js
    const adminUser = Cypress.env('createAdminUser')[0];

    // Fill out the form fields with data from the fixture file
    cy.get('input[formcontrolname="firstName"]').type(adminUser.firstName); // First Name
    cy.get('input[formcontrolname="lastName"]').type(adminUser.lastName); // Last Name
    cy.get('input[formcontrolname="username"]').type(adminUser.username); // Username
    cy.get('input[formcontrolname="email"]').type(adminUser.email); // Email

    // //Submit the form
    // cy.get('button[type="submit"]').click();
    // cy.wait(8000);

    cy.intercept('POST', '**/supportView/v1/person/editXUser**').as(
      'editXUser'
    );
    cy.get('button[type="submit"]').click();

    cy.wait(['@editXUser'], { timeout: 27000 }).then((interception) => {
      // Log the intercepted response
      cy.log('Intercepted response:', interception.response);

      // Optional: Assert the response status code
      expect(interception.response.statusCode).to.eq(201);
    });

    // Verify the success message
    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible') // Ensure it's visible first
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Admin User created|Admin Benutzer angelegt/
        );
      });

    cy.wait(4000);

    //Masteruser try to create Admin which already exist

    // Click on 'Create Admin User' button to open the dialog
    cy.get('.mat-primary>.mdc-button__label')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return (
          text === 'Create Admin User' || text === 'Admin Benutzer Anlegen'
        );
      })
      .click();
    cy.wait(1500);

    // Fill out the form fields with data from the cypress.config.js
    cy.get('input[formcontrolname="firstName"]').type(adminUser.firstName); // First Name
    cy.get('input[formcontrolname="lastName"]').type(adminUser.lastName); // Last Name
    cy.get('input[formcontrolname="username"]').type(adminUser.username); // Username
    cy.get('input[formcontrolname="email"]').type(adminUser.email); // Email
    // Submit the form
    cy.get('button[type="submit"]').click();
    cy.wait(2500);

    // Verify Error message
    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible') // Ensure it's visible first
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /User already exists|Benutzer existiert bereits/
        );
      });

    cy.wait(3500);
    //Close Create Admin user dialog
    cy.get('.close ').click();

    //Search for new Admin
    cy.get('#searchButton').click({ force: true });
    cy.wait(1500);
    cy.get('input[formcontrolname="userName"]')
      .click()
      .type(adminUser.username); //Search for newly created user using username
    cy.get('button[type="submit"]').click(); //Click on Search button
    cy.wait(2500);

    //Add permition to Admin user by clicking on the Role button
    cy.get('.action-buttons>button>.mdc-button__label')
      .should('exist') // Ensure the element exists
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Rights' || text === 'Rechte'; // Find the "Rights | Rechte" button
      })
      .first() // Use the first matching element if multiple exist
      .should('be.visible') // Ensure it's visible
      .click({ force: true }); // Force the click to handle asynchronous rendering
    cy.wait(2500);

    // Select the "View E-Box" role
    cy.get('mat-checkbox .mdc-form-field .mdc-label')
      .contains(/View E-Box|E-Box ansehen/) // Match either of the two labels
      .click(); // Click to select

    // Select the "Customer Creator" role
    cy.get('mat-checkbox .mdc-form-field .mdc-label')
      .contains(/Customer Creator|Nutzeranlage/) // Match either of the two labels
      .click(); // Click to select

    // Select the "Data Submitter" role
    cy.get('mat-checkbox .mdc-form-field .mdc-label')
      .contains(/Data Submitter|Versand/) // Match either of the two labels
      .click(); // Click to select

    cy.wait(1500);
    //Save Roles
    cy.get('button[type="submit"]').click({ force: true });
    cy.wait(1500);

    // Verify  Rights updated succesfully message
    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible') // Ensure it's visible first
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(/Rights updated|Rechte aktualisiert/);
      });
    cy.wait(2500);
    //Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.log('Test completed successfully.');
    cy.wait(2500);

    //********************* Yopmail *********************
  }); //end it

  before(() => {
    cy.getCredentialsFromYopmail(); // Ensure credentials are fetched before the test runs
  });

  it.only('Login to Supportview Using Retrieved Credentials', () => {
    const username = Cypress.env('capturedUsername');
    const password = Cypress.env('capturedPassword');

    cy.visit(Cypress.env('baseUrl'));
    cy.wait(2500);
    cy.get('input[formcontrolname="username"]').type(username);
    cy.get('input[formcontrolname="password"]').type(password);
    cy.get('button[type="submit"]').click({ force: true });
  });

  it('Get Credentials from emails and Login as a New Admin', () => {
    const adminUser = Cypress.env('createAdminUser')[0];

    // Visit the Yopmail inbox
    cy.visit('https://yopmail.com/en/');
    cy.get('#login').type(adminUser.email); // Use the same email generated earlier
    cy.get('#refreshbut > .md > .material-icons-outlined').click();

    // Retrieve all email subjects
    cy.iframe('#ifinbox')

      //Create Issue
      .find('.mctn > .m > button > .lms')
      .then((emails) => {
        // Create an array of email subjects
        const emailSubjects = [...emails].map((email) =>
          email.textContent.trim()
        );

        // Variables to store email indices
        let usernameEmailIndex = -1;
        let passwordEmailIndex = -1;

        // Identify the indices based on the subjects
        emailSubjects.forEach((subject, index) => {
          if (
            subject.includes(
              'Neuer Benutzer e-Gehaltszettel Portal – Benutzername'
            )
          ) {
            usernameEmailIndex = index;
          } else if (
            subject.includes('Neuer Benutzer e-Gehaltszettel Portal – Passwort')
          ) {
            passwordEmailIndex = index;
          }
        });

        // Validate the Username email
        if (usernameEmailIndex !== -1) {
          cy.iframe('#ifinbox')
            .find('.mctn > .m > button > .lms')
            .eq(usernameEmailIndex)
            .click()
            .wait(1500);

          cy.iframe('#ifmail')
            .find(
              '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span'
            )
            .invoke('text')
            .then((innerText) => {
              const startIndex =
                innerText.indexOf('Hier ist Ihr Benutzername:') +
                'Hier ist Ihr Benutzername:'.length;
              const usernameFromEmailBody = innerText
                .substring(startIndex)
                .trim();

              // Store the captured username globally
              cy.wrap(usernameFromEmailBody).as('capturedUsername');
              Cypress.env('usernameFromEmailBody', usernameFromEmailBody);

              // Assert the username matches the expected username
              expect(usernameFromEmailBody).to.equal(adminUser.username);
              cy.wait(2500);

              // Log the username
              cy.log('Username:', usernameFromEmailBody);
            });
        }

        // Validate the Password email
        if (passwordEmailIndex !== -1) {
          cy.iframe('#ifinbox')
            .find('.mctn > .m > button > .lms')
            .eq(passwordEmailIndex)
            .click()
            .wait(1500);

          cy.iframe('#ifmail')
            .find(
              '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span'
            )
            .invoke('text')
            .then((innerText) => {
              const startIndex =
                innerText.indexOf('hier ist Ihr Passwort:') +
                'hier ist Ihr Passwort:'.length;
              const passwordFromEmailBody = innerText
                .substring(startIndex)
                .trim();

              // Store the captured password globally
              cy.wrap(passwordFromEmailBody).as('capturedPassword');
              Cypress.env('passwordFromEmailBody', passwordFromEmailBody);

              // Log the password
              cy.log('Password:', passwordFromEmailBody);
            });
        }
      });

    // New Admin is Logging into SW using Credentials taken from emails
    cy.wait(2500);
    cy.intercept('GET', '**/supportView/v1/generalInfo**').as('visitURL');
    // cy.get('button[type="submit"]').click();
    cy.visit(Cypress.env('baseUrl'), {
      failOnStatusCode: false,
    });

    cy.wait(['@visitURL'], { timeout: 27000 }).then((interception) => {
      // Log the intercepted response
      cy.log('Intercepted response:', interception.response);

      // Optional: Assert the response status code
      expect(interception.response.statusCode).to.eq(200);
    });

    // Validate that the login page URL includes '/login'
    cy.url().should('include', '/login');
    // Use extracted username and password for login
    cy.get('@capturedUsername').then((username) => {
      cy.get('@capturedPassword').then((password) => {
        // Enter credentials and submit the form
        cy.get('input[formcontrolname="username"]').type(username);
        cy.get('input[formcontrolname="password"]').type(password);
        cy.wait(1500);

        cy.get('button[type="submit"]').click(); //end captured password
        // Wait for login to complete

        // cy.intercept('POST', '**/supportView/v1/login/user**').as('loginURL');
        // // cy.get('button[type="submit"]').click();

        // cy.wait(['@loginURL'], { timeout: 27000 }).then(
        //   (interception) => {
        //     // Log the intercepted response
        //     // cy.log('Intercepted response:', interception.response);
        //     cy.visit(
        //       'https://supportviewpayslip.edeja.com/fe/dashboard/groups',
        //       {
        //         failOnStatusCode: false,
        //       }
        //     );
        //     // Optional: Assert the response status code
        //     // expect(interception.statusCode).to.eq(200);
        //   },
        //   (err) => {
        //     cy.log('ERROR', err);
        //     cy.pause();
        //   }
        // );

        cy.wait(5500);
        cy.visit(Cypress.env('dashboardURL'));
        cy.wait(5500);

        //Check visibility of buttons depend of selected Roles on the Companies page
        const buttonLabelsCompaniesPage = [
          {
            en: 'Upload Document',
            de: 'Personalisierte Dokumente hochladen',
          },
          //{ en: 'Upload Documet', de: 'Personalisierte Dokumente hochladen' },
          { en: 'Mass Upload', de: 'Massensendung hochladen' },
          { en: 'User', de: 'Benutzer' },
        ];
        cy.get('button > .mdc-button__label').each(($button) => {
          cy.wrap($button)
            .invoke('text')
            .then((text) => {
              const trimmedText = text.trim();
              const isValid = buttonLabelsCompaniesPage.some(
                (label) => label.en === trimmedText || label.de === trimmedText
              );

              // Assert that the button text matches one of the expected labels
              expect(isValid, `Unexpected button label: "${trimmedText}"`).to.be
                .true;
            });
        });
        // Click on the 'User | Benutzer' button
        cy.get('button > .mdc-button__label')
          .filter((index, el) => {
            const text = Cypress.$(el).text().trim();
            return text === 'User' || text === 'Benutzer';
          })
          .click();
        cy.wait(1500);

        cy.wait(2500); // Optional wait, not recommended unless necessary

        //Check visibility of buttons depend of selected Roles on User page
        const buttonLabels = [
          {
            en: 'Select users to deliver documents',
            de: 'Benutzer für die Zustellung von Dokumenten auswählen',
          },
          { en: 'Create User', de: 'Neuen Benutzer Anlegen' },
          { en: 'Edit', de: 'Bearbeiten' },
          { en: 'Password reset', de: 'Passwort wiederherstellen' },
          { en: 'Open E-Box', de: 'E-Box Öffnen' },
        ];

        cy.get('button > .mdc-button__label').each(($button) => {
          cy.wrap($button)
            .invoke('text')
            .then((text) => {
              const trimmedText = text.trim();
              const isValid = buttonLabels.some(
                (label) => label.en === trimmedText || label.de === trimmedText
              );

              // Assert that the button text matches one of the expected labels
              expect(isValid, `Unexpected button label: "${trimmedText}"`).to.be
                .true;
            });
        });
        cy.wait(2500);
        //Change Password
        cy.get('.menu-trigger>.mat-mdc-menu-trigger>.user-display-name').click({
          force: true,
        });
        cy.wait(2000);
        //Click on Change password button
        cy.get('.password-bttn').click({ force: true });
        cy.wait(1500);
        //Eter valid data into Change Password form
        cy.get('@capturedPassword').then((password) => {
          cy.get('input[formcontrolname="oldPassword"]').type(password);
          //Click on eye icon
          cy.get('button>mat-icon[data-mat-icon-name="password_invisible"]')
            .eq(0)
            .click({ force: true });
          cy.wait(1000);
          cy.get('input[formcontrolname="newPassword"]').type(
            Cypress.env('password_supportViewAdmin')
          );
          //Click on eye icon
          cy.get('button>mat-icon[data-mat-icon-name="password_invisible"]')
            .eq(0)
            .click({ force: true });
          cy.wait(1000);
          cy.get('input[formcontrolname="confirmedNewPassword"]').type(
            Cypress.env('password_supportViewAdmin')
          );
          //Click on eye icon
          cy.get('button>mat-icon[data-mat-icon-name="password_invisible"]')
            .eq(0)
            .click({ force: true });
          cy.wait(1000);
        }); //end captured password
        cy.wait(2500);
        //Submit Change Passwor form
        cy.get('.button-container>button[type="submit"]').click({
          force: true,
        });

        //Logout
        cy.get('.logout-icon ').click();
        cy.wait(2000);
        cy.get('.confirm-buttons > :nth-child(2)').click();
        cy.log('Test completed successfully.');
        cy.wait(2500);
      });
    });
  }); //end it

  it('Master user delete Admin user', () => {
    const companyName = Cypress.env('company');
    const adminUser = Cypress.env('createAdminUser')[0];
    //*******************MASTERUSER DELETE NEW ADMIN USER */
    // Login as Master User using a custom command
    cy.loginToSupportViewMaster();
    cy.wait(3500);
    //Search for the Test Company
    cy.get('#searchButton>span').click(); //Click on search button
    cy.wait(1000);

    // Search for Group by Display Name using the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(1)
      .type(companyName);
    cy.wait(1500);
    //Find the Search button by button name and click on it
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    // Switch on Admin User page
    cy.get('.ng-star-inserted>.action-buttons>button')
      .contains(/Admin User|Admin Benutzer/)
      .then(($button) => {
        if ($button.length > 0) {
          cy.wrap($button).click({ force: true });
        }
      });

    cy.wait(2500);
    //Search for Admin user
    cy.get('#searchButton').click({ force: true });
    cy.wait(1500);
    cy.get('input[formcontrolname="userName"]')
      .click()
      .type(adminUser.username); //Search for newly created user using username
    cy.get('button[type="submit"]').click(); //Click on Search button
    cy.wait(2500);

    //Delete Admin
    cy.get('.action-buttons>button>.mdc-button__label')
      .should('exist') // Ensure the element exists
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'GDPR-Delete' || text === 'DSGVO-Löschung'; // Find the Delete button
      })
      .first() // Use the first matching element if multiple exist
      .should('be.visible') // Ensure it's visible
      .click({ force: true }); // Force the click to handle asynchronous rendering
    cy.wait(2500);

    //Confirm Admin delte action
    cy.get('button[color="primary"]>.mdc-button__label')
      .should('exist') // Ensure the element exists
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'YES' || text === 'JA'; // Find the Delete button
      })
      .click({ force: true }); // Force the click to handle asynchronous rendering
    cy.wait(2500);

    // Verify  User deleted succesfully message
    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible') // Ensure it's visible first
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /User deleted succesfully|Benutzer erfolgreich gelöscht/
        );
      });

    //Search for just deleted Admin user
    cy.get('#searchButton').click({ force: true });
    cy.wait(1500);
    // cy.get('input[formcontrolname="userName"]')
    //   .click()
    //   .type(adminUser.username); //Search for newly created user using username

    cy.get('button[type="submit"]').click(); //Click on Search button
    cy.wait(2500);

    //Already deleted Admin user is not founded

    cy.get('.mat-mdc-paginator-range-actions>.mat-mdc-paginator-range-label')
      .invoke('css', 'border', '1px solid blue')
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(/0 of 0|0 von 0/);
      });

    cy.wait(2500);
    //Logout from SW
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.wait(2500);
    cy.log('Test is successfully executed.');
  }); //end it

  it('Yopmail - Clear inbox', () => {
    const adminUser = Cypress.env('createAdminUser')[0];

    // Visit Yopmail application or login page
    cy.visit('https://yopmail.com/en/');
    // Type the email and click refresh
    cy.get('#login')
      .type(adminUser.email)
      .should('have.value', adminUser.email);
    cy.wait(1500);
    cy.get('#refreshbut > .md > .material-icons-outlined').click();

    cy.wait(1500);
    // Delete all emails if the button is not disabled
    cy.get('.menu>div>#delall')
      .should('not.be.disabled')
      .click({ force: true });
    cy.wait(2500);
  }); //end it
}); //end describe

//************************************************************************************ */

// describe('R04_Create User -Manual.js', () => {
//   it.only('Login As Masteruser - Create User Manually', () => {
//     // Login as Master User using a custom command
//     cy.loginToSupportViewMaster();
//     cy.wait(3500);
//     //Search for Company by Display Name
//     cy.get('#searchButton>span').click(); //Click on search button
//     cy.wait(1000);

//     // Use the company name from the cypress.config.js
//     const companyName = Cypress.env('company');

//     // Search for Group by Display Name using the company name
//     cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
//       .eq(1)
//       .type(companyName);

//     //Find the Search button by button name and click on it
//     cy.get('.search-dialog>form>div>.mat-primary').click();
//     cy.wait(1500);

//     cy.get('.action-buttons>.mdc-button>.mdc-button__label')
//       .filter((index, el) => {
//         const text = Cypress.$(el).text().trim();
//         return text === 'User' || text === 'Benutzer';
//       })
//       .click({ force: true });

//     // Function to create a user
//     function createUser(user) {
//       // Click 'Create User' button
//       cy.get('button > .mdc-button__label')
//         .filter((index, el) => {
//           const text = Cypress.$(el).text().trim();
//           return text === 'Create user' || text === 'Neuen Benutzer Anlegen';
//         })
//         .click({ force: true });

//       cy.wait(1500);

//       // Click on Manual Creation
//       cy.get('.create_user_dialog_content>.buttons-wrapper>button')
//         .filter((index, el) => {
//           const text = Cypress.$(el).text().trim();
//           return text === 'Manuel Creation' || text === 'Manuelle Anlage';
//         })
//         .click();

//       // Fill in user details
//       cy.get('mat-select[formControlName="salutation"]').click();
//       cy.get('mat-option').eq(0).click({ force: true });

//       cy.get('input[formcontrolname="firstName"]').type(user.firstName);
//       cy.get('input[formcontrolname="lastName"]').type(user.lastName);
//       cy.get('input')
//         .filter((index, input) => {
//           const placeholder = Cypress.$(input).attr('placeholder');
//           return (
//             placeholder &&
//             (placeholder.trim() === 'Account Number *' ||
//               placeholder.trim() === 'Personalnummer *')
//           );
//         })
//         .click()
//         .type(user.username);

//       cy.get('input[formcontrolname="email"]').type(user.email);

//       // Select phone number prefix
//       cy.get(
//         ':nth-child(4) > .mat-mdc-form-field-type-mat-select > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix'
//       ).click();
//       cy.wait(500);
//       cy.get('.mdc-list-item').eq(0).click();

//       // Fill phone number fields
//       cy.get('input[formcontrolname="countryCodePhoneNum"]')
//         .click({ force: true })
//         .type(user.countryCodePhoneNum);
//       cy.get('input[formcontrolname="netNumberPhoneNum"]').type(
//         user.netNumberPhoneNum
//       );
//       cy.get('input[formcontrolname="subscriberNumberPhoneNum"]').type(
//         user.subscriberNumberPhoneNum
//       );

//       // Fill in address if available
//       if (user.streetName) {
//         cy.get('input[formcontrolname="streetName"]').type(user.streetName);
//         cy.get('input[formcontrolname="streetNumber"]').type(user.streetNumber);
//         cy.get('input[formcontrolname="doorNumber"]').type(user.doorNumber);
//         cy.get('input[formcontrolname="zipCode"]').type(user.zipCode);
//         cy.get('input[formcontrolname="city"]').type(user.city);
//       }

//       // Fill in title
//       cy.get('input[formcontrolname="prefixedTitle"]').type(user.prefixedTitle);

//       //cy.get('button[type="submit"]').click({ force: true });
//       cy.wait(1500);
//       // Submit the form
//       cy.get('button[color="primary"]>.mdc-button__label')
//         .filter((index, button) => {
//           return (
//             Cypress.$(button).text().trim() === 'Submit' ||
//             Cypress.$(button).text().trim() === 'Absenden'
//           );
//         })
//         .click({ force: true });
//       cy.wait(1500);
//     } //end create usr function

//     // Create the first user (with address)
//     //createUser(payslipJson.createUser[0]);
//     createUser(Cypress.env('createUser')[0]);

//     // Access the first Admin User object from cypress.config.js
//     const user = Cypress.env('createUser')[0];

//     // Validate Confirm Address dialog
//     // cy.wait(1500);
//     // cy.get('send-to-print-promt .ng-star-inserted').then((elements) => {
//     //   const extractedValues = Array.from(elements).map((el) =>
//     //     el.innerText.trim()
//     //   );
//     //   cy.log('Extracted Values:', extractedValues);

//     //   // Validate the extracted values match the address data from the fixture
//     //   expect(extractedValues[0]).to.contain(
//     //     payslipJson.createUser[0].streetName
//     //   );
//     //   expect(extractedValues[1]).to.contain(
//     //     payslipJson.createUser[0].streetNumber
//     //   );
//     //   expect(extractedValues[2]).to.contain(
//     //     payslipJson.createUser[0].doorNumber
//     //   );
//     //   expect(extractedValues[3]).to.contain(
//     //     payslipJson.createUser[0].zipCode
//     //   );
//     //   expect(extractedValues[4]).to.contain(payslipJson.createUser[0].city);
//     //   expect(extractedValues[5]).to.satisfy(
//     //     (value) => value.includes('Austria') || value.includes('Österreich')
//     //   );
//     // });
//     // cy.wait(1500);
//     // // Confirm-close Address in the dialog
//     // cy.get(
//     //   'app-confirmation-dialog>.dialog-container>.dialog-footer>.dialog-actions>button>.title'
//     // )
//     //   .filter((index, buttonTitle) => {
//     //     return (
//     //       Cypress.$(buttonTitle).text().trim() === 'Confirm' ||
//     //       Cypress.$(buttonTitle).text().trim() === 'Bestätigen'
//     //     );
//     //   })
//     //   .click({ force: true });

//     // // Wait for user creation process
//     // cy.wait(2000);

//     // Create the second user (without address)
//     // createUser(payslipJson.createUserNoAddress[0]);

//     // cy.get('send-to-print-promt .ng-star-inserted').then((elements) => {
//     //   const extractedValues = Array.from(elements).map((el) =>
//     //     el.innerText.trim()
//     //   );
//     //   cy.log('Extracted Values:', extractedValues);

//     //   // Assuming the order is Street, House Number, Door Number, etc.
//     //   expect(extractedValues[0]).to.contain('');
//     //   expect(extractedValues[1]).to.contain('');
//     //   expect(extractedValues[2]).to.contain('');
//     //   expect(extractedValues[3]).to.contain('');
//     //   expect(extractedValues[4]).to.contain('');
//     //   expect(extractedValues[5]).to.contain('');
//     // });

//     // // Validate and confirm second user creation
//     // cy.wait(1500);
//     // cy.get(
//     //   'app-confirmation-dialog>.dialog-container>.dialog-footer>.dialog-actions>button>.title'
//     // )
//     //   .filter((index, buttonTitle) => {
//     //     return (
//     //       Cypress.$(buttonTitle).text().trim() === 'Confirm' ||
//     //       Cypress.$(buttonTitle).text().trim() === 'Bestätigen'
//     //     );
//     //   })
//     //   .click({ force: true });

//     // Validate success message
//     cy.get('sv-multiple-notifications>.messages>p')
//       .invoke('text')
//       .then((text) => {
//         const trimmedText = text.trim();

//         // Check if the text matches either English or German success message
//         expect(trimmedText).to.be.oneOf([
//           'User created', // English
//           'Benutzer angelegt', // German
//         ]);

//         //Download credentials
//         cy.get('.download-bttn').click();
//         cy.wait(1000);

//         // Get the latest downloaded PDF file
//         const downloadsDir = Cypress.env('downloadsFolder');
//         cy.task('getDownloadedPdf', downloadsDir).then((filePath) => {
//           expect(filePath).to.not.be.null; // Assert the file exists
//           cy.log(`Latest PDF File Path: ${filePath}`);
//           cy.wait(3000);
//           // Read the PDF content and open in the same tab using a Blob
//           cy.readFile(filePath, 'binary').then((pdfBinary) => {
//             const pdfBlob = Cypress.Blob.binaryStringToBlob(
//               pdfBinary,
//               'application/pdf'
//             );
//             const pdfUrl = URL.createObjectURL(pdfBlob);

//             // Open the PDF in the same tab
//             cy.window().then((win) => {
//               win.location.href = pdfUrl; // Loads the PDF in the same window
//             });
//           });
//         });
//         cy.wait(3500);
//       });

//     //********************* Yopmail *********************

//     // Visit yopmail application or login page
//     cy.visit('https://yopmail.com/en/');
//     cy.get('#login').type(user.email);
//     cy.get('#refreshbut > .md > .material-icons-outlined').click();
//     cy.iframe('#ifinbox')
//       .find('.mctn > .m > button > .lms')
//       .eq(0)
//       .should('include.text', 'Ihr neuer Benutzer im e-Gehaltszettel Portal'); //Validate subject of Verification email

//     cy.iframe('#ifmail')
//       .find(
//         '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span'
//       )
//       .invoke('text')
//       .then((innerText) => {
//         const startIndex =
//           innerText.indexOf('Hier ist Ihr Benutzername:') +
//           'Hier ist Ihr Benutzername:'.length;
//         const endIndex = innerText.indexOf('Bitte bestätigen Sie');

//         const usernameFromEmailBody = innerText
//           .substring(startIndex, endIndex)
//           .trim();

//         cy.log('Captured text:', usernameFromEmailBody);

//         //Confirm Email Address  - by clicking on "Jetzt E-Mail Adresse bestätigen" button from Comfirmation email

//         let initialUrl;
//         cy.iframe('#ifmail')
//           .find(
//             '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span>a'
//           )
//           .should('include.text', 'Jetzt E-Mail Adresse bestätigen')
//           .invoke('attr', 'href')
//           .then((href) => {
//             // Log link text
//             cy.log(`The href attribute is: ${href}`);
//           });

//         cy.iframe('#ifmail')
//           .find(
//             '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span>a'
//           )
//           .invoke('attr', 'target', '_self') //prevent opening in new tab
//           .click();
//         cy.wait(7000);
//         // cy.iframe("#ifmail")
//         //   .find("#onetrust-accept-btn-handler")
//         //   .should("exist")
//         //   .click(); // if exist, Remove Cookie bar
//         cy.iframe('#ifmail').find('.button').click();
//         cy.wait(4000);

//         //Reload inbox

//         cy.get('#refresh').click({ force: true }); //Click on Refresh inbox icon
//         cy.wait(4000);
//         //Reset Pasword email

//         cy.iframe('#ifinbox')
//           .find('.mctn > .m > button > .lms')
//           .eq(0)

//           .should(
//             'include.text',
//             'Passwort zurücksetzen e-Gehaltszettel Portal'
//           ); //Validate subject of Verification email
//         let initialUrl_pass;
//         cy.iframe('#ifmail')
//           .find(
//             '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a'
//           )
//           .should('include.text', 'Neues Passwort erstellen ')
//           .invoke('attr', 'href')
//           .then((href) => {
//             // Log link text
//             cy.log(`The href attribute is: ${href}`);
//           });
//         cy.iframe('#ifmail')
//           .find(
//             '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a'
//           )
//           .invoke('attr', 'target', '_self') //prevent opening in new tab
//           .click();
//         cy.wait(2500);
//         // cy.iframe("#ifmail")
//         //   .find("#onetrust-accept-btn-handler")
//         //   .should("exist")
//         //   .click(); // Remove Cookie bar

//         //Fill the Set password form
//         cy.iframe('#ifmail')
//           .find('.input__field-input')
//           .eq(0)
//           .click()
//           //.type(payslipJson.password_egEbox); //fill the 1st input field
//           .type(Cypress.env('password_egEbox')); //fill the 1st input field
//         cy.iframe('#ifmail').find('.input-eye-icon').eq(0).click(); //Click on Show password icon

//         cy.iframe('#ifmail')
//           .find('.input__field-input')
//           .eq(1)
//           //.type(payslipJson.password_egEbox); //fill the 2nd input field
//           .type(Cypress.env('password_egEbox')); //fill the 1st input field
//         cy.iframe('#ifmail').find('.input-eye-icon').eq(1).click(); //Click on Show password icon
//         cy.iframe('#ifmail').find('.button').click(); //Click on confirm button

//         //********************* Login to ebox 1st time *********************

//         //cy.visit(payslipJson.baseUrl_egEbox); //Visit EG E-box login page
//         cy.visit(Cypress.env('baseUrl_egEbox'));
//         cy.wait(5000);

//         // Wait for the cookie bar to appear
//         //Remove Cookie
//         cy.get('body').then(($body) => {
//           if ($body.find('#onetrust-policy-title').is(':visible')) {
//             // If the cookie bar is visible, click on it and remove it
//             cy.get('#onetrust-accept-btn-handler').click();
//           } else {
//             // Log that the cookie bar was not visible
//             cy.log('Cookie bar not visible');
//           }
//         }); //End Remove Cookie
//         cy.wait(1500);
//         // Continue with Login
//         cy.get(
//           ':nth-child(1) > .ng-invalid > .input > .input__field-input'
//         ).type(usernameFromEmailBody);

//         cy.get('.ng-invalid > .input > .input__field-input').type(
//           Cypress.env('password_egEbox')
//         ); //fill the 1st input field

//         cy.wait(1000);
//         cy.get('button[type="submit"]').click(); //Login to E-Brief
//         // cy.wait(6000);

//         cy.intercept('POST', '**/rest/v2/deliveries**').as(
//           'openDeliveriesPage'
//         );
//         // cy.get('button[type="submit"]').click();

//         cy.wait(['@openDeliveriesPage'], { timeout: 27000 }).then(
//           (interception) => {
//             // Log the intercepted response
//             cy.log('Intercepted response:', interception.response);

//             // Assert the response status code
//             expect(interception.response.statusCode).to.eq(200);
//           }
//         );
//         cy.wait(3000);
//         // Logout
//         cy.get('.user-title').click();
//         cy.wait(1500);
//         cy.get('.logout-title > a').click();
//         //cy.url().should('include', payslipJson.baseUrl_egEbox); // Validate url
//         cy.url().should('include', Cypress.env('baseUrl_egEbox')); // Validate url
//         cy.log('Test completed successfully.');
//       });
//   });

//   // M A S T E R    U S E R - DELETE ALREADY CREATED USERS
//   it('Login As Master User - Delete Alredy created Users', () => {
//     // Login as Master User using a custom command
//     const user = Cypress.env('createUser')[0];
//     cy.loginToSupportViewMaster();
//     cy.wait(3500);

//     //Search for Group by Display Name
//     cy.get('#searchButton>span').click(); //Click on search button
//     // Use the company name from the cypress.config.js
//     const companyName = Cypress.env('company');
//     // Search for Group by Display Name using the company name
//     cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
//       .eq(1)
//       .type(companyName);
//     //Find the Search button by button name and click on it
//     cy.get('.search-dialog>form>div>.mat-primary').click();
//     //Switch to user section
//     cy.get('.action-buttons > .mdc-button').eq(4).click();

//     // Array of users to delete
//     const usersToDelete = [user.username]; // Add more usernames as needed

//     usersToDelete.forEach((userName, index) => {
//       // Function to search for and delete a user
//       const searchAndDeleteUser = (userName) => {
//         // Search for the user
//         cy.get('.search-label').click();

//         // Type the username as a search criterion
//         cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
//           .clear() // Clear any previous input
//           .type(userName);

//         // Click on the submit button to search
//         cy.get('button[type="submit"]').click();

//         // Wait for search results to load (adjust as needed for dynamic loading)
//         cy.get('body').then(($body) => {
//           if ($body.find('.no-results-message').length > 0) {
//             // If the user doesn't exist or is already deleted
//             cy.log(`User ${userName} not found or already deleted.`);

//             // Reset the search by clicking on the reset button
//             cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click();

//             // Proceed with the next search criteria
//             if (index < usersToDelete.length - 1) {
//               cy.log(
//                 `Proceeding with the next user: ${usersToDelete[index + 1]}`
//               );
//             }
//           } else {
//             // If the user is found, proceed with the deletion
//             cy.log(`User ${userName} found. Proceeding with deletion.`);

//             // Click the delete button (adjust the selector as per your app)
//             cy.get('button')
//               .contains(/Delete|DSGVO-Löschung/)
//               .click();
//             cy.wait(2000);
//             // Confirm delete in the confirmation dialog
//             cy.get('.confirm-buttons > button')
//               .filter((index, button) => {
//                 return (
//                   Cypress.$(button).text().trim() === 'YES' ||
//                   Cypress.$(button).text().trim() === 'JA'
//                 );
//               })
//               .click();
//             cy.wait(2000);
//             // Log the deletion
//             cy.log(`User ${userName} has been deleted.`);

//             //Search for just deleted Admin user
//             cy.get('#searchButton').click({ force: true });
//             cy.wait(1500);

//             cy.get('button[type="submit"]').click(); //Click on Search button
//             cy.wait(2500);

//             //Already deleted Admin user is not founded

//             cy.get(
//               '.mat-mdc-paginator-range-actions>.mat-mdc-paginator-range-label'
//             )
//               .invoke('css', 'border', '1px solid blue')
//               .invoke('text') // Get the text of the element
//               .then((text) => {
//                 // Trim the text and validate it
//                 const trimmedText = text.trim();
//                 expect(trimmedText).to.match(/0 of 0|0 von 0/);
//               });

//             cy.wait(2500);
//           }
//         });
//       };
//       // Call the function to search and delete user
//       searchAndDeleteUser(userName);

//       // Optional wait between deletions (if needed)
//       cy.wait(1000);
//     });

//     //Logout
//     cy.get('.logout-icon ').click();
//     cy.wait(2000);
//     cy.get('.confirm-buttons > :nth-child(2)').click();
//     cy.url();
//     cy.url().should('include', Cypress.env('baseUrl')); // Validate url
//     cy.wait(1500);
//     // Completion message at the end of the test
//     cy.log('The tests have been completed successfully.');
//     cy.wait(3000);
//   }); //end it

//   //Y O P M A I L
//   it('Yopmail - Clear inbox', () => {
//     const user = Cypress.env('createUser')[0];

//     // Visit yopmail application or login page
//     cy.visit('https://yopmail.com/en/');
//     cy.get('#login').type(user.email);
//     cy.wait(1500);
//     cy.get('#refreshbut > .md > .material-icons-outlined').click();
//     cy.wait(1500);
//     // Delete all emails if the button is not disabled
//     cy.get('.menu>div>#delall')
//       .should('not.be.disabled')
//       .click({ force: true });
//     cy.wait(2500);
//   }); //end it
// }); //end describe
