describe('R01_Hybridsign_POST', () => {
  it.only('upload documet and start signature flow', () => {
    // Visit E-Brief login page
    cy.visit(Cypress.env('baseUrl'), { failOnStatusCode: false });
    cy.wait(1000);

    //Validate  Upload title
    cy.get('.upload__title')
      .should('be.visible') // Ensure it's visible first
      .invoke('text') // Get the text of the element
      .then((snackText) => {
        const trimmedText = snackText.trim();
        expect(trimmedText).to.match(/Datei per Drag und Drop ablegen oder/);
      });

    cy.get('.label-checkbox')
      .should('be.visible') // Ensure it's visible first
      .invoke('text') // Get the text of the element
      .then((snackText) => {
        const trimmedText = snackText.trim();
        expect(trimmedText).to.match(
          /Ich will einen Signaturlauf an mehrere Personen versenden./
        );
      });

    //Click on check box
    cy.get('#checkbox').click();

    //Validate email label
    cy.get('.email > label')
      .should('be.visible')
      .invoke('text')
      .then((labelText) => {
        const trimmed = labelText.trim().replace(/\s+/g, ' '); // Normalize whitespace
        expect(trimmed).to.match(
          /Bitte geben Sie Ihre E-Mail Adresse ein, auf der Sie das von allen Parteien unterschriebene Dokument empfangen wollen:/
        );
      });

    cy.get('.email-error')
      .should('be.visible')
      .invoke('text')
      .then((snackText) => {
        const trimmedText = snackText.trim();

        expect(trimmedText).to.match(/Pflichtfeld./);
      });

    cy.wait(2500);
    cy.get('.input__field-input').type(Cypress.env('manager_1'));

    //Enter text into text area field
    const getRandomUmlautString = (length) => {
      const umlautChars =
        'äöüÄÖÜßabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += umlautChars.charAt(
          Math.floor(Math.random() * umlautChars.length)
        );
      }
      return result;
    };

    const now = new Date();
    const currentTime = now.toLocaleTimeString('de-DE');
    const formattedDate = now.toLocaleDateString('de-DE'); // dd.mm.yyyy

    const randomUmlaut = getRandomUmlautString(200);

    // Build text with line breaks replaced by `\n` for `textarea`
    const textInsideTextArea = `Hello World,\n\nTime: ${currentTime},\n${randomUmlaut}\n) //${formattedDate}`;

    cy.get('textarea').type(textInsideTextArea, { delay: 0 }); // optional: adjust `delay` for realistic typing

    cy.wait(2000);
    cy.intercept('POST', '**/init').as('openInitSession');
    //Upload pdf
    cy.uploadPDF();

    cy.wait('@openInitSession', { timeout: 37000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });
    //Click on button to start signature flow
    cy.get('.start-workflow>.mdc-button__label')
      .contains(/ Signaturlauf starten/)
      .should('be.visible')
      .click(); // Click the button
    cy.wait(3500);

    //Valodate txt and url
    cy.get('.endscreen-content>p')
      .should('be.visible')
      .invoke('text')
      .then((snackText) => {
        const trimmedText = snackText.trim();

        expect(trimmedText).to.match(
          /Der Unterschriftenlauf wird durchgeführt. Sie erhalten ein E-Mail, sobald alle Parteien unterschrieben haben./
        );
      });

    cy.url().should('include', '/signature-flow'); // => validate url
    // });
    cy.wait(1000);
  });

  //Yopmail - Confirm email and Change password
  it.only('Yopmail - Confirm email and Change password', () => {
    // Visit yopmail application
    cy.visit('https://yopmail.com/en/');

    // Access the first Admin User object from cypress.config.js

    cy.get('#login').type(Cypress.env('manager_1'));
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    cy.wait(1500);
    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .eq(0)
      .should('include.text', 'Dokument(e) zum Unterzeichnen'); //Validate subject of Verification email

    // cy.iframe('#ifmail')
    //   .find(
    //     '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span'
    //   )
    //   .invoke('text')
    //   .then((innerText) => {
    //     const startIndex =
    //       innerText.indexOf('Hier ist Ihr Benutzername:') +
    //       'Hier ist Ihr Benutzername:'.length;
    //     const endIndex = innerText.indexOf('Bitte bestätigen Sie');

    //     const usernameFromEmailBody = innerText
    //       .substring(startIndex, endIndex)
    //       .trim();

    //     cy.log('Captured text:', usernameFromEmailBody);

    //Confirm Email Address  - by clicking on "Jetzt E-Mail Adresse bestätigen" button from Comfirmation email
    cy.wait(1500);
    let initialUrl;
    cy.iframe('#ifmail')
      .find(
        '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(3)>span'
      )
      .should('include.text', 'hybridSign Dokument')
      .invoke('attr', 'href')
      .then((href) => {
        // Log link text
        cy.log(`The href attribute is: ${href}`);
      });
    cy.wait(2000);
    // cy.iframe('#ifmail')
    //   .find(
    //     '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(3)>a'
    //   )
    //   .should('include.text', 'hybridSign Dokument')
    //   .invoke('removeAttr', 'target')
    //   .invoke('removeAttr', 'onclick') // Optional: prevent JS handlers
    //   .click();

    cy.iframe('#ifmail')
      .find('a')
      .filter((index, el) => el.href.includes(Cypress.env('rootUrl')))
      // .first()
      .should('have.attr', 'href')
      .then((href) => {
        cy.log(`Going to click link: ${href}`);
        cy.wrap(href).as('hybridLink');
      });

    cy.get('@hybridLink').then((href) => {
      cy.visit(href, { failOnStatusCode: false }); // or force click if you want to simulate the user action
    });

    //Wait for Cookie bar
    // cy.wait(5000);
    cy.pause();
    // // //Remove Cooki dialog (if shown)
    // if (cy.iframe('#ifmail').find('#onetrust-accept-btn-handler')) {
    //   cy.iframe('#ifmail').find('#onetrust-accept-btn-handler').click();
    // } else {
    //   cy.log('Cookie dialog is not shown');
    // }

    // Remove Cookie dialog (if shown)
    cy.iframe('#ifmail').then(($iframe) => {
      if ($iframe.find('#onetrust-policy-title').is(':visible')) {
        cy.wrap($iframe)
          .find('#onetrust-accept-btn-handler')
          .click({ force: true });
        cy.log('Cookie dialog closed.');
      } else {
        cy.log('Cookie dialog not visible.');
      }
    });
    cy.wait(1500);

    // Remove Cookie dialog (if shown)
    // cy.iframe('#ifmail')
    //   .find('#onetrust-accept-btn-handler', { timeout: 3000 })
    //   .then(($btn) => {
    //     if ($btn.length > 0 && $btn.is(':visible')) {
    //       cy.wrap($btn).click();
    //       cy.log('Cookie dialog was shown and clicked.');
    //     } else {
    //       cy.log('Cookie dialog is not shown.');
    //     }
    //   });

    // cy.iframe('#ifmail')
    //   .find('#onetrust-accept-btn-handler')
    //   .then(($btn) => {
    //     if ($btn.length) {
    //       cy.wrap($btn).click();
    //     } else {
    //       cy.log('Cookie dialog is not shown');
    //     }
    //   });

    // cy.iframe('#ifmail').find('#onetrust-accept-btn-handler').click();

    cy.wait(8000);
    cy.iframe('#ifmail').find('.button').click();
    //Reload inbox

    cy.get('#refresh').click({ force: true }); //Click on Refresh inbox icon
    cy.wait(5000);
    //Reset Password email

    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .eq(0)

      .should('include.text', 'Passwort zurücksetzen e-Gehaltszettel Portal'); //Validate subject of Verification email
    let initialUrl_pass;
    cy.iframe('#ifmail')
      .find(
        '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a'
      )
      .should('include.text', 'Neues Passwort erstellen ')
      .invoke('attr', 'href')
      .then((href) => {
        // Log link text
        cy.log(`The href attribute is: ${href}`);
      });
    cy.iframe('#ifmail')
      .find(
        '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a'
      )
      .invoke('attr', 'target', '_self') //prevent opening in new tab
      .click();
    cy.wait(2500);

    //Fill the Set password form
    cy.iframe('#ifmail')
      .find('.input__field-input')
      .eq(0)
      .click()

      .type(Cypress.env('password_egEbox')); //fill the 1st input field
    cy.iframe('#ifmail').find('.input-eye-icon').eq(0).click(); //Click on Show password icon

    cy.iframe('#ifmail')
      .find('.input__field-input')
      .eq(1)

      .type(Cypress.env('password_egEbox')); //fill the 2nd input field
    cy.iframe('#ifmail').find('.input-eye-icon').eq(1).click(); //Click on Show password icon
    cy.iframe('#ifmail').find('.button').click(); //Click on confirm button

    cy.wait(2000);
    // });
  });

  //Enable All Roles (except HR Role)
  it.skip('Enable All Roles, except HR Role for Specific Admin', () => {
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

  //Login As Admin user and Create User Manually
  it('Login As Admin user and Create User Manually', () => {
    // Login as Admin User using a custom command
    cy.loginToSupportViewAdmin();
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

    //Search for Company by Display Name
    cy.get('#searchButton>span').click(); //Click on search button
    cy.wait(1000);

    // Use the company name from the cypress.config.js
    const companyName = Cypress.env('company');

    // Search for Group by Display Name using the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(0)
      .type(companyName);

    //Find the Search button by button name and click on it
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    cy.get('.action-buttons>.mdc-button>.mdc-button__label')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'User' || text === 'Benutzer';
      })
      .click({ force: true });

    // Function to create a user
    function createUser(user) {
      // Click 'Create User' button
      cy.get('button > .mdc-button__label')
        .filter((index, el) => {
          const text = Cypress.$(el).text().trim();
          return text === 'Create user' || text === 'Neuen Benutzer Anlegen';
        })
        .click({ force: true });

      cy.wait(1500);

      // Click on Manual Creation
      cy.get('.create_user_dialog_content>.buttons-wrapper>button')
        .filter((index, el) => {
          const text = Cypress.$(el).text().trim();
          return text === 'Manuel Creation' || text === 'Manuelle Anlage';
        })
        .click();

      // Fill in user details
      cy.get('mat-select[formControlName="salutation"]').click();
      cy.get('mat-option').eq(0).click({ force: true });

      cy.get('input[formcontrolname="firstName"]').type(user.firstName);
      cy.get('input[formcontrolname="lastName"]').type(user.lastName);
      cy.get('input')
        .filter((index, input) => {
          const placeholder = Cypress.$(input).attr('placeholder');
          return (
            placeholder &&
            (placeholder.trim() === 'Account Number *' ||
              placeholder.trim() === 'Personalnummer *')
          );
        })
        .click()
        .type(user.username);

      cy.get('input[formcontrolname="email"]').type(user.email);

      // Select phone number prefix
      cy.get(
        ':nth-child(4) > .mat-mdc-form-field-type-mat-select > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix'
      ).click();
      cy.wait(500);
      cy.get('.mdc-list-item').eq(0).click();

      // Fill phone number fields
      cy.get('input[formcontrolname="countryCodePhoneNum"]')
        .click({ force: true })
        .type(user.countryCodePhoneNum);
      cy.get('input[formcontrolname="netNumberPhoneNum"]').type(
        user.netNumberPhoneNum
      );
      cy.get('input[formcontrolname="subscriberNumberPhoneNum"]').type(
        user.subscriberNumberPhoneNum
      );

      // Fill in address if available
      if (user.streetName) {
        cy.get('input[formcontrolname="streetName"]').type(user.streetName);
        cy.get('input[formcontrolname="streetNumber"]').type(user.streetNumber);
        cy.get('input[formcontrolname="doorNumber"]').type(user.doorNumber);
        cy.get('input[formcontrolname="zipCode"]').type(user.zipCode);
        cy.get('input[formcontrolname="city"]').type(user.city);
      }

      // Fill in title
      cy.get('input[formcontrolname="prefixedTitle"]').type(user.prefixedTitle);

      //cy.get('button[type="submit"]').click({ force: true });
      cy.wait(1500);
      // Submit the form
      cy.get('button[color="primary"]>.mdc-button__label')
        .filter((index, button) => {
          return (
            Cypress.$(button).text().trim() === 'Submit' ||
            Cypress.$(button).text().trim() === 'Absenden'
          );
        })
        .click({ force: true });
      cy.wait(1500);
    } //end create usr function

    // Create the first user (with address)
    createUser(Cypress.env('createUser')[0]);

    // Access the first Admin User object from cypress.config.js
    const user = Cypress.env('createUser')[0];

    // Validate success message
    cy.get('sv-multiple-notifications>.messages>p')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();

        // Check if the text matches either English or German success message
        expect(trimmedText).to.be.oneOf([
          'User created', // English
          'Benutzer angelegt', // German
        ]);

        // //Download credentials
        // cy.get('.download-bttn').click();
        // cy.wait(1000);

        // // Get the latest downloaded PDF file
        // const downloadsDir = `${Cypress.config(
        //   'fileServerFolder'
        // )}/cypress/downloads/`;
        // cy.task('getDownloadedPdf', downloadsDir).then((filePath) => {
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

        cy.wait(2500);

        //Skip download e-box user's credentials
        cy.get('.wrapper>.cancel-bttn').click();
        cy.wait(1500);

        // Logout
        cy.get('.logout-icon ').click();
        cy.wait(2000);
        cy.get('.confirm-buttons > :nth-child(2)').click();
        cy.url().should('include', Cypress.env('baseUrl')); // Validate url'
        cy.log('Test completed successfully.');
        cy.wait(2500);
      });
  }); //end it

  //Yopmail - Confirm email and Change password
  it('Yopmail - Confirm email and Change password', () => {
    // Visit yopmail application
    cy.visit('https://yopmail.com/en/');

    // Access the first Admin User object from cypress.config.js
    const user = Cypress.env('createUser')[0];
    cy.get('#login').type(user.email);
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    cy.wait(1500);
    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .eq(0)
      .should('include.text', 'Ihr neuer Benutzer im e-Gehaltszettel Portal'); //Validate subject of Verification email

    cy.iframe('#ifmail')
      .find(
        '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span'
      )
      .invoke('text')
      .then((innerText) => {
        const startIndex =
          innerText.indexOf('Hier ist Ihr Benutzername:') +
          'Hier ist Ihr Benutzername:'.length;
        const endIndex = innerText.indexOf('Bitte bestätigen Sie');

        const usernameFromEmailBody = innerText
          .substring(startIndex, endIndex)
          .trim();

        cy.log('Captured text:', usernameFromEmailBody);

        //Confirm Email Address  - by clicking on "Jetzt E-Mail Adresse bestätigen" button from Comfirmation email
        cy.wait(1500);
        let initialUrl;
        cy.iframe('#ifmail')
          .find(
            '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span>a'
          )
          .should('include.text', 'Jetzt E-Mail Adresse bestätigen')
          .invoke('attr', 'href')
          .then((href) => {
            // Log link text
            cy.log(`The href attribute is: ${href}`);
          });

        cy.iframe('#ifmail')
          .find(
            '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span>a'
          )
          .invoke('attr', 'target', '_self') //prevent opening in new tab
          .click();
        //Wait for Cookie bar
        cy.wait(15000);

        // // //Remove Cooki dialog (if shown)
        // if (cy.iframe('#ifmail').find('#onetrust-accept-btn-handler')) {
        //   cy.iframe('#ifmail').find('#onetrust-accept-btn-handler').click();
        // } else {
        //   cy.log('Cookie dialog is not shown');
        // }

        // Remove Cookie dialog (if shown)
        cy.iframe('#ifmail').then(($iframe) => {
          if ($iframe.find('#onetrust-policy-title').is(':visible')) {
            cy.wrap($iframe)
              .find('#onetrust-accept-btn-handler')
              .click({ force: true });
            cy.log('Cookie dialog closed.');
          } else {
            cy.log('Cookie dialog not visible.');
          }
        });
        cy.wait(1500);

        // Remove Cookie dialog (if shown)
        // cy.iframe('#ifmail')
        //   .find('#onetrust-accept-btn-handler', { timeout: 3000 })
        //   .then(($btn) => {
        //     if ($btn.length > 0 && $btn.is(':visible')) {
        //       cy.wrap($btn).click();
        //       cy.log('Cookie dialog was shown and clicked.');
        //     } else {
        //       cy.log('Cookie dialog is not shown.');
        //     }
        //   });

        // cy.iframe('#ifmail')
        //   .find('#onetrust-accept-btn-handler')
        //   .then(($btn) => {
        //     if ($btn.length) {
        //       cy.wrap($btn).click();
        //     } else {
        //       cy.log('Cookie dialog is not shown');
        //     }
        //   });

        // cy.iframe('#ifmail').find('#onetrust-accept-btn-handler').click();

        cy.wait(8000);
        cy.iframe('#ifmail').find('.button').click();
        //Reload inbox

        cy.get('#refresh').click({ force: true }); //Click on Refresh inbox icon
        cy.wait(5000);
        //Reset Password email

        cy.iframe('#ifinbox')
          .find('.mctn > .m > button > .lms')
          .eq(0)

          .should(
            'include.text',
            'Passwort zurücksetzen e-Gehaltszettel Portal'
          ); //Validate subject of Verification email
        let initialUrl_pass;
        cy.iframe('#ifmail')
          .find(
            '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a'
          )
          .should('include.text', 'Neues Passwort erstellen ')
          .invoke('attr', 'href')
          .then((href) => {
            // Log link text
            cy.log(`The href attribute is: ${href}`);
          });
        cy.iframe('#ifmail')
          .find(
            '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a'
          )
          .invoke('attr', 'target', '_self') //prevent opening in new tab
          .click();
        cy.wait(2500);

        //Fill the Set password form
        cy.iframe('#ifmail')
          .find('.input__field-input')
          .eq(0)
          .click()

          .type(Cypress.env('password_egEbox')); //fill the 1st input field
        cy.iframe('#ifmail').find('.input-eye-icon').eq(0).click(); //Click on Show password icon

        cy.iframe('#ifmail')
          .find('.input__field-input')
          .eq(1)

          .type(Cypress.env('password_egEbox')); //fill the 2nd input field
        cy.iframe('#ifmail').find('.input-eye-icon').eq(1).click(); //Click on Show password icon
        cy.iframe('#ifmail').find('.button').click(); //Click on confirm button

        cy.wait(2000);
      });
  });

  //Yopmail - Clear inbox
  it.skip('Yopmail - Clear inbox', () => {
    const user = Cypress.env('createUser')[0];

    // Visit yopmail application or login page
    cy.visit('https://yopmail.com/en/');
    cy.get('#login').type(user.email);
    cy.wait(1500);
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    cy.wait(1500);
    // Delete all emails if the button is not disabled
    cy.get('.menu>div>#delall')
      .should('not.be.disabled')
      .click({ force: true });
    cy.wait(2500);
  }); //end it

  it('getCookie and Store it as a global variabile', () => {
    cy.intercept('POST', '**/login/user').as('getToken'); // Intercept login request
    cy.loginToSupportViewAdmin(); // Perform login
    cy.wait(1500);

    cy.wait('@getToken', { timeout: 37000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);

      // Extract 'set-cookie' header
      const setCookieHeaders = interception.response.headers['set-cookie'];
      cy.log('Set-Cookie Headers:', setCookieHeaders);

      if (setCookieHeaders && setCookieHeaders.length > 0) {
        // Find the header that contains SV_AUTH
        const authCookie = setCookieHeaders.find((cookie) =>
          cookie.startsWith('SV_AUTH=')
        );

        if (authCookie) {
          // Extract the SV_AUTH value
          const match = authCookie.match(/SV_AUTH=([^;]+)/);
          if (match) {
            const authCookieValue = match[1];
            cy.log('Extracted SV_AUTH Cookie:', authCookieValue);

            // Store in Cypress env variable
            Cypress.env('authCookieValue', authCookieValue);
          }
        }
      }
      cy.wait(2500);
    });
  });
}); //end describe
