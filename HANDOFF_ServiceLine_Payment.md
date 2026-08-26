# Handoff: DH_EG Payment Tests

**Datum:** 2026-08-18  
**Status:** ✅ ServiceLine_VISA i Dictionary_305 prolaze pouzdano

---

## Fajlovi

| Fajl | Status | Metoda plaćanja |
|------|--------|-----------------|
| `cypress/e2e/DH/EG/Payment/e2e/DH_EG_Payment_TS_PersonalDocument_Upload_ServiceLine_VISA.cy.js` | ✅ Prolazi | Stored card |
| `cypress/e2e/DH/EG/Payment/e2e/DH_EG_Payment_TS_PersonalDocument_Upload_Dictionary_305.cy.js` | ✅ Prolazi | Stored card |
| `cypress/e2e/DH/EG/Payment/e2e/DH_EG_Payment_TS_PersonalDocument_Upload_ServiceLine_NewCard.cy.js` | ❌ Flaky | Nova kartica (Klarna 3DS) |

> **Payment folder je untracked (nikad commitovan u git)**

---

## Environment

- Cypress 15.20.0, Chrome 151
- Node v24.15.0, Windows 11
- Base URL: `Cypress.env('dh_baseUrl')` → `https://documenthub.edeja.com/`
- Run komanda: `npx cypress run --headed --browser chrome --spec "cypress/e2e/DH/EG/Payment/e2e/<spec>.cy.js"`

---

## ServiceLine_VISA — flow

1. Login
2. Open Personal Document Upload dialog
3. Upload `Serviceline-tid=AQUA_gid=ABBA000100279311.pdf` → select ServiceLine dictionary
4. Next → Confirm & send → verify "Document successfully uploaded"
5. Capture price alias `@confirmPrice`
6. Select checkbox → Next → Prices view → Next
7. Payment iframe (`iframe[src*="ixopay"]`)
8. Select stored Kreditkarte radio `input[id^="method-select-Creditcard-pt--"]` via `radio.click()`
9. Click Bezahlen button
10. Verify "Payment successful" + close dialog
11. Wait `orderListWaitMs` (default 120s) for backend
12. Navigate Orders List → validate today's date row, timestamp (±3 min), price
13. **Logout** → `.MuiButton-text` click `{ force: true }` → `li[role="menuitem"]` Abmelden
14. **Validate home/login page** → URL includes base URL + "Anmelden/Login" visible

---

## Dictionary_305 — flow

Isto kao ServiceLine_VISA, razlike:

- Upload: `305_Dictionary_(AQUA_ABBA000100279311).pdf` → `DHupload305Dictionary()` command
- Dictionary select: `li[data-value="PDFTABDictionary-305"]`
- Intercept fix: `cy.wait(2500)` posle uploada + `cy.get('li[data-value]').should('have.length.at.least', 1)` guard
- Confirm & send: expanded row validacija (305_Dictionary, Digital, ABBA000100279311, Valid, No/Nein)
- **Border na datum ćeliji**: `outline: 3px solid red` + `backgroundColor: rgba(255,0,0,0.08)` na prvom redu Orders List
- **STEP 18**: mark row (checkbox ako postoji, inače click)
- **STEP 19**: `cy.wait(5000)`
- **STEP 20**: logout + home/login validacija (isti pattern kao VISA)

---

## Ključni patten — stored card payment

```javascript
const PAYMENT_IFRAME =
  'iframe[title="Payment page"], iframe[title="Zahlung"], iframe[src*="ixopay"], iframe[src*="payment"], iframe[src*="pay."]';

cy.get(PAYMENT_IFRAME, { timeout: 25000 }).should('exist');

// Select stored card
cy.get(PAYMENT_IFRAME, { timeout: 25000 })
  .first()
  .should(($iframe) => {
    const body = $iframe[0].contentDocument && $iframe[0].contentDocument.body;
    expect(Cypress.$(body).find('input[id^="method-select-Creditcard-pt--"]')).to.have.length.greaterThan(0);
  })
  .then(($iframe) => {
    const radio = $iframe[0].contentDocument.body.querySelector('input[id^="method-select-Creditcard-pt--"]');
    if (radio) radio.click();
  });

cy.wait(1000);

// Click Bezahlen
const getIframeBody = () =>
  cy.get(PAYMENT_IFRAME, { timeout: 20000 }).first()
    .its('0.contentDocument.body', { timeout: 20000 })
    .should('not.be.empty').then(cy.wrap);

getIframeBody()
  .contains('button', /Bezahlen|Pay now|Pay$/i, { timeout: 10000 })
  .scrollIntoView().click({ force: true });
```

---

## Ključni pattern — logout + home validacija

```javascript
cy.get('.MuiButton-text').click({ force: true });
cy.wait(1000);
cy.get('li[role="menuitem"]').contains(/Abmelden|Logout/i).click();

cy.url({ timeout: 10000 }).should('include', Cypress.env('dh_baseUrl'));
cy.get('body', { timeout: 10000 }).should('be.visible');
cy.contains(/Anmelden|Login|Sign\s*in|Einloggen/i, { timeout: 10000 }).should('be.visible');
```

> **Napomena:** `.MuiButton-text` mora imati `{ force: true }` jer MUI backdrop (payment modal) može da ga prekriva.

---

## Nova kartica — zašto ne radi

Nova kartica `4111111111111111` triggeruje **Klarna 3DS** authentication u ixopay test okruženju:
- Klarna 3DS otvara cross-origin iframe (`js.playground.klarna.com`)
- Cypress ne može da interaguje sa cross-origin iframeom
- Pattern: 1. run može proći (Klarna risk engine preskoči 3DS), 2. run pada
- **Jedino rješenje**: stored card (pre-tokenizovana, bez 3DS)
- `ServiceLine_NewCard.cy.js` implementacija je ispravna ali okruženje ne podržava konzistentno

---

## Poznati problemi

| Problem | Uzrok | Status |
|---------|-------|--------|
| Klarna 3DS sa novom karticom | ixopay/Klarna risk engine odlučuje per-transakciji | ❌ Ne rješivo iz Cypressa |
| `@getDictionaries` intercept uhvata rani poziv | Dialog učitava dict. na otvaranju, intercept se postavlja poslije | ✅ Riješeno sa `cy.wait(2500)` + `li[data-value]` guard |
| `.MuiButton-text` covered by backdrop | MUI modal backdrop pokriva dugme | ✅ Riješeno sa `{ force: true }` |

---

## Rules

- **Ne komitovati bez eksplicitnog zahtjeva**
- Uvijek `--headed --browser chrome`
- Kratki direktni odgovori (srpski)
