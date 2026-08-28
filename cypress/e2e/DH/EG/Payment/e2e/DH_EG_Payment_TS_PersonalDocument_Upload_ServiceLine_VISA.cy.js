/// <reference types="cypress" />

// =============================================================================
// DH_EG Payment — Personal Document Upload with ServiceLine (eg_dev flow)
// Scope: Upload ServiceLine PDF → select ServiceLine → Confirm & send → Payment → Orders List
// =============================================================================

describe('DH_EG Payment — Upload ServiceLine (Personal Document)', () => {
  it('Upload ServiceLine PDF → select ServiceLine → confirm & send → payment → orders list', () => {
    // Only suppress cross-origin errors from payment iframes (ixopay/Klarna).
    // Real app/backend errors will fail the test as they should.
    cy.on('uncaught:exception', (err) => {
      if (/ixopay|klarna|payment|Script error/i.test(err.message)) return false;
    });

    // ===== STEP 1: Login and validate DH home URL =====
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.dismissCookieBar();
    cy.loginToDH();
    cy.url({ timeout: 15000 }).should('include', `${Cypress.env('dh_baseUrl')}home`);
    cy.log(`[STEP 1] Login OK — DH home URL confirmed: ${Cypress.env('dh_baseUrl')}home`);
    cy.wait(2000); // Stay 2s on DH home page after login

    // ===== STEP 2: Open Personal Document Upload dialog =====
    cy.scrollTo('top');
    cy.get('#workspace-personal-document-action')
      .should('be.visible')
      .contains(/Persönliches Dokument|Personal Document/i)
      .click({ force: true });

    // ===== STEP 3: Upload ServiceLine PDF and select ServiceLine in dropdown =====
    cy.intercept('GET', '**/group/dictionary/tenant/**').as('getDictionaries');
    cy.DHuploadServiceLine();
    // Dialog fires an early GET on open; wait past it so @getDictionaries hits the post-upload call.
    cy.wait(2500);
    cy.wait('@getDictionaries', { timeout: 35000 });

    cy.get('#dictionary-dropdown').should('be.visible').click({ force: true });
    // Material UI Select needs one tick to mount the overlay list before options are queryable.
    cy.wait(1000);

    // Robust: log all dropdown options and match ServiceLine by data-value OR text
    cy.get('li[data-value]', { timeout: 15000 })
      .should('have.length.at.least', 1)
      .then(($opts) => {
        const options = [...$opts].map((el) => ({
          value: el.getAttribute('data-value'),
          text: (el.innerText || '').trim(),
        }));
        cy.log(`Dropdown options: ${JSON.stringify(options)}`);

        const $target = $opts.filter((_, el) => {
          const v = el.getAttribute('data-value') || '';
          const t = (el.innerText || '').trim();
          return /service/i.test(v) || /service/i.test(t);
        });

        if ($target.length === 0) {
          throw new Error(
            `ServiceLine option not found. Options: ${JSON.stringify(options)}`,
          );
        }
        cy.wrap($target.first()).click({ force: true });
      });

    // MUI Select's dismissing Backdrop stays mounted during its 225ms fade-out
    // and Cypress reports Weiter as "covered". Short sleep covers the transition.
    cy.wait(500);

    // ===== STEP 4: Click Next (move to Confirm & send) =====
    cy.contains('.linkbtn--primary', /Weiter|Next/i)
      .should('be.enabled')
      .click();

    // ===== STEP 5: Confirm & send — wait for Status = uploaded =====
    cy.contains(
      /Document successfully uploaded|Dokument erfolgreich hochgeladen/i,
      { timeout: 60000 },
    ).should('exist');

    // ===== STEP 6: Validate Status column and capture Price from table row =====
    // NOTE: `.e1sv65i456` is an auto-generated styled-components class — will break on FE build.
    // TODO: request a stable data-testid on the Confirm & send table from the frontend team.
    cy.get('.e1sv65i456 table>tbody>tr')
      .first()
      .find('td')
      .contains(
        /Document successfully uploaded|Dokument erfolgreich hochgeladen/i,
      )
      .should('exist');

    // Capture the Price value (format: X,XX €) from the same row
    cy.get('.e1sv65i456 table>tbody>tr')
      .first()
      .find('td')
      .then(($tds) => {
        const cells = [...$tds].map((td) => td.innerText.trim());
        const price = cells.find((t) => /\d[,.]\d{2}\s*€/.test(t));
        cy.log(`Confirm & send — captured document price: ${price}`);
        cy.wrap(price || '').as('confirmPrice');
      });

    // Expand row to validate delivery details
    cy.get('.e1sv65i456 table>tbody>tr').first().click({ force: true });
    cy.get('.e1sv65i456 table>tbody>tr').should('have.length.at.least', 2);

    cy.contains(/Serviceline/i).should('exist');
    cy.contains(/Digital/i).should('exist');
    cy.contains(/ABBA000100279311/i).should('exist');
    cy.contains(/Valid|Gültig/i).should('exist');
    cy.contains(/^No$|^Nein$/i).should('exist');

    // ===== STEP 7: Select row checkbox, click Next =====
    cy.get('.e1sv65i456 table>tbody>tr')
      .first()
      .find('input[type="checkbox"]')
      .check({ force: true });

    cy.contains('.linkbtn--primary', /Weiter|Next/i)
      .should('be.enabled')
      .click();

    // ===== STEP 8: Prices view — validate structure and click Next =====
    cy.contains(/Total\s*price|Gesamtpreis/i, { timeout: 10000 }).should(
      'exist',
    );

    cy.get('@confirmPrice').then((confirmPrice) => {
      if (confirmPrice) cy.log(`Confirm & send price was: ${confirmPrice}`);
    });

    cy.contains('.linkbtn--primary', /Weiter|Next/i)
      .should('be.enabled')
      .click();

    // ===== STEP 9-11: Payment gateway =====
    // Iframe title/src varies by locale and ixopay tenant — we accept several selectors.
    const PAYMENT_IFRAME =
      'iframe[title="Payment page"], iframe[title="Zahlung"], iframe[src*="ixopay"], iframe[src*="payment"], iframe[src*="pay."]';

    const getIframeBody = () =>
      cy
        .get(PAYMENT_IFRAME, { timeout: 20000 })
        .first()
        .its('0.contentDocument.body', { timeout: 20000 })
        .should('not.be.empty')
        .then(cy.wrap);

    // STEP 9: Wait for payment iframe (external hosted page — up to 25s cold-load).
    cy.get(PAYMENT_IFRAME, { timeout: 25000 });

    // STEP 10: Select the STORED (pre-tokenized) Kreditkarte radio.
    // The `-pt--` suffix marks payment-token entries; a new card entry would be `#method-select-Creditcard`
    // and would trigger Klarna 3DS, which lives in a cross-origin iframe Cypress cannot drive.
    cy.get(PAYMENT_IFRAME, { timeout: 25000 })
      .first()
      .should(($iframe) => {
        const body = $iframe[0].contentDocument && $iframe[0].contentDocument.body;
        expect(
          Cypress.$(body).find('input[id^="method-select-Creditcard-pt--"]'),
          'Stored Kreditkarte radio present',
        ).to.have.length.greaterThan(0);
      })
      .then(($iframe) => {
        const body = $iframe[0].contentDocument.body;
        const radio = body.querySelector('input[id^="method-select-Creditcard-pt--"]');
        if (radio) {
          // Manual DOM events instead of cy.click(): we're inside a cross-origin ixopay iframe
          // and cy.wrap()/cy.click() cannot bridge origins reliably.
          const win = radio.ownerDocument.defaultView;
          radio.checked = true;
          radio.dispatchEvent(new win.Event('change', { bubbles: true }));
          radio.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true, view: win }));
          cy.log(`[STEP 10] Selected stored Kreditkarte: ${radio.id}`);
        }
      });

    // Give ixopay JS a beat to register the selection before we click Bezahlen.
    cy.wait(1000);

    // STEP 11: Click Bezahlen
    getIframeBody()
      .contains('button', /Bezahlen|Pay now|Pay$/i, { timeout: 10000 })
      .scrollIntoView()
      .click({ force: true });

    // STEP 14: Validate payment success page (en/de)
    cy.contains(/Payment successful|Zahlung erfolgreich/i, { timeout: 60000 })
      .should('be.visible');

    cy.contains(
      /Your payment has been processed successfully|Ihre Zahlung wurde erfolgreich verarbeitet/i,
    ).should('be.visible');

    cy.contains('button', /Close|Schlie[sß]en|Fertig|Done/i)
      .should('be.visible');

    // Capture payment completion timestamp for Orders List validation
    cy.then(() => {
      Cypress.env('paymentCompletedAt', Date.now());
      cy.log(`[STEP 14] Payment completed at: ${new Date().toLocaleTimeString()}`);
    });

    // STEP 15: Close payment dialog
    cy.contains('button', /Close|Schlie[sß]en|Fertig|Done/i, { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    // ===== STEP 16-17: Navigate to Orders List and poll until today's order appears =====
    cy.get('nav, aside, [class*="sidebar"], [class*="menu"]')
      .contains(/Orders\s*List|Bestellliste/i)
      .click({ force: true });

    cy.url({ timeout: 15000 }).should('include', 'orders-list');

    // Select company if the dropdown is present
    cy.get('body').then(($body) => {
      const needsCompany =
        $body.find('table tbody tr').length === 0 &&
        $body.text().match(/Select\s*Company|Unternehmen\s*wählen/i);
      if (needsCompany) {
        cy.log('Selecting AQUA GmbH from company dropdown');
        cy.contains(/Select\s*Company|Unternehmen/i)
          .parent()
          .find('[role="combobox"], [role="button"], select')
          .first()
          .click({ force: true });
        cy.contains(/AQUA\s*GmbH|AQUA/i, { timeout: 5000 })
          .first()
          .click({ force: true });
      }
    });

    // Poll every 5s until a FRESH order row appears (timestamp >= payment - 60s buffer).
    // Prevents matching stale orders from earlier test runs that have today's date.
    cy.then(() => {
      const paymentCompletedAt = new Date(Cypress.env('paymentCompletedAt') || Date.now());
      const dd = String(paymentCompletedAt.getDate()).padStart(2, '0');
      const mm = String(paymentCompletedAt.getMonth() + 1).padStart(2, '0');
      const yyyy = paymentCompletedAt.getFullYear();
      const todayStr = `${dd}.${mm}.${yyyy}`;
      // 60s buffer absorbs backend/runner clock skew (backend stamps order slightly earlier
      // than our JS Date.now() at the "Payment successful" screen).
      const freshnessCutoffMs = paymentCompletedAt.getTime() - 60000;
      const maxMs = Number(Cypress.env('orderListWaitMs') || 120000);
      const intervalMs = 5000;
      const maxAttempts = Math.ceil(maxMs / intervalMs);
      const startedAt = Date.now();

      cy.log(`[STEP 16] Polling for FRESH order (date=${todayStr}, min-time=${new Date(freshnessCutoffMs).toLocaleTimeString()}, max=${maxMs}ms)`);

      const parseRowTimestamp = (row) => {
        const dateText = Cypress.$(row).find('td').first().text().trim();
        const m = dateText.match(/(\d{2})\.(\d{2})\.(\d{4})[,\s]+(\d{2}):(\d{2}):(\d{2})/);
        if (!m) return null;
        const [, d, mo, y, hh, mi, ss] = m;
        return new Date(+y, +mo - 1, +d, +hh, +mi, +ss).getTime();
      };

      const pollForOrder = (attempt = 1) => {
        cy.get('table tbody tr', { timeout: 15000 }).then(($rows) => {
          const freshRow = [...$rows].find((row) => {
            const dateCell = Cypress.$(row).find('td').first().text();
            if (!dateCell.includes(todayStr)) return false;
            const ts = parseRowTimestamp(row);
            return ts !== null && ts >= freshnessCutoffMs;
          });

          if (freshRow) {
            const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
            const rowTime = new Date(parseRowTimestamp(freshRow)).toLocaleTimeString();
            cy.log(`[STEP 16] Fresh order found after ${elapsedSec}s (row timestamp=${rowTime}, attempt ${attempt}/${maxAttempts})`);
            return;
          }
          if (attempt >= maxAttempts) {
            throw new Error(
              `[STEP 16] Fresh order (date=${todayStr}, timestamp >= ${new Date(freshnessCutoffMs).toLocaleTimeString()}) not found after ${maxMs}ms. Backend may be slow or order creation failed.`,
            );
          }
          cy.log(`[STEP 16] Attempt ${attempt}/${maxAttempts}: no fresh order yet, reloading in ${intervalMs}ms`);
          cy.wait(intervalMs);
          cy.reload();
          pollForOrder(attempt + 1);
        });
      };

      pollForOrder();
    });

    // STEP 17a: Find first row with today's date (DD.MM.YYYY)
    cy.then(() => {
      const paymentCompletedAt = new Date(Cypress.env('paymentCompletedAt') || Date.now());
      const dd = String(paymentCompletedAt.getDate()).padStart(2, '0');
      const mm = String(paymentCompletedAt.getMonth() + 1).padStart(2, '0');
      const yyyy = paymentCompletedAt.getFullYear();
      const todayStr = `${dd}.${mm}.${yyyy}`;
      cy.log(`[STEP 17] Looking for row with date: ${todayStr}`);

      const freshnessCutoffMs = paymentCompletedAt.getTime() - 60000;
      cy.get('table tbody tr').then(($rows) => {
        // Filter to today's rows that are ALSO fresh (>= payment time - 60s)
        const $todayRows = $rows.filter((_, row) => {
          const dateText = Cypress.$(row).find('td').first().text();
          if (!dateText.includes(todayStr)) return false;
          const m = dateText.match(/(\d{2})\.(\d{2})\.(\d{4})[,\s]+(\d{2}):(\d{2}):(\d{2})/);
          if (!m) return false;
          const [, d, mo, y, hh, mi, ss] = m;
          const ts = new Date(+y, +mo - 1, +d, +hh, +mi, +ss).getTime();
          return ts >= freshnessCutoffMs;
        });

        cy.log(`[STEP 17] Fresh rows (date=${todayStr}, ts>=${new Date(freshnessCutoffMs).toLocaleTimeString()}): ${$todayRows.length}`);

        expect($todayRows.length, `At least 1 fresh order row (${todayStr} after ${new Date(freshnessCutoffMs).toLocaleTimeString()})`).to.be.greaterThan(0);

        // Pick the most recent fresh row (top of Orders List = newest)
        const $firstTodayRow = Cypress.$($todayRows[0]);
        const dateText = $firstTodayRow.find('td').first().text().trim();
        cy.log(`[STEP 17] First today row date cell: "${dateText}"`);

        const match = dateText.match(/(\d{2})\.(\d{2})\.(\d{4})[,\s]+(\d{2}):(\d{2}):(\d{2})/);
        if (match) {
          const [, day, month, year, hour, min, sec] = match;
          const orderTime = new Date(+year, +month - 1, +day, +hour, +min, +sec);
          const diffMin = (orderTime.getTime() - paymentCompletedAt.getTime()) / 60000;
          cy.log(
            `Order time: ${hour}:${min}:${sec} | Payment completed: ${paymentCompletedAt.toLocaleTimeString()} | Diff: ${diffMin.toFixed(2)} min`,
          );
          // Range (-10, 5): backend often stamps order 1-5 min BEFORE UI shows "Payment successful"
          // (queue processing lag), so negative diff is expected. +5 tolerates UI/network slack.
          expect(
            diffMin,
            'Order timestamp should be within 10 min of payment completion',
          ).to.be.within(-10, 5);
        } else {
          cy.log(`[WARN] Could not parse HH:MM:SS from: "${dateText}"`);
        }

        // Verify Price matches confirmed price
        cy.get('@confirmPrice').then((confirmPrice) => {
          if (!confirmPrice) return;
          const normalize = (s) =>
            parseFloat(s.trim().replace(/\s/g, '').replace(',', '.').replace('€', ''));
          const expected = normalize(confirmPrice);
          const priceText = $firstTodayRow.find('td').last().text();
          const actual = normalize(priceText);
          cy.log(
            `Orders List price: "${priceText.trim()}" → ${actual} | Expected: ${confirmPrice} → ${expected}`,
          );
          expect(actual, 'Orders List price should match payment price').to.eq(expected);
        });
      });
    });

    // STEP 18: Mark the fresh delivery row (date/time matches this payment) + highlight
    cy.then(() => {
      const paymentCompletedAt = new Date(Cypress.env('paymentCompletedAt') || Date.now());
      const dd = String(paymentCompletedAt.getDate()).padStart(2, '0');
      const mm = String(paymentCompletedAt.getMonth() + 1).padStart(2, '0');
      const yyyy = paymentCompletedAt.getFullYear();
      const todayStr = `${dd}.${mm}.${yyyy}`;
      const freshnessCutoffMs = paymentCompletedAt.getTime() - 60000;

      cy.get('table tbody tr').then(($rows) => {
        const $todayRows = $rows.filter((_, row) => {
          const dateText = Cypress.$(row).find('td').first().text();
          if (!dateText.includes(todayStr)) return false;
          const m = dateText.match(/(\d{2})\.(\d{2})\.(\d{4})[,\s]+(\d{2}):(\d{2}):(\d{2})/);
          if (!m) return false;
          const [, d, mo, y, hh, mi, ss] = m;
          const ts = new Date(+y, +mo - 1, +d, +hh, +mi, +ss).getTime();
          return ts >= freshnessCutoffMs;
        });
        cy.log(`[STEP 18] Fresh rows to mark (date=${todayStr}, ts>=${new Date(freshnessCutoffMs).toLocaleTimeString()}): ${$todayRows.length}`);

        if ($todayRows.length > 0) {
          const $row = Cypress.$($todayRows[0]);
          const $checkbox = $row.find('input[type="checkbox"]');
          if ($checkbox.length) {
            cy.wrap($checkbox.first()).check({ force: true });
          } else {
            cy.wrap($row[0]).click({ force: true });
          }
          const dateTd = $row.find('td')[0];
          if (dateTd) {
            dateTd.style.outline = '3px solid red';
            dateTd.style.outlineOffset = '-2px';
            dateTd.style.backgroundColor = 'rgba(255, 0, 0, 0.08)';
          }
        }
      });
    });

    // STEP 19: Stay on page 5 seconds so the parked/highlighted row is visible
    cy.wait(5000);

    // STEP 20: Logout
    // `{ force: true }` is required — after the payment flow the MUI modal backdrop
    // stays mounted for a beat and covers the user menu button.
    cy.get('.MuiButton-text').click({ force: true });
    cy.wait(1000);
    cy.get('li[role="menuitem"]')
      .contains(/Abmelden|Logout/i)
      .click();

    // Validate home/login page after logout
    cy.url({ timeout: 10000 }).should('include', Cypress.env('dh_baseUrl'));
    cy.get('body', { timeout: 10000 }).should('be.visible');
    cy.contains(/Anmelden|Login|Sign\s*in|Einloggen/i, { timeout: 10000 }).should('be.visible');
    cy.log('[STEP 20] Logout successful — home/login page confirmed');
  });
});
