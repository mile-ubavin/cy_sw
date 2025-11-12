describe('Handling ECO + Registered Deliveries for Non-AT and AT Receivers', () => {
  //Handling ECO + Registered Delivery -> Non-AT Receivers
  it('Handling ECO + Registered Delivery Non-AT Receivers', () => {
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

    //Click on New Delivery
    cy.get('.css-10la1oh')
      .should('be.visible')
      .contains(/Neue Sendung|Neue Sendung/i)
      .click();

    //Check title under action buttons ()
    cy.get('.css-o8itw1>h1').should(
      'have.text',
      'Wählen Sie Ihre Versandoption'
    );

    //Select Einzelbrief
    cy.get('.css-l7ltsz')
      .should('be.visible')
      .contains(/Einzelbrief|Einzelbrief/i)
      .click();

    //Validate showing border, after selecting Einzelbrief
    cy.contains('.css-v55ta1', 'Einzelbrief') // Find element with class and containing text
      .should('have.css', 'border') // Assert it has a border property
      .then((border) => cy.log('Border is visible:', border)); // Log border value

    //Select Einzelbrief
    cy.get('.css-l7ltsz')
      .should('be.visible')
      .contains(/Einzelbrief|Einzelbrief/i)
      .click();

    //Validate Bitte wählen Sie sub-title

    // Get expected HeaderMenuButtons from env
    const BitteWählenSieTitles = Cypress.env('BitteWählenSieH2');

    // Validate main header title
    cy.get('.css-1x7m8ff>.css-0 > h1').should('have.text', 'Bitte wählen Sie');

    // Extract and validate header menu buttons

    // Get all <h2> elements and validate them
    cy.get('.css-11mknlo > div > h2')
      // Assert that we have at least as many headers as expected
      .should('have.length.at.least', BitteWählenSieTitles.length)
      // Use Cypress .each() to collect all UI titles without using jQuery
      .then((elements) => {
        const uiSubTitles = [];

        // Iterate through all matched <h2> elements
        elements.each((index, el) => {
          uiSubTitles.push(el.innerText.trim());
        });

        // Log collected titles for debugging
        cy.log('Found header menu titles:', JSON.stringify(uiSubTitles));

        // Validate each expected title exists in the collected UI titles
        BitteWählenSieTitles.forEach((expectedSubTitle) => {
          expect(
            uiSubTitles,
            `Expected to find "${expectedSubTitle}" in UI titles`
          ).to.include(expectedSubTitle);
        });
      });

    // --- Define options ---
    const layoutOptions = ['Einseitig', 'Beidseitig'];
    const druckOptions = ['Schwarz & Weiss', 'Farbe'];
    const versandBriefText = 'Brief';
    const einschrText = 'Einschreiben';
    const ebriefText = 'E-Brief';

    // --- Handle Layout, Druck, Versandart (radio groups) ---
    cy.get('.css-1xtx7t2>span>span').then((elements) => {
      const spans = Array.from(elements);

      // Helper: find matching indices by text
      const findIndices = (texts) => {
        const lowerTexts = texts.map((t) => t.toLowerCase());
        return spans
          .map((el, i) => ({
            i,
            text: el.textContent.trim().toLowerCase(),
          }))
          .filter(({ text }) => lowerTexts.includes(text))
          .map(({ i }) => i);
      };

      // Helper: random select and assert checked
      const pickRandomAndCheck = (indices, groupName) => {
        if (indices.length === 0)
          throw new Error(`${groupName} options not found`);
        const randomIndex = indices[Math.floor(Math.random() * indices.length)];
        const el = spans[randomIndex];
        cy.wrap(el).scrollIntoView().click({ force: true });
        cy.wrap(el.closest('label'))
          .find('input[type="radio"]')
          .should('be.checked');
        cy.log(`Selected ${groupName}: ${el.textContent.trim()}`);
      };

      // Randomly select Layout & Druck
      pickRandomAndCheck(findIndices(layoutOptions), 'Layout');
      pickRandomAndCheck(findIndices(druckOptions), 'Druck');

      // Always select Versandart "Brief"
      const briefEl = spans.find(
        (el) =>
          el.textContent.trim().toLowerCase() === versandBriefText.toLowerCase()
      );
      if (!briefEl) throw new Error('"Brief" label not found');
      cy.wrap(briefEl).scrollIntoView().click({ force: true });
      cy.wrap(briefEl.closest('label'))
        .find('input[type="radio"]')
        .should('be.checked');
      cy.log(`Selected Versandart: ${briefEl.textContent.trim()}`);
    });

    // --- Handle Zusatzleistungen checkboxes ---
    cy.get('.css-12jae1f').then(($container) => {
      // Ensure "Einschreiben" is checked
      cy.wrap($container)
        .contains('span', einschrText, { matchCase: false })
        .then(($span) => {
          const label = $span[0].closest('label');
          const checkbox = label?.querySelector('input[type="checkbox"]');
          if (!checkbox) throw new Error('"Einschreiben" checkbox not found');

          if (!checkbox.checked) {
            cy.wrap(label).scrollIntoView().click({ force: true });
            cy.log('Checked "Einschreiben"');
          }
          cy.wrap(checkbox).should('be.checked');
        });

      // Ensure "E-Brief" is unchecked
      cy.wrap($container)
        .contains('span', ebriefText, { matchCase: false })
        .then(($span) => {
          const label = $span[0].closest('label');
          const checkbox = label?.querySelector('input[type="checkbox"]');
          if (!checkbox) throw new Error('"E-Brief" checkbox not found');

          if (checkbox.checked) {
            cy.wrap(label).scrollIntoView().click({ force: true });
            cy.log('Unchecked "E-Brief"');
          }
          cy.wrap(checkbox).should('not.be.checked');
        });
    });

    //Expand accordion
    cy.get('.MuiAccordionSummary-content>.css-as7zsj')
      .should('be.visible')
      .should('have.text', 'Weiterführende Informationen')
      .contains(/Weiterführende Informationen|Weiterführende Informationen/i)
      .click();

    //validate txt inside accordion

    cy.wait(2000);

    //Click on wizzard next button
    cy.get('#wizzard-next').click();
    cy.wait(1000);
    cy.uploadRegisterNonAT();
    cy.wait(1000);
    cy.log('File uploaded');

    cy.wait(3500);

    //validatePDF
    // --- Validate PDF upload ---
    cy.intercept('POST', '**/validatePdf').as('validatePdfRequest');
    cy.intercept('GET', '**/getShoppingChart').as('getShoppingCart');

    // Click on "Weiter" button
    cy.get('#wizzard-next>.css-1am57kc')
      .should('be.visible')
      .contains(/Weiter/i)
      .click();

    // --- Wait and validate /validatePdf request ---
    cy.wait('@validatePdfRequest', { timeout: 15000 }).then(
      ({ request, response }) => {
        expect(response.statusCode).to.eq(200);

        const payload = request.body;
        cy.log('--- validatePdf payload check ---');
        Cypress.config('log', false);

        expect(payload.postalPriority, 'postalPriority').to.eq('ECO');
        expect(payload.registeredMail, 'registeredMail').to.be.true;
        expect(payload.shipmentType, 'shipmentType').to.eq('Einzelbrief');
        expect(payload.mainDocumentPayload[0].name, 'file name').to.eq(
          'Register-NonAT.pdf'
        );

        Cypress.config('log', true);
        cy.log('validatePdf payload validation successful');
      }
    );

    // --- Wait and validate /getShoppingChart response ---
    cy.wait('@getShoppingCart', { timeout: 15000 }).then(({ response }) => {
      expect(response.statusCode).to.eq(200);
    });

    //Validate Shopping Cart page title
    cy.get('.css-i2aehn> h1')
      .should('be.visible')
      .and(($h1) => {
        const text = $h1.text().trim();
        expect(text).to.match(/Zusammenfassung/i);
      });

    cy.get('tbody>tr>td>.css-ke8v56>label>span>input').then(($Before) => {
      // const totalDeliveriesBefore;

      const totalDeliveriesBefore = $Before.length;
      cy.log(`Initial count: ${totalDeliveriesBefore}`);

      cy.wait(1500);
      // Click to expand details for first row
      cy.get('table>tbody>tr').first().click({ force: true });

      // Validate expanded error/status message
      cy.get('td[colspan="11"]>div>table>tbody>tr>td')
        .eq(8)
        .should('be.visible')
        .should(
          'have.text',
          'Auslands-Einschreiben ist nur mit der Versandart "Premium Brief" möglich.'
        );

      cy.log('Versandart and status validation successful');
      cy.wait(1500);

      //Edit delivery - based on shoping cart
      cy.get('table>tbody>tr>td>.css-tjchwd>span>.css-1i5bjpc>svg>path')
        .eq(0)
        .should('be.visible')
        .click({ force: true });
      cy.wait(2000);

      //click on Versand input
      cy.get('.css-db8fth>.css-3aalzm>.css-e20rve>div>div[role="combobox"]')
        .eq(0)
        .click();
      cy.wait(2500);

      //Change ECO to PRIO
      cy.get('ul[role="listbox"]>li[data-value="PRIO"]').click();

      //Save Changes - Finalize Edit Delivery
      cy.intercept('POST', '**/editShoppingCart').as('editShoppingCart');
      cy.get('button>.css-1am57kc').contains('Übernehmen').click();

      // --- Wait and validate /editShoppingCart request ---
      cy.wait('@editShoppingCart', { timeout: 15000 }).then(({ response }) => {
        expect(response.statusCode).to.eq(200);
      });
      cy.wait(2000);
      // Validate expanded error/status message
      cy.get('td[colspan="11"]>div>table>tbody>tr>td')
        .eq(8)
        .should('be.visible')
        .should('have.text', 'Sendung versandbereit');

      // Close expand details for first delivey
      cy.get('table>tbody>tr').first().click({ force: true });
      cy.wait(2000);

      // Delete latest uploaded delivery
      cy.get('.css-tjchwd>svg>svg')
        .first()
        .should('be.visible')
        .click({ force: true });
      cy.wait(2500);

      //Get total number of deliveries after deletion
      cy.get('tbody>tr>td>.css-ke8v56>label>span>input').then(($itemsAfter) => {
        const totalDeliveriesAfterDeletion = $itemsAfter.length;
        cy.log(`totalDeliveriesAfterDeletion: ${totalDeliveriesAfterDeletion}`);

        //Validate total number of deliveries before and after deletion
        expect(totalDeliveriesBefore - 1).to.eq(totalDeliveriesAfterDeletion);
      }); //end then before
    }); //end before
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

  //Handling ECO + Registered Delivery -> AT Receivers
  it('Handling ECO + Registered Delivery AT Receivers', () => {
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

    //Click on New Delivery
    cy.get('.css-10la1oh')
      .should('be.visible')
      .contains(/Neue Sendung|Neue Sendung/i)
      .click();

    //Check title under action buttons ()
    cy.get('.css-o8itw1>h1').should(
      'have.text',
      'Wählen Sie Ihre Versandoption'
    );

    //Select Einzelbrief
    cy.get('.css-l7ltsz')
      .should('be.visible')
      .contains(/Einzelbrief|Einzelbrief/i)
      .click();

    //Validate showing border, after selecting Einzelbrief
    cy.contains('.css-v55ta1', 'Einzelbrief') // Find element with class and containing text
      .should('have.css', 'border') // Assert it has a border property
      .then((border) => cy.log('Border is visible:', border)); // Log border value

    //Select Einzelbrief
    cy.get('.css-l7ltsz')
      .should('be.visible')
      .contains(/Einzelbrief|Einzelbrief/i)
      .click();

    //Validate Bitte wählen Sie sub-title

    // Get expected HeaderMenuButtons from env
    const BitteWählenSieTitles = Cypress.env('BitteWählenSieH2');

    // Validate main header title
    cy.get('.css-1x7m8ff>.css-0 > h1').should('have.text', 'Bitte wählen Sie');

    // Extract and validate header menu buttons

    // Get all <h2> elements and validate them
    cy.get('.css-11mknlo > div > h2')
      // Assert that we have at least as many headers as expected
      .should('have.length.at.least', BitteWählenSieTitles.length)
      // Use Cypress .each() to collect all UI titles without using jQuery
      .then((elements) => {
        const uiSubTitles = [];

        // Iterate through all matched <h2> elements
        elements.each((index, el) => {
          uiSubTitles.push(el.innerText.trim());
        });

        // Log collected titles for debugging
        cy.log('Found header menu titles:', JSON.stringify(uiSubTitles));

        // Validate each expected title exists in the collected UI titles
        BitteWählenSieTitles.forEach((expectedSubTitle) => {
          expect(
            uiSubTitles,
            `Expected to find "${expectedSubTitle}" in UI titles`
          ).to.include(expectedSubTitle);
        });
      });

    // --- Define options ---
    const layoutOptions = ['Einseitig', 'Beidseitig'];
    const druckOptions = ['Schwarz & Weiss', 'Farbe'];
    const versandBriefText = 'Brief';
    const einschrText = 'Einschreiben';
    const ebriefText = 'E-Brief';

    // --- Handle Layout, Druck, Versandart (radio groups) ---
    cy.get('.css-1xtx7t2>span>span').then((elements) => {
      const spans = Array.from(elements);

      // Helper: find matching indices by text
      const findIndices = (texts) => {
        const lowerTexts = texts.map((t) => t.toLowerCase());
        return spans
          .map((el, i) => ({
            i,
            text: el.textContent.trim().toLowerCase(),
          }))
          .filter(({ text }) => lowerTexts.includes(text))
          .map(({ i }) => i);
      };

      // Helper: random select and assert checked
      const pickRandomAndCheck = (indices, groupName) => {
        if (indices.length === 0)
          throw new Error(`${groupName} options not found`);
        const randomIndex = indices[Math.floor(Math.random() * indices.length)];
        const el = spans[randomIndex];
        cy.wrap(el).scrollIntoView().click({ force: true });
        cy.wrap(el.closest('label'))
          .find('input[type="radio"]')
          .should('be.checked');
        cy.log(`Selected ${groupName}: ${el.textContent.trim()}`);
      };

      // Randomly select Layout & Druck
      pickRandomAndCheck(findIndices(layoutOptions), 'Layout');
      pickRandomAndCheck(findIndices(druckOptions), 'Druck');

      // Always select Versandart "Brief"
      const briefEl = spans.find(
        (el) =>
          el.textContent.trim().toLowerCase() === versandBriefText.toLowerCase()
      );
      if (!briefEl) throw new Error('"Brief" label not found');
      cy.wrap(briefEl).scrollIntoView().click({ force: true });
      cy.wrap(briefEl.closest('label'))
        .find('input[type="radio"]')
        .should('be.checked');
      cy.log(`Selected Versandart: ${briefEl.textContent.trim()}`);
    });

    // --- Handle Zusatzleistungen checkboxes ---
    cy.get('.css-12jae1f').then(($container) => {
      // Ensure "Einschreiben" is checked
      cy.wrap($container)
        .contains('span', einschrText, { matchCase: false })
        .then(($span) => {
          const label = $span[0].closest('label');
          const checkbox = label?.querySelector('input[type="checkbox"]');
          if (!checkbox) throw new Error('"Einschreiben" checkbox not found');

          if (!checkbox.checked) {
            cy.wrap(label).scrollIntoView().click({ force: true });
            cy.log('Checked "Einschreiben"');
          }
          cy.wrap(checkbox).should('be.checked');
        });

      // Ensure "E-Brief" is unchecked
      cy.wrap($container)
        .contains('span', ebriefText, { matchCase: false })
        .then(($span) => {
          const label = $span[0].closest('label');
          const checkbox = label?.querySelector('input[type="checkbox"]');
          if (!checkbox) throw new Error('"E-Brief" checkbox not found');

          if (checkbox.checked) {
            cy.wrap(label).scrollIntoView().click({ force: true });
            cy.log('Unchecked "E-Brief"');
          }
          cy.wrap(checkbox).should('not.be.checked');
        });
    });

    //Expand accordion
    cy.get('.MuiAccordionSummary-content>.css-as7zsj')
      .should('be.visible')
      .should('have.text', 'Weiterführende Informationen')
      .contains(/Weiterführende Informationen|Weiterführende Informationen/i)
      .click();

    //validate txt inside accordion

    cy.wait(2000);

    //Click on wizzard next button
    cy.get('#wizzard-next').click();
    cy.wait(1000);

    //---------insert Register+At
    cy.uploadRegisterAT();
    cy.wait(1000);
    cy.log('File uploaded');
    cy.wait(3500);

    //validatePDF
    // --- Validate PDF upload ---
    cy.intercept('POST', '**/validatePdf').as('validatePdfRequest');
    cy.intercept('GET', '**/getShoppingChart').as('getShoppingCart');

    // Click on "Weiter" button
    cy.get('#wizzard-next>.css-1am57kc')
      .should('be.visible')
      .contains(/Weiter/i)
      .click();

    // --- Wait and validate /validatePdf request ---
    cy.wait('@validatePdfRequest', { timeout: 15000 }).then(
      ({ request, response }) => {
        expect(response.statusCode).to.eq(200);

        const payload = request.body;
        cy.log('--- validatePdf payload check ---');
        Cypress.config('log', false);

        expect(payload.postalPriority, 'postalPriority').to.eq('ECO');
        expect(payload.registeredMail, 'registeredMail').to.be.true;
        expect(payload.shipmentType, 'shipmentType').to.eq('Einzelbrief');
        expect(payload.mainDocumentPayload[0].name, 'file name').to.eq(
          'Register-AT.pdf'
        );

        Cypress.config('log', true);
        cy.log('validatePdf payload validation successful');
      }
    );

    // --- Wait and validate /getShoppingChart response ---
    cy.wait('@getShoppingCart', { timeout: 15000 }).then(({ response }) => {
      expect(response.statusCode).to.eq(200);
    });

    //Validate Shopping Cart page title
    cy.get('.css-i2aehn> h1')
      .should('be.visible')
      .and(($h1) => {
        const text = $h1.text().trim();
        expect(text).to.match(/Zusammenfassung/i);
      });

    cy.get('tbody>tr>td>.css-ke8v56>label>span>input').then(($Before) => {
      // const totalDeliveriesBefore;

      const totalDeliveriesBefore = $Before.length;
      cy.log(`Initial count: ${totalDeliveriesBefore}`);

      cy.wait(1500);
      // Click to expand details for first row
      cy.get('table>tbody>tr').first().click({ force: true });

      // Validate expanded error/status message
      cy.get('td[colspan="11"]>div>table>tbody>tr>td')
        .eq(8)
        .should('be.visible')
        .should('have.text', 'Sendung versandbereit');

      cy.log('Versandart and status validation successful');
      cy.wait(1500);

      // Close expand details for first delivey
      cy.get('table>tbody>tr').first().click({ force: true });
      cy.wait(2000);

      // Delete latest uploaded delivery
      cy.get('.css-tjchwd>svg>svg')
        .first()
        .should('be.visible')
        .click({ force: true });
      cy.wait(2500);

      //Get total number of deliveries after deletion
      cy.get('tbody>tr>td>.css-ke8v56>label>span>input').then(($itemsAfter) => {
        const totalDeliveriesAfterDeletion = $itemsAfter.length;
        cy.log(`totalDeliveriesAfterDeletion: ${totalDeliveriesAfterDeletion}`);

        //Validate total number of deliveries before and after deletion
        expect(totalDeliveriesBefore - 1).to.eq(totalDeliveriesAfterDeletion);
      }); //end then before
    }); //end before
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
