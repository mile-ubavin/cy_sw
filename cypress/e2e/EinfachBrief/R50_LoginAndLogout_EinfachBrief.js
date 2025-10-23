import 'cypress-iframe';
describe('Login and Logout to Einfachbrief', () => {
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

  //NEW

  it('Login to einfachBrief and check welcome PDF content', () => {
    // Visit the base URL of the application
    cy.visit(Cypress.env('baseUrl'));

    // Verify that the current URL contains the expected base URL
    cy.url().should('include', Cypress.env('baseUrl'));

    // Check if the cookie banner is visible and accept it if so
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        // Click on "Accept Cookies" button
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
        cy.log('Cookie banner accepted');
      } else {
        // Log info if cookie banner is not displayed
        cy.log('Cookie banner not visible');
      }
    });

    //Login to Einfachbrief
    // Enter username from Cypress environment variables
    cy.get('#username').type(Cypress.env('username_stundung'));

    // Enter password from Cypress environment variables
    cy.get('#password').type(Cypress.env('password_stundung'));

    // Click on the show/hide password button (optional UI action)
    cy.get('button>.css-j5bxbw').click();

    // Scroll to the top of the login page
    cy.scrollTo('top', { duration: 500 });
    cy.wait(2500);

    // Click the submit button to log in
    cy.get('button[type="submit"]').click({ force: true });
    cy.wait(2500);

    //Validate Solutions heading
    cy.get('#solutions-heading').should(
      'include.text',
      'Entdecken Sie auch unsere anderen Lösungen'
    );

    // === Validate Header Titles ===
    // Load expected header titles from a Cypress task
    cy.task('readHeaderLinks').then((expectedTitles) => {
      // Compare each visible header title with the expected one
      cy.get('.css-oq1557')
        .should('have.length', expectedTitles.length)
        .each(($el, i) => {
          // Assert the text content of each header item
          cy.wrap($el).should('have.text', expectedTitles[i]);
        });
    });

    // Smooth scroll to bottom to ensure all elements are visible
    cy.scrollTo('bottom', { duration: 800 });

    // Short wait to allow bottom content (solutions) to render
    cy.wait(1000);

    // === Helper Function to Validate Section Content ===
    const validateSection = (selector, envKey, label) => {
      // Read expected values from Cypress environment variables
      const expectedValues = Cypress.env(envKey);

      // Extract UI text content and compare with expected values
      cy.get(selector).then(($elements) => {
        // Map all found elements to trimmed text values
        const uiValues = [...$elements].map((el) => el.innerText.trim());

        // Log extracted UI values for debugging
        cy.log(`${label} (UI):`, uiValues);
        cy.log(`${label} (Expected):`, expectedValues);

        // Loop through all expected values and verify each one exists in UI
        expectedValues.forEach((expected) => {
          expect(uiValues, `${label} should include '${expected}'`).to.include(
            expected
          );
        });
      });
    };

    // === Validate Solution Titles ===
    validateSection(
      '.css-1opaxxg > article > div > h3',
      'solutionsTitle',
      'Solution Titles'
    );

    // === Validate Solution Descriptions ===
    validateSection(
      '.css-1opaxxg > article > div > p',
      'solutionsTxt',
      'Solution Texts'
    );

    // === Validate Solution Links ===
    validateSection(
      '.css-1opaxxg > article > div > div > a',
      'solutionsLink',
      'Solution Links'
    );

    // Pause test execution for manual verification (optional)
    cy.pause();
  });

  //END NEW

  // ✅ Ignore 3rd-party script errors
  Cypress.on('uncaught:exception', (err) => {
    if (
      err.message.includes('postMessage') ||
      err.message.includes('ResizeObserver')
    ) {
      return false; // prevent Cypress from failing test
    }
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

    //Scroll to the top
    cy.scrollTo('top', { duration: 500 }); // smooth scroll
    cy.wait(2500);
    //Click on Submit button
    cy.get('button[type="submit"]').click({ force: true });
    cy.wait(1500);

    //Scroll down
    cy.scrollTo('bottom', { duration: 500 }); // smooth scroll
    cy.wait(1500);

    //Check Header title
    cy.get('.css-oq1557').each(($el, index) => {});

    // Get expected titles from env
    const expectedTitles = Cypress.env('solutionsTitle');
    cy.log('UI Titles:');

    // Extract UI titles
    cy.get('.css-1opaxxg>article>div>h3').then(($titles) => {
      const uiTitles = [...$titles].map((el) => el.innerText.trim());
      //cy.log('UI Titles:', uiTitles);
      // cy.log('Expected Titles:', expectedTitles);

      expectedTitles.forEach((expectedTitle) => {
        expect(uiTitles).to.include(expectedTitle);
      });
    });

    // Get expected Txt from env
    const expectedTxts = Cypress.env('solutionsTxt');

    // Extract UI titles
    cy.get('.css-1opaxxg>article>div>p').then(($Txt) => {
      const uiTxt = [...$Txt].map((el) => el.innerText.trim());

      expectedTxts.forEach((expectedTxt) => {
        expect(uiTxt).to.include(expectedTxt);
      });
    });
    cy.wait(2500);

    // Get expected Links from env
    const expectedLinks = Cypress.env('solutionsLink');

    // Extract UI titles
    cy.get('.css-1opaxxg>article>div>div>a').then(($Links) => {
      const uiLinks = [...$Links].map((el) => el.innerText.trim());

      expectedLinks.forEach((expectedLink) => {
        expect(uiLinks).to.include(expectedLink);
      });
    });

    // //Footer
    // const footerTitles = Cypress.env('footerTitle');
    // //const footerLinks = Cypress.env('footerLink');

    // // 1. Count the number of solution elements
    // cy.get('.css-cuvpzb').should('have.length', 3);

    // // 2. Validate Footer titles
    // cy.get('.css-cuvpzb').each((el, index) => {
    //   cy.wrap(el).should('have.text', footerTitles[index]);
    // });

    // // Get expected footer links from config
    // const expectedFooterLinks = Cypress.env('footerLink');
    // expect(expectedFooterLinks, 'Expected footerLinks loaded').to.be.an('array')
    //   .and.not.empty;

    // // Extract and validate footer link texts
    // cy.get('.css-cylfbu > li > a') // all anchor tags in footer sections
    //   .then(($links) => {
    //     // Map actual links' text into array
    //     const uiFooter = [...$links].map((el) => el.innerText.trim());
    //     cy.log('UI Footer Links:', uiFooter);
    //     cy.log('Expected Footer Links:', expectedFooterLinks);

    //     // Normalize both expected and actual text before comparison
    //     const normalizedUI = uiFooter.map((t) =>
    //       t.replace(/[:\s]+$/g, '').toLowerCase()
    //     );

    //     expectedFooterLinks.forEach((expected) => {
    //       const cleanExpected = expected.replace(/[:\s]+$/g, '').toLowerCase();
    //       expect(normalizedUI).to.include(cleanExpected);
    //     });
    //   });

    // cy.log('--- Validate Footer Links ---');

    // // Load expected footer links from config
    // const expectedFooterLinks = Cypress.env('footerLink');
    // // expect(expectedFooterLinks, 'Expected footerLinks loaded').to.be.an('array')
    // //   .and.not.empty;

    // // Get all footer link elements
    // cy.get('.css-cylfbu > li > a').then(($links) => {
    //   // Convert NodeList to array of link texts
    //   const uiFooterLinks = [...$links].map((el) => el.innerText.trim());

    //   // Normalize both arrays (ignore case, spaces, trailing colons)
    //   const normalize = (str) => str.replace(/[:\s]+$/g, '').toLowerCase();
    //   const normalizedUI = uiFooterLinks.map(normalize);

    //   // Verify all expected footer link texts are present
    //   expectedFooterLinks.forEach((expected) => {
    //     const cleanExpected = normalize(expected);
    //     expect(normalizedUI, `Footer should contain "${expected}"`).to.include(
    //       cleanExpected
    //     );
    //   });

    //   // Iterate through footer links and verify they are reachable or openable
    //   cy.wrap($links).each(($link, index) => {
    //     const href = $link.prop('href');

    //     if (!href) {
    //       cy.log(`Skipping link ${index + 1}: missing href`);
    //       return;
    //     }

    //     cy.log(`Checking footer link: ${href}`);

    //     // Validate if footer lin is clicable
    //     if (href.startsWith('https')) {
    //       // For internal links — actually click and validate navigation
    //       cy.wrap($link)
    //         .invoke('removeAttr', 'target') // open in same tab
    //         .click({ force: true });

    //       cy.pause();

    //       // Confirm we navigated to correct page
    //       cy.url().should('include', href.split('/').pop());
    //       cy.wait(1000);

    //       // Navigate back to homepage
    //       cy.go('back');
    //     }
    //   });
    // });

    //lats

    cy.log('--- Validate Footer Links ---');

    // Load expected footer links from config
    const expectedFooterLinks = Cypress.env('footerLink');

    // Normalize helper
    const normalize = (str) => str.replace(/[:\s]+$/g, '').toLowerCase();

    // Step 1️⃣: Get total clickable footer links
    cy.get('.css-cylfbu > li > a').then(($links) => {
      const totalLinks = $links.length;
      cy.log(`Found ${totalLinks} footer links`);

      // Step 2️⃣: Validate all expected footer link texts are present
      const uiFooterLinks = [...$links].map((el) => el.innerText.trim());
      const normalizedUI = uiFooterLinks.map(normalize);

      expectedFooterLinks.forEach((expected) => {
        const cleanExpected = normalize(expected);
        expect(normalizedUI, `Footer should contain "${expected}"`).to.include(
          cleanExpected
        );
      });

      // Step 3️⃣: Iterate safely through links one by one
      Cypress._.times(totalLinks, (i) => {
        cy.get('.css-cylfbu > li > a')
          .eq(i)
          .then(($link) => {
            const href = $link.prop('href');
            const text = $link.text().trim();

            if (!href) {
              cy.log(`⚠️ Skipping link ${i + 1}: missing href`);
              return;
            }

            cy.log(`🔗 [${i + 1}/${totalLinks}] Checking: ${text} → ${href}`);

            // Click link safely
            cy.wrap($link)
              .invoke('removeAttr', 'target') // open in same tab
              .click({ force: true });

            // Wait for navigation and log URL
            cy.url().then((newUrl) => {
              cy.log(`🌐 Navigated to: ${newUrl}`);
            });

            cy.wait(1500);

            // Navigate back and wait for homepage to reload
            cy.go('back');
            cy.wait(1500);

            // Verify we’re back on homepage
            // cy.url().should('include', '/');
          });
      });
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
