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

    // === Validate Header Links ===
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

    cy.pause();

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

  // Ignore 3rd-party script errors
  Cypress.on('uncaught:exception', (err) => {
    if (
      err.message.includes('postMessage') ||
      err.message.includes('ResizeObserver')
    ) {
      return false; // prevent Cypress from failing test
    }
  });

  //Login to einfachBrief
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
    cy.scrollTo('top', { duration: 200 }); // smooth scroll
    cy.wait(2500);
    //Click on Submit button
    cy.get('button[type="submit"]').click({ force: true });
    cy.wait(1500);

    //******************MENU************** */

    // Get expected HeaderMenuButtons from env
    const expectedHeaderMenuButtons = Cypress.env('menuLinks');

    // Extract and validate header menu buttons
    cy.get('.css-oq1557>button').then(($links) => {
      const uiLinks = [...$links].map((el) => el.innerText.trim());

      // Validate that all expected links are present
      expectedHeaderMenuButtons.forEach((expectedLink) => {
        expect(uiLinks).to.include(expectedLink);
      });

      const totalHeaderMenuButtons = $links.length;
      cy.log(`Found ${totalHeaderMenuButtons} Header Menu Links`);

      // Iterate through all links EXCEPT the first one (index 0)
      Cypress._.times(totalHeaderMenuButtons - 1, (i) => {
        const index = i + 1; // skip the first link (Home)

        cy.get('.css-oq1557>button')
          .eq(index)
          .then(($link) => {
            const linkText = $link.text().trim();
            cy.log(`Clicking on: ${linkText}`);

            // Click link
            cy.wrap($link)
              .invoke('removeAttr', 'target') // uncomment if link opens new tab
              .click({ force: true });

            // Wait for navigation and verify URL changed
            cy.url().should('not.eq', Cypress.config().baseUrl);
            cy.log(`Navigated to: ${linkText}`);

            cy.wait(1000);

            // Go back to the homepage
            cy.go('back');
            cy.wait(1000);
          });
      });
    });

    // Click on Sendungen/Weiterführende Links
    cy.get('.css-10ujcm8>.css-pzjog8').then(($links) => {
      const uiLinks = [...$links].map((el) => el.innerText.trim());
      const totalNavigationButtons = $links.length;
      cy.log(`Found ${totalNavigationButtons} Header Menu Links`);

      // Iterate through all links all elements
      Cypress._.times(totalNavigationButtons, (i) => {
        const index = i;

        cy.get('.css-10ujcm8>.css-pzjog8')
          .eq(index)
          .then(($link) => {
            const linkText = $link.text().trim();
            cy.log(`Clicking on: ${linkText}`);

            // Click link
            cy.wrap($link)
              .invoke('removeAttr', 'target') // uncomment if link opens new tab
              .click({ force: true });

            // Wait for navigation and verify URL changed
            cy.url().should('not.eq', Cypress.config().baseUrl);
            cy.log(`Navigated to: ${linkText}`);

            cy.wait(1000);

            // Go back to the homepage
            cy.go('back');
            cy.wait(1000);
          });
      });
    });

    cy.wait(2000);

    //Scroll down
    cy.scrollTo('bottom', { duration: 200 }); // smooth scroll
    cy.wait(1500);

    // Get expected titles from cypress.cofig.js (env)
    const expectedTitles = Cypress.env('solutionsTitle');
    //cy.log('UI Titles:');

    // Extract UI titles
    cy.get('.css-1opaxxg>article>div>h3').then(($titles) => {
      const uiTitles = [...$titles].map((el) => el.innerText.trim());
      cy.log('UI Titles:', uiTitles);
      cy.log('Expected Titles:', expectedTitles);

      //Compare UI (Read) Titles and Titles from env

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

    // Extract UI Links
    cy.get('.css-1opaxxg>article>div>div>a').then(($Links) => {
      const uiLinks = [...$Links].map((el) => el.innerText.trim());

      expectedLinks.forEach((expectedLink) => {
        expect(uiLinks).to.include(expectedLink);
      });

      //Get total number of clicable SolutionsLinks
      cy.get('.css-1opaxxg>article>div>div>a').then(($links) => {
        const totalSolutionsLinks = $links.length;
        cy.log(`Found ${totalSolutionsLinks} SolutionsLinks`);

        // Iterate through SolutionsLinks one by one
        Cypress._.times(totalSolutionsLinks, (i) => {
          cy.get('.css-1opaxxg>article>div>div>a')
            .eq(i)
            .then(($link) => {
              const href = $link.prop('href');
              const text = $link.text().trim();

              //Skipping link if missing href
              if (!href) {
                cy.log(`Skipping link ${i + 1}: missing href`);
                return;
              }

              cy.log(
                `[${i + 1}/${totalSolutionsLinks}] Checking: ${text} → ${href}`
              );

              // Click link
              cy.wrap($link)
                .invoke('removeAttr', 'target') // open in same tab
                .click({ force: true });

              // Wait for navigation and log URL
              cy.url().then((newUrl) => {
                cy.log(`Navigated to: ${newUrl}`);
              });

              cy.wait(1500);

              // Navigate back and wait for homepage to reload
              cy.go('back');
              cy.wait(1500);
            });
        });
      });
    });

    //Footer

    cy.log('--- Validate Footer Links ---');
    // Get total clickable footer links
    cy.get('.css-cylfbu > li > a').then(($links) => {
      const totalFooterLinks = $links.length;
      cy.log(`Found ${totalFooterLinks} footer links`);

      // Iterate through footer links one by one
      Cypress._.times(totalFooterLinks, (i) => {
        cy.get('.css-cylfbu > li > a')
          .eq(i)
          .then(($link) => {
            const href = $link.prop('href');
            const text = $link.text().trim();

            //Skipping link if missing href
            if (!href) {
              cy.log(`Skipping link ${i + 1}: missing href`);
              return;
            }

            cy.log(
              `[${i + 1}/${totalFooterLinks}] Checking: ${text} → ${href}`
            );

            // Click link
            cy.wrap($link)
              .invoke('removeAttr', 'target') // open in same tab
              .click({ force: true });

            // Wait for navigation and log URL
            cy.url().then((newUrl) => {
              cy.log(`Navigated to: ${newUrl}`);
            });

            cy.wait(1500);

            // Navigate back and wait for homepage to reload
            cy.go('back');
            cy.wait(1500);
          });
      });
    });
    cy.wait(2500);

    // Logout from Einfachbrief
    cy.get('.css-17oe9x3>button').click();
    cy.wait(1500);

    //Click on Logout button
    cy.get('.MuiMenu-list>.MuiMenuItem-root')
      .contains(/Abmelden|Abmelden/i)
      .should('be.visible')
      .click();
    cy.url().should('include', Cypress.env('baseUrl'));
  }); //end it
}); //end describe
