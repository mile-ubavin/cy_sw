///<reference types="cypress" />

describe('Admin User', () => {
  it('DH - Create New User', () => {
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
    /********************************************************************** */

    //Click on Admin User page
    cy.contains('nav ul li div span', /Admin Usermanagement/i).click();
    cy.wait(1500);

    //Select Company

    const companyName = Cypress.env('company').toLowerCase();

    // Open the dropdown
    cy.get('div[role="combobox"]').click({ force: true });

    // Find and click the matching option (ignore case)
    cy.get('ul[role="listbox"] > li > span')
      .should('be.visible')
      .each(($el) => {
        const text = $el.text().trim().toLowerCase();

        if (text === companyName) {
          cy.wrap($el).click({ force: true });
        }
      });
    cy.wait(500);
    /********************************************************************* */

    // Click "Create new person"
    cy.get('.linkbtn--primary>div:nth-of-type(1)')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
      .wait(1000)
      .contains(/Neuen Admin Benutzer Anlegen|Neuen Admin Benutzer Anlegen/i) // DE + EN
      .click();

    cy.wait(500);

    // Validate Title of Create Admin User dialog
    // cy.get('.MuiModal-root>div:nth-of-type(3)>div:nth-of-type(1)>h2')
    //   .should('be.visible')
    //   .invoke('text')
    //   .then((text) => {
    //     expect(text.trim()).to.match(
    //       /Neuen Admin Benutzer Anlegen|Neuen Admin Benutzer Anlegen/i
    //     );
    //   });

    cy.wait(500);

    // Get user test data from cypress.config.js
    // Get user test data
    const adminForm =
      '.MuiModal-root > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div > form > div';

    const user = Cypress.env('createAdminUser')[0];

    // Fill input fields
    cy.get(`${adminForm}:nth-of-type(1) input`).type(user.firstName);
    cy.get(`${adminForm}:nth-of-type(2) input`).type(user.lastName);
    cy.get(`${adminForm}:nth-of-type(3) input`).type(user.username);
    cy.wait(500);

    //Select Admin Roles
    cy.get(`${adminForm}:nth-of-type(5) input`).click();

    // List of roles to select (DE + EN)
    const roles = [
      /View E-Box|E-Box ansehen/i,
      /Customer Creator|Nutzeranlage/i,
      /Data Submitter|Versand/i,
    ];

    // STEP 2 — Loop through roles and select each one
    roles.forEach((role) => {
      cy.contains(' .MuiTypography-body1.MuiTypography-root.css-ud2i91', role)
        .scrollIntoView()
        .click({ force: true }); // click label or checkbox
    });
    cy.wait(2500);
    //Clear all selected roles
    cy.get('button[aria-label="Clear"]').click();
    cy.wait(1000);

    //Select again Roles
    roles.forEach((role) => {
      cy.contains(' .MuiTypography-body1.MuiTypography-root.css-ud2i91', role)
        .scrollIntoView()
        .click({ force: true }); // click label or checkbox
    });
    cy.wait(2500);
    //Enter email
    cy.get(`${adminForm}:nth-of-type(4) input`).type(user.email);
    cy.wait(2500);

    //Submit
    cy.get('button[type="submit"]').click();
  });

  it('DH - Edit Admin User', () => {
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

    //Click on Admin User page
    cy.contains('nav ul li div span', /Admin Usermanagement/i).click();
    cy.wait(1500);

    //Select Company

    const companyName = Cypress.env('company').toLowerCase();

    // Open the dropdown
    cy.get('div[role="combobox"]').click({ force: true });
    cy.wait(1000);

    // Find and click the matching option (ignore case)
    cy.get('ul[role="listbox"] > li > span')
      .should('be.visible')
      .each(($el) => {
        const text = $el.text().trim().toLowerCase();

        if (text === companyName) {
          cy.wrap($el).click({ force: true });
        }
      });
    cy.wait(1500);

    // Get user test data from cypress.config.js
    const user = Cypress.env('createAdminUser')[0];
    cy.wait(1500);

    // Search for user by username
    cy.get('input[placeholder="Benutzername"]').type(user.username);
    cy.wait(1500);

    // Reset filter
    cy.get('div[role="toolbar"] > button')
      .last()
      .should('be.visible')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
      .wait(1500)

      .click();
    cy.wait(1500);

    // Re-search user
    cy.get('input[placeholder="Benutzername"]').clear().type(user.username);
    cy.wait(1000);

    //Togle Filters Bar HIDE
    cy.get('#toggle-filters')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
      .wait(2000)

      .click();

    //Togle Filters Bar SHOW
    cy.get('#toggle-filters')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
      .wait(1000)
      .click();

    //Custom Filer view

    // 1. Open the column settings
    cy.get('.iconbtn').eq(1).click({ force: true });

    // 2. Wait for the MUI menu to appear
    cy.get('.MuiPaper-root', { timeout: 5000 }).should('be.visible');

    // 3. Allowed values (multiple translations per item)
    const desiredSelection = [
      ['Nachname', 'Nachname'],
      ['E-Mail', 'E-Mail'],
      ['Rechte', 'Rechte'],
    ];

    // 4. Find all items in the popover
    cy.get('.MuiPaper-root li div p')
      .should('have.length.greaterThan', 0)
      .each(($item) => {
        const text = $item.text().trim();
        cy.log('Found item: ' + text);

        // Search for a match in all allowed values
        const isMatch = desiredSelection.some((translations) =>
          translations.some(
            (value) => value.toLowerCase() === text.toLowerCase()
          )
        );

        // If match → click the element
        if (isMatch) {
          cy.log(`Clicking matching item: ${text}`);
          cy.wrap($item).scrollIntoView().click({ force: true });
        }
      });
    cy.wait(3000);
    //Reset Filter view
    cy.get('.linkbtn--ghost > div:nth-of-type(2)>svg').click({ force: true });
    cy.wait(2000);

    // // Search for user by username
    // cy.get('input[placeholder="Benutzername"]')
    //   .click({ force: true })
    //   .type(user.username);
    // cy.wait(1500);

    // Open 3-dot menu
    cy.get('button[aria-label="More Row actions"]')
      .last()
      .click({ force: true });
    cy.wait(1000);

    // Target the "Bearbeiten" button
    cy.get('.MuiListItemText-root>span')
      .should('be.visible')
      .wait(1000)
      .contains(/Bearbeiten|Edit/i) // DE + EN
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
      .wait(1500)
      .click();

    cy.wait(3000);

    //Edit user's data

    cy.get('input[placeholder="Vorname"').type(' - EDIT');
    cy.get('input[placeholder="Nachname"]').type(' - EDIT');

    //Enter invalid email
    cy.get('input[placeholder="email@example.com"]')
      .clear()
      .type('invalid_email_format@yopmail');

    cy.wait(2000);

    //Validate error message
    cy.get('div[role="alert"]>div')
      .should('be.visible') // Ensure it's visible first
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /E-Mail-Format ist ungültig|E-Mail-Format ist ungültig/
        );
      });
    cy.wait(2500);

    //Expand Role reopdown
    cy.get('input[role="combobox"]').click();

    const roles = [/Customer Creator|Nutzeranlage/i, /Data Submitter|Versand/i];

    // STEP 2 — Loop through roles and select each one
    roles.forEach((role) => {
      cy.contains(' .MuiTypography-body1.MuiTypography-root.css-ud2i91', role)
        .scrollIntoView()
        .click({ force: true }); // click label or checkbox
    });
    cy.wait(2500);

    //Select again Roles
    roles.forEach((role) => {
      cy.contains(' .MuiTypography-body1.MuiTypography-root.css-ud2i91', role)
        .scrollIntoView()
        .click({ force: true }); // click label or checkbox
    });
    cy.wait(2500);

    //Enter valid email
    cy.get('input[placeholder="email@example.com"]')
      .clear()
      .type('valid_email-admin@yopmail.com');

    cy.wait(2000);

    //Edit Admin User`s data
    cy.get('.linkbtn--primary>div:nth-of-type(1)')
      .contains(/Änderungen speichern|Änderungen speichern/i) // DE + EN
      .click({ force: true });

    cy.wait(3000);

    //Logout

    // //Click on avatar
    // cy.get('.MuiAvatar-root').click();
    // cy.wait(1000);
    // //Click on Logout button
    // cy.get('ul[role="menu"]>li')
    //   .contains(/Abmelden|Abmelden/i)
    //   .click();
    // cy.wait(1500);
  }); //End IT

  it('DH - Add Roles ', () => {
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

    //Click on Admin User page
    cy.contains('nav ul li div span', /Admin Usermanagement/i).click();
    cy.wait(1500);

    //Select Company

    const companyName = Cypress.env('company').toLowerCase();

    // Open the dropdown
    cy.get('div[role="combobox"]').click({ force: true });
    cy.wait(1000);

    // Find and click the matching option (ignore case)
    cy.get('ul[role="listbox"] > li > span')
      .should('be.visible')
      .each(($el) => {
        const text = $el.text().trim().toLowerCase();

        if (text === companyName) {
          cy.wrap($el).click({ force: true });
        }
      });
    cy.wait(1500);

    // Get user test data from cypress.config.js
    const user = Cypress.env('createAdminUser')[0];
    cy.wait(1500);

    // Search for user by username
    cy.get('input[placeholder="Benutzername"]').type(user.username);
    cy.wait(2000);

    // Open 3-dot menu
    cy.get('button[aria-label="More Row actions"]')
      .last()
      .click({ force: true });
    cy.wait(1000);
    // Target the "Roles" button
    cy.get('.MuiListItemText-root>span')
      .should('be.visible')
      .wait(1000)
      .contains(/Rechte|Roles/i) // DE + EN
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
      .wait(1500)
      .click();

    cy.wait(2000);

    //
    // --- ROLE DEFINITIONS (DE + EN) ---
    //
    const roles = [
      { label: 'Firmen-Administrator', regex: /Firmen-Administrator/i },
      { label: 'Nutzeranlage', regex: /Nutzeranlage|Customer Creator/i },
      { label: 'Versand', regex: /Versand|Data Submitter/i },
      { label: 'E-Box ansehen', regex: /E-Box ansehen|View E-Box/i },
    ];

    //
    // --- FUNCTION: Select role ONLY if checkbox is not already selected ---
    //
    function selectRoleIfNotChecked(role) {
      cy.contains(
        'label.MuiFormControlLabel-root span.MuiTypography-root',
        role.regex
      )
        .parents('label.MuiFormControlLabel-root')
        .then(($label) => {
          const isChecked = $label
            .find('input[type="checkbox"]')
            .prop('checked');

          if (isChecked) {
            cy.log(`🔵 SKIP (already selected): ${role.label}`);
          } else {
            cy.log(`🟢 SELECTING role: ${role.label}`);
            cy.wrap($label).scrollIntoView().click({ force: true });
          }
        });
    }

    //
    // --- STEP 1: Loop roles + select them if needed ---
    //
    roles.forEach((role) => selectRoleIfNotChecked(role));

    cy.wait(1000);

    //
    // --- STEP 2: SAVE changes ---
    //
    cy.contains('.MuiButton-colorPrimary div', /Speichern/i).click({
      force: true,
    });

    cy.wait(3000);

    //
    // --- STEP 3: VALIDATE saved roles in the table ---
    //

    // Expected roles in the exact format used in table.
    // NOTE → Table uses comma-separated DE labels.
    const expectedRoleLabels = [
      'Versand',
      'Nutzeranlage',
      'Firmen-Administrator',
      'E-Box ansehen',
    ];

    cy.get('tbody > tr:last-child > td:last-child')
      .invoke('text')
      .then((text) => {
        const cleaned = text.trim();
        cy.log(`Table roles: ${cleaned}`);

        // Split table text by comma into array
        const tableRoles = cleaned.split(',').map((r) => r.trim());

        cy.log(`Parsed roles: ${JSON.stringify(tableRoles)}`);

        //
        // --- VALIDATION: every expected role must be present ---
        //
        expectedRoleLabels.forEach((expected) => {
          expect(
            tableRoles,
            `Role "${expected}" should be present in the table row`
          ).to.include(expected);
        });
      });

    //Logout

    // //Click on avatar
    // cy.get('.MuiAvatar-root').click();
    // cy.wait(1000);
    // //Click on Logout button
    // cy.get('ul[role="menu"]>li')
    //   .contains(/Abmelden|Abmelden/i)
    //   .click();
    // cy.wait(1500);
  }); //End IT

  it('DH - Assign Admin User to another company', () => {
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

    //Click on Admin User page
    cy.contains('nav ul li div span', /Admin Usermanagement/i).click();
    cy.wait(1500);

    //Select Company

    const companyName = Cypress.env('company').toLowerCase();

    // Open the dropdown
    cy.get('div[role="combobox"]').click({ force: true });
    cy.wait(1000);

    // Find and click the matching option (ignore case)
    cy.get('ul[role="listbox"] > li > span')
      .should('be.visible')
      .each(($el) => {
        const text = $el.text().trim().toLowerCase();

        if (text === companyName) {
          cy.wrap($el).click({ force: true });
        }
      });
    cy.wait(1500);

    // Get user test data from cypress.config.js
    const user = Cypress.env('createAdminUser')[0];
    cy.wait(1500);

    // Search for user by username
    cy.get('input[placeholder="Benutzername"]').type(user.username);
    cy.wait(2000);

    // Open 3-dot menu
    cy.get('button[aria-label="More Row actions"]')
      .last()
      .click({ force: true });
    cy.wait(1000);

    // Target the "Firmen" button
    cy.get('.MuiListItemText-root>span')
      .should('be.visible')
      .wait(1000)
      .contains(/Firmen|Firmen/i) // DE + EN
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
      .wait(1500)
      .click();

    cy.wait(2000);

    //Assign Admin to another company
    const companiesToAssign = ['AQUA', 'ABBA'];

    companiesToAssign.forEach((company) => {
      cy.get('tbody > tr').then(($rows) => {
        // Find row where 2nd td text matches company
        const targetRow = [...$rows].find((row) => {
          const secondTdText = row
            .querySelector('td:nth-child(2)')
            ?.textContent.trim();
          return secondTdText === company;
        });

        if (targetRow) {
          cy.wrap(targetRow).within(() => {
            // Find checkbox input inside 1st td
            cy.get('td:nth-child(1)').then(($td) => {
              // Prefer the input element for clicking, fallback to span if needed
              const checkboxInput = $td.find('input[type="checkbox"]');
              if (checkboxInput.length) {
                // Check if already checked
                if (checkboxInput.is(':checked')) {
                  cy.log(`User already assigned to ${company}, skipping.`);
                } else {
                  cy.log(
                    `Assigning user to ${company} by clicking checkbox input.`
                  );
                  cy.wrap(checkboxInput)
                    .scrollIntoView()
                    .click({ force: true });
                }
              } else {
                // If no input found, try span with role=checkbox
                const checkboxSpan = $td.find('span[role="checkbox"]');
                if (checkboxSpan.length) {
                  const isChecked =
                    checkboxSpan.attr('aria-checked') === 'true';
                  if (isChecked) {
                    cy.log(`User already assigned to ${company}, skipping.`);
                  } else {
                    cy.log(
                      `Assigning user to ${company} by clicking checkbox span.`
                    );
                    cy.wrap(checkboxSpan)
                      .scrollIntoView()
                      .click({ force: true });
                  }
                } else {
                  cy.log(
                    `No checkbox input or span found for company ${company}`
                  );
                }
              }
            });
          });
        } else {
          cy.log(`Company row "${company}" not found!`);
        }
      });
    });

    cy.wait(2000);
    //Click on next button
    cy.get('.linkbtn--primary')
      .contains(/Nächste|Nächste/i)
      .click();

    //Wizzard - Step 2
    //Addign role
    const rolesToCompanyAdmin = [
      { label: 'Firmen-Administrator', regex: /Firmen-Administrator/i },
      { label: 'Nutzeranlage', regex: /Nutzeranlage|Customer Creator/i },
      { label: 'Versand', regex: /Versand|Data Submitter/i },
      { label: 'E-Box ansehen', regex: /E-Box ansehen|View E-Box/i },
    ];

    //
    // --- FUNCTION: Select role ONLY if checkbox is not already selected ---
    //
    function selectRoleIfNotChecked(role) {
      cy.contains(
        'label.MuiFormControlLabel-root span.MuiTypography-root',
        role.regex
      )
        .parents('label.MuiFormControlLabel-root')
        .then(($label) => {
          const isChecked = $label
            .find('input[type="checkbox"]')
            .prop('checked');

          if (isChecked) {
            cy.log(`SKIP (already selected): ${role.label}`);
          } else {
            cy.log(`SELECTING role: ${role.label}`);
            cy.wrap($label).scrollIntoView().click({ force: true });
          }
        });
    }

    //
    // --- STEP 1: Loop roles + select them if needed ---
    //
    rolesToCompanyAdmin.forEach((role) => selectRoleIfNotChecked(role));

    cy.wait(1000);

    //
    // --- STEP 2: SAVE changes ---
    // //
    //Click on next button
    cy.get('.linkbtn--primary')
      .contains(/Übernahmen|Übernahmen/i)
      .click();

    // });

    cy.wait(3000);

    //---------Edit Roles on second company---------

    // // Search for user by username
    // cy.get('input[placeholder="Benutzername"]').type(user.username);
    // cy.wait(2000);

    // // Open 3-dot menu
    // cy.get('button[aria-label="More Row actions"]')
    //   .last()
    //   .click({ force: true });
    // cy.wait(1000);

    // // Target the "Firmen" button
    // cy.get('.MuiListItemText-root>span')
    //   .should('be.visible')
    //   .wait(1000)
    //   .contains(/Firmen|Firmen/i) // DE + EN
    //   .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
    //   .wait(1500)
    //   .click();

    // cy.wait(2000);

    // // Assign Admin to another company (recheck and edit roles)
    // const editCompany = ['ABBA'];

    // editCompany.forEach((company) => {
    //   cy.get('tbody > tr').then(($rows) => {
    //     // Find row where 2nd td text matches company
    //     const targetRow = [...$rows].find((row) => {
    //       const secondTdText = row
    //         .querySelector('td:nth-child(2)')
    //         ?.textContent.trim();
    //       return secondTdText === company;
    //     });

    //     if (targetRow) {
    //       cy.wrap(targetRow).within(() => {
    //         // Find checkbox input inside 1st td
    //         cy.get('td:nth-child(1)').then(($td) => {
    //           // Prefer the input element for clicking, fallback to span if needed
    //           const checkboxInput = $td.find('input[type="checkbox"]');
    //           if (checkboxInput.length) {
    //             // Check if already checked (already assigned to the company)
    //             if (checkboxInput.is(':checked')) {
    //               cy.log(
    //                 `User already assigned to ${company}, deselecting and reselecting.`
    //               );
    //               // Uncheck (deselect) if already checked
    //               cy.wrap(checkboxInput)
    //                 .scrollIntoView()
    //                 .click({ force: true });
    //               cy.wait(500); // Wait for the checkbox to uncheck
    //               // Now check (select) again to reassign the user
    //               cy.wrap(checkboxInput)
    //                 .scrollIntoView()
    //                 .click({ force: true });
    //             } else {
    //               cy.log(
    //                 `Assigning user to ${company} by clicking checkbox input.`
    //               );
    //               cy.wrap(checkboxInput)
    //                 .scrollIntoView()
    //                 .click({ force: true });
    //             }
    //           } else {
    //             // If no input found, try span with role=checkbox
    //             const checkboxSpan = $td.find('span[role="checkbox"]');
    //             if (checkboxSpan.length) {
    //               const isChecked =
    //                 checkboxSpan.attr('aria-checked') === 'true';
    //               if (isChecked) {
    //                 cy.log(
    //                   `User already assigned to ${company}, deselecting and reselecting.`
    //                 );
    //                 // Uncheck (deselect) if already checked
    //                 cy.wrap(checkboxSpan)
    //                   .scrollIntoView()
    //                   .click({ force: true });
    //                 cy.wait(500); // Wait for the checkbox to uncheck
    //                 // Now check (select) again to reassign the user
    //                 cy.wrap(checkboxSpan)
    //                   .scrollIntoView()
    //                   .click({ force: true });
    //               } else {
    //                 cy.log(
    //                   `Assigning user to ${company} by clicking checkbox span.`
    //                 );
    //                 cy.wrap(checkboxSpan)
    //                   .scrollIntoView()
    //                   .click({ force: true });
    //               }
    //             } else {
    //               cy.log(
    //                 `No checkbox input or span found for company ${company}`
    //               );
    //             }
    //           }
    //         });
    //       });
    //     } else {
    //       cy.log(`Company row "${company}" not found!`);
    //     }
    //   });
    // });

    // cy.wait(2000);
    // //Click on next button
    // cy.get('.linkbtn--primary')
    //   .contains(/Nächste|Nächste/i)
    //   .click();
    // cy.wait(2000);

    // // Wizard - Step 2 (Assign roles)

    // // Define roles to be assigned to the Admin user
    // const editRoles = [
    //   { label: 'Versand', regex: /Versand|Data Submitter/i },
    //   { label: 'E-Box ansehen', regex: /E-Box ansehen|View E-Box/i },
    // ];

    // // --- FUNCTION: Select role ONLY if checkbox is not already selected ---
    // function selectRoleIfNotChecked(role) {
    //   cy.contains(
    //     'label.MuiFormControlLabel-root span.MuiTypography-root',
    //     role.regex
    //   )
    //     .parents('label.MuiFormControlLabel-root')
    //     .then(($label) => {
    //       const isChecked = $label
    //         .find('input[type="checkbox"]')
    //         .prop('checked');

    //       if (isChecked) {
    //         cy.log(`SKIP (already selected): ${role.label}`);
    //       } else {
    //         cy.log(`SELECTING role: ${role.label}`);
    //         cy.wrap($label).scrollIntoView().click({ force: true });
    //       }
    //     });
    // }

    // // --- STEP 1: Loop roles + select them if needed ---
    // editRoles.forEach((role) => selectRoleIfNotChecked(role));

    // cy.wait(1000);

    // // --- STEP 2: SAVE changes ---
    // cy.get('.linkbtn--primary')
    //   .contains(/Übernehmen|Übernehmen/i)
    //   .should('be.visible') // Ensure the save button is visible
    //   .click({ timeout: 10000 }); // Increased timeout to 10 seconds

    cy.wait(3000);

    //Logout

    // //Click on avatar
    // cy.get('.MuiAvatar-root').click();
    // cy.wait(1000);
    // //Click on Logout button
    // cy.get('ul[role="menu"]>li')
    //   .contains(/Abmelden|Abmelden/i)
    //   .click();
    // cy.wait(1500);
  }); //End IT

  it('DH - Remove Admin User from company', () => {
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

    //Click on Admin User page
    cy.contains('nav ul li div span', /Admin Usermanagement/i).click();
    cy.wait(1500);

    //Select Company

    const companyName = Cypress.env('company').toLowerCase();

    // Open the dropdown
    cy.get('div[role="combobox"]').click({ force: true });
    cy.wait(1000);

    // Find and click the matching option (ignore case)
    cy.get('ul[role="listbox"] > li > span')
      .should('be.visible')
      .each(($el) => {
        const text = $el.text().trim().toLowerCase();

        if (text === companyName) {
          cy.wrap($el).click({ force: true });
        }
      });
    cy.wait(1500);

    // Get user test data from cypress.config.js
    const user = Cypress.env('createAdminUser')[0];
    cy.wait(1500);

    // Search for user by username
    cy.get('input[placeholder="Benutzername"]').type(user.username);
    cy.wait(2000);

    // Open 3-dot menu
    cy.get('button[aria-label="More Row actions"]')
      .last()
      .click({ force: true });
    cy.wait(1000);

    // Target the "Firmen" button
    cy.get('.MuiListItemText-root>span')
      .should('be.visible')
      .wait(1000)
      .contains(/Firmen|Firmen/i) // DE + EN
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
      .wait(1500)
      .click();

    cy.wait(2000);

    //Remove
    const companiesToRemove = ['ABBA'];

    companiesToRemove.forEach((company) => {
      cy.get('tbody > tr').then(($rows) => {
        // Find row where 2nd td text matches company
        const targetRow = [...$rows].find((row) => {
          const secondTdText = row
            .querySelector('td:nth-child(2)')
            ?.textContent.trim();
          return secondTdText === company;
        });

        if (targetRow) {
          cy.wrap(targetRow).within(() => {
            // Find checkbox input inside 1st td
            cy.get('td:nth-child(1)').then(($td) => {
              // Prefer the input element for clicking, fallback to span if needed
              const checkboxInput = $td.find('input[type="checkbox"]');
              if (checkboxInput.length) {
                // Check if already checked (user is assigned)
                if (checkboxInput.is(':checked')) {
                  cy.log(`User already assigned to ${company}, removing...`);
                  // Uncheck the checkbox to remove the user
                  cy.wrap(checkboxInput)
                    .scrollIntoView()
                    .click({ force: true });
                } else {
                  cy.log(`User not assigned to ${company}, skipping.`);
                }
              } else {
                // If no input found, try span with role=checkbox
                const checkboxSpan = $td.find('span[role="checkbox"]');
                if (checkboxSpan.length) {
                  const isChecked =
                    checkboxSpan.attr('aria-checked') === 'true';
                  if (isChecked) {
                    cy.log(`User already assigned to ${company}, removing...`);
                    // Uncheck the span to remove the user
                    cy.wrap(checkboxSpan)
                      .scrollIntoView()
                      .click({ force: true });
                  } else {
                    cy.log(`User not assigned to ${company}, skipping.`);
                  }
                } else {
                  cy.log(
                    `No checkbox input or span found for company ${company}`
                  );
                }
              }
            });
          });
        } else {
          cy.log(`Company row "${company}" not found!`);
        }
      });
    });

    cy.wait(2000);
    //Click on next button
    cy.get('.linkbtn--primary')
      .contains(/Übernahmen|Übernahmen/i)
      .click();

    cy.wait(3000);

    //Logout

    // //Click on avatar
    // cy.get('.MuiAvatar-root').click();
    // cy.wait(1000);
    // //Click on Logout button
    // cy.get('ul[role="menu"]>li')
    //   .contains(/Abmelden|Abmelden/i)
    //   .click();
    // cy.wait(1500);
  }); //End IT
});
