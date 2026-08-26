/// <reference types="cypress" />

// =============================================================================
// INTEGRATION — DH_EG_04 Self Registration
// Scope: Form + FriendlyCaptcha + DH API interaction within a single system.
//        No external systems (no Yopmail, no e-Box).
//
// Requires: --headed (FriendlyCaptcha self-solves only in headed Chrome)
//
// testIsolation: false — IT4/IT5/IT6 share browser state intentionally:
//   IT4 submits the form (1 captcha solve), IT5 resubmits for duplicate company
//   error, IT6 changes company and resubmits for duplicate username error.
//   This avoids 3 separate captcha solves for the same registration chain.
//
// Based on: DH_EG_04_Self_Registration_TS.js
// =============================================================================

describe('DH_EG_04 Self Registration [INTEGRATION]', { testIsolation: false }, () => {
  // ---------------------------------------------------------------------------
  // Constants & helpers
  // ---------------------------------------------------------------------------
  const UID_VALID   = 'ATU12345678';
  const UID_7DIGITS = 'ATU1234567';
  const UID_5DIGITS = 'ATU12345';
  const UID_LETTERS = 'ATU12AB5678';
  const PASSWORD    = 'Test1234!';

  const FRC_PENDING = ['.UNSTARTED', '.FETCHING', '.UNFINISHED', '.ERROR', '.HEADLESS_ERROR', ''];

  let registeredEmail = '';

  before(() => {
    cy.task('getNextSelfRegEmail').then((email) => {
      registeredEmail = email;
    });
  });

  const getRegisterUrl = () => {
    const base = Cypress.env('dh_baseUrl');
    return base.endsWith('/') ? `${base}register` : `${base}/register`;
  };

  function visitRegisterPage() {
    cy.visit(getRegisterUrl(), {
      failOnStatusCode: false,
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'webdriver', { get: () => undefined });
      },
    });
    cy.get('[aria-label="registration form"]', { timeout: 15000 }).should('be.visible');
  }

  function fillForm(overrides = {}) {
    const ts   = Date.now();
    const data = {
      companyName:     `CY SelfReg ${registeredEmail.split('@')[0]} ${ts}`,
      uidNumber:       UID_VALID,
      street:          'Test - Mariahilferstraße',
      doorNumber:      '101',
      postalCode:      '1060',
      city:            'Vienna',
      firstName:       'Max',
      lastName:        'Mustermann',
      email:           registeredEmail,
      confirmEmail:    registeredEmail,
      username:        registeredEmail.split('@')[0],
      password:        PASSWORD,
      confirmPassword: PASSWORD,
      ...overrides,
    };
    cy.get('input[name="companyName"]').clear().type(data.companyName,         { delay: 0 });
    cy.get('input[name="uidNumber"]').clear().type(data.uidNumber,             { delay: 0 });
    cy.get('input[name="street"]').clear().type(data.street,                   { delay: 0 });
    cy.get('input[name="doorNumber"]').clear().type(data.doorNumber,           { delay: 0 });
    cy.get('input[name="postalCode"]').clear().type(data.postalCode,           { delay: 0 });
    cy.get('input[name="city"]').clear().type(data.city,                       { delay: 0 });
    cy.get('input[name="firstName"]').clear().type(data.firstName,             { delay: 0 });
    cy.get('input[name="lastName"]').clear().type(data.lastName,               { delay: 0 });
    cy.get('input[name="email"]').clear().type(data.email,                     { delay: 0 });
    cy.get('input[name="confirmEmail"]').clear().type(data.confirmEmail,       { delay: 0 });
    cy.get('body').then(($body) => {
      if ($body.find('input[name="username"]').length > 0) {
        cy.get('input[name="username"]').clear().type(data.username, { delay: 0 });
      }
    });
    cy.get('input[name="password"]').clear().type(data.password,               { delay: 0 });
    cy.get('input[name="confirmPassword"]').clear().type(data.confirmPassword, { delay: 0 });
    return data;
  }

  function waitForCaptcha() {
    cy.get('input[name="frc-captcha-solution"]', { timeout: 90000 })
      .should(($el) => {
        const val = $el.val();
        expect(FRC_PENDING, `frc-captcha-solution still pending: "${val}"`).not.to.include(val);
        expect(String(val).length, `frc-captcha-solution too short: "${val}"`).to.be.greaterThan(20);
      })
      .trigger('input', { force: true })
      .trigger('change', { force: true });
  }

  // ---------------------------------------------------------------------------
  // IT1 — Submit disabled for all invalid UID formats (7-digit, 5-digit, letters)
  // ---------------------------------------------------------------------------
  it('IT1 — Register button stays disabled for all invalid UID formats', () => {
    visitRegisterPage();
    fillForm({ uidNumber: UID_7DIGITS });
    cy.get('input[name="agbTerms"]').check({ force: true });
    cy.get('button[type="submit"]').should('be.disabled');
    cy.get('input[name="uidNumber"]').clear().type(UID_5DIGITS, { delay: 0 }).blur();
    cy.get('button[type="submit"]').should('be.disabled');
    cy.get('input[name="uidNumber"]').clear().type(UID_LETTERS, { delay: 0 }).blur();
    cy.get('button[type="submit"]').should('be.disabled');
    cy.log('✓ Submit disabled for 7-digit, 5-digit and alphanumeric UID');
  });

  // ---------------------------------------------------------------------------
  // IT2 — Submit disabled when form + terms complete but captcha is unsolved
  // ---------------------------------------------------------------------------
  it('IT2 — Register button stays disabled without captcha solution', () => {
    visitRegisterPage();
    fillForm();
    cy.get('input[name="agbTerms"]').check({ force: true });
    cy.get('input[name="frc-captcha-solution"]').invoke('val').then((val) => {
      if (FRC_PENDING.includes(val)) {
        cy.get('button[type="submit"]').should('be.disabled');
        cy.log('✓ Submit disabled — captcha not yet solved');
      } else {
        cy.log('Captcha auto-completed — not applicable in this environment');
      }
    });
  });

  // ---------------------------------------------------------------------------
  // IT3 — Submit enabled when form + terms + captcha all satisfied
  // ---------------------------------------------------------------------------
  it('IT3 — Register button enables when form + terms + captcha all satisfied', () => {
    visitRegisterPage();
    fillForm();
    cy.get('input[name="agbTerms"]').check({ force: true });
    waitForCaptcha();
    cy.get('button[type="submit"]', { timeout: 10000 }).should('not.be.disabled');
    cy.log('✓ Submit enabled — all three conditions met');
  });

  // ---------------------------------------------------------------------------
  // IT4 — Registration POST returns 2xx and thank-you dialog appears
  //        (captcha solved here — IT5 and IT6 reuse this browser session)
  // ---------------------------------------------------------------------------
  it('IT4 — Registration POST returns 2xx; thank-you dialog appears', () => {
    cy.on('uncaught:exception', () => false);

    visitRegisterPage();

    // req.continue guarantees alias resolves after response — avoids alias
    // resolving on an in-flight duplicate request (response undefined).
    let registerStatus;
    cy.intercept(
      { method: 'POST', url: '**/register**', hostname: /(edeja|post-business-solutions)/ },
      (req) => {
        req.continue((res) => {
          if (registerStatus === undefined) registerStatus = res.statusCode;
        });
      },
    ).as('registerRequest');

    fillForm();
    cy.get('input[name="agbTerms"]').check({ force: true });
    waitForCaptcha();
    cy.get('button[type="submit"]').click();

    cy.wait('@registerRequest', { timeout: 90000 }).then((interception) => {
      const status = registerStatus ?? interception.response?.statusCode;
      expect(status).to.be.oneOf([200, 201, 202]);
      cy.log(`✓ Registration POST status: ${status}`);
    });

    cy.contains(
      /Thank you for your registration|Vielen Dank f[üu]r Ihre Registrierung/i,
      { timeout: 15000 },
    ).should('be.visible');
    cy.log('✓ Thank-you dialog visible after successful registration');
  });

  // ---------------------------------------------------------------------------
  // IT5 — Duplicate company name returns inline validation error
  //        (no cy.visit — reuses browser session from IT4)
  // ---------------------------------------------------------------------------
  it('IT5 — Duplicate company name returns validation error', () => {
    cy.on('uncaught:exception', () => false);

    cy.contains('button', /Resend confirmation|Best[äa]tigung erneut senden/i)
      .should('be.visible')
      .click({ force: true });
    cy.get('body').type('{esc}', { force: true });

    cy.get('button[type="submit"]').click();
    cy.get('#companyName-helper')
      .should('be.visible')
      .invoke('text')
      .should('match', /Group already exists|Gruppe existiert bereits/i);
    cy.log('✓ Duplicate company name error shown');
  });

  // ---------------------------------------------------------------------------
  // IT6 — Duplicate username returns inline validation error
  //        (no cy.visit — reuses browser session from IT4/IT5)
  // ---------------------------------------------------------------------------
  it('IT6 — Duplicate username returns validation error', () => {
    cy.on('uncaught:exception', () => false);

    cy.get('input[name="companyName"]')
      .clear()
      .type(`CY SelfReg retry ${Date.now()}`, { delay: 0 })
      .blur();
    cy.get('button[type="submit"]').click();
    cy.get('#username-helper')
      .should('be.visible')
      .invoke('text')
      .should('match', /Person with that username already exists|Person mit diesem Benutzernamen existiert bereits/i);
    cy.log('✓ Duplicate username error shown');
  });
});
