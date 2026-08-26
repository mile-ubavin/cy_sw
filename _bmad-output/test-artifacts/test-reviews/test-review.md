---
title: Test Quality Review — DH_EG Payment Suite
scope: cypress/e2e/DH/EG/Payment/**/*.cy.js
reviewer: Murat (Master Test Architect)
date: 2026-08-18
stepsCompleted: ['step-01-load-context', 'step-02-discover-tests', 'step-03-quality-evaluation', 'step-03f-aggregate-scores']
lastStep: 'step-03f-aggregate-scores'
lastSaved: '2026-08-18'
executionMode: sequential
inputDocuments:
  - .claude/skills/bmad-testarch-test-review/resources/knowledge/test-quality.md
  - .claude/skills/bmad-testarch-test-review/resources/knowledge/selector-resilience.md
  - .claude/skills/bmad-testarch-test-review/resources/knowledge/timing-debugging.md
  - .claude/skills/bmad-testarch-test-review/resources/knowledge/test-healing-patterns.md
  - _bmad/tea/config.yaml
files_reviewed:
  - cypress/e2e/DH/EG/Payment/e2e/DH_EG_Payment_TS_PersonalDocument_Upload_ServiceLine_VISA.cy.js
  - cypress/e2e/DH/EG/Payment/e2e/DH_EG_Payment_TS_PersonalDocument_Upload_Dictionary_305.cy.js
  - cypress/e2e/DH/EG/Payment/e2e/DH_EG_Payment_TS_PersonalDocument_Upload_ServiceLine_NewCard.cy.js
---

# Test Quality Review — DH_EG Payment Suite

## Executive Summary

| Dimension        | Score | Grade | Trend |
|------------------|-------|-------|-------|
| Determinism      | 42/100 | F | Blockers: hard waits, silenced errors, wall-clock deps |
| Isolation        | 55/100 | D | State pollution: no cleanup, hardcoded IDs, shared user |
| Maintainability  | 38/100 | F | Hashed CSS class `.e1sv65i456`, 80% code duplication |
| Performance      | 52/100 | D | 2-min hardcoded wait, no auth session reuse, monolithic tests |
| **OVERALL**      | **47/100** | **F** | **Suite radi, ali flakiness debt je visok** |

**Verdict:** Suite trenutno prolazi (3/3 zeleno kada se pokrene odvojenim procesima), ali nosi ozbiljne quality debt koji će eksplodirati kada:
- UI tim promijeni styled-components hash (`.e1sv65i456` će nestati)
- Backend `orderListWaitMs` postane varijabilan
- CI okruženje bude sporije od lokalnog
- Netko doda 4. Payment test — duplikacija se pretvara u maintenance košmar

**Recommendation:** Ne blokirati merge — testovi rade svoj posao. Ali **pre nego što se doda 4. spec, konsolidovati u shared command/fixture layer**. Detalji ispod.

---

## Dimension 1: Determinism (42/100 — F)

### HIGH severity

| # | File | Line | Issue | Impact |
|---|------|------|-------|--------|
| D1 | all 3 | 10, 5, 5 | `cy.on('uncaught:exception', () => false)` na početku svakog `it` | **Guta sve JS greške u browseru** — pravi backend bug može proći test |
| D2 | VISA | 181, 223 | `Date.now()` za `paymentCompletedAt` + comparison sa parsiranim wall-clock time iz UI | Test rezultat zavisi od trenutka izvršenja + timezone; failsafe (-10, 5) je band-aid |
| D3 | 305 | 161 | `cy.wait(orderListWaitMs || 120000)` — 2 min hard wait | Ne provjerava da li je order stvarno kreiran; ako je backend brži, gubi vrijeme |
| D4 | NewCard | 250 | `expect(diffMin, ...).to.be.within(-1, 3)` | Uži prozor od VISA/305 (-10, 5) — flakiness razlog otkriven, ali nije fiksiran u ovom fajlu |

### MEDIUM severity

| # | File | Line | Issue |
|---|------|------|-------|
| D5 | VISA | 28 | `cy.wait(2500)` prije `cy.wait('@getDictionaries')` — riješava race sa dialog-load intercept ali je magic number |
| D6 | VISA | 32, 160 | `cy.wait(1000)` za Material UI overlay |
| D7 | 305 | 250 | `cy.wait(5000)` STEP 19 "stay 5s" — pure demonstration wait |
| D8 | NewCard | 80, 100 | `cy.wait(2000)` x2 prije iframe interakcija |
| D9 | VISA | 93-97 | `.contains(/Serviceline/i)`, `/Digital/i`, `/Valid|Gültig/i` bez scope — matchuje bilo gdje na page |

### LOW severity

| # | File | Line | Issue |
|---|------|------|-------|
| D10 | all | — | `Cypress.env('paymentCompletedAt', Date.now())` mutira config runtime — mixing state + config |
| D11 | all | — | Regex sa umlaut alternativama (`Schlie[sß]en`) — dobro za lokalizaciju, ali ako se doda lang, treba širiti |

### Recommendations

1. **Ukloniti `cy.on('uncaught:exception', () => false)`** — ili scope-ovati na konkretan expected error (npr. `if (err.message.includes('ixopay iframe'))`). Trenutno se gute i pravi bugovi.
2. **Zamijeniti `cy.wait(120000)` sa polling** — `cy.recurse` ili `cy.intercept` na Orders API + `cy.wait('@ordersCreated')`. Backend zna kad je order kreiran; ne trebamo hardcode.
3. **Uskladiti timestamp assertion range** u sva 3 fajla — trenutno NewCard ima `(-1, 3)`, VISA/305 imaju `(-10, 5)`. Nije konzistentno.
4. **Route dictionary intercept preciznije** — trenutno `**/group/dictionary/tenant/**` hvata i early request i post-upload request. Filter po request method + URL pattern koji uključuje file name da bi razlika bila jasna.

---

## Dimension 2: Isolation (55/100 — D)

### HIGH severity

| # | File | Line | Issue |
|---|------|------|-------|
| I1 | all | — | **Nema cleanup-a** — svaki run kreira 1-3 orders u tenant "AQUA GmbH". Tabela raste, može nastati pagination problem. |
| I2 | all | — | Hardcoded `ABBA000100279311` — svi testovi šalju isti contract ID. Nemoguće razlikovati order iz VISA testa od 305 testa u audit logu. |
| I3 | all | — | Shared login user (`cy.loginToDH()`) — nema data isolation po testu |
| I4 | all | — | Hardcoded PDF fajlovi (`Serviceline-tid=AQUA_gid=ABBA000100279311.pdf`, `305_Dictionary_(...)`) — nema factory pattern |

### MEDIUM severity

| # | File | Line | Issue |
|---|------|------|-------|
| I5 | all | — | Nema `afterEach()` — ako test padne midway (npr. u payment iframe), user ostaje logovan, dialog otvoren |
| I6 | all | — | `Cypress.env('paymentCompletedAt')` živi kroz cijelu Cypress sesiju — ako testovi rade u istom `cypress run` batch-u, može precuriti |
| I7 | all | — | `paymentCompletedAt` set nakon "Payment successful" screen — ali backend order timestamp je 5 min ranije (razlog za range fix). Fundamentalno wrong reference point. |

### LOW severity

| # | File | Line | Issue |
|---|------|------|-------|
| I8 | VISA vs NewCard | — | Oba koriste ServiceLine + isti PDF — isti order sadržaj, nemoguće razlikovati u Orders List |

### Recommendations

1. **Cleanup nakon svakog testa** — `afterEach()` sa API poziv koji briše orders kreirane tokom testa (ako backend to omogućava), ili barem logout + close sve modale.
2. **Unique test data per run** — timestamp/uuid u contract ID (`AQUA_ABBA_${Cypress._.uniqueId()}`). Zahtjeva backend support.
3. **API-based login** — umjesto `cy.loginToDH()` kroz UI, kreirati `cy.apiLoginToDH()` koji radi cookie/session direktno. Uštedi ~10s po testu i eliminiše dependency na login UI.
4. **Baseline reset** — pre testa, cleanup Orders List za današnji datum putem API-ja.

---

## Dimension 3: Maintainability (38/100 — F)

### HIGH severity

| # | File | Line | Issue |
|---|------|------|-------|
| M1 | VISA | 70, 79, 90, 91, 100 | **`.e1sv65i456`** — styled-components/emotion hashed class. Mijenja se pri **svakom** React build-u kad se stilovi promijene. Test će početi padati bez ikakve promjene u testu. |
| M2 | 305 | 51, 60, 72, 73, 82 | Isti hash `.e1sv65i456` — **duplirano u 305 fajlu** |
| M3 | all 3 | — | **80%+ duplikacija koda** — login, upload dialog, Confirm & send, prices view, payment iframe, orders list, logout — sve identično. Bug fix u jednom fajlu mora se propagirati u druga 2. |
| M4 | NewCard | 111-176 | Direct `contentDocument.body.querySelector` + manual `dispatchEvent(MouseEvent)` — bypassuje Cypress lifecycle. Kad se ixopay UI promijeni, treba debagovati kroz raw DOM. |
| M5 | VISA | 141-158 | Isti pattern, iako je stored card jednostavniji |

### MEDIUM severity

| # | File | Line | Issue |
|---|------|------|-------|
| M6 | all | — | Test veličina: VISA 290 / 305 265 / NewCard 258 lines. Ispod 300 limita, ali blizu — kad se doda validacija ili error handling, pucanju |
| M7 | all | — | Selector mix: `#workspace-personal-document-action` (ID), `.e1sv65i456` (hash CSS), `.linkbtn--primary` (semantic class), `[role="menuitem"]` (ARIA), text regex. Nema doc/konvencije. |
| M8 | VISA | 195-197 | `cy.get('nav, aside, [class*="sidebar"], [class*="menu"]')` — 4 alternativna selectora u istom pozivu, "shotgun" pristup |
| M9 | VISA | 222-274 | 50+ linija nested `.then()` — kompleksna logika unutar Cypress callback, teška za debug |
| M10 | all | — | Komentari opisuju *implementaciju* ("Material UI select needs time to open overlay", "Stored/tokenized cards bypass Klarna 3DS") — vrijedna informacija, ali će zastariti bez PR contexta |

### LOW severity

| # | File | Line | Issue |
|---|------|------|-------|
| M11 | all | — | Ponavljajući regex-i (`/Weiter|Next/i`, `/Abmelden|Logout/i`, `/Payment successful|Zahlung erfolgreich/i`) — treba constants file |
| M12 | all | — | `Cypress.$(body).find(...)` mix jQuery i Cypress API — funkcionalno ok, ali nekonzistentno |

### Recommendations

1. **CRITICAL: Zamijeniti `.e1sv65i456` sa stabilnim selectorom** — traži od dev tima `data-testid="confirm-send-table"` ili sličan atribut. Trenutno je ovo timing bomba.
2. **Konsolidovati u shared commands** — kreirati u `cypress/support/commands.js`:
   - `cy.dhCompletePaymentFlow({ dictionary, cardType })` — orchestrator
   - `cy.dhSelectStoredCard()`, `cy.dhFillNewCard(card)` — payment segments
   - `cy.dhValidateOrderInList({ price, timestamp })` — Orders List validation
   - `cy.dhLogoutAndValidate()` — logout + home check
3. **Split monolithic `it()`** — trenutno 1 `it` = cijeli flow. Preporuka: koristiti fixtures da `describe` ima setup (login + upload + confirm) u `beforeEach`, a `it` blokovi validiraju samo pojedine faze (order timestamp, order price, logout redirect). Failure poruke postaju precizne.
4. **Selector policy dokument** — u `HANDOFF.md` ili `README` kratki dio: "Prefer `#id` > `[data-testid]` > `[role]` > text regex. Never use styled-components hashes. If hash is only option, request testid from dev team."

---

## Dimension 4: Performance (52/100 — D)

### HIGH severity

| # | File | Line | Issue |
|---|------|------|-------|
| P1 | VISA | 192 | `cy.wait(orderListWaitMs || 120000)` — **2 minuta hardcoded** čekanje za backend order creation. Ako backend završi za 30s, gubimo 90s. |
| P2 | 305 | 161 | Isti pattern |
| P3 | NewCard | 197 | Isti pattern |
| P4 | all | — | Test trajanje ~2:20 (VISA), ~2:26 (305) — **iznad `test-quality.md` limita od 1.5 min**. Definition of Done breach. |
| P5 | all | — | Login preko UI (`cy.loginToDH`) — ~10s po testu. Nema `cy.session()` cache. |

### MEDIUM severity

| # | File | Line | Issue |
|---|------|------|-------|
| P6 | VISA | 28, 32, 160 | Zbir hard waits u payment fazi: 2500 + 1000 + 1000 = ~4.5s pure sleep |
| P7 | 305 | 250 | `cy.wait(5000)` "stay 5s" — čist demo delay bez svrhe |
| P8 | NewCard | 80, 100 | 2000ms x2 = 4s |
| P9 | all | — | Sekvencijalni upload → intercept → dropdown → click flow — nema paralelizacije. Cypress dozvoljava aliases, mogli bismo pripremiti stub-ove prije `cy.visit`. |

### LOW severity

| # | File | Line | Issue |
|---|------|------|-------|
| P10 | all | — | `orderListWaitMs` env var postoji — može se skratiti u CI, ali default 120s je conservative |
| P11 | VISA | 219, 230 | `cy.get('table tbody tr', { timeout: 30000 })` + retry loop iznutra — Cypress već ima built-in retry, dupliranje |

### Recommendations

1. **`cy.session()` za login** — Cypress 12+ preporučeni pattern:
   ```javascript
   cy.session('dh-master-user', () => {
     cy.visit(Cypress.env('dh_baseUrl'));
     cy.dismissCookieBar();
     cy.loginToDH();
   });
   ```
   Očekivana ušteda: 8-10s po testu, tj. ~25s ukupno na 3-spec run.

2. **Zamijeniti `cy.wait(120000)` sa recursive polling** —
   ```javascript
   const waitForOrder = (todayStr) => {
     cy.reload();
     cy.get('table tbody tr').then(($rows) => {
       const found = [...$rows].some(r => r.textContent.includes(todayStr));
       if (!found) {
         cy.wait(5000);
         waitForOrder(todayStr);  // recurse
       }
     });
   };
   ```
   Ili ako backend ima `/api/orders` endpoint: `cy.intercept('GET', '**/api/orders').as('orders')` + `cy.wait('@orders').its('response.body').should('include', ...)`.

3. **Ukloniti `cy.wait(5000)` iz STEP 19 u 305 testu** — pure demo wait bez validacije. Ako je za screenshot, koristiti `cy.screenshot()` direktno.

4. **Batch pripremi test data** — svih 3 testa upload različitih PDF-ova; ako backend ima batch upload API, koristiti API setup za state.

---

## Aggregation & Priority Fixes

### 🔴 Priority 1 (do 2 sedmice — sprint next)

| # | Action | Files | Effort |
|---|--------|-------|--------|
| P1.1 | Remove `cy.on('uncaught:exception', () => false)` ili scope na expected errors | all 3 | 1h |
| P1.2 | Replace `.e1sv65i456` hashed class — request `data-testid` from dev | all 3 | 2h + FE PR |
| P1.3 | Replace `cy.wait(120000)` sa polling ili intercept | all 3 | 3h |
| P1.4 | Uskladiti timestamp range `(-10, 5)` u NewCard | NewCard | 2 min |

### 🟡 Priority 2 (sljedeći mjesec)

| # | Action | Files | Effort |
|---|--------|-------|--------|
| P2.1 | Extract `cy.dhCompletePaymentFlow()` shared command | commands.js | 4h |
| P2.2 | Add `cy.session()` login cache | commands.js | 1h |
| P2.3 | Add `afterEach` cleanup / logout guard | all 3 | 1h |
| P2.4 | Split monolithic `it()` na 3-4 focused `it()` per spec | all 3 | 3h |

### 🟢 Priority 3 (backlog / continuous improvement)

| # | Action | Effort |
|---|--------|--------|
| P3.1 | Constants file za regex-e (`WEITER_NEXT`, `LOGOUT`, itd.) | 30 min |
| P3.2 | Selector policy dokument u `HANDOFF.md` | 20 min |
| P3.3 | API-based test data factory | 4h |
| P3.4 | Add `cypress-terminal-report` za bolji CI log output | 30 min |

---

## Suggested Follow-Ups

- **Route to `trace` skill** — coverage mapping story → test još nije urađen za Payment feature. Preporuka: sljedeći put pokrenuti `TR` (Trace Coverage) da vidimo koji AC su nepokrivena.
- **Route to `TA` skill** — kad se Klarna 3DS test dogovori sa timom (mock endpoint ili disabled u test env), pokrenuti `TA` (Test Automation) da generiše NewCard varijantu bez cross-origin problema.
- **NFR audit (`NR`)** — payment tokovi imaju security implikacije. Preporuka: pokrenuti `NR` (NFR Evidence Audit) da provjerimo da li su PCI, GDPR, i secure logging validirani na test nivou.

---

## Signatures

| Reviewer | Date | Notes |
|----------|------|-------|
| Murat (Master Test Architect) | 2026-08-18 | Suite pass rate 100% ali quality debt visok. Ne blokirati, ali adresirati P1 prije novih Payment specova. |
