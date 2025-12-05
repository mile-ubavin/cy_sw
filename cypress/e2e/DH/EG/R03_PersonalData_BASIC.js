///<reference types="cypress" />

describe('Login to DH using keycloak and upload-send PDF dictionary', () => {
  it('DH - Try  to Create New User when User already exist', () => {
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
    //Select Company

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
    /********************************************************************* */
    // Click "Create new person"
    cy.get('.linkbtn--primary>div:nth-of-type(1)')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
      .wait(1000)
      .contains(/Neuen Kontakt anlegen|Neuen Kontakt anlegen/i) // DE + EN
      .click();

    cy.wait(500);

    // Validate Title of Create User dialog
    cy.get('.css-1i29c0l>h2')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Neuen Kontakt anlegen|New Contact/);
      });

    cy.wait(500);

    // Validate subtitle on 1st wizard page
    cy.get('form>div>h2')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Grundinformationen|Grundinformationen/);
      });

    cy.wait(500);

    // Validate steps counter
    cy.get('form>div>p')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Schritt 1 von 3 - Persönliche Daten|Schritt 1 von 3 - Persönliche Daten/
        );
      });

    cy.wait(500);

    //Validate labels on form 1
    // cy.get('form>div:nth-of-type(2)')

    // Get user test data from cypress.config.js
    const user = Cypress.env('createUser')[0];

    //fill input fields 1st step
    cy.get('input[name="prefixedTitle"]').type(user.prefixedTitle);
    cy.get('input[name="firstName"]').type(user.firstName);
    cy.get('input[name="lastName"]').type(user.lastName);
    cy.get('input[name="suffixedTitle"').type(user.prefixedTitle2);

    //select Company prefix
    cy.get('input[aria-autocomplete="list"]').click({ force: true });
    cy.wait(1000);
    //cy.get("ul[role='listbox'] > li:nth-of-type(1)").click({ force: true });
    cy.get("ul[role='listbox'] > li")
      .should('be.visible')
      .each(($el) => {
        const text = $el.text().trim().toLowerCase();
        cy.log('***************************', text);

        if (text === 'aqua - aqua') {
          cy.wrap($el).click({ force: true });
        }
      });

    cy.get('input[name="accountNumber"]').type(user.username);
    cy.wait(1000);

    // Try Switching to 2nd step
    cy.get('form>div:nth-of-type(3)>button>div:nth-of-type(1)')
      .contains(/weiter|continue/i)
      .click({ force: true });
    cy.wait(1000);

    //Validate Error message
    cy.get('div[role="alert"]>div')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Invalid person account number|Benutzer konnte nicht erstellt werden/
        );
      });

    cy.wait(1500);
  });

  // Precondition: Search for the user and if user exists, proceed with deletion
  it('Search for the user and if user(s) exists, proceed with deletion', () => {
    cy.loginToSupportViewMaster();
    cy.wait(3500);

    //Remove pop up
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(1500);

    //Search for Group by Display Name
    cy.get('#searchButton>span').click(); //Click on search button
    // Use the company name from the cypress.config.js
    const companyName = Cypress.env('company');
    // Search for Group by Display Name using the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(0)
      .type(companyName);
    //Find the Search button by button name and click on it
    cy.get('.search-dialog>form>div>.mat-primary').click();
    //Switch to user section
    cy.get('.action-buttons > .mdc-button').eq(4).click();

    // Array of users to delete
    const usersToDelete = ['manualAddress', 'manualNoAddress'];

    usersToDelete.forEach((userName) => {
      const searchAndDeleteUser = (userName) => {
        cy.get('.search-label').click();

        // Search for the user
        cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
          .clear()
          .type(userName);
        cy.get('button[type="submit"]').click();

        // Wait for the search results
        cy.wait(2000);

        // Check if "No results" message exists (indicating user does not exist)
        cy.get('body').then(($body) => {
          if ($body.find('.cdk-row').length === 0) {
            cy.log(`User ${userName} not found or already deleted.`);
            cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click();
          } else {
            // If user exists, proceed with deletion
            cy.get('cdk-row').should('exist');
            cy.log(`User ${userName} found. Proceeding with deletion.`);

            cy.get('button')
              .contains(/Delete|DSGVO-Löschung/)
              .should('be.visible')
              .click();

            // Wait for confirmation dialog and confirm deletion
            cy.get('.confirm-buttons > button')
              .contains(/YES|JA/)
              .should('be.visible')
              .click();

            cy.log(`User ${userName} has been deleted.`);

            // Reset the search to clear out the search pill
            cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click();
          }
        });
      };
      cy.wait(1500);
      searchAndDeleteUser(userName);

      // Optional wait between deletions (if needed)
      cy.wait(1000);
    });

    //Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url
    cy.wait(3000);
  }); //end it

  it('DH - Create New User when SentToPint:true', () => {
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
    //Select Company

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
    /********************************************************************* */
    // Click "Create new person"
    cy.get('.linkbtn--primary>div:nth-of-type(1)')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
      .wait(1000)
      .contains(/Neuen Kontakt anlegen|Neuen Kontakt anlegen/i) // DE + EN
      .click();

    cy.wait(500);

    // Validate Title of Create User dialog
    cy.get('.css-1i29c0l>h2')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Neuen Kontakt anlegen|New Contact/);
      });

    cy.wait(500);

    // Validate subtitle on 1st wizard page
    cy.get('form>div>h2')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Grundinformationen|Grundinformationen/);
      });

    cy.wait(500);

    // Validate steps counter
    cy.get('form>div>p')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Schritt 1 von 3 - Persönliche Daten|Schritt 1 von 3 - Persönliche Daten/
        );
      });

    cy.wait(500);

    //Validate labels on form 1
    // cy.get('form>div:nth-of-type(2)')

    // Get user test data from cypress.config.js
    const user = Cypress.env('createUser')[0];

    //fill input fields 1st step
    cy.get('input[name="prefixedTitle"]').type(user.prefixedTitle);
    cy.get('input[name="firstName"]').type(user.firstName);
    cy.get('input[name="lastName"]').type(user.lastName);
    cy.get('input[name="suffixedTitle"').type(user.prefixedTitle2);

    //select Company prefix
    cy.get('input[aria-autocomplete="list"]').click({ force: true });
    cy.wait(1000);
    //cy.get("ul[role='listbox'] > li:nth-of-type(1)").click({ force: true });
    cy.get("ul[role='listbox'] > li")
      .should('be.visible')
      .each(($el) => {
        const text = $el.text().trim().toLowerCase();
        cy.log('***************************', text);

        if (text === 'aqua - aqua') {
          cy.wrap($el).click({ force: true });
        }
      });

    cy.get('input[name="accountNumber"]').type(user.username);
    cy.wait(1000);

    // Switch to 2nd step
    cy.get('form>div:nth-of-type(3)>button>div:nth-of-type(1)')
      .contains(/weiter|continue/i)
      .click({ force: true });
    cy.wait(1000);

    // Create User wizzard Step:2

    // Validate subtitle on 2nd wizzard page
    cy.get('form>div>h2')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Kontakt & Adresse|Kontakt & Adresse/);
      });
    cy.wait(500);

    // Validate steps counter
    cy.get('form>div>p')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Schritt 2 von 3 - Kontaktdaten und Adresse|Schritt 2 von 3 - Kontaktdaten und Adresse/
        );
      });
    cy.wait(500);

    //Telephone number
    cy.get('input[name="mobileNumber"]').type(user.subscriberNumberPhoneNum);

    //Email
    cy.get('input[name="email"').type(user.email);

    //Address data
    cy.get('input[name="street"').type(user.streetName);
    cy.get('input[name="streetNumber"').type(user.streetNumber);
    cy.get('input[name="apartment"').type(user.doorNumber);
    cy.get('input[name="zipCode"').type(user.zipCode);
    cy.get('input[name="city"').type(user.city);

    cy.wait(2000);

    // Switch to 3th (final) step
    cy.get('form>div:nth-of-type(3)>button>div:nth-of-type(1)')
      .contains(/weiter|continue/i)
      .click({ force: true });
    cy.wait(1000);

    // Create User wizzard Step:2

    // Validate subtitle on 2nd wizzard page
    cy.get('form>div>h2')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Versand & Status|Versand & Status/);
      });
    cy.wait(500);

    // Validate steps counter
    cy.get('form>div>p')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Schritt 3 von 3 - Empfangseinstellungen|Schritt 3 von 3 - Empfangseinstellungen/
        );
      });
    cy.wait(500);

    //select
    cy.get('form>div:nth-of-type(2)>div:nth-of-type(1)>div>div').click({
      force: true,
    });
    cy.wait(500);

    //Select from dropdown
    cy.get("ul[role='listbox'] > li >span")
      .should('be.visible')
      .each(($el) => {
        const text = $el.text().trim().toLowerCase();
        cy.log('***************************', text);

        if (text === 'elektronisch') {
          cy.wrap($el).click({ force: true });
        }
      });
    cy.wait(500);

    //Select
    cy.get('form>div:nth-of-type(2)>div:nth-of-type(2)>div>div').click({
      force: true,
    });
    cy.wait(500);
    //Select from dropdown
    cy.get("ul[role='listbox'] > li >span")
      .should('be.visible')
      .each(($el) => {
        const text = $el.text().trim().toLowerCase();
        cy.log('***************************', text);

        if (text === 'digital') {
          cy.wrap($el).click({ force: true });
        }
      });
    cy.wait(500);

    cy.intercept('POST', '**/editPerson').as('editPerson');
    //Finish Create New User approach
    cy.get('form>div:nth-of-type(3)>button>div:nth-of-type(1)')
      .contains(/Erstellen|Erstellen/i)
      .click({ force: true });

    // Wait & Assert response
    cy.wait('@editPerson', { timeout: 15000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(201);
      cy.log('User is successfully created');
    });
    cy.wait(1000);

    //Download Credentials

    //Check Title
    cy.get('div[role="dialog"]>div:nth-of-type(1)>h4')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Zugangsdaten des neuen Benutzers|Schritt 3 von 3 - Empfangseinstellungen/
        );
      });

    //Check supbtitle (text)
    cy.get('div[role="dialog"]>div:nth-of-type(2)>div>div>div')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).be.match(
          /Benutzersdaten herunterladen.|Benutzersdaten herunterladen./
        );
      });

    //Download PDF with Credentials
    cy.get('#downloadUserAccountPdfBtn').click();
    cy.wait(1000);

    // Get the latest downloaded PDF file
    const downloadsDir = `${Cypress.config(
      'fileServerFolder'
    )}/cypress/downloads/`;
    cy.task('getDownloadedPdf', downloadsDir).then((filePath) => {
      expect(filePath).to.not.be.null; // Assert the file exists
      cy.log(`Latest PDF File Path: ${filePath}`);
      cy.wait(3000);
      // Read the PDF content and open in the same tab using a Blob
      cy.readFile(filePath, 'binary').then((pdfBinary) => {
        const pdfBlob = Cypress.Blob.binaryStringToBlob(
          pdfBinary,
          'application/pdf'
        );
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Open the PDF in the same tab
        cy.window().then((win) => {
          win.location.href = pdfUrl; // Loads the PDF in the same window
        });
      });
    });
    cy.wait(3500);

    // Close download Credentials dialog
    // cy.get('div[role="dialog"]>div:nth-of-type(3)>button>div:nth-of-type(1)')
    //   .should('have.length.at.least', 1)
    //   .each(($btn) => {
    //     const text = $btn.text().trim();

    //     // match DE or EN translation
    //     if (text === 'Schließen' || text === 'Schließen') {
    //       cy.wrap($btn).click({ force: true });
    //     }
    //   });

    // cy.wait(1500);

    // //Search for user by username
    // cy.get('input[placeholder="Benutzername"]').type(user.username);

    // cy.pause();
  });

  it('DH - Edit E-Box user`s data, from Persons table', () => {
    // Visit AUT
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

    //Select Company
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

    // Get user test data from cypress.config.js
    const user = Cypress.env('createUser')[0];
    cy.wait(1500);

    // Search for user by username
    cy.get('input[placeholder="Benutzername"]').type(user.username);
    cy.get('input[placeholder="Name"]').type(user.lastName);
    //cy.get('input[placeholder="Telefonnummer"]').type(user.email);
    cy.wait(1000);

    //Move filers to right
    cy.get('div[role="toolbar"]>button:nth-of-type(2)')
      .should('be.enabled')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      .wait(1500)
      .click();
    cy.wait(1500);

    //Filter by Status
    cy.get('button>p')
      .should('be.visible')
      .contains(/Status|Status/)
      .click();
    cy.wait(2000);

    // Reset filter
    cy.get('div[role="toolbar"] > button')
      .last()
      .should('be.visible')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
      .wait(2500)

      .click();
    cy.wait(200);

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

    // // 1. Open the column settings
    // cy.get('.iconbtn').eq(1).click({ force: true });

    // // 2. Wait for the MUI menu to appear (MuiPaper-root)
    // cy.get('.MuiPaper-root', { timeout: 5000 }).should('be.visible');

    // // 3. Click the desired item inside the menu
    // cy.contains('.MuiPaper-root li div', 'E-Mail Aktiv')
    //   .should('be.visible')
    //   .click({ force: true });

    // 1. Open the column settings
    cy.get('.iconbtn').eq(1).click({ force: true });

    // 2. Wait for the MUI menu to appear
    cy.get('.MuiPaper-root', { timeout: 5000 }).should('be.visible');

    // 3. Allowed values (multiple translations per item)
    const desiredSelection = [
      ['Telefonnummer', 'Telephone Number'],
      ['E-Mail Aktiv', 'E-Mail Aktive', 'Email Active'],
      ['Zustellart', 'Delivery Type'],
      ['Status', 'E-Status', 'Status'],
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
    cy.get('.css-1am57kc')
      .contains(/Clear|Clear/)
      .click();

    /************************END******************** */

    // Open 3-dot menu
    cy.get('button[aria-label="More Row actions"]').click({ force: true });
    cy.wait(1000);

    // Target the "Bearbeiten" button
    cy.get('ul[role="menu"] > li:nth-of-type(1) > div:nth-of-type(2) > span')
      .should('be.visible')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
      .wait(1000)
      .contains(/Bearbeiten|Edit/i) // DE + EN
      .click();

    cy.wait(3000);

    //Click on reset password
    cy.contains('.linkbtn--secondary', /Passwort zurücksetzen/i)
      .should('be.enabled')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
      .wait(2500)
      .click({ force: true });

    cy.wait(3500);

    //Edit user's data

    cy.get('input[placeholder="z.B. Dr., Mag."]').type(' - EDIT');
    cy.get('input[placeholder="Vorname"').type(' - EDIT');
    cy.get('input[placeholder="Nachname"]').type(' - EDIT');
    cy.get('input[placeholder="z.B. PhD, MBA"]').type(' - EDIT');
    //Enter invalid email
    cy.get('input[placeholder="email@example.com"]')
      .clear()
      .type('invalid_email_format@yopmail');

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

    //Enter invalid email
    cy.get('input[placeholder="email@example.com"]')
      .clear()
      .type('valid_email_format@yopmail.com');

    cy.wait(3500);

    //Click on Edit User`s data
    cy.get('.linkbtn--primary>div:nth-of-type(1)')
      .contains(/Änderungen speichern|Änderungen speichern/i) // DE + EN
      .click({ force: true });

    cy.wait(3000);
  }); //End IT

  it.skip('DH - Reset Password from Persons table', () => {
    // Visit AUT
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

    //Select Company
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

    // Get user test data from cypress.config.js
    const user = Cypress.env('createUser')[0];
    cy.wait(1500);

    //Search for user by username
    cy.get('input[placeholder="Benutzername"]').type(user.username);
    cy.wait(1000);

    //Scroll UP
    cy.window().then((win) => {
      win.scrollTo({ top: 0, behavior: 'smooth' });
    });
    cy.wait(500);

    // Open 3-dot menu
    cy.get('button[aria-label="More Row actions"]').click({ force: true });
    cy.wait(1000);

    // Target the "Bearbeiten" button
    cy.get('ul[role="menu"] > li:nth-of-type(5) > div:nth-of-type(2) > span')
      .should('be.visible')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
      .wait(1000)
      .contains(/Passwort zurücksetzen|Passwort zurücksetzen/i) // DE + EN
      .click();

    cy.wait(3000);
  }); //End IT

  it('DH - Disable/Enable E-Box user from Persons table', () => {
    // Visit AUT
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

    //Select Company
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

    // Get user test data from cypress.config.js
    const user = Cypress.env('createUser')[0];
    cy.wait(1500);

    //Search for user by username
    cy.get('input[placeholder="Benutzername"]').type(user.username);
    cy.wait(1000);

    //Get user's status from Users table

    let extractedStatus = ''; // store user status

    // 1. Read user status from table
    cy.get('tbody > tr > td:last-of-type > div')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        extractedStatus = text.trim().toLowerCase();
        cy.log('User Status:', extractedStatus);
      });

    // 2. Open 3-dot menu
    cy.get('button[aria-label="More Row actions"]').click({ force: true });
    cy.wait(500);

    // const activateUser = /^(Aktivieren|Activate)$/i; // Matches exact "Aktivieren" or "Activate"
    // const deactivateUser = /^(Deaktivieren|Deactivate)$/i; // Matches exact "Deaktivieren" or "Deactivate"

    // // Get the button and check its text
    // cy.get('.MuiListItemText-root>span')
    //   .should('be.visible') // Ensure the button is visible
    //   .invoke('text') // Get the text of the button
    //   .then((text) => {
    //     const trimmedText = text.trim(); // Remove any extra spaces from the text
    //     if (activateUser.test(trimmedText)) {
    //       cy.log('Activating user...');
    //       cy.get('.MuiListItemText-root>span') // Find the button again using the correct selector
    //         .contains(activateUser) // Match "Aktivieren" or "Activate"
    //         .click({ force: true }); // Force the click to happen
    //     } else if (deactivateUser.test(trimmedText)) {
    //       cy.log('Deactivating user...');
    //       cy.get('.MuiListItemText-root>span') // Find the button again using the correct selector
    //         .contains(deactivateUser) // Match "Deaktivieren" or "Deactivate"
    //         .click({ force: true }); // Force the click to happen
    //     } else {
    //       cy.log('Unexpected button state: ' + trimmedText); // Log if an unexpected state occurs
    //     }
    //   });

    cy.get('li .MuiListItemText-root > span')
      .filter(':visible') // only visible elements
      .then(($spans) => {
        const texts = [...$spans].map((el) => el.innerText.trim());
        cy.log('Extracted texts: ' + texts.join(', '));

        // Example: use the texts
        texts.forEach((t) => {
          if (/Aktivieren|Activate/i.test(t)) {
            cy.log('Found Activate button: ' + t);
          } else if (/Deaktivieren|Deactivate/i.test(t)) {
            cy.log('Found Deactivate button: ' + t);
          }
        });
      });

    //********************************************************************************** */

    // cy.get('li .MuiListItemText-root > span')
    //   .filter(':visible') // only visible menu options
    //   .then(($buttons) => {
    //     const count = $buttons.length;
    //     cy.log('Number of visible menu buttons:', count);

    //     // Store texts in array
    //     let buttonTexts = [];

    //     cy.wrap($buttons)
    //       .each(($el, index) => {
    //         buttonTexts[index] = $el.innerText.trim();
    //         cy.log(`Button ${index}:`, buttonTexts[index]);
    //       })

    //       // Validate text count & content
    //       .then(() => {
    //         for (let i = 0; i < count; i++) {
    //           cy.get('li .MuiListItemText-root > span')
    //             .filter(':visible')
    //             .eq(i)
    //             .invoke('text')
    //             .then((txt) => {
    //               const trimmed = txt.trim();
    //               expect(trimmed).to.eq(buttonTexts[i]);
    //               cy.log('Validated button text:', trimmed);
    //             });
    //         }
    //       });
    //   });

    const activateUser = /^(Aktivieren|Activate)$/i; // Matches exact "Aktivieren" or "Activate"
    const deactivateUser = /^(Deaktivieren|Deactivate)$/i; // Matches exact "Deaktivieren" or "Deactivate"

    //Get total number of inputfields labels, and his validate txt
    cy.get('li > .MuiListItemText-root')
      .find('span')
      .then((inputFieldLabel) => {
        //Get total number of inputfields labels
        const listingCount = Cypress.$(inputFieldLabel).length;
        expect(inputFieldLabel).to.have.length(listingCount);
        cy.log('number of buttons: ', listingCount); //Optional
        //Get txt of inputfields labels, and validate it
        let labeName = [];
        cy.get('li> .MuiListItemText-root > span')
          .each(($el, index, $list) => {
            labeName[index] = $el.text(); //Get labele text for each element
            cy.log('Button title', labeName[index]); //Optional
          })
          //Validating name of input field labels
          .then(() => {
            for (let index = 0; index < listingCount; index++) {
              cy.get('li .MuiListItemText-root > span')
                .eq(index)
                .invoke('text')
                .as('labels');
              cy.get('@labels').should('include', labeName[index]); //Validate name of input field label
              cy.log('inputfields label', labeName[index]);
              // Check for Deactivate first
              if (deactivateUser.test(labeName[index] + 1)) {
                cy.log(`Clicking DEACTIVATE: ${labeName[index]}`);
                cy.wait(500);
                cy.get('.MuiListItemText-root>span')
                  .eq(index)
                  .invoke(
                    'attr',
                    'style',
                    'border: 2px solid black; padding: 2px;'
                  ) // highlight element
                  .wait(1500)
                  .pause()
                  .click({ force: true });
                return; // stop after click
              } else if (activateUser.test(labeName[index])) {
                cy.log(`Clicking ACTIVATE: ${labeName[index] + 1}`);
                cy.wait(500);
                cy.get('.MuiListItemText-root>span')
                  .eq(index)
                  .invoke(
                    'attr',
                    'style',
                    'border: 2px solid black; padding: 2px;'
                  ) // highlight element
                  .wait(1500)
                  .pause()
                  .click({ force: true });
                return; // stop after click
              }
            }
          });

        // .then(() => {
        //   // ---- CLICK CHECK ----

        //   // Check for Deactivate first
        //   if (deactivateUser.test(text)) {
        //     cy.log(`Clicking DEACTIVATE: ${text}`);
        //     cy.get('li .MuiListItemText-root').eq(i).click({ force: true });
        //     return; // stop after click
        //   }

        //   // Then check for Activate
        //   if (activateUser.test(text)) {
        //     cy.log(`Clicking ACTIVATE: ${text}`);
        //     cy.get('li .MuiListItemText-root').eq(i).click({ force: true });
        //     return; // stop after click
        //   }
        //   //   }//end for
        // });
      });

    // //******************************************************************************* */

    cy.wait(3000);
  }); //End IT

  // it('DH - Check If Reset Password - from Persons table is hidden, after Disabling user', () => {
  //   // Visit AUT
  //   cy.visit(Cypress.env('dh_baseUrl'));
  //   cy.url().should('include', Cypress.env('dh_baseUrl'));
  //   cy.wait(1500);

  //   // Remove Cookie dialog if present
  //   cy.get('body').then(($body) => {
  //     if ($body.find('#onetrust-policy-title').length) {
  //       cy.get('#onetrust-accept-btn-handler').click({ force: true });
  //     } else {
  //       cy.log('Cookie bar not visible');
  //     }
  //   });
  //   cy.wait(1500);

  //   // Intercept backend call after login
  //   cy.intercept('GET', '**/generalInfo').as('generalInfo');

  //   // Login Dummy button
  //   cy.get('button[id=":r2:"]').contains('Login Dummy').click();
  //   cy.wait(2000);

  //   // Wait & Assert response
  //   cy.wait('@generalInfo', { timeout: 15000 }).then((interception) => {
  //     expect(interception.response.statusCode).to.eq(200);
  //     cy.log('Login successful, generalInfo loaded');
  //   });

  //   cy.url().should('include', `${Cypress.env('dh_baseUrl')}home/persons`);
  //   cy.wait(1000);

  //   //Select Company
  //   const companyName = Cypress.env('company').toLowerCase();

  //   // Open the dropdown
  //   cy.get('div[role="combobox"]').click({ force: true });

  //   // Find and click the matching option (ignore case)
  //   cy.get('ul[aria-labelledby=":r5:-label"] > li > span')
  //     .should('be.visible')
  //     .each(($el) => {
  //       const text = $el.text().trim().toLowerCase();

  //       if (text === companyName) {
  //         cy.wrap($el).click({ force: true });
  //       }
  //     });

  //   // Get user test data from cypress.config.js
  //   const user = Cypress.env('createUser')[0];
  //   cy.wait(1500);

  //   //Search for user by username
  //   cy.get('input[placeholder="Benutzername"]').type(user.username);
  //   cy.wait(1000);

  //   //Scroll UP
  //   cy.window().then((win) => {
  //     win.scrollTo({ top: 0, behavior: 'smooth' });
  //   });
  //   cy.wait(500);

  //   // Open 3-dot menu
  //   cy.get('button[aria-label="More Row actions"]').click({ force: true });
  //   cy.wait(1000);

  //   // // Target the "Bearbeiten" button
  //   // cy.get('ul[role="menu"] > li:nth-of-type(5) > div:nth-of-type(2) > span')
  //   //   .should('be.visible')
  //   //   .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
  //   //   .wait(1000)
  //   //   .contains(/Passwort zurücksetzen|Passwort zurücksetzen/i) // DE + EN
  //   //   .click();

  //   cy.pause();

  //   cy.wait(3000);
  // }); //End IT

  it('DH - Crete User from CSV file', () => {
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

    //Select Company
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

    // Click "Create new person"
    cy.get('.linkbtn--secondary>div:nth-of-type(1)')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
      .wait(1000);
    cy.contains('button', /^(CSV Anlage\/Update|Create\/Update)$/i).click();

    cy.wait(500);

    // Validate Title of Create User via CSV dialog
    cy.get('.e6eoyw325>h1')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/CSV Import|CSV Import/);
      });

    cy.wait(500);

    // Validate subtitle
    cy.get('.e6eoyw324')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Wählen Sie eine CSV-Datei aus, um mehrere Benutzer gleichzeitig anzulegen|Wählen Sie eine CSV-Datei aus, um mehrere Benutzer gleichzeitig anzulegen/
        );
      });

    cy.wait(1500);
    cy.DHupdateExistingUser_viaCSV();
    cy.wait(2500);

    cy.intercept('POST', '**/person/uploadCsv').as('uploadCSV');

    // Click on Create/Update button (multi-language support)
    cy.get('main[role="main"] > nav > button')
      .contains(/Anzlegen\/Updaten|Create\/Update/i)
      .click();

    // Wait for request & assert
    cy.wait('@uploadCSV', { timeout: 15000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('Successful import');
    });

    // Validate CSV import user dialog with support for both EN and DE versions
    cy.get('div[role="dialog"] > div:nth-child(1) > h4')
      .should('be.visible') // Ensure the dialog title is visible
      .invoke('text') // Get the text content of the h4 element
      .then((text) => {
        const trimmedText = text.trim(); // Trim any leading/trailing whitespace
        // Validate that the text matches either the German or English version
        expect(trimmedText).to.match(
          /CSV Import Ergebnis|CSV Import Ergebnis/i
        ); // Case-insensitive match
      });

    cy.wait(500);

    //Validate CSV import user dialog
    cy.get('div[role="dialog"]>div:nth-child(2)>div>div>div>span')
      .should('be.visible') // Ensure the dialog title is visible
      .invoke('text') // Get the text content of the h4 element
      .then((text) => {
        const trimmedText = text.trim(); // Trim any leading/trailing whitespace
        // Validate that the text matches either the German or English version
        expect(trimmedText).to.match(
          /Versucht 1 nicht existierenden Benutzer zu aktualisieren|Versucht 1 nicht existierenden Benutzer zu aktualisieren/i
        ); // Case-insensitive match
      });

    cy.wait(1500);

    //Close button
    cy.get('    div[role="dialog"]>div:nth-child(3)>button>div')
      .should('be.visible')
      .wait(1000)
      .contains(/OK|OK/i) // DE + EN
      .click();

    cy.wait(1500);

    // Click "Create new person"
    cy.get('.linkbtn--secondary>div:nth-of-type(1)')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
      .wait(1000);
    cy.contains('button', /^(CSV Anlage\/Update|Create\/Update)$/i).click();

    cy.wait(500);

    // Validate Title of Create User via CSV dialog
    cy.get('.e6eoyw325>h1')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/CSV Import|CSV Import/);
      });

    cy.wait(500);

    //Upload noexisting User via CSV
    cy.DHupload305Dictionary();
    cy.wait(2500);
    //Validate Error message
    cy.get('.e6eoyw313>span')
      .should('be.visible')
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Das Dateiformat wird nicht unterstützt|Das Dateiformat wird nicht unterstützt/
        );
      });
    cy.wait(2500);

    //Click on Delete document - for deletioon of already uploaded document
    cy.get('.e6eoyw311>svg').click();
    cy.wait(1500);

    cy.DHcreateNewUser_viaCSV();
    cy.wait(2500);

    //select Company prefix
    cy.get('.e6eoyw30>div>div>div[aria-haspopup="listbox"]').click({
      force: true,
    });
    cy.wait(1000);
    //cy.get("ul[role='listbox'] > li:nth-of-type(1)").click({ force: true });
    cy.get("ul[role='listbox'] > li")
      .should('be.visible')
      .each(($el) => {
        const text = $el.text().trim().toLowerCase();
        cy.log('***************************', text);

        if (text === 'aqua - aqua') {
          cy.wrap($el).click({ force: true });
        }
      });

    cy.wait(1500);

    //Click on Create/Update button
    cy.get('main[role="main"] > nav > button')
      .contains(/Anzlegen\/Updaten|Create\/Update/i) // Regex to match both texts
      .click();

    //cy.get('.e6eoyw38>.linkbtn--primary').click({ force: true });

    // Validate CSV import user dialog with support for both EN and DE versions
    cy.get('div[role="dialog"] > div:nth-child(1) > h4')
      .should('be.visible') // Ensure the dialog title is visible
      .invoke('text') // Get the text content of the h4 element
      .then((text) => {
        const trimmedText = text.trim(); // Trim any leading/trailing whitespace
        // Validate that the text matches either the German or English version
        expect(trimmedText).to.match(
          /CSV Import Ergebnis|CSV Import Ergebnis/i
        ); // Case-insensitive match
      });

    cy.wait(500);

    //Validate CSV import user dialog
    cy.get('div[role="dialog"]>div:nth-child(2)>div>div>div>span')
      .should('be.visible') // Ensure the dialog title is visible
      .invoke('text') // Get the text content of the h4 element
      .then((text) => {
        const trimmedText = text.trim(); // Trim any leading/trailing whitespace
        // Validate that the text matches either the German or English version
        expect(trimmedText).to.match(
          /1 Benutzer wurde erstellt|1 Benutzer wurde erstellt/i
        ); // Case-insensitive match
      });

    cy.wait(1500);

    //Close button
    cy.get('    div[role="dialog"]>div:nth-child(3)>button>div')
      .should('be.visible')
      .wait(1000)
      .contains(/OK|OK/i) // DE + EN
      .click();
  }); //End IT

  it('DH - Update existing CSV user', () => {
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

    //Select Company
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

    // Click "Create new person"
    cy.get('.linkbtn--secondary>div:nth-of-type(1)')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
      .wait(1000);
    cy.contains('button', /^(CSV Anlage\/Update|Create\/Update)$/i).click();

    cy.wait(500);

    // Validate Title of Create User via CSV dialog
    cy.get('.e6eoyw325>h1')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/CSV Import|CSV Import/);
      });

    cy.wait(1500);
    //Update Users data
    cy.DHupdateExistingUser_viaCSV();

    //select Company prefix
    cy.get('.e6eoyw30>div>div>div[aria-haspopup="listbox"]').click({
      force: true,
    });
    cy.wait(1000);
    //cy.get("ul[role='listbox'] > li:nth-of-type(1)").click({ force: true });
    cy.get("ul[role='listbox'] > li")
      .should('be.visible')
      .each(($el) => {
        const text = $el.text().trim().toLowerCase();
        cy.log('***************************', text);

        if (text === 'aqua - aqua') {
          cy.wrap($el).click({ force: true });
        }
      });

    cy.wait(1500);

    //Click on Create/Update button
    cy.get('.e6eoyw38>.linkbtn--primary').click({ force: true });

    // Validate CSV import user dialog with support for both EN and DE versions
    cy.get('div[role="dialog"] > div:nth-child(1) > h4')
      .should('be.visible') // Ensure the dialog title is visible
      .invoke('text') // Get the text content of the h4 element
      .then((text) => {
        const trimmedText = text.trim(); // Trim any leading/trailing whitespace
        // Validate that the text matches either the German or English version
        expect(trimmedText).to.match(
          /CSV Import Ergebnis|CSV Import Ergebnis/i
        ); // Case-insensitive match
      });

    cy.wait(500);

    //Validate CSV import user dialog
    cy.get('div[role="dialog"]>div:nth-child(2)>div>div>div>span')
      .should('be.visible') // Ensure the dialog title is visible
      .invoke('text') // Get the text content of the h4 element
      .then((text) => {
        const trimmedText = text.trim(); // Trim any leading/trailing whitespace
        // Validate that the text matches either the German or English version
        expect(trimmedText).to.match(
          /1 Benutzer wurde aktualisiert|1 Benutzer wurde aktualisiert/i
        ); // Case-insensitive match
      });

    cy.wait(1500);

    //Close button
    cy.get('    div[role="dialog"]>div:nth-child(3)>button>div')
      .should('be.visible')
      .wait(1000)
      .contains(/OK|OK/i) // DE + EN
      .click();
  }); //End IT
});
