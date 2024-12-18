describe('Invalid Login Attempts and Account Lock Test', () => {
  // Helper function to generate a random string
  function generateRandomString(length) {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');
  }

  const randomString = generateRandomString(5);
  const username = `TestUser - ${randomString}`;
  const invalidPassword = `Invalid-password - ${randomString}`;

  // Scenario 1: Lock the user after 5 invalid login attempts to SW
  it.skip('Lock the user after 5 invalid login attempts', () => {
    cy.fixture('supportView.json').as('example_supportView');
    cy.get('@example_supportView').then((usersJson) => {
      cy.visit(usersJson.baseUrl_prod, { failOnStatusCode: false });
      cy.url().should('include', '/login');

      cy.intercept('POST', '**/user').as('apiRequest');

      // Simulate 4 invalid login attempts
      cy.get('.username').type(username);
      for (let attempt = 1; attempt <= 4; attempt++) {
        cy.get('.password').type(invalidPassword);
        cy.get('.btn').click();

        cy.wait('@apiRequest', { timeout: 10000 }).then((interception) => {
          expect(interception.response.statusCode).to.eq(404);
          expect(interception.response.body)
            .to.have.property('message')
            .and.equal('Account is locked!');
        });
        cy.get('.password').clear();
      }

      // Attempt login after 4 invalid attempts
      cy.get('.password').type(invalidPassword);
      cy.get('.btn').click();
      cy.get('form>.error-text').should(
        'include.text',
        'This account is locked, please try again in 5 minutes.'
      );

      cy.wait('@apiRequest', { timeout: 10000 }).then((interception) => {
        expect(interception.response.statusCode).to.eq(403);
        expect(interception.response.body)
          .to.have.property('message')
          .and.equal('5');
      });
    });
    cy.wait(2500);
  }); //end it

  // Scenario 2: Verify trimming password - fail login
  it('Verify trimming password prevents login', () => {
    cy.fixture('supportView.json').as('example_supportView');
    cy.get('@example_supportView').then((usersJson) => {
      cy.visit(usersJson.baseUrl_prod, { failOnStatusCode: false });
      cy.url().should('include', '/login');

      const trimmedPassword = `           ${usersJson.password_supportViewMaster}              `; // Add extra spaces
      cy.get('.username').type(usersJson.username_supportViewMaster);
      cy.get('.password').type(trimmedPassword);
      cy.wait(2500);
      cy.get('.login-button').click();
      cy.get('.login-form-wrapper>.has-error>.error-text')
        .invoke('text')
        .then((text) => {
          const trimmedText = text.trim();
          expect(trimmedText).to.match(
            /Username and password are incorrect.|Benutzername und Passwort sind falsch./
          );
        });
      cy.log('User was not able to log in after trimming password.');
      cy.wait(3500);
    });
  });

  // Scenario 3: Enter valid password using camelCase letters -> fail login
  it('Try login with valid password in camelCase -> fail login', () => {
    cy.fixture('supportView.json').as('example_supportView');
    cy.get('@example_supportView').then((usersJson) => {
      cy.visit(usersJson.baseUrl_prod, { failOnStatusCode: false });
      cy.url().should('include', '/login');

      // Convert username to a combination of upper and lower case letters
      const mixedCasePassword = usersJson.password_supportViewMaster
        .split('')
        .map((char, index) =>
          index % 2 === 0 ? char.toUpperCase() : char.toLowerCase()
        )
        .join('');

      cy.get('.username').type(usersJson.username_supportViewMaster);
      cy.get('.password').type(mixedCasePassword);
      cy.get('.login-button').click();

      // Validate unsuccessful login
      cy.get('form>.error-text').should(
        'include.text',
        'Username and password are incorrect.'
      );
      cy.log('Login failed when using camelCase password.');
    });

    cy.wait(2500);
  });

  // Scenario 4: Masteruser -> Verify trimmed And mixedCase username allows login
  it('Masteruser -> Verify trimmed And mixedCase username allows login', () => {
    cy.fixture('supportView.json').as('example_supportView');
    cy.get('@example_supportView').then((usersJson) => {
      cy.visit(usersJson.baseUrl_prod, { failOnStatusCode: false });
      cy.url().should('include', '/login');

      // Convert username to a combination of upper and lower case letters
      const mixedCaseUsername = usersJson.username_supportViewMaster
        .split('')
        .map((char, index) =>
          index % 2 === 0 ? char.toUpperCase() : char.toLowerCase()
        )
        .join('');

      // Add 10 spaces at the beginning and end of the username
      const trimmedAndmixedCaseUsername = `          ${mixedCaseUsername}          `;
      cy.get('.username').type(trimmedAndmixedCaseUsername);
      cy.get('.password').type(usersJson.password_supportViewMaster_prod);
      cy.wait(2500);
      cy.get('.login-button').click();

      // Validate successful login
      cy.url().should('include', usersJson.baseUrl_prod + '/dashboard/groups');
      cy.log('User was able to log in after trimming username.');
    });
    cy.wait(3500);
    // Logout
    cy.get('.logout-icon').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.log('Masteruser login test completed successfully.');
    cy.wait(1500);
  });

  // Scenario 5: Masteruser -> Login to sw
  it('Masteruser -> Login to sw', () => {
    cy.fixture('supportView.json').as('example_supportView');
    cy.get('@example_supportView').then((usersJson) => {
      cy.visit(usersJson.baseUrl_prod, { failOnStatusCode: false });
      cy.url().should('include', '/login');

      cy.get('.username').type(usersJson.username_supportViewMaster);
      cy.get('.password').type(usersJson.password_supportViewMaster_prod);
      cy.get('.login-button').click();

      cy.url().should('include', '/dashboard/groups'); // Validate successful login
      cy.wait(1500);

      // Logout
      cy.get('.logout-icon').click();
      cy.wait(2000);
      cy.get('.confirm-buttons > :nth-child(2)').click();
      cy.log('Masteruser login test completed successfully.');
    });
  }); //end it

  // Scenario 6: Admin User -> Verify trimmed And mixedCase username allows login
  it('Admin User -> Verify trimmed And mixedCase username allows login', () => {
    cy.fixture('supportView.json').as('example_supportView');
    cy.get('@example_supportView').then((usersJson) => {
      cy.visit(usersJson.baseUrl_prod, { failOnStatusCode: false });
      cy.url().should('include', '/login');

      // Convert username to a combination of upper and lower case letters
      const mixedCaseUsername = usersJson.username_supportViewAdmin
        .split('')
        .map((char, index) =>
          index % 2 === 0 ? char.toUpperCase() : char.toLowerCase()
        )
        .join('');

      // Add 10 spaces at the beginning and end of the username
      const trimmedAndmixedCaseUsername = `          ${mixedCaseUsername}          `;
      cy.get('.username').type(trimmedAndmixedCaseUsername);
      cy.get('.password').type(usersJson.password_supportViewAdmin);
      cy.wait(2500);
      cy.get('.login-button').click();

      // Validate successful login
      cy.url().should('include', '/dashboard/groups');
      cy.url().should('include', usersJson.baseUrl_prod + '/dashboard/groups');
    });
    cy.wait(3500);
    // Logout
    cy.get('.logout-icon').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.log('Masteruser login test completed successfully.');
    cy.wait(1500);
  });

  // Scenario 7: AdminUser -> Login to sw
  it('Adminu user -> Login to sw', () => {
    cy.fixture('supportView.json').as('example_supportView');
    cy.get('@example_supportView').then((usersJson) => {
      cy.visit(usersJson.baseUrl_prod, { failOnStatusCode: false });
      cy.url().should('include', '/login');

      cy.get('.username').type(usersJson.username_supportViewAdmin);
      cy.get('.password').type(usersJson.password_supportViewAdmin);
      cy.get('.login-button').click();
      cy.wait(2500);
      cy.url().should('include', usersJson.baseUrl_prod + '/dashboard/groups'); // Validate successful login
      cy.wait(1500);

      // Logout
      cy.get('.logout-icon').click();
      cy.wait(2000);
      cy.get('.confirm-buttons > :nth-child(2)').click();
      cy.log('Masteruser login test completed successfully.');
    });
  }); //end it
}); //end describe
