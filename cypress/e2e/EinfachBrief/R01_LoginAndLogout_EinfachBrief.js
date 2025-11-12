import 'cypress-iframe';
describe('Login check Home page and Logout to Einfachbrief', () => {
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
  it('Login to einfachBrief and check welcome pdf', () => {
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
    cy.wait(1500);
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
            cy.wrap($link).invoke('css', 'border', '2px solid black').wait(500);
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

    //Validate Solutions heading
    cy.get('#solutions-heading').should(
      'include.text',
      'Entdecken Sie auch unsere anderen Lösungen'
    );

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
          cy.scrollTo('bottom', { duration: 200 }); // smooth scroll
          cy.wait(500);
        });
      });
    });

    // cy.log('--- Validate Social Network Links ---');
    // //Footer social networks
    // // Get total clickable footer links
    // cy.get('.css-xqyz66>.css-12z0wuy>a').then(($links) => {
    //   const totalSocialNetworks = $links.length;
    //   cy.log(`Found ${totalSocialNetworks} footer links`);

    //   // Iterate through footer links one by one
    //   Cypress._.times(totalSocialNetworks, (i) => {
    //     cy.get('.css-xqyz66>.css-12z0wuy>a')
    //       .eq(i)
    //       .then(($icon) => {
    //         cy.wrap($icon).invoke('css', 'border', '2px solid white').wait(500);

    //         // Click on social networks icon
    //         cy.wrap($icon)
    //           .invoke('removeAttr', 'target') // open in same tab
    //           .click({ force: true });

    //         // Wait for navigation and log URL
    //         cy.url().then((newUrl) => {
    //           cy.log(`Navigated to: ${newUrl}`);
    //         });

    //         cy.wait(1500);

    //         // Navigate back and wait for homepage to reload
    //         cy.go('back');
    //         cy.wait(1500);
    //       });
    //     //Scroll down
    //     cy.scrollTo('bottom', { duration: 200 }); // smooth scroll
    //     cy.wait(500);
    //   });
    // });
    cy.wait(2500);

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

            cy.wrap($link).invoke('css', 'border', '2px solid white').wait(500);

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
        //Scroll down
        cy.scrollTo('bottom', { duration: 200 }); // smooth scroll
        cy.wait(500);
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
