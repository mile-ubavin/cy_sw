/// <reference types="cypress" />

// =============================================================================
// Scenario: Create EBox User — API / Integration layer
// Coverage: Tests the backend API directly via cy.request(), bypassing UI.
//           Complements E2E tests by verifying API contracts independently.
// Priority: P0 (API layer coverage for a P0 feature)
//
// Auth strategy: cy.session() establishes DH browser session once per suite,
//   then cy.request() reuses those cookies automatically.
//
// API base URL: derived from dh_baseUrl by swapping /fe. → /be.
//   e.g. https://host/fe.documenthub_t/ → https://host/be.documenthub_t/
//   Adjust the apiBase() helper below if the actual backend path differs.
// =============================================================================

const apiBase = () => Cypress.env('dh_baseUrl').replace('/fe.', '/be.');

describe('Create EBox User — API Layer [P0]', () => {
  // ---------------------------------------------------------------------------
  // Auth: establish DH session once for the whole suite
  // ---------------------------------------------------------------------------
  before(() => {
    cy.session('dh-api-session', () => {
      cy.visit(Cypress.env('dh_baseUrl'));
      cy.loginToDH();
      cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);
    });
  });

  // ---------------------------------------------------------------------------
  // IT1 — GET /person/fromGroup — employee list loads successfully
  // ---------------------------------------------------------------------------
  it('GET /person/fromGroup — returns 200 with employee list', () => {
    const companyPrefix = Cypress.env('companyPrefix');

    cy.request({
      method: 'GET',
      url: `${apiBase()}person/fromGroup/${companyPrefix}`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an('array').or.to.be.an('object');
      cy.log(`GET /person/fromGroup — ${res.status} — ${JSON.stringify(res.body).slice(0, 200)}`);
    });
  });

  // ---------------------------------------------------------------------------
  // IT2 — POST /editPerson — create user returns 201
  // ---------------------------------------------------------------------------
  it('POST /editPerson — valid payload returns 201', () => {
    const user = Cypress.env('createUser')[0];
    const companyPrefix = Cypress.env('companyPrefix');

    const payload = {
      firstName: user.firstName,
      lastName: user.lastName,
      username: `api_${user.username}_${Date.now()}`,
      email: user.email,
      companyPrefix,
      streetName: user.streetName,
      streetNumber: user.streetNumber,
      zipCode: user.zipCode,
      city: user.city,
    };

    cy.request({
      method: 'POST',
      url: `${apiBase()}editPerson`,
      body: payload,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.have.property('id').and.to.not.be.null;
      cy.log(`POST /editPerson — user created — id: ${res.body.id}`);
    });
  });

  // ---------------------------------------------------------------------------
  // IT3 — POST /editPerson — duplicate accountNumber returns error
  // ---------------------------------------------------------------------------
  it('POST /editPerson — duplicate accountNumber returns 409 or validation error', () => {
    const user = Cypress.env('createUser')[0];
    const companyPrefix = Cypress.env('companyPrefix');

    const payload = {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      companyPrefix,
    };

    cy.request({
      method: 'POST',
      url: `${apiBase()}editPerson`,
      body: payload,
      failOnStatusCode: false,
    }).then((res) => {
      // Accept 409 Conflict or 400 Bad Request with validation message
      expect(res.status).to.be.oneOf([400, 409, 422]);
      cy.log(`Duplicate accountNumber — API returned: ${res.status}`);
    });
  });

  // ---------------------------------------------------------------------------
  // IT4 — POST /editPerson — missing required fields returns 400
  // ---------------------------------------------------------------------------
  it('POST /editPerson — missing required fields returns 400', () => {
    cy.request({
      method: 'POST',
      url: `${apiBase()}editPerson`,
      body: {},
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 422]);
      cy.log(`Missing fields — API returned: ${res.status}`);
    });
  });

  // ---------------------------------------------------------------------------
  // IT5 — POST /editPerson — user without address returns 201
  //       Verifies the same API contract as the No-Address E2E test
  // ---------------------------------------------------------------------------
  it('POST /editPerson — no address payload returns 201', () => {
    const user = Cypress.env('createUserNoAddress')[0];
    const companyPrefix = Cypress.env('companyPrefix');

    const payload = {
      firstName: user.firstName,
      lastName: user.lastName,
      username: `api_${user.username}_${Date.now()}`,
      email: user.email,
      companyPrefix,
      // address fields deliberately omitted
    };

    cy.request({
      method: 'POST',
      url: `${apiBase()}editPerson`,
      body: payload,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(201);
      cy.log(`POST /editPerson (no address) — 201 — id: ${res.body.id}`);
    });
  });

  // ---------------------------------------------------------------------------
  // IT6 — POST /person/fromGroup — search by username returns result
  // ---------------------------------------------------------------------------
  it('POST /person/fromGroup — search by existing username returns match', () => {
    const user = Cypress.env('createUser')[0];
    const companyPrefix = Cypress.env('companyPrefix');

    cy.request({
      method: 'POST',
      url: `${apiBase()}person/fromGroup/${companyPrefix}`,
      body: { userName: user.username },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      const results = Array.isArray(res.body) ? res.body : res.body?.results ?? [];
      const found = results.some(
        (r) => r.username === user.username || r.accountNumber === user.username,
      );
      expect(found, `Expected to find user ${user.username} in results`).to.be.true;
      cy.log(`Search API — found user: ${user.username}`);
    });
  });

  // ---------------------------------------------------------------------------
  // IT7 — POST /person/fromGroup — search for unknown username returns empty
  // ---------------------------------------------------------------------------
  it('POST /person/fromGroup — unknown username returns empty list', () => {
    const companyPrefix = Cypress.env('companyPrefix');

    cy.request({
      method: 'POST',
      url: `${apiBase()}person/fromGroup/${companyPrefix}`,
      body: { userName: `nonexistent_user_${Date.now()}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      const results = Array.isArray(res.body) ? res.body : res.body?.results ?? [];
      expect(results).to.have.length(0);
      cy.log('Search API — empty result for unknown user: OK');
    });
  });
});
