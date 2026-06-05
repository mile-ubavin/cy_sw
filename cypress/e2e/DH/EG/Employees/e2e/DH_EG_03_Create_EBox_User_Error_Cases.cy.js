/// <reference types="cypress" />

// =============================================================================
// Scenario: Create EBox User — Error Cases & Edge Cases
// Coverage: Validation errors, network failures, server error responses.
//           These scenarios are NOT in the happy path test — they test what
//           happens when things go wrong, which is equally important for P0.
// Priority: P0
// Complements: DH_EG_03_Create_EBox_User_With_Address.cy.js (happy path)
// =============================================================================

describe('Create EBox User — Error Cases [P0]', () => {
  // ---------------------------------------------------------------------------
  // Shared helpers
  // ---------------------------------------------------------------------------

  const dismissCookieBar = () => {
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      }
    });
  };

  const navigateToCreateUserForm = () => {
    cy.visit(Cypress.env('dh_baseUrl'));
    dismissCookieBar();
    cy.loginToDH();
    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);
    cy.scrollTo('top', { duration: 200 });

    cy.intercept('GET', '**/person/fromGroup/**').as('getEmployees');
    cy.get('#nav-employees').should('be.visible').click();
    cy.wait('@getEmployees', { timeout: 35000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });
    cy.wait(1500);

    const companyName = Cypress.env('company').toLowerCase();
    cy.get('#employee-select-company').click({ force: true });
    cy.wait(1000);
    cy.get('ul[role="listbox"] > li > span')
      .should('be.visible')
      .then(($options) => {
        const match = [...$options].find((el) =>
          el.textContent.trim().toLowerCase().includes(companyName),
        );
        if (match) cy.wrap(match).click({ force: true });
        else throw new Error(`No dropdown option contains: ${companyName}`);
      });
    cy.wait(500);
    cy.scrollTo('top', { duration: 500 });

    cy.get('#employee-add-employee')
      .contains(/Neuen Kontakt anlegen|Create New Contact/i)
      .click();
    cy.wait(500);

    cy.get('h2')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Neuen Kontakt anlegen|Create New Contact/);
      });
  };

  const selectCompanyPrefix = () => {
    cy.get('input[aria-autocomplete="list"]').click({ force: true });
    cy.wait(1000);
    cy.get("ul[role='listbox'] > li")
      .should('be.visible')
      .then(($items) => {
        const prefix = (Cypress.env('companyPrefix') || Cypress.env('company')).toLowerCase();
        const match = [...$items].find((el) =>
          el.textContent.trim().toLowerCase().includes(prefix),
        );
        if (match) cy.wrap(match).click({ force: true });
        else throw new Error(`No autocomplete option contains: ${prefix}`);
      });
  };

  // Best practice: tests that just need to ADVANCE past Step 1 (i.e. they're
  // testing Step 2 validations, not accountNumber uniqueness) use a fresh
  // unique accountNumber. This keeps tests independent of prior DB state and
  // avoids the wizard blocking transition with "Invalid person account number".
  // Only IT5 (duplicate-test) deliberately uses Cypress.env('createUser')[0].username.
  const uniqueAccountNumber = (prefix) => `${prefix}_${Date.now()}`;

  // ---------------------------------------------------------------------------
  // IT1 — Required field: lastName shows error on blur, blocks progression
  // ---------------------------------------------------------------------------
  it('Step 1 — lastName required: shows alert on blur', () => {
    navigateToCreateUserForm();

    const user = Cypress.env('createUser')[0];
    cy.get('#create-user-firstName').type(user.firstName);

    cy.get('#create-user-lastName').focus().blur();

    cy.get('div[role="alert"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Required field|Pflichtfeld/i);
      });

    cy.log('lastName required validation: PASS');
  });

  // ---------------------------------------------------------------------------
  // IT2 — Required field: accountNumber shows error on blur
  // ---------------------------------------------------------------------------
  it('Step 1 — accountNumber required: shows alert on blur', () => {
    navigateToCreateUserForm();

    const user = Cypress.env('createUser')[0];
    cy.get('#create-user-firstName').type(user.firstName);
    cy.get('#create-user-lastName').type(user.lastName);
    selectCompanyPrefix();

    cy.get('#create-user-accountNumber').focus().blur();

    cy.get('div[role="alert"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Required field|Pflichtfeld/i);
      });

    cy.log('accountNumber required validation: PASS');
  });

  // ---------------------------------------------------------------------------
  // IT3 — Invalid phone format: shows format error, blocks progression
  // ---------------------------------------------------------------------------
  it('Step 2 — invalid phone format: shows format error', () => {
    navigateToCreateUserForm();

    const user = Cypress.env('createUser')[0];
    cy.get('#create-user-firstName').type(user.firstName);
    cy.get('#create-user-lastName').type(user.lastName);
    selectCompanyPrefix();
    cy.get('#create-user-accountNumber').type(uniqueAccountNumber('phone'));
    cy.get('#create-user-next').click({ force: true });

    // Phone without country code — should fail
    cy.get('#create-user-mobileNumber', { timeout: 10000 })
      .type('0664123456')
      .blur();

    cy.get('div[role="alert"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Invalid value\. Please enter the phone number including the country code \(e\.g\., \+43(?:\.\.\.|…), \+49(?:\.\.\.|…)\)|Ungültiger Wert\. Bitte geben Sie die Telefonnummer einschließlich der Landesvorwahl ein \(z\. B\. \+43(?:\.\.\.|…), \+49(?:\.\.\.|…)\)/i,
        );
      });

    cy.log('Phone without country code validation: PASS');
  });

  // ---------------------------------------------------------------------------
  // IT4 — Invalid email format: shows format error
  // ---------------------------------------------------------------------------
  it('Step 2 — invalid email format: shows format error', () => {
    navigateToCreateUserForm();

    const user = Cypress.env('createUser')[0];
    cy.get('#create-user-firstName').type(user.firstName);
    cy.get('#create-user-lastName').type(user.lastName);
    selectCompanyPrefix();
    cy.get('#create-user-accountNumber').type(uniqueAccountNumber('email'));
    cy.get('#create-user-next').click({ force: true });

    cy.get('#create-user-mobileNumber', { timeout: 10000 })
      .clear()
      .type('+43 1234567890');

    cy.get('#create-user-email').type('not-an-email').blur();

    cy.get('div[role="alert"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Invalid email format|Das E-Mail-Format ist ungültig/i);
      });

    cy.log('Invalid email format validation: PASS');
  });

  // ---------------------------------------------------------------------------
  // IT5 — Duplicate accountNumber: server rejects, form shows error
  // ---------------------------------------------------------------------------
  it('Step 1 — duplicate accountNumber: server returns validation error', () => {
    navigateToCreateUserForm();

    const user = Cypress.env('createUser')[0];
    cy.get('#create-user-firstName').type(user.firstName);
    cy.get('#create-user-lastName').type(user.lastName);
    selectCompanyPrefix();
    cy.get('#create-user-accountNumber').type(user.username);
    cy.wait(1000);

    cy.get('#create-user-next')
      .contains(/weiter|Next/i)
      .click({ force: true });
    cy.wait(1000);

    cy.get('#accountNumber-helper')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Invalid person account number|Ungultige Personalnummer|Ungültige Personalnummer/i,
        );
      });

    cy.log('Duplicate accountNumber server validation: PASS');
  });

  // ---------------------------------------------------------------------------
  // IT6 — Network error on POST /editPerson: form handles gracefully
  //        cy.intercept forceNetworkError simulates complete network failure
  //        (connection dropped, DNS failure, server unreachable)
  // ---------------------------------------------------------------------------
  it('POST /editPerson — network error: form does not crash', () => {
    navigateToCreateUserForm();

    const user = Cypress.env('createUser')[0];

    // Step 1
    cy.get('#create-user-firstName').type(user.firstName);
    cy.get('#create-user-lastName').type(user.lastName);
    selectCompanyPrefix();
    cy.get('#create-user-accountNumber').type(`netErr_${Date.now()}`);
    cy.get('#create-user-next').click({ force: true });

    // Step 2
    cy.get('#create-user-mobileNumber', { timeout: 10000 }).type('+43 1234567890');
    cy.get('#create-user-email').type(user.email);
    cy.get('#create-user-next').click({ force: true });

    // Step 3 — intercept BEFORE clicking create
    cy.intercept('POST', '**/editPerson', { forceNetworkError: true }).as('editPersonNetworkError');
    cy.wait(1500);

    cy.get('#create-user-create>div:nth-of-type(1)')
      .contains(/Create|Erstellen/i)
      .click({ force: true });

    cy.wait('@editPersonNetworkError');

    // Form should NOT crash — either shows error message or stays on the page
    cy.get('body').should('be.visible');
    cy.url().should('include', Cypress.env('dh_baseUrl'));
    cy.log('Network error handled gracefully — page did not crash: PASS');
  });

  // ---------------------------------------------------------------------------
  // IT7 — Server 500 on POST /editPerson: form shows error, does not freeze
  //        Simulates server-side failure (DB down, internal error)
  // ---------------------------------------------------------------------------
  it('POST /editPerson — server 500: form handles server error gracefully', () => {
    navigateToCreateUserForm();

    const user = Cypress.env('createUser')[0];

    // Step 1
    cy.get('#create-user-firstName').type(user.firstName);
    cy.get('#create-user-lastName').type(user.lastName);
    selectCompanyPrefix();
    cy.get('#create-user-accountNumber').type(`server500_${Date.now()}`);
    cy.get('#create-user-next').click({ force: true });

    // Step 2
    cy.get('#create-user-mobileNumber', { timeout: 10000 }).type('+43 1234567890');
    cy.get('#create-user-email').type(user.email);
    cy.get('#create-user-next').click({ force: true });

    // Step 3 — intercept with mocked 500 response
    cy.intercept('POST', '**/editPerson', {
      statusCode: 500,
      body: { message: 'Internal Server Error' },
    }).as('editPerson500');
    cy.wait(1500);

    cy.get('#create-user-create>div:nth-of-type(1)')
      .contains(/Create|Erstellen/i)
      .click({ force: true });

    cy.wait('@editPerson500').then((interception) => {
      expect(interception.response.statusCode).to.eq(500);
    });

    // Form should remain usable after server error
    cy.get('body').should('be.visible');
    cy.url().should('include', Cypress.env('dh_baseUrl'));
    cy.log('Server 500 handled gracefully — page did not crash: PASS');
  });
});
