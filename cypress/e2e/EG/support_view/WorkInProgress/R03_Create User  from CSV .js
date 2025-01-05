describe('Master - Create User from CSV', () => {
  // A D M I N   U S E R - CREATE USER FROM CSV FILE

  it('Login As AdminUser - Create Users from CSV file', () => {
    //Import credentials (un/pw) from 'supportView.json' file
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      // Login as Master User using a custom command
      cy.loginToSupportViewAdmin();
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

      //Find the Search button by button name and click on it
      cy.get('.search-dialog>form>div>.mat-primary').click();
      cy.wait(1500);

      cy.get('.action-buttons>.mdc-button>.mdc-button__label')
        .filter((index, el) => {
          const text = Cypress.$(el).text().trim();
          return text === 'User' || text === 'Benutzer';
        })
        .click({ force: true });
      cy.wait(2500);

      //Click on create User button
      cy.get('.button-wraper>button > .mdc-button__label')
        .filter((index, el) => {
          const text = Cypress.$(el).text().trim();
          return text === 'Create user' || text === 'Neuen Benutzer Anlegen';
        })
        .click({ force: true });
      cy.wait(1500);

      //Click on Upload CSV button
      cy.get('.create_user_dialog_content>.buttons-wrapper>button')
        .filter((index, el) => {
          const text = Cypress.$(el).text().trim();
          return text === 'CSV uploading' || text === 'CSV Anlage';
        })
        .click();

      //Upload CSV file
      cy.upload_csv();
      cy.get('#mat-select-value-3 > .mat-mdc-select-placeholder').click();
      cy.get('div.cdk-overlay-pane').should('exist'); // Ensure the overlay pane is present
      cy.get('div.cdk-overlay-pane mat-option').should(
        'have.length.greaterThan',
        0
      );

      //Select Company prefix
      cy.wait(1500);
      cy.get('mat-option').eq(0).click();
      cy.wait(1500);
      //Click on  Create Users button
      cy.get(
        '.dialog-container>.dialog-footer>.controls>button>.button__footer>.button__icon>mat-icon[data-mat-icon-name="icon-right"]'
      ).click();

      //Validate success message
      cy.get('sv-multiple-notifications>.messages>p')
        .invoke('text')
        .then((text) => {
          const trimmedText = text.trim();

          // Check if the text matches either English or German message
          expect(trimmedText).to.be.oneOf([
            '2 Users were created', // English
            '2 Benutzer wurden erstellt', // German
          ]);
        });
      cy.wait(2500);
    });
    cy.pause();

    //Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url
    cy.wait(1500);
  }); //end it

  //Y O P M A I L

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

    // Switch to the second email
    cy.iframe('#ifinbox').find('.mctn > .m > button > .lms').eq(1).click();

    emailSubject(1); // Validate subject of second email
    cy.wait(1500);
    emailBody(); // Validate second email body

    cy.wait(4500);
  });

  // M A S T E R    U S E R - DELETE ALREADY CREATED USERS
  it('Login As Master User - Delete Alredy created Users', () => {
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

    //Find the Search button by button name and click on it
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);
    //Switch to user section
    cy.get('.action-buttons > .mdc-button').eq(4).click();

    // Array of users to delete
    const usersToDelete = ['otto', 'emma']; // Add more usernames as needed

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
            cy.wait(1500);
            // Confirm delete in the confirmation dialog
            cy.get('.confirm-buttons > button')
              .filter((index, button) => {
                return (
                  Cypress.$(button).text().trim() === 'YES' ||
                  Cypress.$(button).text().trim() === 'JA'
                );
              })
              .click();
            cy.wait(1500);
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
    // Completion message at the end of the test
    cy.log('The tests have been completed successfully.');
    cy.wait(3000);
  }); //end it
}); //end describe
