/// <reference types="cypress" />

import { parseGermanDateTime } from '../../../../../support/utils/dateUtils';

// =============================================================================
// DH_EG Payment — Personal Document Upload with ServiceLine — NEW CARD (VISA)
// Scope: Upload ServiceLine PDF → Confirm & send → Payment via NEW credit card → Orders List
// Difference vs VISA (stored card): expand "Weitere Zahlungsarten", pick new Kreditkarte,
// fill card form (VISA CY / 4111... / 08 2026 / 121), then Bezahlen.
// =============================================================================

describe('DH_EG Payment — Upload ServiceLine (New Card — VISA)', () => {
  it('Upload ServiceLine PDF → select ServiceLine → confirm & send → payment (new VISA card) → orders list', () => {
    // Only suppress cross-origin errors from payment iframes (ixopay/Klarna).
    // Real app/backend errors will fail the test as they should.
    cy.on('uncaught:exception', (err) => {
      if (/ixopay|klarna|payment|Script error/i.test(err.message)) return false;
    });

    // ===== STEP 1: Login and validate DH home URL =====
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.dismissCookieBar();
    cy.loginToDH();

    cy.url({ timeout: 15000 }).should(
      'include',
      `${Cypress.env('dh_baseUrl')}home`,
    );
    cy.log(
      `[STEP 1] Login OK — DH home URL confirmed: ${Cypress.env('dh_baseUrl')}home`,
    );

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

    cy.get('li[data-value]', { timeout: 15000 })
      .should('have.length.at.least', 1)
      .filter((_, el) =>
        /service/i.test(el.getAttribute('data-value') || el.innerText),
      )
      .should('have.length.at.least', 1)
      .first()
      .click({ force: true });

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

    // ===== STEP 9-12: Payment gateway — NEW CARD flow =====
    // Iframe title/src varies by locale and ixopay tenant — we accept several selectors.
    // Assumes at most one of them matches at a time; cy.iframe() throws if the combined
    // selector resolves to more than one iframe on the page.
    //
    // cy.iframe() (cypress-iframe plugin) waits for the frame to load and hands back its
    // body as a real Cypress subject, so .click()/.type() fire genuine events that ixopay's
    // own JS reacts to — no manual DOM/style patching or dispatchEvent needed.
    const PAYMENT_IFRAME =
      'iframe[title="Payment page"], iframe[title="Zahlung"], iframe[src*="ixopay"], iframe[src*="payment"], iframe[src*="pay."]';

    // STEP 9: Open "Weitere Zahlungsarten" to reveal the new-card option.
    cy.iframe(PAYMENT_IFRAME)
      .find('#togglePaymentMethods')
      .should('be.visible')
      .click({ force: true });

    // STEP 10: Select the NEW-CARD Kreditkarte radio (`#method-select-Creditcard`, no `-pt--` suffix).
    cy.iframe(PAYMENT_IFRAME)
      .find('#method-select-Creditcard', { timeout: 15000 })
      .should('exist')
      .click({ force: true });

    // STEP 11: Fill card form — Karteninhaber, PAN, Expiry, CVC.
    // Card data (per test spec/screenshot): VISA CY / 4111 1111 1111 1111 / 08 2026 / 121.
    // PAN and CVV live in nested sub-iframes (`vault-master` / `vault-slave` = ixopay vault),
    // one level below the payment iframe, so we grab those bodies the same way.
    cy.iframe(PAYMENT_IFRAME)
      .find('#cardHolder, input[name="cardHolder"]', { timeout: 15000 })
      .should('be.visible')
      .clear({ force: true })
      .type('VISA CY', { force: true });
    cy.log('[STEP 11] Filled Karteninhaber: VISA CY');

    cy.iframe(PAYMENT_IFRAME)
      .find('iframe[src*="pan.html"], iframe[name*="vault-master"]')
      .its('0.contentDocument.body', { timeout: 15000 })
      .should('not.be.empty')
      .then((body) =>
        cy.wrap(body).find('input').type('4111111111111111', { force: true }),
      );
    cy.log('[STEP 11] Filled Kreditkartennummer: 4111 1111 1111 1111');

    // Expiry select — target test card is 08/2026. Option text format varies by
    // locale ("08/2026" vs "08-2026"), so match loosely; fall back to any month-08
    // option, then to the first non-empty option, rather than leaving it unselected.
    cy.iframe(PAYMENT_IFRAME)
      .find('select#expiry, select[name="expiry"]')
      .then(($select) => {
        const opts = [...$select[0].options];
        const match =
          opts.find((o) => /08\s*[\/\-]\s*2026/.test(o.text.trim())) ||
          opts.find((o) => /^08/.test(o.text.trim())) ||
          opts.find((o) => o.value);
        if (match) {
          cy.wrap($select).select(match.value, { force: true });
          cy.log(`[STEP 11] Selected gültig bis: ${match.text.trim()}`);
        }
      });

    cy.iframe(PAYMENT_IFRAME)
      .find('iframe[src*="cvv.html"], iframe[name*="vault-slave"]')
      .its('0.contentDocument.body', { timeout: 15000 })
      .should('not.be.empty')
      .then((body) => cy.wrap(body).find('input').type('121', { force: true }));
    cy.log('[STEP 11] Filled CVC: 121');

    // STEP 12: Scroll to and click Bezahlen (#proceed-btn).
    cy.iframe(PAYMENT_IFRAME)
      .find('#proceed-btn', { timeout: 10000 })
      .scrollIntoView()
      .click({ force: true });
    cy.log('[STEP 12] Clicked Bezahlen (#proceed-btn)');

    // STEP 14: Validate payment success page (en/de) — identical to VISA test.
    cy.contains(/Payment successful|Zahlung erfolgreich/i, {
      timeout: 60000,
    }).should('be.visible');

    cy.contains(
      /Your payment has been processed successfully|Ihre Zahlung wurde erfolgreich verarbeitet/i,
    ).should('be.visible');

    cy.contains('button', /Close|Schlie[sß]en|Fertig|Done/i).should(
      'be.visible',
    );

    // Capture payment completion timestamp for Orders List validation
    cy.then(() => {
      Cypress.env('paymentCompletedAt', Date.now());
      cy.log(
        `[STEP 14] Payment completed at: ${new Date().toLocaleTimeString()}`,
      );
    });

    // STEP 15: Close payment dialog
    cy.contains('button', /Close|Schlie[sß]en|Fertig|Done/i, { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    // ===== STEP 16-18: Navigate to Orders List, poll for the fresh order, validate, mark =====
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

    // ----- Shared "fresh order row" helpers (used by STEP 16, 17, 18 below) -----
    // A row is "fresh" if its date matches today AND its timestamp is at/after
    // (payment completion - 60s). The 60s buffer absorbs backend/runner clock skew
    // (backend often stamps the order slightly before our JS Date.now() at the
    // "Payment successful" screen). This avoids matching stale orders from earlier
    // test runs that happen to share today's date.
    const ORDER_TIMESTAMP_RE =
      /(\d{2})\.(\d{2})\.(\d{4})[,\s]+(\d{2}):(\d{2}):(\d{2})/;

    const parseRowTimestamp = (row) => {
      const dateText = Cypress.$(row).find('td').first().text().trim();
      const m = dateText.match(ORDER_TIMESTAMP_RE);
      if (!m) return null;
      const [, d, mo, y, hh, mi, ss] = m;
      return new Date(+y, +mo - 1, +d, +hh, +mi, +ss).getTime();
    };

    // Computed once STEP 16 runs (after STEP 14 has stamped paymentCompletedAt),
    // then reused by STEP 17 and STEP 18 so the window is identical across all three.
    let freshness;
    const computeFreshnessWindow = () => {
      const paymentCompletedAt = new Date(
        Cypress.env('paymentCompletedAt') || Date.now(),
      );
      const dd = String(paymentCompletedAt.getDate()).padStart(2, '0');
      const mm = String(paymentCompletedAt.getMonth() + 1).padStart(2, '0');
      const yyyy = paymentCompletedAt.getFullYear();
      return {
        paymentCompletedAt,
        todayStr: `${dd}.${mm}.${yyyy}`,
        cutoffMs: paymentCompletedAt.getTime() - 60000,
      };
    };

    const getFreshRows = ($rows, todayStr, cutoffMs) =>
      [...$rows].filter((row) => {
        const dateCell = Cypress.$(row).find('td').first().text();
        if (!dateCell.includes(todayStr)) return false;
        const ts = parseRowTimestamp(row);
        return ts !== null && ts >= cutoffMs;
      });

    // STEP 16: Poll every 5s until a fresh order row appears.
    cy.then(() => {
      freshness = computeFreshnessWindow();
      const { todayStr, cutoffMs } = freshness;
      const maxMs = Number(Cypress.env('orderListWaitMs') || 120000);
      const intervalMs = 5000;
      const maxAttempts = Math.ceil(maxMs / intervalMs);
      const startedAt = Date.now();

      cy.log(
        `[STEP 16] Polling for FRESH order (date=${todayStr}, min-time=${new Date(cutoffMs).toLocaleTimeString()}, max=${maxMs}ms)`,
      );

      const pollForOrder = (attempt = 1) => {
        cy.get('table tbody tr', { timeout: 15000 }).then(($rows) => {
          const [freshRow] = getFreshRows($rows, todayStr, cutoffMs);

          if (freshRow) {
            const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
            const rowTime = new Date(
              parseRowTimestamp(freshRow),
            ).toLocaleTimeString();
            cy.log(
              `[STEP 16] Fresh order found after ${elapsedSec}s (row timestamp=${rowTime}, attempt ${attempt}/${maxAttempts})`,
            );
            return;
          }
          if (attempt >= maxAttempts) {
            throw new Error(
              `[STEP 16] Fresh order (date=${todayStr}, timestamp >= ${new Date(cutoffMs).toLocaleTimeString()}) not found after ${maxMs}ms. Backend may be slow or order creation failed.`,
            );
          }
          cy.log(
            `[STEP 16] Attempt ${attempt}/${maxAttempts}: no fresh order yet, reloading in ${intervalMs}ms`,
          );
          cy.wait(intervalMs);
          cy.reload();
          pollForOrder(attempt + 1);
        });
      };

      pollForOrder();
    });

    // STEP 17: Validate the top fresh row's timestamp and price
    cy.then(() => {
      const { todayStr, cutoffMs, paymentCompletedAt } = freshness;

      cy.get('table tbody tr').then(($rows) => {
        const freshRows = getFreshRows($rows, todayStr, cutoffMs);

        cy.log(
          `[STEP 17] Fresh rows (date=${todayStr}, ts>=${new Date(cutoffMs).toLocaleTimeString()}): ${freshRows.length}`,
        );
        expect(
          freshRows.length,
          `At least 1 fresh order row (${todayStr} after ${new Date(cutoffMs).toLocaleTimeString()})`,
        ).to.be.greaterThan(0);

        const $firstRow = Cypress.$(freshRows[0]);
        const rowTs = parseRowTimestamp(freshRows[0]);
        if (rowTs !== null) {
          const diffMin = (rowTs - paymentCompletedAt.getTime()) / 60000;
          cy.log(
            `Order time: ${new Date(rowTs).toLocaleTimeString()} | Payment completed: ${paymentCompletedAt.toLocaleTimeString()} | Diff: ${diffMin.toFixed(2)} min`,
          );
          // Range (-10, 5): backend often stamps order 1-5 min BEFORE UI shows "Payment successful"
          // (queue processing lag), so negative diff is expected. +5 tolerates UI/network slack.
          expect(
            diffMin,
            'Order timestamp should be within 10 min of payment completion',
          ).to.be.within(-10, 5);
        } else {
          cy.log(`[WARN] Could not parse timestamp from fresh row`);
        }

        cy.get('@confirmPrice').then((confirmPrice) => {
          if (!confirmPrice) return;
          const normalize = (s) =>
            parseFloat(
              s.trim().replace(/\s/g, '').replace(',', '.').replace('€', ''),
            );
          const expected = normalize(confirmPrice);
          const priceText = $firstRow.find('td').last().text();
          const actual = normalize(priceText);
          cy.log(
            `Orders List price: "${priceText.trim()}" → ${actual} | Expected: ${confirmPrice} → ${expected}`,
          );
          expect(actual, 'Orders List price should match payment price').to.eq(
            expected,
          );
        });
      });
    });

    // STEP 18: Mark the fresh delivery row (date/time matches this payment) + highlight
    cy.then(() => {
      const { todayStr, cutoffMs } = freshness;

      cy.get('table tbody tr').then(($rows) => {
        const freshRows = getFreshRows($rows, todayStr, cutoffMs);
        cy.log(
          `[STEP 18] Fresh rows to mark (date=${todayStr}, ts>=${new Date(cutoffMs).toLocaleTimeString()}): ${freshRows.length}`,
        );

        if (freshRows.length === 0) return;

        const $row = Cypress.$(freshRows[0]);
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
      });
    });

    // STEP 19: Stay on page 5 seconds so the parked/highlighted row is visible
    cy.wait(5000);

    // Logout from DH
    cy.get('.MuiButton-text').click();
    cy.wait(1000);
    cy.get('li[role="menuitem"]')
      .contains(/Abmelden|Logout/i)
      .click();
    cy.url().should('include', Cypress.env('dh_baseUrl'));
    cy.log('Upload finished successfully.');
    cy.wait(2500);
  });
  // Login to e-Box and open delivery if timestamps match logic
  it('Login to e-Box and Open Delivery', () => {
    // Log into e-Box
    cy.loginToEgEbox();
    cy.wait(2000);

    // Reference point: the moment payment succeeded, stamped by the payment test
    // (STEP 14). This is much closer to when the backend actually creates the eBox
    // delivery than the earlier "upload started" moment — using it lets us match
    // tightly instead of accepting any delivery from today.
    const paymentCompletedAt = Cypress.env('paymentCompletedAt') || Date.now();
    const TOLERANCE_MIN = 2.5;

    // Find latest delivery and extract its date/time
    cy.get('.date-of-delivery-cell > .half-cell-text-content')
      .first() // latest delivery
      .should('be.visible')
      .invoke('text')
      .then((readTextRaw) => {
        // Clean text (remove commas/spaces)
        const readClean = readTextRaw
          .replace(',', ' ')
          .replace(/\s+/g, ' ')
          .trim();

        const readParsed = parseGermanDateTime(readClean);
        const diffMin =
          Math.abs(readParsed.getTime() - paymentCompletedAt) / 60000;

        cy.log(`Payment completed at: ${new Date(paymentCompletedAt)}`);
        cy.log(`Latest delivery time: ${readParsed} (raw: "${readClean}")`);
        cy.log(`Difference: ${diffMin.toFixed(2)} minutes`);

        // --- Only open the delivery if it was created within TOLERANCE_MIN of payment ---
        // This is a much tighter check than matching by date alone, which would happily
        // open ANY delivery from today, including ones unrelated to this payment run.
        if (diffMin <= TOLERANCE_MIN) {
          cy.log(
            `✓ Test PASSED: Delivery is ${diffMin.toFixed(2)} min from payment completion (within ${TOLERANCE_MIN} min).`,
          );

          // Mark the matched delivery's date/time cell for visibility
          cy.get('.date-of-delivery-cell')
            .first()
            .then(($cell) => {
              $cell.css({
                outline: '3px solid red',
                outlineOffset: '-2px',
                backgroundColor: 'rgba(255, 0, 0, 0.08)',
              });
            });

          // Intercept backend call fired when the document opens
          cy.intercept('GET', '**/getIdentifications?**').as(
            'getIdentifications',
          );

          // Click on the latest delivery
          cy.get('.mdc-data-table__content>tr>.subject-sender-cell')
            .eq(0)
            .click({ force: true });

          // Open the document. DH renders an intermediate delivery card first;
          // `.delivery-document` (aria-label="Open document") is the actual click
          // target — its child `.document-name` is just the label text.
          cy.get('.delivery-document').click({ force: true });

          // Wait for identifications response
          cy.wait(['@getIdentifications'], { timeout: 57000 }).then(
            (interception) => {
              expect(interception.response.statusCode).to.eq(200);
            },
          );

          // Scroll to bottom of the delivery
          cy.get('.content-container>.scroll-container')
            .eq(1)
            .scrollTo('bottom', { duration: 500, ensureScrollable: false });
          cy.wait(3500);
        } else {
          // FAIL: latest delivery is too far from payment completion to be this run's
          const errorMsg = `✗ Test FAILED: Latest delivery (${readClean}) is ${diffMin.toFixed(2)} min from payment completion (${new Date(paymentCompletedAt).toLocaleString()}), exceeds ${TOLERANCE_MIN} min tolerance.`;
          cy.log(errorMsg);

          // Log out the user before failing
          cy.get('.user-title').click({ force: true });
          cy.wait(1000);
          cy.get('.logout-title > a').click();
          cy.url().should('include', Cypress.env('baseUrl_egEbox'));

          // Throw error to fail test
          throw new Error(errorMsg);
        }
        // Log out the user after successful validation
        cy.get('.user-title').click({ force: true });
        cy.wait(1000);
        cy.get('.logout-title > a').click();
        cy.url().should('include', Cypress.env('baseUrl_egEbox'));
      });
  });

  //Admin user check Reporting email
  it('Yopmail - Get Reporting email', { retries: 2 }, () => {
    // Visit Yopmail
    cy.visit('https://yopmail.com/en/');

    // Enter the support admin email
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));

    // Click the refresh button
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    //Custom functions:
    // Define email subject function
    function emailSubject(index) {
      cy.iframe('#ifinbox')
        .find('.mctn > .m > button > .lms')
        .eq(index)
        .should('include.text', 'Versandreport DocuHub Portal');
    }

    // Access the inbox iframe and validate the email subject
    emailSubject(0); // Validate subject of Reporting email

    cy.iframe('#ifmail')
      .find('#mail > div')
      .invoke('text') // Get the text content
      .then((text) => {
        // Log the email body text
        cy.log('Email Body Text:', text);

        // Normalize spaces for comparison
        const normalizedText = text.trim().replace(/\s+/g, ' '); // Normalize extra spaces

        // Validate that the email body contains the expected text
        expect(normalizedText).to.include(
          'Sie haben 1 Sendung(en) erfolgreich digital in das DocuHub Portal Ihrer Benutzer*innen eingeliefert',
        );
        expect(normalizedText).to.include(
          'Zusätzlich haben Sie 0 Sendung(en) erfolgreich über den postalischen Weg als Brief versendet. Das Dokument wird von uns über das „Einfach Brief“-Portal gedruckt, kurvertiert und an die Adresse des Benutzers versendet.',
        );
        expect(normalizedText).to.include('Ihr DocuHub Team');
      });

    cy.wait(4500);

    // Delete all emails
    cy.get('.menu>div>#delall')
      .should('not.be.disabled')
      .click({ force: true });
    cy.wait(2500);
  });
});
