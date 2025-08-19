import 'cypress-iframe';
describe('Login to Einfachbrief', () => {
  it.skip('Login Test', () => {
    // Generate a 5-character random string
    function generateRandomString(length) {
      const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let randomString = '';
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
      }
      return randomString;
    }

    // Generate a 5-character random string
    let randomString = generateRandomString(5);
    console.log(randomString);
    const username = 'EinfachbriefUser - ' + randomString;
    const invalidPassword = 'Invalid-password - ' + randomString;

    it.skip('should lock the user after 5 invalid login attempts', () => {
      cy.visit(Cypress.env('baseUrl'));
      cy.pause();
      cy.url().should('include', Cypress.env('baseUrl'));

      cy.wait(1500);

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
      // cy.get('#username').type(Cypress.env('email_supportViewAdmin'));
      // cy.get('#password').type(Cypress.env('password_supportViewAdmin'));
      // cy.get('button[type="submit"]').click({ force: true });

      // Simulate 4 invalid login attempts
      cy.get('#username').type(username);
      for (let attempt = 1; attempt <= 4; attempt++) {
        // Fill in the login form using invalid password
        cy.get('#password').type(invalidPassword);
        cy.wait(2000);

        // Click the login button
        cy.get('button[type="submit"]').click();

        //Validating error message is temporaly disabled...
        // cy.wait(3000);
        // cy.get(".error-text").should(
        //   "include.text",
        //   "Username and password are incorrect."
        // );

        cy.wait('@apiRequest').then((interception) => {
          // Log the status code to the Cypress console
          //cy.log(`Status Code: ${interception.response.statusCode}`);

          // Checking Status Code from response
          expect(interception.response.statusCode).to.eq(404);

          // Read and assert against the response JSON
          const responseBody = interception.response.body;
          expect(responseBody)
            .to.have.property('message')
            .and.equal('Account is locked!'); //Verify message from response

          cy.get('#password').clear();
        });
      }

      // Now, attempt a login after 4 invalid attempts
      // Fill in the login form - using invalid pass
      cy.get('#password').type(invalidPassword);
      cy.wait(2000);

      // Click the login button
      cy.get('button[type="submit"]').click();
      //Verify Error message from response, after locking account
      cy.get('form>.error-text').should(
        'include.text',
        ' This account is locked, please try again in 5 minutes. '
      );
      cy.get('form > .error-text')
        .invoke('text')
        .then((text) => {
          cy.log('Text content: ' + text);
        });
      //Verify message from response
      cy.wait('@apiRequest').then((interception) => {
        // Log the status code to the Cypress console
        //cy.log(`Status Code: ${interception.response.statusCode}`);

        // Checking Status Code from response
        expect(interception.response.statusCode).to.eq(403);
        cy.wait(2000);

        // Read and assert against the response JSON
        const responseBody = interception.response.body;
        expect(responseBody).to.have.property('message').and.equal('5'); //Verify message from response
        cy.wait(5000);
      });
    });
  });

  //Login to einfachBrief and opem welcome pdf (OLD VERSION)
  it.only('Login to einfachBrief and check welcome pdf', () => {
    cy.visit(Cypress.env('baseUrl'));
    cy.url().should('include', Cypress.env('baseUrl'));

    cy.wait(1500);

    // Remove Cookie dialog (if shown)
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      } else {
        cy.log('Cookie bar not visible');
      }
    });
    cy.wait(1500);

    // Log in to the sw
    cy.get('#username').type(Cypress.env('username_stundung'));
    cy.get('#password').type(Cypress.env('password_stundung'));

    //Click on show hide button
    cy.get('button>.css-j5bxbw').click();
    cy.wait(1500);

    //Click on Submit button
    cy.get('button[type="submit"]').click({ force: true });
    cy.wait(1500);

    //Check Header title
    cy.task('readHeaderLinks').then((expectedTitles) => {
      cy.log('Loaded expected titles:', JSON.stringify(expectedTitles));
      expect(expectedTitles.length, 'Expected titles length').to.be.greaterThan(
        0
      );
      //Check Header title
      cy.get('.css-oq1557')
        .should('have.length', expectedTitles.length)
        .each(($el, index) => {
          cy.wrap($el).should('have.text', expectedTitles[index]);
        });
    });

    // Check SendungenLinks on Home page (body)
    cy.task('readSendungenLinks').then((expectedSendungenLinks) => {
      cy.log('Loaded expected titles:', JSON.stringify(expectedSendungenLinks));
      expect(
        expectedSendungenLinks.length,
        'Expected length'
      ).to.be.greaterThan(0);

      cy.get(
        '.css-1vra9a1 > .css-xrlcbs > :nth-child(n+1):nth-child(-n+3) > .css-10la1oh'
      )
        .should('have.length', expectedSendungenLinks.length) // match exactly expected count
        .each(($el, index) => {
          cy.wrap($el).should('have.text', expectedSendungenLinks[index]);
        });
    });

    //  Check weiterführendeLinks on Home page (body)
    cy.task('readWeiterführendeLinks').then((expectedSendungenLinks) => {
      cy.log('Loaded expected titles:', JSON.stringify(expectedSendungenLinks));
      expect(
        expectedSendungenLinks.length,
        'Expected length'
      ).to.be.greaterThan(0);

      // Assert the links have the same length and match the expected text
      cy.get('.css-1nlo301 > .css-xrlcbs > :nth-child(-n+4) > .css-10la1oh') // Grabs the first 4 links (adjust as needed)
        .should('have.length', expectedSendungenLinks.length)
        .each(($el, index) => {
          cy.wrap($el).should('have.text', expectedSendungenLinks[index]);
        });
    });

    // Check solutions-heading

    const titles = Cypress.env('solutionsTitle');
    const paragraphs = Cypress.env('solutionsP');
    const links = Cypress.env('solutionsLinks');

    // 1. Count the number of solution elements
    cy.get('.css-p38o28').should('have.length', 3);

    // 2. Validate titles
    cy.get('.css-p38o28 > div > h3').each((el, index) => {
      cy.wrap(el).should('have.text', titles[index]);
    });

    // 3. Validate paragraphs
    cy.get('.css-p38o28 > div > p').each((el, index) => {
      cy.wrap(el).should('have.text', paragraphs[index]);
    });

    // 4. Validate link texts
    cy.get('.css-p38o28 > div > a').each((el, index) => {
      cy.wrap(el).should('have.text', links[index]);
    });

    //Footer

    const footerTitles = Cypress.env('footerTitle');
    const footerLinks = Cypress.env('footerLink');

    // 1. Count the number of solution elements
    cy.get('.css-cuvpzb').should('have.length', 3);

    // 2. Validate Footer titles
    cy.get('.css-cuvpzb').each((el, index) => {
      cy.wrap(el).should('have.text', footerTitles[index]);
    });

    // 4. Validate footer link texts
    cy.get('.css-p38o28 > div > a').each((el, index) => {
      cy.wrap(el).should('have.text', footerLinks[index]);
    });

    cy.pause();
    //******************************************************************************************** */
    //******************************************************************************************** */
    //******************************************************************************************** */

    // Switch to Shopping Card table
    cy.get('.header__navigation-menu>li>a').then(($links) => {
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
          cy.get('.header__navigation-menu>li>a').eq(index).click();
        }
        cy.wait(2000);
      });
      //Open latest received item
      cy.get('.table__container>table>tbody>tr>td').then(($cells) => {
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
          cy.get('.table__container>table>tbody>tr>td').eq(targetIndex).click();
        }
        cy.wait(1500);

        //Open/Preview selected document
        cy.intercept('POST', '**/getDocumentPreview*').as('previewDoc');

        cy.get(
          '.open > .accordion-container > .table-wrapper > tp-table > .table > .table__container > table > tbody > .table__row>td>.icon-magnify'
        )
          .should('be.visible') // Wait for the element to be visible
          .click({ force: true });

        cy.wait('@previewDoc', { timeout: 57000 }).then((interception) => {
          // Assert the response status code
          expect(interception.response.statusCode).to.eq(200);
          cy.wait(1500);
        });

        //Close document preview dialog
        cy.get(
          ':nth-child(7) > .dialog > .dialog__inner > .dialog__close-button'
        ).click();
      });
      cy.wait(2000);
    });

    // Switch to history table and download the PDF
    cy.get('.header__navigation-menu>li>a')
      .contains(/Auftragsliste|Auftragsliste/)
      .click();
    cy.wait(2000);

    cy.get(
      '.deliveries-list-table>tp-table>.table>.table__container>table>tbody>tr'
    )
      .eq(0)
      .click();
    cy.wait(1500);
    cy.get('.download-container > p > .desktop').first().click({ force: true });
    cy.wait(2000);
    // Get the latest downloaded PDF file
    // const downloadsDir = `${Cypress.config(
    //   'fileServerFolder'
    // )}/cypress/downloads/`;
    // console.log('downloadsDir', downloadsDir);

    // cy.task(
    //   'getDownloadedPdf',
    //   'C:/Users/mubavin/Cypress/EG/cypress-automatison-framework/cypress/downloads'
    // ).then((filePath) => {
    //   expect(filePath).to.not.be.null; // Assert the file exists
    //   cy.log(`Latest PDF File Path: ${filePath}`);
    //   cy.wait(3000);
    //   // Read the PDF content and open in the same tab using a Blob
    //   cy.readFile(filePath, 'binary').then((pdfBinary) => {
    //     const pdfBlob = Cypress.Blob.binaryStringToBlob(
    //       pdfBinary,
    //       'application/pdf'
    //     );
    //     const pdfUrl = URL.createObjectURL(pdfBlob);

    //     // Open the PDF in the same tab
    //     cy.window().then((win) => {
    //       win.location.href = pdfUrl; // Loads the PDF in the same window
    //     });
    //   });
    // });
    // cy.wait(3500);

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

  //********************NEW EinfachBrief*************************************** */
  //Login to einfachBrief and check welcome pdf
  it.skip('Login to einfachBrief and check welcome pdf', () => {
    cy.visit(Cypress.env('tagesBaseUrl'));
    cy.url().should('include', Cypress.env('tagesBaseUrl'));

    cy.wait(1500);

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

    // Log in to the sw
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
  //**************************END*********************************************** */

  //Login to einfachBrief using keycloack and check welcome pdf
  it.skip(' Login to einfachBrief using keycloack and check welcome pdf', () => {
    cy.visit(Cypress.env('tagesBaseUrl'));
    cy.url().should('include', Cypress.env('tagesBaseUrl'));

    cy.wait(1500);

    // Remove Cookie dialog (if shown)
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      } else {
        cy.log('Cookie bar not visible');
      }
    });
    cy.wait(1500);

    //  Login keycloack
    cy.get('tp-input[formcontrolname="username"]').type(
      Cypress.env('email_supportViewAdmin')
    );
    cy.get('tp-input[formcontrolname="password"]').type(
      Cypress.env('password_supportViewAdmin')
    );
    cy.get('button[type="button"]')
      .contains(/Login keycloack|Login keycloack/)
      .click();

    cy.wait(1500);

    //Switch to Sign in to your account on PBS
    cy.get('#username').type(Cypress.env('email_supportViewAdmin'));

    cy.get('#password').type(Cypress.env('password_supportViewAdmin'));
    cy.get('button[aria-label="Show password"]').click();
    cy.wait(1500);

    //Click on Login button
    cy.get('#kc-login').click();
    cy.wait(3500);

    // Switch to Shopping Card table
    cy.get('.header__navigation-menu>li>a').then(($links) => {
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
          cy.get('.header__navigation-menu>li>a').eq(index).click();
        }
        cy.wait(2000);
      });
      //Open latest received item
      cy.get('.table__container>table>tbody>tr>td').then(($cells) => {
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
          cy.get('.table__container>table>tbody>tr>td').eq(targetIndex).click();
        }
        cy.wait(1500);

        //Open/Preview selected document
        cy.intercept('POST', '**/getDocumentPreview*').as('previewDoc');

        cy.get(
          '.open > .accordion-container > .table-wrapper > tp-table > .table > .table__container > table > tbody > .table__row>td>.icon-magnify'
        )
          .should('be.visible') // Wait for the element to be visible
          .click({ force: true });

        cy.wait('@previewDoc', { timeout: 57000 }).then((interception) => {
          // Assert the response status code
          expect(interception.response.statusCode).to.eq(200);
          cy.wait(1500);
        });

        //Close document preview dialog
        cy.get(
          ':nth-child(7) > .dialog > .dialog__inner > .dialog__close-button'
        ).click();
      });
      cy.wait(2000);
    });

    // Switch to history table and download the PDF
    cy.get('.header__navigation-menu>li>a')
      .contains(/Auftragsliste|Auftragsliste/)
      .click();
    cy.wait(2000);

    cy.get(
      '.deliveries-list-table>tp-table>.table>.table__container>table>tbody>tr'
    )
      .eq(0)
      .click();
    cy.wait(1500);
    cy.get('.download-container > p > .desktop').first().click({ force: true });
    cy.wait(2000);
    // Get the latest downloaded PDF file
    // const downloadsDir = `${Cypress.config(
    //   'fileServerFolder'
    // )}/cypress/downloads/`;
    // console.log('downloadsDir', downloadsDir);

    // cy.task(
    //   'getDownloadedPdf',
    //   'C:/Users/mubavin/Cypress/EG/cypress-automatison-framework/cypress/downloads'
    // ).then((filePath) => {
    //   expect(filePath).to.not.be.null; // Assert the file exists
    //   cy.log(`Latest PDF File Path: ${filePath}`);
    //   cy.wait(3000);
    //   // Read the PDF content and open in the same tab using a Blob
    //   cy.readFile(filePath, 'binary').then((pdfBinary) => {
    //     const pdfBlob = Cypress.Blob.binaryStringToBlob(
    //       pdfBinary,
    //       'application/pdf'
    //     );
    //     const pdfUrl = URL.createObjectURL(pdfBlob);

    //     // Open the PDF in the same tab
    //     cy.window().then((win) => {
    //       win.location.href = pdfUrl; // Loads the PDF in the same window
    //     });
    //   });
    // });
    // cy.wait(3500);

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
