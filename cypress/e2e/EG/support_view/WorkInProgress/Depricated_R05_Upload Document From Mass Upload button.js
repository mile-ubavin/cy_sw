describe('R05_Upload Document From Mass Upload button', () => {
  var uploadDateTime = ''; // Global variable to store upload date & time

  //Uplad pdf - From Mass Upload Button
  it('*********Upload Document From Mass Upload button', () => {
    cy.fixture('supportView.json').as('payslipSW');
    cy.loginToSupportViewAdmin();
    // Wait for login to complete
    cy.wait(1500);

    //Remove pop up
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(1500);

    //Click On Mass Upload Button
    cy.get('.upload__document>.mdc-button__label>.upload__document__text')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Mass Upload' || text === 'Massensendung hochladen';
      })
      .click();

    cy.wait(3000);
    //Click on Mass upload button
    cy.get('.buttons-wrapper>button')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Upload Document' || text === 'Dokument hochladen';
      })
      .click();
    cy.wait(1500);

    // Upload valid document (1 A4 pdf file)
    cy.massUpload();
    cy.wait(2000);

    // Capture the current date and time in the specified format
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0'); // Ensure two digits
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = now.getFullYear();
    const formattedDate = `${day}.${month}.${year}`; // Ensures dd.mm.yyyy format

    const formattedTime = now
      .toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      .trim(); // ✅ Trim to remove leading spaces

    uploadDateTime = `${formattedDate} ${formattedTime}`; // Store the value in a variable
    cy.log(`Upload DateTime: ${uploadDateTime}`); // Log the stored uploadDateTime

    // Add Delivery Title
    const title = `Document From MassUpload (pdf) - ${uploadDateTime}`;
    cy.log(`Title for the document: ${title}`); // Log the title to check

    cy.get('input[formcontrolname="subject"]').clear().type(title);
    cy.wait(1500);

    // Select Company
    cy.get('.broadcast-companies').click();
    cy.wait(1000);
    cy.get('mat-option[role="option"]>.mdc-list-item__primary-text').click({
      multiple: true,
    });
    cy.wait(1500);

    const toCompanies = ['AQUA GmbH - AQUA'];
    cy.get('mat-option[role="option"]>.mdc-list-item__primary-text')
      .should('exist') // Ensure checkbox labels exist
      .each(($label) => {
        const text = $label.text().trim();
        if (toCompanies.includes(text)) {
          // Target the specific checkbox
          cy.wrap($label)
            .parent()
            .find('.mdc-list-item__primary-text') // Locate the checkbox input
            .then(($checkboxInput) => {
              if (!$checkboxInput.is(':checked')) {
                // Enable the role if not already checked
                cy.wrap($checkboxInput).click({ force: true });
                cy.log(`Checkbox for "${text}" was not enabled; now enabled.`);
              } else {
                // Role is already enabled
                cy.log(`Checkbox for "${text}" is already enabled.`);
              }
            });
        }
      });

    // Wait for the deselection process to complete
    cy.wait(1000);
    // Focus out
    cy.get('body').type('{esc}');
    cy.wait(1500);

    // Click on Mass Upload button
    cy.get('.controls > .ng-star-inserted').click({ force: true });
    cy.wait(4500);

    cy.get('.dialog-actions>button>.title')
      .contains(/Send|Senden /i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    //Confirm dialog for sending delivery to all users from selected company
    cy.get('.title')
      .contains(/Confirm|Bestätigen/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    // Verify the success message
    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible') // Ensure it's visible first
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /We are processing in the background|Wir verarbeiten im Hintergrund/
        );
      });
    cy.wait(2500);

    // Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url'
    cy.log('Test completed successfully.');
    cy.wait(2500);
  }); //end it

  it.only('**********Count active users', () => {
    cy.loginToSupportViewAdmin();
    // Wait for login to complete
    cy.wait(1500);

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
      .eq(1)
      .type(Cypress.env('company')); // Use the company name from the cypress.config.js
    cy.wait(1500);
    //Find the Search button by button name and click on it
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    // Click the search button and select the user
    cy.get('.action-buttons>button>.mdc-button__label') // Find the button containing "Admin User" or "Admin Benutzer" button
      .contains(/User|Benutzer/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    // Variables to store counts and inactive user account numbers
    let activeUsersCount = 0;
    let sendToPrintUsersCount = 0;
    let inactiveUsers = [];

    // Count Active Users & Get Inactive Users' Account Numbers
    cy.get('.cdk-column-active>.cell-content-wrap>div>div>div')
      .each(($el, index) => {
        const isActive = $el.text().trim() === 'Yes';

        if (isActive) {
          activeUsersCount++;
        } else {
          // Get AccountNumber of inactive user
          cy.get('.cdk-column-accountNumbers>.cell-content-wrap>div>div')
            .eq(index)
            .invoke('text')
            .then((accountNumber) => {
              inactiveUsers.push(accountNumber.trim());
            });
        }
      })
      .then(() => {
        Cypress.env('activeUsers', activeUsersCount);
        Cypress.env('inactiveUsers', inactiveUsers);
        cy.log(`Active Users Count: ${activeUsersCount}`);
        cy.log(`Inactive Users: ${JSON.stringify(inactiveUsers)}`);
      });

    // Count SendToPrint Users (Ignoring 'Yes' for SendToPrintChannel)
    cy.get('.cdk-column-sendToPrint>.cell-content-wrap>div>div>div')
      .each(($el) => {
        if ($el.text().trim() === 'Yes') {
          sendToPrintUsersCount++;
        }
      })
      .then(() => {
        Cypress.env('sendToPrintUsers', sendToPrintUsersCount);
        cy.log(`SendToPrint Users Count: ${sendToPrintUsersCount}`);

        // Calculate sendToElChannel but exclude users where sendToPrint is 'Yes'
        const sendToElChannel = Math.max(
          activeUsersCount - sendToPrintUsersCount,
          0
        );
        cy.log(
          `SendToElChannel (excluding SendToPrint=YES): ${sendToElChannel}`
        );
        cy.wait(2000);

        // Visit Yopmail
        cy.visit('https://yopmail.com/en/');

        // Enter the support admin email
        cy.get('#login').type(Cypress.env('email_supportViewAdmin'));

        // Click the refresh button
        cy.get('#refreshbut > .md > .material-icons-outlined').click();

        // Wait for email to load
        cy.wait(4500);

        // Define email subject function
        function emailSubject(index) {
          cy.iframe('#ifinbox')
            .find('.mctn > .m > button > .lms')
            .eq(index)
            .should('include.text', 'Versandreport e-Gehaltszettel Portal');
        }

        // Define email body function
        function emailBody() {
          cy.iframe('#ifmail')
            .find('#mail > div')
            .invoke('text')
            .then((text) => {
              text = text.trim();

              const successMessage = `Sie haben ${sendToElChannel} Sendung(en) erfolgreich digital in das e-Gehaltszettel Portal Ihrer Benutzer*innen eingeliefert`;
              const postalMessage = `Zusätzlich haben Sie ${sendToPrintUsersCount} Sendung(en) erfolgreich über den postalischen Weg als Brief versendet. Das Dokument wird von uns über das „Einfach Brief“-Portal gedruckt, kuvertiert und an die Adresse des Benutzers versendet`;

              // Prepare inactive users message if any exist
              let inactiveUsersMessage = '';
              if (Cypress.env('inactiveUsers').length > 0) {
                const inactiveUsersList =
                  Cypress.env('inactiveUsers').join(', ');
                inactiveUsersMessage = `Folgende Personalnummern sind davon betroffen:\nSystem Biller Id: ${Cypress.env(
                  'company'
                )}, Personalnummern: ${inactiveUsersList}`;
              }

              // Assert email contains either success message, postal message, or inactive users info
              expect(
                text.includes(successMessage) ||
                  text.includes(postalMessage) ||
                  text.includes(inactiveUsersMessage)
              ).to.be.true;

              // Log to console for debugging
              cy.log(`Email Content: ${text}`);
              if (inactiveUsersMessage) {
                cy.log(`Inactive Users Info Added: ${inactiveUsersMessage}`);
              }
            });
        }

        // Validate email subject and body
        emailSubject(0);
        emailBody();
      });
  });

  it('Uses stored values in another test', () => {
    // Retrieve stored values
    const activeUsers = Cypress.env('activeUsers');
    const sendToPrintUsers = Cypress.env('sendToPrintUsers');

    // // Ensure values are numbers and not undefined
    expect(activeUsers).to.be.a('number');
    expect(sendToPrintUsers).to.be.a('number');

    const sendToElChannel = Math.max(activeUsers - sendToPrintUsers, 0); // Ensures non-negative value

    expect(sendToElChannel).to.be.a('number');

    cy.log(`Active Users (it2): ${activeUsers}`);
    cy.log(`SendToPrint Users (it2): ${sendToPrintUsers}`);
    cy.log(`SendToElChannel Users (it2): ${sendToElChannel}`);
    cy.pause();

    cy.visit('https://yopmail.com/en/'),
      //   // Enter the support admin email
      //   cy.get('#login').type(Cypress.env('email_supportViewAdmin'));

      // // Click the refresh button
      // cy.get('#refreshbut > .md > .material-icons-outlined').click();

      // // Function to validate email subject
      // function emailSubject(index) {
      //   cy.iframe('#ifinbox')
      //     .find('.mctn > .m > button > .lms')
      //     .should('have.length.greaterThan', index) // Ensure email exists
      //     .eq(index)
      //     .should('include.text', 'Versandreport e-Gehaltszettel Portal');
      // }

      // // Function to validate email body
      // function emailBody() {
      //   cy.iframe('#ifmail')
      //     .its('0.contentDocument.body')
      //     .should('not.be.empty') // Ensure email body exists
      //     .then(($body) => {
      //       const text = Cypress.$($body).text().trim();
      //       cy.log(`Email Body: ${text}`); // Debugging log

      //       expect(
      //         text.includes(
      //           `${sendToElChannel} Sendung(en) die Sie postalisch als Brief verschicken wollten, konnte(n) nicht ordnungsgemäß zugestellt werden, bitte überprüfen Sie die Daten der Mitarbeiter*innen, oder wenden Sie sich an unseren Kundenservice e-gehaltszettel@post.at`
      //         ) ||
      //           text.includes(
      //             `Zusätzlich haben Sie ${sendToPrintUsers} Sendung(en) erfolgreich über den postalischen Weg als Brief versendet. Das Dokument wird von uns über das „Einfach Brief“-Portal gedruckt, kuvertiert und an die Adresse des Benutzers versendet`
      //           )
      //       ).to.be.true;
      //     });
      // }

      // // Access the inbox iframe and validate email subject & body
      // emailSubject(0);
      // emailBody();

      // Wait to ensure the email content is fully loaded
      cy.wait(4500);
  });

  it('**********Uses stored values in another test', () => {
    // Visit Yopmail
    cy.visit('https://yopmail.com/en/');

    // Enter the support admin email
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));

    // Click the refresh button
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    //Custom functions:
    // Define email subject function
    function emailSubject(index) {
      cy.iframe('#ifinbox')
        .find('.mctn > .m > button > .lms')
        .eq(index)
        .should('include.text', 'Versandreport e-Gehaltszettel Portal');
    }

    const activeUsers = Cypress.env('activeUsers') || 0;
    const sendToPrintUsers = Cypress.env('sendToPrintUsers') || 0;
    const sendToElChannel = Math.max(activeUsers - sendToPrintUsers, 0); // Ensures non-negative value

    expect(activeUsers).to.be.a('number');
    expect(sendToPrintUsers).to.be.a('number');
    expect(sendToElChannel).to.be.a('number');

    cy.log(`Active Users (it2): ${activeUsers}`);
    cy.log(`SendToPrint Users (it2): ${sendToPrintUsers}`);
    cy.log(`SendToElChannel Users (it2): ${sendToElChannel}`);

    // Define email body function
    function emailBody() {
      cy.iframe('#ifmail')
        .find('#mail > div')
        .then(($div) => {
          const text = $div.text().trim();
          expect(
            text.includes(
              '5 Sendung(en) die Sie postalisch als Brief verschicken wollten, konnte(n) nicht ordnungsgemäß zugestellt werden, bitte überprüfen Sie die Daten der Mitarbeiter*innen, oder wenden Sie sich an unseren Kundenservice e-gehaltszettel@post.at'
            ) ||
              text.includes(
                'Zusätzlich haben Sie 1 Sendung(en) erfolgreich über den postalischen Weg als Brief versendet. Das Dokument wird von uns über das „Einfach Brief“-Portal  gedruckt, kurvertiert und an die Adresse des Benutzers versendet'
              )
          ).to.be.true; // OR condition
        });
    }

    // Access the inbox iframe and validate the email subject
    emailSubject(0); // Validate subject of Reporting email
    emailBody(); // Validate email body

    // Wait to ensure the email content is loaded
    cy.wait(4500);
  });

  //Disable hrManagement flag on Company
  it('Disable hrManagement flag on Company', () => {
    //Import credentials (un/pw) from 'supportView.json' file

    cy.loginToSupportViewMaster();
    cy.wait(1500);

    //Remove pop up dilaog
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(2500);

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

    //Uncheck HR checkbox
    cy.get('#hrManagementEnabled').then(($checkbox) => {
      if ($checkbox.is(':checked')) {
        // If the checkbox is checked, uncheck it
        cy.get('#hrManagementEnabled').uncheck({ force: true });
        cy.log('HR role was enabled, now disabled.');

        // Save Edit Company dialog
        cy.get('button[type="submit"]').click();
      } else {
        // If the checkbox is already disabled
        cy.log('HR role is already disabled.');
        cy.get('.close[data-mat-icon-name="close"]').click();
      }
    });
    //Close Edit Company dialog
    cy.wait(2500);
    //Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    // cy.url().should('include', payslipJson.baseUrl); // Validate url'
    cy.log('Test completed successfully.');
    cy.wait(2500);
  }); //end it

  //Enable View E-Box and DataSubmitter Roles
  it('Enable View E-Box and DataSubmitter Roles for Specific Admin', () => {
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
      .eq(1)
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
      Cypress.env('username_supportViewAdmin')
    );
    // Click on Search for Admin User button
    cy.get('button[type="submit"]').click();
    cy.wait(2000);
    //Click on Role
    cy.get('.mdc-button__label')
      .contains(/Rechte|Rights/i) // Find the button containing "Rechte" or "Rights"
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button

    // Enable View E-Box and DataSubmitter Roles' for specific Admin user
    const rolesToEnable = [
      ['Data Submitter', 'Versand'],
      ['View E-Box', 'E-Box ansehen'],
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
                      `Checkbox for "${text}" was not enabled; now enabled.`
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

  //Uplad pdf - From Mass Upload Button
  it('Upload Document From Mass Upload button', () => {
    cy.fixture('supportView.json').as('payslipSW');
    cy.loginToSupportViewAdmin();
    // Wait for login to complete
    cy.wait(1500);

    //Remove pop up
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(1500);

    //Click On Mass Upload Button
    cy.get('.upload__document>.mdc-button__label>.upload__document__text')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Mass Upload' || text === 'Massensendung hochladen';
      })
      .click();

    cy.wait(3000);
    //Click on Mass upload button
    cy.get('.buttons-wrapper>button')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Upload Document' || text === 'Dokument hochladen';
      })
      .click();
    cy.wait(1500);

    // Upload valid document (1 A4 pdf file)
    cy.massUpload();
    cy.wait(2000);

    // Capture the current date and time in the specified format
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0'); // Ensure two digits
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = now.getFullYear();
    const formattedDate = `${day}.${month}.${year}`; // Ensures dd.mm.yyyy format

    const formattedTime = now
      .toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      .trim(); // ✅ Trim to remove leading spaces

    uploadDateTime = `${formattedDate} ${formattedTime}`; // Store the value in a variable
    cy.log(`Upload DateTime: ${uploadDateTime}`); // Log the stored uploadDateTime

    // Add Delivery Title
    const title = `Document From MassUpload (pdf) - ${uploadDateTime}`;
    cy.log(`Title for the document: ${title}`); // Log the title to check

    cy.get('input[formcontrolname="subject"]').clear().type(title);
    cy.wait(1500);

    // Select Company
    cy.get('.broadcast-companies').click();
    cy.wait(1000);
    cy.get('mat-option[role="option"]>.mdc-list-item__primary-text').click({
      multiple: true,
    });
    cy.wait(1500);

    const toCompanies = ['AQUA GmbH - AQUA'];
    cy.get('mat-option[role="option"]>.mdc-list-item__primary-text')
      .should('exist') // Ensure checkbox labels exist
      .each(($label) => {
        const text = $label.text().trim();
        if (toCompanies.includes(text)) {
          // Target the specific checkbox
          cy.wrap($label)
            .parent()
            .find('.mdc-list-item__primary-text') // Locate the checkbox input
            .then(($checkboxInput) => {
              if (!$checkboxInput.is(':checked')) {
                // Enable the role if not already checked
                cy.wrap($checkboxInput).click({ force: true });
                cy.log(`Checkbox for "${text}" was not enabled; now enabled.`);
              } else {
                // Role is already enabled
                cy.log(`Checkbox for "${text}" is already enabled.`);
              }
            });
        }
      });

    // Wait for the deselection process to complete
    cy.wait(1000);
    // Focus out
    cy.get('body').type('{esc}');
    cy.wait(1500);

    // Click on Mass Upload button
    cy.get('.controls > .ng-star-inserted').click({ force: true });
    cy.wait(4500);

    cy.get('.dialog-actions>button>.title')
      .contains(/Send|Senden /i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    //Confirm dialog for sending delivery to all users from selected company
    cy.get('.title')
      .contains(/Confirm|Bestätigen/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    // Verify the success message
    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible') // Ensure it's visible first
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /We are processing in the background|Wir verarbeiten im Hintergrund/
        );
      });
    cy.wait(2500);

    // Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url'
    cy.log('Test completed successfully.');
    cy.wait(2500);
  }); //end it

  // Login to e-Box and Open Delivery
  it('Ebox user Open delivery', () => {
    cy.loginToEgEbox();
    cy.wait(2500);

    // Open latest created delivery
    cy.intercept(
      'GET',
      '**/hybridsign/backend_t/document/v1/getDocument/**'
    ).as('getDocument');
    cy.intercept('GET', '**/getIdentifications?**').as('getIdentifications');

    cy.get('.mdc-data-table__content>tr>.subject-sender-cell')
      .eq(0)
      .click({ force: true });

    cy.wait(['@getIdentifications'], { timeout: 47000 }).then(
      (interception) => {
        cy.log('Intercepted response:', interception.response);
        expect(interception.response.statusCode).to.eq(200);
      }
    );

    // Scroll to the bottom of the PDF viewer
    cy.get('.content-container>.scroll-container').eq(1).scrollTo('bottom', {
      duration: 500,
      ensureScrollable: false,
    });

    //Validate uploadDateTime
    cy.log(`Upload DateTime to verify: ${uploadDateTime}`); // Log to verify the value is accessible

    // Normalize the stored uploadDateTime
    const normalizedUploadDateTime = uploadDateTime
      .replace(',', ' ')
      .replace(/\s+/g, ' ')
      .trim();

    cy.get('.field-value') // Adjust selector based on the actual document details container
      .invoke('text')
      .then((docText) => {
        // Normalize the extracted document DateTime
        const docDateTime = docText
          .replace(',', ' ')
          .replace(/\s+/g, ' ')
          .trim();
        cy.log(`Extracted DateTime from Document: '${docDateTime}'`);

        // Convert both to Date objects for accurate time comparison
        const parseDateTime = (dateTimeStr) => {
          const [datePart, timePart] = dateTimeStr.split(' ');
          const [day, month, year] = datePart.split('.').map(Number);
          const [hour, minute] = timePart.split(':').map(Number);
          return new Date(year, month - 1, day, hour, minute); // Month is 0-based in JS
        };

        const uploadedTime = parseDateTime(normalizedUploadDateTime);
        const extractedTime = parseDateTime(docDateTime);

        // Allow up to +1 minute difference
        const maxAllowedTime = new Date(uploadedTime);
        maxAllowedTime.setMinutes(uploadedTime.getMinutes() + 1);

        // Validate the extracted time is within range
        expect(extractedTime).to.be.at.least(uploadedTime);
        expect(extractedTime).to.be.at.most(maxAllowedTime);

        cy.log(
          `Validated: Expected ${normalizedUploadDateTime} (or +1 min) <= ${docDateTime} (actual)`
        );
      });

    // Logout
    cy.get('.user-title').click();
    cy.wait(1500);
    cy.get('.logout-title > a').click();
    cy.url().should('include', Cypress.env('baseUrl_egEbox'));
    cy.log('Test completed successfully.');
  });

  //Admin user check Reporting email
  it('Yopmail - Get Reporting email', () => {
    // Visit Yopmail
    cy.visit('https://yopmail.com/en/');

    // Enter the support admin email
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));

    // Click the refresh button
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    //Custom functions:
    // Define email subject function
    function emailSubject(index) {
      cy.iframe('#ifinbox')
        .find('.mctn > .m > button > .lms')
        .eq(index)
        .should('include.text', 'Versandreport e-Gehaltszettel Portal');
    }
    // Define email body function
    function emailBody() {
      cy.iframe('#ifmail')
        .find('#mail > div')
        .then(($div) => {
          const text = $div.text().trim();
          expect(
            text.includes(
              '1 Sendung(en) die Sie postalisch als Brief verschicken wollten, konnte(n) nicht ordnungsgemäß zugestellt werden, bitte überprüfen Sie die Daten der Mitarbeiter*innen, oder wenden Sie sich an unseren Kundenservice e-gehaltszettel@post.at'
            ) ||
              text.includes(
                'Zusätzlich haben Sie 1 Sendung(en) erfolgreich über den postalischen Weg als Brief versendet. Das Dokument wird von uns über das „Einfach Brief“-Portal  gedruckt, kurvertiert und an die Adresse des Benutzers versendet'
              )
          ).to.be.true; // OR condition
        });
    }

    // Access the inbox iframe and validate the email subject
    emailSubject(0); // Validate subject of Reporting email
    emailBody(); // Validate email body

    // Wait to ensure the email content is loaded
    cy.wait(4500);

    // // Switch to the second email
    // cy.iframe('#ifinbox').find('.mctn > .m > button > .lms').eq(1).click();

    // emailSubject(1); // Validate subject of second email
    // cy.wait(1500);
    // emailBody(); // Validate second email body

    // Delete all emails if the button is not disabled
    // cy.get('.menu>div>#delall')
    //   .should('not.be.disabled')
    //   .click({ force: true });
    // cy.wait(4500);
  });

  //Enable hrManagement flag on Company
  it('Enable hrManagement flag on Company', () => {
    //Import credentials (un/pw) from 'supportView.json' file

    cy.loginToSupportViewMaster();
    cy.wait(1500);

    //Remove pop up dilaog
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(2500);

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

  //Disable View E-Box and DataSubmitter Roles
  it.skip('Disable View E-Box and DataSubmitter Roles for Specific Admin', () => {
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
      .eq(1)
      .type(Cypress.env('company')); // Use the company name from the cypress.config.js
    cy.wait(1500);
    //Find the Search button by button name and click on it
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    // Switch on Admin User page
    cy.get('.mdc-button__label')
      // Find the button containing "Admin User" or "Admin Benutzer" button
      .contains(/Admin User|Admin Benutzer/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    // Switch on Admin user's Role dilaog
    //Search for Aqua Admin
    cy.get('.search').click({ force: true });
    //Search for Admin using username
    cy.get('input[formcontrolname="userName"]').type(
      Cypress.env('username_supportViewAdmin')
    );
    // Click on Search for Admin User button
    cy.get('button[type="submit"]').click();
    cy.wait(2000);
    //Click on Role
    cy.get('.mdc-button__label')
      .contains(/Rechte|Rights/i) // Find the button containing "Rechte" or "Rights"
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button

    //Disable ViewEbox And DataSubmitter Roles for specific Admin user

    //List of roles to disable
    const rolesToDisable = [
      ['Company Admin', 'Firmen-Administrator'],
      ['Customer Creator', 'Nutzeranlage'],
      ['Data Submitter', 'Versand'],
      // ['View E-Box', 'E-Box ansehen'],
      // ['HR Manager', 'HR Manager'],
    ];

    cy.get('.mat-mdc-checkbox > div > .mdc-label')
      .should('exist') // Ensure checkbox labels exist
      .each(($label) => {
        const text = $label.text().trim();

        // Check if text exists in either English or German in rolesToDisable
        if (rolesToDisable.some(([en, de]) => text === en || text === de)) {
          cy.wrap($label)
            .parent()
            .find('input[type="checkbox"]') // Locate the checkbox input
            .then(($checkboxInput) => {
              cy.wrap($checkboxInput)
                .invoke('prop', 'checked')
                .then((isChecked) => {
                  if (isChecked) {
                    // Disable the role if it is currently checked
                    cy.wrap($checkboxInput).click({ force: true });
                    cy.log(`Checkbox for "${text}" was enabled; now disabled.`);
                  } else {
                    cy.log(`Checkbox for "${text}" is already disabled.`);
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
}); //end describe
