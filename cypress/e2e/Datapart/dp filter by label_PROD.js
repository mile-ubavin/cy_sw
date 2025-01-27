describe('filter by label - DATAPART E-Box', () => {
  // Login and Logout
  it('filter by label', function () {
    cy.loginToEgEboxAsStudent();

    // Define the number of times to execute the code
    const numberOfExecutions = 3;

    // Loop to execute the code multiple times
    for (let i = 0; i < numberOfExecutions; i++) {
      cy.wait(1500);
      cy.get('.label-list-link > a').then(($labels) => {
        // Check if any labels are found
        if ($labels.length > 0) {
          // Get total number of input fields labels
          const listingCount = $labels.length;
          cy.log('number of labels: ', listingCount);

          // Array to store labels that don't match "Sepa" or "Raten"
          const filteredLabels = [];

          // Randomly select a label from the filtered array
          const randomIndex = Math.floor(Math.random() * listingCount);
          const selectedLabel = Cypress.$($labels[randomIndex]).text().trim();
          cy.log('Randomly selected label: ', selectedLabel);
          // Click on the selected label
          cy.get($labels[randomIndex]).click();
          cy.wait(1500);
        } else {
          // Handle the case when no labels are found
          cy.log('No labels found');
        }
      });

      // Wait for a brief moment to allow the page to update
      cy.wait(1000);

      // Click on the other element after the page has updated
      cy.get(
        '.mdc-evolution-chip__text-label > .mat-mdc-tooltip-trigger > #undefined > .mat-mdc-button-touch-target'
      ).click({ force: true });
    }

    //Logout
    cy.get(
      '.side-menu-section-desktop>.arrow-icon>button[aria-label="Benutzereinstellungen öffnen"]'
    ).click();
    cy.wait(3000);
    cy.get('.logout-title > a').click({ force: true });
    cy.url().should('include', Cypress.env('baseUrl')); // Validate URL
    cy.log('Test completed successfully.');
    cy.wait(2500);
  });
});
