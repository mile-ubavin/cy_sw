describe('hrManagement - prepareDocumentForSpecificUser', () => {
  // Define a variable to store the formatted date and time after document upload
  var uploadDateTime;

  //  Send Delivery to selected-specific user

  //Enable Hr And Disable DataSubmitter Roles
  // it.skip('enableHrAndDisableDataSubmitterRoles', () => {
  //   //Login as a Master-User
  //   cy.fixture('supportView.json').as('payslipSW');
  //   cy.get('@payslipSW').then((payslipJson) => {
  //     // cy.visit(payslipJson.baseUrl); //Taken from base url
  //     // cy.url().should('include', payslipJson.baseUrl); //Validating url on the login page
  //     // //Login to sw
  //     // cy.get('@payslipSW').then((payslipJson) => {
  //     //   cy.get('input[formcontrolname="username"]').type(
  //     //     payslipJson.username_supportViewMaster
  //     //   );
  //     //   cy.get('input[formcontrolname="password"]').type(
  //     //     payslipJson.password_supportViewMaster
  //     //   );
  //     //   cy.get('button[type="submit"]').click();
  //     // });
  //     cy.loginToSupportViewMaster();

  //     //Search for 'Aqua' Group, by Display Name
  //     cy.get('#searchButton>span').click(); //Click on search button
  //     cy.fixture('supportView.json').as('payslipSW');
  //     cy.get('@payslipSW').then((payslipJson) => {
  //       // Use the company name from the JSON file
  //       const companyName = payslipJson.company;
  //       // Search for Group by Display Name using the company name
  //       cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
  //         .eq(1)
  //         .type(companyName);
  //     });
  //     //Find the Search button by button name and click on it
  //     cy.get('.search-dialog>form>div>.mat-primary').click();
  //     cy.wait(1500);

  //     // Switch on Admin User page
  //     clickOnAdminUserButton();

  //     // Switch on Admin user's Role dilaog
  //     clickRoleRechteButtonForAquaUser();

  //     //Enable HR Role (Admin user)
  //     enableHrAndDisableDataSubmitterRoles();
  //     cy.wait(3000);

  //     //Logout
  //     cy.get('.logout-icon ').click();
  //     cy.wait(2000);
  //     cy.get('.confirm-buttons > :nth-child(2)').click();
  //     cy.url().should('include', payslipJson.baseUrl_04); // Validate url'
  //     cy.log('Test completed successfully.');
  //     cy.wait(2500);
  //   });
  // }); //end it

  //Prepare document For Signing - For Specific user
  it('Send Delivery to selected-specific user', () => {
    cy.loginToSupportViewAdmin(); // Login as a master user
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

    // Search for Group section
    cy.get('#searchButton>span').click(); // Click on the search button

    // Search for Group by Display Name using the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(1)
      .type(Cypress.env('company')); // Use the company name from the cypress.config.js
    cy.wait(1500);

    // Find and click the search button
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(2500);

    // Click the "User" button within the action buttons
    cy.get('.action-buttons > button > .mdc-button__label')
      .last() // Select the last matched element
      .click(); // Click the matched "User" button
    cy.wait(2500);

    //Click on Select users to deliver documents button
    cy.get('.button-wraper>button>.mdc-button__label')
      .contains(
        /Select users to deliver documents|Benutzer für die Zustellung von Dokumenten auswählen/i
      )
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    // Search for the specific user by name
    cy.get('.dictionary-xml__search-container-input>input').type(
      Cypress.env('username_egEbox')
    );
    cy.wait(3500);

    // Find and check the checkbox in the row if it's not already checked
    cy.get('input[type="checkbox"]').eq(1).click();

    cy.wait(2000);
    //Click on Next buton
    cy.get('button>.title')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Next' || text === 'Nächste';
      })
      .click();
    cy.wait(1500);

    //Upload Document
    cy.get('.create_user_dialog_content>.buttons-wrapper>button>.title')
      .contains(/Upload Document|Dokument hochladen/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    //Uplad valid document (x1 A4 pdf file)
    cy.massUpload();
    cy.wait(2000);
    //Add Title
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

    cy.wait(2500);
    //Add Delivery Title
    const title = `Delivery For Specific User (pdf) - ${uploadDateTime}`;

    cy.get('input[formcontrolname="subject"]').clear().type(title);
    cy.wait(1500);

    cy.pause();
    //Add signature placeholder No.1
    // cy.intercept('GET', '**/maintanance-config/**').as('upload');

    // cy.get('.dialog-actions>button>.title')
    //   .contains(/Upload|hochladen/i)
    //   .should('be.visible') // Optional: Ensure the button is visible before interacting
    //   .click(); // Click the button
    // cy.wait(1500);

    // cy.wait(['@upload'], { timeout: 15000 }).then((interception) => {
    //   // Log the intercepted response
    //   cy.log('Intercepted response:', interception.response);

    //   // Optional: Assert the response status code
    //   expect(interception.response.statusCode).to.eq(200);
    // });

    cy.get('.dialog-actions>button>.title')
      .contains(/Upload|hochladen/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    cy.pause();
    //Click on Send delivery
    cy.get('.dialog-actions>button>.title')
      .contains(/Send|Senden/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    //Confirm Sending dialog
    cy.get('.dialog-container>.dialog-footer>.dialog-actions>button>.title')
      .contains(/ Confirm |Bestätigen/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    // Verify the success message
    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /We are processing in the background|Wir verarbeiten im Hintergrund/
        );
      });

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
    cy.wait(2500);

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

  // Send Delivery to selected-specific user
  // it('Send Delivery to selected-specific user', () => {
  //   cy.loginToSupportViewAdmin(); // Log in as an admin user
  //   cy.wait(1500);

  //   //Remove pop up
  //   cy.get('body').then(($body) => {
  //     if ($body.find('.release-note-dialog__close-icon').length > 0) {
  //       cy.get('.release-note-dialog__close-icon').click();
  //     } else {
  //       cy.log('Close icon is NOT present');
  //     }
  //   });
  //   cy.wait(1500);

  //   // Search for the specific group by display name
  //   cy.get('#searchButton>span').click();
  //   cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
  //     .eq(1)
  //     .type(Cypress.env('company'));
  //   cy.wait(1500);

  //   // Click the search button and select the user
  //   cy.get('.search-dialog>form>div>.mat-primary').click();
  //   cy.wait(2500);
  //   cy.get('.action-buttons > button > .mdc-button__label').last().click();
  //   cy.wait(2500);

  //   // Select users to deliver documents
  //   cy.get('.button-wraper>button>.mdc-button__label')
  //     .contains(
  //       /Select users to deliver documents|Benutzer für die Zustellung von Dokumenten auswählen/i
  //     )
  //     .click();
  //   cy.wait(1500);

  //   // Search for the specific e-box user and select them
  //   cy.get('.dictionary-xml__search-container-input>input').type(
  //     Cypress.env('username_egEbox')
  //   );
  //   cy.wait(3500);
  //   cy.get('input[type="checkbox"]').eq(1).click();
  //   cy.wait(2000);

  //   // Proceed to the next step and upload the document
  //   cy.get('button>.title')
  //     .filter((index, el) =>
  //       ['Next', 'Nächste'].includes(Cypress.$(el).text().trim())
  //     )
  //     .click();
  //   cy.wait(1500);
  //   cy.get('.create_user_dialog_content>.buttons-wrapper>button>.title')
  //     .contains(/Upload Document|Dokument hochladen/i)
  //     .click();
  //   cy.wait(1500);
  //   cy.massUpload();
  //   cy.wait(2000);

  //   // Add title and send the delivery
  //   const title = `Delivery For Specific User (pdf) - ${new Date().toLocaleString(
  //     'de-DE'
  //   )}`;
  //   cy.wrap(title).as('deliveryTitle'); // Store the title in a Cypress alias
  //   cy.get('input[formcontrolname="subject"]').clear().type(title);
  //   cy.wait(1500);
  //   cy.get('.dialog-actions>button>.title')
  //     .contains(/Send|Senden/i)
  //     .click();
  //   cy.wait(1500);
  //   cy.get('.dialog-container>.dialog-footer>.dialog-actions>button>.title')
  //     .contains(/Confirm|Bestätigen/i)
  //     .click();
  //   cy.wait(1500);

  //   // Verify the success message and logout
  //   cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
  //     .should('be.visible')
  //     .invoke('text')
  //     .then((text) => {
  //       expect(text.trim()).to.match(
  //         /We are processing in the background|Wir verarbeiten im Hintergrund/
  //       );
  //     });
  //   cy.get('.logout-icon').click();
  //   cy.wait(2000);
  //   cy.get('.confirm-buttons > :nth-child(2)').click();
  //   cy.url().should('include', Cypress.env('baseUrl'));
  //   cy.log('Test completed successfully.');
  //   cy.wait(2500);
  // });

  // Login to e-box and open the delivery
  // it.skip('Ebox user Open delivery and validate title', function () {
  //   cy.loginToEgEbox();
  //   cy.wait(2500);
  //   // Open the latest delivery and verify its content
  //   cy.intercept(
  //     'GET',
  //     '**/hybridsign/backend_t/document/v1/getDocument/**'
  //   ).as('getDocument');
  //   cy.intercept('GET', '**/getIdentifications?**').as('getIdentifications');
  //   cy.get('.mdc-data-table__content>tr>.subject-sender-cell')
  //     .eq(0)
  //     .click({ force: true });

  //   cy.wait('@getIdentifications', { timeout: 27000 }).then((interception) => {
  //     expect(interception.response.statusCode).to.eq(200);
  //   });

  //   // Verify the title of the delivery matches the one sent
  //   cy.get('@deliveryTitle').then((expectedTitle) => {
  //     cy.get('.delivery-title-selector') // Replace with the actual selector for the delivery title element
  //       .should('have.text', expectedTitle);
  //   });

  //   // Scroll through the delivery and logout
  //   cy.get('.content-container>.scroll-container')
  //     .eq(1)
  //     .scrollTo('bottom', { duration: 500, ensureScrollable: false });
  //   cy.wait(3500);
  //   cy.get('.user-title').click();
  //   cy.wait(1500);
  //   cy.get('.logout-title > a').click();
  //   cy.url().should('include', Cypress.env('baseUrl_egEbox'));
  //   cy.log('Test completed successfully.');
  // });
}); //end describe
