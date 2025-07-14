describe('Login, Crete_delivery-Upload_doc(pdf), Logout', () => {
  let uploadDateTime; // Variable to store upload timestamp

  //Crete delivery
  it('Crete_delivery-Upload_doc(pdf)', function () {
    cy.loginToEBrief(); // Login using a custom command
    cy.wait(2000);

    // Click upload button
    cy.get('#toolbar-toggle_upload').click();

    // Get number of unread deliveries **before** creating a new delivery
    cy.get('.postbox-wrap>.unread')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const match = text.match(/\((\d+)\)/); // Extract number inside parentheses
        const unreadDeliveriesBefore = match ? parseInt(match[1], 10) : 0;

        cy.log(`Unread Deliveries Before: ${unreadDeliveriesBefore}`);
        cy.wrap(unreadDeliveriesBefore).as('unreadBefore'); // Store the value
      });

    // Upload attachment
    cy.upload_attachment(); // Upload PDF documents using a custom command
    cy.wait(2000);

    // Set date and time
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

    const title = `Delivery - ${uploadDateTime}`;

    // Add Delivery Title
    cy.get('#mat-input-5').type(title);
    cy.wait(2000);
    cy.contains(' Speichern ').click({ force: true });
    cy.wait(1500);

    // Get number of unread deliveries **after** creating a new delivery
    cy.get('.postbox-wrap>.unread')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const match = text.match(/\((\d+)\)/);
        const unreadDeliveriesAfter = match ? parseInt(match[1], 10) : 0;

        cy.log(`Unread Deliveries After: ${unreadDeliveriesAfter}`);
        cy.wrap(unreadDeliveriesAfter).as('unreadAfter'); // Store the value
      });

    // Calculate total unread deliveries difference
    cy.get('@unreadBefore').then((unreadBefore) => {
      cy.get('@unreadAfter').then((unreadAfter) => {
        const total = unreadAfter - unreadBefore;
        cy.log(`Total unread deliveries change: ${total}`);

        // Validate that the new delivery increased unread count by 1
        expect(total).to.equal(1);
      });
    });

    //select first delivery fron the deliveries table
    cy.get(':nth-child(1) > .subject-sender-cell').click();
    cy.get('.subject-sender-cell').eq(0).click(); //select first (last created) delivery from the deliveries table

    // cy.get('.content-header>.ng-star-inserted').eq(2).click()//Click on add new label to document
    cy.get(
      '.even-row.details > .labels-cell > .labels-list > .assign-label-wrap > app-custom-icon-button.ng-star-inserted > #undefined > .mat-mdc-button-touch-target'
    ).click();
    cy.get('h2.dialog-title').should(
      'have.text',
      'Label zur Sendung hinzufügen'
    ); //Validate Label dialog title
    cy.get('.labels-list-wrapper > ul>li').eq(0).invoke('text').as('labelName'); //Select 1st label
    cy.get('@labelName').should('include', 'Wichtig'); //Validate label name
    cy.get('.labels-list-wrapper > ul>li').eq(0).click();
    //cy.get('[color="secondary"] > .button >.button__title').should('have.text', ' Abbrechen ');
    cy.get('[color="secondary"] > .button')
      .should('be.visible')
      .and('be.enabled');
    cy.get('[color="primary"] > .button')
      .should('be.visible')
      .and('be.enabled');
    //.should('have.text', ' Anwenden ');
    cy.wait(1000);
    cy.get('[color="primary"] > .button').click();

    cy.log('Test completed successfully.');
    cy.wait(3500);

    // Logout
    cy.get('.user-title').click({ force: true });
    cy.wait(2000);
    cy.contains('Logout').click();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate landing page URL
  }); //end it
});
