///<reference types="cypress" />

describe('DH - Edit Person Page Validation Fixes', () => {
  beforeEach(() => {
    // Visit DH
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.url().should('include', Cypress.env('dh_baseUrl'));
    cy.wait(1500);

    // Remove Cookie dialog if present
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').length) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      } else {
        cy.log('Cookie bar not visible');
      }
    });
    cy.wait(1500);

    // Intercept backend call after login
    cy.intercept('GET', '**/generalInfo').as('generalInfo');

    // Login Dummy button
    cy.get('button[id=":r2:"]').contains('Login Dummy').click();
    cy.wait(2000);

    // Wait & Assert response
    cy.wait('@generalInfo', { timeout: 15000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('Login successful, generalInfo loaded');
    });

    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home/persons`);
    cy.wait(1000);

    // Select Company
    const companyName = Cypress.env('company').toLowerCase();

    // Open the dropdown
    cy.get('div[role="combobox"]').click({ force: true });

    // Find and click the matching option (ignore case)
    cy.get('ul[aria-labelledby=":r5:-label"] > li > span')
      .should('be.visible')
      .each(($el) => {
        const text = $el.text().trim().toLowerCase();
        if (text === companyName) {
          cy.wrap($el).click({ force: true });
        }
      });
    cy.wait(500);

    // Get user test data from cypress.config.js
    const user = Cypress.env('createUser')[0];
    cy.wait(1500);

    // Search for user by username
    cy.get('input[placeholder="Benutzername"]').type(user.username);
    cy.wait(1000);

    // Scroll UP
    cy.window().then((win) => {
      win.scrollTo({ top: 0, behavior: 'smooth' });
    });
    cy.wait(500);

    // Open 3-dot menu
    cy.get('button[aria-label="More Row actions"]').click({ force: true });
    cy.wait(1000);

    // Click Edit button
    cy.get('ul[role="menu"] span')
      .should('be.visible')
      .each(($el) => {
        if ($el.text().match(/Bearbeiten|Edit/i)) {
          cy.wrap($el).invoke(
            'attr',
            'style',
            'border: 2px solid red; padding: 2px;'
          );
          cy.wait(1000);
          cy.wrap($el).click();
        }
      });

    cy.wait(2000);
  });

  // Issue #9: Validation messages are missing on (LastName/Email/AT-ZipCode) fields
  it('Issue #9 - Edit Person: Validate missing validation messages on LastName, Email, AT-ZipCode fields', () => {
    cy.log('Testing validation messages on Edit Person page');

    // Test LastName validation
    cy.log('Testing LastName field validation');
    cy.get('input[placeholder="Nachname"]').should('be.visible').clear().blur(); // Trigger validation by losing focus

    cy.wait(500);

    // Check for validation message on LastName
    cy.get('body').then(($body) => {
      const hasValidationMessage =
        $body.find('div[role="alert"]').length > 0 ||
        $body.find('.error-message').length > 0 ||
        $body.find('[class*="error"]').length > 0;

      if (hasValidationMessage) {
        cy.log('LastName validation message is present');
        cy.get('div[role="alert"], .error-message, [class*="error"]')
          .first()
          .should('be.visible')
          .invoke('text')
          .then((text) => {
            cy.log(`Validation message: ${text}`);
          });
      } else {
        cy.log('BUG: LastName validation message is MISSING');
        throw new Error('LastName validation message is missing - Issue #9');
      }
    });

    // Restore LastName value
    const user = Cypress.env('createUser')[0];
    cy.get('input[placeholder="Nachname"]').type(user.lastName);
    cy.wait(500);

    // Test Email validation with invalid format
    cy.log('Testing Email field validation');
    cy.get('input[placeholder="email@example.com"]')
      .should('be.visible')
      .clear()
      .type('invalid-email-format');

    cy.wait(500);

    // Check for validation message on Email
    cy.get('body').then(($body) => {
      const hasEmailValidation =
        $body.find('div[role="alert"]').length > 0 ||
        $body.text().includes('E-Mail') ||
        $body.text().includes('ungültig');

      if (hasEmailValidation) {
        cy.log('Email validation message is present');
        cy.get('div[role="alert"]')
          .should('be.visible')
          .invoke('text')
          .then((text) => {
            expect(text).to.match(/E-Mail|ungültig|invalid/i);
            cy.log(`Email validation message: ${text}`);
          });
      } else {
        cy.log('BUG: Email validation message is MISSING');
        throw new Error('Email validation message is missing - Issue #9');
      }
    });

    // Restore email
    cy.get('input[placeholder="email@example.com"]').clear().type(user.email);
    cy.wait(500);

    // Test AT-ZipCode validation
    cy.log('Testing AT-ZipCode field validation');

    // First, set country to Austria if not already
    cy.get('input[placeholder="PLZ"]').should('be.visible').clear();
    cy.wait(500);

    // Enter invalid Austrian zip code (should be 4 digits)
    cy.get('input[placeholder="PLZ"]').type('12345'); // 5 digits - invalid for Austria
    cy.wait(500);

    // Check for AT zip code validation
    cy.get('body').then(($body) => {
      const hasZipValidation =
        $body.find('div[role="alert"]').length > 0 ||
        $body.text().includes('PLZ') ||
        $body.text().includes('Postleitzahl');

      if (hasZipValidation) {
        cy.log('AT-ZipCode validation message is present');
        cy.get('div[role="alert"], .error-message, [class*="error"]')
          .first()
          .should('be.visible')
          .invoke('text')
          .then((text) => {
            cy.log(`AT-ZipCode validation message: ${text}`);
          });
      } else {
        cy.log('BUG: AT-ZipCode validation message is MISSING');
        throw new Error('AT-ZipCode validation message is missing - Issue #9');
      }
    });

    // Enter valid Austrian zip code (should be 4 digits)
    cy.get('input[placeholder="PLZ"]').clear().type('1234'); // 4 digits - valid for Austria
    cy.wait(500);

    cy.log('Issue #9 validation test completed');
  });

  // Issue #10: Telephone number not displayed properly
  it.only('Issue #10 - Edit Person: Validate telephone number display format', () => {
    cy.log('Testing telephone number display on Edit Person page');

    // Expected full telephone object
    const expectedPhone = {
      countryCode: '381',
      netCode: '64',
      subscriberNumber: '2826462',
      type: '0',
    };

    cy.log('Checking telephone number field');

    // Get the telephone number field
    cy.get('input[placeholder*="2826462"], input[value*="2826462"]')
      .should('be.visible')
      .invoke('val')
      .then((phoneValue) => {
        cy.log(`Current phone display: ${phoneValue}`);

        // Check if only subscriber number is displayed (BUG)
        if (phoneValue === expectedPhone.subscriberNumber) {
          cy.log('BUG: Only subscriber number is displayed');
          cy.log(
            `Expected: +${expectedPhone.countryCode} ${expectedPhone.netCode} ${expectedPhone.subscriberNumber}`
          );
          cy.log(`Actual: ${phoneValue}`);
          throw new Error(
            'Telephone number not displayed properly - only subscriber number visible - Issue #10'
          );
        }

        // Check if full number is displayed correctly
        const hasCountryCode = phoneValue.includes(expectedPhone.countryCode);
        const hasNetCode = phoneValue.includes(expectedPhone.netCode);
        const hasSubscriberNumber = phoneValue.includes(
          expectedPhone.subscriberNumber
        );

        if (hasCountryCode && hasNetCode && hasSubscriberNumber) {
          cy.log('✅ Full telephone number is displayed correctly');
          cy.log(`Phone display: ${phoneValue}`);
        } else {
          cy.log('❌ BUG: Incomplete telephone number display');
          cy.log(
            `Missing parts - Country: ${!hasCountryCode}, Net: ${!hasNetCode}, Subscriber: ${!hasSubscriberNumber}`
          );
          throw new Error('Telephone number format incomplete - Issue #10');
        }
      });

    // Alternative check: Look for separate fields for country code, net code, subscriber number
    cy.get('body').then(($body) => {
      // Check if phone is split into multiple fields
      const countryCodeField = $body.find(
        'input[placeholder*="Country"], input[placeholder*="Ländervorwahl"]'
      );
      const netCodeField = $body.find(
        'input[placeholder*="Net"], input[placeholder*="Vorwahl"]'
      );
      const subscriberField = $body.find(
        'input[placeholder*="Teilnehmer"], input[placeholder*="Subscriber"]'
      );

      if (
        countryCodeField.length > 0 &&
        netCodeField.length > 0 &&
        subscriberField.length > 0
      ) {
        cy.log('📋 Phone number split into separate fields:');

        cy.wrap(countryCodeField)
          .invoke('val')
          .then((cc) => {
            cy.log(
              `Country Code: ${cc} (expected: ${expectedPhone.countryCode})`
            );
            expect(cc).to.equal(expectedPhone.countryCode);
          });

        cy.wrap(netCodeField)
          .invoke('val')
          .then((nc) => {
            cy.log(`Net Code: ${nc} (expected: ${expectedPhone.netCode})`);
            expect(nc).to.equal(expectedPhone.netCode);
          });

        cy.wrap(subscriberField)
          .invoke('val')
          .then((sn) => {
            cy.log(
              `Subscriber Number: ${sn} (expected: ${expectedPhone.subscriberNumber})`
            );
            expect(sn).to.equal(expectedPhone.subscriberNumber);
          });
      }
    });

    cy.log('✅ Issue #10 telephone display test completed');
  });
});
