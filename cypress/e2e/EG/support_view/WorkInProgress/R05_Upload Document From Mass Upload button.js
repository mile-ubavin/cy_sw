describe('R05_Upload Document From Mass Upload button', () => {
  // Click on Admin User button
  function clickOnAdminUserButton() {
    cy.get('.mdc-button__label')
      // Find the button containing "Admin User" or "Admin Benutzer" button
      .contains(/Admin User|Admin Benutzer/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);
  }

  // Search For Admin And Open Role Dialog
  function searchForAdminAndOpenRoleDialog() {
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
  }

  // Enable View E-Box and DataSubmitter role
  function enableViewEboxAndDataSubmitterRoles() {
    const rolesToEnable = [
      'Data Submitter',
      'Versand',
      'View E-Box',
      'E-Box ansehen',
    ];

    cy.get('.mat-mdc-checkbox > div > .mdc-label')
      .should('exist') // Ensure checkbox labels exist
      .each(($label) => {
        const text = $label.text().trim();
        if (rolesToEnable.includes(text)) {
          // Target the specific checkbox
          cy.wrap($label)
            .parent()
            .find('input[type="checkbox"]') // Locate the checkbox input
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

    cy.wait(1500);
    // Submit the changes
    cy.get('button[type="submit"]').click();
    cy.wait(1500);

    // Verify the success message
    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible') // Ensure it's visible first
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(/Rights updated|Rechte aktualisiert/);
      });
  }

  // Disable View E-Box and DataSubmitter role
  function disableViewEboxAndDataSubmitterRoles() {
    const rolesToDisable = [
      'Data Submitter',
      'Versand',
      'View E-Box',
      'E-Box ansehen',
    ];

    cy.get('.mat-mdc-checkbox > div > .mdc-label')
      .should('exist') // Ensure checkbox labels exist
      .each(($label) => {
        const text = $label.text().trim();
        if (rolesToDisable.includes(text)) {
          // Target the specific checkbox
          cy.wrap($label)
            .parent()
            .find('input[type="checkbox"]') // Locate the checkbox input
            .then(($checkboxInput) => {
              if ($checkboxInput.is(':checked')) {
                // Disable the role if it is currently checked
                cy.wrap($checkboxInput).click({ force: true });
                cy.log(`Checkbox for "${text}" was enabled; now disabled.`);
              } else {
                // Role is already disabled
                cy.log(`Checkbox for "${text}" is already disabled.`);
              }
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
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(/Rights updated|Rechte aktualisiert/);
      });
  }

  var uploadDateTime = '';

  //-------------------End Custom Function-------------------

  //Enable View E-Box and DataSubmitter Roles
  it('Enable View E-Box and DataSubmitter Roles for Specific Admin', () => {
    // Login as a Master-User using custom command
    cy.loginToSupportViewMaster();
    cy.wait(3500);
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
    clickOnAdminUserButton();
    // Switch on Admin user's Role dilaog
    searchForAdminAndOpenRoleDialog();
    // Enable View E-Box and DataSubmitter Roles' for specific Admin user
    enableViewEboxAndDataSubmitterRoles();
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

    //Uplad valid document (1 A4 pdf file)
    cy.massUpload();
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

    //Add Delivery Title
    const title = `Document From MassUpload (pdf) - ${uploadDateTime}`;

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
    //Focus out
    cy.get('body').type('{esc}');
    cy.wait(1500);
    //Prepare doc for signing
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

  //Login to e-Box and Open Delivery
  it('Ebox user Open delivery', () => {
    cy.loginToEgEbox();

    //Open latest created deivery
    cy.intercept(
      'GET',
      '**/hybridsign/backend_t/document/v1/getDocument/**'
    ).as('getDocument');
    cy.intercept('GET', '**/getIdentifications?**').as('getIdentifications');
    cy.get('.mdc-data-table__content>tr>.subject-sender-cell')
      .eq(0)
      .click({ force: true });

    cy.wait(['@getIdentifications'], { timeout: 27000 }).then(
      (interception) => {
        // Log the intercepted response
        cy.log('Intercepted response:', interception.response);

        // Assert the response status code
        expect(interception.response.statusCode).to.eq(200);
      }
    );

    // Scroll to the bottom of the PDF viewer or page
    cy.get('.content-container>.scroll-container').eq(1).scrollTo('bottom', {
      duration: 500,
      ensureScrollable: false,
    });
    cy.wait(3500);

    // Logout
    cy.get('.user-title').click();
    cy.wait(1500);
    cy.get('.logout-title > a').click();
    cy.url().should('include', Cypress.env('baseUrl_egEbox')); // Validate url
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
    cy.get('.menu>div>#delall')
      .should('not.be.disabled')
      .click({ force: true });
    cy.wait(4500);
  });

  //Disable View E-Box and DataSubmitter Roles
  it('Disable View E-Box and DataSubmitter Roles for Specific Admin', () => {
    // Login as a Master-User using custom command
    cy.loginToSupportViewMaster();
    cy.wait(3500);
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
    clickOnAdminUserButton();
    // Switch on Admin user's Role dilaog
    searchForAdminAndOpenRoleDialog();
    // Enable View E-Box and DataSubmitter Roles' for specific Admin user
    disableViewEboxAndDataSubmitterRoles();
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
