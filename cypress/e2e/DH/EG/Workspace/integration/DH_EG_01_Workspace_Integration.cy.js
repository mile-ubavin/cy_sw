/// <reference types="cypress" />
import { collectValues } from '../../../../../support/utils/objectUtils';

// =============================================================================
// INTEGRATION — DH_EG_01 Workspace
// Scope: DH-only — UI dialog validation + Employee API contract.
//        NO external systems (no e-Box, no Yopmail, no real document send).
//
// Runtime: ~60-80s (vs ~1m 45s E2E).
//
// testIsolation: true — each IT does its own login. Trades 30s for stability
// (DH dialogs do not close cleanly via {esc} so shared state leaks between ITs).
//
// Based on: DH_EG_01_Workspace_TC_MassUpload.js + Dictionary_305.js
// =============================================================================

describe('DH_EG_01 Workspace [INTEGRATION]', () => {
  // Shared login helper — every IT starts from DH home page
  function loginToHome() {
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.url().should('include', Cypress.env('dh_baseUrl'));
    cy.dismissCookieBar();
    cy.loginToDH();
    cy.wait(2000);
    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);
    cy.scrollTo('top', { duration: 200 });
  }

  // ---------------------------------------------------------------------------
  // IT1 — Mass Upload dialog: validation messages without sending documents
  // ---------------------------------------------------------------------------
  it('IT1 — Mass Upload dialog shows correct title, requirements, and validation errors', () => {
    loginToHome();

    // Open Mass Upload dialog
    cy.get('#workspace-mass-upload-action')
      .should('be.visible')
      .each(($el) => {
        if ($el.text().match(/Massensversand|Mass Upload/i)) {
          cy.wrap($el).click({ force: true });
        }
      });

    // Title
    cy.get('main>header>h1')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Massensversand|Mass Upload/i);
      });

    // Subtitle
    cy.get('main>p')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Choose one ore more documents|Wählen Sie eines oder mehrere Dokumente aus/i,
        );
      });

    // File requirements
    cy.get('#file-requirements')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Only .pdf files up to 13 pages allowed for printing|Nur .pdf bis zu 13 Seiten beim Druck zulässig/i,
        );
      });

    // Invalid file (CSV) → error message
    cy.DHcreateNewUser_viaCSV();
    cy.wait(2000);
    cy.get('#file-list span')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Only pdf files are supported|Es werden nur PDF-Dateien unterstützt/i,
        );
      });

    // Remove invalid file before proceeding
    cy.get('button[aria-label="Remove 1_createUser.csv"]').click();
    cy.wait(1000);

    // Upload valid PDF to enable Subject/Company validation checks
    cy.DHmassUpload();
    cy.wait(2000);

    // Subject field is mandatory
    cy.get('input[placeholder="Enter the subject"]')
      .should('be.visible')
      .click()
      .clear()
      .blur();
    cy.get('div[role="alert"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Subject field is mandatory|Betreff-Feld ist obligatorisch/i,
        );
      });

    // Company field is mandatory after clearing
    cy.get('input[placeholder="Enter the subject"]').type('CY Integration smoke');
    cy.get('button[title="Clear"]').click({ force: true });
    cy.wait(1000);
    cy.get('.e1sv65i421>span')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Company field is required|Empfänger-Feld ist obligatorisch/i,
        );
      });

    // Close dialog without sending (back-arrow / cancel)
    cy.get('body').type('{esc}');
    cy.log('✓ Mass Upload dialog validations confirmed — no document sent');
  });

  // ---------------------------------------------------------------------------
  // IT2 — Personal Document Upload dialog: title + file requirements
  // ---------------------------------------------------------------------------
  it('IT2 — Personal Document Upload dialog shows title and file requirements', () => {
    loginToHome();

    cy.get('#workspace-personal-document-action')
      .should('be.visible')
      .contains(/Persönliches Dokument|Personal Document/i)
      .click({ force: true });
    cy.wait(1500);

    cy.get('#personal-document-title')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Personal Document Upload|Upload Document/i);
      });

    cy.get('#file-requirements')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Maximum file size is 50 MB and a maximum of 10 documents can be uploaded/i,
        );
      });

    cy.get('body').type('{esc}');
    cy.log('✓ Personal Document Upload dialog validated');
  });

  // ---------------------------------------------------------------------------
  // IT3 — Employee API contract: response shape matches MassUpload counter
  // ---------------------------------------------------------------------------
  it('IT3 — Employee API returns shape that MassUpload counter can parse', () => {
    loginToHome();

    cy.intercept('GET', '**/person/fromGroup/**').as('getEmployees');
    cy.get('#nav-employees').should('be.visible').click();

    cy.wait('@getEmployees', { timeout: 35000 }).then((interception) => {
      expect(interception.response.statusCode, 'employees endpoint must respond 200').to.eq(200);
    });
    cy.wait(1500);

    // Select company so the list is scoped to the test tenant
    const companyName = Cypress.env('company').toLowerCase();
    cy.get('#employee-select-company').click({ force: true });
    cy.wait(1000);
    cy.get('ul[role="listbox"] > li > span')
      .should('be.visible')
      .then(($options) => {
        const match = [...$options].find((el) =>
          el.textContent.trim().toLowerCase().includes(companyName),
        );
        expect(match, `dropdown contains "${companyName}"`).to.exist;
        cy.wrap(match).click({ force: true });
      });

    // Validate the scoped response: status, non-empty list, required tokens
    cy.wait('@getEmployees', { timeout: 35000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);

      const body = interception.response.body;
      const employees = Array.isArray(body)
        ? body
        : body.content || body.persons || body.items || body.data || body.employees || [];

      expect(employees, 'employees array must not be empty').to.have.length.greaterThan(0);

      // Counter relies on the presence of these tokens somewhere in each record
      const allValues = collectValues(body);
      const hasActiveToken = allValues.some((v) => v === 'aktiv' || v === 'active');
      const hasDeliveryToken = allValues.some(
        (v) =>
          v.includes('elektronisch') ||
          v.includes('digital') ||
          v.includes('druck') ||
          v.includes('print') ||
          v.includes('postal'),
      );

      expect(hasActiveToken, 'response must contain an active-status token').to.be.true;
      expect(hasDeliveryToken, 'response must contain a delivery-channel token').to.be.true;

      cy.log(`✓ ${employees.length} employees returned with valid counter-compatible shape`);
    });
  });
});
