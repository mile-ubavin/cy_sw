/// <reference types="cypress" />

// =============================================================================
// E2E — DH_EG_04 Self Registration
// Scope: Full cross-system flow — DocuHub registration form → Yopmail → DH login.
//
// Flow:
//   IT1  DH → Yopmail — Register, click Resend, validate email + activate account
//   IT2  DH — First-time login as newly registered admin + hover hint validation
//   IT3  DH — Duplicate detection (companyName + username) on a fresh visit
//
// IT1 mirrors the proven TS_REVIEW happy-path: registration and email validation
//   run inside one it() block so that no testIsolation boundary, no {esc} press,
//   and no extra form submits interfere with the backend's async email pipeline
//   between the Resend-confirmation click and the email actually being dispatched.
//
// Requires: --headed (FriendlyCaptcha self-solves only in headed Chrome)
// =============================================================================

describe('DH_EG_04 Self Registration [E2E]', () => {
  // ---------------------------------------------------------------------------
  // Shared helpers
  // ---------------------------------------------------------------------------
  const dismissCookieBar = () => {
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      } else {
        cy.log('Cookie bar not visible');
      }
    });
  };

  const dismissReleaseNotePopup = () => {
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Release note popup not present');
      }
    });
  };

  // ---------------------------------------------------------------------------
  // Constants & state
  // ---------------------------------------------------------------------------
  const PASSWORD = 'Test1234!';
  const UID_VALID = 'ATU12345678';
  const FRC_PENDING = [
    '.UNSTARTED',
    '.FETCHING',
    '.UNFINISHED',
    '.ERROR',
    '.HEADLESS_ERROR',
    '',
  ];

  // Shared across IT1 → IT2 → IT3. JavaScript outer-scope vars survive
  // testIsolation (only browser state is wiped between tests, not test-file JS).
  let registeredEmail = '';
  let registeredUsername = '';
  let registeredCompanyName = '';

  before(() => {
    cy.task('getNextSelfRegEmail').then((email) => {
      registeredEmail = email;
      registeredUsername =
        email.replace('cy-selfregister', '').split('@')[0] + 'Admin';
    });
  });

  const getRegisterUrl = () => {
    const base = Cypress.env('dh_baseUrl');
    return base.endsWith('/') ? `${base}register` : `${base}/register`;
  };

  function fillForm(overrides = {}) {
    const data = {
      companyName: `CY-SelfReg_${registeredEmail.replace('cy-selfregister', '').split('@')[0]}`,
      uidNumber: UID_VALID,
      street: 'Test - Mariahilferstraße',
      doorNumber: '101',
      postalCode: '1060',
      city: 'Vienna',
      firstName: 'Max',
      lastName: 'Mustermann',
      email: registeredEmail,
      confirmEmail: registeredEmail,
      username: registeredUsername,
      password: PASSWORD,
      confirmPassword: PASSWORD,
      ...overrides,
    };
    cy.get('input[name="companyName"]')
      .clear()
      .type(data.companyName, { delay: 0 });
    cy.get('input[name="uidNumber"]')
      .clear()
      .type(data.uidNumber, { delay: 0 });
    cy.get('input[name="street"]').clear().type(data.street, { delay: 0 });
    cy.get('input[name="doorNumber"]')
      .clear()
      .type(data.doorNumber, { delay: 0 });
    cy.get('input[name="postalCode"]')
      .clear()
      .type(data.postalCode, { delay: 0 });
    cy.get('input[name="city"]').clear().type(data.city, { delay: 0 });
    cy.get('input[name="firstName"]')
      .clear()
      .type(data.firstName, { delay: 0 });
    cy.get('input[name="lastName"]').clear().type(data.lastName, { delay: 0 });
    cy.get('input[name="email"]').clear().type(data.email, { delay: 0 });
    cy.get('input[name="confirmEmail"]')
      .clear()
      .type(data.confirmEmail, { delay: 0 });
    cy.get('body').then(($body) => {
      if ($body.find('input[name="username"]').length > 0) {
        cy.get('input[name="username"]')
          .clear()
          .type(data.username, { delay: 0 });
      }
    });
    cy.get('input[name="password"]').clear().type(data.password, { delay: 0 });
    cy.get('input[name="confirmPassword"]')
      .clear()
      .type(data.confirmPassword, { delay: 0 });
    return data;
  }

  function waitForCaptcha() {
    cy.get('input[name="frc-captcha-solution"]', { timeout: 90000 })
      .should(($el) => {
        const val = $el.val();
        expect(
          FRC_PENDING,
          `frc-captcha-solution still pending: "${val}"`,
        ).not.to.include(val);
        expect(
          String(val).length,
          `frc-captcha-solution too short: "${val}"`,
        ).to.be.greaterThan(20);
      })
      .trigger('input', { force: true })
      .trigger('change', { force: true });
  }

  // ---------------------------------------------------------------------------
  // IT1 — DH + Yopmail: Register, Resend, validate email, activate account
  // Single it() block by design — keeps registration + email validation under
  // one testIsolation envelope, exactly like the proven TS_REVIEW happy path.
  // ---------------------------------------------------------------------------
  it('IT1 — Register → Resend → validate confirmation email → activate', () => {
    cy.on('uncaught:exception', () => false);

    // ===== STEP 0: Establish JSESSIONID on backend BEFORE registration =====
    // Manual browser always has a JSESSIONID from a prior backend interaction;
    // Cypress starts with an empty cookie jar AND the FE page-load only hits
    // fe.documenthub_t assets (zero backend traffic), so without a preflight
    // the registration POST goes out with no JSESSIONID and the backend
    // silently skips the confirmation email. cy.request shares the cookie jar
    // with the browser, so the Set-Cookie from this GET will be sent on the
    // subsequent register POST automatically.
    const backendBase = Cypress.env('dh_baseUrl').replace(
      'fe.documenthub_t',
      'be.e-gehaltszettel_t',
    );
    cy.request({ method: 'GET', url: backendBase, failOnStatusCode: false });

    // ===== STEP 1: Open registration page =====
    cy.visit(getRegisterUrl(), {
      failOnStatusCode: false,
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'webdriver', {
          get: () => undefined,
        });
      },
    });
    cy.get('[aria-label="registration form"]', { timeout: 15000 }).should(
      'be.visible',
    );

    // ===== STEP 2: Submit registration =====
    // req.continue ensures alias resolves AFTER the response — prevents
    // cy.wait from resolving on an in-flight duplicate request (status undefined).
    let registerStatus;
    cy.intercept(
      {
        method: 'POST',
        url: '**/register**',
        hostname: /(edeja|post-business-solutions)/,
      },
      (req) => {
        req.continue((res) => {
          if (registerStatus === undefined) registerStatus = res.statusCode;
        });
      },
    ).as('registerRequest');

    // Intercept Resend confirmation so we can wait for it to settle before
    // navigating away — otherwise the in-flight email-trigger may get dropped.
    cy.intercept(
      { method: 'POST', hostname: /(edeja|post-business-solutions)/ },
      (req) => {
        if (/resend|confirmation/i.test(req.url)) {
          req.alias = 'resendRequest';
        }
      },
    );

    const formData = fillForm();
    // Persist companyName so IT3 can use it to trigger a true duplicate.
    registeredCompanyName = formData.companyName;
    cy.get('input[name="agbTerms"]').check({ force: true });
    waitForCaptcha();
    cy.get('button[type="submit"]').click();

    cy.wait('@registerRequest', { timeout: 90000 }).then((interception) => {
      const status = registerStatus ?? interception.response?.statusCode;
      cy.writeFile('cypress/fixtures/last-register-response.json', {
        status,
        responseBody: interception.response?.body,
        requestBody: interception.request?.body,
        requestHeaders: interception.request?.headers,
        email: registeredEmail,
        timestamp: new Date().toISOString(),
      });
      cy.log(`✓ Registration submitted — status ${status}`);
      expect(status).to.be.oneOf([200, 201, 202]);
    });

    cy.contains(
      /Thank you for your registration|Vielen Dank f[üu]r Ihre Registrierung/i,
      { timeout: 15000 },
    ).should('be.visible');
    cy.log('✓ Thank you dialog visible');

    // ===== STEP 3: Click Resend confirmation — actually triggers the email =====
    cy.contains('button', /Resend confirmation|Best[äa]tigung erneut senden/i)
      .should('be.visible')
      .click({ force: true });

    // Give the backend a fixed window to commit the email job. Don't bind on
    // the Resend intercept alias — the URL pattern may vary; the wait is the
    // robust fallback.
    cy.wait(3000);

    // ===== STEP 4: Open Yopmail inbox =====
    cy.visit('https://yopmail.com/en/');
    cy.get('#login', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(registeredEmail);
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    cy.wait(7000);
    cy.log('Yopmail inbox opened');

    // ===== STEP 5: Validate email subject =====
    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms', { timeout: 60000 })
      .first()
      .should('contain.text', 'Ihre Registrierung auf DocuHub');
    cy.iframe('#ifinbox').find('.mctn > .m > button').first().click();
    cy.log('✓ Email subject verified: Ihre Registrierung auf DocuHub');

    // ===== STEP 6: Validate email body — 7 mandatory lines =====
    cy.iframe('#ifmail').find('#mail', { timeout: 10000 }).should('be.visible');

    const expectedBodyLines = [
      `Herzlich Willkommen ${formData.firstName} ${formData.lastName}`,
      'Ihre Registrierung auf DocuHub war erfolgreich',
      'Bitte klicken Sie auf folgenden Link, um Ihre Registrierung abzuschließen',
      'Nachdem Login füllen Sie bitte noch die benötigten Daten im Menüpunkt Firmen Management',
      'Hilfreiche Information dazu finden Sie auch in unseren FAQs',
      'Viel Freude mit DocuHub',
      'wünscht Ihr DocuHub-Team',
    ];
    expectedBodyLines.forEach((text) => {
      cy.iframe('#ifmail').contains(text).should('be.visible');
    });
    cy.log('✓ Email body verified — all 7 required lines present');

    // ===== STEP 7: Activate account via "Jetzt bestätigen" link =====
    // Pull the activation URL out of the iframe and visit it from the main
    // tab so Cypress actually waits for the activation page to load. Just
    // clicking the link inside the iframe (even with target=_self) lets the
    // it() finish before the server processes the activation token, which
    // leaves the account inactive when IT2 tries to log in.
    cy.iframe('#ifmail').contains('a', 'Jetzt bestätigen').should('be.visible');
    cy.iframe('#ifmail')
      .contains('a', 'Jetzt bestätigen')
      .first()
      .invoke('attr', 'href')
      .then((activationUrl) => {
        expect(activationUrl, 'activation URL')
          .to.be.a('string')
          .and.match(/^https?:/);
        cy.visit(activationUrl, { failOnStatusCode: false });
      });
    // Give the backend time to fully process the activation token before the
    // testIsolation boundary wipes our session and IT2 starts.
    cy.wait(5000);
    cy.log('✓ Account activated via confirmation link');
  });

  // ---------------------------------------------------------------------------
  // IT2 — DH: First-time login as newly registered admin + hover hint validation
  // ---------------------------------------------------------------------------
  it('IT2 — DH — First time login + validate upload button hints', () => {
    cy.on('uncaught:exception', () => false);

    expect(
      registeredEmail,
      'registered email must be set from before()',
    ).to.match(/@/);

    cy.visit(Cypress.env('dh_baseUrl'), { failOnStatusCode: false });
    // 3s mirrors TS_REVIEW (works); 2s was too short for the FE to finish
    // rendering the login form + any release-note popup after testIsolation.
    cy.wait(3000);

    dismissCookieBar();
    dismissReleaseNotePopup();
    cy.wait(500);

    cy.get('#login-username', { timeout: 10000 })
      .clear()
      .type(registeredEmail, { delay: 0 });
    cy.get('#login-password').clear().type(PASSWORD, { delay: 0 });
    cy.wait(500);
    cy.get('#login-button').click({ force: true });

    // Successful login lands on the dashboard. Wait for the dashboard's
    // primary section to render — this is a stronger signal than a URL
    // check (base URL doesn't contain literal "/login", so a failed login
    // can falsely pass a `not.to.include('/login')` assertion).
    cy.get('#send-documents-section', { timeout: 20000 }).should('be.visible');
    cy.log(`✓ DocuHub login successful — ${registeredEmail}`);

    const uploadCards = [
      '#workspace-personal-document-action',
      '#workspace-smart-send-action',
      '#workspace-mass-upload-action',
      '#workspace-single-person-upload',
    ];

    cy.get(uploadCards.join(', '), { timeout: 15000 }).should(
      'have.length.greaterThan',
      0,
    );
    cy.get('body').then(($body) => {
      const found = uploadCards.filter((id) => $body.find(id).length > 0);
      cy.log(
        `Upload cards found in DOM: ${found.length > 0 ? found.join(', ') : 'NONE'}`,
      );
      expect(
        found.length,
        'at least one upload card must be present',
      ).to.be.greaterThan(0);
      found.forEach((id) => {
        cy.get(id).trigger('mouseover');
        cy.contains(/Actions are not allowed|Aktionen sind nicht zulässig/i, {
          timeout: 5000,
        }).should('be.visible');
      });
    });
    cy.log(
      'Hover hints verified — upload actions blocked until company prefix is set',
    );
  });

  // ---------------------------------------------------------------------------
  // IT3 — DH: Duplicate detection — runs LAST so it cannot interfere with the
  //       backend's email-send pipeline triggered in IT1.
  // ---------------------------------------------------------------------------
  it('IT3 — DH — Duplicate detection', () => {
    cy.on('uncaught:exception', () => false);

    expect(registeredEmail, 'email must be set from before()').to.match(/@/);
    expect(
      registeredCompanyName,
      'companyName must be persisted from IT1',
    ).to.match(/^CY-SelfReg_/);

    cy.visit(getRegisterUrl(), {
      failOnStatusCode: false,
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'webdriver', {
          get: () => undefined,
        });
      },
    });
    cy.get('[aria-label="registration form"]', { timeout: 15000 }).should(
      'be.visible',
    );

    // ===== STEP 1: SAME companyName + SAME username → companyName duplicate =====
    // fillForm() default companyName uses a fresh Date.now() timestamp and so
    // is never a duplicate. Override with the exact value persisted in IT1.
    fillForm({ companyName: registeredCompanyName });
    cy.get('input[name="agbTerms"]').check({ force: true });
    waitForCaptcha();
    cy.get('button[type="submit"]').click();

    cy.get('#companyName-helper', { timeout: 15000 })
      .should('be.visible')
      .invoke('text')
      .should('match', /Group already exists|Gruppe existiert bereits/i);
    cy.log('Duplicate company name error shown');

    // ===== STEP 2: NEW companyName + SAME username → username duplicate =====
    cy.get('input[name="companyName"]')
      .clear()
      .type(`CY-SelfReg_retry_${Date.now()}`, { delay: 0 })
      .blur();
    cy.get('button[type="submit"]').click();
    cy.get('#username-helper', { timeout: 15000 })
      .should('be.visible')
      .invoke('text')
      .should(
        'match',
        /Person with that username already exists|Person mit diesem Benutzernamen existiert bereits/i,
      );
    cy.log('Duplicate username error shown');
  });
});
