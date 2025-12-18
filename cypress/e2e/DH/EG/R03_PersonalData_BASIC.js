///<reference types="cypress" />

describe('Login to DH using keycloak and upload-send PDF dictionary', () => {
  //Try to Create New User when User already exist
  it('DH - Try to Create New User when accountNumber already exist', () => {
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

        if (text === 'aqua - aqua' || text === 'aqua - Aqua') {
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

    cy.wait(3500);
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

        ///person/fromGroup/

        cy.intercept('POST', '**/person/fromGroup/**').as('personFromGroup');
        cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
          .clear()
          .type(userName);
        cy.get('button[type="submit"]').click();
        cy.wait('@personFromGroup', { timeout: 10000 }).then((interception) => {
          expect(interception.response.statusCode).to.eq(200);
          cy.log('Search completed');
        });

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

  //Create New User when SentToPint:true
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
  });

  //Reset Password from Persons table
  it('DH - Reset Password from Persons table', () => {
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

    // Target the "Reset Pass" button

    // Target all visible span elements inside the menu
    cy.get('ul[role="menu"] span')
      .should('be.visible') // Ensure the elements are visible
      .each(($el) => {
        // Iterate through each of the elements
        // Check if the text matches either "Reset password" or "Passwort zurücksetzen"
        if ($el.text().match(/Reset password|Passwort zurücksetzen/i)) {
          // Highlight the element for debugging (optional)
          cy.wrap($el).invoke(
            'attr',
            'style',
            'border: 2px solid black; padding: 2px;'
          );
          cy.wait(2000);
          // Click the element
          cy.wrap($el).click();
        }
      });
    cy.intercept('POST', '**/person/resetPersonPassword').as('resetPassword');
    //Wait & Assert response
    cy.wait('@resetPassword', { timeout: 15000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('Password reset successful');
    });

    cy.wait(3500);
  }); //End IT

  //Edit E-Box user`s data, from Persons table
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

    // //Move filers to right
    // cy.get('div[role="toolbar"]>button:nth-of-type(2)')
    //   .should('be.enabled')
    //   .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
    //   .wait(1500)
    //   .click();
    // cy.wait(1500);

    // //Filter by Status
    // cy.get('button>p')
    //   .should('be.visible')
    //   .contains(/Status|Status/)
    //   .click();
    // cy.wait(2000);

    // // Reset filter
    // cy.get('div[role="toolbar"] > button')
    //   .last()
    //   .should('be.visible')
    //   .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;') // highlight element
    //   .wait(2500)

    //   .click();
    // cy.wait(200);

    // // Re-search user
    // cy.get('input[placeholder="Benutzername"]').clear().type(user.username);
    // cy.wait(1000);

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

    // Target the "Edit" button
    // Target all visible span elements inside the menu
    cy.get('ul[role="menu"] span')
      .should('be.visible') // Ensure the elements are visible
      .each(($el) => {
        // Iterate through each of the elements
        // Check if the text matches either "Edit" or "Bearbeiten"
        if ($el.text().match(/Bearbeiten|Edit/i)) {
          // Highlight the element for debugging (optional)
          cy.wrap($el).invoke(
            'attr',
            'style',
            'border: 2px solid black; padding: 2px;'
          );
          cy.wait(2000);
          // Click the element
          cy.wrap($el).click();
        }
      });

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

    //Save chanages
    cy.get('.linkbtn--primary>div:nth-of-type(1)')
      .contains(/Änderungen speichern|Änderungen speichern/i) // DE + EN
      .click({ force: true });

    cy.wait(3000);
  }); //End IT

  //Targer Activate/Deactivate E-Box user from Persons table
  it('DH - Targer Activate/Deactivate E-Box user from Persons table', () => {
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
    cy.wait(1000);

    // Define regex patterns for activate/deactivate buttons
    const activateUser = /^(Aktivieren|Activate)$/i;
    const deactivateUser = /^(Deaktivieren|Deactivate)$/i;

    // Find and click the Activate or Deactivate button
    cy.get('ul[role="menu"] li .MuiListItemText-root > span')
      .filter(':visible')
      .each(($el, index) => {
        const buttonText = $el.text().trim();
        cy.log(`Menu button ${index}: "${buttonText}"`);

        // Check for Deactivate button (user is currently active)
        if (deactivateUser.test(buttonText)) {
          cy.log(
            `Found DEACTIVATE button: "${buttonText}" - User is currently Active`
          );
          cy.wrap($el)
            .invoke('attr', 'style', 'border: 2px solid red; padding: 2px;')
            .wait(1500)
            .click({ force: true });
          return false; // stop the .each() loop
        }

        // Check for Activate button (user is currently inactive)
        if (activateUser.test(buttonText)) {
          cy.log(
            `Found ACTIVATE button: "${buttonText}" - User is currently Inactive`
          );
          cy.wrap($el)
            .invoke('attr', 'style', 'border: 2px solid green; padding: 2px;')
            .wait(1500)
            .click({ force: true });
          return false; // stop the .each() loop
        }
      });

    cy.wait(3000);
  }); //End IT

  //Assign user to another company

  it('DH - Assign user to another company', () => {
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

    // Target the "Firmen" button
    // Target all visible span elements inside the menu
    cy.get('ul[role="menu"] span')
      .should('be.visible') // Ensure the elements are visible
      .each(($el) => {
        // Iterate through each of the elements
        // Check if the text matches either "Company" or "Firmen"
        if ($el.text().match(/Firmen|Firmen/i)) {
          // Highlight the element for debugging (optional)
          cy.wrap($el).invoke(
            'attr',
            'style',
            'border: 2px solid black; padding: 2px;'
          );
          cy.wait(2000);
          // Click the element
          cy.wrap($el).click();
        }
      });

    cy.wait(3500);

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

    cy.wait(2000);
    // Get user test data from cypress.config.js
    // const user1 = Cypress.env('createUser')[0];
    cy.get('input[placeholder="Firmenspezifische Benutzer ID"]').type(
      user.username
    );
    cy.wait(1000);

    // Target the "Übernahmen" button
    // Target all visible span elements inside the menu
    cy.get('.linkbtn--primary>div')
      .should('be.visible') // Ensure the elements are visible
      .each(($el) => {
        // Iterate through each of the elements
        // Check if the text matches either "Übernahmen" or "Übernahmen"
        if ($el.text().match(/Übernahmen|Übernahmen/i)) {
          // Highlight the element for debugging (optional)
          cy.wrap($el).invoke(
            'attr',
            'style',
            'border: 2px solid black; padding: 2px;'
          );
          cy.wait(2000);
          // Click the element
          cy.wrap($el).click();
        }
      });

    cy.wait(3500);
  }); //End IT

  //Remove user from company
  it('DH - Remove user from company', () => {
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

    // Target the "Firmen" button
    // Target all visible span elements inside the menu
    cy.get('ul[role="menu"] span')
      .should('be.visible') // Ensure the elements are visible
      .each(($el) => {
        // Iterate through each of the elements
        // Check if the text matches either "Company" or "Firmen"
        if ($el.text().match(/Firmen|Firmen/i)) {
          // Highlight the element for debugging (optional)
          cy.wrap($el).invoke(
            'attr',
            'style',
            'border: 2px solid black; padding: 2px;'
          );
          cy.wait(2000);
          // Click the element
          cy.wrap($el).click();
        }
      });
    cy.wait(2000);
    const companiesToUnassign = ['ABBA']; // List of companies to unassign

    companiesToUnassign.forEach((company) => {
      // Locate the row containing the company name and uncheck the checkbox inside the row
      cy.get('tbody > tr') // Get all rows in the table
        .contains(company) // Find the row that contains the company name
        .parent() // Get the parent <tr> of the row containing the company name
        .find('td') // Find all <td> in the row
        .eq(0) // Assuming the checkbox is in the first <td>, adjust index if needed
        .find('span > input[type="checkbox"]') // Locate the checkbox inside <span>
        .then(($checkbox) => {
          // If the checkbox is checked, uncheck it
          if ($checkbox.prop('checked')) {
            cy.wrap($checkbox).click({ force: true }); // Uncheck the checkbox
            cy.log(`Checkbox for ${company} was checked, now unchecked`);
          } else {
            cy.log(`Checkbox for ${company} is already unchecked`);
          }
        });
    });
    cy.wait(1500);
    // Target the "Übernahmen" button
    // Target all visible span elements inside the menu
    cy.get('.linkbtn--primary>div')
      .should('be.visible') // Ensure the elements are visible
      .each(($el) => {
        // Iterate through each of the elements
        // Check if the text matches either "Übernahmen" or "Übernahmen"
        if ($el.text().match(/Übernahmen|Übernahmen/i)) {
          // Highlight the element for debugging (optional)
          cy.wrap($el).invoke(
            'attr',
            'style',
            'border: 2px solid black; padding: 2px;'
          );
          cy.wait(2000);
          // Click the element
          cy.wrap($el).click();
        }
      });

    cy.wait(2500);

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

  //Delete already created user
  it('Delete already created user', () => {
    const user = Cypress.env('createUser')[0];
    cy.loginToSupportViewMaster();
    cy.wait(3500);

    // Remove pop up if exists
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(1500);

    // Search for Group by Display Name
    cy.get('#searchButton>span').click();
    const companyName = Cypress.env('company');
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(1)
      .type(companyName);
    cy.get('.search-dialog>form>div>.mat-primary').click();

    // Switch to user section
    cy.get('.action-buttons > .mdc-button').eq(4).click();

    // Array of users to delete
    const usersToDelete = ['ottoTestuser']; // Add more usernames as needed

    usersToDelete.forEach((userName) => {
      const searchAndDeleteUser = (userName) => {
        cy.get('.search-label').click();

        // Search for the user
        cy.intercept('POST', '**/person/fromGroup/**').as('personFromGroup');
        cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
          .clear()
          .type(userName);
        cy.get('button[type="submit"]').click();
        cy.wait('@personFromGroup', { timeout: 10000 }).then((interception) => {
          expect(interception.response.statusCode).to.eq(200);
          cy.log('Search completed');
        });

        // Wait for the search results
        cy.wait(2000);

        // Check results
        cy.get('body').then(($body) => {
          if ($body.find('.cdk-row').length === 0) {
            cy.log(`User ${userName} not found or already deleted.`);
            // Close search dialog if needed
            cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click({
              force: true,
            });
          } else {
            // User exists -> proceed with deletion
            cy.get('.cdk-row').should('exist');
            cy.log(`User ${userName} found. Proceeding with deletion.`);

            cy.contains('button', /Delete|DSGVO-Löschung/)
              .should('be.visible')
              .click();

            cy.get('.confirm-buttons > button')
              .contains(/YES|JA/)
              .should('be.visible')
              .click();

            cy.log(`User ${userName} has been deleted.`);
          }
        });
      };

      cy.wait(1500);
      searchAndDeleteUser(userName);
      cy.wait(1000);
    });

    // Logout
    cy.get('.logout-icon').click();
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl'));
    cy.log('The tests have been completed successfully.');
  });

  //Crete User from CSV file
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

  //Update existing CSV user
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

  //Switch to ebox using magiclink
  it.skip('DH - Switch to ebox using magiclink', () => {
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

    // Intercept any API calls that might return magic link
    cy.intercept('**/magic-link**').as('magicLinkAPI');
    cy.intercept('**/magicLink**').as('magicLinkAPI2');
    cy.intercept('GET', '**/ebox/**').as('eboxAPI');

    // Open 3-dot menu
    cy.get('button[aria-label="More Row actions"]').click({ force: true });
    cy.wait(1000);

    // Get the menu item and check its properties
    cy.get('ul[role="menu"] span')
      .contains(/Ebox öffnen|Open Ebox/i)
      .should('be.visible')
      .then(($span) => {
        // Log all parent elements to understand structure
        cy.log('🔍 Menu item structure:');
        let $current = $span;
        for (let i = 0; i < 5; i++) {
          $current = $current.parent();
          cy.log(`Level ${i}:`, $current[0]?.outerHTML?.substring(0, 200));

          // Check for any event listeners or data
          const allAttributes = {};
          Array.from($current[0]?.attributes || []).forEach((attr) => {
            allAttributes[attr.name] = attr.value;
          });
          cy.log(`Attributes:`, allAttributes);
        }
      });

    // Try removing target="_blank" if it exists and click
    cy.get('ul[role="menu"] span')
      .contains(/Ebox öffnen|Open Ebox/i)
      .parents('li')
      .first()
      .then(($li) => {
        // Remove any target="_blank" attributes
        $li.find('*').removeAttr('target');
        $li.removeAttr('target');

        // Try to find and click
        cy.wrap($li)
          .find('span')
          .contains(/Ebox öffnen|Open Ebox/i)
          .click({ force: true });
      });

    // Check if any API was called with magic link
    cy.wait(3000).then(() => {
      // Try to get magic link from intercepted requests
      cy.get('@magicLinkAPI.all').then((interceptions) => {
        if (interceptions && interceptions.length > 0) {
          cy.log('📡 Magic Link API was called:', interceptions);
        }
      });
      cy.get('@magicLinkAPI2.all').then((interceptions) => {
        if (interceptions && interceptions.length > 0) {
          cy.log('📡 Magic Link API2 was called:', interceptions);
        }
      });
    });

    // Check if URL changed (maybe it navigated)
    cy.url({ timeout: 10000 }).then((url) => {
      cy.log(`Current URL: ${url}`);
      if (url.includes('magic-link?session=')) {
        // Extract and validate the session token
        const urlObj = new URL(url);
        const sessionToken = urlObj.searchParams.get('session');
        cy.log(`🔑 Session Token: ${sessionToken}`);

        // Validate token format
        expect(sessionToken, 'Session token should exist').to.exist;
        expect(
          sessionToken,
          'Token length should be > 20'
        ).to.have.length.greaterThan(20);
        expect(sessionToken, 'Token should be alphanumeric').to.match(
          /^[A-Za-z0-9]+$/
        );

        cy.log('Successfully navigated to user inbox via magic link');
      } else {
        cy.log(
          'URL did not change to magic link. Need to investigate further.'
        );
      }
    });

    cy.wait(2000);
  }); //End IT
});
