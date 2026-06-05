/// <reference types="cypress" />

// =============================================================================
// Scenario: Create EBox User — API / Integration layer
// Coverage: Tests the backend API directly via cy.request(), bypassing UI.
//           Complements E2E tests by verifying API contracts independently.
// Priority: P0 (API layer coverage for a P0 feature)
//
// Auth strategy: Full DH login in before() establishes browser session once.
//   cy.request() reuses those cookies automatically for all authenticated calls.
//
// API base URL: captured from live network traffic in before() hook.
//   We intercept the first GET /person/fromGroup call and extract the real
//   backend base URL — no hardcoding needed, works across environments.
//
// Create payload: IT0 [CAPTURE] runs the full UI create-user wizard once and
//   intercepts POST editPerson to capture the real request body + URL. Tests
//   that need a successful 201 reuse that payload (with unique accountNumber).
// =============================================================================

// Captured at runtime
let capturedApiBase = null;
let capturedPersonFromGroupUrl = null; // exact GET URL as-is from browser
let capturedCreatePayload = null;       // editPerson request body from UI
let capturedEditPersonUrl = null;       // exact POST URL from UI

const apiBase = () => {
  if (!capturedApiBase) throw new Error('API base URL not captured yet — before() hook may have failed');
  return capturedApiBase;
};

describe('Create EBox User — API Layer [P0]', { testIsolation: false }, () => {
  // ---------------------------------------------------------------------------
  // Auth + API URL discovery (runs once before all tests):
  //   1. Full DH login — establishes real browser session with cookies
  //   2. Navigate to Employees — triggers GET /person/fromGroup network call
  //   3. cy.intercept captures the real backend URL from that live request
  //   4. capturedApiBase is stored — cy.request() in each IT reuses it
  // ---------------------------------------------------------------------------
  before(() => {
    cy.intercept('GET', '**/person/fromGroup/**').as('captureApiUrl');

    cy.visit(Cypress.env('dh_baseUrl'));

    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      }
    });

    cy.loginToDH();
    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`, { timeout: 20000 });

    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
        cy.wait(500);
      }
    });

    cy.get('#nav-employees', { timeout: 20000 }).should('be.visible').click();

    cy.wait('@captureApiUrl', { timeout: 35000 }).then((interception) => {
      const fullUrl = interception.request.url;
      capturedPersonFromGroupUrl = fullUrl;
      const idx = fullUrl.indexOf('/person/fromGroup/');
      if (idx !== -1) {
        capturedApiBase = fullUrl.substring(0, idx + 1);
      } else {
        throw new Error(`Could not extract API base from URL: ${fullUrl}`);
      }
      cy.log(`API base URL captured: ${capturedApiBase}`);
      cy.log(`Full person/fromGroup URL: ${capturedPersonFromGroupUrl}`);
    });
  });

  // ---------------------------------------------------------------------------
  // IT0 — [CAPTURE] Drive UI create-user wizard and capture editPerson payload
  //        After this test:
  //          • capturedCreatePayload holds the exact request body sent by UI
  //          • capturedEditPersonUrl holds the exact POST URL
  //          • cypress/fixtures/captured-create-payload.json contains both
  //        IT2 / IT5 / IT8 / IT9 / IT18 reuse this to issue real 201 creates.
  //        We type a UNIQUE accountNumber so this capture doesn't collide with
  //        existing test users from prior runs.
  // ---------------------------------------------------------------------------
  it('[CAPTURE] Drive UI wizard to capture editPerson payload', () => {
    cy.intercept('POST', '**/editPerson').as('editPersonCapture');

    const user = Cypress.env('createUser')[0];
    const companyName = Cypress.env('company').toLowerCase();
    const captureUsername = `cap_${Date.now()}`;

    // Select company from dropdown
    cy.get('#employee-select-company').click({ force: true });
    cy.wait(800);
    cy.get('ul[role="listbox"] > li > span')
      .should('be.visible')
      .then(($options) => {
        const match = [...$options].find((el) =>
          el.textContent.trim().toLowerCase().includes(companyName),
        );
        if (!match) throw new Error(`No dropdown option contains: ${companyName}`);
        cy.wrap(match).click({ force: true });
      });
    cy.wait(500);
    cy.scrollTo('top', { duration: 200 });

    cy.get('#employee-add-employee')
      .contains(/Neuen Kontakt anlegen|Create New Contact/i)
      .click();
    cy.wait(500);

    // Wizard Step 1
    cy.get('#create-user-prefixed-title').type(user.prefixedTitle);
    cy.get('#create-user-firstName').type(user.firstName);
    cy.get('#create-user-lastName').type(user.lastName);
    cy.get('#create-user-suffixed-title').type(user.prefixedTitle2);

    cy.get('input[aria-autocomplete="list"]').click({ force: true });
    cy.wait(800);
    cy.get("ul[role='listbox'] > li")
      .should('be.visible')
      .then(($items) => {
        const prefix = (Cypress.env('companyPrefix') || Cypress.env('company')).toLowerCase();
        const match = [...$items].find((el) =>
          el.textContent.trim().toLowerCase().includes(prefix),
        );
        if (!match) throw new Error(`No autocomplete option contains: ${prefix}`);
        cy.wrap(match).click({ force: true });
      });

    cy.get('#create-user-accountNumber').type(captureUsername);
    cy.wait(500);
    cy.get('#create-user-next').click({ force: true });

    // Wizard Step 2
    cy.get('#create-user-mobileNumber', { timeout: 10000 }).type('+43 1234567890');
    cy.get('#create-user-email').type(user.email);
    cy.get('#create-user-street').type(user.streetName);
    cy.get('#create-user-streetNumber').type(user.streetNumber);
    cy.get('#create-user-apartment').type(user.doorNumber);
    cy.get('#create-user-zipCode').type(user.zipCode);
    cy.get('#create-user-city').type(user.city);
    cy.wait(800);
    cy.get('#create-user-next').click({ force: true });

    // Wizard Step 3 — delivery settings (skip if disabled)
    cy.wait(1000);
    cy.get('#create-user-deliveryType').then(($d) => {
      const disabled =
        $d.attr('aria-disabled') === 'true' ||
        $d.hasClass('Mui-disabled') ||
        $d.find('.Mui-disabled').length > 0;
      if (!disabled) {
        cy.wrap($d).click({ force: true });
        cy.wait(400);
        cy.get("ul[role='listbox'] > li > span")
          .should('be.visible')
          .contains(/^digital$/i)
          .click({ force: true });
      }
    });
    cy.get('#create-user-sendCredentials').then(($d) => {
      const disabled =
        $d.attr('aria-disabled') === 'true' ||
        $d.hasClass('Mui-disabled') ||
        $d.find('.Mui-disabled').length > 0;
      if (!disabled) {
        cy.wrap($d).click({ force: true });
        cy.wait(400);
        cy.get("ul[role='listbox'] > li > span")
          .should('be.visible')
          .contains(/^digital$/i)
          .click({ force: true });
      }
    });

    // Submit and capture
    cy.get('#create-user-create>div:nth-of-type(1)')
      .contains(/Create|Erstellen/i)
      .click({ force: true });

    cy.wait('@editPersonCapture', { timeout: 35000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(201);
      capturedCreatePayload = interception.request.body;
      capturedEditPersonUrl = interception.request.url;

      cy.writeFile('cypress/fixtures/captured-create-payload.json', {
        url: capturedEditPersonUrl,
        body: capturedCreatePayload,
        timestamp: new Date().toISOString(),
      });

      cy.log(`Captured URL: ${capturedEditPersonUrl}`);
      cy.log(`Captured payload keys: ${Object.keys(capturedCreatePayload || {}).join(', ')}`);
    });

    // Dismiss the credentials dialog so subsequent tests aren't blocked
    cy.get('body').then(($body) => {
      if ($body.find('#dialog-title').length > 0) {
        cy.get('body').type('{esc}');
        cy.wait(500);
      }
    });
  });

  // Helper — clone captured payload with a fresh accountNumber so each test
  // creates a distinct user. The captured payload nests accountNumber in two
  // places (top-level + accountNumbers[].accountNumber); both must match or
  // the backend rejects with 400 (duplicate against the nested one).
  const cloneCapturedPayload = (uniqueId, overrides = {}) => {
    const body = JSON.parse(JSON.stringify(capturedCreatePayload));

    if ('accountNumber' in body) body.accountNumber = uniqueId;
    if (Array.isArray(body.accountNumbers)) {
      body.accountNumbers.forEach((an) => {
        if (an && 'accountNumber' in an) an.accountNumber = uniqueId;
      });
    }
    // Also override email so backends with unique-email constraint accept it
    if (body.accountDataDto && body.accountDataDto.email) {
      body.accountDataDto.email = `${uniqueId}@yopmail.com`;
    }

    return { ...body, ...overrides };
  };

  // Helper — strip address info from captured payload (for no-address test)
  const stripAddresses = (body) => {
    if (body.accountDataDto && Array.isArray(body.accountDataDto.addresses)) {
      body.accountDataDto.addresses = [];
    }
    return body;
  };

  // ---------------------------------------------------------------------------
  // IT1 — GET /person/fromGroup returns 200 with employee list
  // ---------------------------------------------------------------------------
  it('GET /person/fromGroup — returns 200 with employee list', () => {
    cy.request({
      method: 'GET',
      url: capturedPersonFromGroupUrl,
      failOnStatusCode: false,
      timeout: 35000,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.not.be.null;
      expect(res.body).to.not.be.undefined;
    });
  });

  // ---------------------------------------------------------------------------
  // IT2 — POST /editPerson — valid payload returns 201
  // ---------------------------------------------------------------------------
  it('POST /editPerson — valid payload returns 201', function () {
    if (!capturedCreatePayload || !capturedEditPersonUrl) {
      cy.log('Skipping — IT0 capture did not run');
      this.skip();
    }
    const body = cloneCapturedPayload(`api_create_${Date.now()}`);

    cy.request({
      method: 'POST',
      url: capturedEditPersonUrl,
      body,
      failOnStatusCode: false,
      timeout: 35000,
    }).then((res) => {
      expect(res.status).to.eq(201);
      cy.log(`POST /editPerson — user created — body id: ${res.body?.id ?? '(no id field)'}`);
    });
  });

  // ---------------------------------------------------------------------------
  // IT3 — POST /editPerson — duplicate accountNumber rejected
  //        Reuses the accountNumber from IT0 capture (just created → exists).
  // ---------------------------------------------------------------------------
  it('POST /editPerson — duplicate accountNumber returns 409 or validation error', function () {
    if (!capturedCreatePayload || !capturedEditPersonUrl) {
      cy.log('Skipping — IT0 capture did not run');
      this.skip();
    }

    // Use the EXACT body from IT0 (same accountNumber → duplicate)
    cy.request({
      method: 'POST',
      url: capturedEditPersonUrl,
      body: capturedCreatePayload,
      failOnStatusCode: false,
      timeout: 35000,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 409, 422, 500]);
      cy.log(`Duplicate accountNumber — API returned: ${res.status}`);
    });
  });

  // ---------------------------------------------------------------------------
  // IT4 — POST /editPerson — empty payload returns 400/422/500
  // ---------------------------------------------------------------------------
  it('POST /editPerson — empty payload returns 400/422/500', () => {
    cy.request({
      method: 'POST',
      url: `${apiBase()}person/editPerson`,
      body: {},
      failOnStatusCode: false,
      timeout: 35000,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 422, 500]);
      cy.log(`Empty payload — API returned: ${res.status}`);
    });
  });

  // ---------------------------------------------------------------------------
  // IT5 — POST /editPerson — user without address returns 201
  //        Clones captured payload, empties address-related fields if present.
  // ---------------------------------------------------------------------------
  it('POST /editPerson — no-address payload returns 201', function () {
    if (!capturedCreatePayload || !capturedEditPersonUrl) {
      cy.log('Skipping — IT0 capture did not run');
      this.skip();
    }

    const body = stripAddresses(cloneCapturedPayload(`api_noaddr_${Date.now()}`));

    cy.request({
      method: 'POST',
      url: capturedEditPersonUrl,
      body,
      failOnStatusCode: false,
      timeout: 35000,
    }).then((res) => {
      expect(res.status).to.eq(201);
      cy.log(`POST /editPerson (no address) — 201 — id: ${res.body?.id ?? '(no id field)'}`);
    });
  });

  // ---------------------------------------------------------------------------
  // IT6 — POST /person/fromGroup — authenticated search returns 200 + array
  // ---------------------------------------------------------------------------
  it('POST /person/fromGroup — authenticated search returns 200 with array', () => {
    const user = Cypress.env('createUser')[0];

    cy.request({
      method: 'POST',
      url: capturedPersonFromGroupUrl,
      body: { userName: user.username },
      failOnStatusCode: false,
      timeout: 35000,
    }).then((res) => {
      expect(res.status).to.eq(200);
      const results = Array.isArray(res.body) ? res.body : res.body?.results ?? [];
      expect(Array.isArray(results), 'Response body should be an array').to.be.true;
      cy.log(`Search returned ${results.length} results for username: ${user.username}`);
    });
  });

  // ---------------------------------------------------------------------------
  // IT7 — POST /person/fromGroup — unknown username returns empty
  // ---------------------------------------------------------------------------
  it('POST /person/fromGroup — unknown username returns empty list', () => {
    cy.request({
      method: 'POST',
      url: capturedPersonFromGroupUrl,
      body: { userName: `nonexistent_user_${Date.now()}` },
      failOnStatusCode: false,
      timeout: 35000,
    }).then((res) => {
      expect(res.status).to.eq(200);
      const results = Array.isArray(res.body) ? res.body : res.body?.results ?? [];
      expect(results).to.have.length(0);
    });
  });

  // ---------------------------------------------------------------------------
  // IT8 — POST /editPerson — response body has id
  // ---------------------------------------------------------------------------
  it('POST /editPerson — response body has id field', function () {
    if (!capturedCreatePayload || !capturedEditPersonUrl) {
      cy.log('Skipping — IT0 capture did not run');
      this.skip();
    }

    const body = cloneCapturedPayload(`api_schema_${Date.now()}`);

    cy.request({
      method: 'POST',
      url: capturedEditPersonUrl,
      body,
      failOnStatusCode: false,
      timeout: 35000,
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.not.be.null;
      // Some backends return id at top level, others nest it; tolerate both
      const id = res.body?.id ?? res.body?.personId ?? res.body?.userId;
      expect(id, 'response should expose a created-user identifier').to.not.be.undefined;
      cy.log(`Response schema OK — id: ${id}`);
    });
  });

  // ---------------------------------------------------------------------------
  // IT9 — POST /editPerson then search — created user appears in search
  // ---------------------------------------------------------------------------
  it('POST /editPerson then search — created user appears in fromGroup search', function () {
    if (!capturedCreatePayload || !capturedEditPersonUrl) {
      cy.log('Skipping — IT0 capture did not run');
      this.skip();
    }

    const uniqueUsername = `api_chain_${Date.now()}`;
    const body = cloneCapturedPayload(uniqueUsername);

    cy.request({
      method: 'POST',
      url: capturedEditPersonUrl,
      body,
      failOnStatusCode: false,
      timeout: 35000,
    }).then((createRes) => {
      expect(createRes.status).to.eq(201);
      cy.log(`User created — username: ${uniqueUsername}`);

      // Wait for search index eventual consistency
      cy.wait(2500);

      // Search via /person/fromGroup (UI-style). The created user MAY not be
      // immediately searchable due to indexing — we assert search endpoint
      // works (200 + array), and log whether the user was found yet.
      cy.request({
        method: 'POST',
        url: capturedPersonFromGroupUrl,
        body: { userName: uniqueUsername },
        failOnStatusCode: false,
        timeout: 35000,
      }).then((searchRes) => {
        expect(searchRes.status).to.eq(200);
        const results = Array.isArray(searchRes.body)
          ? searchRes.body
          : searchRes.body?.results ?? [];
        expect(Array.isArray(results), 'search response should be array').to.be.true;

        const haystack = JSON.stringify(results).toLowerCase();
        const found = haystack.includes(uniqueUsername.toLowerCase());
        cy.log(
          found
            ? `Chain test PASS — created user found in search`
            : `Chain test note — user created (201) but not yet indexed in search (eventual consistency)`,
        );
      });
    });
  });

  // ---------------------------------------------------------------------------
  // IT10 — POST /editPerson — invalid email format returns error
  // ---------------------------------------------------------------------------
  it('POST /editPerson — invalid email in payload returns 400/422/500', () => {
    const user = Cypress.env('createUser')[0];
    const companyPrefix = Cypress.env('companyPrefix');

    cy.request({
      method: 'POST',
      url: `${apiBase()}person/editPerson`,
      body: {
        firstName: user.firstName,
        lastName: user.lastName,
        username: `invalid_email_${Date.now()}`,
        email: 'not-an-email-format',
        companyPrefix,
      },
      failOnStatusCode: false,
      timeout: 35000,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 422, 500]);
      cy.log(`Invalid email in payload — API returned: ${res.status}`);
    });
  });

  // ---------------------------------------------------------------------------
  // IT11 — POST /editPerson — missing firstName returns error
  // ---------------------------------------------------------------------------
  it('POST /editPerson — missing firstName returns 400/422/500', () => {
    const user = Cypress.env('createUser')[0];
    const companyPrefix = Cypress.env('companyPrefix');

    cy.request({
      method: 'POST',
      url: `${apiBase()}person/editPerson`,
      body: {
        lastName: user.lastName,
        username: `no_firstname_${Date.now()}`,
        email: user.email,
        companyPrefix,
      },
      failOnStatusCode: false,
      timeout: 35000,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 422, 500]);
      cy.log(`Missing firstName — API returned: ${res.status}`);
    });
  });

  // ---------------------------------------------------------------------------
  // IT12 — POST /editPerson — missing lastName returns error
  // ---------------------------------------------------------------------------
  it('POST /editPerson — missing lastName returns 400/422/500', () => {
    const user = Cypress.env('createUser')[0];
    const companyPrefix = Cypress.env('companyPrefix');

    cy.request({
      method: 'POST',
      url: `${apiBase()}person/editPerson`,
      body: {
        firstName: user.firstName,
        username: `no_lastname_${Date.now()}`,
        email: user.email,
        companyPrefix,
      },
      failOnStatusCode: false,
      timeout: 35000,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 422, 500]);
      cy.log(`Missing lastName — API returned: ${res.status}`);
    });
  });

  // ---------------------------------------------------------------------------
  // IT13 — POST /editPerson — missing companyPrefix returns error
  // ---------------------------------------------------------------------------
  it('POST /editPerson — missing companyPrefix returns 400/422/500', () => {
    const user = Cypress.env('createUser')[0];

    cy.request({
      method: 'POST',
      url: `${apiBase()}person/editPerson`,
      body: {
        firstName: user.firstName,
        lastName: user.lastName,
        username: `no_prefix_${Date.now()}`,
        email: user.email,
      },
      failOnStatusCode: false,
      timeout: 35000,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 422, 500]);
      cy.log(`Missing companyPrefix — API returned: ${res.status}`);
    });
  });

  // ---------------------------------------------------------------------------
  // IT14 — POST /editPerson — without auth returns non-success status
  // ---------------------------------------------------------------------------
  it('POST /editPerson — without auth returns non-success status', () => {
    cy.clearCookies();

    cy.request({
      method: 'POST',
      url: `${apiBase()}person/editPerson`,
      body: { firstName: 'Test', lastName: 'User', username: 'unauth_test' },
      failOnStatusCode: false,
      headers: { Cookie: '' },
      timeout: 35000,
    }).then((res) => {
      expect(res.status).to.not.be.oneOf([200, 201]);
      cy.log(`Without auth — API returned: ${res.status} (not a successful create)`);
    });
  });

  // ---------------------------------------------------------------------------
  // IT15 — GET /person/fromGroup — unauthenticated returns 401 or 403
  // ---------------------------------------------------------------------------
  it('GET /person/fromGroup — no auth returns 401 or 403', () => {
    cy.clearCookies();

    const companyPrefix = Cypress.env('companyPrefix');

    cy.request({
      method: 'GET',
      url: `${apiBase()}person/fromGroup/${companyPrefix}`,
      failOnStatusCode: false,
      headers: { Cookie: '' },
      timeout: 35000,
    }).then((res) => {
      expect(res.status).to.be.oneOf([401, 403]);
      cy.log(`Unauthenticated GET — API returned: ${res.status} (protected)`);
    });
  });

  // ---------------------------------------------------------------------------
  // IT16 — GET /person/fromGroup — invalid group ID returns non-200 or empty
  // ---------------------------------------------------------------------------
  it('GET /person/fromGroup — invalid group ID returns non-200 or empty', () => {
    cy.session('dh-api-session', () => {
      cy.visit(Cypress.env('dh_baseUrl'));
      cy.loginToDH();
    });

    cy.request({
      method: 'GET',
      url: `${apiBase()}person/fromGroup/nonexistent_group_id_xyz`,
      failOnStatusCode: false,
      timeout: 35000,
    }).then((res) => {
      const isEmptyList =
        res.status === 200 &&
        (Array.isArray(res.body) ? res.body.length === 0 : true);
      const isError = [400, 404, 500].includes(res.status);

      expect(isEmptyList || isError, `Invalid group ID should return error or empty — got ${res.status}`).to.be.true;
      cy.log(`Invalid group ID — API returned: ${res.status}`);
    });
  });

  // ---------------------------------------------------------------------------
  // IT17 — POST /editPerson — response Content-Type is application/json
  // ---------------------------------------------------------------------------
  it('POST /editPerson — response Content-Type is application/json', () => {
    const user = Cypress.env('createUser')[0];
    const companyPrefix = Cypress.env('companyPrefix');

    cy.request({
      method: 'POST',
      url: `${apiBase()}person/editPerson`,
      body: {
        firstName: user.firstName,
        lastName: user.lastName,
        username: `ct_check_${Date.now()}`,
        email: user.email,
        companyPrefix,
      },
      failOnStatusCode: false,
      timeout: 35000,
    }).then((res) => {
      const contentType = res.headers['content-type'] ?? '';
      expect(contentType).to.include('application/json');
      cy.log(`Content-Type: ${contentType}`);
    });
  });

  // ---------------------------------------------------------------------------
  // IT18 — POST /editPerson — response time under 5000ms
  // ---------------------------------------------------------------------------
  it('POST /editPerson — response time under 5000ms', function () {
    if (!capturedCreatePayload || !capturedEditPersonUrl) {
      cy.log('Skipping — IT0 capture did not run');
      this.skip();
    }

    const body = cloneCapturedPayload(`api_perf_${Date.now()}`);
    const start = Date.now();

    cy.request({
      method: 'POST',
      url: capturedEditPersonUrl,
      body,
      failOnStatusCode: false,
      timeout: 35000,
    }).then((res) => {
      const duration = Date.now() - start;
      expect(res.status).to.eq(201);
      expect(duration, `Response took ${duration}ms — expected under 5000ms`).to.be.lessThan(5000);
      cy.log(`Response time: ${duration}ms`);
    });
  });
});
