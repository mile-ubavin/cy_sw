/// <reference types="cypress" />

// =============================================================================
// Scenario: Create EBox user WITHOUT address data
// Coverage: Verifies address fields are optional — user can be created,
//           email confirmed, and first login completed without any address.
// Priority: P0 (complement to DH_EG_03_Employees_TS_Create_EBox_User_Manually_REVIEW.js)
// Data:     Cypress.env('createUserNoAddress')[0]
// =============================================================================

describe('Create e-Box user manually — No Address [P0]', () => {
  // ---------------------------------------------------------------------------
  // Shared helpers
  // ---------------------------------------------------------------------------

  const searchAndDeleteUser = (userName) => {
    cy.get('.search-label').click();

    cy.intercept('POST', '**/person/fromGroup/**').as('personFromGroup');
    cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
      .clear()
      .type(userName);
    cy.get('button[type="submit"]').click();

    cy.wait('@personFromGroup', { timeout: 10000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.wait(1500);

    cy.get('body').then(($body) => {
      if ($body.find('.cdk-row').length === 0) {
        cy.log(`User ${userName} not found or already deleted.`);
        cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click();
      } else {
        cy.get('.cdk-row').should('exist');
        cy.get('button')
          .contains(/Delete|DSGVO-Löschung/)
          .should('be.visible')
          .click();
        cy.get('.confirm-buttons > button')
          .contains(/YES|JA/)
          .should('be.visible')
          .click();
        cy.log(`User ${userName} deleted.`);
        cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click();
      }
    });
  };

  const dismissReleaseNotePopup = () => {
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      }
    });
  };

  const dismissCookieBar = () => {
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      }
    });
  };

  // ---------------------------------------------------------------------------
  // IT1 — Precondition: Delete leftover no-address test user
  // ---------------------------------------------------------------------------
  it('Login As Master User - Delete Already created No-Address User', () => {
    cy.loginToSupportViewMaster();
    cy.wait(3500);

    dismissReleaseNotePopup();
    cy.wait(1500);

    cy.get('#searchButton>span').click();
    const companyName = Cypress.env('company');
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap').eq(0).type(companyName);
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.get('.action-buttons > .mdc-button').eq(4).click();

    const user = Cypress.env('createUserNoAddress')?.[0];
    if (user?.username) {
      cy.wait(1500);
      searchAndDeleteUser(user.username);
    }

    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl'));
    cy.wait(3000);
  });

  // ---------------------------------------------------------------------------
  // IT2 — DH: Create EBox user WITHOUT address data
  // ---------------------------------------------------------------------------
  it('DH - Create New E-box User manually — No Address', () => {
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.url().should('include', Cypress.env('dh_baseUrl'));

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

    // Select company
    const companyName = Cypress.env('company').toLowerCase();
    cy.get('#employee-select-company').click({ force: true });
    cy.wait(1000);
    cy.get('ul[role="listbox"] > li > span')
      .should('be.visible')
      .then(($options) => {
        const match = [...$options].find((el) =>
          el.textContent.trim().toLowerCase().includes(companyName),
        );
        if (match) {
          cy.wrap(match).click({ force: true });
        } else {
          throw new Error(`No dropdown option contains: ${companyName}`);
        }
      });
    cy.wait(500);

    cy.scrollTo('top', { duration: 500 });
    cy.wait(500);

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
    cy.wait(500);

    const user = Cypress.env('createUserNoAddress')[0];

    // ── Wizard Step 1: Basic data ─────────────────────────────────────────────
    cy.get('#create-user-prefixed-title').type(user.prefixedTitle);
    cy.get('#create-user-firstName').type(user.firstName);

    cy.get('#create-user-lastName').focus().blur();
    cy.get('div[role="alert"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Required field|Pflichtfeld/i);
      });
    cy.wait(1000);
    cy.get('#create-user-lastName').type(user.lastName);

    cy.get('input[aria-autocomplete="list"]').focus().blur();
    cy.get('div[role="alert"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Required field|Pflichtfeld/i);
      });
    cy.wait(1000);

    cy.get('input[aria-autocomplete="list"]').click({ force: true });
    cy.wait(1000);
    cy.get("ul[role='listbox'] > li")
      .should('be.visible')
      .then(($items) => {
        const prefix = (Cypress.env('companyPrefix') || Cypress.env('company')).toLowerCase();
        const match = [...$items].find((el) =>
          el.textContent.trim().toLowerCase().includes(prefix),
        );
        if (match) {
          cy.wrap(match).click({ force: true });
        } else {
          throw new Error(`No autocomplete option contains: ${prefix}`);
        }
      });

    cy.get('#create-user-accountNumber').focus().blur();
    cy.get('div[role="alert"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Required field|Pflichtfeld/i);
      });
    cy.wait(1000);

    cy.get('#create-user-accountNumber').type(user.username);
    cy.wait(1000);

    cy.get('#create-user-next').click({ force: true });

    // ── Wizard Step 2: Contact data — phone + email only, NO address ──────────
    const phoneNumber = `${user.countryCodePhoneNum} ${user.netNumberPhoneNum}${user.subscriberNumberPhoneNum}`;

    cy.get('#create-user-mobileNumber', { timeout: 10000 }).type('invalid_phone_number').blur();
    cy.get('div[role="alert"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Invalid value\. Please enter the phone number including the country code \(e\.g\., \+43(?:\.\.\.|…), \+49(?:\.\.\.|…)\)|Ungültiger Wert\. Bitte geben Sie die Telefonnummer einschließlich der Landesvorwahl ein \(z\. B\. \+43(?:\.\.\.|…), \+49(?:\.\.\.|…)\)/i,
        );
      });
    cy.wait(1000);
    cy.get('#create-user-mobileNumber').clear().type(phoneNumber);

    cy.get('#create-user-email').type('invalid-email-format').blur();
    cy.get('div[role="alert"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Invalid email format|Das E-Mail-Format ist ungültig/i);
      });
    cy.wait(1000);
    cy.get('#create-user-email').clear().type(user.email);

    // Address fields intentionally left empty — verifies address is optional
    cy.log('Skipping address fields — testing that address is optional for user creation');
    cy.wait(1000);

    cy.get('#create-user-next').click({ force: true });

    // ── Wizard Step 3: Delivery settings ─────────────────────────────────────
    cy.wait(1500);

    cy.get('#create-user-deliveryType').then(($dropdown) => {
      const isDisabled =
        $dropdown.attr('aria-disabled') === 'true' ||
        $dropdown.hasClass('Mui-disabled') ||
        $dropdown.find('.Mui-disabled').length > 0;

      if (isDisabled) {
        cy.log('Delivery type dropdown is disabled, skipping selection');
      } else {
        cy.wrap($dropdown).click({ force: true });
        cy.wait(500);
        cy.get("ul[role='listbox'] > li > span")
          .should('be.visible')
          .contains(/^digital$/i)
          .click({ force: true });
        cy.wait(500);
      }
    });

    cy.get('#create-user-sendCredentials').then(($dropdown) => {
      const isDisabled =
        $dropdown.attr('aria-disabled') === 'true' ||
        $dropdown.hasClass('Mui-disabled') ||
        $dropdown.find('.Mui-disabled').length > 0;

      if (isDisabled) {
        cy.log('Send credentials dropdown is disabled, skipping selection');
      } else {
        cy.wrap($dropdown).click({ force: true });
        cy.wait(500);
        cy.get("ul[role='listbox'] > li > span")
          .should('be.visible')
          .contains(/^digital$/i)
          .click({ force: true });
        cy.wait(500);
      }
    });

    cy.intercept('POST', '**/editPerson').as('editPerson');
    cy.get('#create-user-create>div:nth-of-type(1)')
      .contains(/Create|Erstellen/i)
      .click({ force: true });

    cy.wait('@editPerson', { timeout: 35000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(201);
      cy.log('No-Address user created successfully');
    });
    cy.wait(1000);

    // ── Credentials dialog ────────────────────────────────────────────────────
    cy.get('#dialog-title')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/New User Access Data/);
      });

    cy.get('#download-user-account-pdf').click();
    cy.wait(1000);

    const downloadsDir = `${Cypress.config('fileServerFolder')}/cypress/downloads/`;
    cy.task('getDownloadedPdf', {
      downloadsDir,
      timeoutMs: 20000,
      pollIntervalMs: 500,
      minSizeBytes: 100,
    }).then((filePath) => {
      expect(filePath).to.not.be.null;
      cy.log(`Credentials PDF downloaded: ${filePath}`);
    });
    cy.wait(3500);
  });

  // ---------------------------------------------------------------------------
  // IT3 — Yopmail: Confirm email and Change password (no-address user)
  // ---------------------------------------------------------------------------
  it('Yopmail - Confirm email and Change password (No Address user)', () => {
    cy.visit('https://yopmail.com/en/');

    const user = Cypress.env('createUserNoAddress')[0];
    cy.get('#login').type(user.email);
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    cy.wait(1500);

    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .eq(0)
      .should('include.text', 'Ihr neuer Benutzer im DocuHub Portal');

    cy.iframe('#ifmail')
      .find(
        '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span',
      )
      .invoke('text')
      .then((innerText) => {
        const startIndex =
          innerText.indexOf('Hier ist Ihr Benutzername:') +
          'Hier ist Ihr Benutzername:'.length;
        const endIndex = innerText.indexOf('Bitte bestätigen Sie');
        const usernameFromEmailBody = innerText.substring(startIndex, endIndex).trim();
        cy.log('Captured username:', usernameFromEmailBody);

        cy.wait(1500);

        cy.iframe('#ifmail')
          .find(
            '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span>a',
          )
          .should('include.text', 'Jetzt E-Mail Adresse bestätigen')
          .invoke('attr', 'target', '_self')
          .click();

        cy.wait(15000);

        cy.iframe('#ifmail').then(($iframe) => {
          if ($iframe.find('#onetrust-policy-title').is(':visible')) {
            cy.wrap($iframe).find('#onetrust-accept-btn-handler').click({ force: true });
          }
        });
        cy.wait(1500);

        cy.wait(8000);
        cy.iframe('#ifmail').find('.button').click();

        cy.get('#refresh').click({ force: true });
        cy.wait(5000);

        cy.iframe('#ifinbox')
          .find('.mctn > .m > button > .lms')
          .eq(0)
          .should('include.text', 'Passwort zurücksetzen DocuHub Portal');

        cy.iframe('#ifmail')
          .find(
            '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a',
          )
          .should('include.text', 'Neues Passwort erstellen ')
          .invoke('attr', 'target', '_self')
          .click();
        cy.wait(2500);

        cy.iframe('#ifmail')
          .find('.input__field-input')
          .eq(0)
          .click()
          .type(Cypress.env('password_egEbox'));
        cy.iframe('#ifmail').find('.input-eye-icon').eq(0).click();

        cy.iframe('#ifmail')
          .find('.input__field-input')
          .eq(1)
          .type(Cypress.env('password_egEbox'));
        cy.iframe('#ifmail').find('.input-eye-icon').eq(1).click();
        cy.iframe('#ifmail').find('.button').click();

        cy.wait(2000);
      });
  });

  // ---------------------------------------------------------------------------
  // IT4 — Login to e-Box 1st time (no-address user)
  // ---------------------------------------------------------------------------
  it('Login to e-Box 1st time (No Address user)', () => {
    cy.visit(Cypress.env('baseUrl_egEbox'));
    cy.wait(5000);

    dismissCookieBar();
    cy.wait(1500);

    const user = Cypress.env('createUserNoAddress')[0];
    cy.get(':nth-child(1) > .ng-invalid > .input > .input__field-input').type(
      Cypress.env('companyPrefix') + user.username,
    );
    cy.get('.ng-invalid > .input > .input__field-input').type(
      Cypress.env('password_egEbox'),
    );

    cy.wait(5500);

    cy.intercept('POST', '**/rest/v2/deliveries**').as('openDeliveriesPage');
    cy.wait(1000);
    cy.get('button[type="submit"]').click();

    cy.wait('@openDeliveriesPage', { timeout: 37000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.wait(2500);
    });

    cy.get('.user-title', { timeout: 12000 }).should('be.visible').click();
    cy.wait(1500);
    cy.get('.logout-title > a').click();
    cy.url().should('include', Cypress.env('baseUrl_egEbox'));
    cy.log('No-address user first login completed successfully.');
  });

  // ---------------------------------------------------------------------------
  // IT5 — Yopmail: Clear inbox
  // ---------------------------------------------------------------------------
  it('Yopmail - Clear inbox (No Address user)', () => {
    const user = Cypress.env('createUserNoAddress')[0];

    cy.visit('https://yopmail.com/en/');
    cy.get('#login', { timeout: 10000 }).should('be.visible').type(user.email);
    cy.get('#refreshbut > .md > .material-icons-outlined').should('be.visible').click();

    cy.wait(2000);

    cy.get('.menu>div>#delall', { timeout: 10000 }).then(($btn) => {
      if (!$btn.is(':disabled')) {
        cy.wrap($btn).click({ force: true });
        cy.log('Inbox cleared.');
      } else {
        cy.log('Delete all button is disabled. Inbox may already be empty.');
      }
    });

    cy.iframe('#ifinbox').find('div.mctn').should('not.contain', '.m');
  });
});
