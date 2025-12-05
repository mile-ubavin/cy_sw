import 'cypress-iframe';
describe('Send welcome mail via post/EinfachBrief', () => {
  // Masteruser user, can enable/disable Activate Einfach Brief on company
  it('Masteruser user, can enable Activate Einfach Brief on company', () => {
    cy.loginToSupportViewMaster(); // Login as a master user
    cy.wait(1500);

    //Remove pop up
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(1500);

    // Search for Group section
    cy.get('#searchButton>span').click(); // Click on the search button

    // Search for Group by Display Name using the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(0)
      .type(Cypress.env('company')); // Use the company name from the cypress.config.js
    cy.wait(1500);

    // Find and click the search button
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    cy.get('.mdc-button__label')
      .contains(/Edit|Bearbeiten/i)
      .should('be.visible')
      .click();

    cy.wait(1500);
    //Scroll to the botton
    cy.get('.mat-mdc-dialog-content').scrollTo('bottom');
    cy.wait(1500);

    //Check checkbox
    cy.get(
      '.einfach-brief-group>.checkbox-wrapper>input[formcontrolname="einfachBriefEnabled"]'
    ).then(($checkbox) => {
      if (!$checkbox.is(':checked')) {
        // If the checkbox is not checked, enable it
        cy.get('input[formcontrolname="einfachBriefEnabled"]').check();
        cy.log('Checkbox was not enabled, now enabled.');

        //Enter random INVALID SAP number
        const generateInvalidPostSAPNumber = () => {
          const randomNumber = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
          return `INVALID-${randomNumber}`;
        };

        const invalidPostSAPNumber = generateInvalidPostSAPNumber();
        cy.log(`Generated Post-SAP-Number: ${invalidPostSAPNumber}`);

        cy.get('input[formcontrolname="postSapNumber"]')
          .clear()
          .type(invalidPostSAPNumber);

        //Check error message
        cy.get('mat-error')
          .should('be.visible')
          .invoke('text')
          .then((text) => {
            const trimmedText = text.trim();
            expect(trimmedText).to.match(
              /Debitors number must have 10 numbers|Pist SAP Nummer muss 10 Ziffern haben/
            );
          });
        //Save button should be disabled
        cy.get('button[type="submit"]').should('be.disabled');
        cy.wait(1500);

        //Enter valid Post-Sap number
        const postSAPNumber = Math.floor(
          1000000000 + Math.random() * 9000000000
        ); // 10-digit random number

        cy.log(`Generated Post-SAP-Number: ${postSAPNumber}`);

        cy.get('input[formcontrolname="postSapNumber"]')
          .clear()
          .type(postSAPNumber);

        //Save button should be enabled
        cy.get('button[type="submit"]').should('be.enabled');
        cy.wait(1500);

        //Confirm editXTenant
        cy.intercept('POST', '**/group/editXTenant').as('editXTenant');
        cy.wait(1000);

        //Save Edit Company dialog
        cy.get('button[type="submit"]').click();

        cy.wait(['@editXTenant'], { timeout: 57000 }).then((interception) => {
          // Assert the response status code
          expect(interception.response.statusCode).to.eq(204);
          cy.wait(2500);
        });
      } else {
        // If the checkbox is already enabled
        cy.log('Checkbox is already enabled.');

        //Close Edit Company dialog
        cy.get('.close[data-mat-icon-name="close"]').click();
      }

      cy.wait(3000);
    });

    // Logout
    cy.get('.logout-icon').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl'));
    cy.log('Test completed successfully.');
    cy.wait(2500);
  }); //end it

  //Enable All Roles, except HR Role
  it('Enable All Roles, except HR Role for Specific Admin', () => {
    // Login as a Master-User using custom command
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

    // Search for Company by Display Name
    cy.get('#searchButton>span').click(); //Click on search button
    cy.wait(1000);
    // Search for Group by Display Name using the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(0)
      .type(Cypress.env('company')); // Use the company name from the cypress.config.js
    cy.wait(1500);
    //Find the Search button by button name and click on it
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    //Click On Admin UserbButton
    cy.get('.mdc-button__label')
      // Find the button containing "Admin User" or "Admin Benutzer" button
      .contains(/Admin User|Admin Benutzer/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    //Search For Admin And Open Role Dialog
    cy.get('.search').click({ force: true });
    //Search for Admin using username
    cy.get('input[formcontrolname="userName"]').type(
      Cypress.env('username_supportViewAdmin')
    );
    // Click on Search for Admin User button
    cy.get('button[type="submit"]').click();
    cy.wait(2000);
    //Click on Role
    cy.get('.mdc-button__label')
      .contains(/Rechte|Rights/i) // Find the button containing "Rechte" or "Rights"
      .should('be.visible')
      .click(); // Click the button

    // Enable All Roles, except HR Role, for specific Admin user
    const rolesToEnable = [
      ['Company Admin', 'Firmen-Administrator'],
      ['Customer Creator', 'Nutzeranlage'],
      ['Data Submitter', 'Versand'],
      ['View E-Box', 'E-Box ansehen'],
      // ['HR Manager', 'HR Manager'],
    ];

    cy.get('.mat-mdc-checkbox > div > .mdc-label')
      .should('exist') // Ensure checkbox labels exist
      .each(($label) => {
        const text = $label.text().trim();

        // Check if text matches any role in either English or German
        if (rolesToEnable.some(([en, de]) => text === en || text === de)) {
          cy.wrap($label)
            .parent()
            .find('input[type="checkbox"]') // Locate the checkbox input
            .then(($checkboxInput) => {
              cy.wrap($checkboxInput)
                .invoke('prop', 'checked')
                .then((isChecked) => {
                  if (!isChecked) {
                    // Enable the role if it's not already checked
                    cy.wrap($checkboxInput).click({ force: true });
                    cy.log(
                      `Checkbox for "${text}" was not enabled; now enabled.`
                    );
                  } else {
                    cy.log(`Checkbox for "${text}" is already enabled.`);
                  }
                });
            });
        }
      });

    cy.wait(1500);

    // Submit the changes
    cy.get('button[type="submit"]').click();
    cy.wait(1500);

    // Verify the success message
    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible') // Ensure it's visible first
      .invoke('text') // Get the text of the element
      .then((snackText) => {
        const trimmedText = snackText.trim();
        expect(trimmedText).to.match(/Rights updated|Rechte aktualisiert/);
      });

    cy.wait(3000);
    // Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url'
    cy.log('Test completed successfully.');
    cy.wait(2500);
  }); //end it

  // Precondition: Search for the user and if user exists, proceed with deletion
  it.only('Search for the user and if user(s) exists, proceed with deletion', () => {
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

  // Admin user, can create e-box users by filling registration form and sent user's credentials to print (einfachBrief)
  it.only('Create 2 Users Manually And Send Credentials To EinfachBrief', () => {
    cy.loginToSupportViewAdmin();
    cy.wait(3500);

    // Remove popup if it appears
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').first().click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });

    cy.wait(1500);

    // Search for Company by Display Name
    cy.get('#searchButton>span').click(); // Click on search button
    cy.wait(1000);

    const companyName = Cypress.env('company');

    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(0)
      .type(companyName);

    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    // Switch to User section
    cy.get('.action-buttons>.mdc-button>.mdc-button__label')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'User' || text === 'Benutzer';
      })
      .first() // click the first matching element
      .click({ force: true });

    // Function to create a user
    function createUser(user) {
      cy.get('button > .mdc-button__label')
        .filter((index, el) => {
          const text = Cypress.$(el).text().trim();
          return text === 'Create/Update' || text === 'Anlegen/Updaten';
        })
        .first()
        .click({ force: true });

      cy.wait(1500);

      cy.get('.create_user_dialog_content>.buttons-wrapper>button')
        .filter((index, el) => {
          const text = Cypress.$(el).text().trim();
          return text === 'Create user manually' || text === 'Manuelle Anlage';
        })
        .first()
        .click();

      cy.get('mat-select[formControlName="salutation"]').click();
      cy.get('mat-option').eq(0).click({ force: true });

      cy.get('input[formcontrolname="firstName"]').type(user.firstName);
      cy.get('input[formcontrolname="lastName"]').type(user.lastName);
      cy.get('input[formcontrolname="email"]').type(user.email);

      cy.get('input')
        .filter((index, input) => {
          const placeholder = Cypress.$(input).attr('placeholder');
          return (
            placeholder &&
            (placeholder.trim() === 'Account Number *' ||
              placeholder.trim() === 'Personalnummer *')
          );
        })
        .first()
        .click()
        .type(user.username);

      cy.get(
        ':nth-child(4) > .mat-mdc-form-field-type-mat-select > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix'
      ).click();
      cy.wait(500);
      cy.get('.mdc-list-item').eq(0).click();

      cy.get('input[formcontrolname="countryCodePhoneNum"]')
        .click({ force: true })
        .type(user.countryCodePhoneNum);
      cy.get('input[formcontrolname="netNumberPhoneNum"]').type(
        user.netNumberPhoneNum
      );
      cy.get('input[formcontrolname="subscriberNumberPhoneNum"]').type(
        user.subscriberNumberPhoneNum
      );

      if (user.streetName) {
        cy.get('input[formcontrolname="streetName"]').type(user.streetName);
        cy.get('input[formcontrolname="streetNumber"]').type(user.streetNumber);
        cy.get('input[formcontrolname="doorNumber"]').type(user.doorNumber);
        cy.get('input[formcontrolname="zipCode"]').type(user.zipCode);
        cy.get('input[formcontrolname="city"]').type(user.city);
      }

      cy.get('input[formcontrolname="prefixedTitle"]').type(user.prefixedTitle);

      cy.get('input[type="checkbox"]').eq(1).click();

      cy.wait(1500);
      cy.get('button[color="primary"]>.mdc-button__label')
        .filter((index, button) => {
          return (
            Cypress.$(button).text().trim() === 'Submit' ||
            Cypress.$(button).text().trim() === 'Absenden'
          );
        })
        .first()
        .click({ force: true });

      cy.wait(1500);
    }

    // Create 1st user
    const firstUser = Cypress.env('createUser')[0];
    createUser(firstUser);

    // Validate Confirm Address dialog for first user
    cy.wait(1500);
    cy.get('send-to-print-promt .ng-star-inserted').then(($elements) => {
      // Extract text content from each element
      const extractedValues = [...$elements].map((el) => el.innerText.trim());
      cy.log('Extracted Values:', extractedValues);

      // Validate extracted text
      expect(extractedValues[0]).to.contain(firstUser.streetName);
      expect(extractedValues[1]).to.contain(firstUser.streetNumber);
      expect(extractedValues[2]).to.contain(firstUser.doorNumber);
      expect(extractedValues[3]).to.contain(firstUser.zipCode);
      expect(extractedValues[4]).to.contain(firstUser.city);
      expect(extractedValues[5]).to.satisfy(
        (value) => value.includes('Austria') || value.includes('Österreich')
      );
    });

    cy.wait(1500);
    cy.intercept('POST', '**/person/editPerson').as('editPerson');

    cy.get('.dialog-actions>button>.title')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Confirm' || text === 'Bestätigen';
      })
      .click();
    cy.wait(1500);

    cy.wait(['@editPerson'], { timeout: 57000 }).then((interception) => {
      // Assert the response status code
      expect(interception.response.statusCode).to.eq(201);
      cy.wait(2500);
    });

    createUser(Cypress.env('createUserNoAddress')[0]);

    cy.wait(1500);
    cy.intercept('POST', '**/person/editPerson').as('editPerson');

    cy.get('.dialog-actions>button>.title')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Confirm' || text === 'Bestätigen';
      })
      .click();
    cy.wait(1500);

    cy.wait(['@editPerson'], { timeout: 57000 }).then((interception) => {
      // Assert the response status code
      expect(interception.response.statusCode).to.eq(201);
      cy.wait(500);

      cy.get('sv-multiple-notifications>.messages>p')
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.be.oneOf([
            'User created',
            'Benutzer angelegt',
          ]);
        });
    });
    // cy.pause();
    // cy.get('sv-multiple-notifications>.messages>p')
    //   .invoke('text')
    //   .then((text) => {
    //     expect(text.trim()).to.be.oneOf(['User created', 'Benutzer angelegt']);
    //   });

    cy.wait(2500);

    // Logout
    cy.get('.logout-icon').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').first().click();
    cy.url().should('include', Cypress.env('baseUrl'));
    cy.wait(1500);
  });

  //Login to einfachBrief and check welcome pdf (OLD VERSION)
  it.skip('Login to einfachBrief and check welcome pdf', () => {
    cy.visit(Cypress.env('tagesBaseUrl'));
    cy.url().should('include', Cypress.env('tagesBaseUrl'));

    cy.wait(1500);

    // Remove Cookie dialog (if shown)
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      } else {
        cy.log('Cookie bar not visible');
      }
    });
    cy.wait(1500);

    // Log in to the sw
    cy.get('tp-input[formcontrolname="username"]').type(
      Cypress.env('email_supportViewAdmin')
    );
    cy.get('tp-input[formcontrolname="password"]').type(
      Cypress.env('password_supportViewAdmin')
    );
    cy.get('button[type="submit"]').click({ force: true });

    cy.wait(1500);

    // Switch to Shopping Card table
    cy.get('.header__navigation-menu>li>a').then(($links) => {
      const linkTexts = [];
      const urls = [];

      // Iterate through each link to extract link text and href
      $links.each((index, link) => {
        linkTexts[index] = Cypress.$(link).text().trim(); // Store link text
        urls[index] = Cypress.$(link).attr('href'); // Store href attribute

        // Log the link text for debugging
        cy.log('Link Text:', linkTexts[index]);
      });

      // Check if "Open Deliveries" or "Open Sendungen" exists and click on it
      const targets = ['Offene Sendungen', 'Open Deliveries'];

      targets.forEach((target) => {
        const index = linkTexts.indexOf(target);
        if (index !== -1) {
          // Click the link if it's found
          cy.get('.header__navigation-menu>li>a').eq(index).click();
        }
        cy.wait(2000);
      });
      //Open latest received item
      cy.get('.table__container>table>tbody>tr>td').then(($cells) => {
        // Create an array to hold the texts from each cell
        const cellTexts = [];

        // Iterate through each cell to extract the text
        $cells.each((index, cell) => {
          const text = Cypress.$(cell).text().trim(); // Get the text and trim whitespace
          cellTexts.push(text); // Store the text in the array
        });

        // Find the index of the first cell that contains 'UserAccount_'
        const targetIndex = cellTexts.findIndex((text) =>
          text.includes('UserAccount_')
        );

        if (targetIndex !== -1) {
          // Click on the first cell that contains 'UserAccount_'
          cy.get('.table__container>table>tbody>tr>td').eq(targetIndex).click();
        }
        cy.wait(1500);

        //Open/Preview selected document
        cy.intercept('POST', '**/getDocumentPreview*').as('previewDoc');

        cy.get(
          '.open > .accordion-container > .table-wrapper > tp-table > .table > .table__container > table > tbody > .table__row>td>.icon-magnify'
        )
          .should('be.visible') // Wait for the element to be visible
          .click({ force: true });

        cy.wait('@previewDoc', { timeout: 57000 }).then((interception) => {
          // Assert the response status code
          expect(interception.response.statusCode).to.eq(200);
          cy.wait(1500);
        });

        //Close document preview dialog
        cy.get(
          ':nth-child(7) > .dialog > .dialog__inner > .dialog__close-button'
        ).click();
      });
      cy.wait(2000);
    });

    // Switch to history table and download the PDF
    cy.get('.header__navigation-menu>li>a')
      .contains(/Auftragsliste|Auftragsliste/)
      .click();
    cy.wait(2000);

    cy.get(
      '.deliveries-list-table>tp-table>.table>.table__container>table>tbody>tr'
    )
      .eq(0)
      .click();
    cy.wait(1500);
    cy.get('.download-container > p > .desktop').first().click({ force: true });
    cy.wait(2000);
    // Get the latest downloaded PDF file
    // const downloadsDir = `${Cypress.config(
    //   'fileServerFolder'
    // )}/cypress/downloads/`;
    // console.log('downloadsDir', downloadsDir);

    // cy.task(
    //   'getDownloadedPdf',
    //   'C:/Users/mubavin/Cypress/EG/cypress-automatison-framework/cypress/downloads'
    // ).then((filePath) => {
    //   expect(filePath).to.not.be.null; // Assert the file exists
    //   cy.log(`Latest PDF File Path: ${filePath}`);
    //   cy.wait(3000);
    //   // Read the PDF content and open in the same tab using a Blob
    //   cy.readFile(filePath, 'binary').then((pdfBinary) => {
    //     const pdfBlob = Cypress.Blob.binaryStringToBlob(
    //       pdfBinary,
    //       'application/pdf'
    //     );
    //     const pdfUrl = URL.createObjectURL(pdfBlob);

    //     // Open the PDF in the same tab
    //     cy.window().then((win) => {
    //       win.location.href = pdfUrl; // Loads the PDF in the same window
    //     });
    //   });
    // });
    // cy.wait(3500);

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
  }); //end it

  //********************NEW EinfachBrief*************************************** */
  //Login to einfachBrief and check welcome pdf
  it.only('Login to einfachBrief and check welcome pdf', () => {
    cy.visit(Cypress.env('tagesBaseUrl'));
    cy.url().should('include', Cypress.env('tagesBaseUrl'));

    cy.wait(1500);

    // Remove Cookie dialog (if shown)
    // cy.get('body').then(($body) => {
    //   if ($body.find('#onetrust-policy-title').is(':visible')) {
    //     cy.get('#onetrust-accept-btn-handler').click({ force: true });
    //   } else {
    //     cy.log('Cookie bar not visible');
    //   }
    // });

    // Remove Cookie dialog if visible
    cy.get('body').then(($body) => {
      const cookieBar = $body.find('#onetrust-policy-title:visible');

      if (cookieBar.length > 0) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
        cy.log('Cookie bar found and removed.');
      } else {
        cy.log('Cookie bar not visible, skipping removal.');
      }
    });
    cy.wait(2500);

    // Log in to the sw
    cy.get('#username').type(Cypress.env('email_supportViewAdmin'));
    cy.get('#password').type(Cypress.env('password_supportViewAdmin'));
    cy.get('button[type="submit"]').click({ force: true });

    cy.wait(1500);

    // Switch to Shopping Card table
    cy.get('.css-i9mkbf>div>button').then(($links) => {
      const linkTexts = [];
      const urls = [];

      // Iterate through each link to extract link text and href
      $links.each((index, link) => {
        linkTexts[index] = Cypress.$(link).text().trim(); // Store link text
        urls[index] = Cypress.$(link).attr('href'); // Store href attribute

        // Log the link text for debugging
        cy.log('Link Text:', linkTexts[index]);
      });

      // Check if "Open Deliveries" or "Open Sendungen" exists and click on it
      const targets = ['Offene Sendungen', 'Open Deliveries'];

      targets.forEach((target) => {
        const index = linkTexts.indexOf(target);
        if (index !== -1) {
          // Click the link if it's found
          cy.get('.css-i9mkbf>div>button').eq(index).click();
        }
        cy.wait(2000);
      });
      //Open latest received item
      cy.get('table>tbody>tr>td').then(($cells) => {
        // Create an array to hold the texts from each cell
        const cellTexts = [];

        // Iterate through each cell to extract the text
        $cells.each((index, cell) => {
          const text = Cypress.$(cell).text().trim(); // Get the text and trim whitespace
          cellTexts.push(text); // Store the text in the array
        });

        // Find the index of the first cell that contains 'UserAccount_'
        const targetIndex = cellTexts.findIndex((text) =>
          text.includes('UserAccount_')
        );

        if (targetIndex !== -1) {
          // Click on the first cell that contains 'UserAccount_'
          cy.get('table>tbody>tr>td').eq(targetIndex).click();
        }
        cy.wait(1500);

        //Open/Preview selected document
        cy.intercept('POST', '**/getDocumentPreview*').as('previewDoc');

        cy.get('.css-17ktzop>span>svg')
          .should('be.visible') // Wait for the element to be visible
          .click({ force: true });

        cy.wait('@previewDoc', { timeout: 57000 }).then((interception) => {
          // Assert the response status code
          expect(interception.response.statusCode).to.eq(200);
          cy.wait(2500);
        });

        //Close document preview dialog
        cy.get('.lg>button').click();
      });
      cy.wait(2000);
    });

    // Switch to history table and download the PDF
    cy.get('.css-i9mkbf>div>button')
      .contains(/Auftragsliste|Auftragsliste/)
      .click();
    cy.wait(2000);

    cy.get('table>tbody>tr').eq(0).click();
    cy.wait(1500);
    // Click on Download button
    cy.get('.css-1xspvtb>img[alt="Download"]').first().click({ force: true });
    cy.wait(2000);

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
  }); //end it
  //**************************END*********************************************** */

  //Login to einfachBrief using keycloack and check welcome pdf
  it.skip(' Login to einfachBrief using keycloack and check welcome pdf', () => {
    cy.visit(Cypress.env('tagesBaseUrl'));
    cy.url().should('include', Cypress.env('tagesBaseUrl'));

    cy.wait(1500);

    // Remove Cookie dialog (if shown)
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      } else {
        cy.log('Cookie bar not visible');
      }
    });
    cy.wait(1500);

    //  Login keycloack
    cy.get('tp-input[formcontrolname="username"]').type(
      Cypress.env('email_supportViewAdmin')
    );
    cy.get('tp-input[formcontrolname="password"]').type(
      Cypress.env('password_supportViewAdmin')
    );
    cy.get('button[type="button"]')
      .contains(/Login keycloack|Login keycloack/)
      .click();

    cy.wait(1500);

    //Switch to Sign in to your account on PBS
    cy.get('#username').type(Cypress.env('email_supportViewAdmin'));

    cy.get('#password').type(Cypress.env('password_supportViewAdmin'));
    cy.get('button[aria-label="Show password"]').click();
    cy.wait(1500);

    //Click on Login button
    cy.get('#kc-login').click();
    cy.wait(3500);

    // Switch to Shopping Card table
    cy.get('.header__navigation-menu>li>a').then(($links) => {
      const linkTexts = [];
      const urls = [];

      // Iterate through each link to extract link text and href
      $links.each((index, link) => {
        linkTexts[index] = Cypress.$(link).text().trim(); // Store link text
        urls[index] = Cypress.$(link).attr('href'); // Store href attribute

        // Log the link text for debugging
        cy.log('Link Text:', linkTexts[index]);
      });

      // Check if "Open Deliveries" or "Open Sendungen" exists and click on it
      const targets = ['Offene Sendungen', 'Open Deliveries'];

      targets.forEach((target) => {
        const index = linkTexts.indexOf(target);
        if (index !== -1) {
          // Click the link if it's found
          cy.get('.header__navigation-menu>li>a').eq(index).click();
        }
        cy.wait(2000);
      });
      //Open latest received item
      cy.get('.table__container>table>tbody>tr>td').then(($cells) => {
        // Create an array to hold the texts from each cell
        const cellTexts = [];

        // Iterate through each cell to extract the text
        $cells.each((index, cell) => {
          const text = Cypress.$(cell).text().trim(); // Get the text and trim whitespace
          cellTexts.push(text); // Store the text in the array
        });

        // Find the index of the first cell that contains 'UserAccount_'
        const targetIndex = cellTexts.findIndex((text) =>
          text.includes('UserAccount_')
        );

        if (targetIndex !== -1) {
          // Click on the first cell that contains 'UserAccount_'
          cy.get('.table__container>table>tbody>tr>td').eq(targetIndex).click();
        }
        cy.wait(1500);

        //Open/Preview selected document
        cy.intercept('POST', '**/getDocumentPreview*').as('previewDoc');

        cy.get(
          '.open > .accordion-container > .table-wrapper > tp-table > .table > .table__container > table > tbody > .table__row>td>.icon-magnify'
        )
          .should('be.visible') // Wait for the element to be visible
          .click({ force: true });

        cy.wait('@previewDoc', { timeout: 57000 }).then((interception) => {
          // Assert the response status code
          expect(interception.response.statusCode).to.eq(200);
          cy.wait(1500);
        });

        //Close document preview dialog
        cy.get(
          ':nth-child(7) > .dialog > .dialog__inner > .dialog__close-button'
        ).click();
      });
      cy.wait(2000);
    });

    // Switch to history table and download the PDF
    cy.get('.header__navigation-menu>li>a')
      .contains(/Auftragsliste|Auftragsliste/)
      .click();
    cy.wait(2000);

    cy.get(
      '.deliveries-list-table>tp-table>.table>.table__container>table>tbody>tr'
    )
      .eq(0)
      .click();
    cy.wait(1500);
    cy.get('.download-container > p > .desktop').first().click({ force: true });
    cy.wait(2000);
    // Get the latest downloaded PDF file
    // const downloadsDir = `${Cypress.config(
    //   'fileServerFolder'
    // )}/cypress/downloads/`;
    // console.log('downloadsDir', downloadsDir);

    // cy.task(
    //   'getDownloadedPdf',
    //   'C:/Users/mubavin/Cypress/EG/cypress-automatison-framework/cypress/downloads'
    // ).then((filePath) => {
    //   expect(filePath).to.not.be.null; // Assert the file exists
    //   cy.log(`Latest PDF File Path: ${filePath}`);
    //   cy.wait(3000);
    //   // Read the PDF content and open in the same tab using a Blob
    //   cy.readFile(filePath, 'binary').then((pdfBinary) => {
    //     const pdfBlob = Cypress.Blob.binaryStringToBlob(
    //       pdfBinary,
    //       'application/pdf'
    //     );
    //     const pdfUrl = URL.createObjectURL(pdfBlob);

    //     // Open the PDF in the same tab
    //     cy.window().then((win) => {
    //       win.location.href = pdfUrl; // Loads the PDF in the same window
    //     });
    //   });
    // });
    // cy.wait(3500);

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
  }); //end it

  //Check Reporting email
  it('Check Reporting email', () => {
    cy.visit('https://yopmail.com/en/');

    // Enter the support admin email
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));

    // Click the refresh button
    cy.get('#refreshbut > .md > .material-icons-outlined').click();

    // Wait for email to load
    cy.wait(4500);

    // Validate email subject
    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .first()
      .should('contain.text', 'Versandreport e-Gehaltszettel Portal');

    // Validate email body
    cy.iframe('#ifmail')
      .find('#mail > div')
      .invoke('text')
      .then((text) => {
        const cleanedText = text.trim();

        const successMessage = `Sie haben 0 Sendung(en) erfolgreich digital in das e-Gehaltszettel Portal Ihrer Benutzer*innen eingeliefert`;
        const postalMessage = `Zusätzlich haben Sie 0 Sendung(en) erfolgreich über den postalischen Weg als Brief versendet. Das Dokument wird von uns über das „Einfach Brief“-Portal gedruckt, kuvertiert und an die Adresse des Benutzers versendet`;

        // Check if inactiveUsers exists and is an array
        let inactiveUsersMessage = '';
        const inactiveUsers = Cypress.env('inactiveUsers');
        if (Array.isArray(inactiveUsers) && inactiveUsers.length > 0) {
          const inactiveUsersList = inactiveUsers.join(', ');
          inactiveUsersMessage = `Folgende Personalnummern sind davon betroffen:\nSystem Biller Id: ${Cypress.env(
            'company'
          )}, Personalnummern: ${inactiveUsersList}`;
        }

        // Assert email contains the expected messages
        expect(
          cleanedText.includes(successMessage) ||
            cleanedText.includes(postalMessage) ||
            cleanedText.includes(inactiveUsersMessage)
        ).to.be.true;

        // Log email content for debugging
        cy.log(`Email Content: ${cleanedText}`);
        if (inactiveUsersMessage) {
          cy.log(`Inactive Users Info Added: ${inactiveUsersMessage}`);
        }
      });
  });

  // The Master user deletes the newly created e-box user
  it('Master user deletes the newly created e-box user', () => {
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

  //Yopmail - Clear inbox
  it('Yopmail - Clear inbox', () => {
    // Visit Yopmail
    cy.visit('https://yopmail.com/en/');

    // Enter the support admin email
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));

    // Click the refresh button
    cy.get('#refreshbut > .md > .material-icons-outlined').click({
      force: true,
    });
    cy.wait(2500);
    // Delete all emails if the button is not disabled
    cy.get('.menu>div>#delall')
      .should('not.be.disabled')
      .click({ force: true });
  });
}); //end describe
