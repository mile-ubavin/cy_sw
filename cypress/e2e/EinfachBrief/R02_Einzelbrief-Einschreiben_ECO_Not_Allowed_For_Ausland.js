describe('Einzelbrief: Handling ECO + Registered Deliveries for Non-AT and AT Receivers', () => {
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

    cy.wait(2000);
    //Check title under action buttons ()
    //cy.get('.css-o8itw1>h1').should(
    cy.get(
      'div[aria-label="stepper"]>div:last-of-type>div:first-of-type>section>h1'
    ).should('have.text', 'Wählen Sie Ihre Versandoption');

    // List of available options:
    // deliveryType = {'Einzelbrief','Serienbrief','Adressierte Werbesendung'};

    const deliveryType = ['Einzelbrief'];

    deliveryType.forEach((option) => {
      cy.get('.css-l7ltsz')
        .should('be.visible')
        .contains(option) // find element by text
        .click({ force: true }); // click it

      cy.wait(1500);
      //Validate showing border, after selecting Einzelbrief
      cy.contains('.css-v55ta1', option) // Find element with class and containing text
        .should('have.css', 'border') // Assert it has a border property
        .then((border) => cy.log('Border is visible:', border)); // Log border value

      // Validate the button text (after selection)
      const expectedButtonText = `Weiter mit ${option}`;

      cy.get('button#wizzard-next') // button element
        .should('be.visible')
        .invoke('text') // get text
        .then((txt) => {
          const buttonText = txt.trim();
          cy.log(`Button text: ${buttonText}`);

          // Validate the button text (after selection)
          expect(buttonText).to.eq(expectedButtonText);
        });
    }); //deliveryType
    cy.wait(2500);

    // List of available options groups:
    // [
    //   {'Einseitig', 'Beidseitig'},
    //   {'Schwarz & Weiss', 'Farbe'},
    //   {'Premium Brief','Brief'},
    //   {'Einschreiben','E-Brief'}
    // ];

    // Desired user selection (one from each group)
    const desiredSelection = [
      'Einseitig',
      'Schwarz & Weiß',
      'Brief',
      'Einschreiben',
    ];

    desiredSelection.forEach((option) => {
      cy.get('div>fieldset>div>div>label>.MuiFormControlLabel-label>span').each(
        ($label) => {
          cy.wrap($label)
            .invoke('text')
            .then((text) => {
              const labelText = text.trim();

              // match your desired option
              if (labelText === option) {
                cy.wrap($label)
                  .closest('label')
                  .find('input')
                  .then(($input) => {
                    // If not checked → click it
                    if (!$input.prop('checked')) {
                      cy.wrap($label).click({ force: true });
                      cy.wait(200);
                      cy.log(`Clicked: ${labelText}`);
                    } else {
                      cy.log(`Skipped (already checked): ${labelText}`);
                    }
                    //optional
                    // VALIDATION #1: label must be from desiredSelection
                    expect(labelText).to.be.oneOf(desiredSelection);
                    // VALIDATION #2: the input must now be checked
                    cy.wrap($input).should('be.checked');
                  });
              }
            });
        }
      );
    });

    //Expand all available Accordions
    const accordions = [
      'Weiterführende Informationen',
      'Voraussetzungen',
      'Rücksendung unzustellbarer Mailings',
    ];

    let lastAccordionSelector = null;

    accordions.forEach((label) => {
      cy.get('body').then(($body) => {
        // Check if accordion with this label exists
        if (
          $body.find(`.MuiAccordionSummary-root:contains("${label}")`).length >
          0
        ) {
          cy.log(`Accordion FOUND: ${label}`);

          // Store the last accordion selector
          lastAccordionSelector = `.MuiAccordionSummary-root:contains("${label}")`;

          // Click the accordion
          cy.contains('.MuiAccordionSummary-root', label)
            .should('be.visible')
            .within(() => {
              cy.get('span>div')
                .invoke('text')
                .then((text) => {
                  const accordionText = text.trim();
                  expect(accordionText).to.eq(label); // Validate text
                });
            })
            .click({ force: true });

          cy.wait(2000);
        } else {
          cy.log(`Accordion NOT FOUND → Skipping: ${label}`);
        }
      });
    });

    // After all accordions, close the last expanded one
    cy.then(() => {
      if (lastAccordionSelector) {
        cy.log(`Closing last expanded accordion: ${lastAccordionSelector}`);
        cy.get(lastAccordionSelector).click({ force: true });
      } else {
        cy.log('No accordion was expanded, skipping closing');
      }
    });

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
          'Register_NonAT.pdf'
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

    //cy.get('tbody>tr>td>.css-ke8v56>label>span>input').then(($Before) => {
    cy.get('span>input[type="checkbox"]').then(($Before) => {
      // const totalDeliveriesBefore;

      //const totalDeliveriesBefore = $Before.length;
      const totalDeliveriesBefore = $Before.length > 0 ? $Before.length - 1 : 0;

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
      // Validate expanded Success message
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
      //   cy.get('tbody>tr>td>.css-ke8v56>label>span>input').then(($itemsAfter) => {
      //     const totalDeliveriesAfterDeletion = $itemsAfter.length;
      //     cy.log(`totalDeliveriesAfterDeletion: ${totalDeliveriesAfterDeletion}`);

      //     //Validate total number of deliveries before and after deletion
      //     expect(totalDeliveriesBefore - 1).to.eq(totalDeliveriesAfterDeletion);
      //   }); //end then before
      // }); //end before

      //Get total number of deliveries after deletion
      cy.get('tbody')
        .should('exist')
        .then(($tbody) => {
          // Find all deliveries inside the Shopping cart
          // These represent the current deliveries in the cart
          const inputs = $tbody.find(
            'tr > td > .css-ke8v56 > label > span > input'
          );
          // Count the number of deliveries after deletion
          const totalDeliveriesAfterDeletion = inputs.length || 0;
          // Log the count after deletiom
          cy.log(
            `Total Deliveries After Deletion the lastone: ${totalDeliveriesAfterDeletion}`
          );
          // If no deliveries remain after deletion
          if (totalDeliveriesAfterDeletion === 0) {
            cy.log('All deliveries deleted, validating count correctly...');
            // Validate that the previous count minus one is still a valid (non-negative) number
            // Using .gte(0) ensures that we handle cases where there was only one delivery initially
            expect(totalDeliveriesBefore - 1).to.be.gte(0);
          } else {
            // If there are still deliveries left, validate that exactly one was deleted
            expect(totalDeliveriesBefore - 1).to.eq(
              totalDeliveriesAfterDeletion
            );
          }
        });
    });
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
  it.only('Handling ECO + Registered Delivery AT Receivers', () => {
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

    cy.wait(2000);

    //Check title under action buttons ()
    // cy.get('.css-o8itw1>h1').should(
    cy.get(
      'div[aria-label="stepper"]>div:last-of-type>div:first-of-type>section>h1'
    ).should('have.text', 'Wählen Sie Ihre Versandoption');

    // List of available options:
    // deliveryType = {'Einzelbrief','Serienbrief','Adressierte Werbesendung'};

    const deliveryType = ['Einzelbrief'];

    deliveryType.forEach((option) => {
      cy.get('.css-l7ltsz')
        .should('be.visible')
        .contains(option) // find element by text
        .click({ force: true }); // click it

      cy.wait(1500);
      //Validate showing border, after selecting Einzelbrief
      cy.contains('.css-v55ta1', option) // Find element with class and containing text
        .should('have.css', 'border') // Assert it has a border property
        .then((border) => cy.log('Border is visible:', border)); // Log border value

      // Validate the button text (after selection)
      const expectedButtonText = `Weiter mit ${option}`;

      cy.get('button#wizzard-next') // button element
        .should('be.visible')
        .invoke('text') // get text
        .then((txt) => {
          const buttonText = txt.trim();
          cy.log(`Button text: ${buttonText}`);

          // Validate the button text (after selection)
          expect(buttonText).to.eq(expectedButtonText);
        });
    }); //deliveryType
    cy.wait(2500);

    // List of available options groups:
    // [
    //   {'Einseitig', 'Beidseitig'},
    //   {'Schwarz & Weiss', 'Farbe'},
    //   {'Premium Brief','Brief'},
    //   {'Einschreiben','E-Brief'}
    // ];

    // Desired user selection (one from each group)
    const desiredSelection = [
      'Einseitig',
      'Schwarz & Weiß',
      'Brief',
      'Einschreiben',
    ];

    desiredSelection.forEach((option) => {
      cy.get('div>fieldset>div>div>label>.MuiFormControlLabel-label>span').each(
        ($label) => {
          cy.wrap($label)
            .invoke('text')
            .then((text) => {
              const labelText = text.trim();

              // match your desired option
              if (labelText === option) {
                cy.wrap($label)
                  .closest('label')
                  .find('input')
                  .then(($input) => {
                    // If not checked → click it
                    if (!$input.prop('checked')) {
                      cy.wrap($label).click({ force: true });
                      cy.wait(200);
                      cy.log(`Clicked: ${labelText}`);
                    } else {
                      cy.log(`Skipped (already checked): ${labelText}`);
                    }
                    //optional
                    // VALIDATION #1: label must be from desiredSelection
                    expect(labelText).to.be.oneOf(desiredSelection);
                    // VALIDATION #2: the input must now be checked
                    cy.wrap($input).should('be.checked');
                  });
              }
            });
        }
      );
    });

    //Expand all available Accordions
    const accordions = [
      'Weiterführende Informationen',
      'Voraussetzungen',
      'Rücksendung unzustellbarer Mailings',
    ];

    let lastAccordionSelector = null;

    accordions.forEach((label) => {
      cy.get('body').then(($body) => {
        // Check if accordion with this label exists
        if (
          $body.find(`.MuiAccordionSummary-root:contains("${label}")`).length >
          0
        ) {
          cy.log(`Accordion FOUND: ${label}`);

          // Store the last accordion selector
          lastAccordionSelector = `.MuiAccordionSummary-root:contains("${label}")`;

          // Click the accordion
          cy.contains('.MuiAccordionSummary-root', label)
            .should('be.visible')
            .within(() => {
              cy.get('span>div')
                .invoke('text')
                .then((text) => {
                  const accordionText = text.trim();
                  expect(accordionText).to.eq(label); // Validate text
                });
            })
            .click({ force: true });

          cy.wait(2000);
        } else {
          cy.log(`Accordion NOT FOUND → Skipping: ${label}`);
        }
      });
    });

    // After all accordions, close the last expanded one
    cy.then(() => {
      if (lastAccordionSelector) {
        cy.log(`Closing last expanded accordion: ${lastAccordionSelector}`);
        cy.get(lastAccordionSelector).click({ force: true });
      } else {
        cy.log('No accordion was expanded, skipping closing');
      }
    });

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
          'Register_AT.pdf'
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

    cy.get(
      'span[classname="shopping_cart_table_row_checkbox"]>input[type="checkbox"]'
    ).then(($Before) => {
      // const totalDeliveriesBefore;

      const totalDeliveriesBefore = $Before.length;
      cy.log(`Initial count: ${totalDeliveriesBefore}`);

      cy.wait(1500);
      // Click to expand details for first row
      cy.get('table>tbody>tr').first().click({ force: true });

      // Validate expanded Success message
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
      cy.get('tbody')
        .should('exist')
        .then(($tbody) => {
          // Find all deliveries inside the Shopping cart
          // These represent the current deliveries in the cart
          const inputs = $tbody.find(
            'tr > td > .css-ke8v56 > label > span > input'
          );
          // Count the number of deliveries after deletion
          const totalDeliveriesAfterDeletion = inputs.length || 0;
          // Log the count after deletiom
          cy.log(
            `Total Deliveries After Deletion the lastone: ${totalDeliveriesAfterDeletion}`
          );
          // If no deliveries remain after deletion
          if (totalDeliveriesAfterDeletion === 0) {
            cy.log('All deliveries deleted, validating count correctly...');
            // Validate that the previous count minus one is still a valid (non-negative) number
            // Using .gte(0) ensures that we handle cases where there was only one delivery initially
            expect(totalDeliveriesBefore - 1).to.be.gte(0);
          } else {
            // If there are still deliveries left, validate that exactly one was deleted
            expect(totalDeliveriesBefore - 1).to.eq(
              totalDeliveriesAfterDeletion
            );
          }
        });
    });
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
