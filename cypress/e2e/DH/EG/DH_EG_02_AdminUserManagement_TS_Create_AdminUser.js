describe('Masteruser - Create Admin User From JSON', () => {
  //Precondition: Clear user`s email inbox if its not an empty

  // Precondition: Search for the Admin user and if user exists, proceed with deletion
  it('Search for the Admin user and if user(s) exist, proceed with deletion', () => {
    const companyName = Cypress.env('company');
    const adminUser = Cypress.env('createAdminUser')[0];

    // Login as Master User using a custom command
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

    //Search for the Admin user and if user exists, proceed with deletion

    const usersToDelete = [adminUser.username]; // Add more usernames as needed

    usersToDelete.forEach((userName) => {
      const searchAndDeleteUser = (userName) => {
        cy.get('.search-label').click();

        // Search for the user
        cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
          .clear()
          .type(userName);
        cy.get('button[type="submit"]').click();

        cy.wait(2000);

        // Check results
        cy.get('body').then(($body) => {
          if ($body.find('.cdk-row').length === 0) {
            cy.log(`User ${userName} not found or already deleted.`);
            // Close search dialog if needed
            cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click({
              force: true,
            });
          } else {
            // User exists -> proceed with deletion
            cy.get('.cdk-row').should('exist');
            cy.log(`User ${userName} found. Proceeding with deletion.`);

            cy.contains('button', /Delete|DSGVO-Löschung/)
              .should('be.visible')
              .click();

            cy.get('.confirm-buttons > button')
              .contains(/YES|JA/)
              .should('be.visible')
              .click();

            cy.log(`User ${userName} has been deleted.`);

            // ✅ Verify "User deleted successfully" snackbar ONLY if deletion occurred
            cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
              .should('be.visible')
              .invoke('text')
              .then((text) => {
                const trimmedText = text.trim();
                expect(trimmedText).to.match(
                  /User deleted succesfully|Benutzer erfolgreich gelöscht/,
                );
              });
          }
        });
      };

      cy.wait(1500);
      searchAndDeleteUser(userName);
      cy.wait(1000);
    });

    cy.wait(2500);
    //Logout from SW
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.wait(2500);
    cy.log('Test is successfully executed.');
  }); //end it

  // DH Create new Admin User (base and alternative scenarios)
  it('DH - AdminUserCreateNewAdmin', () => {
    // ===== Login to DH =====
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

    // Login to DH using custom command
    cy.loginToDH();
    cy.wait(2000);

    // ===== Navigate to Admin User Management =====
    cy.intercept('POST', '**/xUser/**').as('getAdminUsers');
    cy.get('#nav-admin-users')
      .should('be.visible')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      .wait(1500)
      .click();

    cy.wait('@getAdminUsers', { timeout: 15000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.wait(1500);

    // ===== Filter by Company =====
    const companyName = Cypress.env('company').toLowerCase();

    // Open the company dropdown
    cy.get('#admin-group-select').click({ force: true });
    cy.wait(1000);

    // Find and click the matching option (case-insensitive partial match)
    cy.get('ul[role="listbox"] > li > span')
      .should('be.visible')
      .then(($options) => {
        const match = [...$options].find((el) =>
          el.textContent.trim().toLowerCase().includes(companyName),
        );
        if (match) {
          cy.wrap(match).click({ force: true });
        } else {
          throw new Error(`No dropdown option contains: ${companyName}`);
        }
      });
    cy.wait(500);

    // Scroll to top to ensure "Create New Admin User" button is visible
    cy.scrollTo('top', { duration: 500 });

    // ===== Click Create New Admin User =====
    cy.get('#admin-create-new')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      .wait(1000)
      .contains(/Create New Admin User|Neuen Admin Benutzer Anlegen/i)
      .click();

    cy.wait(500);

    // Validate dialog title
    cy.get('.MuiModal-root>div:nth-of-type(3)>div:nth-of-type(1)>h2')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Create New Admin User|Neuen Admin Benutzer Anlegen/i,
        );
      });

    cy.wait(500);

    // ===== Fill Form =====
    const adminUser = Cypress.env('createAdminUser')[0];

    // First Name — validate empty error then fill
    cy.get('#create-admin-firstName').focus().blur();
    cy.get('#firstName-error')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /First name is required|Vorname ist erforderlich/i,
        );
      });
    cy.wait(500);
    cy.get('#create-admin-firstName').type(adminUser.firstName);

    // Last Name — validate empty error then fill
    cy.get('#create-admin-lastName').focus().blur();
    cy.get('#lastName-error')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Last name is required|Nachname ist erforderlich/i,
        );
      });
    cy.wait(500);
    cy.get('#create-admin-lastName').type(adminUser.lastName);

    // Username — validate empty error then fill
    cy.get('#create-admin-username').focus().blur();
    cy.get('#username-error')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Username is required|Benutzername ist erforderlich/i,
        );
      });
    cy.wait(500);
    cy.get('#create-admin-username').type(adminUser.username);

    // Email — validate empty error then fill
    cy.get('#create-admin-email').focus().blur();
    cy.get('#email-error')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Email is required|Email ist erforderlich/i,
        );
      });
    cy.wait(500);
    cy.get('#create-admin-email').type(adminUser.email);
    cy.wait(500);
    cy.get('#email-error').should('not.exist');

    // ===== Select Rights =====
    cy.get('#create-admin-rights').click();
    cy.wait(500);

    const roles = [
      /View E-Box|E-Box ansehen/i,
      /Customer Creator|Nutzeranlage/i,
      /Data Submitter|Versand/i,
    ];

    roles.forEach((role) => {
      cy.get('ul[role="listbox"] li p').each(($el) => {
        const text = $el.text().trim();
        if (role.test(text)) {
          cy.wrap($el).scrollIntoView().click({ force: true });
          return false; // break after first match
        }
      });
      cy.wait(300);
    });

    // Close rights dropdown by clicking outside
    cy.get('h2').first().click();
    cy.wait(500);

    // ===== Submit =====
    cy.intercept('POST', '**/person/fromGroup/xUser/**').as('createAdminUser');
    cy.get('button[type="submit"]').click();
    cy.wait(1000);

    // Verify success message
    cy.get('div[color="success"]>div')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Admin user successfully created|Admin User erfolgreich erstellt/i,
        );
      });

    cy.wait('@createAdminUser', { timeout: 15000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.wait(2500);

    // ===== Duplicate Admin User — Alternative Scenario =====

    // Click Create New Admin User again
    cy.get('#admin-create-new')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      .wait(1000)
      .contains(/Create New Admin User|Neuen Admin Benutzer Anlegen/i)
      .click();

    cy.wait(500);

    // Fill form with same data (duplicate)
    cy.get('#create-admin-firstName').type(adminUser.firstName);
    cy.get('#create-admin-lastName').type(adminUser.lastName);
    cy.get('#create-admin-username').type(adminUser.username);
    cy.get('#create-admin-email').type(adminUser.email);
    cy.wait(1000);

    // Submit duplicate
    cy.get('button[type="submit"]').click();
    cy.wait(1000);

    // Verify username already exists error on field
    cy.get('#username-error')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Username already exists|Benutzername existiert bereits/i,
        );
      });

    // Verify error toast
    cy.get('div[color="error"]>div')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /User could not be created|Benutzername existiert bereits/i,
        );
      });

    cy.wait(2500);
    cy.log('Test completed successfully.');

    //Close the Create Admin User dialog, by clicking on Cancel button
    cy.get('#create-admin-cancel').click();
    cy.wait(1500);

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

  //New Admin user - 1st time Login to DH using credentials taken from emails
  it('Get Credentials from emails and Login to DH as a New Admin', () => {
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
          email.textContent.trim(),
        );

        // Variables to store email indices
        let usernameEmailIndex = -1;
        let passwordEmailIndex = -1;

        // Identify the indices based on the subjects
        emailSubjects.forEach((subject, index) => {
          if (
            subject.includes('Neuer Benutzer DocuHub Portal – Benutzername')
          ) {
            usernameEmailIndex = index;
          } else if (
            subject.includes('Neuer Benutzer DocuHub Portal – Passwort')
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
              '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span',
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
              '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span',
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

    // ===== Step 2: Login to DH with credentials from email =====
    cy.wait(2500);

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

    cy.wait(1500);

    // Use extracted username and password for DH login
    cy.get('@capturedUsername').then((username) => {
      cy.get('@capturedPassword').then((password) => {
        // Fill DH login form
        cy.get('#login-username').type(username);
        cy.get('#login-password').type(password);
        cy.wait(1000);

        // Intercept login request
        cy.intercept('GET', '**/supportView/v1/group/getGroupData').as(
          'getGroupData',
        );

        // Click login button
        cy.get('#login-button').click();

        // Wait for successful login
        cy.wait('@getGroupData', { timeout: 35000 }).then((interception) => {
          expect(interception.response.statusCode).to.eq(200);
          cy.log('Login successful - navigated to DH home page');
        });

        // Validate URL after login
        cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);
        cy.wait(2000);
        // ===== Step 3: Verify DH navigation menu is visible =====
        cy.get('#nav-workspace').should('be.visible');
        // cy.get('#nav-admin-users').should('be.visible');
        //cy.get('#nav-employees').should('be.visible');

        cy.log('Successfully logged into DH with credentials from email');

        // ===== Step 4: Logout from DH =====
        cy.wait(2000);
        cy.get('button[id=":ra:"]').click();
        cy.wait(1000);
        cy.get('li[role="menuitem"]')
          .contains(/Abmelden|Logout/i)
          .click();

        cy.url().should('include', Cypress.env('dh_baseUrl'));
        cy.log('Test completed successfully.');
        cy.wait(2500);
      });
    });
  }); //end it

  //(c) 2025
  it.skip('Get Credentials from emails and Login as a New Admin and verify', () => {
    const adminUser = Cypress.env('createAdminUser')[0];

    // Visit the Yopmail inbox
    cy.visit('https://yopmail.com/en/');
    cy.get('#login').type(adminUser.email);
    cy.get('#refreshbut > .md > .material-icons-outlined').click();

    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .then((emails) => {
        const emailList = [...emails];

        let usernameEmailIndex = -1;
        let passwordEmailIndex = -1;

        for (let i = 0; i < emailList.length; i++) {
          const subject = emailList[i].textContent.trim();
          if (
            usernameEmailIndex === -1 &&
            subject.includes(
              'Neuer Benutzer e-Gehaltszettel Portal – Benutzername',
            )
          ) {
            usernameEmailIndex = i;
          } else if (
            passwordEmailIndex === -1 &&
            subject.includes('Neuer Benutzer e-Gehaltszettel Portal – Passwort')
          ) {
            passwordEmailIndex = i;
          }

          if (usernameEmailIndex !== -1 && passwordEmailIndex !== -1) {
            break;
          }
        }

        if (usernameEmailIndex !== -1) {
          cy.iframe('#ifinbox')
            .find('.mctn > .m > button > .lms')
            .eq(usernameEmailIndex)
            .click()
            .wait(1500);

          cy.iframe('#ifmail')
            .find(
              '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span',
            )
            .invoke('text')
            .then((innerText) => {
              const startIndex =
                innerText.indexOf('Hier ist Ihr Benutzername:') +
                'Hier ist Ihr Benutzername:'.length;
              const usernameFromEmailBody = innerText
                .substring(startIndex)
                .trim();

              cy.wrap(usernameFromEmailBody).as('capturedUsername');
              Cypress.env('usernameFromEmailBody', usernameFromEmailBody);

              expect(usernameFromEmailBody).to.equal(adminUser.username);
              cy.log('Username:', usernameFromEmailBody);
            });
        }

        if (passwordEmailIndex !== -1) {
          cy.iframe('#ifinbox')
            .find('.mctn > .m > button > .lms')
            .eq(passwordEmailIndex)
            .click()
            .wait(1500);

          cy.iframe('#ifmail')
            .find(
              '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span',
            )
            .invoke('text')
            .then((innerText) => {
              const startIndex =
                innerText.indexOf('hier ist Ihr Passwort:') +
                'hier ist Ihr Passwort:'.length;
              const passwordFromEmailBody = innerText
                .substring(startIndex)
                .trim();

              cy.wrap(passwordFromEmailBody).as('capturedPassword');
              Cypress.env('passwordFromEmailBody', passwordFromEmailBody);

              cy.log('Password:', passwordFromEmailBody);
            });
        }
      });

    // Login and validate behavior
    cy.wait(2500);
    cy.intercept('GET', '**/supportView/v1/generalInfo**').as('visitURL');
    cy.visit(Cypress.env('baseUrl'), { failOnStatusCode: false });

    cy.wait(['@visitURL'], { timeout: 27000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.url().should('include', '/login');

    cy.get('@capturedUsername').then((username) => {
      cy.get('@capturedPassword').then((password) => {
        cy.get('input[formcontrolname="username"]').type(username);
        cy.get('input[formcontrolname="password"]').type(password);
        cy.wait(1500);
        cy.get('button[type="submit"]').click();

        cy.wait(2500);
        cy.visit(Cypress.env('dashboardURL'), {
          failOnStatusCode: false,
        });
        cy.wait(5500);

        cy.get('body').then(($body) => {
          if ($body.find('.release-note-dialog__close-icon').length > 0) {
            cy.get('.release-note-dialog__close-icon').click();
          }
        });

        const buttonLabelsCompaniesPage = [
          { en: 'Upload Document', de: 'Personalisierte Dokumente hochladen' },
          { en: 'Mass Upload', de: 'Massensendung hochladen' },
          { en: 'User', de: 'Benutzer' },
        ];
        cy.get('button > .mdc-button__label').each(($button) => {
          cy.wrap($button)
            .invoke('text')
            .then((text) => {
              const trimmedText = text.trim();
              const isValid = buttonLabelsCompaniesPage.some(
                (label) => label.en === trimmedText || label.de === trimmedText,
              );
              expect(isValid, `Unexpected button label: "${trimmedText}"`).to.be
                .true;
            });
        });

        cy.get('button > .mdc-button__label')
          .filter((index, el) => {
            const text = Cypress.$(el).text().trim();
            return text === 'User' || text === 'Benutzer';
          })
          .click();
        cy.wait(1500);

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
                (label) => label.en === trimmedText || label.de === trimmedText,
              );
              expect(isValid, `Unexpected button label: "${trimmedText}"`).to.be
                .true;
            });
        });

        cy.get('.menu-trigger>.mat-mdc-menu-trigger>.user-display-name').click({
          force: true,
        });
        cy.wait(2000);
        cy.get('.password-bttn').click({ force: true });
        cy.wait(1500);

        cy.get('@capturedPassword').then((password) => {
          cy.get('input[formcontrolname="oldPassword"]').type(password);
          cy.get('button>mat-icon[data-mat-icon-name="password_invisible"]')
            .eq(0)
            .click({ force: true });
          cy.wait(1000);
          cy.get('input[formcontrolname="newPassword"]').type(
            Cypress.env('password_supportViewAdmin'),
          );
          cy.get('button>mat-icon[data-mat-icon-name="password_invisible"]')
            .eq(0)
            .click({ force: true });
          cy.wait(1000);
          cy.get('input[formcontrolname="confirmedNewPassword"]').type(
            Cypress.env('password_supportViewAdmin'),
          );
          cy.get('button>mat-icon[data-mat-icon-name="password_invisible"]')
            .eq(0)
            .click({ force: true });
          cy.wait(1000);
        });

        cy.get('.button-container>button[type="submit"]').click({
          force: true,
        });

        cy.get('.logout-icon ').click();
        cy.wait(2000);
        cy.get('.confirm-buttons > :nth-child(2)').click();
        cy.log('Test completed successfully.');
      });
    });
  });

  //Delete already created Admin user
  it('Master user delete Admin user', () => {
    const companyName = Cypress.env('company');
    const adminUser = Cypress.env('createAdminUser')[0];

    // Login as Master User using a custom command
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
          /User deleted succesfully|Benutzer erfolgreich gelöscht/,
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

  // Clear Yopmail inbox of the Admin user created during the test execution
  it('Yopmail - Clear inbox', () => {
    const adminUser = Cypress.env('createAdminUser')[0];

    // Visit Yopmail
    cy.visit('https://yopmail.com/en/');

    // Enter email and refresh
    cy.get('#login')
      .type(adminUser.email)
      .should('have.value', adminUser.email);
    cy.get('#refreshbut').click();

    // Wait for inbox to load
    cy.wait(2000);

    // Access the inbox iframe
    cy.get('iframe#ifinbox').then(($iframe) => {
      const $body = $iframe.contents().find('body');

      // Wrap iframe body for Cypress commands
      cy.wrap($body).then(($inbox) => {
        if ($inbox.find('.mctn .lm').length === 0) {
          // No emails → skip delete
          cy.log(`Inbox for ${adminUser.email} is empty. Skipping delete.`);
        } else {
          // Emails exist → check delete button in main page
          cy.get('#delall').then(($btn) => {
            if (!$btn.is(':disabled')) {
              cy.wrap($btn).click({ force: true });
              cy.log(`All emails deleted for ${adminUser.email}`);
            } else {
              cy.log(`Delete button disabled for ${adminUser.email}`);
            }
          });
        }
      });
    });

    cy.wait(1500); // Stabilize after deletion
  });
}); //end describe
