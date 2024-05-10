describe('Verify footer links', () => {
  it('Verify footer links', () => {
    // Get url from datapart.json / fixture folder
    cy.fixture('datapart.json').then((datapartJson) => {
      cy.visit(datapartJson.baseUrl); // Taken from base url
      cy.url().should('include', datapartJson.baseUrl); // Validating url on the login page

      // Get footer titles from datapart.json
      const footerTitles = [
        datapartJson.footerTitle[0],
        datapartJson.footerTitle[1],
        datapartJson.footerTitle[2],
        datapartJson.footerTitle[3],
        datapartJson.footerTitle[4],
        datapartJson.footerTitle[5],
      ];

      // Validate total number of footer links
      cy.get('.footer__wrapper > ul > li > a').its('length').should('eq', 6);

      // Validate each footer title
      cy.get('.footer__wrapper > ul > li > a').each(($el, index) => {
        cy.wrap($el).invoke('text').should('equal', footerTitles[index]);
      });

      // Click on each footer link and go back to the original page after each click
      function clickNextLink(index) {
        // Skip index 2
        if (index === 2) {
          index++; // Move to the next index
        }

        if (index >= footerTitles.length) {
          return; // Exit when all links are clicked
        }

        cy.get('.footer__wrapper > ul > li > a')
          .eq(index)
          .invoke('removeAttr', 'target')
          .click();
        cy.wait(1000); // Adjust this wait time as needed

        cy.url().then((url) => {
          const footerLinks = [
            datapartJson.footerLinks[0],
            datapartJson.footerLinks[1],
            datapartJson.footerLinks[2],
            datapartJson.footerLinks[3],
            datapartJson.footerLinks[4],
            datapartJson.footerLinks[5],
          ];
          cy.log('URL after clicking on link:', url);
          cy.wrap(url).should(
            'eq',
            'https://www.datapart-factoring.de/' + footerLinks[index]
          ); // Assert the URL after clicking
        });

        cy.go('back').then(() => {
          clickNextLink(index + 1); // Click the next link recursively
        });
      }

      clickNextLink(0); // Start clicking from the first link
    });
    cy.log('Test completed successfully.');
  });
});
