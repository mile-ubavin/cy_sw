/// <reference types="cypress" />
import { parseGermanDateTime } from '../../../../../support/utils/dateUtils';

describe('DH Upload Dictionary (305)', () => {
  const findAndCheckElement = (searchCriteria) => {
    cy.get('table > tbody > tr')
      .each(($row) => {
        const rowText = $row.text().trim();
        searchCriteria.forEach((criteria) => {
          if (rowText.includes(criteria)) {
            cy.wrap($row)
              .find('td>input[type="checkbox"]')
              .should('exist')
              .check({ force: true });
            cy.log(`Checked: ${criteria}`);
          }
        });
      })
      .then(() => {
        cy.get('.mat-mdc-paginator-navigation-next').then(($nextButton) => {
          if (!$nextButton.prop('disabled')) {
            cy.wrap($nextButton).click();
            cy.wait(500);
            findAndCheckElement(searchCriteria);
          } else {
            cy.log('No more pages to check');
          }
        });
      });
  };

  it('Enable pdfDictionary by Masteruser', () => {
    cy.loginToSupportViewMaster(); // Login as a master user

    cy.dismissReleaseNotePopup();

    cy.intercept('GET', '**/group/template/tenant/**').as('apiRequest');

    // Search for Group section
    cy.get('#searchButton>span').click({ force: true });

    // Search for Group by Display Name using the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(0)
      .type(Cypress.env('company'));

    // Find and click the search button
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    // Search for  PDF Dictionary button and click on it
    cy.get('.mdc-button__label')
      .contains(/Assign PDF Dictionary|PDF Dictionary zuweisen/i)
      .should('be.visible')
      .click();

    // Get dictionary names from JSON
    const enablePDFDictionary = Cypress.env('enablePDFDictionary');
    cy.log('enablePDFDictionary:', enablePDFDictionary);

    if (!enablePDFDictionary || enablePDFDictionary.length === 0) {
      throw new Error('No dictionary names found in Cypress.env');
    }

    const searchCriteria = enablePDFDictionary.map((item) => item.name);
    cy.log('Search Criteria:', searchCriteria);

    // Ensure the table is visible before processing
    cy.get('table > tbody', { timeout: 10000 }).should('be.visible');

    //Enable PDF Dictionary according Search Criteria
    cy.get('table > tbody > tr').each(($row) => {
      const rowText = $row.text().trim();
      cy.log(`Checking row: ${rowText}`);

      // If row matches any criteria, check the checkbox
      searchCriteria.forEach((criteria) => {
        if (rowText.includes(criteria)) {
          cy.wrap($row)
            .find('td>input[type="checkbox"]')
            .should('exist')
            .check({ force: true });
          cy.log(`Checked: ${criteria}`);
        }
      });
    });
    cy.wait(1500);
    // Check if next page exists and navigate
    cy.get('.mat-mdc-paginator-navigation-next').then(($nextButton) => {
      if (!$nextButton.prop('disabled')) {
        cy.wrap($nextButton).click();
        cy.wait(500);
        findAndCheckElement(searchCriteria); // Recursively check next page
      } else {
        cy.log('No more pages to check');
      }
    });
    //}
    cy.wait(2000);
    // Save the changes
    cy.get('button>.title')
      .contains(/Save|Übernehmen/i)
      .should('be.visible')
      .click();

    // Verify the success message
    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /PDF Dictionary has been assigned successfully|PDF Dictionary wurde erfolgreich zugewiesen/,
        );
      });

    // Logout — svLogout waits for loading-wrapper to clear before clicking
    cy.svLogout();
    cy.log('Test completed successfully.');
  });

  //Enable All Roles
  it('Enable All Roles', () => {
    cy.loginToSupportViewMaster();
    cy.dismissReleaseNotePopup();
    cy.svSearchCompany();
    cy.svOpenAdminUserRights(Cypress.env('username_supportViewAdmin'));
    cy.svUpdateRoles(
      [
        ['Company Admin', 'Firmen-Administrator'],
        ['Customer Creator', 'Nutzeranlage'],
        ['Data Submitter', 'Versand'],
        ['View E-Box', 'E-Box ansehen'],
        ['HR Manager', 'HR Manager'],
      ],
      [],
    );
    cy.svSaveRoles();
    cy.svLogout();
    cy.log('Test completed successfully.');
  }); //end it

  //Upload pdf - From Personal Document Upload
  it.only('DH - Upload pdfDictionary 305_Dictionary (verify Error and Success messages)', () => {
    let uploadDateTime = ''; // Global variable to store upload date & time

    // ===== STEP 1: Login to DocumentHub =====
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.url().should('include', Cypress.env('dh_baseUrl'));

    cy.dismissCookieBar();

    // Login to DocumentHub using custom command
    cy.loginToDH();
    cy.wait(2000);
    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);

    // ===== STEP 2: Open Personal Document Upload Dialog =====
    cy.scrollTo('top', { duration: 200 });

    cy.get('#workspace-personal-document-action')
      .should('be.visible')
      .contains(/Persönliches Dokument|Personal Document/i)
      .click({ force: true });
    cy.wait(1500);

    // ===== STEP 3: Validate Upload Dialog =====
    cy.get('#personal-document-title')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Personal Document Upload|Upload Document/i,
        );
      });

    cy.get('#file-requirements')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Maximum file size is 50 MB and a maximum of 10 documents can be uploaded/i,
        );
      });
    cy.wait(1000);

    // ===== STEP 4: Upload PDF with Invalid Dictionary =====
    cy.log('>>> Test Scenario 1: Upload with Invalid Dictionary (301)');
    cy.intercept('GET', '**/group/dictionary/tenant/**').as('getDictionaries');
    cy.DHupload305Dictionary();
    cy.wait(2500);

    // Select invalid dictionary from dropdown
    cy.wait('@getDictionaries', { timeout: 35000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('Dictionary list fetched successfully');
    });
    // Select invalid dictionary (301)
    cy.get('#dictionary-dropdown').click({ force: true });
    cy.wait(1000);

    cy.get('li[data-value]').should('have.length.at.least', 1);
    cy.get('li[data-value="PDFTABDictionary-301"]')
      .should('be.visible')
      .click({ force: true });
    cy.log('Selected invalid dictionary: PDFTABDictionary-301');
    cy.wait(1500);

    // ===== STEP 5: Click Next and Check for Processing Error =====
    cy.intercept('POST', '**/checkDocumentProcessingStatus').as(
      'checkProcessing',
    );

    // cy.get('#upload')
    cy.get('.linkbtn--primary')
      .should('be.enabled')
      .contains(/Weiter|Next/i)
      .click();

    // Wait for processing to complete
    function waitForProcessingComplete() {
      cy.wait('@checkProcessing', { timeout: 45000 }).then((interception) => {
        const isDone =
          interception.response.body.processingOver === true ||
          interception.response.body.processingOver === 'true';

        cy.log(`Processing status: ${isDone ? 'Complete' : 'In progress'}`);

        if (!isDone) {
          waitForProcessingComplete();
        }
      });
    }

    waitForProcessingComplete();
    cy.wait(2000);

    // ===== STEP 6: Verify Error Message for Invalid Dictionary =====
    cy.get('#file-list span')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Meta data could not be extracted|Metadaten konnten nicht extrahiert werden/i,
        );
        cy.log('Error message verified: Meta data extraction failed');
      });

    // Verify Send button is disabled
    cy.get('button[aria-label="Send documents"]').should('be.disabled');
    cy.log('Send button correctly disabled due to error');
    cy.wait(1500);

    cy.pause(); // Pause for manual inspection if needed
    // ===== STEP 7: Remove Invalid File =====
    cy.get(
      'button[aria-label="Remove 305_Dictionary_(AQUA_ABBA000100279311).pdf"]',
    ).click();
    cy.log('Removed file with invalid dictionary');
    cy.wait(1500);

    // ===== STEP 8: Re-upload with Correct Dictionary =====

    cy.intercept('GET', '**/group/dictionary/tenant/**').as('getDictionaries');
    cy.DHupload305Dictionary();
    cy.wait(2500);

    // Select invalid dictionary from dropdown
    cy.wait('@getDictionaries', { timeout: 15000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('Dictionary list fetched successfully');
      // Select invalid dictionary (301)
      cy.get('#dictionary-dropdown', { timeout: 15000 }).click({ force: true });
      cy.wait(1000);
    });

    cy.get('li[data-value]').should('have.length.at.least', 1);
    cy.get('li[data-value="PDFTABDictionary-305"]')
      .should('be.visible')
      .click({ force: true });
    cy.log('Selected correct dictionary: PDFTABDictionary-305');
    cy.wait(1500);

    // ===== STEP 9: Capture Upload DateTime =====
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formattedDate = `${day}.${month}.${year}`;
    const formattedTime = now
      .toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      .trim();

    uploadDateTime = `${formattedDate} ${formattedTime}`;
    cy.log(`Upload DateTime: ${uploadDateTime}`);
    Cypress.env('uploadDateTime', uploadDateTime);

    // ===== STEP 10: Process Document and Verify Success =====
    cy.intercept('POST', '**/checkDocumentProcessingStatus').as(
      'checkProcessing2',
    );

    cy.get('#upload')
      .should('be.enabled')
      .contains(/Weiter|Next/i)
      .click();

    cy.wait('@checkProcessing2', { timeout: 15000 }).then((interception) => {
      const isDone =
        interception.response.body.processingOver === true ||
        interception.response.body.processingOver === 'true';
      expect(isDone).to.eq(true);
      cy.log('✓ Document processing completed successfully');
    });

    // ===== STEP 11: Verify Success Message =====
    cy.get('#file-list span')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Document successfully uploaded|Dokument erfolgreich hochgeladen/i,
        );
        cy.log('✓ Success message verified');
      });
    cy.wait(1500);

    // ===== STEP 12: Send Documents =====
    cy.intercept('POST', '**/deliveryHandler/sendDocuments').as(
      'sendDocuments',
    );

    cy.get('button[aria-label="Send documents"]').should('be.enabled').click();

    cy.wait('@sendDocuments', { timeout: 20000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('delivery sent successfully');
    });
    cy.wait(2000);

    // ===== STEP 13: Close Success Dialog and Validate Home Page =====
    cy.get('button[type="button"]')
      .contains(/Fertig|Done|Finish/i)
      .should('be.visible')
      .click({ force: true });
    cy.wait(1000);

    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);
    cy.log('Test completed successfully - returned to home page');
    cy.wait(2500);

    // Logout from DH
    cy.get('.MuiButton-text').click();
    cy.wait(1000);
    cy.get('li[role="menuitem"]')
      .contains(/Abmelden|Logout/i)
      .click();
    cy.url().should('include', Cypress.env('dh_baseUrl'));
    cy.log('Upload finished successfully.');
    cy.wait(2500);
  }); //end it

  // Login to e-Box and open delivery if timestamps match logic
  it('Login to e-Box and Open Delivery', () => {
    // Log into e-Box
    cy.loginToEgEbox();
    cy.wait(2000);

    // Retrieve upload time stored in previous test
    let uploadDateTime = Cypress.env('uploadDateTime');

    // If uploadDateTime is not set (test run in isolation), generate current time
    if (!uploadDateTime) {
      const now = new Date();
      const formattedDate = now.toLocaleDateString('de-DE'); // Format: dd.mm.yyyy
      const formattedTime = now.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      uploadDateTime = `${formattedDate} ${formattedTime}`;
      cy.log(
        `Upload DateTime not found, using current time: ${uploadDateTime}`,
      );
    } else {
      cy.log(`Stored Upload DateTime: ${uploadDateTime}`);
    }

    // Find latest delivery and extract its date/time
    cy.get('.date-of-delivery-cell > .half-cell-text-content')
      .first() // latest delivery
      .should('be.visible')
      .invoke('text')
      .then((readTextRaw) => {
        // Clean text (remove commas/spaces)
        const readClean = readTextRaw
          .replace(',', ' ')
          .replace(/\s+/g, ' ')
          .trim();

        // --- Convert both datetimes to comparable JS Date objects ---
        const uploadParsed = parseGermanDateTime(uploadDateTime);
        const readParsed = parseGermanDateTime(readClean);

        // --- Calculate difference in milliseconds ---
        const diffMs = Math.abs(readParsed - uploadParsed);
        const diffMin = diffMs / (1000 * 60);

        cy.log(`Upload DateTime: ${uploadDateTime}`);
        cy.log(`Read DateTime: ${readClean}`);
        cy.log(`Upload Parsed: ${uploadParsed}`);
        cy.log(`Read Parsed: ${readParsed}`);
        cy.log(`Difference: ${diffMin.toFixed(2)} minutes`);

        // --- Apply the condition: delivery date matches upload date (format-agnostic) ---
        const datesMatch =
          uploadParsed.getDate() === readParsed.getDate() &&
          uploadParsed.getMonth() === readParsed.getMonth() &&
          uploadParsed.getFullYear() === readParsed.getFullYear();
        if (datesMatch) {
          cy.log(
            `✓ Test PASSED: Delivery date matches upload date. Diff: ${diffMin.toFixed(2)} min`,
          );

          // Intercept backend calls for document load
          cy.intercept('GET', '**/getDocument/**').as('getDocument');
          cy.intercept('GET', '**/getIdentifications?**').as(
            'getIdentifications',
          );

          // Click on the latest delivery
          cy.get('.mdc-data-table__content>tr>.subject-sender-cell')
            .eq(0)

            .click({ force: true });

          // Open the latest delivery
          cy.get('.delivery-document').click({ force: true });

          // Wait for identifications response
          cy.wait(['@getIdentifications'], { timeout: 57000 }).then(
            (interception) => {
              expect(interception.response.statusCode).to.eq(200);
            },
          );

          // Scroll to bottom of the delivery
          cy.get('.content-container>.scroll-container')
            .eq(1)
            .scrollTo('bottom', { duration: 500, ensureScrollable: false });
          cy.wait(3500);
        } else {
          // FAIL: delivery date does not match upload date
          const errorMsg = `✗ Test FAILED: Delivery date (${readClean.split(' ')[0]}) does not match upload date (${uploadDateTime.split(' ')[0]}). Delivery not found today.`;
          cy.log(errorMsg);

          // Log out the user before failing
          cy.get('.user-title').click({ force: true });
          cy.wait(1000);
          cy.get('.logout-title > a').click();
          cy.url().should('include', Cypress.env('baseUrl_egEbox'));

          // Throw error to fail test
          throw new Error(errorMsg);
        }
        // Log out the user after successful validation
        cy.get('.user-title').click({ force: true });
        cy.wait(1000);
        cy.get('.logout-title > a').click();
        cy.url().should('include', Cypress.env('baseUrl_egEbox'));
      });
  });

  //Admin user check Reporting email and delte all emails
  it('Yopmail - Get Reporting email and delte all emails', () => {
    cy.on('uncaught:exception', () => false);

    // Visit Yopmail
    cy.visit('https://yopmail.com/en/');

    // Enter the support admin email
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));

    // Click the refresh button
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    //Custom functions:
    // Define email subject function
    function emailSubject(index) {
      cy.iframe('#ifinbox')
        .find('.mctn > .m > button > .lms')
        .eq(index)
        .should('include.text', 'Versandreport DocuHub Portal');
    }

    // Access the inbox iframe and validate the email subject
    emailSubject(0); // Validate subject of Reporting email

    cy.iframe('#ifmail')
      .find('#mail > div')
      .invoke('text') // Get the text content
      .then((text) => {
        // Log the email body text
        cy.log('Email Body Text:', text);

        // Normalize spaces for comparison
        const normalizedText = text.trim().replace(/\s+/g, ' '); // Normalize extra spaces

        // Validate that the email body contains the expected text
        expect(normalizedText).to.include(
          'Sie haben 1 Sendung(en) erfolgreich digital in das DocuHub Portal Ihrer Benutzer*innen eingeliefert',
        );
        expect(normalizedText).to.include(
          'Zusätzlich haben Sie 0 Sendung(en) erfolgreich über den postalischen Weg als Brief versendet. Das Dokument wird von uns über das „Einfach Brief“-Portal gedruckt, kurvertiert und an die Adresse des Benutzers versendet.',
        );
        expect(normalizedText).to.include('Ihr DocuHub Team');
      });

    cy.wait(4500);

    // Delete all emails
    cy.get('.menu>div>#delall')
      .should('not.be.disabled')
      .click({ force: true });
    cy.wait(2500);
  });
});
