describe('Send welcome mail via post / EinfachBrief (HappyPath)', () => {
  // M A S T E R    U S E R - CHECK DOES 'SEND TO EINFACHBRIEF' IS ENABLED
  it('Login As Master User - Check does eGehaltszettelEnabled is set to true', () => {
    //Import credentials (un/pw) from 'supportView.json' file
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(payslipJson.baseUrl); //Taken from base url
      cy.url().should('include', payslipJson.baseUrl); //Validating url on the login page
      //Login to sw
      cy.fixture('supportView.json').as('payslipSW');
      cy.get('@payslipSW').then((payslipJson) => {
        cy.get('input[formcontrolname="username"]').type(
          payslipJson.username_supportViewMaster
        );
        cy.get('input[formcontrolname="password"]').type(
          payslipJson.password_supportViewMaster
        );
        cy.get('button[type="submit"]').click();
      });

      //Search for Group by Display Name
      cy.get('#searchButton>span').click(); //Click on search button
      cy.fixture('supportView.json').as('payslipSW');
      cy.get('@payslipSW').then((payslipJson) => {
        // Use the company name from the JSON file
        const companyName = payslipJson.search;
        // Search for Group by Display Name using the company name
        cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
          .eq(1)
          .type(companyName);
      });
      //Find the Search button by button name and click on it
      cy.get('.search-dialog>form>div>.mat-primary').click();
      cy.wait(1500);
      //Switch to user section
      cy.get('.action-buttons > .mdc-button').eq(0).click();
    });
    cy.wait(1500);
    //Scroll to the botton
    cy.get('.mat-mdc-dialog-content').scrollTo('bottom');

    //Check checkbox
    cy.get('#eGehaltszettelEnabled').then(($checkbox) => {
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
      cy.wait(3000);
      //Logout
      cy.get('.logout-icon ').click();
      cy.wait(2000);
      cy.get('.confirm-buttons > :nth-child(2)').click();
      cy.url();
      cy.should('include', 'https://supportviewpayslip.edeja.com/fe/login'); // Validate url
      cy.wait(1500);
    });
  }); //end it

  // A D M I N   U S E R - CREATE USER MANUAL FROM SW

  // it.only('Login As AdminUser - Create 2 Users Manually', () => {
  //   // Load credentials (un/pw) and user data from 'supportView.json'
  //   cy.fixture('supportView.json').as('payslipSW');
  //   cy.get('@payslipSW').then((payslipJson) => {
  //     cy.loginToSupportViewAdmin();
  //     cy.wait(3500);

  //     //Remove pop up
  //     cy.get('body').then(($body) => {
  //       if ($body.find('.release-note-dialog__close-icon').length > 0) {
  //         cy.get('.release-note-dialog__close-icon').click();
  //       } else {
  //         cy.log('Close icon is NOT present');
  //       }
  //     });
  //     cy.wait(1500);

  //     //Search for Company by Display Name
  //     cy.get('#searchButton>span').click(); //Click on search button
  //     cy.wait(1000);

  //     // Use the company name from the cypress.config.js
  //     const companyName = Cypress.env('company');

  //     // Search for Group by Display Name using the company name
  //     cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
  //       .eq(1)
  //       .type(companyName);

  //     //Find the Search button by button name and click on it
  //     cy.get('.search-dialog>form>div>.mat-primary').click();
  //     cy.wait(1500);

  //     // Switch to User section
  //     //cy.get('.mdc-button > .mdc-button__label').eq(4).click();

  //     cy.get('.action-buttons>.mdc-button>.mdc-button__label')
  //       .filter((index, el) => {
  //         const text = Cypress.$(el).text().trim();
  //         return text === 'User' || text === 'Benutzer';
  //       })
  //       .click({ force: true });

  //     // Function to create a user
  //     function createUser(user) {
  //       // Click 'Create User' button
  //       cy.get('button > .mdc-button__label')
  //         .filter((index, el) => {
  //           const text = Cypress.$(el).text().trim();
  //           return text === 'Create user' || text === 'Neuen Benutzer Anlegen';
  //         })
  //         .click({ force: true });

  //       cy.wait(1500);

  //       // Click on Manual Creation
  //       cy.get('.create_user_dialog_content>.buttons-wrapper>button')
  //         .filter((index, el) => {
  //           const text = Cypress.$(el).text().trim();
  //           return text === 'Manuel Creation' || text === 'Manuelle Anlage';
  //         })
  //         .click();

  //       // Fill in user details
  //       cy.get('mat-select[formControlName="salutation"]').click();
  //       cy.get('mat-option').eq(0).click({ force: true });

  //       cy.get('input[formcontrolname="firstName"]').type(user.firstName);
  //       cy.get('input[formcontrolname="lastName"]').type(user.lastName);
  //       cy.get('input')
  //         .filter((index, input) => {
  //           const placeholder = Cypress.$(input).attr('placeholder');
  //           return (
  //             placeholder &&
  //             (placeholder.trim() === 'Account Number *' ||
  //               placeholder.trim() === 'Personalnummer *')
  //           );
  //         })
  //         .click()
  //         .type(user.username);

  //       cy.get('input[formcontrolname="email"]').type(user.email);

  //       // Select phone number prefix
  //       cy.get(
  //         ':nth-child(4) > .mat-mdc-form-field-type-mat-select > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix'
  //       ).click();
  //       cy.wait(500);
  //       cy.get('.mdc-list-item').eq(0).click();

  //       // Fill phone number fields
  //       cy.get('input[formcontrolname="countryCodePhoneNum"]')
  //         .click({ force: true })
  //         .type(user.countryCodePhoneNum);
  //       cy.get('input[formcontrolname="netNumberPhoneNum"]').type(
  //         user.netNumberPhoneNum
  //       );
  //       cy.get('input[formcontrolname="subscriberNumberPhoneNum"]').type(
  //         user.subscriberNumberPhoneNum
  //       );

  //       // Fill in address if available
  //       if (user.streetName) {
  //         cy.get('input[formcontrolname="streetName"]').type(user.streetName);
  //         cy.get('input[formcontrolname="streetNumber"]').type(
  //           user.streetNumber
  //         );
  //         cy.get('input[formcontrolname="doorNumber"]').type(user.doorNumber);
  //         cy.get('input[formcontrolname="zipCode"]').type(user.zipCode);
  //         cy.get('input[formcontrolname="city"]').type(user.city);
  //       }

  //       // Fill in title
  //       cy.get('input[formcontrolname="prefixedTitle"]').type(
  //         user.prefixedTitle
  //       );

  //       // Enable 'Send Credentials to Print'
  //       cy.get('input[type="checkbox"]').eq(1).click();

  //       //cy.get('button[type="submit"]').click({ force: true });
  //       cy.wait(1500);
  //       // Submit the form
  //       cy.get('button[color="primary"]>.mdc-button__label')
  //         .filter((index, button) => {
  //           return (
  //             Cypress.$(button).text().trim() === 'Submit' ||
  //             Cypress.$(button).text().trim() === 'Absenden'
  //           );
  //         })
  //         .click({ force: true });
  //       cy.wait(1500);
  //     }

  //     // Create the first user (with address)
  //     //createUser(payslipJson.createUser[0]);

  //     // Create the first user (with address)
  //     createUser(Cypress.env('createUser')[0]);

  //     // Access the first Admin User object from cypress.config.js
  //     //const user = Cypress.env('createUser')[0];

  //     // Validate Confirm Address dialog
  //     cy.wait(1500);
  //     cy.get('send-to-print-promt .ng-star-inserted').then((elements) => {
  //       const extractedValues = Array.from(elements).map((el) =>
  //         el.innerText.trim()
  //       );
  //       cy.log('Extracted Values:', extractedValues);

  //       // Validate the extracted values match the address data from the fixture
  //       expect(extractedValues[0]).to.contain(
  //         payslipJson.createUser[0].streetName
  //       );
  //       expect(extractedValues[1]).to.contain(
  //         payslipJson.createUser[0].streetNumber
  //       );
  //       expect(extractedValues[2]).to.contain(
  //         payslipJson.createUser[0].doorNumber
  //       );
  //       expect(extractedValues[3]).to.contain(
  //         payslipJson.createUser[0].zipCode
  //       );
  //       expect(extractedValues[4]).to.contain(payslipJson.createUser[0].city);
  //       expect(extractedValues[5]).to.satisfy(
  //         (value) => value.includes('Austria') || value.includes('Österreich')
  //       );
  //     });
  //     cy.wait(1500);
  //     // Confirm-close Address in the dialog
  //     cy.get(
  //       'app-confirmation-dialog>.dialog-container>.dialog-footer>.dialog-actions>button>.title'
  //     )
  //       .filter((index, buttonTitle) => {
  //         return (
  //           Cypress.$(buttonTitle).text().trim() === 'Confirm' ||
  //           Cypress.$(buttonTitle).text().trim() === 'Bestätigen'
  //         );
  //       })
  //       .click({ force: true });

  //     // Wait for user creation process
  //     cy.wait(2000);

  //     // Create the second user (without address)
  //     createUser(Cypress.env('createUserNoAddress')[0]);
  //     // createUser(payslipJson.createUserNoAddress[0]);

  //     // Create the first user (with address)

  //     // Access the first Admin User object from cypress.config.js
  //     const user = Cypress.env('createUserNoAddress')[0];

  //     cy.get('send-to-print-promt .ng-star-inserted').then((elements) => {
  //       const extractedValues = Array.from(elements).map((el) =>
  //         el.innerText.trim()
  //       );
  //       cy.log('Extracted Values:', extractedValues);

  //       // Assuming the order is Street, House Number, Door Number, etc.
  //       expect(extractedValues[0]).to.contain('');
  //       expect(extractedValues[1]).to.contain('');
  //       expect(extractedValues[2]).to.contain('');
  //       expect(extractedValues[3]).to.contain('');
  //       expect(extractedValues[4]).to.contain('');
  //       expect(extractedValues[5]).to.contain('');
  //     });

  //     // Validate and confirm second user creation
  //     cy.wait(1500);
  //     cy.get(
  //       'app-confirmation-dialog>.dialog-container>.dialog-footer>.dialog-actions>button>.title'
  //     )
  //       .filter((index, buttonTitle) => {
  //         return (
  //           Cypress.$(buttonTitle).text().trim() === 'Confirm' ||
  //           Cypress.$(buttonTitle).text().trim() === 'Bestätigen'
  //         );
  //       })
  //       .click({ force: true });

  //     // Validate success message
  //     cy.get('sv-multiple-notifications>.messages>p')
  //       .invoke('text')
  //       .then((text) => {
  //         const trimmedText = text.trim();

  //         // Check if the text matches either English or German success message
  //         expect(trimmedText).to.be.oneOf([
  //           'User created', // English
  //           'Benutzer angelegt', // German
  //         ]);
  //       });

  //     cy.wait(2500);
  //     //Logout
  //     cy.get('.logout-icon ').click();
  //     cy.wait(2000);
  //     cy.get('.confirm-buttons > :nth-child(2)').click();
  //     cy.url();
  //     cy.url().should('include', Cypress.env('baseUrl')); // Validate url
  //     cy.wait(1500);
  //   });
  // });

  it.only('Login As AdminUser - Create 2 Users Manually', () => {
    // Load user data from 'supportView.json'
    cy.fixture('supportView.json').as('payslipSW');

    cy.get('@payslipSW').then((payslipJson) => {
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
        .eq(1)
        .type(companyName);

      cy.get('.search-dialog>form>div>.mat-primary').click();
      cy.wait(1500);

      // Switch to User section
      cy.get('.action-buttons>.mdc-button>.mdc-button__label')
        .filter((index, el) => {
          const text = Cypress.$(el).text().trim();
          return text === 'User' || text === 'Benutzer';
        })
        .first() // Ensure we click only the first matching element
        .click({ force: true });

      // Function to create a user
      function createUser(user) {
        cy.get('button > .mdc-button__label')
          .filter((index, el) => {
            const text = Cypress.$(el).text().trim();
            return text === 'Create user' || text === 'Neuen Benutzer Anlegen';
          })
          .first()
          .click({ force: true });

        cy.wait(1500);

        cy.get('.create_user_dialog_content>.buttons-wrapper>button')
          .filter((index, el) => {
            const text = Cypress.$(el).text().trim();
            return text === 'Manuel Creation' || text === 'Manuelle Anlage';
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
          cy.get('input[formcontrolname="streetNumber"]').type(
            user.streetNumber
          );
          cy.get('input[formcontrolname="doorNumber"]').type(user.doorNumber);
          cy.get('input[formcontrolname="zipCode"]').type(user.zipCode);
          cy.get('input[formcontrolname="city"]').type(user.city);
        }

        cy.get('input[formcontrolname="prefixedTitle"]').type(
          user.prefixedTitle
        );

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

      createUser(Cypress.env('createUser')[0]);

      // Validate Confirm Address dialog for first user
      cy.wait(1500);
      cy.get('send-to-print-promt .ng-star-inserted').then((elements) => {
        const extractedValues = Array.from(elements).map((el) =>
          el.innerText.trim()
        );
        cy.log('Extracted Values:', extractedValues);

        expect(extractedValues[0]).to.contain(
          payslipJson.createUser[0].streetName
        );
        expect(extractedValues[1]).to.contain(
          payslipJson.createUser[0].streetNumber
        );
        expect(extractedValues[2]).to.contain(
          payslipJson.createUser[0].doorNumber
        );
        expect(extractedValues[3]).to.contain(
          payslipJson.createUser[0].zipCode
        );
        expect(extractedValues[4]).to.contain(payslipJson.createUser[0].city);
        expect(extractedValues[5]).to.satisfy(
          (value) => value.includes('Austria') || value.includes('Österreich')
        );
      });

      cy.get(
        'app-confirmation-dialog>.dialog-container>.dialog-footer>.dialog-actions>button>.title'
      )
        .filter((index, buttonTitle) => {
          return (
            Cypress.$(buttonTitle).text().trim() === 'Confirm' ||
            Cypress.$(buttonTitle).text().trim() === 'Bestätigen'
          );
        })
        .first()
        .click({ force: true });

      cy.wait(2000);

      // cy.intercept('POST', '**person/editPerson**').as('editPerson');
      // cy.wait(1000);

      // cy.wait(['@editPerson'], { timeout: 37000 }).then((interception) => {
      //   // Log the intercepted response
      //   cy.log('Intercepted response:', interception.response);

      //   // Assert the response status code
      //   expect(interception.response.statusCode).to.eq(201);
      //   cy.wait(2500);
      // });
      // cy.wait(5000);
      cy.pause();
      // Create the second user (without address)

      // Click 'Create User' button
      // cy.get('button > .mdc-button__label')
      //   .filter((index, el) => {
      //     const text = Cypress.$(el).text().trim();
      //     return text === 'Create user' || text === 'Neuen Benutzer Anlegen';
      //   })
      //   .click({ force: true });

      // cy.wait(1500);
      // // Click on Manual Creation
      // cy.get('.create_user_dialog_content>.buttons-wrapper>button')
      //   .filter((index, el) => {
      //     const text = Cypress.$(el).text().trim();
      //     return text === 'Manuel Creation' || text === 'Manuelle Anlage';
      //   })
      //   .click();

      createUser(Cypress.env('createUserNoAddress')[0]);

      cy.wait(1500);
      cy.get('send-to-print-promt .ng-star-inserted').should('not.exist'); // Ensure no address fields appear

      cy.get(
        'app-confirmation-dialog>.dialog-container>.dialog-footer>.dialog-actions>button>.title'
      )
        .filter((index, buttonTitle) => {
          return (
            Cypress.$(buttonTitle).text().trim() === 'Confirm' ||
            Cypress.$(buttonTitle).text().trim() === 'Bestätigen'
          );
        })
        .first()
        .click({ force: true });

      cy.get('sv-multiple-notifications>.messages>p')
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.be.oneOf([
            'User created',
            'Benutzer angelegt',
          ]);
        });

      cy.wait(2500);

      // Logout
      cy.get('.logout-icon').click();
      cy.wait(2000);
      cy.get('.confirm-buttons > :nth-child(2)').first().click();
      cy.url().should('include', Cypress.env('baseUrl'));
      cy.wait(1500);
    });
  });

  //D O W L O A D    P D F

  it('Download and open the latest PDF', () => {
    cy.fixture('einfachbrief.json').as('einfachbrief');
    cy.get('@einfachbrief').then((einfachbriefJson) => {
      cy.visit(einfachbriefJson.baseUrl);
      cy.url().should('include', einfachbriefJson.baseUrl);

      cy.wait(1500);
      // Log in to the system
      cy.get('tp-input[formcontrolname="username"]').type(
        einfachbriefJson.email_supportViewAdmin
      );
      cy.get('tp-input[formcontrolname="password"]').type(
        einfachbriefJson.password_supportViewAdmin
      );
      cy.get('button[type="submit"]').click();

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

        // Check if "Open Deliveries" or "Open Sendungen" exists and click it
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
            cy.get('.table__container>table>tbody>tr>td')
              .eq(targetIndex)
              .click();
          }
          cy.wait(1500);
          cy.get(
            '.open > .accordion-container > .table-wrapper > tp-table > .table > .table__container > table > tbody > .table__row>td>.icon-magnify'
          )

            .should('be.visible') // Wait for the element to be visible
            .click({ force: true });
          cy.wait(3000);

          //Close document preview dialog
          cy.get(
            ':nth-child(7) > .dialog > .dialog__inner > .dialog__close-button'
          ).click();
        });
        cy.wait(2000);
      });

      // Switch to history table and download the PDF
      cy.get('.header__navigation-menu>li>a[href="/deliveries-list"]').click();
      cy.wait(1500);
      cy.get(
        '.deliveries-list-table>tp-table>.table>.table__container>table>tbody>tr'
      )
        .eq(0)
        .click();
      cy.wait(1500);
      cy.get('.download-container > p > .desktop')
        .first()
        .click({ force: true });
      cy.wait(2000);
      // Use the task to get the latest downloaded PDF file
      const downloadsDir =
        'C:\\Users\\mubavin\\Cypress\\EG\\cypress-automatison-framework\\cypress\\downloads\\';
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
    });
    cy.wait(3500);
  }); //end it

  //Y O P M A I L

  it('Yopmail - Get Reporting email', () => {
    // Visit Yopmail
    cy.visit('https://yopmail.com/en/');

    // Load fixture data
    cy.fixture('supportView.json').as('payslipSW');

    // Enter the support admin email
    cy.get('@payslipSW').then((payslipJson) => {
      cy.get('#login').type(payslipJson.email_supportViewAdmin);
    });

    // Click the refresh button
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    //Custom functions:
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
        .then(($div) => {
          const text = $div.text().trim();
          expect(
            text.includes(
              '1 Sendung(en) die Sie postalisch als Brief verschicken wollten, konnte(n) nicht ordnungsgemäß zugestellt werden, bitte überprüfen Sie die Daten der Mitarbeiter*innen, oder wenden Sie sich an unseren Kundenservice e-gehaltszettel@post.at'
            ) ||
              text.includes(
                'Zusätzlich haben Sie 1 Sendung(en) erfolgreich über den postalischen Weg als Brief versendet. Das Dokument wird von uns über das „Einfach Brief“-Portal  gedruckt, kurvertiert und an die Adresse des Benutzers versendet'
              )
          ).to.be.true; // OR condition
        });
    }

    // Access the inbox iframe and validate the email subject
    emailSubject(0); // Validate subject of Reporting email
    emailBody(); // Validate email body

    // Wait to ensure the email content is loaded
    cy.wait(3500);

    // Switch to the second email
    cy.iframe('#ifinbox').find('.mctn > .m > button > .lms').eq(1).click();

    emailSubject(1); // Validate subject of second email
    cy.wait(1500);
    emailBody(); // Validate second email body

    cy.wait(2500);
  });

  // M A S T E R    U S E R - DELETE ALREADY CREATED USERS
  it('Login As Master User - Delete Alredy created Users', () => {
    //Import credentials (un/pw) from 'supportView.json' file
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(payslipJson.baseUrl); //Taken from base url
      cy.url().should('include', payslipJson.baseUrl); //Validating url on the login page
      //Login to sw
      cy.fixture('supportView.json').as('payslipSW');
      cy.get('@payslipSW').then((payslipJson) => {
        cy.get('input[formcontrolname="username"]').type(
          payslipJson.username_supportViewMaster
        );
        cy.get('input[formcontrolname="password"]').type(
          payslipJson.password_supportViewMaster
        );
        cy.get('button[type="submit"]').click();
      });

      //Search for Group by Display Name
      cy.get('#searchButton>span').click(); //Click on search button
      cy.fixture('supportView.json').as('payslipSW');
      cy.get('@payslipSW').then((payslipJson) => {
        // Use the company name from the JSON file
        const companyName = payslipJson.search;
        // Search for Group by Display Name using the company name
        cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
          .eq(1)
          .type(companyName);
      });
      //Find the Search button by button name and click on it
      cy.get('.search-dialog>form>div>.mat-primary').click();
      //Switch to user section
      cy.get('.action-buttons > .mdc-button').eq(4).click();

      // Array of users to delete
      const usersToDelete = ['manualAddress', 'manualNoAddress']; // Add more usernames as needed

      usersToDelete.forEach((userName, index) => {
        // Function to search for and delete a user
        const searchAndDeleteUser = (userName) => {
          // Search for the user
          cy.get('.search-label').click();

          // Type the username as a search criterion
          cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
            .clear() // Clear any previous input
            .type(userName);

          // Click on the submit button to search
          cy.get('button[type="submit"]').click();

          // Wait for search results to load (adjust as needed for dynamic loading)
          cy.get('body').then(($body) => {
            if ($body.find('.no-results-message').length > 0) {
              // If the user doesn't exist or is already deleted
              cy.log(`User ${userName} not found or already deleted.`);

              // Reset the search by clicking on the reset button
              cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click();

              // Proceed with the next search criteria
              if (index < usersToDelete.length - 1) {
                cy.log(
                  `Proceeding with the next user: ${usersToDelete[index + 1]}`
                );
              }
            } else {
              // If the user is found, proceed with the deletion
              cy.log(`User ${userName} found. Proceeding with deletion.`);

              // Click the delete button (adjust the selector as per your app)
              cy.get('button')
                .contains(/Delete|DSGVO-Löschung/)
                .click();

              // Confirm delete in the confirmation dialog
              cy.get('.confirm-buttons > button')
                .filter((index, button) => {
                  return (
                    Cypress.$(button).text().trim() === 'YES' ||
                    Cypress.$(button).text().trim() === 'JA'
                  );
                })
                .click();

              // Log the deletion
              cy.log(`User ${userName} has been deleted.`);

              // Reset the search to clear out the search pill
              cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click();
            }
          });
        };

        // Call the function to search and delete user
        searchAndDeleteUser(userName);

        // Optional wait between deletions (if needed)
        cy.wait(1000);
      });

      //Logout
      cy.get('.logout-icon ').click();
      cy.wait(2000);
      cy.get('.confirm-buttons > :nth-child(2)').click();
      cy.url();
      cy.should('include', 'https://supportviewpayslip.edeja.com/fe/login'); // Validate url
      cy.wait(1500);
    });
    // Completion message at the end of the test
    cy.log('The tests have been completed successfully.');
    cy.wait(3000);
  }); //end it
}); //end describe
