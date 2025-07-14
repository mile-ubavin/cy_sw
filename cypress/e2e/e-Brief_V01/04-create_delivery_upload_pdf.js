describe('Login, Create_delivery-Upload_doc(pdf), Logout', () => {
  let uploadDateTime; // Variable to store upload timestamp

  it.only('Create_delivery-Upload_doc(pdf)', function () {
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

    cy.log('Test completed successfully.');
    cy.wait(8500);

    // Logout
    cy.get('.user-title').click({ force: true });
    cy.wait(2000);
    cy.contains('Logout').click();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate landing page URL
  });

  it('Logout & Clear saved session', function () {
    cy.visit('/deliveries');
    cy.url().should('include', '/deliveries'); // Validate URL
    cy.get('.user-title').click();
    cy.wait(2000);
    cy.contains('Logout').click();

    Cypress.session.clearAllSavedSessions(); // Clear all sessions
  });
});
