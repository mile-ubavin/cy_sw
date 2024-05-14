describe('search for delivery', () => {
  // Login and Logout
  it('search for delivery', function () {
    cy.loginToEgEboxAsStudent();

    cy.get('#mat-input-2').type('no delivery{enter}');
    cy.get(
      '.inbox-table>app-deliveries-inbox-table>.table-wrapper>.no-results'
    ).should('include.text', ' Keine Übereinstimmungen gefunden ');
    cy.wait(2000);
    cy.get('.mat-mdc-button-touch-target')
      .its('length')
      .then((length) => {
        // Click on the penultimate element
        cy.get('.mat-mdc-button-touch-target')
          .eq(length - 2)
          .click();
        cy.wait(1500);
        cy.get('.mat-mdc-button-touch-target')
          .eq(length - 1)
          .click();
      });
    cy.get('.table-pagination>button').click();
    const paginationTitle = [];
    cy.get('.mat-mdc-menu-content>button>.mat-mdc-menu-item-text')
      .each(($el) => {
        const pagination = $el.text().trim();
        paginationTitle.push(pagination);
        cy.log('Pagination: ', pagination); // Log each individual title
      })
      .then(() => {
        // Randomly select pagination item
        const randomIndex = Math.floor(Math.random() * paginationTitle.length);
        const selectedItem = paginationTitle[randomIndex];
        cy.log('Randomly selected label: ', selectedItem);
        cy.contains(
          '.mat-mdc-menu-content>button>.mat-mdc-menu-item-text',
          selectedItem
        ).click({ force: true });
      });
    cy.wait(2000);

    const deliveryTitle = [];

    cy.get('.subject-text')
      .each(($el) => {
        const title = $el.text().trim();
        deliveryTitle.push(title);
        cy.log('Delivery Title: ', title); // Log each individual title
      })
      .then(() => {
        // Randomly select a label from the filtered array
        const randomIndex = Math.floor(Math.random() * deliveryTitle.length);
        const selectedDelivery = deliveryTitle[randomIndex];
        cy.log('Randomly selected label: ', selectedDelivery);
        cy.get('#mat-input-2')
          .clear()
          .type(selectedDelivery + '{enter}');
      });
    cy.wait(2000);

    cy.get(
      '.filter-clear > .mat-mdc-tooltip-trigger > #undefined > .mat-mdc-button-touch-target'
    ).click();
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
