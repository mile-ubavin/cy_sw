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
  it.only('Lock the user after 5 invalid login attempts', () => {
    cy.visit(Cypress.env('baseUrl_egEbox'), {
      failOnStatusCode: false,
    });
    cy.wait(3500);
    // Validate URL on the login page
    cy.url().should('include', Cypress.env('baseUrl_egEbox'));

    //Remove Cookie
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        // If the cookie bar is visible, click on it and remove it
        cy.get('#onetrust-accept-btn-handler').click();
      } else {
        // Log that the cookie bar was not visible
        cy.log('Cookie bar not visible');
      }
    }); //End Remove Cookie
    cy.intercept('POST', '**users/login').as('apiRequest');

    // Simulate 4 invalid login attempts
    cy.get('input[placeholder="Benutzername"]').type(username);
    for (let attempt = 1; attempt <= 4; attempt++) {
      cy.get('input[type="password"]').type(invalidPassword);
      cy.get('button[type="submit"]').click();

      cy.wait('@apiRequest', { timeout: 10000 }).then((interception) => {
        expect(interception.response.statusCode).to.eq(404);
        expect(interception.response.body)
          .to.have.property('message')
          .and.equal('Account is locked!');
      });
      cy.get('input[type="password"]').clear();
    }

    // Attempt login after 4 invalid attempts
    cy.get('input[type="password"]').type(invalidPassword);
    cy.get('button[type="submit"]').click();
    // Validate unsuccessful login
    cy.get('mat-error')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Wrong username or password|Wrong username or password/
        );
      });
    // cy.get('form>.error-text').should(
    //   'include.text',
    //   'This account is locked, please try again in 5 minutes.'
    // );

    cy.wait('@apiRequest', { timeout: 10000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(403);
      expect(interception.response.body)
        .to.have.property('message')
        .and.equal('5');
    });
    // });//end fixture
    cy.wait(2500);
  }); //end it

  // Scenario 2: Verify trimming password - fail login
  it('Verify trimming password prevents login', () => {
    cy.visit(Cypress.env('baseUrl_egEbox'), {
      failOnStatusCode: false,
    });
    cy.wait(3500);
    // Validate URL on the login page
    cy.url().should('include', Cypress.env('baseUrl_egEbox'));

    //Remove Cookie
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        // If the cookie bar is visible, click on it and remove it
        cy.get('#onetrust-accept-btn-handler').click();
      } else {
        // Log that the cookie bar was not visible
        cy.log('Cookie bar not visible');
      }
    }); //End Remove Cookie

    const trimmedPassword = `           ${Cypress.env(
      'password_egEbox'
    )}              `; // Add extra spaces
    cy.get('input[placeholder="Benutzername"]').type(
      Cypress.env('username_egEbox')
    );
    cy.get('input[type="password"]').type(trimmedPassword);
    cy.wait(2500);
    cy.get('button[type="submit"]').click();

    // Validate unsuccessful login
    cy.get('mat-error')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Wrong username or password|Wrong username or password/
        );
      });
    cy.log('User was not able to log in after trimming password.');
    cy.wait(3500);
  });

  // Scenario 3: Enter valid password using camelCase letters -> fail login
  it('Try login with valid password in camelCase -> fail login', () => {
    cy.visit(Cypress.env('baseUrl_egEbox'), {
      failOnStatusCode: false,
    });
    cy.wait(3500);
    // Validate URL on the login page
    cy.url().should('include', Cypress.env('baseUrl_egEbox'));

    //Remove Cookie
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        // If the cookie bar is visible, click on it and remove it
        cy.get('#onetrust-accept-btn-handler').click();
      } else {
        // Log that the cookie bar was not visible
        cy.log('Cookie bar not visible');
      }
    }); //End Remove Cookie

    // Convert username to a combination of upper and lower case letters
    const mixedCasePassword = Cypress.env('password_egEbox')
      .split('')
      .map((char, index) =>
        index % 2 === 0 ? char.toUpperCase() : char.toLowerCase()
      )
      .join('');

    cy.get('input[placeholder="Benutzername"]').type(
      Cypress.env('username_egEbox')
    );
    cy.get('input[type="password"]').type(mixedCasePassword);
    cy.get('button[type="submit"]').click();

    // Validate unsuccessful login
    cy.get('mat-error')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Wrong username or password|Wrong username or password/
        );
      });
    cy.log('User was not able to log in after trimming password.');
    cy.wait(3500);
  });

  // Scenario 4: E-Box User -> Verify trimmed And mixedCase username allows login
  it('E-Box User -> Verify trimmed And mixedCase username allows login', () => {
    cy.visit(Cypress.env('baseUrl_egEbox'), {
      failOnStatusCode: false,
    });
    cy.wait(3500);
    // Validate URL on the login page
    cy.url().should('include', Cypress.env('baseUrl_egEbox'));

    //Remove Cookie
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        // If the cookie bar is visible, click on it and remove it
        cy.get('#onetrust-accept-btn-handler').click();
      } else {
        // Log that the cookie bar was not visible
        cy.log('Cookie bar not visible');
      }
    }); //End Remove Cookie

    // Convert username to a combination of upper and lower case letters
    const mixedCaseUsername = Cypress.env('username_egEbox')
      .split('')
      .map((char, index) =>
        index % 2 === 0 ? char.toUpperCase() : char.toLowerCase()
      )
      .join('');

    // Add 10 spaces at the beginning and end of the username
    const trimmedAndmixedCaseUsername = `          ${mixedCaseUsername}          `;
    cy.get('input[placeholder="Benutzername"]').type(
      trimmedAndmixedCaseUsername
    );
    cy.get('input[type="password"]').type(Cypress.env('password_egEbox'));
    cy.wait(1000);

    cy.intercept('POST', '**/rest/v2/deliveries**').as('getDeliveries');
    cy.get('button[type="submit"]').click(); //Login

    cy.wait(['@getDeliveries'], { timeout: 20000 }).then((interception) => {
      // Log the intercepted response
      cy.log('Intercepted response:', interception.response);

      // Assert the response status code
      expect(interception.response.statusCode).to.eq(200);
    });
    cy.url().should('include', '/deliveries'); // => validate url (/deliveries page)
    cy.log('User was able to log in after trimming username.');
    cy.wait(3500);
    // Logout
    cy.get('.user-title').click();
    cy.wait(1500);
    cy.get('.logout-title > a').click();
    //cy.url().should('include', payslipJson.baseUrl_egEbox); // Validate url
    cy.url().should('include', Cypress.env('baseUrl_egEbox')); // Validate url
    cy.log('Test completed successfully.');
  });

  // Scenario 5: E-Box User -> Login to E-Box
  it('E-Box User -> Login to E-Box ', () => {
    cy.visit(Cypress.env('baseUrl_egEbox'), {
      failOnStatusCode: false,
    });
    cy.wait(3500);
    // Validate URL on the login page
    cy.url().should('include', Cypress.env('baseUrl_egEbox'));

    //Remove Cookie
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        // If the cookie bar is visible, click on it and remove it
        cy.get('#onetrust-accept-btn-handler').click();
      } else {
        // Log that the cookie bar was not visible
        cy.log('Cookie bar not visible');
      }
    }); //End Remove Cookie

    cy.get('input[placeholder="Benutzername"]').type(
      Cypress.env('username_egEbox')
    );
    cy.get('input[type="password"]').type(Cypress.env('password_egEbox'));
    cy.intercept('POST', '**/rest/v2/deliveries**').as('getDeliveries');
    cy.get('button[type="submit"]').click(); //Login

    cy.wait(['@getDeliveries'], { timeout: 20000 }).then((interception) => {
      // Log the intercepted response
      cy.log('Intercepted response:', interception.response);

      // Assert the response status code
      expect(interception.response.statusCode).to.eq(200);
    });
    cy.url().should('include', '/deliveries'); // => validate url (/deliveries page)
    cy.log('User was able to log in after trimming username.');
    cy.wait(3500);
    // Logout
    cy.get('.user-title').click();
    cy.wait(1500);
    cy.get('.logout-title > a').click();
    //cy.url().should('include', payslipJson.baseUrl_egEbox); // Validate url
    cy.url().should('include', Cypress.env('baseUrl_egEbox')); // Validate url
    cy.log('Test completed successfully.');
  }); //end it
}); //end describe
