///<reference types="cypress" />

describe('DH_EG_03_Employees_TS_Reset_Password', () => {
  //Reset Password from Persons table
  it('DH - Reset Password from Persons table', () => {
    // Visit DH application using base URL from environment configuration
    cy.visit(Cypress.env('dh_baseUrl'));
    // Validate that the current URL includes the DH base URL
    cy.url().should('include', Cypress.env('dh_baseUrl'));

    // Remove Cookie consent dialog if present on the page
    cy.get('body').then(($body) => {
      // Check if the cookie consent dialog title element is visible
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        // Click the "Accept" button to dismiss the cookie dialog
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      } else {
        // Log message if cookie banner is not visible
        cy.log('Cookie bar not visible');
      }
    });

    // Login to DH SupportView using custom command defined in commands.js
    cy.loginToDH();

    // Wait 2 seconds for login process to complete and page to stabilize
    cy.wait(2000);

    // Validate that URL now includes the home page path after successful login
    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);

    // Scroll to top of page to ensure sidebar navigation menu is visible
    cy.scrollTo('top', { duration: 200 });

    // Setup API interceptor for GET request to fetch employees from group
    cy.intercept('GET', '**/person/fromGroup/**').as('getEmployees');
    // Find the Employees navigation button in sidebar by ID
    cy.get('#nav-employees')
      // Verify the element is visible before interacting
      .should('be.visible')
      // Apply visual highlight (black border) to the element for debugging/demo
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      // Wait 1.5 seconds to allow visual observation
      .wait(1500)
      // Click the Employees navigation button
      .click();

    // Wait for the intercepted API call to complete and validate response
    cy.wait('@getEmployees', { timeout: 35000 }).then((interception) => {
      // Assert that the API response status code is 200 (Success)
      expect(interception.response.statusCode).to.eq(200);
    });

    // Wait 1.5 seconds for employees page to fully load
    cy.wait(1500);

    // Get the company name from environment config and convert to lowercase for comparison
    const companyName = Cypress.env('company').toLowerCase();

    // Click the company selection dropdown to open the list of available companies
    cy.get('#employee-select-company').click({ force: true });
    // Wait 1 second for dropdown options to appear
    cy.wait(1000);

    // Find and click the matching company option from dropdown (case-insensitive partial match)
    cy.get('ul[role="listbox"] > li > span')
      // Ensure all dropdown options are visible
      .should('be.visible')
      // Process all dropdown options to find matching company
      .then(($options) => {
        // Convert jQuery object to array and search for company name match
        const match = [...$options].find((el) =>
          // Trim whitespace, convert to lowercase, and check if it includes company name
          el.textContent.trim().toLowerCase().includes(companyName),
        );
        // If matching company option is found
        if (match) {
          // Click the matching company option
          cy.wrap(match).click({ force: true });
        } else {
          // Throw error if no matching company is found in dropdown
          throw new Error(`No dropdown option contains: ${companyName}`);
        }
      });
    // Wait 500ms for company selection to apply
    cy.wait(500);

    // Scroll to top to ensure filter toggle button is visible on screen
    cy.scrollTo('top', { duration: 500 });
    // Wait 500ms for scroll to complete
    cy.wait(500);

    // Get test user data from first entry in createUser array from cypress.config.js
    const user = Cypress.env('createUser')[0];
    // Wait 1.5 seconds for page to stabilize before interacting with filters
    cy.wait(1500);

    // Find the filter toggle button by aria-label attribute
    cy.get('button[aria-label="persons.toggleFilters"]')
      // Apply visual highlight (black border) to the filter button for debugging/demo
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      // Wait 1.5 seconds to allow visual observation
      .wait(1500)
      // Click the filter toggle button to show/hide filters bar
      .click()
      // Wait 1.5 seconds for filter bar animation to complete
      .wait(1500);

    // Find username input field (supports both English and German placeholders)
    cy.get(
      'input[placeholder*="Username"], input[placeholder*="Benutzername"]',
      // Type the username from test data into the filter input
    ).type(user.username);
    // Wait 1 second for filter to apply and table to update
    cy.wait(1000);

    // Scroll to top to ensure the action menu button (3-dot) is visible
    cy.scrollTo('top', { duration: 500 });
    // Wait 500ms for scroll to complete
    cy.wait(500);

    // Declare variable to store user status (active/inactive)
    let userStatus = '';

    // Find the first table row in tbody
    cy.get('tbody > tr')
      .first()
      // Find the last table cell (contains status)
      .find('td')
      .last()
      // Get the text content from the status cell
      .invoke('text')
      // Store and log the user status
      .then((statusText) => {
        // Store status as lowercase for easier comparison
        userStatus = statusText.trim().toLowerCase();
        // Log the user status to Cypress console for debugging
        cy.log(`User Status: ${statusText.trim()}`);
      })
      // Chain to next step after status is captured
      .then(() => {
        // Find the "More Row actions" button (3-dot menu) in the first row
        cy.get('button[aria-label="More Row actions"]')
          .first()
          // Click the action menu button with force option
          .click({ force: true });
        // Wait 1 second for menu to open and render
        cy.wait(1000);

        // Check if user status matches "active" or "aktiv" (German) using regex
        const isActive = /active|aktiv/i.test(userStatus);

        // Conditional logic based on user activation status
        if (!isActive) {
          // User is INACTIVE - Reset Password button should NOT be available
          // Log that user is inactive
          cy.log('User is INACTIVE - Reset Password button should be hidden');
          // Find all menu item spans
          cy.get('ul[role="menu"] span')
            // Ensure menu items are visible
            .should('be.visible')
            // Iterate through each menu item
            .each(($el) => {
              // Get the text of the current menu button
              const buttonText = $el.text().trim();
              // Assert that Reset Password button does NOT exist in menu (EN/DE)
              expect(buttonText).to.not.match(
                /Reset password|Passwort zurücksetzen/i,
              );
            });

          // Close the action menu by clicking on page body (outside menu)
          cy.get('body').click(0, 0);
          // Log test completion message for inactive user scenario
          cy.log(
            'Test complete - User is inactive, Reset Password not available',
          );
        } else {
          // User is ACTIVE - Reset Password button should be visible and clickable
          // Log that user is active
          cy.log('User is ACTIVE - Reset Password button should be visible');

          // Setup API interceptor for POST request to reset person password
          cy.intercept('POST', '**/person/resetPersonPassword').as(
            'resetPassword',
          );

          // Find all menu item spans in the action menu
          cy.get('ul[role="menu"] span')
            // Ensure menu items are visible
            .should('be.visible')
            // Iterate through each menu item to find Reset Password button
            .each(($el) => {
              // Check if current element text matches Reset Password (EN/DE)
              if ($el.text().match(/Reset password|Passwort zurücksetzen/i)) {
                // Apply visual highlight (black border) to Reset Password button
                cy.wrap($el).invoke(
                  'attr',
                  'style',
                  'border: 2px solid black; padding: 2px;',
                );
                // Wait 2 seconds to allow visual observation of highlighted element
                cy.wait(2000);
                // Click the Reset Password button
                cy.wrap($el).click();
              }
            });

          // Wait for the intercepted reset password API call with 15 second timeout
          cy.wait('@resetPassword', { timeout: 15000 }).then((interception) => {
            // Assert that reset password API response status is 200 (Success)
            expect(interception.response.statusCode).to.eq(200);
            // Log success message to Cypress console
            cy.log('Password reset successful');
          });

          // Wait 3.5 seconds for password reset confirmation and UI updates
          cy.wait(3500);
        }
      });
  }); //End IT

  it.only('Yopmail - Confirm email and Change password', () => {
    // Visit yopmail application
    cy.visit('https://yopmail.com/en/');

    // Access the first Admin User object from cypress.config.js
    const user = Cypress.env('createUser')[0];

    // Type user email into yopmail login field
    cy.get('#login').type(user.email);

    // Click refresh button to load inbox
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    cy.wait(1500);

    // Validate subject of verification email in inbox
    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .eq(0)
      .should('include.text', 'Ihr neuer Benutzer im DocuHub Portal');

    // Wait for page to load
    cy.wait(15000);

    // Remove Cookie dialog if present in iframe
    cy.iframe('#ifmail').then(($iframe) => {
      if ($iframe.find('#onetrust-policy-title').length > 0) {
        const $acceptBtn = $iframe.find('#onetrust-accept-btn-handler');
        if ($acceptBtn.is(':visible')) {
          cy.wrap($acceptBtn).click({ force: true });
          cy.log('Cookie dialog closed.');
        }
      } else {
        cy.log('Cookie dialog not visible.');
      }
    });
    cy.wait(1500);

    // Click confirmation button to complete email verification
    cy.iframe('#ifmail').find('.button').click();
    cy.wait(8000);

    // Reload inbox to get reset password email
    cy.get('#refresh').click({ force: true });
    cy.wait(5000);

    // Validate subject of reset password email
    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .eq(0)
      .should('include.text', 'Passwort zurücksetzen DocuHub Portal');

    // Get password reset link href and log it
    cy.iframe('#ifmail')
      .find(
        '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a',
      )
      .should('include.text', 'Neues Passwort erstellen ')
      .invoke('attr', 'href')
      .then((href) => {
        cy.log(`Password reset href: ${href}`);
      });

    // Click password reset link (prevent opening in new tab)
    cy.iframe('#ifmail')
      .find(
        '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a',
      )
      .invoke('attr', 'target', '_self')
      .click();
    cy.wait(2500);

    // Fill the Set password form - first password field
    cy.iframe('#ifmail')
      .find('.input__field-input')
      .eq(0)
      .click()
      .type(Cypress.env('password_egEbox'));

    // Click show password icon for first field
    cy.iframe('#ifmail').find('.input-eye-icon').eq(0).click();

    // Fill the Set password form - confirm password field
    cy.iframe('#ifmail')
      .find('.input__field-input')
      .eq(1)
      .type(Cypress.env('password_egEbox'));

    // Click show password icon for second field
    cy.iframe('#ifmail').find('.input-eye-icon').eq(1).click();

    // Click confirm button to set password
    cy.iframe('#ifmail').find('.button').click();

    cy.wait(2000);
  });
});
