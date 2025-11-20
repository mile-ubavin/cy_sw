// Click on Admin User button
function clickOnAdminUserButton() {
  cy.get('.ng-star-inserted>.action-buttons>button')
    .contains(/Admin User|Admin Benutzer/)
    .then(($button) => {
      if ($button.length > 0) {
        cy.wrap($button).click({ force: true });
      }
    });
}
//-------------------End Custom Function-------------------

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
  clickOnAdminUserButton();

  // Click on 'Create Admin User' button to open the dialog
  cy.get('.mat-primary>.mdc-button__label')
    .filter((index, el) => {
      const text = Cypress.$(el).text().trim();
      return text === 'Create Admin User' || text === 'Admin Benutzer Anlegen';
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

  cy.intercept('POST', '**/supportView/v1/person/editXUser**').as('editXUser');
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
      return text === 'Create Admin User' || text === 'Admin Benutzer Anlegen';
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
  cy.get('input[formcontrolname="userName"]').click().type(adminUser.username); //Search for newly created user using username
  cy.get('button[type="submit"]').click(); //Click on Search button
  cy.wait(2500);

  //Add permission to Admin user by clicking on the Role button
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

  // Verify  Rights updated successfully message
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
});
