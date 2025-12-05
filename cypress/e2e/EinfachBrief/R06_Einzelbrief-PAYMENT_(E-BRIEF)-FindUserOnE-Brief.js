describe('Einzelbrief-sendDeliveryToPayment-ViaPrintChannel-CannotFindUserOnEbrief', () => {
  it('Einzelbrief-sendDeliveryToPayment-CannotFindUserOnEbrief', () => {
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

    //Switch to personal data

    //Click on avatar
    cy.get('.MuiAvatar-circular').click();
    cy.wait(1500);

    cy.intercept('GET', '**/getUserSettings').as('getUserSettings');

    // Click on User's settings
    cy.get('ul[role="menu"] > li')
      .should('exist')
      .contains('Benutzereinstellungen')
      .click();

    cy.wait('@getUserSettings', { timeout: 15000 }).then(({ response }) => {
      expect(response.statusCode).to.eq(200);

      const enabled = response.body?.eLetterDeliveryEnabled;

      cy.wait(2000);
      // If disabled → skip all further actions
      if (enabled === false) {
        cy.log('eLetterDeliveryEnabled is FALSE → skipping update actions.');
        return; // Stops here
      }

      // If TRUE
      cy.log('eLetterDeliveryEnabled is TRUE → executing update');

      // Uncheck checkbox if needed
      cy.get('input[type="checkbox"]').then(($checkbox) => {
        if ($checkbox.is(':checked')) {
          cy.wrap($checkbox).uncheck({ force: true });
        }
      });

      cy.wait(1000);

      // Intercept the save request
      cy.intercept('POST', '**/saveUserSettings').as('saveUserSettings');

      // Save button
      cy.get('button[id=":rl:"] > div:nth-of-type(1)')
        .contains('Speichern')
        .click();

      // Validate POST
      cy.wait('@saveUserSettings', { timeout: 15000 }).then(
        ({ request, response }) => {
          expect(response.statusCode).to.eq(200);

          // When enabled was true → we unchecked it → sent as false
          expect(request.body.eLetterDeliveryEnabled).to.be.false;
        }
      );

      // Validate success message
      cy.get('.css-s9wnip > div')
        .last()
        .should('be.visible')
        .and('contain.text', 'Ihre Daten wurden erfolgreich bearbeitet.');
    });

    //Click on New Delivery
    cy.get('.MuiToolbar-root button')
      .should('be.visible')
      .contains(/Neue Sendung|Neue Sendung/i)
      .click();

    cy.wait(2000);

    //Check title under action buttons ()
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
    }); //end deliveryType
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
      'Premium Brief',
      'E-Brief',
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
    }); // end desiredSelection

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

        expect(payload.postalPriority, 'postalPriority').to.eq('PRIO');
        expect(payload.registeredMail, 'registeredMail').to.be.false;
        expect(payload.shipmentType, 'shipmentType').to.eq('Einzelbrief');
        expect(payload.mainDocumentPayload[0].name, 'file name').to.eq(
          'Register_AT.pdf'
        );

        Cypress.config('log', true);
        cy.log('validatePdf payload validation successful');
      }
    );

    // --- Wait and validate /getShoppingChart response ---
    // cy.wait('@getShoppingCart', { timeout: 15000 }).then(({ response }) => {
    //   expect(response.statusCode).to.eq(200);

    //   const shopingCart = request.body;

    //   expect(shopingCart.totalPrice, 'totalPrice').to.eq('1.63');
    // });

    cy.wait('@getShoppingCart').then(({ response }) => {
      expect(response.statusCode).to.eq(200);

      const cart = response.body[0]; // <-- response is an ARRAY

      // Validate high-level cart structure
      expect(cart.valid).to.be.true;

      const delivery = cart.validityResult[0];
      //const doc = delivery.documentsResults[0];

      // // Document-level prices
      // expect(doc.price).to.eq(1.63);
      // expect(doc.productionPrice).to.eq(0.33);
      // expect(doc.postagePrice).to.eq(1.3);

      // Totals at delivery level
      expect(delivery.totalPrice).to.eq(1.63);
      expect(delivery.totalDruck).to.eq(0.33);
      expect(delivery.totalPorto).to.eq(1.3);

      // Optional additional checks
      expect(delivery.shipmentType).to.eq('Premium Brief');
      expect(delivery.postalPriority).to.eq('PRIO');
    });

    ///************************************************************************************************** */

    // //Switch to personal data

    //Click on avatar
    cy.get('.MuiAvatar-circular').click();
    cy.wait(1500);

    cy.intercept('GET', '**/getUserSettings').as('getUserSettings');

    // Click on User's settings menu item
    cy.get('ul[role="menu"]>li')
      .should('exist')
      .contains('Benutzereinstellungen')
      .click();

    cy.wait('@getUserSettings').then(({ request, response }) => {
      expect(response.statusCode).to.eq(200);
      //expect(response.body.postcode).to.eq('8010');
      expect(response.body.eLetterDeliveryEnabled).to.eq(false);
    });

    cy.wait(2000);
    cy.pause();

    ///************************************************************************************************** */

    //Switch to Shopping Cart
    cy.get('.MuiToolbar-root button')
      .should('be.visible')
      .contains(/Offene Sendungen|Shopping Cart/i)
      .click();

    //Validate Shopping Cart page title
    cy.get('.css-i2aehn> h1')
      .should('be.visible')
      .and(($h1) => {
        const text = $h1.text().trim();
        expect(text).to.match(/Zusammenfassung/i);
      });

    // cy.get('.css-1qai9ju').eq(1).click({ force: true });
    cy.wait(2500);

    //Deselect all deliveries from Shopping Cart
    // cy.get('.css-n2cuty>.css-1hzy4ya>span>label>span>div>svg>svg>path').click({
    //   force: true,
    // });
    cy.get('.css-n2cuty input[type="checkbox"]').then(($input) => {
      const isChecked = $input.is(':checked');
      const isDisabled = $input.is(':disabled');

      if (!isDisabled && isChecked) {
        cy.wrap($input).uncheck({ force: true });
        cy.log('All valid deliveries from Shopping Cart are deselected');
      } else {
        cy.log('Checkbox is disabled or already unchecked');
      }
    });

    cy.get('tbody tr')
      .first()
      .find('input[type="checkbox"]')
      .check({ force: true });
    cy.wait(1500);

    cy.intercept('POST', '**/init').as('validateInitRequest');

    cy.get('button > .css-1am57kc')
      .contains(/Senden|Senden/i)
      .click();

    //Validate totalPrices

    cy.wait('@validateInitRequest').then(({ response }) => {
      expect(response.statusCode).to.eq(200);

      const totalPrice = response.body.totalPrice;

      expect(totalPrice[0]).to.eq(1.63);
      expect(totalPrice[1]).to.eq(0.33);
      expect(totalPrice[2]).to.eq(1.96);
    });
    cy.wait(2500);

    cy.intercept('GET', '**/status/**').as('getStatus');
    //Click on 'Zahlungspflichtig bestellen' button to sent delivery on paymet
    cy.get('button>.css-1am57kc')
      .contains(/Zahlungspflichtig bestellen|Zahlungspflichtig bestellen/i)
      .click();

    // Capture and save uploadDateTime
    cy.wait(2000);
    // Update upload timestamp to the signing time
    const now = new Date();
    const formatted = `${String(now.getDate()).padStart(2, '0')}.${String(
      now.getMonth() + 1
    ).padStart(2, '0')}.${now.getFullYear()} ${now.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })}`;

    Cypress.env('uploadDateTime', formatted);

    //end date

    cy.wait('@getStatus').then(({ response }) => {
      expect(response.statusCode).to.eq(200);

      // Validate that paymentCompleted is true
      // Only assert once
      if (response.body.hasOwnProperty('paymentCompleted')) {
        expect(response.body.paymentCompleted).to.eq(true);
      } else {
        throw new Error('paymentCompleted property not found in response');
      }
    });

    // Validate page header
    cy.get('.css-i2aehn > h1')
      .should('be.visible')
      .and('have.text', 'Zusammenfassung');

    // Validate "Auftrag übermittelt!"
    cy.get('.css-1qnrhd2 > h1')
      .should('be.visible')
      .and('have.text', 'Auftrag übermittelt!');

    // Validate payment info text
    cy.get('.css-ubnp26')
      .should('be.visible')
      .and(
        'contain.text',
        'Die Bezahlung wird entsprechend Ihrer Stundungsvereinbarung mit der Österreichischen Post durchgeführt.'
      )
      .and(
        'contain.text',
        'Sendungen die werktags bis 17:00 Uhr übermittelt werden, kommen am folgenden Werktag zur Postaufgabe.'
      );

    //Click on Link on success page
    cy.get('.css-1qnrhd2>button')
      .should('be.visible')
      .and(
        'contain.text',
        "Hier geht's zur Liste aller erfolgreich versendeten Sendungen."
      )
      .invoke('removeAttr', 'target')
      .click();

    cy.wait(2000);

    // Validate navigation (optional)
    cy.url().should('include', '/deliveries-list');
    cy.wait(2000);

    //Check date and time

    // ---- TIMESTAMP VALIDATION ----
    const storedUpload = Cypress.env('uploadDateTime');
    expect(storedUpload).to.not.be.empty;

    //Extract dateTime from latest devery
    cy.get('.css-1xspvtb')
      .eq(0)
      .invoke('text')
      .then((rawText) => {
        cy.log(`Raw table text: ${JSON.stringify(rawText)}`);

        // ---- Extract dd.mm.yyyy + HH:MM from ANY string ----
        const match = rawText.match(/(\d{2}\.\d{2}\.\d{4}).*?(\d{2}:\d{2})/s);

        const dateStr = match[1]; // "18.11.2025"
        const timeStr = match[2]; // "10:58"

        const docDT = new Date(
          dateStr.split('.')[2], // year
          dateStr.split('.')[1] - 1, // month
          dateStr.split('.')[0], // day
          timeStr.split(':')[0], // hour
          timeStr.split(':')[1] // minute
        );

        // Upload datetime
        const [uDate, uTime] = storedUpload.split(' ');
        const uploadDT = new Date(
          uDate.split('.')[2],
          uDate.split('.')[1] - 1,
          uDate.split('.')[0],
          uTime.split(':')[0],
          uTime.split(':')[1]
        );

        // allow +1 min max
        const maxAllowed = new Date(uploadDT);
        maxAllowed.setMinutes(uploadDT.getMinutes() + 1);

        expect(docDT).to.be.at.least(uploadDT);
        expect(docDT).to.be.at.most(maxAllowed);

        cy.log(
          `History timestamp "${dateStr} ${timeStr}" matches upload time "${storedUpload}"`
        );
      });

    cy.wait(2500);
    // Download documet (zip file)
    cy.get('.css-1xspvtb>img[alt="Download"]').first().click();

    //Expand lates delivery from History table
    cy.get('tbody>tr').first().click();
    cy.wait(1000);

    //Download pdf - after expanding latest delivey
    cy.get('td[colspan="8"]>div>table>tbody>tr>td>img[alt="Download"]').click();

    // // Get the latest downloaded PDF file
    // const downloadsDir = `${Cypress.config(
    //   'fileServerFolder'
    // )}/cypress/downloads/`;

    // cy.task('getDownloadedPdf', downloadsDir).then((filePath) => {
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
    // cy.pause();

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
