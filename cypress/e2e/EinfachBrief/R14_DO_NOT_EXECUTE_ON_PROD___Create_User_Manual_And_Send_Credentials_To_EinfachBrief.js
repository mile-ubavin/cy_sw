import 'cypress-iframe';
describe('Send welcome mail via post/EinfachBrief', () => {
  it('Login to einfachBrief and check welcome pdf', () => {
    cy.visit(Cypress.env('tagesBaseUrl'));
    cy.url().should('include', Cypress.env('tagesBaseUrl'));

    cy.wait(1500);

    // Remove Cookie dialog (if shown)
    // cy.get('body').then(($body) => {
    //   if ($body.find('#onetrust-policy-title').is(':visible')) {
    //     cy.get('#onetrust-accept-btn-handler').click({ force: true });
    //   } else {
    //     cy.log('Cookie bar not visible');
    //   }
    // });

    // Remove Cookie dialog if visible
    cy.get('body').then(($body) => {
      const cookieBar = $body.find('#onetrust-policy-title:visible');

      if (cookieBar.length > 0) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
        cy.log('Cookie bar found and removed.');
      } else {
        cy.log('Cookie bar not visible, skipping removal.');
      }
    });
    cy.wait(2500);

    // Log in to the tages
    cy.get('#username').type(Cypress.env('email_supportViewAdmin'));
    cy.get('#password').type(Cypress.env('password_supportViewAdmin'));
    cy.get('button[type="submit"]').click({ force: true });

    cy.wait(1500);

    // Switch to Shopping Card table
    cy.get('.css-i9mkbf>div>button').then(($links) => {
      const linkTexts = [];
      const urls = [];

      // Iterate through each link to extract link text and href
      $links.each((index, link) => {
        linkTexts[index] = Cypress.$(link).text().trim(); // Store link text
        urls[index] = Cypress.$(link).attr('href'); // Store href attribute

        // Log the link text for debugging
        cy.log('Link Text:', linkTexts[index]);
      });

      // Check if "Open Deliveries" or "Open Sendungen" exists and click on it
      const targets = ['Offene Sendungen', 'Open Deliveries'];

      targets.forEach((target) => {
        const index = linkTexts.indexOf(target);
        if (index !== -1) {
          // Click the link if it's found
          cy.get('.css-i9mkbf>div>button').eq(index).click();
        }
        cy.wait(2000);
      });
      //Open latest received item
      cy.get('table>tbody>tr>td').then(($cells) => {
        // Create an array to hold the texts from each cell
        const cellTexts = [];

        // Iterate through each cell to extract the text
        $cells.each((index, cell) => {
          const text = Cypress.$(cell).text().trim(); // Get the text and trim whitespace
          cellTexts.push(text); // Store the text in the array
        });

        // Find the index of the first cell that contains 'UserAccount_'
        const targetIndex = cellTexts.findIndex((text) =>
          text.includes('UserAccount_')
        );

        if (targetIndex !== -1) {
          // Click on the first cell that contains 'UserAccount_'
          cy.get('table>tbody>tr>td').eq(targetIndex).click();
        }
        cy.wait(1500);

        //Open/Preview selected document
        cy.intercept('POST', '**/getDocumentPreview*').as('previewDoc');

        cy.get('.css-17ktzop>svg')
          .should('be.visible') // Wait for the element to be visible
          .click({ force: true });

        cy.wait('@previewDoc', { timeout: 57000 }).then((interception) => {
          // Assert the response status code
          expect(interception.response.statusCode).to.eq(200);
          cy.wait(2500);
        });

        //Close document preview dialog
        cy.get('.lg>button').click();
      });
      cy.wait(2000);
    });

    // Switch to history table and download the PDF
    cy.get('.css-i9mkbf>div>button')
      .contains(/Auftragsliste|Auftragsliste/)
      .click();
    cy.wait(2000);

    cy.get('table>tbody>tr').eq(0).click();
    cy.wait(1500);
    // Click on Download button
    cy.get('.css-1xspvtb>img[alt="Download"]').first().click({ force: true });
    cy.wait(2000);

    // Get the latest downloaded PDF file
    const downloadsDir = `${Cypress.config(
      'fileServerFolder'
    )}/cypress/downloads/`;
    cy.task('getDownloadedPdf', downloadsDir).then((filePath) => {
      expect(filePath).to.not.be.null; // Assert the file exists
      cy.log(`Latest PDF File Path: ${filePath}`);
      cy.wait(3000);
      // Read the PDF content and open in the same tab using a Blob
      cy.readFile(filePath, 'binary').then((pdfBinary) => {
        const pdfBlob = Cypress.Blob.binaryStringToBlob(
          pdfBinary,
          'application/pdf'
        );
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Open the PDF in the same tab
        cy.window().then((win) => {
          win.location.href = pdfUrl; // Loads the PDF in the same window
        });
      });
    });
    cy.wait(3500);
  }); //end it
}); //end describe
