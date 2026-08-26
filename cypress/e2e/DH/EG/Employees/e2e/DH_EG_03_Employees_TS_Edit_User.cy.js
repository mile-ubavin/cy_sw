/// <reference types="cypress" />

/**
 * DH_EG_03 — Employees Test Suite: Edit User
 *
 * Test coverage:
 *   TC00  Precondition  – Search & delete test user if already exists
 *   TC00b              – Create test user (e-Box user via DH wizard)
 *   TC01               – Edit user personal data from Persons table (happy path)
 *   TC02               – Validate inline field errors on Edit person form
 *   TC03               – Reset Password from Persons table (3-dot menu)
 *   TC04               – Activate / Deactivate from Persons table (3-dot menu)
 *   TC05               – Activate / Deactivate from Personal data page
 *   TC06               – Assign user to another company
 *   TC07               – Remove user from company
 *   TEARDOWN           – Delete created test user
 */

describe('DH_EG_03_Employees_TS_Edit_User', () => {
  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  const normalizeTableStatus = (statusText) => {
    const normalized = statusText.trim().toLowerCase();
    if (/^active$|^aktiv$/.test(normalized)) return 'active';
    if (/^inactive$|^inaktiv$|^deactivated$|^deaktiviert$/.test(normalized))
      return 'inactive';
    throw new Error(`Unexpected status text in table: "${statusText}"`);
  };

  const dismissReleaseNotePopup = () => {
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Release note popup not present');
      }
    });
  };

  const dismissCookieBar = () => {
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      } else {
        cy.log('Cookie bar not visible');
      }
    });
  };

  const searchAndDeleteUser = (uName) => {
    cy.get('.search-label').click();
    cy.intercept('POST', '**/person/fromGroup/**').as('personFromGroup');
    cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
      .clear()
      .type(uName);
    cy.get('button[type="submit"]').click();
    cy.wait('@personFromGroup', { timeout: 10000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });
    cy.wait(1500);

    cy.get('body').then(($body) => {
      if ($body.find('.cdk-row').length === 0) {
        cy.log(`User "${uName}" not found — skipping deletion.`);
        cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click({
          force: true,
        });
      } else {
        cy.log(`User "${uName}" found — proceeding with deletion.`);
        cy.contains('button', /Delete|DSGVO-Löschung/)
          .should('be.visible')
          .click();
        cy.get('.confirm-buttons > button')
          .contains(/YES|JA/)
          .should('be.visible')
          .click();
        cy.log(`User "${uName}" deleted.`);
        cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click({
          force: true,
        });
      }
    });
  };

  const loginAndOpenEmployeesPage = () => {
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
    cy.wait(2000);
    cy.scrollTo('top', { duration: 500 });
    cy.wait(500);
  };

  const filterByUsername = (username) => {
    cy.get('button[aria-label="persons.toggleFilters"]')
      .should('exist')
      .click({ force: true });
    cy.wait(1000);
    cy.get(
      'input[placeholder*="Username"], input[placeholder*="Benutzername"]',
    ).type(username);
    cy.wait(1000);
    cy.scrollTo('top', { duration: 500 });
    cy.wait(500);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TC00 — PRECONDITION: delete test user from previous run (if exists)
  // ═══════════════════════════════════════════════════════════════════════════
  it('Precondition - Search for test user and delete if exists (Master User)', () => {
    cy.loginToSupportViewMaster();
    cy.wait(3500);

    dismissReleaseNotePopup();
    cy.wait(1500);

    cy.get('#searchButton>span').click();
    const companyName = Cypress.env('company');
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(0)
      .type(companyName);
    cy.get('.search-dialog>form>div>.mat-primary').click();

    cy.get('.action-buttons > .mdc-button').eq(4).click();

    const user = Cypress.env('createUser')[0];

    cy.wait(1500);
    searchAndDeleteUser(user.username);
    cy.wait(1000);

    cy.get('.logout-icon').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl'));
    cy.wait(3000);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC00b — CREATE TEST USER for Edit suite
  // Idempotent: skips creation if the user already exists in the table.
  // Happy path only — field validation is covered by the Create TS.
  // ═══════════════════════════════════════════════════════════════════════════
  it('DH - Create test user for Edit suite', () => {
    loginAndOpenEmployeesPage();

    const user = Cypress.env('createUser')[0];

    // Check existence first — skip creation if user is already in the table
    filterByUsername(user.username);
    cy.wait(1500);

    cy.get('body').then(($body) => {
      const rows = $body.find('tbody > tr');
      const userExists =
        rows.length > 0 &&
        [...rows].some((row) => row.textContent.includes(user.username));

      if (userExists) {
        cy.log(`User "${user.username}" already exists — skipping creation`);
        return;
      }

      cy.log(`User "${user.username}" not found — creating now`);

      cy.get('#employee-add-employee')
        .contains(/Neuen Kontakt anlegen|Create New Contact/i)
        .click();
      cy.wait(500);

      cy.get('h2')
        .should('be.visible')
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.match(
            /Neuen Kontakt anlegen|Create New Contact/,
          );
        });

      // Wizard Step 1: Basic data
      cy.get('#create-user-prefixed-title').type(user.prefixedTitle);
      cy.get('#create-user-firstName').type(user.firstName);
      cy.get('#create-user-lastName').type(user.lastName);
      cy.get('#create-user-suffixed-title').type(user.prefixedTitle2);

      cy.get('input[aria-autocomplete="list"]').click({ force: true });
      cy.wait(1000);
      cy.get("ul[role='listbox'] > li")
        .should('be.visible')
        .then(($items) => {
          const prefix = (
            Cypress.env('companyPrefix') || Cypress.env('company')
          ).toLowerCase();
          const match = [...$items].find((el) =>
            el.textContent.trim().toLowerCase().includes(prefix),
          );
          if (match) {
            cy.wrap(match).click({ force: true });
          } else {
            throw new Error(`No autocomplete option contains: ${prefix}`);
          }
        });

      cy.get('#create-user-accountNumber').type(user.username);
      cy.wait(1000);

      cy.get('#create-user-next').click({ force: true });

      // Wizard Step 2: Contact data
      cy.get('#create-user-mobileNumber', { timeout: 15000 }).type(
        '+43641234567',
      );
      cy.get('#create-user-email').type(user.email);
      cy.get('#create-user-street').type(user.streetName);
      cy.get('#create-user-streetNumber').type(user.streetNumber);
      cy.get('#create-user-apartment').type(user.doorNumber);
      cy.get('#create-user-zipCode').type(user.zipCode);
      cy.get('#create-user-city').type(user.city);
      cy.wait(1000);

      cy.get('#create-user-next').click({ force: true });

      // Wizard Step 3: Delivery settings
      cy.wait(1500);

      cy.get('#create-user-deliveryType').then(($dropdown) => {
        const isDisabled =
          $dropdown.attr('aria-disabled') === 'true' ||
          $dropdown.hasClass('Mui-disabled') ||
          $dropdown.find('.Mui-disabled').length > 0;

        if (!isDisabled) {
          cy.wrap($dropdown).click({ force: true });
          cy.wait(500);
          cy.get("ul[role='listbox'] > li > span")
            .should('be.visible')
            .contains(/^digital$/i)
            .click({ force: true });
          cy.wait(500);
        } else {
          cy.log('Delivery type dropdown is disabled — skipping');
        }
      });

      cy.get('#create-user-sendCredentials').then(($dropdown) => {
        const isDisabled =
          $dropdown.attr('aria-disabled') === 'true' ||
          $dropdown.hasClass('Mui-disabled') ||
          $dropdown.find('.Mui-disabled').length > 0;

        if (!isDisabled) {
          cy.wrap($dropdown).click({ force: true });
          cy.wait(500);
          cy.get("ul[role='listbox'] > li > span")
            .should('be.visible')
            .contains(/^digital$/i)
            .click({ force: true });
          cy.wait(500);
        } else {
          cy.log('Send credentials dropdown is disabled — skipping');
        }
      });

      cy.intercept('POST', '**/editPerson').as('editPerson');
      cy.get('#create-user-create>div:nth-of-type(1)')
        .contains(/Create|Erstellen/i)
        .click({ force: true });

      cy.wait('@editPerson', { timeout: 35000 }).then((interception) => {
        expect(interception.response.statusCode).to.eq(201);
        cy.log('Test user created successfully — ready for Edit suite');
      });
      cy.wait(1000);

      cy.get('#dialog-title')
        .should('be.visible')
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.match(/New User Access Data/);
        });

      cy.get('#download-user-account-pdf').click();
      cy.wait(2000);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC01 — EDIT PERSONAL DATA (happy path)
  // ═══════════════════════════════════════════════════════════════════════════
  it('DH - Edit E-Box user personal data from Persons table', () => {
    loginAndOpenEmployeesPage();

    const user = Cypress.env('createUser')[0];
    filterByUsername(user.username);

    cy.get('button[aria-label="More Row actions"]')
      .first()
      .should('be.visible')
      .click({ force: true });
    cy.wait(1000);

    cy.contains('ul[role="menu"] span', /Bearbeiten|Edit/i)
      .should('be.visible')
      .click({ force: true });

    cy.wait(3000);
    cy.url().should('include', '/home/persons/edit/');

    cy.get('#reset-password-button').should('exist').should('be.visible');

    cy.get('#edit-person-title1').first().clear().type('Mag. - EDIT');
    cy.get('#edit-person-firstName')
      .first()
      .clear()
      .type('Address Data - EDIT');
    cy.get('#edit-person-lastName').first().clear().type('Manual - EDIT');
    cy.get('#edit-person-title2').first().clear().type('BSc - EDIT');

    // Email: invalid format → error
    cy.get('#edit-person-email')
      .clear()
      .type('invalid_email_format@yopmail')
      .blur();
    cy.get('.MuiFormHelperText-root, [class*="helperText"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Invalid email format|Das E-Mail-Format ist ungültig/i,
        );
      });
    cy.wait(500);

    // Email: valid
    cy.get('#edit-person-email').clear().type('valid_email_format@yopmail.com');
    cy.wait(500);

    // Mobile: invalid (letters) → error
    cy.get('#edit-person-mobilePhone')
      .clear()
      .type('invalid_mobile_number')
      .blur();
    cy.get('.MuiFormHelperText-root, [class*="helperText"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Ungültiger Wert|Invalid value/i);
      });
    cy.wait(500);

    // Mobile: space in number → error
    cy.get('#edit-person-mobilePhone').clear().type('+43 1234567890').blur();
    cy.get('.MuiFormHelperText-root, [class*="helperText"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Ungültiger Wert|Invalid value/i);
      });
    cy.wait(500);

    // Mobile: valid
    cy.get('#edit-person-mobilePhone').clear().type('+43641234567');
    cy.wait(500);

    cy.get('#edit-person-street').clear().type('Edited Strasse');
    cy.get('#edit-person-houseNumber').clear().type('99');

    const assertZipCodeError = (shouldExist, expectedMessageRegex) => {
      const helperTextSelector =
        '.MuiFormHelperText-root, [class*="helperText"]';
      if (shouldExist) {
        cy.get(helperTextSelector)
          .should('exist')
          .invoke('text')
          .then((text) => {
            expect(text.trim()).to.match(expectedMessageRegex);
          });
      } else {
        cy.get('body').then(($body) => {
          if ($body.find(helperTextSelector).length > 0) {
            cy.get(helperTextSelector)
              .invoke('text')
              .then((text) => {
                expect(text.trim()).to.not.match(
                  /Ungültiges Format|Invalid format|Ungültige PLZ|Invalid ZIP/i,
                );
              });
          }
        });
      }
    };

    const normalizeText = (value) =>
      (value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const isAustria = (text) => {
      const n = normalizeText(text);
      return n.includes('austria') || n.includes('osterreich');
    };

    cy.get('#edit-person-country, input[aria-autocomplete="list"]')
      .first()
      .click({ force: true });
    cy.wait(500);

    cy.get('ul[role="listbox"]:visible [role="option"]').then(($options) => {
      const options = [...$options];
      const atOption = options.find((el) => isAustria(el.innerText));
      const nonAtOptions = options.filter((el) => !isAustria(el.innerText));

      expect(atOption, 'Austria must exist in country list').to.exist;
      expect(
        nonAtOptions.length,
        'Non-Austria countries must exist',
      ).to.be.greaterThan(0);

      const atOptionText = atOption.innerText.trim();
      const randomNonAtText =
        nonAtOptions[
          Math.floor(Math.random() * nonAtOptions.length)
        ].innerText.trim();

      // Case 1: AT + valid 4-digit zip → no error
      cy.log('** Case 1: AT + 8010 → no error **');
      cy.contains(
        'ul[role="listbox"]:visible [role="option"]',
        atOptionText,
      ).click({ force: true });
      cy.wait(500);
      cy.get('#edit-person-zipCode').clear().type('8010').blur();
      cy.wait(1000);
      assertZipCodeError(false);
      cy.wait(500);

      // Case 2: AT + 5-digit zip → format error
      cy.log('** Case 2: AT + 11000 → format error **');
      cy.get('#edit-person-country, input[aria-autocomplete="list"]')
        .first()
        .click({ force: true });
      cy.wait(500);
      cy.contains(
        'ul[role="listbox"]:visible [role="option"]',
        atOptionText,
      ).click({ force: true });
      cy.wait(500);
      cy.get('#edit-person-zipCode').clear().type('11000').blur();
      cy.wait(1500);
      assertZipCodeError(
        true,
        /Ungültiges Format \(4 Ziffern\)|Invalid format \(4 digits\)/i,
      );
      cy.wait(500);

      // Case 3: AT + below-range zip → range error
      cy.log('** Case 3: AT + 0999 → range error **');
      cy.get('#edit-person-country, input[aria-autocomplete="list"]')
        .first()
        .click({ force: true });
      cy.wait(500);
      cy.contains(
        'ul[role="listbox"]:visible [role="option"]',
        atOptionText,
      ).click({ force: true });
      cy.wait(500);
      cy.get('#edit-person-zipCode').clear().type('0999').blur();
      cy.wait(1500);
      assertZipCodeError(
        true,
        /Ungültige PLZ \(1000-9999\)|Invalid ZIP code \(1000-9999\)/i,
      );
      cy.wait(500);

      // Case 4: Non-AT + 5-digit zip → no error
      cy.log(`** Case 4: Non-AT (${randomNonAtText}) + 11000 → no error **`);
      cy.get('#edit-person-country, input[aria-autocomplete="list"]')
        .first()
        .click({ force: true });
      cy.wait(500);
      cy.contains(
        'ul[role="listbox"]:visible [role="option"]',
        randomNonAtText,
      ).click({ force: true });
      cy.wait(500);
      cy.get('#edit-person-zipCode').clear().type('11000').blur();
      cy.wait(1000);
      assertZipCodeError(false);
      cy.wait(500);

      // Restore: AT + valid zip
      cy.log('** Restore: AT + 8010 **');
      cy.get('#edit-person-country, input[aria-autocomplete="list"]')
        .first()
        .click({ force: true });
      cy.wait(500);
      cy.contains(
        'ul[role="listbox"]:visible [role="option"]',
        atOptionText,
      ).click({ force: true });
      cy.wait(500);
      cy.get('#edit-person-zipCode').clear().type('8010').blur();
      cy.wait(500);
      assertZipCodeError(false);
    });

    cy.wait(2000);

    cy.window().then((win) => {
      win.scrollTo({ top: 0, behavior: 'smooth' });
    });

    cy.intercept('POST', '**/editPerson').as('editPerson');
    cy.get('#employee-save-button')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Änderungen speichern|Save changes/i);
      });
    cy.get('#employee-save-button').click({ force: true });
    cy.wait('@editPerson', { timeout: 35000 }).then((interception) => {
      expect(interception.response.statusCode).to.be.oneOf([200, 201]);
      cy.log('User data saved successfully');
    });
    cy.wait(3000);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC02 — VALIDATE INLINE FIELD ERRORS ON EDIT PERSON FORM
  // ═══════════════════════════════════════════════════════════════════════════
  it('DH - Validate inline field errors on Edit person form', () => {
    loginAndOpenEmployeesPage();

    const user = Cypress.env('createUser')[0];
    filterByUsername(user.username);

    cy.get('button[aria-label="More Row actions"]')
      .first()
      .should('be.visible')
      .click({ force: true });
    cy.wait(1000);
    cy.contains('ul[role="menu"] span', /Bearbeiten|Edit/i)
      .should('be.visible')
      .click({ force: true });
    cy.wait(3000);
    cy.url().should('include', '/home/persons/edit/');

    cy.get('#employee-save-button').should('be.disabled');

    // lastName: required
    cy.get('#edit-person-lastName').clear().blur();
    cy.get('.MuiFormHelperText-root, [class*="helperText"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim().length).to.be.greaterThan(0);
      });

    cy.get('#employee-save-button').should('be.disabled');

    cy.get('#edit-person-lastName').type(user.lastName);

    // Email: missing domain extension → error
    cy.get('#edit-person-email').clear().type('user@domain').blur();
    cy.get('.MuiFormHelperText-root, [class*="helperText"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Das E-Mail-Format ist ungültig|Invalid email format/i,
        );
      });
    cy.wait(500);

    cy.get('#edit-person-email').clear().type('valid@yopmail.com');
    cy.wait(500);

    // Mobile: letters → error
    cy.get('#edit-person-mobilePhone')
      .clear()
      .type('phone_number_with_letters')
      .blur();
    cy.get('.MuiFormHelperText-root, [class*="helperText"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Ungültiger Wert|Invalid value/i);
      });
    cy.wait(500);

    // Mobile: no + prefix → error
    cy.get('#edit-person-mobilePhone').clear().type('436641234567').blur();
    cy.get('.MuiFormHelperText-root, [class*="helperText"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Ungültiger Wert|Invalid value/i);
      });
    cy.wait(500);

    // Mobile: valid → no error
    cy.get('#edit-person-mobilePhone').clear().type('+43641234567').blur();
    cy.wait(500);
    cy.get('body').then(($body) => {
      const helpers = $body.find(
        '.MuiFormHelperText-root, [class*="helperText"]',
      );
      helpers.each((_, el) => {
        expect(Cypress.$(el).text()).to.not.match(
          /Ungültiger Wert|Invalid value/i,
        );
      });
    });

    // Zip: AT + below-range → range error (if country is AT)
    cy.get('#edit-person-zipCode').clear().type('0999').blur();
    cy.wait(1000);
    cy.get('body').then(($body) => {
      const countryInput = $body.find(
        '#edit-person-country, input[aria-autocomplete="list"]',
      );
      const countryVal = (countryInput.first().val() || '').toLowerCase();
      const isAT =
        countryVal === 'at' ||
        countryVal.includes('austria') ||
        countryVal.includes('österreich') ||
        countryVal.includes('osterreich');

      if (isAT) {
        cy.get('.MuiFormHelperText-root, [class*="helperText"]')
          .should('be.visible')
          .invoke('text')
          .then((text) => {
            expect(text.trim()).to.match(
              /Ungültige PLZ \(1000-9999\)|Invalid ZIP code \(1000-9999\)|Ungültiges Format|Invalid format/i,
            );
          });
        cy.log('Range/format error confirmed for AT country');
      } else {
        cy.log(
          'Country is not AT — zip range not validated, skipping assertion',
        );
      }
    });

    cy.get('#edit-person-zipCode').clear().type('8010');
    cy.wait(500);

    cy.log('TC02 field validation checks complete.');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC03 — RESET PASSWORD FROM PERSONS TABLE (3-dot menu)
  // ═══════════════════════════════════════════════════════════════════════════
  it('DH - Reset Password from Persons table', () => {
    loginAndOpenEmployeesPage();

    const user = Cypress.env('createUser')[0];
    filterByUsername(user.username);

    let userStatus = '';
    cy.get('tbody > tr')
      .first()
      .find('td')
      .last()
      .invoke('text')
      .then((statusText) => {
        userStatus = statusText.trim().toLowerCase();
        cy.log(`User status from table: "${statusText.trim()}"`);
      })
      .then(() => {
        cy.get('button[aria-label="More Row actions"]')
          .first()
          .click({ force: true });
        cy.wait(1000);

        const isActive = /active|aktiv/i.test(userStatus);

        if (!isActive) {
          cy.log('User INACTIVE — Reset Password must not appear in menu');
          cy.get('ul[role="menu"] span')
            .should('be.visible')
            .each(($el) => {
              expect($el.text().trim()).to.not.match(
                /Reset password|Passwort zurücksetzen/i,
              );
            });
          cy.get('body').click(0, 0);
          cy.log('Test complete — inactive user, Reset Password not in menu');
        } else {
          cy.log('User ACTIVE — Reset Password must appear and be clickable');

          cy.intercept('POST', '**/person/resetPersonPassword').as(
            'resetPassword',
          );

          cy.get('ul[role="menu"] span')
            .should('be.visible')
            .each(($el) => {
              if ($el.text().match(/Reset password|Passwort zurücksetzen/i)) {
                cy.wrap($el).click();
              }
            });

          cy.wait('@resetPassword', { timeout: 15000 }).then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
            cy.log('Password reset API returned 200');
          });
          cy.wait(3000);
        }
      });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC04 — ACTIVATE / DEACTIVATE FROM PERSONS TABLE (3-dot menu)
  // ═══════════════════════════════════════════════════════════════════════════
  it('DH - Activate/Deactivate E-Box user from Persons table', () => {
    loginAndOpenEmployeesPage();

    const user = Cypress.env('createUser')[0];
    filterByUsername(user.username);

    let userStatus = '';

    cy.get('tbody > tr')
      .first()
      .find('td')
      .last()
      .invoke('text')
      .then((statusText) => {
        userStatus = normalizeTableStatus(statusText);
        cy.log(
          `Initial status: "${statusText.trim()}" → normalised: "${userStatus}"`,
        );
      })
      .then(() => {
        const isActive = userStatus === 'active';
        cy.log(`Is user active: ${isActive}`);

        cy.get('button[aria-label="More Row actions"]')
          .first()
          .should('be.visible')
          .click({ force: true });
        cy.wait(1000);

        cy.intercept('POST', '**/group/activate/**').as('activateDeactivate');

        if (isActive) {
          cy.log('ACTIVE → clicking Deactivate');
          cy.contains('ul[role="menu"] span', /^(Deaktivieren|Deactivate)$/i)
            .should('be.visible')
            .click({ force: true });
        } else {
          cy.log('INACTIVE → clicking Activate');
          cy.contains('ul[role="menu"] span', /^(Aktivieren|Activate)$/i)
            .should('be.visible')
            .click({ force: true });
        }

        cy.wait('@activateDeactivate', { timeout: 15000 }).then(
          (interception) => {
            expect(interception.response.statusCode).to.be.oneOf([
              200, 201, 204,
            ]);
            cy.log('Activate/Deactivate API confirmed success');
          },
        );

        // Toast snackbar is auto-dismissed during table reload — retry the
        // row read until the table refetch completes and status flips.
        // The table status is the authoritative check.
        const expectedStatus = isActive ? 'inactive' : 'active';
        cy.get('tbody > tr', { timeout: 20000 })
          .first()
          .find('td')
          .last()
          .should(($td) => {
            expect(normalizeTableStatus($td.text())).to.eq(expectedStatus);
          });
        cy.wait(2000);
      });

    cy.get('.MuiAvatar-root')
      .should('be.visible')
      .first()
      .click({ force: true });
    cy.contains('[role="menuitem"], button, li, span', /Logout|Abmelden/i, {
      timeout: 10000,
    })
      .should('be.visible')
      .click({ force: true });
    cy.wait(2000);
    cy.url().should('include', Cypress.env('dh_baseUrl'));
    cy.wait(1500);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC05 — ACTIVATE / DEACTIVATE FROM PERSONAL DATA PAGE (Edit page dropdown)
  // ═══════════════════════════════════════════════════════════════════════════
  it('DH - Activate/Deactivate E-Box user from Personal data page', () => {
    loginAndOpenEmployeesPage();

    const companyName = Cypress.env('company').toLowerCase();
    const user = Cypress.env('createUser')[0];
    filterByUsername(user.username);

    let userStatus = '';
    cy.get('tbody > tr')
      .first()
      .find('td')
      .last()
      .invoke('text')
      .then((statusText) => {
        userStatus = normalizeTableStatus(statusText);
        cy.log(
          `Initial status: "${statusText.trim()}" → normalised: "${userStatus}"`,
        );
      })
      .then(() => {
        const isActive = userStatus === 'active';

        cy.get('button[aria-label="More Row actions"]')
          .first()
          .should('be.visible')
          .click({ force: true });
        cy.wait(1000);

        cy.contains('ul[role="menu"] span', /Bearbeiten|Edit/i)
          .should('be.visible')
          .click({ force: true });

        cy.wait(3000);
        cy.url().should('include', '/home/persons/edit/');

        cy.get('#status-dropdown-status')
          .should('be.visible')
          .click({ force: true });
        cy.wait(1000);

        if (isActive) {
          cy.log('ACTIVE → selecting Deactivated from dropdown');
          cy.get('ul[role="listbox"] li')
            .contains(/^(Deaktiviert|Deactivated)$/i)
            .should('be.visible')
            .click({ force: true });
        } else {
          cy.log('INACTIVE → selecting Active from dropdown');
          cy.get('ul[role="listbox"] li')
            .contains(/^(Aktiv|Active)$/i)
            .should('be.visible')
            .click({ force: true });
        }

        cy.wait(1000);

        cy.intercept('POST', '**/editPerson').as('editPerson');

        cy.get('#employee-save-button')
          .should('be.visible')
          .click({ force: true });

        cy.wait('@editPerson', { timeout: 35000 }).then((interception) => {
          expect(interception.response.statusCode).to.be.oneOf([200, 201]);
          cy.log('Save API (editPerson) confirmed success');
        });
        cy.wait(2000);

        // Navigate back to verify status in table
        cy.intercept('GET', '**/person/fromGroup/**').as('getEmployees');
        cy.get('#nav-employees').should('be.visible').click({ force: true });
        cy.wait('@getEmployees', { timeout: 35000 }).then((interception) => {
          expect(interception.response.statusCode).to.eq(200);
        });
        cy.wait(1500);

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

        cy.get(
          'input[placeholder*="Username"], input[placeholder*="Benutzername"]',
        )
          .clear()
          .type(user.username);
        cy.wait(1000);
        cy.scrollTo('top', { duration: 500 });
        cy.wait(500);

        cy.get('tbody > tr')
          .first()
          .find('td')
          .last()
          .invoke('text')
          .then((updatedStatusText) => {
            const updatedStatus = normalizeTableStatus(updatedStatusText);
            const expectedStatus = isActive ? 'inactive' : 'active';
            cy.log(
              `Initial: ${userStatus} | Updated: ${updatedStatus} | Expected: ${expectedStatus}`,
            );
            expect(updatedStatus).to.eq(
              expectedStatus,
              `Status should have changed from ${userStatus} → ${expectedStatus}`,
            );
          });
        cy.wait(2000);
      });

    cy.get('.MuiAvatar-root')
      .should('be.visible')
      .first()
      .click({ force: true });
    cy.contains('[role="menuitem"], button, li, span', /Logout|Abmelden/i, {
      timeout: 10000,
    })
      .should('be.visible')
      .click({ force: true });
    cy.wait(2000);
    cy.url().should('include', Cypress.env('dh_baseUrl'));
    cy.wait(1500);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC06 — ASSIGN USER TO ANOTHER COMPANY
  // ═══════════════════════════════════════════════════════════════════════════
  it('DH - Assign user to another company', () => {
    loginAndOpenEmployeesPage();

    const user = Cypress.env('createUser')[0];
    filterByUsername(user.username);

    cy.get('button[aria-label="More Row actions"]')
      .first()
      .should('be.visible')
      .click({ force: true });
    cy.wait(1000);

    cy.contains('ul[role="menu"] span', /Firmen|Companies/i)
      .should('be.visible')
      .click({ force: true });
    cy.wait(2000);

    cy.get('tbody > tr').then(($companyRows) => {
      if ($companyRows.length <= 1) {
        cy.log('User is only assigned to one company — skipping assignment.');
        return;
      }

      const companiesToAssign = ['AQUA', 'ABBA'];

      companiesToAssign.forEach((company) => {
        cy.contains('tbody > tr td:nth-child(2)', new RegExp(company, 'i'))
          .should('be.visible')
          .parents('tr')
          .first()
          .within(() => {
            cy.get('td')
              .first()
              .then(($td) => {
                const checkboxInput = $td.find('input[type="checkbox"]');
                if (checkboxInput.length) {
                  if (checkboxInput.is(':checked')) {
                    cy.log(`User already assigned to ${company} — skipping.`);
                  } else {
                    cy.wrap(checkboxInput)
                      .scrollIntoView()
                      .click({ force: true });
                  }
                  return;
                }

                const checkboxSpan = $td.find('span[role="checkbox"]');
                if (checkboxSpan.length) {
                  if (checkboxSpan.attr('aria-checked') === 'true') {
                    cy.log(`User already assigned to ${company} — skipping.`);
                  } else {
                    cy.wrap(checkboxSpan)
                      .scrollIntoView()
                      .click({ force: true });
                  }
                  return;
                }

                throw new Error(`No checkbox found for company ${company}`);
              });
          });
      });

      cy.wait(1000);

      cy.contains('button', /Next|Nächste/i)
        .should('be.visible')
        .click({ force: true });
      cy.wait(1500);

      cy.get(
        'input[placeholder="Firmenspezifische Benutzer ID"], input[placeholder*="Company-specific"]',
      )
        .should('be.visible')
        .clear()
        .type(user.username);

      cy.intercept('POST', '**/person/assignPersonToCompany/**').as(
        'assignPersonToCompany',
      );

      cy.contains('button', /Submit|Übernehmen|Apply|Save/i)
        .should('be.visible')
        .click({ force: true });

      cy.wait('@assignPersonToCompany', { timeout: 15000 }).then(
        (interception) => {
          expect(interception.response.statusCode).to.be.oneOf([200, 201, 204]);
          cy.log('Company assignment saved successfully');
        },
      );

      cy.contains(/successfully|erfolgreich|saved|gespeichert/i, {
        timeout: 8000,
      }).should('be.visible');
      cy.wait(2000);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC07 — REMOVE USER FROM COMPANY
  // ═══════════════════════════════════════════════════════════════════════════
  it('DH - Remove user from company', () => {
    loginAndOpenEmployeesPage();

    const user = Cypress.env('createUser')[0];
    filterByUsername(user.username);

    cy.get('button[aria-label="More Row actions"]')
      .first()
      .should('be.visible')
      .click({ force: true });
    cy.wait(1000);

    cy.contains('ul[role="menu"] span', /Firmen|Companies/i)
      .should('be.visible')
      .click({ force: true });
    cy.wait(2000);

    cy.get('tbody > tr').then(($companyRows) => {
      if ($companyRows.length <= 1) {
        cy.log('User is only in one company — nothing to remove.');
        return;
      }

      const companiesToUnassign = ['ABBA'];

      companiesToUnassign.forEach((company) => {
        cy.contains('tbody > tr td:nth-child(2)', new RegExp(company, 'i'))
          .should('be.visible')
          .parents('tr')
          .first()
          .within(() => {
            cy.get('td')
              .first()
              .then(($td) => {
                const checkboxInput = $td.find('input[type="checkbox"]');
                if (checkboxInput.length) {
                  if (checkboxInput.is(':checked')) {
                    cy.wrap(checkboxInput)
                      .scrollIntoView()
                      .click({ force: true });
                    cy.log(`Unchecked ${company}`);
                  } else {
                    cy.log(`${company} already unchecked`);
                  }
                  return;
                }

                const checkboxSpan = $td.find('span[role="checkbox"]');
                if (checkboxSpan.length) {
                  if (checkboxSpan.attr('aria-checked') === 'true') {
                    cy.wrap(checkboxSpan)
                      .scrollIntoView()
                      .click({ force: true });
                    cy.log(`Unchecked ${company}`);
                  } else {
                    cy.log(`${company} already unchecked`);
                  }
                  return;
                }

                throw new Error(`No checkbox found for company ${company}`);
              });
          });
      });

      cy.wait(1000);

      cy.intercept('POST', '**/person/assignPersonToCompany/**').as(
        'assignPersonToCompany',
      );

      cy.findByRole('button', {
        name: /Submit|Übernehmen|Ubernehmen|Apply|Save/i,
      })
        .should('be.visible')
        .click({ force: true });

      cy.wait('@assignPersonToCompany', { timeout: 15000 }).then(
        (interception) => {
          expect(interception.response.statusCode).to.be.oneOf([200, 201, 204]);
          cy.log('Company removal saved successfully');
        },
      );

      cy.contains(/successfully|erfolgreich|saved|gespeichert/i, {
        timeout: 8000,
      }).should('be.visible');
      cy.wait(2000);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TEARDOWN — Delete created test user (via Master User / Support View)
  // ═══════════════════════════════════════════════════════════════════════════
  it('Teardown - Delete already created user', () => {
    const user = Cypress.env('createUser')[0];
    cy.loginToSupportViewMaster();
    cy.wait(3500);

    dismissReleaseNotePopup();
    cy.wait(1500);

    cy.get('#searchButton>span').click();
    const companyName = Cypress.env('company');
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(1)
      .type(companyName);
    cy.get('.search-dialog>form>div>.mat-primary').click();

    cy.get('.action-buttons > .mdc-button').eq(4).click();

    cy.wait(1500);
    searchAndDeleteUser(user.username);
    cy.wait(1000);

    cy.get('.logout-icon').click();
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl'));
    cy.log('Teardown complete — test user deleted.');
    cy.wait(3000);
  });
});
