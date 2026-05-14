///<reference types="cypress" />
/**
 * DH_Auth_01_Login_Logout_TS
 *
 * Test suite for DocumentHub login and logout flows.
 * Covers: valid login, successful logout, session expiry on back-navigation,
 *         empty field validation, and show/hide password toggle.
 */

describe('DH_Auth_01_Login_Logout_TS', () => {
  // ─── Helpers ───────────────────────────────────────────────────────────────

  /** Visit DH login page and dismiss cookie banner if visible */
  const visitLoginPage = () => {
    cy.visit(Cypress.env('dh_baseUrl'), { failOnStatusCode: false });
    cy.url().should('include', Cypress.env('dh_baseUrl'));

    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      }
    });
  };

  /** Fill login form without submitting */
  const fillLoginForm = (username, password) => {
    cy.get('#login-username').clear().type(username);
    cy.get('#login-password').clear().type(password);
  };

  /** Submit form and wait for successful login intercept */
  const loginAndWait = () => {
    cy.intercept('GET', '**/supportView/v1/group/getGroupData').as(
      'getGroupData',
    );
    cy.get('#login-button').click();
    cy.wait('@getGroupData', { timeout: 35000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });
    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);
  };

  /** Open profile menu and click Logout */
  const logout = () => {
    cy.get('button[id=":ra:"]').click();
    cy.wait(500); // wait for menu animation
    cy.get('li[role="menuitem"]')
      .contains(/Abmelden|Logout/i)
      .should('be.visible')
      .click();
    cy.url().should('include', Cypress.env('dh_baseUrl'));
    cy.get('#login-username').should('be.visible');
  };

  // ─── Tests ─────────────────────────────────────────────────────────────────

  /**
   * DH_Auth_01 — Valid login and logout
   *
   * 1. Open DH login page
   * 2. Enter valid credentials
   * 3. Submit → assert home page loads (getGroupData 200)
   * 4. Verify sidebar navigation visible
   * 5. Logout → assert back on login page
   */
  it('DH_Auth_01 - Valid login and logout', () => {
    visitLoginPage();
    fillLoginForm(
      Cypress.env('username_supportViewAdmin'),
      Cypress.env('password_supportViewAdmin'),
    );
    loginAndWait();

    cy.get('#nav-workspace').should('be.visible');
    cy.get('#nav-admin-users').should('be.visible');

    logout();
    cy.log('✓ Login and logout completed successfully');
  });

  /**
   * DH_Auth_02 — Login fails with wrong password
   *
   * 1. Open DH login page
   * 2. Enter valid username + wrong password
   * 3. Submit → assert 401 response
   * 4. Assert still on login page
   */
  it('DH_Auth_02 - Login fails with wrong password', () => {
    visitLoginPage();
    cy.intercept('POST', '**/login').as('loginRequest');
    fillLoginForm(
      Cypress.env('username_supportViewAdmin'),
      'WrongPassword_!999',
    );
    cy.get('#login-button').click();

    cy.wait('@loginRequest', { timeout: 10000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(401);
    });

    cy.url().should('include', Cypress.env('dh_baseUrl'));
    cy.get('#login-username').should('be.visible');
    cy.log('✓ Login correctly rejected with 401');
  });

  /**
   * DH_Auth_03 — Login blocked with empty username
   *
   * 1. Open DH login page
   * 2. Leave username empty, enter valid password
   * 3. Assert button disabled OR login page remains
   */
  it('DH_Auth_03 - Login blocked with empty username', () => {
    visitLoginPage();
    cy.get('#login-password')
      .clear()
      .type(Cypress.env('password_supportViewAdmin'));

    cy.get('#login-button').then(($btn) => {
      if ($btn.is(':disabled') || $btn.attr('aria-disabled') === 'true') {
        cy.log('✓ Login button disabled when username is empty');
      } else {
        cy.wrap($btn).click({ force: true });
        cy.url().should('include', Cypress.env('dh_baseUrl'));
        cy.get('#login-username').should('be.visible');
        cy.log('✓ Login blocked — remained on login page');
      }
    });
  });

  /**
   * DH_Auth_04 — Login blocked with empty password
   *
   * 1. Open DH login page
   * 2. Enter valid username, leave password empty
   * 3. Assert button disabled OR login page remains
   */
  it('DH_Auth_04 - Login blocked with empty password', () => {
    visitLoginPage();
    cy.get('#login-username')
      .clear()
      .type(Cypress.env('username_supportViewAdmin'));

    cy.get('#login-button').then(($btn) => {
      if ($btn.is(':disabled') || $btn.attr('aria-disabled') === 'true') {
        cy.log('✓ Login button disabled when password is empty');
      } else {
        cy.wrap($btn).click({ force: true });
        cy.url().should('include', Cypress.env('dh_baseUrl'));
        cy.get('#login-username').should('be.visible');
        cy.log('✓ Login blocked — remained on login page');
      }
    });
  });

  /**
   * DH_Auth_05 — Show / Hide password toggle
   *
   * 1. Type password
   * 2. Assert type="password" (hidden)
   * 3. Click eye icon → assert type="text" (visible)
   * 4. Click again → assert type="password" (hidden)
   */
  it('DH_Auth_05 - Show and hide password toggle', () => {
    visitLoginPage();
    cy.get('#login-password').type(Cypress.env('password_supportViewAdmin'));

    cy.get('#login-password').should('have.attr', 'type', 'password');

    cy.get('#login-password')
      .parents('div')
      .find('button[aria-label], button[type="button"]')
      .first()
      .click({ force: true });

    cy.get('#login-password').should('have.attr', 'type', 'text');

    cy.get('#login-password')
      .parents('div')
      .find('button[aria-label], button[type="button"]')
      .first()
      .click({ force: true });

    cy.get('#login-password').should('have.attr', 'type', 'password');
    cy.log('✓ Show/hide password toggle works correctly');
  });

  /**
   * DH_Auth_06 — Back-navigation after logout does not restore session
   *
   * 1. Login with valid credentials
   * 2. Logout
   * 3. Click browser back
   * 4. Assert NOT on home page (session invalidated)
   */
  it('DH_Auth_06 - Back-navigation after logout does not restore session', () => {
    visitLoginPage();
    fillLoginForm(
      Cypress.env('username_supportViewAdmin'),
      Cypress.env('password_supportViewAdmin'),
    );
    loginAndWait();

    logout();

    cy.go('back');
    cy.wait(2000); // allow redirect to settle

    cy.url().should('not.include', `${Cypress.env('dh_baseUrl')}home`);
    cy.log('✓ Session correctly invalidated after logout');
  });
});
