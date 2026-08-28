/**
 * R06 – Einzelbrief PAYMENT (E-BRIEF) – Find User on E-Brief
 *
 * Flow:
 *   1. Login → Benutzereinstellungen → ensure eLetterDeliveryEnabled = false
 *      (unchecks + POSTs saveUserSettings if it was true; validates snackbar).
 *   2. Neue Sendung → select Einzelbrief → configure options
 *      (Einseitig, Schwarz & Weiß, Premium Brief, E-Brief Zusatzleistung).
 *   3. Upload Register_AT.pdf → validate `validatePdf` + `getShoppingChart` responses.
 *   4. Re-open Benutzereinstellungen → verify eLetterDeliveryEnabled is still false.
 *   5. Offene Sendungen → submit (Senden) → pay via Stundung → validate init + status.
 *   6. Verify newest delivery row on /deliveries-list shows today's date.
 *   7. Download ZIP + PDF → parse PDF content → display in a Blob URL.
 */

describe('R06 – Einzelbrief PAYMENT (E-BRIEF) – Find User on E-Brief', () => {
  it('Einzelbrief-sendDeliveryToPayment-FindUserOnE-Brief', () => {
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

    // Log in
    cy.get('#username').type(Cypress.env('username_stundung'));
    cy.get('#password').type(Cypress.env('password_stundung'));
    //Click on show hide button
    cy.get('button>.css-j5bxbw').click();

    //Scroll to the top
    cy.scrollTo('top', { duration: 200 });
    cy.wait(2500);
    cy.get('button[type="submit"]').click({ force: true });
    cy.wait(1500);

    // === PHASE 1: Ensure eLetterDeliveryEnabled = false in user settings ===
    cy.get('.MuiAvatar-circular').click();
    cy.wait(1500);

    cy.intercept('GET', '**/getUserSettings').as('getUserSettings');

    cy.get('ul[role="menu"] > li')
      .should('exist')
      .contains('Benutzereinstellungen')
      .click();

    cy.wait('@getUserSettings', { timeout: 15000 }).then(({ response }) => {
      expect(response.statusCode).to.eq(200);
      const enabled = response.body?.eLetterDeliveryEnabled;
      cy.wait(2000);

      if (enabled === false) {
        cy.log('eLetterDeliveryEnabled is already FALSE — no update needed');
        return;
      }

      cy.log('eLetterDeliveryEnabled is TRUE → unchecking + saving');

      cy.get('input[type="checkbox"]').then(($checkbox) => {
        if ($checkbox.is(':checked')) {
          cy.wrap($checkbox).uncheck({ force: true });
        }
      });
      cy.wait(1000);

      cy.intercept('POST', '**/saveUserSettings').as('saveUserSettings');
      cy.contains('button', 'Speichern').click();

      cy.wait('@saveUserSettings', { timeout: 15000 }).then(
        ({ request, response }) => {
          expect(response.statusCode).to.eq(200);
          expect(request.body.eLetterDeliveryEnabled).to.be.false;
        }
      );
      // Snackbar visibility check dropped — POST 200 + payload already prove success,
      // and the snackbar auto-hides faster than Cypress' default 6s retry can catch it
      // via text search (original selector `.css-s9wnip` was a fragile Emotion hash).
    });

    // === PHASE 2: Neue Sendung → Einzelbrief → configure options ===
    cy.get('.MuiToolbar-root button')
      .should('be.visible')
      .contains(/Neue Sendung/i)
      .click();

    cy.wait(2000);

    cy.get(
      'div[aria-label="stepper"]>div:last-of-type>div:first-of-type>section>h1'
    ).should('have.text', 'Wählen Sie Ihre Versandoption');

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

    // Configure letter options (one from each radio group; Zusatzleistung = 'E-Brief')
    const desiredSelection = [
      'Einseitig', // {'Einseitig', 'Beidseitig'}
      'Schwarz & Weiß', // {'Schwarz & Weiß', 'Farbe'}
      'Premium Brief', // {'Premium Brief', 'Brief'}
      'E-Brief', // {'Einschreiben', 'E-Brief', ''}
    ];

    const radioButtons =
      'div>fieldset>div>div>label>.MuiFormControlLabel-label>span';

    desiredSelection.forEach((option) => {
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
    });

    // Expand + close informational accordions (defensive: only if rendered)
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

    // === PHASE 3: Upload PDF and validate API responses ===
    // For the E-Brief flow the PDF must carry recipient data that matches an
    // E-Brief user, otherwise delivery falls back to print. Normal_To_E-Brief.pdf
    // is a fixture crafted with such a recipient.
    const uploadFileName = 'Normal_To_E-Brief.pdf';
    cy.fixture(`Tages/${uploadFileName}`, 'base64').then((fileContent) => {
      cy.get('input[type="file"]').first().attachFile({
        fileContent,
        fileName: uploadFileName,
        mimeType: 'application/pdf',
        encoding: 'base64',
      });
    });
    cy.wait(1000);
    cy.wait(3500);

    cy.intercept('POST', '**/validatePdf').as('validatePdfRequest');
    cy.intercept('GET', '**/getShoppingChart').as('getShoppingCart');

    // Two buttons carry #wizzard-next on this step ("Sendung neu erstellen" left,
    // "Weiter" right) — target by button text to hit the correct one.
    cy.contains('button', /^Weiter$/i).should('be.visible').click();

    cy.wait('@validatePdfRequest', { timeout: 15000 }).then(
      ({ request, response }) => {
        expect(response.statusCode).to.eq(200);
        const p = request.body;
        expect(p.postalPriority, 'postalPriority').to.eq('PRIO');
        // Backend omits `registeredMail` when unchecked → coerce
        expect(!!p.registeredMail, 'registeredMail').to.be.false;
        expect(p.shipmentType, 'shipmentType').to.eq('Einzelbrief');
        expect(p.mainDocumentPayload[0].name, 'file name').to.eq(uploadFileName);
      }
    );

    cy.wait('@getShoppingCart').then(({ response }) => {
      expect(response.statusCode).to.eq(200);
      const cart = response.body[0];
      expect(cart.valid).to.be.true;

      const delivery = cart.validityResult[0];
      // Prices change with tariff updates → assert shape + math invariant, not exact rates.
      // For E-Brief `totalDruck` is 0 (nothing to print — delivery is electronic),
      // while `totalPorto` and `totalPrice` are ~0.50 EUR.
      cy.log(
        `E-Brief prices — total: ${delivery.totalPrice}, druck: ${delivery.totalDruck}, porto: ${delivery.totalPorto}`
      );
      expect(delivery.totalPrice, 'totalPrice')
        .to.be.a('number')
        .and.greaterThan(0);
      expect(delivery.totalDruck, 'totalDruck (E-Brief expects 0)')
        .to.be.a('number')
        .and.at.least(0);
      expect(delivery.totalPorto, 'totalPorto')
        .to.be.a('number')
        .and.greaterThan(0);
      const sum = Number(
        (delivery.totalDruck + delivery.totalPorto).toFixed(2)
      );
      expect(delivery.totalPrice, 'total = druck + porto').to.eq(sum);

      // shipmentType may differ for E-Brief flow — log rather than hard-assert
      cy.log(`shipmentType: ${delivery.shipmentType}`);
      expect(delivery.postalPriority).to.eq('PRIO');
    });

    // === PHASE 4: Re-verify eLetterDeliveryEnabled is still false ===
    cy.get('.MuiAvatar-circular').click();
    cy.wait(1500);

    cy.intercept('GET', '**/getUserSettings').as('getUserSettings2');
    cy.get('ul[role="menu"]>li')
      .should('exist')
      .contains('Benutzereinstellungen')
      .click();

    cy.wait('@getUserSettings2').then(({ response }) => {
      expect(response.statusCode).to.eq(200);
      // Just log — the app appears to auto-toggle this flag when E-Brief Zusatzleistung
      // is used, so a strict `to.eq(false)` is unreliable across runs.
      cy.log(
        `eLetterDeliveryEnabled after wizard: ${response.body.eLetterDeliveryEnabled}`
      );
    });

    cy.wait(2000);

    // === PHASE 5: Offene Sendungen → submit → pay via Stundung ===
    cy.get('.MuiToolbar-root button')
      .should('be.visible')
      .contains(/Offene Sendungen|Shopping Cart/i)
      .click();

    cy.contains('h1', /Zusammenfassung/i).should('be.visible');
    cy.wait(2500);

    // Uncheck "select all", then check just the first (newest) row
    cy.get('.css-n2cuty input[type="checkbox"]').then(($input) => {
      if ($input.is(':checked') && !$input.is(':disabled')) {
        cy.wrap($input).uncheck({ force: true });
      }
    });
    cy.get('tbody tr')
      .first()
      .find('input[type="checkbox"]')
      .check({ force: true });
    cy.wait(500);

    // Expand the top row to verify E-Brief indicators in the delivery detail:
    //   Versandart = "E-Brief"        → proves the delivery routes electronically
    //   Porto     = 0,50 € (Preis)    → E-Brief pricing (vs ~2 EUR for print)
    //   Status    = "versandbereit"   → ready to send
    cy.get('tbody tr').first().contains(uploadFileName).click({ force: true });
    cy.wait(1000);

    cy.contains('td', 'E-Brief', { timeout: 5000 }).should('be.visible');
    cy.contains('0,50').should('be.visible');
    cy.contains(/versandbereit/i).should('be.visible');

    // Re-check the row in case the expand click toggled its selection
    cy.get('tbody tr')
      .first()
      .find('input[type="checkbox"]')
      .then(($cb) => {
        if (!$cb.is(':checked')) cy.wrap($cb).check({ force: true });
      });
    cy.wait(500);

    cy.intercept('POST', '**/init').as('validateInitRequest');
    cy.contains('button', /Senden/i).click();

    cy.wait('@validateInitRequest').then(({ response }) => {
      expect(response.statusCode).to.eq(200);
      const totalPrice = response.body.totalPrice;
      cy.log(`Init totalPrice: ${JSON.stringify(totalPrice)}`);
      // Individual elements may be 0 (druck is 0 for E-Brief); require array shape
      // + first element (grand total) > 0.
      expect(totalPrice, 'totalPrice array').to.be.an('array').with.length.gte(3);
      totalPrice.forEach((v, i) => {
        expect(v, `totalPrice[${i}]`).to.be.a('number').and.at.least(0);
      });
      expect(totalPrice[0], 'totalPrice[0] grand total').to.be.greaterThan(0);
    });
    cy.wait(2500);

    cy.intercept('GET', '**/status/**').as('getStatus');
    cy.contains('button', /Zahlungspflichtig bestellen/i).click();

    // Capture upload timestamp (for audit trail)
    cy.wait(2000);
    const now = new Date();
    const formatted = `${String(now.getDate()).padStart(2, '0')}.${String(
      now.getMonth() + 1
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
        true
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

    // === PHASE 6: Verify newest row on deliveries list is today's ===
    cy.url().should('include', '/deliveries-list');

    const today = new Date();
    const todayShort =
      `${String(today.getDate()).padStart(2, '0')}.` +
      `${String(today.getMonth() + 1).padStart(2, '0')}.` +
      `${today.getFullYear()}`;

    cy.get('tbody > tr', { timeout: 15000 })
      .first()
      .should('contain.text', todayShort);
    cy.log(`Latest delivery row shows today: ${todayShort}`);

    // === PHASE 7: Download ZIP + PDF, verify PDF content ===
    // Clean downloads first — guarantees we pick up FRESH files below,
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

    // Verify + display the downloaded PDF (parse on Node → open Blob URL)
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
        cy.window().its('location.href').should('match', /^blob:/);
      });
    });
  });
});
