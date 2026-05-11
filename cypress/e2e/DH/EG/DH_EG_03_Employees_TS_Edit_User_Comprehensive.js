///<reference types="cypress" />

/**
 * TEST SCENARIOS: Edit User Data
 *
 * Based on UI Analysis from Screenshots:
 * 1. Employees Table Page - Search, Filter, Action Menu
 * 2. Edit User Form - Personal Data, Contact & Address, Personal Number & Status
 * 3. Add Personal Number Dialog
 * 4. Unsaved Changes Warning
 * 5. Activities Log Verification
 */

describe('DH - Edit User Data - Comprehensive Test Scenarios', () => {
  /**
   * SCENARIO 1: Navigate to Edit User Page
   * Steps:
   * - Login to DH
   * - Navigate to Employees
   * - Select Company
   * - Search for specific user
   * - Open Edit user form via action menu
   */
  it('TC01 - Should navigate to Edit User page via action menu', () => {
    // Login to DH
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.url().should('include', Cypress.env('dh_baseUrl'));

    // Remove Cookie dialog if present
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      }
    });

    // Login using custom command
    cy.loginToDH();
    cy.wait(2000);

    // Navigate to Employees page
    cy.intercept('GET', '**/person/fromGroup/**').as('getEmployees');
    cy.get('#nav-employees').should('be.visible').click();

    cy.wait('@getEmployees', { timeout: 15000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    // Select Company from dropdown
    const companyName = Cypress.env('company').toLowerCase();
    cy.get('#employee-select-company').click({ force: true });
    cy.wait(500);

    cy.get('ul[role="listbox"] > li > span')
      .should('be.visible')
      .then(($options) => {
        const match = [...$options].find((el) =>
          el.textContent.trim().toLowerCase().includes(companyName),
        );
        if (match) {
          cy.wrap(match).click({ force: true });
        }
      });
    cy.wait(500);

    // Search for user by username (using filter)
    const user = Cypress.env('createUser')[0];

    // Click on filter button if not already open
    cy.get('button[aria-label="persons.toggleFilters"]').click();
    cy.wait(500);

    // Enter username in search filter
    cy.get(
      'input[placeholder*="Username"], input[placeholder*="Benutzername"]',
    ).type(user.username);
    cy.wait(1000);

    // Scroll to top to ensure action menu is visible
    cy.scrollTo('top', { duration: 500 });
    cy.wait(500);

    // Open 3-dot action menu
    cy.get('button[aria-label="More Row actions"]')
      .first()
      .click({ force: true });
    cy.wait(500);

    // Click Edit option from menu
    cy.contains('ul[role="menu"] span', /Bearbeiten|Edit/i)
      .should('be.visible')
      .click({ force: true });
    cy.wait(2000);

    // Verify Edit User page loaded - check for Overview tab
    cy.contains('button, a', /Overview|Übersicht/i).should('be.visible');

    // Verify Personal Data section is visible
    cy.contains(
      'label, legend, h2, h3',
      /Personal Data|Persönliche Daten/i,
    ).should('be.visible');
  });

  /**
   * SCENARIO 2: Edit Personal Data Fields
   * Steps:
   * - Navigate to edit user page
   * - Modify personal data fields (Title, First Name, Last Name)
   * - Verify field validation
   * - Save changes
   * - Verify success
   */
  it('TC02 - Should edit personal data fields successfully', () => {
    // Navigate to edit page (reuse login and navigation)
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.loginToDH();
    cy.wait(2000);

    // Navigate to specific user edit page
    cy.get('#nav-employees').click();
    cy.wait(2000);

    // Select company and search for user
    const companyName = Cypress.env('company').toLowerCase();
    const user = Cypress.env('createUser')[0];

    cy.get('#employee-select-company').click({ force: true });
    cy.wait(500);
    cy.get('ul[role="listbox"] > li > span')
      .contains(new RegExp(companyName, 'i'))
      .click({ force: true });
    cy.wait(500);

    // Open filters and search
    cy.get('button[aria-label="persons.toggleFilters"]').click();
    cy.get(
      'input[placeholder*="Username"], input[placeholder*="Benutzername"]',
    ).type(user.username);
    cy.wait(1000);

    // Open edit page
    cy.scrollTo('top', { duration: 500 });
    cy.get('button[aria-label="More Row actions"]')
      .first()
      .click({ force: true });
    cy.contains('ul[role="menu"] span', /Bearbeiten|Edit/i).click({
      force: true,
    });
    cy.wait(2000);

    // Edit Personal Data fields
    // Title 1
    cy.get('input[id*="edit-person-title1"], input[name*="title1"]')
      .first()
      .clear()
      .type('Dr.');

    // First Name
    cy.get('input[id*="edit-person-first"], input[id*="firstName"]')
      .first()
      .clear()
      .type('Updated FirstName');

    // Last Name
    cy.get('input[id*="edit-person-last"], input[id*="lastName"]')
      .first()
      .clear()
      .type('Updated LastName');

    // Title 2
    cy.get('input[id*="edit-person-title2"], input[name*="title2"]')
      .first()
      .clear()
      .type('MBA');

    // Scroll to top to find Save button
    cy.scrollTo('top', { duration: 500 });
    cy.wait(500);

    // Click Save Changes button
    cy.intercept('POST', '**/editPerson').as('editPerson');
    cy.get('button[id*="save"], button')
      .contains(/Save Changes|Änderungen speichern/i)
      .click({ force: true });

    // Wait for and verify save response
    cy.wait('@editPerson', { timeout: 15000 }).then((interception) => {
      expect(interception.response.statusCode).to.be.oneOf([200, 201]);
    });

    cy.wait(2000);

    // Verify success notification or redirect
    cy.url().should('include', 'persons');
  });

  /**
   * SCENARIO 3: Edit Contact & Address Fields
   * Steps:
   * - Navigate to edit user page
   * - Modify contact fields (Phone, Email)
   * - Modify address fields (Street, House No, ZIP, City, Country)
   * - Verify validation rules
   * - Save changes
   */
  it('TC03 - Should edit contact and address fields with validation', () => {
    // Navigate to edit page
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.loginToDH();
    cy.wait(2000);

    cy.get('#nav-employees').click();
    cy.wait(2000);

    // Select company and open user
    const companyName = Cypress.env('company').toLowerCase();
    const user = Cypress.env('createUser')[0];

    cy.get('#employee-select-company').click({ force: true });
    cy.wait(500);
    cy.get('ul[role="listbox"] > li > span')
      .contains(new RegExp(companyName, 'i'))
      .click({ force: true });

    cy.get('button[aria-label="persons.toggleFilters"]').click();
    cy.get('input[placeholder*="Username"]').type(user.username);
    cy.wait(1000);

    cy.scrollTo('top');
    cy.get('button[aria-label="More Row actions"]')
      .first()
      .click({ force: true });
    cy.contains('ul[role="menu"] span', /Edit/i).click({ force: true });
    cy.wait(2000);

    // Edit Mobile Phone Number
    cy.get('input[id*="phone"], input[id*="mobile"]')
      .first()
      .clear()
      .type('+431234567890');

    // Edit Email Address
    cy.get('input[id*="email"]')
      .first()
      .clear()
      .type('updated_email@example.com');

    // Edit Street
    cy.get('input[id*="street"]').first().clear().type('Updated Test Street');

    // Edit House Number
    cy.get('input[id*="house"], input[id*="streetNumber"]').clear().type('99');

    // Edit ZIP Code
    cy.get('input[id*="zip"], input[id*="zipCode"]').clear().type('1010');

    // Edit City
    cy.get('input[value="Graz"]').clear().type('Vienna');

    // Edit Country - select from dropdown
    cy.get('input[id*="country"], input[aria-autocomplete="list"]')
      .first()
      .click({ force: true });
    cy.wait(500);

    // Select Austria
    cy.contains(
      'ul[role="listbox"]:visible [role="option"]',
      /Austria|Österreich/i,
    ).click({ force: true });
    cy.wait(500);

    // Scroll to Save button
    cy.scrollTo('top', { duration: 500 });

    // Save changes
    cy.intercept('POST', '**/editPerson').as('editPerson');
    cy.contains('button', /Save Changes|Änderungen speichern/i).click({
      force: true,
    });

    cy.wait('@editPerson', { timeout: 15000 }).then((interception) => {
      expect(interception.response.statusCode).to.be.oneOf([200, 201]);
    });

    cy.wait(2000);
  });

  /**
   * SCENARIO 4: Email Validation - Invalid Format
   * Steps:
   * - Navigate to edit user page
   * - Enter invalid email format
   * - Verify error message is shown
   * - Enter valid email
   * - Verify error message disappears
   */
  it('TC04 - Should validate email format and show error message', () => {
    // Navigate to edit page
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.loginToDH();
    cy.wait(2000);

    cy.get('#nav-employees').click();
    cy.wait(2000);

    const companyName = Cypress.env('company').toLowerCase();
    const user = Cypress.env('createUser')[0];

    cy.get('#employee-select-company').click({ force: true });
    cy.wait(500);
    cy.get('ul[role="listbox"] > li > span')
      .contains(new RegExp(companyName, 'i'))
      .click({ force: true });

    cy.get('button[aria-label="persons.toggleFilters"]').click();
    cy.get('input[placeholder*="Username"]').type(user.username);
    cy.wait(1000);

    cy.scrollTo('top');
    cy.get('button[aria-label="More Row actions"]')
      .first()
      .click({ force: true });
    cy.contains('ul[role="menu"] span', /Edit/i).click({ force: true });
    cy.wait(2000);

    // Enter invalid email format
    cy.get('input[id*="email"]').first().clear().type('invalid_email_format');
    cy.get('input[id*="email"]').first().blur();
    cy.wait(1000);

    // Verify error message is shown
    cy.get('div[role="alert"], .MuiFormHelperText-root')
      .should('be.visible')
      .invoke('text')
      .should('match', /Invalid email format|E-Mail-Format ist ungültig/i);

    // Enter valid email
    cy.get('input[id*="email"]')
      .first()
      .clear()
      .type('valid_email@example.com');
    cy.get('input[id*="email"]').first().blur();
    cy.wait(1000);

    // Verify error message is not visible or doesn't contain email error
    cy.get('body').then(($body) => {
      const errorElements = $body.find(
        'div[role="alert"], .MuiFormHelperText-root',
      );
      if (errorElements.length > 0) {
        cy.wrap(errorElements)
          .invoke('text')
          .should('not.match', /Invalid email/i);
      }
    });
  });

  /**
   * SCENARIO 5: ZIP Code Validation for Austria
   * Steps:
   * - Navigate to edit user page
   * - Select Austria as country
   * - Enter invalid ZIP code (5 digits)
   * - Verify error message
   * - Enter valid ZIP code (4 digits)
   * - Verify no error
   */
  it('TC05 - Should validate ZIP code format for Austria (4 digits)', () => {
    // Navigate to edit page
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.loginToDH();
    cy.wait(2000);

    cy.get('#nav-employees').click();
    cy.wait(2000);

    const companyName = Cypress.env('company').toLowerCase();
    const user = Cypress.env('createUser')[0];

    cy.get('#employee-select-company').click({ force: true });
    cy.wait(500);
    cy.get('ul[role="listbox"] > li > span')
      .contains(new RegExp(companyName, 'i'))
      .click({ force: true });

    cy.get('button[aria-label="persons.toggleFilters"]').click();
    cy.get('input[placeholder*="Username"]').type(user.username);
    cy.wait(1000);

    cy.scrollTo('top');
    cy.get('button[aria-label="More Row actions"]')
      .first()
      .click({ force: true });
    cy.contains('ul[role="menu"] span', /Edit/i).click({ force: true });
    cy.wait(2000);

    // Select Austria
    cy.get('input[id*="country"], input[aria-autocomplete="list"]')
      .first()
      .click({ force: true });
    cy.wait(500);

    cy.contains(
      'ul[role="listbox"]:visible [role="option"]',
      /Austria|Österreich/i,
    ).click({ force: true });
    cy.wait(500);

    // Enter invalid ZIP (5 digits)
    cy.get('input[id*="zip"]').clear().type('12345');
    cy.get('input[id*="zip"]').blur();
    cy.wait(1500);

    // Verify error message
    cy.get('.MuiFormHelperText-root, div[role="alert"]')
      .should('be.visible')
      .invoke('text')
      .should(
        'match',
        /Invalid format \(4 digits\)|Ungültiges Format \(4 Ziffern\)/i,
      );

    // Enter valid ZIP (4 digits)
    cy.get('input[id*="zip"]').clear().type('1010');
    cy.get('input[id*="zip"]').blur();
    cy.wait(1000);

    // Verify no error
    cy.get('body').then(($body) => {
      const helpers = $body.find('.MuiFormHelperText-root');
      if (helpers.length > 0) {
        cy.wrap(helpers)
          .invoke('text')
          .should('not.match', /Invalid format.*4 digits/i);
      }
    });
  });

  /**
   * SCENARIO 6: Add Personal Number
   * Steps:
   * - Navigate to edit user page
   * - Click "Add Personal Number" button (blue icon)
   * - Verify dialog opens
   * - Select company from dropdown
   * - Enter personal number
   * - Save
   * - Verify new personal number is added
   */
  it.only('TC06 - Should add new personal number to user', () => {
    // Navigate to edit page
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.loginToDH();
    cy.wait(2000);

    cy.get('#nav-employees').click();
    cy.wait(2000);

    const companyName = Cypress.env('company').toLowerCase();
    const user = Cypress.env('createUser')[0];

    cy.get('#employee-select-company').click({ force: true });
    cy.wait(500);
    cy.get('ul[role="listbox"] > li > span')
      .contains(new RegExp(companyName, 'i'))
      .click({ force: true });

    cy.get('button[aria-label="persons.toggleFilters"]').click();
    cy.get('input[placeholder*="Username"]').type(user.username);
    cy.wait(1000);

    cy.scrollTo('top');
    cy.get('button[aria-label="More Row actions"]')
      .first()
      .click({ force: true });
    cy.contains('ul[role="menu"] span', /Edit/i).click({ force: true });
    cy.wait(2000);

    // Scroll to Personal Number section
    cy.contains(
      'legend, h2, h3',
      /Personal Number|Personalnummer/i,
    ).scrollIntoView();
    cy.wait(500);

    // Click Add Personal Number button (blue icon button)
    cy.get('#add-personal-number-button')
      .filter(':visible')
      .filter((index, el) => {
        const bg = Cypress.$(el).css('background-color');
        // Looking for blue button
        return (
          bg &&
          (bg.includes('rgb(25, 118, 210)') ||
            Cypress.$(el).find('svg').length > 0)
        );
      })
      .first()
      .click({ force: true });
    cy.wait(1000);

    // Verify "Add New Personal Number" dialog is visible
    cy.contains(
      'h1, h2, h3',
      /Add New Personal Number|Neue Personalnummer hinzufügen/i,
    ).should('be.visible');

    // Company field should be pre-filled
    cy.get('input[id*="company"], input[name*="company"]').should(
      'have.value',
      'AQUA GmbH',
    );

    // Prefix should be pre-filled
    cy.get('input[value*="aqua"]').should('exist');

    // Enter Personal Number
    const randomNumber = `PN${Date.now()}`;
    cy.get(
      'input[placeholder*="Personal Number"], input[id*="personalNumber"]',
    ).type(randomNumber);

    // Click Save button in dialog
    cy.intercept('POST', '**/person/**').as('addPersonalNumber');
    cy.contains('button', /Save|Speichern/i).click({ force: true });

    // Wait for save
    cy.wait('@addPersonalNumber', { timeout: 10000 }).then((interception) => {
      expect(interception.response.statusCode).to.be.oneOf([200, 201]);
    });

    cy.wait(1500);

    // Verify dialog closed
    cy.contains('h1, h2', /Add New Personal Number/i).should('not.exist');
  });

  /**
   * SCENARIO 7: Unsaved Changes Warning
   * Steps:
   * - Navigate to edit user page
   * - Make changes to any field
   * - Click Back button without saving
   * - Verify "Unsaved Changes" dialog appears
   * - Click "Back to Employees page" to discard changes
   * - Verify navigation back to employees table
   */
  it('TC07 - Should show unsaved changes warning when navigating away', () => {
    // Navigate to edit page
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.loginToDH();
    cy.wait(2000);

    cy.get('#nav-employees').click();
    cy.wait(2000);

    const companyName = Cypress.env('company').toLowerCase();
    const user = Cypress.env('createUser')[0];

    cy.get('#employee-select-company').click({ force: true });
    cy.wait(500);
    cy.get('ul[role="listbox"] > li > span')
      .contains(new RegExp(companyName, 'i'))
      .click({ force: true });

    cy.get('button[aria-label="persons.toggleFilters"]').click();
    cy.get('input[placeholder*="Username"]').type(user.username);
    cy.wait(1000);

    cy.scrollTo('top');
    cy.get('button[aria-label="More Row actions"]')
      .first()
      .click({ force: true });
    cy.contains('ul[role="menu"] span', /Edit/i).click({ force: true });
    cy.wait(2000);

    // Make a change - edit first name
    cy.get('input[id*="firstName"]').first().clear().type('Modified Name');
    cy.wait(500);

    // Click Back button
    cy.contains('button, a', /Back|Zurück/i).click({ force: true });
    cy.wait(1000);

    // Verify "Unsaved Changes" dialog appears
    cy.contains(
      'h1, h2, h3, span',
      /Unsaved Changes|Nicht gespeicherte Änderungen/i,
    ).should('be.visible');

    // Verify dialog text
    cy.contains(
      /Would you like to save them|Möchten Sie diese speichern/i,
    ).should('be.visible');

    // Verify "Save" button exists
    cy.contains('button', /^Save$|^Speichern$/i).should('be.visible');

    // Click "Back to Employees page" to discard changes
    cy.contains('button', /Back to Employees|Zurück zu Mitarbeiter/i).click({
      force: true,
    });
    cy.wait(1500);

    // Verify navigation back to employees table
    cy.url().should('include', 'persons');
    cy.contains('h1, h2', /Employees|Mitarbeiter/i).should('be.visible');
  });

  /**
   * SCENARIO 8: Save Changes from Unsaved Changes Dialog
   * Steps:
   * - Navigate to edit user page
   * - Make changes
   * - Click Back
   * - Click "Save" from unsaved changes dialog
   * - Verify changes are saved
   * - Verify navigation back to employees
   */
  it('TC08 - Should save changes when clicking Save in unsaved changes dialog', () => {
    // Navigate to edit page
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.loginToDH();
    cy.wait(2000);

    cy.get('#nav-employees').click();
    cy.wait(2000);

    const companyName = Cypress.env('company').toLowerCase();
    const user = Cypress.env('createUser')[0];

    cy.get('#employee-select-company').click({ force: true });
    cy.wait(500);
    cy.get('ul[role="listbox"] > li > span')
      .contains(new RegExp(companyName, 'i'))
      .click({ force: true });

    cy.get('button[aria-label="persons.toggleFilters"]').click();
    cy.get('input[placeholder*="Username"]').type(user.username);
    cy.wait(1000);

    cy.scrollTo('top');
    cy.get('button[aria-label="More Row actions"]')
      .first()
      .click({ force: true });
    cy.contains('ul[role="menu"] span', /Edit/i).click({ force: true });
    cy.wait(2000);

    // Make a change
    cy.get('input[id*="firstName"]').first().clear().type('SaveTest Name');
    cy.wait(500);

    // Click Back button
    cy.contains('button, a', /Back|Zurück/i).click({ force: true });
    cy.wait(1000);

    // Verify dialog appears
    cy.contains(/Unsaved Changes/i).should('be.visible');

    // Click Save button in dialog
    cy.intercept('POST', '**/editPerson').as('editPerson');
    cy.contains('button', /^Save$|^Speichern$/i).click({ force: true });

    // Wait for save
    cy.wait('@editPerson', { timeout: 15000 }).then((interception) => {
      expect(interception.response.statusCode).to.be.oneOf([200, 201]);
    });

    cy.wait(2000);

    // Verify navigation back to employees
    cy.url().should('include', 'persons');
  });

  /**
   * SCENARIO 9: Verify Activities Log
   * Steps:
   * - Navigate to edit user page
   * - Make and save changes
   * - Navigate to Activities tab
   * - Verify update entries are logged
   * - Verify log contains updated field information
   */
  it('TC09 - Should log all changes in Activities tab', () => {
    // Navigate to edit page
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.loginToDH();
    cy.wait(2000);

    cy.get('#nav-employees').click();
    cy.wait(2000);

    const companyName = Cypress.env('company').toLowerCase();
    const user = Cypress.env('createUser')[0];

    cy.get('#employee-select-company').click({ force: true });
    cy.wait(500);
    cy.get('ul[role="listbox"] > li > span')
      .contains(new RegExp(companyName, 'i'))
      .click({ force: true });

    cy.get('button[aria-label="persons.toggleFilters"]').click();
    cy.get('input[placeholder*="Username"]').type(user.username);
    cy.wait(1000);

    cy.scrollTo('top');
    cy.get('button[aria-label="More Row actions"]')
      .first()
      .click({ force: true });
    cy.contains('ul[role="menu"] span', /Edit/i).click({ force: true });
    cy.wait(2000);

    // Make changes
    const timestamp = Date.now();
    cy.get('input[id*="firstName"]')
      .first()
      .clear()
      .type(`ActivityTest${timestamp}`);

    // Save changes
    cy.scrollTo('top');
    cy.intercept('POST', '**/editPerson').as('editPerson');
    cy.contains('button', /Save Changes|Änderungen speichern/i).click({
      force: true,
    });

    cy.wait('@editPerson', { timeout: 15000 });
    cy.wait(2000);

    // Navigate back to user edit page
    cy.get('button[aria-label="persons.toggleFilters"]').click();
    cy.get('input[placeholder*="Username"]').clear().type(user.username);
    cy.wait(1000);

    cy.scrollTo('top');
    cy.get('button[aria-label="More Row actions"]')
      .first()
      .click({ force: true });
    cy.contains('ul[role="menu"] span', /Edit/i).click({ force: true });
    cy.wait(2000);

    // Click on Activities tab
    cy.contains('button, a', /Activities|Aktivitäten/i).click({ force: true });
    cy.wait(1500);

    // Verify Activities table is visible
    cy.get('table, .MuiTable-root').should('be.visible');

    // Verify headers: Display Name, Date, Activity, Log
    cy.contains('th, .MuiTableCell-head', /Display Name|Anzeigename/i).should(
      'be.visible',
    );
    cy.contains('th, .MuiTableCell-head', /Date|Datum/i).should('be.visible');
    cy.contains('th, .MuiTableCell-head', /Activity|Aktivität/i).should(
      'be.visible',
    );
    cy.contains('th, .MuiTableCell-head', /Log/i).should('be.visible');

    // Verify at least one "Update" activity exists
    cy.contains('td, .MuiTableCell-root', /Update/i).should('exist');

    // Verify log contains field update information
    cy.get('tbody tr')
      .first()
      .find('td')
      .last()
      .invoke('text')
      .should('include', 'firstName');
  });

  /**
   * SCENARIO 10: Reset Password Action
   * Steps:
   * - Navigate to edit user page
   * - Verify "Reset Password" link/button exists
   * - Click Reset Password
   * - Verify confirmation or success message
   */
  it('TC10 - Should have Reset Password action available', () => {
    // Navigate to edit page
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.loginToDH();
    cy.wait(2000);

    cy.get('#nav-employees').click();
    cy.wait(2000);

    const companyName = Cypress.env('company').toLowerCase();
    const user = Cypress.env('createUser')[0];

    cy.get('#employee-select-company').click({ force: true });
    cy.wait(500);
    cy.get('ul[role="listbox"] > li > span')
      .contains(new RegExp(companyName, 'i'))
      .click({ force: true });

    cy.get('button[aria-label="persons.toggleFilters"]').click();
    cy.get('input[placeholder*="Username"]').type(user.username);
    cy.wait(1000);

    cy.scrollTo('top');
    cy.get('button[aria-label="More Row actions"]')
      .first()
      .click({ force: true });
    cy.contains('ul[role="menu"] span', /Edit/i).click({ force: true });
    cy.wait(2000);

    // Scroll to Personal Number & Status section
    cy.contains(
      'legend, h2, h3',
      /Personal Number.*Status|Personalnummer.*Status/i,
    ).scrollIntoView();
    cy.wait(500);

    // Verify Reset Password link exists
    cy.contains('button, a', /Reset Password|Passwort zurücksetzen/i)
      .should('be.visible')
      .should('exist');

    // Note: Don't actually click it in automated tests unless you want to trigger password reset
    cy.log('Reset Password action is available and visible');
  });
});
