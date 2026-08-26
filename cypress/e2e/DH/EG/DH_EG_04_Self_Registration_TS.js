/// <reference types="cypress" />

describe('DocuHub Registration', () => {
  // ── Constants ──────────────────────────────────────────────────────────────
  const UID_VALID = 'ATU12345678';
  const UID_7DIGITS = 'ATU1234567';
  const UID_9DIGITS = 'ATU123456789';
  const UID_5DIGITS = 'ATU12345';
  const UID_LETTERS = 'ATU12AB5678';
  const PASSWORD = 'Test1234!';

  const UID_ERROR_RE =
    /Format must be ATU followed by 8 digits \(e\.g\. ATU12345678\)\.|Format muss mit ATU gefolgt von 8 Ziffern beginnen \(z\.B\. ATU12345678\)\./i;

  // ── Shared state — set once in before() for the whole suite ───────────────
  let registeredEmail = '';

  before(() => {
    cy.task('getNextSelfRegEmail').then((email) => {
      registeredEmail = email;
    });
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getRegisterUrl = () => {
    const base = Cypress.env('dh_baseUrl');
    return base.endsWith('/') ? `${base}register` : `${base}/register`;
  };

  function fillForm(overrides = {}) {
    const ts = Date.now();
    const data = {
      companyName: `CY SelfReg ${registeredEmail.split('@')[0]} ${ts}`,
      uidNumber: UID_VALID,
      street: 'Test - Mariahilferstraße',
      doorNumber: '101',
      postalCode: '1060',
      city: 'Vienna',
      firstName: 'Max',
      lastName: 'Mustermann',
      email: registeredEmail,
      confirmEmail: registeredEmail,
      username: registeredEmail.split('@')[0],
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

  // FriendlyCaptcha: let the widget self-solve (Node-side PoW rejected by dev
  // backend's strict siteverify). Always run with --headed.
  const FRC_PENDING = [
    '.UNSTARTED',
    '.FETCHING',
    '.UNFINISHED',
    '.ERROR',
    '.HEADLESS_ERROR',
    '',
  ];

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

  // ── beforeEach: land on the registration page ──────────────────────────────
  beforeEach(() => {
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
  });

  // ===========================================================================
  // PAGE LOAD
  // ===========================================================================
  describe('Page load', () => {
    // Verifies registration page title and form container are visible on load.
    it('displays the registration form', () => {
      cy.get('[aria-label="registration form"]').should('be.visible');
      cy.get('[aria-label="Register Page title"]').should(
        'contain',
        'Register for DocuHub',
      );
    });

    // Checks that all five form sections (company, address, user data, email, password) exist.
    it('shows all required sections', () => {
      cy.get('[aria-label="user company data section"]').should('exist');
      cy.get('[aria-label="user address section"]').should('exist');
      cy.get('[aria-label="user data section"]').should('exist');
      cy.get('[aria-label="email section"]').should('exist');
      cy.get('[aria-label="password section"]').should('exist');
    });

    // Confirms submit button starts in disabled state before any input.
    it('Register button is disabled on load', () => {
      cy.get('button[type="submit"]').should('be.disabled');
    });

    // Validates Austria is pre-selected and the country field is read-only.
    it('Country is pre-filled with Austria and disabled', () => {
      cy.get('input[name="state"]')
        .should('have.value', 'Austria')
        .and('be.disabled');
    });

    // Confirms UID field initialises with the mandatory ATU prefix.
    it('UID number field pre-fills with ATU prefix', () => {
      cy.get('input[name="uidNumber"]').should('have.value', 'ATU');
    });
  });

  // ===========================================================================
  // UID NUMBER VALIDATION — /^ATU\d{8}$/ (11 chars total)
  // ===========================================================================
  describe('UID number validation', () => {
    // Asserts an inline error appears when the UID has fewer than 8 digits after ATU.
    it('shows validation error for incomplete UID — ATU12345', () => {
      cy.get('input[name="uidNumber"]').clear().type(UID_5DIGITS).blur();
      cy.get('#uidNumber-helper')
        .should('be.visible')
        .invoke('text')
        .should('match', UID_ERROR_RE);
    });

    // Confirms the input caps at 11 characters and shows no error for the resulting valid UID.
    it('no error: ATU+9digits silently capped to ATU+8digits by input maxlength', () => {
      cy.get('input[name="uidNumber"]').clear().type(UID_9DIGITS);
      cy.get('input[name="uidNumber"]').should('have.value', UID_VALID);
      cy.get('body').then(($body) => {
        if ($body.find('#uidNumber-helper').length > 0) {
          cy.get('#uidNumber-helper').should('not.be.visible');
        }
      });
    });

    // Verifies the submit button remains disabled for 7-digit, 5-digit, and alphanumeric UID variants.
    it('Register button stays disabled for all invalid UID formats', () => {
      fillForm({ uidNumber: UID_7DIGITS });
      cy.get('input[name="agbTerms"]').check({ force: true });
      cy.get('button[type="submit"]').should('be.disabled');
      cy.get('input[name="uidNumber"]')
        .clear()
        .type(UID_5DIGITS, { delay: 0 })
        .blur();
      cy.get('button[type="submit"]').should('be.disabled');
      cy.get('input[name="uidNumber"]')
        .clear()
        .type(UID_LETTERS, { delay: 0 })
        .blur();
      cy.get('button[type="submit"]').should('be.disabled');
    });
  });

  // ===========================================================================
  // OTHER FIELD VALIDATION
  // ===========================================================================
  describe('Other field validation', () => {
    // Confirms a mismatch error appears when email and confirm-email fields differ.
    it('shows error when emails do not match', () => {
      cy.get('input[name="email"]').clear().type('user@example.com');
      cy.get('input[name="confirmEmail"]')
        .clear()
        .type('other@example.com')
        .blur();
      cy.get('#confirmEmail-helper').should('be.visible').and('not.be.empty');
    });

    // Confirms a mismatch error appears when password and confirm-password fields differ.
    it('shows error when passwords do not match', () => {
      cy.get('input[name="password"]').clear().type('Cypress@1234');
      cy.get('input[name="confirmPassword"]').clear().type('Wrong@9999').blur();
      cy.get('#confirmPassword-helper')
        .should('be.visible')
        .and('not.be.empty');
    });

    // Verifies all password strength icons turn active as a strong password is entered.
    it('password strength indicators update as user types', () => {
      cy.get('input[name="password"]').clear().type('Cypress@1234');
      cy.get('[aria-label="password strength indicator section"]')
        .find('svg.MuiSvgIcon-colorDisabled')
        .should('have.length', 0);
    });
  });

  // ===========================================================================
  // REGISTER BUTTON ENABLE CONDITIONS
  // Register button is enabled ONLY when ALL three conditions are met:
  //   1. All mandatory fields filled with valid data
  //   2. Terms & Conditions checkbox is checked
  //   3. FriendlyCaptcha in verified state
  // ===========================================================================
  describe('Register button enable conditions', () => {
    // Confirms submit button stays disabled when form is filled but terms are not accepted.
    it('stays disabled without terms checkbox', () => {
      fillForm();
      cy.get('button[type="submit"]').should('be.disabled');
    });

    // Confirms submit button stays disabled when form and terms are complete but captcha is unsolved.
    it('stays disabled without captcha (form + terms checked)', () => {
      fillForm();
      cy.get('input[name="agbTerms"]').check({ force: true });
      cy.get('input[name="frc-captcha-solution"]')
        .invoke('val')
        .then((val) => {
          if (FRC_PENDING.includes(val)) {
            cy.get('button[type="submit"]').should('be.disabled');
          } else {
            cy.log(
              'Captcha auto-completed — not applicable in this environment',
            );
          }
        });
    });

    // Confirms submit button stays disabled when only terms are accepted and form is empty.
    it('stays disabled without valid form data', () => {
      cy.get('input[name="agbTerms"]').check({ force: true });
      cy.get('button[type="submit"]').should('be.disabled');
    });

    // Verifies submit button becomes enabled once form, terms, and captcha are all complete.
    it('enables when all conditions met: valid form + terms + captcha', () => {
      fillForm();
      cy.get('input[name="agbTerms"]').check({ force: true });
      waitForCaptcha();
      cy.get('button[type="submit"]', { timeout: 10000 }).should(
        'not.be.disabled',
      );
    });
  });

  // ===========================================================================
  // HAPPY PATH
  // Email: cy-self_register_XXX@yopmail.com (sequential counter 000–999)
  // Flow:  Registration → duplicate detection → Yopmail email validation
  // ===========================================================================
  describe('Happy path', () => {
    // Registers a new company, then verifies backend returns errors for duplicate company name and username on subsequent submits.
    it('submits registration and verifies duplicate detection', () => {
      cy.on('uncaught:exception', () => false);

      // ===== STEP 1: Submit registration =====
      // req.continue guarantees alias resolves after response — prevents
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

      fillForm();
      cy.get('input[name="agbTerms"]').check({ force: true });
      waitForCaptcha();
      cy.get('button[type="submit"]').click();

      cy.wait('@registerRequest', { timeout: 90000 }).then((interception) => {
        const status = registerStatus ?? interception.response?.statusCode;
        expect(status).to.be.oneOf([200, 201, 202]);
        cy.log(`✓ Registration submitted — status ${status}`);
      });

      cy.contains(
        /Thank you for your registration|Vielen Dank f[üu]r Ihre Registrierung/i,
        { timeout: 15000 },
      ).should('be.visible');
      cy.log('✓ Thank you dialog visible');

      // ===== STEP 2: Verify duplicate company name error =====
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

      // ===== STEP 3: Verify duplicate username error =====
      cy.get('input[name="companyName"]')
        .clear()
        .type(`CY SelfReg retry ${Date.now()}`, { delay: 0 })
        .blur();
      cy.get('button[type="submit"]').click();
      cy.get('#username-helper')
        .should('be.visible')
        .invoke('text')
        .should(
          'match',
          /Person with that username already exists|Person mit diesem Benutzernamen existiert bereits/i,
        );
      cy.log('✓ Duplicate username error shown');
    });

    // Validates confirmation email subject and 7 body lines in Yopmail, then activates account via confirmation link and clears inbox.
    it('confirms account via email', () => {
      cy.on('uncaught:exception', () => false);

      expect(
        registeredEmail,
        'registered email must be set from before()',
      ).to.match(/@/);

      // ===== STEP 1: Open Yopmail inbox =====
      cy.visit('https://yopmail.com/en/');
      cy.get('#login', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(registeredEmail);
      cy.get('#refreshbut > .md > .material-icons-outlined').click();
      cy.wait(5000);
      cy.log('✓ Yopmail inbox opened');

      // ===== STEP 2: Validate email subject =====
      cy.iframe('#ifinbox')
        .find('.mctn > .m > button > .lms', { timeout: 60000 })
        .first()
        .should('contain.text', 'Ihre Registrierung auf DocuHub');
      cy.iframe('#ifinbox').find('.mctn > .m > button').first().click();
      cy.log('✓ Email subject verified: Ihre Registrierung auf DocuHub');

      // ===== STEP 3: Validate email body =====
      cy.iframe('#ifmail')
        .find('#mail', { timeout: 10000 })
        .should('be.visible');

      const expectedBodyLines = [
        'Herzlich Willkommen Max Mustermann',
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

      // ===== STEP 4: Activate account via confirmation link =====
      // Navigate the main tab to the activation URL so Cypress waits for the
      // full page load — iframe-only navigation doesn't guarantee the server
      // processes activation before the subsequent login attempt.
      cy.iframe('#ifmail')
        .contains('a', 'Jetzt bestätigen')
        .should('be.visible');
      cy.iframe('#ifmail')
        .contains('a', 'Jetzt bestätigen')
        .first()
        .invoke('attr', 'href')
        .then((href) => {
          cy.visit(href, { failOnStatusCode: false });
        });
      cy.wait(2000);
      cy.log('✓ Account activated via confirmation link');

      // ===== STEP 5: Delete email from Yopmail inbox =====
      cy.visit('https://yopmail.com/en/');
      cy.get('#login', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(registeredEmail);
      cy.get('#refreshbut > .md > .material-icons-outlined').click();
      cy.wait(2000);
      cy.get('.menu>div>#delall')
        .should('not.be.disabled')
        .click({ force: true });
      cy.wait(1000);
      cy.log('✓ Yopmail inbox cleared');
    });

    // Logs into DocuHub as the newly activated admin and validates that upload button hints block actions until company prefix is configured.
    it('first time login to DocuHub', () => {
      cy.on('uncaught:exception', () => false);

      expect(
        registeredEmail,
        'registered email must be set from before()',
      ).to.match(/@/);

      // ===== STEP 1: Login to DocuHub as newly registered admin =====
      cy.visit(Cypress.env('dh_baseUrl'), { failOnStatusCode: false });
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('#onetrust-policy-title').is(':visible')) {
          cy.get('#onetrust-accept-btn-handler').click({ force: true });
        } else {
          cy.log('Cookie bar not visible');
        }
      });

      cy.get('#login-username', { timeout: 10000 })
        .clear()
        .type(registeredEmail, { delay: 0 });
      cy.get('#login-password').clear().type(PASSWORD, { delay: 0 });
      cy.get('#login-button').click();

      cy.url({ timeout: 15000 }).should((url) => {
        expect(url).not.to.include('/login');
      });
      cy.log(`DocuHub login successful — ${registeredEmail}`);

      // ===== STEP 2: Validate hover hints on upload buttons (before prefix is set) =====
      cy.get('#send-documents-section', { timeout: 10000 }).should(
        'be.visible',
      );

      const uploadCards = [
        '#workspace-personal-document-action',
        '#workspace-smart-send-action',
        '#workspace-mass-upload-action',
        '#workspace-single-person-upload',
      ];

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
          cy.get(id).realHover();
          cy.contains(/Actions are not allowed|Aktionen sind nicht erlaubt/i, {
            timeout: 5000,
          }).should('be.visible');
        });
      });
      cy.log(
        'Hover hints verified — upload actions blocked until company prefix is set',
      );
    });
  });
});
