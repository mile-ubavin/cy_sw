describe('HR Prepare document from Mass Upload', () => {
  let uploadDateTime = ''; // Global variable to store upload date & time

  it('Enable hrManagement flag on Company', () => {
    //Import credentials (un/pw) from 'supportView.json' file

    cy.loginToSupportViewMaster();
    cy.wait(1500);

    //Remove pop up dilaog
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(2500);

    //Search for Company by Display Name
    cy.get('#searchButton>span').click(); //Click on search button
    cy.wait(1000);
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      // Use the company name from the cypress.config.js
      const companyName = Cypress.env('company');
      // Search for Group by Display Name using the company name
      cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
        .eq(0)
        .type(companyName);
    });
    //Find the Search button by button name and click on it
    cy.wait(1500);
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    //Switch to user section
    cy.get('.action-buttons > .mdc-button').eq(0).click();
    cy.wait(1500);
    //Scroll to the botton
    cy.get('.mat-mdc-dialog-content').scrollTo('bottom');
    cy.wait(2500);
    //Check checkbox
    cy.get('#hrManagementEnabled').then(($checkbox) => {
      if (!$checkbox.is(':checked')) {
        // If the checkbox is not checked, enable it
        cy.get('#hrManagementEnabled').check();
        cy.log('Checkbox was not enabled, now enabled.');
        //Save Edit Company dialog
        cy.get('button[type="submit"]').click();
      } else {
        // If the checkbox is already enabled
        cy.log('Checkbox is already enabled.');
        cy.get('.close[data-mat-icon-name="close"]').click();
      }
      //Close Edit Company dialog
      cy.wait(2500);
      //Logout
      cy.get('.logout-icon ').click();
      cy.wait(2000);
      cy.get('.confirm-buttons > :nth-child(2)').click();

      cy.log('Test completed successfully.');
      cy.wait(2500);
    }); //end
  }); //end it

  //Disable Company Admin and Customer Creator Roles and Enable HR and View E-Box Roles
  it('Disable Company Admin and Customer Creator Roles and Enable HR and View E-Box Roles', () => {
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
    const companyName = Cypress.env('company');
    // Search for Group by Display Name using the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(0)
      .type(companyName);
    //Find the Search button by button name and click on it
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    // Switch on Admin User page
    cy.get('.mdc-button__label')
      // Find the button containing "Admin User" or "Admin Benutzer" button
      .contains(/Admin User|Admin Benutzer/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    // Switch on Admin user's Role dilaog
    //Search for Aqua Admin
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
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button

    //Disable ViewEbox And DataSubmitter Roles for specific Admin user

    //List of roles to disable
    const rolesToDisable = [
      ['Company Admin', 'Firmen-Administrator'],
      ['Customer Creator', 'Nutzeranlage'],
      ['Data Submitter', 'Versand'],
      // ['View E-Box', 'E-Box ansehen'],
      // ['HR Manager', 'HR Manager'],
    ];

    cy.get('.mat-mdc-checkbox > div > .mdc-label')
      .should('exist') // Ensure checkbox labels exist
      .each(($label) => {
        const text = $label.text().trim();

        // Check if text exists in either English or German in rolesToDisable
        if (rolesToDisable.some(([en, de]) => text === en || text === de)) {
          cy.wrap($label)
            .parent()
            .find('input[type="checkbox"]') // Locate the checkbox input
            .then(($checkboxInput) => {
              cy.wrap($checkboxInput)
                .invoke('prop', 'checked')
                .then((isChecked) => {
                  if (isChecked) {
                    // Disable the role if it is currently checked
                    cy.wrap($checkboxInput).click({ force: true });
                    cy.log(`Checkbox for "${text}" was enabled; now disabled.`);
                  } else {
                    cy.log(`Checkbox for "${text}" is already disabled.`);
                  }
                });
            });
        }
      });
    cy.wait(1500);

    // Enable HR and View E-Box Roles, for specific Admin user
    const rolesToEnable = [
      ['View E-Box', 'E-Box ansehen'],
      ['HR Manager', 'HR Manager'],
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

  //Uplad pdf - From Mass Upload Button
  it('HR Admin can Upload Document From Mass Upload button', () => {
    cy.fixture('supportView.json').as('payslipSW');
    cy.loginToSupportViewAdmin();
    // Wait for login to complete
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

    //Click On Mass Upload Button
    cy.get('.upload__document>.mdc-button__label>.upload__document__text')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Mass Upload' || text === 'Massensendung hochladen';
      })
      .click();

    //Click on Upload Document button if button is visible (When MCA have HR role anabled in min one group)
    cy.get('body').then(($body) => {
      if ($body.find('.buttons-wrapper>button').length > 0) {
        cy.get('.buttons-wrapper>button')
          .filter((index, el) => {
            const text = Cypress.$(el).text().trim();
            return (
              text === 'Prepare Document For Signing' ||
              text === 'Dokument zur Unterzeichnung vorbereiten'
            );
          })
          .click();
        cy.wait(1500);
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(1500);

    //Click on Mass Upload Document button if button is visible (When MCA does not have HR role enable)
    cy.get('body').then(($body) => {
      if ($body.find('.buttons-wrapper>button').length > 0) {
        cy.get('.buttons-wrapper>button')
          .filter((index, el) => {
            const text = Cypress.$(el).text().trim();
            return text === 'Mass Upload' || text === 'Massensendung hochladen';
          })
          .click();
        cy.wait(1500);
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(1500);

    // Upload valid document (1 A4 pdf file)
    cy.massUpload();
    cy.wait(2000);

    // Capture the current date and time in the specified format
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0'); // Ensure two digits
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = now.getFullYear();
    const formattedDate = `${day}.${month}.${year}`; // Ensures dd.mm.yyyy format

    const formattedTime = now
      .toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      .trim(); // Trim to remove leading spaces

    uploadDateTime = `${formattedDate} ${formattedTime}`; // Store the value in a variable
    cy.log(`Upload DateTime: ${uploadDateTime}`); // Log the stored uploadDateTime

    // Add Delivery Title
    const title = `HR Document From MassUpload (pdf) - ${uploadDateTime}`;
    cy.log(`Title for the document: ${title}`); // Log the title to check

    cy.get('input[formcontrolname="subject"]').clear().type(title);
    cy.wait(1500);

    // Select Company
    cy.get('.broadcast-companies').click();
    cy.wait(1000);
    cy.get('mat-option[role="option"]>.mdc-list-item__primary-text').click({
      multiple: true,
    });
    cy.wait(1500);

    const toCompanies = ['AQUA GmbH - AQUA'];
    cy.get('mat-option[role="option"]>.mdc-list-item__primary-text')
      .should('exist') // Ensure checkbox labels exist
      .each(($label) => {
        const text = $label.text().trim();
        if (toCompanies.includes(text)) {
          // Target the specific checkbox
          cy.wrap($label)
            .parent()
            .find('.mdc-list-item__primary-text') // Locate the checkbox input
            .then(($checkboxInput) => {
              if (!$checkboxInput.is(':checked')) {
                // Enable the role if not already checked
                cy.wrap($checkboxInput).click({ force: true });
                cy.log(`Checkbox for "${text}" was not enabled; now enabled.`);
              } else {
                // Role is already enabled
                cy.log(`Checkbox for "${text}" is already enabled.`);
              }
            });
        }
      });

    // Wait for the deselection process to complete
    cy.wait(1000);
    // Focus out
    cy.get('body').type('{esc}');
    cy.wait(1500);

    cy.get('.controls > .ng-star-inserted')
      .contains(/Hybridsign|Senden /i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button

    // //Open init session
    // cy.intercept('GET', '**/assets/maintanance-config/**').as('initSession');
    // //Click on Open Hybridsign button
    // cy.get('.controls > .ng-star-inserted')
    //   .contains(/Hybridsign|Senden /i)
    //   .should('be.visible') // Optional: Ensure the button is visible before interacting
    //   .click(); // Click the button
    // cy.wait(1500);

    // cy.wait(['@initSession'], {
    //   timeout: 27000,
    // }).then((interception) => {
    //   // Assert the response status code
    //   expect(interception.response.statusCode).to.eq(200);
    // });

    //Prepare doc for signing
    cy.get('.controls > .ng-star-inserted').click({ force: true });
    cy.wait(4500);
    cy.get('.signatures-container>.signature-actions>a').click({
      force: true,
    }); //open add new signature dialog
    cy.wait(2000);
    cy.get('input[formcontrolname="signee"]')
      .clear()
      .type('HR Document Signature 1 - Change position of signature dialog'); //Clear Input field & Enter signee name
    //Confirm Signee name

    cy.get('.mat-mdc-dialog-actions>button>.mdc-button__label')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'NEXT' || text === 'WEITER';
      })
      .click({ multiple: true, force: true });
    cy.wait(1500);

    //Change position of siganture dialog
    cy.get('.signature-methods')
      .trigger('mouseover')
      .trigger('mousedown', { which: 1, eventConstructor: 'MouseEvent' })
      .trigger('mousemove', {
        which: 1,
        screenX: 750,
        screenY: 800,
        clientX: 750,
        clientY: 800,
        pageX: 750,
        pageY: 800,
        eventConstructor: 'MouseEvent',
      })
      .trigger('mouseup', { force: true });
    cy.get(
      '.placer-actions > .mat-accent > .mat-mdc-button-touch-target'
    ).click({
      force: true,
    });
    cy.wait(2500);

    //
    cy.intercept(
      'POST',
      '**/deliveryHandler/checkDocumentProcessingStatus**'
    ).as('checkDocumentProcessingStatus');

    //Click on Finalize button   Abschließen
    cy.get('.tempSave>.mdc-button__label')
      .contains(/Finalize|Abschließen/i)
      .click({ force: true }); // Click the button

    // cy.get('.tempSave').click({ force: true });

    cy.wait(['@checkDocumentProcessingStatus'], { timeout: 37000 }).then(
      (interception) => {
        // Log the intercepted response
        cy.log('Intercepted response:', interception.response);

        // Assert the response status code
        expect(interception.response.statusCode).to.eq(200);
      }
    );

    cy.wait(6000);

    cy.get('.dialog-footer>.dialog-actions>button>.title')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Send' || text === 'Senden';
      })
      .click();
    cy.wait(3000);

    cy.get(
      '.mat-mdc-dialog-component-host>.dialog-container>.dialog-footer>.controls>button>.title'
    )
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Confirm' || text === 'Bestätigen';
      })
      .click({ force: true });
    cy.wait(3000);

    // Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url'
    cy.log('Test completed successfully.');
    cy.wait(2500);
  }); //end it

  //Sign HR Delivery
  it('Ebox user signing HR delivery', () => {
    cy.loginToEgEbox();
    cy.wait(2500);
    // Wait for login to complete
    //cy.wait(7500);

    // Assert that the unsigned icon is visible
    cy.get('app-deliveries-signature-actions > .unsigned')
      .first()
      .should('be.visible')
      .then(($icon) => {
        cy.wrap($icon).invoke('css', 'border', '3px solid green');
        cy.log(
          'Validation passed: Unsigned icon is visible and marked in green.'
        );
      });

    cy.wait(3500);

    // Open latest created delivery
    cy.intercept(
      'GET',
      '**/hybridsign/backend_t/document/v1/getDocument/**'
    ).as('getDocument');
    cy.intercept('GET', '**/getIdentifications?**').as('getIdentifications');

    cy.get('.mdc-data-table__content>tr>.subject-sender-cell')
      .eq(0)
      .click({ force: true });

    cy.wait('@getIdentifications', { timeout: 57000 }).then((interception) => {
      cy.log('Intercepted response:', interception.response);
      expect(interception.response.statusCode).to.eq(200);
    });

    // Scroll to the bottom of the PDF viewer or page
    cy.get('.content-container>.scroll-container').eq(1).scrollTo('bottom', {
      duration: 500,
      ensureScrollable: false,
    });

    cy.wait(3500);

    // Loop through all signature buttons
    cy.get('.touch-signature-button').each(($button, index, $list) => {
      cy.wrap($button).click({ force: true });

      // Simulate signing on the canvas
      cy.get('.sign-canvas')
        .trigger('mouseover')
        .trigger('mousedown', { which: 1, eventConstructor: 'MouseEvent' })
        .trigger('mousemove', {
          which: 1,
          screenX: 410,
          screenY: 530,
          clientX: 530,
          clientY: 560,
          pageX: 500,
          pageY: 600,
          eventConstructor: 'MouseEvent',
        });

      cy.get('.sign-canvas').trigger('mouseup', { force: true });

      cy.wait(2000);

      // Confirm the signature
      cy.get(
        '.mat-sign-actions-desktop > .mat-accent > .mat-mdc-button-touch-target'
      ).click({ force: true });

      cy.wait(7000);

      cy.log(`Signature ${index + 1} of ${$list.length} completed.`);
    });

    // Check if the Save button is enabled after all signatures are completed
    cy.get('.save > .mdc-button__label').then(($button) => {
      if (!$button.is(':disabled')) {
        cy.log('All signatures are signed, clicking Save.');
        cy.wait(1500);
        cy.get('.save > .mdc-button__label').click({ force: true });
        cy.wait(4500);
      } else {
        cy.log('Save button is disabled. Ensure all signatures are signed.');
      }
    });

    cy.wait(4500);

    // Assert that the signed icon is visible
    cy.get('app-deliveries-signature-actions > .signed')
      .first()
      .should('be.visible')
      .then(($icon) => {
        cy.wrap($icon).invoke('css', 'border', '3px solid green');
        cy.log(
          'Validation passed: Signed icon is visible and marked in green.'
        );
      });

    cy.wait(3500);

    // Logout
    cy.get('.user-title').click();
    cy.wait(1500);
    cy.get('.logout-title > a').click();
    cy.url().should('include', Cypress.env('baseUrl_egEbox'));

    cy.log('Test completed successfully.');
  });

  // Admin User is able to check new HR Delivery received in HR page
  it('Admin User checks new delivery received in the HR page in SW', () => {
    cy.loginToSupportViewAdmin();
    // Wait for login to complete
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

    //Switch to HR page - Check new  deliverry in hr page
    const collectedLinkTexts = []; // Array to store all link texts

    cy.get('.side-menu>ul>navigation-item>.navigation-item>a')
      .find('.user-label-wrap')
      .each(($el) => {
        cy.wrap($el)
          .invoke('text')
          .then((text) => {
            collectedLinkTexts.push(text.trim()); // Collect each link text in the array
            cy.log('Collected Link Text:', text.trim());
          });
      })
      .wait(2500)
      .then(() => {
        // After collecting all link texts, perform a single check
        const hasAccessToHRPage = collectedLinkTexts.some((text) =>
          ['Erhaltene Sendungen', 'Received Shipments'].includes(text)
        );
        //Check if Admin has access to HR page in SW
        if (hasAccessToHRPage) {
          // Find the specific elements and check their visibility
          cy.get('.side-menu>ul>navigation-item>.navigation-item>a')
            .contains(/Erhaltene Sendungen|Received Shipments/)
            .should('be.visible')
            .click();
          cy.log('Confirmed: HR page link is visible to the Admin.'); // Log if HR page access is detected
          cy.wait(2500);
        } else {
          // Verify that elements with specified texts are not visible
          cy.get('.side-menu>ul>navigation-item>.navigation-item>a')
            .contains(/Erhaltene Sendungen|Received Shipments/)
            .should('not.exist');
          cy.log('Confirmed: HR page link is not visible to the Admin.'); // Log if HR page access is not detected
          cy.wait(2500);
        }
      });

    // Search for user using accountNumber
    cy.get('#searchButton>span').click(); // Click on the search button

    // Search for user which send HR delivery, using accountNumber and company
    cy.get('input[name="accountNumber"]').type(
      Cypress.env('accountNumber_egEbox')
    ); // Use company name from Cypress config
    cy.wait(500);
    // Use the company name from the cypress.config.js

    cy.get('input[name="companyName"]').type(Cypress.env('company')); // Use company name from Cypress config
    cy.wait(1500);

    // Click the search button
    cy.get('button[color="primary"]').click();
    cy.wait(1500);

    //Click on magic link button
    cy.wait(3000);
    cy.get('.action-buttons>button>.mdc-button__label')
      .parent()
      //.invoke('removeAttr', 'target') // Remove target="_blank"
      .click({ force: true });

    // Prevent opening (e-Box) in new tab
    cy.intercept('POST', '/supportView/v1/person/magicLink/createByGroup', {
      statusCode: 200,
    }).as('magicLinkRequest');
    cy.window().then((win) => {
      cy.stub(win, 'open')
        .callsFake((url) => {
          // Simulate navigation in the same tab by changing the window location
          win.location.href = url;
        })
        .as('windowOpen');
    });

    cy.wait(4000);

    //Remove Cookie
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        // If the cookie bar is visible, click on it and remove it
        cy.get('#onetrust-accept-btn-handler').click();
      } else {
        // Log that the cookie bar was not visible
        cy.log('Cookie bar not visible');
      }
    }); //End Remove Cookie

    cy.wait(4000);
    //Logout
    cy.get('.user-title').click();
    cy.wait(1500);
    cy.get('.logout-title > a').click();
    cy.url().should('include', Cypress.env('baseUrl_egEbox'));
    cy.log('Test completed successfully.');
  });

  //Admin user check Reporting email
  it('Count Users and verified Reporting email', () => {
    cy.loginToSupportViewAdmin();
    // Wait for login to complete
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

    // Search for Company by Display Name
    cy.get('#searchButton>span').click(); //Click on search button
    cy.wait(1000);
    // Search for Group by Display Name using the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(1)
      .type(Cypress.env('company')); // Use the company name from the cypress.config.js
    cy.wait(1500);
    //Find the Search button by button name and click on it
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    // Switch to User page
    cy.get('.action-buttons>button>.mdc-button__label')
      .filter((index, button) => {
        const buttonText = Cypress.$(button).text().trim();
        return buttonText === 'User' || buttonText === 'Benutzer';
      })
      .click();

    cy.wait(2500);

    // Variables to store counts and inactive user account numbers
    let activeUsersCount = 0;
    let sendToPrintUsersCount = 0;
    let inactiveUsers = [];

    // Count Active Users & Get Inactive Users' Account Numbers
    cy.get('.cdk-column-active>.cell-content-wrap>div>div>div')
      .each(($el, index) => {
        const isActive = ['Yes', 'Ja'].includes($el.text().trim());

        if (isActive) {
          activeUsersCount++;
        } else {
          // Get AccountNumber of inactive user
          cy.get('.cdk-column-accountNumbers>.cell-content-wrap>div>div')
            .eq(index)
            .invoke('text')
            .then((accountNumber) => {
              inactiveUsers.push(accountNumber.trim());
            });
        }
      })
      .then(() => {
        Cypress.env('activeUsers', activeUsersCount);
        Cypress.env('inactiveUsers', inactiveUsers);
        cy.log(`Active Users Count: ${activeUsersCount}`);
        cy.log(`Inactive Users: ${JSON.stringify(inactiveUsers)}`);
      });

    // Count SendToPrint Users (Ignoring 'Yes' for SendToPrintChannel)
    cy.get('.cdk-column-sendToPrint>.cell-content-wrap>div>div>div')
      .each(($el) => {
        const sendToPrintText = $el.text().trim();
        if (sendToPrintText === 'Yes' || sendToPrintText === 'Ja') {
          // Correct comparison
          sendToPrintUsersCount++;
        }
      })
      .then(() => {
        Cypress.env('sendToPrintUsers', sendToPrintUsersCount);
        cy.log(`SendToPrint Users Count: ${sendToPrintUsersCount}`);

        // Calculate sendToElChannel but exclude users where sendToPrint is 'Yes' or 'Ja'
        const sendToElChannel = Math.max(
          activeUsersCount - sendToPrintUsersCount,
          0
        );
        cy.log(
          `SendToElChannel (excluding SendToPrint=YES/JA): ${sendToElChannel}`
        );
        cy.wait(2000);

        // Visit Yopmail
        cy.visit('https://yopmail.com/en/');

        // Enter the support admin email
        cy.get('#login').type(Cypress.env('email_supportViewAdmin'));

        // Click the refresh button
        cy.get('#refreshbut > .md > .material-icons-outlined').click();

        // Wait for email to load
        cy.wait(4500);

        // Define email subject function
        function emailSubject(index) {
          cy.iframe('#ifinbox')
            .find('.mctn > .m > button > .lms')
            .eq(index)
            .should('include.text', 'Versandreport e-Gehaltszettel Portal');
        }

        // Define email body function
        function emailBody() {
          cy.iframe('#ifmail')
            .find('#mail > div')
            .invoke('text')
            .then((text) => {
              text = text.trim();

              const successMessage = `Sie haben ${sendToElChannel} Sendung(en) erfolgreich digital in das e-Gehaltszettel Portal Ihrer Benutzer*innen eingeliefert`;
              const postalMessage = `Zusätzlich haben Sie ${sendToPrintUsersCount} Sendung(en) erfolgreich über den postalischen Weg als Brief versendet. Das Dokument wird von uns über das „Einfach Brief“-Portal gedruckt, kuvertiert und an die Adresse des Benutzers versendet`;

              // Prepare inactive users message if any exist
              let inactiveUsersMessage = '';
              if (Cypress.env('inactiveUsers').length > 0) {
                const inactiveUsersList =
                  Cypress.env('inactiveUsers').join(', ');
                inactiveUsersMessage = `Folgende Personalnummern sind davon betroffen:\nSystem Biller Id: ${Cypress.env(
                  'company'
                )}, Personalnummern: ${inactiveUsersList}`;
              }

              // Assert email contains either success message, postal message, or inactive users info
              expect(
                text.includes(successMessage) ||
                  text.includes(postalMessage) ||
                  text.includes(inactiveUsersMessage)
              ).to.be.true;

              // Log to console for debugging
              cy.log(`Email Content: ${text}`);
              if (inactiveUsersMessage) {
                cy.log(`Inactive Users Info Added: ${inactiveUsersMessage}`);
              }
            });
        }

        // Validate email subject and body
        emailSubject(0);
        emailBody();
      });
  });
});
