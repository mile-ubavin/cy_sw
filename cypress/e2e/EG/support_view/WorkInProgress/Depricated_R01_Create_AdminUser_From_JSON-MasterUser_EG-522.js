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

  it('Get Credentials from emails and Login as a New Admin', () => {
    const adminUser = Cypress.env('createAdminUser')[0];

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
        cy.wait(3500);

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
