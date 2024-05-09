describe('Login/Logout to DATAPART E-Box', () => {
  // Login and Logout
  it('Login and Logout', function () {
    cy.loginToEgEboxAsStudent();
    // Click om initialPayment

    cy.get('.button-group>.initialPayment>button').click();
    //Enter invalid value
    cy.get('#mat-input-6').click().type('ABCDFG');

    // Check Error message
    cy.get('.mat-mdc-form-field-error>.mat-mdc-form-field-error')
      .should('be.visible') // Ensure the element is visible
      .should('contain', 'Nur Zahlen sind erlaubt.'); // Check if the text contains the expected message
    cy.wait(1500);
    cy.get('#mat-input-6').click().clear();
    //Enter ladger amount

    cy.get('#mat-input-6').click().type('2000.01');
    // Check Error message
    cy.get('.mat-mdc-form-field-error>.mat-mdc-form-field-error')
      .should('be.visible') // Ensure the element is visible
      .should('contain', 'Die maximale Rate ist 2000 EURO.'); // Check if the text contains the expected message
    cy.wait(1500);
    cy.get('#mat-input-6').click().clear();

    //Enter valid amount
    cy.get('#mat-input-6').click().type('200.01');
    cy.get('.mat-mdc-form-field-error>.mat-mdc-form-field-error').should(
      'not.exist'
    );
    cy.get('.mat-mdc-select-placeholder').click();

    // Get the total number of items
    cy.get('.ng-trigger-transformPanel > .mdc-list-item').then(($items) => {
      const totalItems = $items.length;
      cy.log(`Total number of items: ${totalItems}`);

      // Log text of each item
      $items.each((index, item) => {
        cy.wrap(item)
          .find('.mdc-list-item__primary-text')
          .invoke('text')
          .then((text) => {
            cy.log(`Item ${index + 1}: ${text}`);
          });
      });

      // Click on a random item
      const randomIndex = Math.floor(Math.random() * totalItems);
      cy.wrap($items[randomIndex]).click();
    });
    cy.wait(1000);
    cy.get('.submit-button').click();

    //Logout
    cy.get(
      '.side-menu-section-desktop>.arrow-icon>button[aria-label="Benutzereinstellungen öffnen"]'
    ).click();
    cy.wait(3000);
    cy.get('.logout-title > a').click({ force: true });
    cy.fixture('datapart.json').as('datapart');
    cy.get('@datapart').then((datapartJson) => {
      cy.visit(datapartJson.baseUrl); //Taken from base url
      cy.url().should('include', datapartJson.baseUrl); //Validating url on the login page
    });
  });
});
