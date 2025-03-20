describe('it', () => {
  it('Extract Username & Password and Login to eBox', () => {
    cy.visit('https://yopmail.com/en/');

    // Enter email and refresh inbox
    cy.get('#login').type('aqua-gmbh@yopmail.com');
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    cy.wait(1500);

    // Open first email
    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .eq(0)
      .should('include.text', 'Neuer Benutzer angelegt e-Gehaltszettel Portal')
      .click();

    // Extract username & password
    cy.iframe('#ifmail')
      .find('p')
      .invoke('text')
      .then((emailBody) => {
        cy.log('Full Email Body:', emailBody);

        const usernameMatch = emailBody.match(/Benutzername:\s*([\S]+)/);
        const passwordMatch = emailBody.match(/Passwort:\s*([\S]+)/);

        if (!usernameMatch || !passwordMatch) {
          throw new Error(' Username or Password not found in email!');
        }

        const extractedUsername = usernameMatch[1].trim();
        const extractedPassword = passwordMatch[1].trim();

        // Store the captured username globally
        cy.wrap(extractedUsername).as('capturedUsername');
        Cypress.env('usernameFromEmailBody', extractedUsername);

        cy.wrap(extractedPassword).as('capturedPassword');
        Cypress.env('passwordFromEmailBody', extractedPassword);

        cy.wait(2500);

        // Log the username
        cy.log('Username------->:', extractedUsername);
        // Log the password
        cy.log('Password------->:', extractedPassword);

        // Login to E-Box
        cy.visit(Cypress.env('baseUrl_egEbox'), {
          failOnStatusCode: false,
        });
        cy.wait(4500);
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
        cy.wait(1500);

        // Use extracted username and password for login
        // cy.get('@capturedUsername').then((username) => {
        //   cy.get('@capturedPassword').then((password) => {
        // Enter credentials and submit the form
        cy.get('input[placeholder="Benutzername"]').type('aquajatUser');
        cy.get('input[type="password"]').type('2dC)^L)R');
        cy.wait(1500);

        cy.intercept('POST', '**/rest/v2/deliveries**').as(
          'openDeliveriesPage'
        );
        cy.wait(1000);
        cy.get('button[type="submit"]').click(); //Login to E-Box
        cy.visit(Cypress.env('eboxDeliveryPage'), {
          failOnStatusCode: false,
        });
        cy.wait(['@openDeliveriesPage'], { timeout: 37000 }).then(
          (interception) => {
            // Log the intercepted response
            cy.log('Intercepted response:', interception.response);

            // Assert the response status code
            expect(interception.response.statusCode).to.eq(200);
            cy.wait(2500);
          }
        );
        cy.wait(7000);
        // Logout
        cy.get('.user-title').click();
        cy.wait(1500);
        cy.get('.logout-title > a').click();
        //cy.url().should('include', payslipJson.baseUrl_egEbox); // Validate url
        cy.url().should('include', Cypress.env('baseUrl_egEbox')); // Validate url
        cy.log('Test completed successfully.');
        // });
        // }); //end alias un
      }); //end alias pw
    // cy.get('button[type="submit"]').click(); //Login to E-Box
  }); //end it
});
