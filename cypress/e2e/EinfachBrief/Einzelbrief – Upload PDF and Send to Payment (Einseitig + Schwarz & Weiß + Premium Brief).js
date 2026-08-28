/**
 * Einzelbrief – Upload PDF and Send to Payment (Einseitig + Schwarz & Weiß + Premium Brief)
 *
 * Flow:
 *   1. Login → Neue Sendung → select Einzelbrief in the wizard
 *   2. Configure options (Einseitig, Schwarz & Weiß, Premium Brief, no Zusatzleistung)
 *   3. Upload Register_AT.pdf → validate `validatePdf` and `getShoppingChart` API responses
 *   4. Submit + pay via Stundung (real charge) → validate `init` and `status` responses
 *   5. Verify newest delivery row on /deliveries-list shows today's date
 *   6. Download ZIP + PDF → parse PDF content → open PDF in a Blob URL
 */

describe('Einzelbrief – Upload PDF and Send to Payment (Einseitig + Schwarz & Weiß + Premium Brief)', () => {
  it('Einzelbrief_AT-Receiver', () => {
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
    cy.scrollTo('top', { duration: 200 });
    cy.wait(2500);
    //Click on Submit button
    cy.get('button[type="submit"]').click({ force: true });
    cy.wait(1500);

    //Click on New Delivery
    cy.contains('button', /Neue Sendung/i)
      .should('be.visible')
      .click();

    cy.wait(2000);

    //Check title under action buttons
    cy.get(
      'div[aria-label="stepper"]>div:last-of-type>div:first-of-type>section>h1',
    ).should('have.text', 'Wählen Sie Ihre Versandoption');

    // Select Einzelbrief (delivery type)
    const deliveryType = ['Einzelbrief'];

    deliveryType.forEach((option) => {
      cy.contains(option).should('be.visible').click({ force: true });

      cy.wait(1500);
      cy.contains('.css-v55ta1', option).should('have.css', 'border');

      const expectedButtonText = `Weiter mit ${option}`;
      cy.get('button#wizzard-next')
        .should('be.visible')
        .invoke('text')
        .then((txt) => expect(txt.trim()).to.eq(expectedButtonText));
    });
    cy.wait(2500);

    // Configure letter options (one from each radio group + Zusatzleistungen)
    const desiredSelection = [
      'Einseitig', // {'Einseitig', 'Beidseitig'}
      'Schwarz & Weiß', // {'Schwarz & Weiß', 'Farbe'}
      'Premium Brief', // {'Premium Brief', 'Brief'}
      '', // {'Einschreiben', 'E-Brief', ''}
    ];

    const radioButtons =
      'div>fieldset>div>div>label>.MuiFormControlLabel-label>span';

    desiredSelection.forEach((option, index) => {
      // --- Radio groups (index 0-2) ---
      if (index < 3) {
        cy.get(radioButtons).each(($label) => {
          cy.wrap($label)
            .invoke('text')
            .then((labelText) => {
              if (labelText.trim() === option) {
                cy.wrap($label)
                  .closest('label')
                  .find('input')
                  .then(($input) => {
                    if (!$input.prop('checked')) {
                      cy.wrap($label).click({ force: true });
                      cy.wait(200);
                    }
                    cy.wrap($input).should('be.checked');
                  });
              }
            });
        });
      }
      // --- Zusatzleistungen checkboxes (index = 3) ---
      if (index === 3) {
        const zusatzOption = option.trim();
        const checkBox =
          'div[aria-label="stepper"]>div:last-of-type>div:first-of-type>div:nth-of-type(1)>section>div>div:last-of-type';

        // Uncheck everything first
        cy.get(`${checkBox} input[type="checkbox"]`).each(($cb) => {
          if ($cb.prop('checked') && !$cb.prop('disabled')) {
            cy.wrap($cb).click({ force: true });
          }
          cy.wrap($cb).should('not.be.checked');
        });

        // Empty option → both remain deselected
        if (!zusatzOption) return;

        // Otherwise select the requested option
        cy.contains('span', zusatzOption, { matchCase: false })
          .closest('label')
          .find('input[type="checkbox"]')
          .then(($input) => {
            if (!$input.prop('checked')) {
              cy.wrap($input).click({ force: true });
            }
            cy.wrap($input).should('be.checked');
          });
      }
    });

    // Expand + close the informational accordions (defensive: only if rendered)
    const accordions = [
      'Weiterführende Informationen',
      'Voraussetzungen',
      'Rücksendung unzustellbarer Mailings',
    ];

    let lastAccordionSelector = null;
    accordions.forEach((label) => {
      cy.get('body').then(($body) => {
        if (
          $body.find(`.MuiAccordionSummary-root:contains("${label}")`).length
        ) {
          lastAccordionSelector = `.MuiAccordionSummary-root:contains("${label}")`;
          cy.contains('.MuiAccordionSummary-root', label)
            .should('be.visible')
            .click({ force: true });
          cy.wait(2000);
        }
      });
    });
    cy.then(() => {
      if (lastAccordionSelector) {
        cy.get(lastAccordionSelector).click({ force: true });
      }
    });
    cy.wait(2000);

    // Advance to upload step
    cy.get('#wizzard-next').click();
    cy.wait(1000);

    // Upload PDF
    cy.uploadRegisterAT();
    cy.wait(1000);
    cy.wait(3500);

    // --- Validate validatePdf + getShoppingChart API responses ---
    cy.intercept('POST', '**/validatePdf').as('validatePdfRequest');
    cy.intercept('GET', '**/getShoppingChart').as('getShoppingCart');

    // Two buttons carry #wizzard-next on this step ("Sendung neu erstellen" left,
    // "Weiter" right) — target by button text to hit the correct one.
    cy.contains('button', /^Weiter$/i)
      .should('be.visible')
      .click();

    cy.wait('@validatePdfRequest', { timeout: 15000 }).then(
      ({ request, response }) => {
        expect(response.statusCode).to.eq(200);
        const p = request.body;
        expect(p.postalPriority, 'postalPriority').to.eq('PRIO');
        // Backend omits `registeredMail` when unchecked → coerce
        expect(!!p.registeredMail, 'registeredMail').to.be.false;
        expect(p.shipmentType, 'shipmentType').to.eq('Einzelbrief');
        expect(p.mainDocumentPayload[0].name, 'file name').to.eq(
          'Register_AT.pdf',
        );
      },
    );

    cy.wait('@getShoppingCart').then(({ response }) => {
      expect(response.statusCode).to.eq(200);
      const cart = response.body[0];
      expect(cart.valid).to.be.true;

      const delivery = cart.validityResult[0];
      // Prices change with tariff updates → assert shape + math invariant, not exact rates
      expect(delivery.totalPrice, 'totalPrice')
        .to.be.a('number')
        .and.greaterThan(0);
      expect(delivery.totalDruck, 'totalDruck')
        .to.be.a('number')
        .and.greaterThan(0);
      expect(delivery.totalPorto, 'totalPorto')
        .to.be.a('number')
        .and.greaterThan(0);
      const sum = Number(
        (delivery.totalDruck + delivery.totalPorto).toFixed(2),
      );
      expect(delivery.totalPrice, 'total = druck + porto').to.eq(sum);

      expect(delivery.shipmentType).to.eq('Premium Brief');
      expect(delivery.postalPriority).to.eq('PRIO');
    });

    // Shopping cart page title
    cy.contains('h1', /Zusammenfassung/i).should('be.visible');

    cy.wait(2500);

    // Uncheck "select all", then check just the first row
    cy.get('.css-n2cuty input[type="checkbox"]').then(($input) => {
      if ($input.is(':checked') && !$input.is(':disabled')) {
        cy.wrap($input).uncheck({ force: true });
      }
    });
    cy.get('tbody tr')
      .first()
      .find('input[type="checkbox"]')
      .check({ force: true });
    cy.wait(1500);

    // Submit (Senden) → validate init response
    cy.intercept('POST', '**/init').as('validateInitRequest');
    cy.contains('button', /Senden/i).click();

    cy.wait('@validateInitRequest').then(({ response }) => {
      expect(response.statusCode).to.eq(200);
      const totalPrice = response.body.totalPrice;
      expect(totalPrice, 'totalPrice array')
        .to.be.an('array')
        .with.length.gte(3);
      totalPrice.forEach((v, i) => {
        expect(v, `totalPrice[${i}]`).to.be.a('number').and.greaterThan(0);
      });
    });
    cy.wait(2500);

    // Pay (Zahlungspflichtig bestellen) → validate status
    cy.intercept('GET', '**/status/**').as('getStatus');
    cy.contains('button', /Zahlungspflichtig bestellen/i).click();

    // Capture upload timestamp (for audit trail)
    cy.wait(2000);
    const now = new Date();
    const formatted = `${String(now.getDate()).padStart(2, '0')}.${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}.${now.getFullYear()} ${now.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })}`;
    Cypress.env('uploadDateTime', formatted);

    cy.wait('@getStatus').then(({ response }) => {
      expect(response.statusCode).to.eq(200);
      expect(response.body, 'status response').to.have.property(
        'paymentCompleted',
        true,
      );
    });

    // Order confirmation page
    cy.contains('h1', 'Zusammenfassung').should('be.visible');
    cy.contains('h1', 'Auftrag übermittelt!').should('be.visible');
    cy.contains('Stundungsvereinbarung').should('be.visible');
    cy.contains('Sendungen die werktags bis 17:00 Uhr').should('be.visible');

    // Jump to deliveries list
    cy.contains('button', /zur Liste aller erfolgreich versendeten/i)
      .should('be.visible')
      .invoke('removeAttr', 'target')
      .click();

    cy.wait(2000);

    cy.url().should('include', '/deliveries-list');

    // Newest delivery on top must show today's date
    const today = new Date();
    const todayShort =
      `${String(today.getDate()).padStart(2, '0')}.` +
      `${String(today.getMonth() + 1).padStart(2, '0')}.` +
      `${today.getFullYear()}`;

    cy.get('tbody > tr', { timeout: 15000 })
      .first()
      .should('contain.text', todayShort);
    cy.log(`Latest delivery row shows today: ${todayShort}`);

    // --- Download artifacts ---
    // Clean downloads folder first — guarantees we pick up FRESH files below,
    // not Register_AT.pdf or older ZIPs left over from prior runs.
    const downloadsDir =
      Cypress.env('downloadsFolder') || Cypress.config('downloadsFolder');
    cy.task('cleanDownloads', downloadsDir);

    // 1. Download the ZIP (row-level download button)
    cy.get('tbody > tr').first().find('img[alt="Download"]').first().click();

    // 2. Expand the row, then download the individual PDF from the nested table
    cy.get('tbody > tr').first().click();
    cy.get('td[colspan="8"] table img[alt="Download"]').first().click();

    // 3. Poll the folder for the fresh PDF (task retries internally up to timeoutMs)
    cy.task('getDownloadedPdf', {
      downloadsDir,
      timeoutMs: 20000,
      minSizeBytes: 1024,
    }).then((pdfPath) => {
      expect(pdfPath, 'downloaded PDF path').to.be.a('string').and.not.empty;
      cy.log(`Downloaded PDF: ${pdfPath}`);
      Cypress.env('lastDownloadedPdf', pdfPath);
    });

    // Logout — release the app UI so the Blob URL nav below is safe
    cy.get('.css-17oe9x3>button').click();
    cy.wait(1500);
    cy.get('.MuiMenu-list>.MuiMenuItem-root')
      .contains(/Abmelden/i)
      .should('be.visible')
      .click();
    cy.url().should('include', Cypress.env('baseUrl'));

    // --- Verify + display the downloaded PDF ---
    // Parse the PDF on the Node side to prove real content (page count, text),
    // then open it as a Blob URL in the current tab and assert the navigation.
    cy.then(() => {
      const pdfPath = Cypress.env('lastDownloadedPdf');
      cy.log(`Verifying PDF: ${pdfPath}`);

      cy.task('parsePdf', pdfPath).then(({ numpages, text }) => {
        expect(numpages, 'PDF page count').to.be.a('number').and.greaterThan(0);
        expect(text, 'PDF extracted text').to.be.a('string').and.not.empty;
        cy.log(`PDF OK — pages: ${numpages}, text length: ${text.length}`);
      });

      cy.readFile(pdfPath, 'binary', { timeout: 10000 }).then((pdfBinary) => {
        // Native Blob (Cypress.Blob.binaryStringToBlob deprecated in newer versions)
        const bytes = new Uint8Array(pdfBinary.length);
        for (let i = 0; i < pdfBinary.length; i++) {
          bytes[i] = pdfBinary.charCodeAt(i);
        }
        const pdfBlob = new Blob([bytes], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        cy.window().then((win) => {
          win.location.href = pdfUrl;
        });
        cy.window()
          .its('location.href')
          .should('match', /^blob:/);
      });
    });
  });
});
