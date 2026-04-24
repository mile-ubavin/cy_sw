describe('DH - Invalid Login Attempts and Account Lock Test', () => {
  // Helper function to generate a random string
  function generateRandomString(length) {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length)),
    ).join('');
  }

  const randomString = generateRandomString(5);
  const username = `TestUser - ${randomString}`;
  const invalidPassword = `Invalid-password - ${randomString}`;

  // Scenario 1: Lock the user after 5 invalid login attempts to DH
  it.skip('Lock the user after 5 invalid login attempts to DH', () => {
    cy.visit(Cypress.env('dh_baseUrl'), {
      failOnStatusCode: false,
    });

    // Remove Cookie dialog if present
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      } else {
        cy.log('Cookie bar not visible');
      }
    });

    cy.intercept('POST', '**/login').as('apiRequest');

    // Simulate 4 invalid login attempts
    cy.get('#login-username').type(username);
    for (let attempt = 1; attempt <= 4; attempt++) {
      cy.get('#login-password').type(invalidPassword);
      cy.get('#login-button').click();

      cy.wait('@apiRequest', { timeout: 10000 }).then((interception) => {
        expect(interception.response.statusCode).to.eq(401);
      });
      cy.get('#login-password').clear();
    }

    // Attempt login after 4 invalid attempts
    cy.get('#login-password').type(invalidPassword);
    cy.get('#login-button').click();

    // Verify account lock message
    cy.get('div[color="error"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Account is locked|Konto ist gesperrt/i);
      });

    cy.wait(2500);
  }); //end it

  // Scenario 2: Verify trimming password - fail login to DH
  it('DH - Verify trimming password prevents login', () => {
    cy.visit(Cypress.env('dh_baseUrl'), {
      failOnStatusCode: false,
    });
    cy.url().should('include', Cypress.env('dh_baseUrl'));

    // Remove Cookie dialog if present
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      }
    });

    const trimmedPassword = `           ${Cypress.env(
      'password_supportViewAdmin',
    )}              `; // Add extra spaces
    cy.get('#login-username').type(Cypress.env('username_supportViewAdmin'));
    cy.get('#login-password').type(trimmedPassword);
    cy.wait(1500);
    cy.get('#login-button').click();

    cy.wait(2000);

    // Verify error message or still on login page
    cy.url().should('include', Cypress.env('dh_baseUrl'));
    cy.get('#login-username').should('be.visible'); // Still on login page
    cy.log('User was not able to log in after trimming password.');
    cy.wait(2000);
  });

  // Scenario 3: Enter valid password using camelCase letters -> fail login to DH
  it('DH - Try login with valid password in camelCase -> fail login', () => {
    cy.visit(Cypress.env('dh_baseUrl'), {
      failOnStatusCode: false,
    });
    cy.url().should('include', Cypress.env('dh_baseUrl'));

    // Remove Cookie dialog if present
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      }
    });

    // Convert password to camelCase
    const mixedCasePassword = Cypress.env('password_supportViewAdmin')
      .split('')
      .map((char, index) =>
        index % 2 === 0 ? char.toUpperCase() : char.toLowerCase(),
      )
      .join('');

    cy.get('#login-username').type(Cypress.env('username_supportViewAdmin'));
    cy.get('#login-password').type(mixedCasePassword);
    cy.get('#login-button').click();

    cy.wait(2000);

    // Validate unsuccessful login - still on login page
    cy.url().should('include', Cypress.env('dh_baseUrl'));
    cy.get('#login-username').should('be.visible');
    cy.log('Login failed when using camelCase password.');
    cy.wait(2000);
  });

  // Scenario 4: Admin user -> Verify trimmed And mixedCase username allows login to DH
  it.only('DH - Admin User -> Verify trimmed And mixedCase username allows login', () => {
    cy.visit(Cypress.env('dh_baseUrl'), {
      failOnStatusCode: false,
    });
    cy.url().should('include', Cypress.env('dh_baseUrl'));

    // Remove Cookie dialog if present
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      }
    });

    // Convert username to a combination of upper and lower case letters
    const mixedCaseUsername = Cypress.env('username_supportViewAdmin')
      .split('')
      .map((char, index) =>
        index % 2 === 0 ? char.toUpperCase() : char.toLowerCase(),
      )
      .join('');

    // Add 10 spaces at the beginning and end of the username
    const trimmedAndmixedCaseUsername = `          ${mixedCaseUsername}          `;
    cy.get('#login-username').type(trimmedAndmixedCaseUsername);
    cy.get('#login-password').type(Cypress.env('password_supportViewAdmin'));
    cy.wait(1500);

    // Intercept login request
    cy.intercept('GET', '**/supportView/v1/group/getGroupData').as(
      'getGroupData',
    );

    cy.get('#login-button').click();

    // Wait for successful login
    cy.wait('@getGroupData', { timeout: 35000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('Login successful with trimmed and mixed case username');
    });

    // Validate successful login
    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);
    cy.log(
      'Admin user was able to log in with trimmed and mixed case username.',
    );
    cy.wait(2000);

    // Logout from DH
    cy.get('button[id=":ra:"]').click();
    cy.wait(1000);
    cy.get('li[role="menuitem"]')
      .contains(/Abmelden|Logout/i)
      .click();

    cy.url().should('include', Cypress.env('dh_baseUrl'));
    cy.log('Admin user login test completed successfully.');
    cy.wait(1500);
  });

  // Scenario 5: Admin User -> Login to DH
  it('DH - Admin User -> Login to DH', () => {
    cy.visit(Cypress.env('dh_baseUrl'), {
      failOnStatusCode: false,
    });
    cy.url().should('include', Cypress.env('dh_baseUrl'));

    // Remove Cookie dialog if present
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      }
    });

    cy.get('#login-username').type(Cypress.env('username_supportViewAdmin'));
    cy.get('#login-password').type(Cypress.env('password_supportViewAdmin'));
    cy.wait(1000);

    // Intercept login request
    cy.intercept('GET', '**/supportView/v1/group/getGroupData').as(
      'getGroupData',
    );

    cy.get('#login-button').click();

    // Wait for successful login
    cy.wait('@getGroupData', { timeout: 35000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('Login successful - navigated to DH home page');
    });

    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);
    cy.wait(2000);

    // Verify DH navigation is visible
    cy.get('#nav-workspace').should('be.visible');
    cy.get('#nav-admin-users').should('be.visible');

    // Logout from DH
    cy.get('button[id=":ra:"]').click();
    cy.wait(1000);
    cy.get('li[role="menuitem"]')
      .contains(/Abmelden|Logout/i)
      .click();

    cy.url().should('include', Cypress.env('dh_baseUrl'));
    cy.log('Admin user login test completed successfully.');
  }); //end it
}); //end describe
