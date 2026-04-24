///<reference types="cypress" />

describe('Create e-Box user manually', () => {
  // Precondition: Search for the user and if user exists, proceed with deletion
  it('Search for the user and if user(s) exists, proceed with deletion', () => {
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

    //Search for Group by Display Name
    cy.get('#searchButton>span').click(); //Click on search button
    // Use the company name from the cypress.config.js
    const companyName = Cypress.env('company');
    // Search for Group by Display Name using the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(0)
      .type(companyName);
    //Find the Search button by button name and click on it
    cy.get('.search-dialog>form>div>.mat-primary').click();
    //Switch to user section
    cy.get('.action-buttons > .mdc-button').eq(4).click();

    // Array of users to delete
    const usersToDelete = ['manualAddress', 'manualNoAddress'];

    usersToDelete.forEach((userName) => {
      const searchAndDeleteUser = (userName) => {
        cy.get('.search-label').click();

        ///person/fromGroup/

        cy.intercept('POST', '**/person/fromGroup/**').as('personFromGroup');
        cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
          .clear()
          .type(userName);
        cy.get('button[type="submit"]').click();
        cy.wait('@personFromGroup', { timeout: 10000 }).then((interception) => {
          expect(interception.response.statusCode).to.eq(200);
          cy.log('Search completed');
        });

        // Wait for the search results
        cy.wait(2000);

        // Check if "No results" message exists (indicating user does not exist)
        cy.get('body').then(($body) => {
          if ($body.find('.cdk-row').length === 0) {
            cy.log(`User ${userName} not found or already deleted.`);
            cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click();
          } else {
            // If user exists, proceed with deletion
            cy.get('cdk-row').should('exist');
            cy.log(`User ${userName} found. Proceeding with deletion.`);

            cy.get('button')
              .contains(/Delete|DSGVO-Löschung/)
              .should('be.visible')
              .click();

            // Wait for confirmation dialog and confirm deletion
            cy.get('.confirm-buttons > button')
              .contains(/YES|JA/)
              .should('be.visible')
              .click();

            cy.log(`User ${userName} has been deleted.`);

            // Reset the search to clear out the search pill
            cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click();
          }
        });
      };
      cy.wait(1500);
      searchAndDeleteUser(userName);

      // Optional wait between deletions (if needed)
      cy.wait(1000);
    });

    //Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url
    cy.wait(3000);
  }); //end it

  //Create New E-box User manually
  it('DH - Create New E-box User manually', () => {
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

    // Click on Admin User button (from sidebar navigation menu)
    cy.intercept('GET', '**/person/fromGroup/**').as('getEmployees');
    cy.get('#nav-employees')
      .should('be.visible')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      .wait(1500)
      .click();

    cy.wait('@getEmployees', { timeout: 35000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.wait(1500);

    //Select Company from dropdown
    const companyName = Cypress.env('company').toLowerCase();

    // Open the dropdown
    cy.get('#employee-select-company').click({ force: true });
    cy.wait(1000);

    // Find and click the matching option (ignore case, use contains for partial match)
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

    //Scroll to top to ensure "Create new Admin" button is visible
    cy.scrollTo('top', { duration: 500 });

    cy.wait(500);

    // Click "Create new person"
    cy.get('#employee-add-employee')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
      .wait(1000)
      .contains(/Neuen Kontakt anlegen|Create New Contact/i) // DE + EN
      .click();

    cy.wait(500);

    // Validate Title of Create User dialog
    cy.get('h2')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Neuen Kontakt anlegen|Create New Contact/,
        );
      });

    cy.wait(500);

    //Validate labels on form 1
    // cy.get('form>div:nth-of-type(2)')

    // Get user test data from cypress.config.js
    const user = Cypress.env('createUser')[0];

    //fill input fields 1st step
    cy.get('#create-user-prefixed-title').type(user.prefixedTitle);
    cy.get('#create-user-firstName').type(user.firstName);

    //Enter Last Name
    cy.get('#create-user-lastName').focus().blur();
    // Validate error message for empty required field
    cy.get('div[role="alert"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Required field|Pflichtfeld/i);
      });
    cy.wait(1000);
    cy.get('#create-user-lastName').type(user.lastName);
    cy.get('#create-user-suffixed-title').type(user.prefixedTitle2);

    //Select Company prefix
    cy.get('input[aria-autocomplete="list"]').focus().blur();
    // Validate error message for empty required field
    cy.get('div[role="alert"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Required field|Pflichtfeld/i);
      });
    cy.wait(1000);

    cy.get('input[aria-autocomplete="list"]').click({ force: true });
    cy.wait(1000);
    //cy.get("ul[role='listbox'] > li:nth-of-type(1)").click({ force: true });
    cy.get("ul[role='listbox'] > li")
      .should('be.visible')
      .each(($el) => {
        const text = $el.text().trim().toLowerCase();
        cy.log('***************************', text);

        if (text === 'aqua - aqua' || text === 'aqua - Aqua') {
          cy.wrap($el).click({ force: true });
        }
      });

    //Enter Account Number
    cy.get('#create-user-accountNumber').focus().blur();
    // Validate error message for empty required field
    cy.get('div[role="alert"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Required field|Pflichtfeld/i);
      });
    cy.wait(1000);

    cy.get('#create-user-accountNumber').type(user.username);
    cy.wait(1000);

    // Switching to 2nd step
    // cy.get('#create-user-next > div:nth-of-type(1)').should(
    //   'match',
    //   /Weiter|Next/i,
    // );

    cy.get('#create-user-next').click({ force: true });

    // Switch to 2nd step

    // Create User wizzard Step:2

    //Telephone number
    cy.get('#create-user-mobileNumber').type('invalid_phone_number').blur();
    // Validate error message for invalid phone number format
    cy.get('div[role="alert"]')
      .should('be.visible')
      .should(($el) => {
        const text = $el.text().trim();
        expect(text).to.match(
          /Invalid value\. Please enter the phone number including the country code \(e\.g\., \+43(?:\.\.\.|…), \+49(?:\.\.\.|…)\)|Ungültiger Wert\. Bitte geben Sie die Telefonnummer einschließlich der Landesvorwahl ein \(z\. B\. \+43(?:\.\.\.|…), \+49(?:\.\.\.|…)\)/i,
        );
      });
    cy.wait(1000);
    //Enter valid phone number
    cy.get('#create-user-mobileNumber').clear().type('+43 1234567890');

    //Email
    cy.get('#create-user-email').type('invalid-email-format').blur();
    // Validate error message for empty required field
    cy.get('div[role="alert"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Invalid email format|Das E-Mail-Format ist ungültig/i,
        );
      });
    cy.wait(1000);

    cy.get('#create-user-email').clear().type(user.email);

    //Address data
    cy.get('#create-user-street').type(user.streetName);
    cy.get('#create-user-streetNumber').type(user.streetNumber);
    cy.get('#create-user-apartment').type(user.doorNumber);
    cy.get('#create-user-zipCode').type(user.zipCode);
    cy.get('#create-user-city').type(user.city);

    cy.wait(2000);

    // Switch to 3th (final) step
    cy.get('#create-user-next').click({ force: true });

    // Create User wizzard Step:3
    cy.wait(1500);

    //select first dropdown (Versandart) - check if enabled
    cy.get('#create-user-deliveryType').then(($dropdown) => {
      const isDisabled =
        $dropdown.attr('aria-disabled') === 'true' ||
        $dropdown.hasClass('Mui-disabled') ||
        $dropdown.find('.Mui-disabled').length > 0;

      if (isDisabled) {
        cy.log('First dropdown is disabled, skipping selection');
      } else {
        cy.wrap($dropdown).click({ force: true });
        cy.wait(500);

        //Select Digital option from dropdown
        cy.get("ul[role='listbox'] > li > span")
          .should('be.visible')
          .contains(/^digital$/i)
          .click({ force: true });

        cy.wait(500);
      }
    });

    //Select second dropdown (Zustellart) - check if enabled
    cy.get('#create-user-sendCredentials').then(($dropdown) => {
      const isDisabled =
        $dropdown.attr('aria-disabled') === 'true' ||
        $dropdown.hasClass('Mui-disabled') ||
        $dropdown.find('.Mui-disabled').length > 0;

      if (isDisabled) {
        cy.log('Second dropdown is disabled, skipping selection');
      } else {
        cy.wrap($dropdown).click({ force: true });
        cy.wait(500);

        //Select Digital option from dropdown
        cy.get("ul[role='listbox'] > li > span")
          .should('be.visible')
          .contains(/^digital$/i)
          .click({ force: true });

        cy.wait(500);
      }
    });

    cy.intercept('POST', '**/editPerson').as('editPerson');
    //Finish Create New User approach
    cy.get('#create-user-create>div:nth-of-type(1)')
      .contains(/Create|Erstellen/i)
      .click({ force: true });

    // Wait & Assert response
    cy.wait('@editPerson', { timeout: 35000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(201);
      cy.log('User is successfully created');
    });
    cy.wait(1000);

    //Download Credentials

    //Check Title
    cy.get('#dialog-title')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /New User Access Data|New User Access Data/,
        );
      });

    //Check supbtitle (text)
    cy.get('div[role="dialog"]>div:nth-of-type(2)>div>div>div')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).be.match(
          /Download user data.|Benutzersdaten herunterladen./,
        );
      });

    //Download PDF with Credentials
    cy.get('#download-user-account-pdf').click();
    cy.wait(1000);

    // Get the latest downloaded PDF file
    const downloadsDir = `${Cypress.config(
      'fileServerFolder',
    )}/cypress/downloads/`;
    cy.task('getDownloadedPdf', downloadsDir).then((filePath) => {
      expect(filePath).to.not.be.null; // Assert the file exists
      cy.log(`Latest PDF File Path: ${filePath}`);
      cy.wait(3000);
      // Read the PDF content and open in the same tab using a Blob
      cy.readFile(filePath, 'binary').then((pdfBinary) => {
        const pdfBlob = Cypress.Blob.binaryStringToBlob(
          pdfBinary,
          'application/pdf',
        );
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Open the PDF in the same tab
        cy.window().then((win) => {
          win.location.href = pdfUrl; // Loads the PDF in the same window
        });
      });
    });
    cy.wait(3500);

    // Close download Credentials dialog
    // cy.get('div[role="dialog"]>div:nth-of-type(3)>button>div:nth-of-type(1)')
    //   .should('have.length.at.least', 1)
    //   .each(($btn) => {
    //     const text = $btn.text().trim();

    //     // match DE or EN translation
    //     if (text === 'Schließen' || text === 'Schließen') {
    //       cy.wrap($btn).click({ force: true });
    //     }
    //   });

    // cy.wait(1500);

    // //Search for user by username
    // cy.get('input[placeholder="Benutzername"]').type(user.username);
  });

  //Yopmail - Confirm email and Change password
  it('Yopmail - Confirm email and Change password', () => {
    // Visit yopmail application
    cy.visit('https://yopmail.com/en/');

    // Access the first Admin User object from cypress.config.js
    const user = Cypress.env('createUser')[0];
    cy.get('#login').type(user.email);
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    cy.wait(1500);
    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .eq(0)
      .should('include.text', 'Ihr neuer Benutzer im DocuHub Portal'); //Validate subject of Verification email

    cy.iframe('#ifmail')
      .find(
        '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span',
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
        cy.wait(1500);
        let initialUrl;
        cy.iframe('#ifmail')
          .find(
            '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span>a',
          )
          .should('include.text', 'Jetzt E-Mail Adresse bestätigen')
          .invoke('attr', 'href')
          .then((href) => {
            // Log link text
            cy.log(`The href attribute is: ${href}`);
          });

        cy.iframe('#ifmail')
          .find(
            '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span>a',
          )
          .invoke('attr', 'target', '_self') //prevent opening in new tab
          .click();
        //Wait for Cookie bar
        cy.wait(15000);

        // // //Remove Cooki dialog (if shown)
        // if (cy.iframe('#ifmail').find('#onetrust-accept-btn-handler')) {
        //   cy.iframe('#ifmail').find('#onetrust-accept-btn-handler').click();
        // } else {
        //   cy.log('Cookie dialog is not shown');
        // }

        // Remove Cookie dialog (if shown)
        cy.iframe('#ifmail').then(($iframe) => {
          if ($iframe.find('#onetrust-policy-title').is(':visible')) {
            cy.wrap($iframe)
              .find('#onetrust-accept-btn-handler')
              .click({ force: true });
            cy.log('Cookie dialog closed.');
          } else {
            cy.log('Cookie dialog not visible.');
          }
        });
        cy.wait(1500);

        // Remove Cookie dialog (if shown)
        // cy.iframe('#ifmail')
        //   .find('#onetrust-accept-btn-handler', { timeout: 3000 })
        //   .then(($btn) => {
        //     if ($btn.length > 0 && $btn.is(':visible')) {
        //       cy.wrap($btn).click();
        //       cy.log('Cookie dialog was shown and clicked.');
        //     } else {
        //       cy.log('Cookie dialog is not shown.');
        //     }
        //   });

        // cy.iframe('#ifmail')
        //   .find('#onetrust-accept-btn-handler')
        //   .then(($btn) => {
        //     if ($btn.length) {
        //       cy.wrap($btn).click();
        //     } else {
        //       cy.log('Cookie dialog is not shown');
        //     }
        //   });

        // cy.iframe('#ifmail').find('#onetrust-accept-btn-handler').click();

        cy.wait(8000);
        cy.iframe('#ifmail').find('.button').click();
        //Reload inbox

        cy.get('#refresh').click({ force: true }); //Click on Refresh inbox icon
        cy.wait(5000);
        //Reset Password email

        cy.iframe('#ifinbox')
          .find('.mctn > .m > button > .lms')
          .eq(0)

          .should('include.text', 'Passwort zurücksetzen DocuHub Portal'); //Validate subject of Verification email
        let initialUrl_pass;
        cy.iframe('#ifmail')
          .find(
            '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a',
          )
          .should('include.text', 'Neues Passwort erstellen ')
          .invoke('attr', 'href')
          .then((href) => {
            // Log link text
            cy.log(`The href attribute is: ${href}`);
          });
        cy.iframe('#ifmail')
          .find(
            '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a',
          )
          .invoke('attr', 'target', '_self') //prevent opening in new tab
          .click();
        cy.wait(2500);

        //Fill the Set password form
        cy.iframe('#ifmail')
          .find('.input__field-input')
          .eq(0)
          .click()

          .type(Cypress.env('password_egEbox')); //fill the 1st input field
        cy.iframe('#ifmail').find('.input-eye-icon').eq(0).click(); //Click on Show password icon

        cy.iframe('#ifmail')
          .find('.input__field-input')
          .eq(1)

          .type(Cypress.env('password_egEbox')); //fill the 2nd input field
        cy.iframe('#ifmail').find('.input-eye-icon').eq(1).click(); //Click on Show password icon
        cy.iframe('#ifmail').find('.button').click(); //Click on confirm button

        cy.wait(2000);
      });
  });

  //Login to ebox 1st time
  it('Login to e-Box 1st time', () => {
    cy.visit(Cypress.env('baseUrl_egEbox'));
    cy.wait(5000);

    // Wait for the cookie bar to appear
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
    cy.wait(1500);
    // Create the first user (with address)

    // Access the first Admin User object from cypress.config.js
    const user = Cypress.env('createUser')[0];
    // Continue with Login
    cy.log(Cypress.env('companyPrefix'));
    cy.get(':nth-child(1) > .ng-invalid > .input > .input__field-input').type(
      Cypress.env('companyPrefix') + user.username,
    );

    //Cypress.env('manualAddress')
    cy.get('.ng-invalid > .input > .input__field-input').type(
      Cypress.env('password_egEbox'),
    );

    // cy.wait(6000);

    // cy.wait(10000);
    // cy.visit(Cypress.env('eboxDeliveryPage'), {
    //   failOnStatusCode: false,
    // });
    cy.wait(5500);

    cy.intercept('POST', '**/rest/v2/deliveries**').as('openDeliveriesPage');
    cy.wait(1000);
    cy.get('button[type="submit"]').click(); //Login to E-Box
    cy.wait(['@openDeliveriesPage'], { timeout: 37000 }).then(
      (interception) => {
        // Log the intercepted response
        cy.log('Intercepted response:', interception.response);

        // Assert the response status code
        expect(interception.response.statusCode).to.eq(200);
        cy.wait(2500);
      },
    );
    cy.wait(7000);
    // Logout
    cy.get('.user-title').click();
    cy.wait(1500);
    cy.get('.logout-title > a').click();
    //cy.url().should('include', payslipJson.baseUrl_egEbox); // Validate url
    cy.url().should('include', Cypress.env('baseUrl_egEbox')); // Validate url
    cy.log('Test completed successfully.');
  }); //end it

  //Try to Create New User when User already exist
  it('DH - Try to Create New User when accountNumber already exist', () => {
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

    // Click on Admin User button (from sidebar navigation menu)
    cy.intercept('GET', '**/person/fromGroup/**').as('getEmployees');
    cy.get('#nav-employees')
      .should('be.visible')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      .wait(1500)
      .click();

    cy.wait('@getEmployees', { timeout: 35000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.wait(1500);

    //Select Company from dropdown
    const companyName = Cypress.env('company').toLowerCase();

    // Open the dropdown
    cy.get('#employee-select-company').click({ force: true });
    cy.wait(1000);

    // Find and click the matching option (ignore case, use contains for partial match)
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

    //Scroll to top to ensure "Create new Admin" button is visible
    cy.scrollTo('top', { duration: 500 });

    cy.wait(500);

    // Click "Create new person"
    cy.get('#employee-add-employee')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
      .wait(1000)
      .contains(/Neuen Kontakt anlegen|Create New Contact/i) // DE + EN
      .click();

    cy.wait(500);

    // Validate Title of Create User dialog
    cy.get('h2')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Neuen Kontakt anlegen|Create New Contact/,
        );
      });

    cy.wait(500);

    //Validate labels on form 1
    // cy.get('form>div:nth-of-type(2)')

    // Get user test data from cypress.config.js
    const user = Cypress.env('createUser')[0];

    //fill input fields 1st step
    cy.get('#create-user-prefixed-title').type(user.prefixedTitle);
    cy.get('#create-user-firstName').type(user.firstName);
    cy.get('#create-user-lastName').type(user.lastName);
    cy.get('#create-user-suffixed-title').type(user.prefixedTitle2);

    //select Company prefix
    cy.get('input[aria-autocomplete="list"]').click({ force: true });
    cy.wait(1000);
    //cy.get("ul[role='listbox'] > li:nth-of-type(1)").click({ force: true });
    cy.get("ul[role='listbox'] > li")
      .should('be.visible')
      .each(($el) => {
        const text = $el.text().trim().toLowerCase();
        cy.log('***************************', text);

        if (text === 'aqua - aqua' || text === 'aqua - Aqua') {
          cy.wrap($el).click({ force: true });
        }
      });

    cy.get('#create-user-accountNumber').type(user.username);
    cy.wait(1000);

    // Try Switching to 2nd step
    cy.get('#create-user-next')
      .contains(/weiter|Next/i)
      .click({ force: true });
    cy.wait(1000);

    //Validate Error message
    cy.get('div[role="alert"]>div')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Invalid person account number|Benutzer konnte nicht erstellt werden/,
        );
      });

    cy.wait(3500);
  });

  //Delete Alredy created Users by Master User
  it('Login As Master User - Delete Alredy created Users', () => {
    // Login as Master User using a custom command
    const user = Cypress.env('createUser')[0];
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

    //Search for Group by Display Name
    cy.get('#searchButton>span').click(); //Click on search button
    // Use the company name from the cypress.config.js
    const companyName = Cypress.env('company');
    // Search for Group by Display Name using the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(1)
      .type(companyName);
    //Find the Search button by button name and click on it
    cy.get('.search-dialog>form>div>.mat-primary').click();
    //Switch to user section
    cy.get('.action-buttons > .mdc-button').eq(4).click();

    // Array of users to delete
    const usersToDelete = [user.username]; // Add more usernames as needed

    // usersToDelete.forEach((userName, index) => {
    //   // Function to search for and delete a user
    //   const searchAndDeleteUser = (userName) => {
    //     // Search for the user
    //     cy.get('.search-label').click();

    //     // Type the username as a search criterion
    //     cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
    //       .clear() // Clear any previous input
    //       .type(userName);

    //     // Click on the submit button to search
    //     cy.get('button[type="submit"]').click();

    //     // Wait for search results to load (adjust as needed for dynamic loading)
    //     cy.get('body').then(($body) => {
    //       if ($body.find('.no-results-message').length > 0) {
    //         // If the user doesn't exist or is already deleted
    //         cy.log(`User ${userName} not found or already deleted.`);

    //         // Reset the search by clicking on the reset button
    //         cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click();

    //         // Proceed with the next search criteria
    //         if (index < usersToDelete.length - 1) {
    //           cy.log(
    //             `Proceeding with the next user: ${usersToDelete[index + 1]}`
    //           );
    //         }
    //       } else {
    //         // If the user is found, proceed with the deletion
    //         cy.log(`User ${userName} found. Proceeding with deletion.`);

    //         // Click the delete button (adjust the selector as per your app)
    //         cy.get('button')
    //           .contains(/Delete|DSGVO-Löschung/)
    //           .click();
    //         cy.wait(2000);
    //         // Confirm delete in the confirmation dialog
    //         cy.get('.confirm-buttons > button')
    //           .filter((index, button) => {
    //             return (
    //               Cypress.$(button).text().trim() === 'YES' ||
    //               Cypress.$(button).text().trim() === 'JA'
    //             );
    //           })
    //           .click();
    //         cy.wait(2000);
    //         // Log the deletion
    //         cy.log(`User ${userName} has been deleted.`);

    // Array of users to delete
    //const usersToDelete = ['manualAddress', 'manualNoAddress'];

    usersToDelete.forEach((userName) => {
      const searchAndDeleteUser = (userName) => {
        cy.get('.search-label').click();

        // Search for the user
        cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
          .clear()
          .type(userName);
        cy.get('button[type="submit"]').click();

        // Wait for the search results
        cy.wait(2000);

        // Check if "No results" message exists (indicating user does not exist)
        cy.get('body').then(($body) => {
          if ($body.find('.cdk-row').length === 0) {
            cy.log(`User ${userName} not found or already deleted.`);
            cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click();
          } else {
            // If user exists, proceed with deletion
            cy.get('cdk-row').should('exist');
            cy.log(`User ${userName} found. Proceeding with deletion.`);

            cy.get('button')
              .contains(/Delete|DSGVO-Löschung/)
              .should('be.visible')
              .click();

            // Wait for confirmation dialog and confirm deletion
            cy.get('.confirm-buttons > button')
              .contains(/YES|JA/)
              .should('be.visible')
              .click();

            cy.log(`User ${userName} has been deleted.`);

            // Reset the search to clear out the search pill
            //  cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click();
          }
        });
      };
      cy.wait(1500);
      searchAndDeleteUser(userName);

      // Optional wait between deletions (if needed)
      cy.wait(1000);
    });

    //Search for just deleted Admin user
    cy.get('#searchButton').click({ force: true });
    cy.wait(1500);

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
        //    });

        cy.wait(2500);
        //     }
        //     });
        //    };
        // Call the function to search and delete user
        //  searchAndDeleteUser(userName);

        // Optional wait between deletions (if needed)
        cy.wait(1000);
      });

    //Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url
    cy.wait(1500);
    // Completion message at the end of the test
    cy.log('The tests have been completed successfully.');
    cy.wait(3000);
  }); //end it

  //Yopmail - Clear inbox
  it('Yopmail - Clear inbox', () => {
    const user = Cypress.env('createUser')[0];

    // Visit Yopmail
    cy.visit('https://yopmail.com/en/');
    cy.get('#login', { timeout: 10000 }).should('be.visible').type(user.email);
    cy.get('#refreshbut > .md > .material-icons-outlined')
      .should('be.visible')
      .click();

    // Wait for inbox to load
    cy.wait(2000);

    // Check and click delete all button if it's enabled
    cy.get('.menu>div>#delall', { timeout: 10000 }).then(($btn) => {
      if (!$btn.is(':disabled')) {
        cy.wrap($btn).click({ force: true });
        cy.log('Inbox cleared.');
      } else {
        cy.log('Delete all button is disabled. Inbox may already be empty.');
      }
    });

    // Optional: confirm inbox is empty
    cy.iframe('#ifinbox').find('div.mctn').should('not.contain', '.m'); // no emails should remain
  });
}); //end it
