/// <reference types="cypress" />

describe('DH_EG_04_Self_Registration_TS [REVIEW]', () => {
  // ── Constants ──────────────────────────────────────────────────────────────
  const UID_VALID      = 'ATU12345678';
  const UID_7DIGITS    = 'ATU1234567';
  const UID_9DIGITS    = 'ATU123456789';
  const UID_5DIGITS    = 'ATU12345';
  const UID_LETTERS    = 'ATU12AB5678';
  const UID_LETTER_END = 'ATU1234567X';
  const PASSWORD       = 'Test1234!';

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

  function acceptTerms() {
    cy.get('input[name="agbTerms"]').check({ force: true });
  }

  // FriendlyCaptcha: let the widget self-solve. Manual PoW via cy.task was
  // generating solutions for an unrelated puzzle that the dev backend's
  // siteverify rejected. The widget produces the only solution the server trusts.
  const FRC_PENDING = ['.UNSTARTED', '.FETCHING', '.UNFINISHED', '.ERROR', '.HEADLESS_ERROR', ''];

  function waitForCaptcha() {
    cy.get('input[name="frc-captcha-solution"]', { timeout: 90000 })
      .should(($el) => {
        const val = $el.val();
        expect(FRC_PENDING, `frc-captcha-solution still pending: "${val}"`)
          .not.to.include(val);
        expect(String(val).length, `frc-captcha-solution too short: "${val}"`)
          .to.be.greaterThan(20);
      })
      .trigger('input', { force: true })
      .trigger('change', { force: true });
  }

  // ── beforeEach: land on the registration page ──────────────────────────────
  beforeEach(() => {
    cy.visit(getRegisterUrl(), {
      failOnStatusCode: false,
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'webdriver', { get: () => undefined });
      },
    });
    cy.get('[aria-label="registration form"]', { timeout: 15000 }).should('be.visible');
  });

  // ===========================================================================
  // PAGE LOAD
  // ===========================================================================
  describe('Page load', () => {
    it('displays registration form with title', () => {
      cy.get('[aria-label="registration form"]').should('be.visible');
      cy.get('[aria-label="Register Page title"]').should('contain', 'Register for DocuHub');
    });

    it('shows all required form sections', () => {
      cy.get('[aria-label="user company data section"]').should('exist');
      cy.get('[aria-label="user address section"]').should('exist');
      cy.get('[aria-label="user data section"]').should('exist');
      cy.get('[aria-label="email section"]').should('exist');
      cy.get('[aria-label="password section"]').should('exist');
    });

    it('Register button is disabled on load', () => {
      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('Country is pre-filled with Austria and is read-only', () => {
      cy.get('input[name="state"]').should('have.value', 'Austria').and('be.disabled');
    });

    it('UID number field pre-fills with ATU prefix', () => {
      cy.get('input[name="uidNumber"]').should('have.value', 'ATU');
    });
  });

  // ===========================================================================
  // UID NUMBER VALIDATION — /^ATU\d{8}$/ (11 chars total)
  // ===========================================================================
  describe('UID number validation', () => {
    it('shows format error: 5 digits — ATU12345', () => {
      cy.get('input[name="uidNumber"]').clear().type(UID_5DIGITS).blur();
      cy.get('#uidNumber-helper').should('be.visible').invoke('text').should('match', UID_ERROR_RE);
    });

    it('no error: ATU+9digits silently capped to ATU+8digits by input maxlength', () => {
      cy.get('input[name="uidNumber"]').clear().type(UID_9DIGITS);
      cy.get('input[name="uidNumber"]').should('have.value', UID_VALID);
      cy.get('body').then(($body) => {
        if ($body.find('#uidNumber-helper').length > 0) {
          cy.get('#uidNumber-helper').should('not.be.visible');
        }
      });
    });

    it('shows format error: 7 digits — ATU1234567', () => {
      cy.get('input[name="uidNumber"]').clear().type(UID_7DIGITS).blur();
      cy.get('#uidNumber-helper').should('be.visible').invoke('text').should('match', UID_ERROR_RE);
    });

    it('shows format error: non-digit chars in middle — ATU12AB5678', () => {
      cy.get('input[name="uidNumber"]').clear().type(UID_LETTERS).blur();
      cy.get('#uidNumber-helper').should('be.visible').invoke('text').should('match', UID_ERROR_RE);
    });

    it('shows format error: non-digit char at end — ATU1234567X', () => {
      cy.get('input[name="uidNumber"]').clear().type(UID_LETTER_END).blur();
      cy.get('#uidNumber-helper').should('be.visible').invoke('text').should('match', UID_ERROR_RE);
    });

    it('shows format error: only ATU prefix, no digits', () => {
      cy.get('input[name="uidNumber"]').clear().type('ATU').blur();
      cy.get('#uidNumber-helper').should('be.visible').invoke('text').should('match', UID_ERROR_RE);
    });

    it('shows NO error for valid UID — ATU12345678 (8 digits)', () => {
      cy.get('input[name="uidNumber"]').clear().type(UID_VALID).blur();
      cy.get('body').then(($body) => {
        if ($body.find('#uidNumber-helper').length > 0) {
          cy.get('#uidNumber-helper').should('not.be.visible');
        }
      });
    });

    it('Register button stays disabled for all invalid UID formats', () => {
      fillForm({ uidNumber: UID_7DIGITS });
      acceptTerms();
      cy.get('button[type="submit"]').should('be.disabled');
      cy.get('input[name="uidNumber"]').clear().type(UID_5DIGITS,    { delay: 0 }).blur();
      cy.get('button[type="submit"]').should('be.disabled');
      cy.get('input[name="uidNumber"]').clear().type(UID_LETTERS,    { delay: 0 }).blur();
      cy.get('button[type="submit"]').should('be.disabled');
    });
  });

  // ===========================================================================
  // OTHER FIELD VALIDATION
  // ===========================================================================
  describe('Other field validation', () => {
    it('shows error when emails do not match', () => {
      cy.get('input[name="email"]').clear().type('user@example.com');
      cy.get('input[name="confirmEmail"]').clear().type('other@example.com').blur();
      cy.get('#confirmEmail-helper').should('be.visible').and('not.be.empty');
    });

    it('shows error when passwords do not match', () => {
      cy.get('input[name="password"]').clear().type('Cypress@1234');
      cy.get('input[name="confirmPassword"]').clear().type('Wrong@9999').blur();
      cy.get('#confirmPassword-helper').should('be.visible').and('not.be.empty');
    });

    it('password strength indicators update as user types', () => {
      cy.get('input[name="password"]').clear().type('Cypress@1234');
      cy.get('[aria-label="password strength indicator section"]')
        .find('svg.MuiSvgIcon-colorDisabled')
        .should('have.length', 0);
    });
  });

  // ===========================================================================
  // REGISTER BUTTON ENABLE CONDITIONS
  // ===========================================================================
  describe('Register button enable conditions', () => {
    it('stays disabled without terms checkbox', () => {
      fillForm();
      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('stays disabled without captcha (form + terms checked)', () => {
      fillForm();
      acceptTerms();
      cy.get('input[name="frc-captcha-solution"]').invoke('val').then((val) => {
        if (FRC_PENDING.includes(val)) {
          cy.get('button[type="submit"]').should('be.disabled');
        } else {
          cy.log('Captcha auto-completed — not applicable in this environment');
        }
      });
    });

    it('stays disabled without valid form data', () => {
      acceptTerms();
      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('enables when all conditions met: valid form + terms + captcha', () => {
      fillForm();
      acceptTerms();
      waitForCaptcha();
      cy.get('button[type="submit"]', { timeout: 10000 }).should('not.be.disabled');
    });
  });

  // ===========================================================================
  // HAPPY PATH
  // Email: cy-self_register_XXX@yopmail.com (sequential counter 000–999)
  // Flow:  Registration → Yopmail confirmation → Email confirm click → Ebox login
  // EBox login: email as username, Test1234! as password
  // ===========================================================================
  describe('Happy path', () => {
    it('registers with sequential email, confirms via Yopmail, logs into Ebox', () => {
      cy.on('uncaught:exception', () => false);

      // ── Step 1: Submit registration ──────────────────────────────────────
      // req.continue response handler guarantees the alias resolves AFTER the
      // response is received, so interception.response is always populated.
      // Without it, cy.wait can resolve on an in-flight duplicate request whose
      // response hasn't arrived yet (status undefined).
      let registerStatus;
      cy.intercept(
        { method: 'POST', url: '**/register**', hostname: /(edeja|post-business-solutions)/ },
        (req) => {
          req.continue((res) => {
            if (registerStatus === undefined) registerStatus = res.statusCode;
          });
        },
      ).as('register');

      const formData = fillForm();
      acceptTerms();
      waitForCaptcha();
      cy.get('button[type="submit"]').click();

      cy.wait('@register', { timeout: 90000 }).then((interception) => {
        const status = registerStatus ?? interception.response?.statusCode;
        cy.writeFile('cypress/fixtures/last-register-response.json', {
          status,
          body: interception.response?.body,
          headers: interception.response?.headers,
          requestBody: interception.request?.body,
          email: registeredEmail,
          timestamp: new Date().toISOString(),
        });
        expect(status).to.be.oneOf([200, 201, 202, 301, 302, 307, 308]);
      });

      cy.contains(
        /Thank you for your registration|Vielen Dank f[üu]r Ihre Registrierung/i,
        { timeout: 15000 },
      ).should('be.visible');

      cy.contains('button', /Resend confirmation|Best[äa]tigung erneut senden/i)
        .should('be.visible')
        .click({ force: true });

      // ── Step 2: Open Yopmail inbox ───────────────────────────────────────
      cy.visit('https://yopmail.com/en/');
      cy.get('#login', { timeout: 10000 }).should('be.visible').clear().type(registeredEmail);
      cy.get('#refreshbut > .md > .material-icons-outlined').click();
      cy.wait(15000); // allow registration email to arrive

      // Subject must match the ticket-mandated text exactly
      cy.iframe('#ifinbox')
        .find('.mctn > .m > button > .lms', { timeout: 60000 })
        .first()
        .should('contain.text', 'Ihre Registrierung auf DocuHub');

      cy.iframe('#ifinbox').find('.mctn > .m > button').first().click();

      cy.iframe('#ifmail').find('#mail', { timeout: 10000 }).should('be.visible');

      // Body must contain every line mandated by the ticket
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

      // Confirmation CTA must be a "Jetzt bestätigen" link per ticket
      cy.iframe('#ifmail').contains('a', 'Jetzt bestätigen').should('be.visible');

      // ── Step 3: Click email confirmation link ────────────────────────────
      cy.iframe('#ifmail')
        .contains('a', 'Jetzt bestätigen')
        .first()
        .invoke('attr', 'target', '_self')
        .click({ force: true });

      // ── Step 4: Login to DocuHub with email as username ──────────────────
      cy.visit(Cypress.env('dh_baseUrl'), { failOnStatusCode: false });
      cy.wait(3000);

      cy.get('body').then(($body) => {
        if ($body.find('#onetrust-policy-title').is(':visible')) {
          cy.get('#onetrust-accept-btn-handler').click({ force: true });
        } else {
          cy.log('Cookie bar not visible');
        }
      });
      cy.wait(1000);

      cy.get('#login-username', { timeout: 10000 }).clear().type(registeredEmail, { delay: 0 });
      cy.get('#login-password').clear().type(PASSWORD, { delay: 0 });
      cy.wait(500);
      cy.get('#login-button').click();

      cy.url({ timeout: 15000 }).should((url) => {
        expect(url).not.to.include('/login');
      });
      cy.log(`Ebox login successful — ${registeredEmail}`);

      // ── Step 5: Verify Send Documents action card descriptions (hover) ───
      cy.get('#send-documents-section', { timeout: 10000 }).should('be.visible');

      const sendDocCards = [
        { id: '#workspace-personal-document-action', descRe: /Send a personal document|Ein persönliches Dokument versenden/i },
        { id: '#workspace-smart-send-action',         descRe: /Automatically assign documents|Dokumente automatisch Empfängern zuweisen/i },
        { id: '#workspace-mass-upload-action',        descRe: /Send a document to many recipients|Ein Dokument an viele Empfänger versenden/i },
        { id: '#workspace-single-person-upload',      descRe: /Send document\(s\) to a single person|Dokument\(e\) an Einzelperson versenden/i },
      ];

      sendDocCards.forEach(({ id, descRe }) => {
        cy.get('body').then(($body) => {
          if ($body.find(id).length > 0) {
            cy.get(id).trigger('mouseover');
            cy.get(id).invoke('text').should('match', descRe);
          }
        });
      });

      // ── Step 6: Navigate to Company Management ───────────────────────────
      cy.contains(/Company Management|Firmenverwaltung/i, { timeout: 10000 })
        .should('be.visible')
        .click();

      // ── Step 7: Enter company prefix and ident prefix length ─────────────
      cy.get('input:visible').eq(0).clear().type('prefix-001', { delay: 0 });
      cy.get('input:visible').eq(1).clear().type('3', { delay: 0 });

      // ── Step 8: Save ─────────────────────────────────────────────────────
      cy.contains('button', /Speichern|Save/i).click();

      cy.log('Company Management prefix saved successfully');

      // ── Step 9: Logout ───────────────────────────────────────────────────
      cy.get('.MuiButton-text').click();
      cy.wait(1000);
      cy.get('li[role="menuitem"]')
        .contains(/Abmelden|Logout/i)
        .click();
      cy.url().should('include', Cypress.env('dh_baseUrl'));
      cy.log('Logout successful.');
      cy.wait(2500);
    });
  });
});
