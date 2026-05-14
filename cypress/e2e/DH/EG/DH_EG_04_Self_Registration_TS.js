describe('DocuHub Registration', () => {
  let registeredEmail = '';

  // Navigate to the registration page before each test
  beforeEach(() => {
    const baseUrl = Cypress.env('dh_baseUrl');
    const registerUrl = baseUrl.endsWith('/')
      ? `${baseUrl}register`
      : `${baseUrl}/register`;
    cy.visit(registerUrl, {
      failOnStatusCode: false,
      // Hide navigator.webdriver before page scripts execute so
      // FriendlyCaptcha v2 browser-fingerprinting does not detect Cypress
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'webdriver', {
          get: () => undefined,
        });
      },
    });
    cy.wait(1500);
  });

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  /**
   * Fills all registration form fields.
   * Pass an `overrides` object to replace specific field values.
   */
  function fillForm(overrides = {}) {
    const ts = Date.now();
    const uniqueEmail = `cypress-${ts}-${Cypress._.random(1000, 9999)}@yopmail.com`;
    const data = {
      companyName: `Test AG ${ts}`,
      uidNumber: 'ATU12345678',
      street: `Test - Mariahilferstraße`,
      doorNumber: '101',
      postalCode: '1060',
      city: 'Vienna',
      firstName: 'Georg',
      lastName: 'Mustermann',
      email: uniqueEmail,
      confirmEmail: uniqueEmail,
      username: `cypressuser${ts}`,
      password: 'Cypress@1234',
      confirmPassword: 'Cypress@1234',
      ...overrides,
    };

    cy.get('input[name="companyName"]').clear().type(data.companyName);
    cy.get('input[name="uidNumber"]').clear().type(data.uidNumber);
    cy.get('input[name="street"]').type(data.street);
    cy.get('input[name="doorNumber"]').type(data.doorNumber);
    cy.get('input[name="postalCode"]').type(data.postalCode);
    cy.get('input[name="city"]').type(data.city);
    cy.get('input[name="firstName"]').type(data.firstName);
    cy.get('input[name="lastName"]').type(data.lastName);
    cy.get('input[name="email"]').type(data.email);
    cy.get('input[name="confirmEmail"]').type(data.confirmEmail);
    cy.get('input[name="username"]').type(data.username);
    cy.get('input[name="password"]').type(data.password);
    cy.get('input[name="confirmPassword"]').type(data.confirmPassword);

    return data;
  }

  /** Accepts the terms & conditions checkbox. */
  function acceptTerms() {
    cy.get('input[name="agbTerms"]').check({ force: true });
  }

  // ===========================================================================
  // PAGE LOAD
  // ===========================================================================

  it('displays the registration form', () => {
    cy.get('[aria-label="registration form"]').should('be.visible');
    cy.get('[aria-label="Register Page title"]').should(
      'contain',
      'Register for DocuHub',
    );
  });

  it('shows all required sections', () => {
    cy.get('[aria-label="user company data section"]').should('exist');
    cy.get('[aria-label="user address section"]').should('exist');
    cy.get('[aria-label="user data section"]').should('exist');
    cy.get('[aria-label="email section"]').should('exist');
    cy.get('[aria-label="password section"]').should('exist');
  });

  it('Register button is disabled on load', () => {
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('Country is pre-filled with Austria and disabled', () => {
    cy.get('input[name="state"]')
      .should('have.value', 'Austria')
      .and('be.disabled');
  });

  it('UID number field pre-fills with ATU prefix', () => {
    cy.get('input[name="uidNumber"]').should('have.value', 'ATU');
  });

  // ===========================================================================
  // VALIDATION – Register button enable conditions
  // Register button is enabled ONLY when ALL three conditions are met:
  //   1. All mandatory fields filled with valid data
  //   2. Terms & Conditions checkbox is checked
  //   3. FriendlyCaptcha is in verified "I am human" state
  // ===========================================================================

  it('shows error when emails do not match', () => {
    cy.get('input[name="email"]').type('user@example.com');
    cy.get('input[name="confirmEmail"]').type('other@example.com').blur();
    cy.get('#confirmEmail-helper').should('not.be.empty');
  });

  it('shows error when passwords do not match', () => {
    cy.get('input[name="password"]').type('Cypress@1234');
    cy.get('input[name="confirmPassword"]').type('Wrong@9999').blur();
    cy.get('#confirmPassword-helper').should('not.be.empty');
  });

  it('password strength indicators update as user types', () => {
    cy.get('input[name="password"]').type('Cypress@1234');
    cy.get('[aria-label="password strength indicator section"]')
      .find('svg.MuiSvgIcon-colorDisabled')
      .should('have.length', 0);
  });

  it('Register button stays disabled when UID has fewer than 8 digits', () => {
    // Invalid UID format: ATU + 7 digits
    fillForm({ uidNumber: 'ATU1234567' });
    acceptTerms();
    cy.solveFriendlyCaptcha();
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('Register button stays disabled when UID contains non-digit characters', () => {
    // Invalid UID format: ATU + mixed alphanumeric
    fillForm({ uidNumber: 'ATU12AB5678' });
    acceptTerms();
    cy.solveFriendlyCaptcha();
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('shows validation error when UID is not 11 characters', () => {
    // UID max length is 11: ATU (3 chars) + 8 digits = 11 total
    // Entering more than 11 should trigger validation error
    cy.get('input[name="uidNumber"]').clear().type('ATU12345').blur();
    // Check for bilingual error message (EN or DE)
    cy.get('#uidNumber-helper').should('not.be.empty');
    cy.get('#uidNumber-helper')
      .invoke('text')
      .should(
        'match',
        /Format must be ATU followed by 8 digits \(e\.g\. ATU12345678\)\.|Format muss mit ATU gefolgt von 8 Ziffern beginnen \(z\.B\. ATU12345678\)\./i,
      );
  });

  it('Register button stays disabled when UID is not 11 characters', () => {
    // Form filled with UID not equal to 11 chars
    fillForm({ uidNumber: 'ATU12345' });
    acceptTerms();
    cy.solveFriendlyCaptcha();
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('Register button stays disabled without terms checkbox', () => {
    // Form filled + captcha solved but NO terms → button must stay disabled
    fillForm();
    cy.solveFriendlyCaptcha();
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('Register button stays disabled without captcha', () => {
    // Form filled + terms checked but captcha NOT solved → button must stay disabled
    fillForm();
    acceptTerms();
    // Wait briefly to ensure captcha has NOT auto-solved (widget still unverified)
    cy.get('.frc-captcha').should('exist');
    cy.get('input[name="frc-captcha-solution"]')
      .invoke('val')
      .then((val) => {
        // Only assert disabled if captcha solution is not yet injected
        if (!val || val === '.') {
          cy.get('button[type="submit"]').should('be.disabled');
        } else {
          cy.log(
            'Captcha auto-verified in this environment – skipping disabled check',
          );
        }
      });
  });

  it('Register button stays disabled without valid form data', () => {
    // Terms checked + captcha solved but form NOT filled → button must stay disabled
    acceptTerms();
    cy.solveFriendlyCaptcha();
    cy.get('button[type="submit"]').should('be.disabled');
  });

  // ===========================================================================
  // CAPTCHA + SUBMIT
  // ===========================================================================

  it('Register button enables when form + terms + captcha all complete', () => {
    // All three conditions met → button must be enabled
    fillForm();
    acceptTerms();
    cy.solveFriendlyCaptcha();
    cy.get('button[type="submit"]').should('not.be.disabled');
  });

  it('happy path: submits registration form successfully', () => {
    cy.intercept('POST', '**/register**').as('registerRequest');

    const data = fillForm();
    registeredEmail = data.email;
    cy.get('input[name="email"]').should('have.value', registeredEmail);
    acceptTerms();
    cy.solveFriendlyCaptcha();

    cy.get('button[type="submit"]').click();

    cy.wait('@registerRequest', { timeout: 30000 }).then((interception) => {
      expect(interception.response.statusCode).to.be.oneOf([200, 201, 202]);
    });

    // Verify success dialog and trigger resend confirmation email.
    cy.contains(
      /Thank you for your registration|Vielen Dank fuer Ihre Registrierung|Vielen Dank für Ihre Registrierung/i,
    ).should('be.visible');
    cy.contains(
      'button',
      /Resend confirmation|Bestaetigung erneut senden|Bestätigung erneut senden/i,
    ).click({ force: true });

    // Close dialog before retrying submit.
    cy.get('body').type('{esc}', { force: true });

    // Submit again with same values -> duplicate company expected (EN/DE).
    cy.get('button[type="submit"]').click();
    cy.get('#companyName-helper')
      .should('be.visible')
      .invoke('text')
      .should('match', /Group already exists|Gruppe existiert bereits/i);

    // Make company name unique, keep username unchanged.
    cy.get('input[name="companyName"]')
      .clear()
      .type(`Test AG retry ${Date.now()}`)
      .blur();

    // Submit again -> duplicate username expected (EN/DE).
    cy.get('button[type="submit"]').click();
    cy.get('#username-helper')
      .should('be.visible')
      .invoke('text')
      .should(
        'match',
        /Person with that username already exists|Person mit diesem Benutzernamen existiert bereits/i,
      );

    // Keep this email for follow-up test in the same spec.
    cy.wrap(registeredEmail).should('include', '@');

    // Expect redirect or success message after registration
    // cy.url().should('not.include', '/register');
  });

  it('Check registration email', () => {
    // Ensure previous test stored a valid email before checking Yopmail inbox.
    expect(registeredEmail, 'registered email from previous test').to.match(
      /@/,
    );

    // Use the full generated email to open the correct Yopmail inbox.
    const yopmailInbox = registeredEmail;

    // Open Yopmail and refresh inbox so newest registration mail is visible.
    cy.visit('https://yopmail.com/en/');
    cy.get('#login').clear().type(yopmailInbox);
    cy.get('#refreshbut > .md > .material-icons-outlined').click();

    // Validate latest registration email subject (EN/DE tolerant), then open it.
    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms', { timeout: 20000 })
      .first()
      .invoke('text')
      .should(
        'match',
        /Neuer Benutzer DocuHub Portal|New User DocuHub Portal|DocuHub Portal/i,
      );
    cy.iframe('#ifinbox').find('.mctn > .m > button').first().click();

    // Validate key body content so we know we opened the expected registration email.
    cy.iframe('#ifmail').find('#mail').should('be.visible');
    cy.iframe('#ifmail')
      .contains(
        /Sehr geehrte\*r Nutzer\*in|Dear user|Sie wurden von Ihrer Personal-|You have been created/i,
      )
      .should('be.visible');
    cy.wait(2000);
    // Click confirmation CTA inside email; force same-tab navigation when link has target=_blank.
    cy.iframe('#ifmail')
      .contains(
        'a, button',
        /Jetzt bestaetigen|Jetzt bestätigen|Confirm now|Confirm/i,
      )
      .first()
      .then(($el) => {
        if ($el.is('a')) {
          cy.wrap($el).invoke('attr', 'target', '_self');
        }
        cy.wrap($el).click({ force: true });
      });
  });
});
