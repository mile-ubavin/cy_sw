describe('Master - Create User from CSV', () => {
  // A D M I N   U S E R - CREATE USER FROM CSV FILE
  const path = require('path');
  it('Login As AdminUser - Create Users from CSV file', () => {
    // Login as Master User using a custom command
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

    //Create user
    cy.get('.action-buttons>.mdc-button>.mdc-button__label')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'User' || text === 'Benutzer';
      })
      .click({ force: true });
    cy.wait(2500);

    //Click on create User button
    cy.get('.button-wraper>button > .mdc-button__label')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Create user' || text === 'Neuen Benutzer Anlegen';
      })
      .click({ force: true });
    cy.wait(1500);

    //Click on Upload CSV button
    cy.get('.create_user_dialog_content>.buttons-wrapper>button')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'CSV uploading' || text === 'CSV Anlage';
      })
      .click();

    //Upload CSV file
    cy.upload_csv();
    cy.get('#mat-select-value-3 > .mat-mdc-select-placeholder').click();
    cy.get('div.cdk-overlay-pane').should('exist'); // Ensure the overlay pane is present
    cy.get('div.cdk-overlay-pane mat-option').should(
      'have.length.greaterThan',
      0
    );

    //Select Company prefix
    cy.wait(1500);
    cy.get('mat-option').eq(0).click();
    cy.wait(1500);

    cy.intercept('POST', '**/supportView/v1/person/fromGroup/**').as(
      'uploadCSV'
    );

    //Click on  Create Users button
    cy.get('.dialog-actions>button>.title')
      .contains(/Create Users|Benutzer Anlegen/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    // cy.wait(10000);
    cy.wait(['@uploadCSV'], {
      timeout: 57000,
    }).then((interception) => {
      // Log the intercepted response
      cy.log('Intercepted response:', interception.response);

      // Assert the response status code
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.wait(2000);
    //Validate success message
    cy.get('sv-multiple-notifications>.messages>p')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();

        // Check if the text matches either English or German message
        expect(trimmedText).to.be.oneOf([
          '2 Users were created', // English
          '2 Benutzer wurden erstellt', // German
        ]);
      });
    //cy.wait(7500);
    // Wait until the success message disappears completely
    cy.get('sv-multiple-notifications>.messages>p', { timeout: 20000 }).should(
      'not.exist'
    );

    //Create user which already exist

    //Click on create User button
    cy.get('.button-wraper>button > .mdc-button__label')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Create user' || text === 'Neuen Benutzer Anlegen';
      })
      .click({ force: true });
    cy.wait(1500);

    //Click on Upload CSV button
    cy.get('.create_user_dialog_content>.buttons-wrapper>button')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'CSV uploading' || text === 'CSV Anlage';
      })
      .click();

    //Upload CSV file
    cy.upload_csv();

    cy.get('mat-select[formcontrolname="companyPrefix"]').click();
    //cy.get('#mat-select-value-3 > .mat-mdc-select-placeholder').click();
    cy.get('div.cdk-overlay-pane').should('exist'); // Ensure the overlay pane is present
    cy.get('div.cdk-overlay-pane mat-option').should(
      'have.length.greaterThan',
      0
    );
    //Select Company prefix
    cy.wait(1500);
    cy.get('mat-option').eq(0).click();
    cy.wait(1500);

    cy.intercept('POST', '**/supportView/v1/person/fromGroup/**').as(
      'uploadCSV'
    );

    //Click on  Create Users button
    cy.get('.dialog-actions>button>.title')
      .contains(/Create Users|Benutzer Anlegen/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    // cy.wait(10000);
    cy.wait(['@uploadCSV'], {
      timeout: 57000,
    }).then((interception) => {
      // Log the intercepted response
      cy.log('Intercepted response:', interception.response);

      // Assert the response status code
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.wait(2000);
    //Validate success message
    cy.get('sv-multiple-notifications>.messages>p')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();

        // Check if the text matches either English or German message
        expect(trimmedText).to.be.oneOf([
          '2 Users were skipped, because they already exist', // English
          '2 Benutzer wurden übersprungen, da sie bereits existieren', // German
        ]);
      });
    cy.wait(2500);

    //Logout
    cy.get('.logout-icon ').click({ force: true });
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url
    cy.wait(1500);
  }); //end it

  //Y O P M A I L
  it('Yopmail - Confirm email and Change password', () => {
    // Visit yopmail application
    cy.visit('https://yopmail.com/en/');

    // Access the first Admin User object from cypress.config.js
    const csvTestuser = Cypress.env('csvTestuser')[0];
    cy.get('#login').type(csvTestuser.email);

    //cy.get('#login').type('otto.testuser@yopmail.com');

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

        // // Remove Cookie dialog (if shown)
        // cy.iframe('#ifmail')
        //   .find('#onetrust-accept-btn-handler', { timeout: 5000 })
        //   .its('length')
        //   .then((length) => {
        //     if (length > 0) {
        //       cy.iframe('#ifmail').find('#onetrust-accept-btn-handler').click();
        //       cy.log('Cookie dialog accepted.');
        //     } else {
        //       cy.log('Cookie dialog is not shown.');
        //     }
        //   });

        //Wait for Cookie bar
        cy.wait(15000);

        //Remove Cooki dialog (if shown)
        if (cy.iframe('#ifmail').find('#onetrust-accept-btn-handler')) {
          cy.iframe('#ifmail').find('#onetrust-accept-btn-handler').click();
        } else {
          cy.log('Cookie dialog is not shown');
        }

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
        cy.wait(15000);
        //Reset Pasword email

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

          .type(Cypress.env('password_egEbox')); //fill the 1st input field
        cy.iframe('#ifmail').find('.input-eye-icon').eq(1).click(); //Click on Show password icon
        cy.iframe('#ifmail').find('.button').click(); //Click on confirm button

        cy.wait(2000);
      });
  });

  it('Login to e-Box 1st time', () => {
    cy.visit(Cypress.env('baseUrl_egEbox'));
    cy.wait(5000);

    // Wait for the cookie bar to appear
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
    cy.wait(1500);
    // Create the first user (with address)

    // Access the first Admin User object from cypress.config.js
    const csvUser = Cypress.env('csvTestuser')[0];
    // Continue with Login
    cy.log(Cypress.env('companyPrefix'));
    cy.get(':nth-child(1) > .ng-invalid > .input > .input__field-input').type(
      // Cypress.env('companyPrefix') + 'ottoTestuser'
      Cypress.env('companyPrefix') + csvUser.accountNumber
    );

    cy.get('.ng-invalid > .input > .input__field-input').type(
      Cypress.env('password_egEbox')
    );

    // cy.wait(6000);

    // cy.wait(10000);
    // cy.visit(Cypress.env('eboxDeliveryPage'), {
    //   failOnStatusCode: false,
    // });
    cy.wait(5500);

    cy.intercept('POST', '**/rest/v2/deliveries**').as('openDeliveriesPage');
    cy.wait(1000);
    cy.get('button[type="submit"]').click(); //Login to E-Box
    cy.wait(['@openDeliveriesPage'], { timeout: 37000 }).then(
      (interception) => {
        // Log the intercepted response
        cy.log('Intercepted response:', interception.response);

        // Assert the response status code
        expect(interception.response.statusCode).to.eq(200);
        cy.wait(2500);
      }
    );
    cy.wait(7000);
    // Logout
    cy.get('.user-title').click();
    cy.wait(1500);
    cy.get('.logout-title > a').click();
    //cy.url().should('include', payslipJson.baseUrl_egEbox); // Validate url
    cy.url().should('include', Cypress.env('baseUrl_egEbox')); // Validate url
    cy.log('Test completed successfully.');
  });

  // M A S T E R    U S E R - DELETE ALREADY CREATED USERS
  it('Login As Master User - Delete Alredy created Users', () => {
    // Login as Master User using a custom command
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
    //Switch to user section
    cy.get('.action-buttons > .mdc-button').eq(4).click();

    // Array of users to delete
    const usersToDelete = ['otto', 'emma']; // Add more usernames as needed

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
            cy.wait(1500);
            // Confirm delete in the confirmation dialog
            cy.get('.confirm-buttons > button')
              .filter((index, button) => {
                return (
                  Cypress.$(button).text().trim() === 'YES' ||
                  Cypress.$(button).text().trim() === 'JA'
                );
              })
              .click();
            cy.wait(1500);
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

    // Logout
    cy.get('.logout-icon').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl'));
    cy.log('Test completed successfully.');
    cy.wait(2500);
  }); //end it

  it.skip('OLD - Downloads the attachment from Yopmail', () => {
    // Visit Yopmail website
    cy.visit('https://yopmail.com/en/');

    // Enter the support admin email
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));

    //cy.get('#login').type('otto.testuser@yopmail.com');

    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    cy.wait(1500);

    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .eq(0)
      .should('include.text', 'e-Gehaltszettel - Neue Nutzer'); //Validate subject of Verification email
    cy.wait(2500);

    cy.iframe('#ifmail')
      .find('.yscrollbar>a>i')
      .eq(0)
      .click({ multiple: true });

    cy.pause();

    // Get the latest downloaded PDF file
    const downloadsDir = `${Cypress.config(
      'fileServerFolder'
    )}/cypress/downloads/`;

    cy.task('getDownloadedZIP', downloadsDir).then((zipFilePath) => {
      // Keep using getDownloadedPdf task
      expect(zipFilePath, 'Downloaded ZIP file path').to.not.be.null;
      cy.log(`ZIP File Path: ${zipFilePath}`);

      cy.wait(2000);

      // Read the ZIP file as binary
      cy.readFile(zipFilePath, 'binary').then((zipBinary) => {
        const zipBlob = Cypress.Blob.binaryStringToBlob(
          zipBinary,
          'application/zip'
        );
        const zipUrl = URL.createObjectURL(zipBlob);

        // Open the ZIP Blob in the same tab
        cy.window().then((win) => {
          win.location.href = zipUrl;
        });
      });
    });

    cy.wait(3500);
  });

  //chatGbt4

  it('Downloads the attachment and reads PDF inside ZIP', () => {
    cy.visit('https://yopmail.com/en/');
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    cy.wait(1500);

    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .eq(0)
      .should('include.text', 'e-Gehaltszettel - Neue Nutzer');
    cy.wait(2500);

    cy.iframe('#ifmail')
      .find('.yscrollbar>a>i')
      .eq(0)
      .click({ multiple: true });

    const downloadsDir = `${Cypress.config(
      'fileServerFolder'
    )}/cypress/downloads/`;

    cy.task('getDownloadedZIP', downloadsDir).then((zipFilePath) => {
      expect(zipFilePath, 'Downloaded ZIP file path').to.not.be.null;
      cy.log(`ZIP File Path: ${zipFilePath}`);

      cy.task('unzipAndFindPdf', { zipPath: zipFilePath, password: null }).then(
        (pdfPaths) => {
          expect(pdfPaths.length, 'Number of PDFs in ZIP').to.be.greaterThan(0);
          cy.log(`PDF found inside ZIP: ${pdfPaths[0]}`);

          // Now read the extracted PDF file
          cy.readFile(pdfPaths[0], 'base64').then((pdfBase64) => {
            // Create a Blob URL and open PDF in a new tab
            const pdfBlob = Cypress.Blob.base64StringToBlob(
              pdfBase64,
              'application/pdf'
            );
            const pdfUrl = URL.createObjectURL(pdfBlob);

            cy.window().then((win) => {
              const newTab = win.open(pdfUrl, '_blank');
              if (!newTab) {
                throw new Error('Failed to open new tab for PDF preview');
              }
            });
          });
        }
      );
    });
  });

  // it.only('Downloads and extracts password-protected ZIP from Yopmail', () => {
  //   cy.visit('https://yopmail.com/en/');

  //   cy.get('#login').type(Cypress.env('email_supportViewAdmin'));
  //   cy.get('#refreshbut > .md > .material-icons-outlined').click();
  //   cy.wait(1500);

  //   cy.iframe('#ifinbox')
  //     .find('.mctn > .m > button > .lms')
  //     .eq(0)
  //     .click()
  //     .should('include.text', 'e-Gehaltszettel - Neue Nutzer');
  //   cy.wait(2500);

  //   cy.iframe('#ifmail').find('.yscrollbar>a>i').eq(1).click({ force: true });

  //   cy.wait(3000);

  //   //   const downloadsDir = `${Cypress.config(
  //   //     'fileServerFolder'
  //   //   )}/cypress/downloads`;

  //   //   // Get latest ZIP file
  //   //   cy.task('getDownloadedZIP', downloadsDir).then((zipFilePath) => {
  //   //     expect(zipFilePath, 'Downloaded ZIP file path').to.not.be.null;
  //   //     // Assert the file exists
  //   //     cy.log(`Latest PDF File Path: ${zipFilePath}`);
  //   //     cy.wait(3000);

  //   //     //   // const outputFolder = `${downloadsDir}/unzipped`;

  //   //     //   // // Extract ZIP
  //   //     //   // cy.task('extractPasswordProtectedZip', {
  //   //     //   //   zipFilePath,
  //   //     //   //   password: 'sf7ydw6ygz9x', // Replace with actual password
  //   //     //   //   outputDir: outputFolder,
  //   //     //   // }).then((result) => {
  //   //     //   //   expect(result.success, 'ZIP extraction success').to.be.true;
  //   //     //   //   expect(result.pdfCount, 'Extracted PDF count').to.be.greaterThan(0);
  //   //     //   //   cy.log(`Extracted ${result.pdfCount} PDF(s)`);
  //   //     //   // });
  //   //   });

  //   const downloadsDir = `${Cypress.config(
  //     'fileServerFolder'
  //   )}/cypress/downloads`;

  //   // Step 1: Get the latest ZIP file
  //   cy.task('getDownloadedZIP', downloadsDir).then((zipFilePath) => {
  //     expect(zipFilePath, 'ZIP file path').to.not.be.null;
  //     cy.log(`Latest ZIP File Path: ${zipFilePath}`);

  //     const outputFolder = `${downloadsDir}/unzipped`;

  //     // Step 2: Extract the ZIP file with password
  //     cy.task('extractPasswordProtectedZip', {
  //       zipFilePath,
  //       password: 'buybrf4mzab4', // Required password
  //       outputDir: outputFolder,
  //     }).then((result) => {
  //       // expect(result.success, 'ZIP extraction success').to.be.true;
  //       cy.log(`Extracted ${result.pdfCount} file(s) to: ${outputFolder}`);

  //       // Step 3: Try to open first PDF (simulate ZIP open)
  //       cy.task('getExtractedPdf', outputFolder).then((firstPdfPath) => {
  //         expect(firstPdfPath, 'Extracted PDF path').to.not.be.null;

  //         cy.readFile(firstPdfPath, 'binary').then((pdfBinary) => {
  //           const pdfBlob = Cypress.Blob.binaryStringToBlob(
  //             pdfBinary,
  //             'application/pdf'
  //           );
  //           const pdfUrl = URL.createObjectURL(pdfBlob);
  //           console.log('pdfUrl ', pdfUrl);
  //           cy.window().then((win) => {
  //             win.location.href = pdfUrl; // Simulate opening file
  //           });
  //         });
  //       });
  //     });
  //   });
  // });

  it('downloads a ZIP, extracts with 7z, opens first PDF', () => {
    cy.visit('https://yopmail.com/en/');
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));
    cy.get('#refreshbut .material-icons-outlined').click();
    cy.wait(2000);

    cy.frameLoaded('#ifinbox');
    cy.iframe('#ifinbox')
      .find('.mctn .m button .lms')
      .eq(0)
      .click()
      .should('contain.text', 'e-Gehaltszettel - Neue Nutzer');
    cy.wait(2000);

    cy.frameLoaded('#ifmail');
    cy.iframe('#ifmail')
      .find('.yscrollbar a')

      .then(($a) => {
        const zipUrl = $a.prop('href');

        cy.downloadBinary(zipUrl, 'attachment.zip').then((zipPath) => {
          const outputDir = path.join(
            Cypress.config('downloadsFolder'),
            'unzipped'
          );

          cy.task('extractPasswordProtectedZip', {
            zipFilePath: zipPath,
            password: 'buybrf4mzab4',
            outputDir,
          }).then(({ success, pdfCount, pdfPath, error }) => {
            expect(success, error || 'Extraction failed').to.be.true;
            expect(pdfCount, 'should find at least 1 PDF').to.be.greaterThan(0);
            expect(pdfPath, 'pdfPath should be set').to.be.a('string');

            cy.readFile(pdfPath, 'binary').then((pdfBin) => {
              const blob = Cypress.Blob.binaryStringToBlob(
                pdfBin,
                'application/pdf'
              );
              cy.visit(URL.createObjectURL(blob));
            });
          });
        });
      });
  });

  // const path = require('path');

  it('OLD - Downloads the attachment from Yopmail', () => {
    // Visit Yopmail website
    cy.visit('https://yopmail.com/en/');

    // Enter the support admin email
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));

    //cy.get('#login').type('otto.testuser@yopmail.com');

    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    cy.wait(1500);

    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .eq(0)
      .should('include.text', 'e-Gehaltszettel - Neue Nutzer'); //Validate subject of Verification email
    cy.wait(2500);

    cy.iframe('#ifmail')
      .find('.yscrollbar>a>i')
      .eq(0)
      .click({ multiple: true });

    // Get the latest downloaded PDF file
    const downloadsDir = `${Cypress.config(
      'fileServerFolder'
    )}/cypress/downloads/`;

    cy.task('getDownloadedZIP', downloadsDir).then((zipFilePath) => {
      // Keep using getDownloadedPdf task
      expect(zipFilePath, 'Downloaded ZIP file path').to.not.be.null;
      cy.log(`ZIP File Path: ${zipFilePath}`);

      cy.wait(2000);

      // Read the ZIP file as binary
      cy.task('openPasswordProtectedPdf', {
        password: 'cx7qwx8nzs3a',
      }).then((result) => {
        expect(result.success, 'PDF open from ZIP').to.be.true;
        expect(result.numPages, 'PDF pages').to.be.greaterThan(0);
      });
    });

    cy.wait(3500);
  });

  //chatGbt4

  it.only('should trigger download and read first PDF', () => {
    cy.downloadZipFromYopmail(); // custom command
    cy.wait(4000); // wait for ZIP to download

    cy.task('downloadZipAndReadPdf'); // handle ZIP + PDF processing
  });
}); //end describe
