describe('Broadcast delivery to Specific User', () => {
  let uploadDateTime; // shared across tests

  // before(() => {
  //   // prepare document and capture uploadDateTime
  //   const now = new Date();
  //   const formattedDate = now.toLocaleDateString('de-DE');
  //   const formattedTime = now.toLocaleTimeString('de-DE', {
  //     hour: '2-digit',
  //     minute: '2-digit',
  //     hour12: false,
  //   });

  //   uploadDateTime = `${formattedDate} ${formattedTime}`;
  //   Cypress.env('uploadDateTime', uploadDateTime);
  // });

  //Send elivery to Specific user, when HR role is enabled
  it.only('Send Delivery to selected-specific user', () => {
    cy.loginToSupportViewAdmin(); // Login as a master user
    cy.wait(1500);

    // // Reuse existing uploadDateTime (from previous test) if needed
    // const existingUploadDateTime = Cypress.env('uploadDateTime') || '';
    // cy.log(`Existing Upload DateTime: ${existingUploadDateTime}`);

    // Capture and save uploadDateTime
    const now = new Date();
    const formattedDate = now.toLocaleDateString('de-DE'); // dd.mm.yyyy
    const formattedTime = now.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const uploadDateTime = `${formattedDate} ${formattedTime}`;
    cy.log(`Upload DateTime: ${uploadDateTime}`);

    // Save globally for later validation
    Cypress.env('uploadDateTime', uploadDateTime);

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
    cy.wait(2500);

    // Click the "User" button within the action buttons
    cy.get('.action-buttons > button > .mdc-button__label')
      .last() // Select the last matched element
      .click(); // Click the matched "User" button
    cy.wait(2500);

    //Click on Select users to deliver documents button
    cy.get('.button-wraper>button>.mdc-button__label')
      .contains(
        /Select users to deliver documents|Benutzer für die Zustellung von Dokumenten auswählen/i
      )
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    // Search for the specific user by name
    cy.get('.dictionary-xml__search-container-input>input').type(
      Cypress.env('username_egEbox')
    );
    cy.wait(3500);

    // Find and check the checkbox in the row if it's not already checked
    cy.get('input[type="checkbox"]').eq(1).click();

    cy.wait(2500);
    //Click on Next buton
    cy.get('button>.title')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Next' || text === 'Nächste';
      })
      .click();
    cy.wait(1500);

    //Click on Upload Document button
    cy.get('body').then(($body) => {
      if ($body.find('.buttons-wrapper>button').length > 0) {
        cy.get('.buttons-wrapper>button>.title')
          .filter((index, el) => {
            const text = Cypress.$(el).text().trim();
            return text === 'Upload Document' || text === 'Dokument hochladen';
          })
          .click();
        cy.wait(1500);
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(1500);

    //Uplad valid document (x1 A4 pdf file)
    cy.massUpload();
    cy.wait(2000);

    //Add Delivery Title
    const title = `Delivery For Specific User (pdf) - ${uploadDateTime}`;

    cy.get('input[formcontrolname="subject"]').clear().type(title);
    cy.wait(1500);

    cy.get('.dialog-actions>button>.title')
      .contains(/Upload|hochladen/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    //Click on Send delivery
    cy.get('.dialog-actions>button>.title')
      .contains(/Send|Senden/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    //Confirm Sending dialog
    cy.get('.dialog-container>.dialog-footer>.dialog-actions>button>.title')
      .contains(/ Confirm |Bestätigen/i)
      .then(($button) => {
        if (!$button.is(':disabled')) {
          cy.log('All signatures are signed, clicking Save.');
          cy.wait(1500);
          cy.wrap($button).click({ force: true });
          cy.wait(4500);

          // Update uploadDateTime here to reflect SIGNED time
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

          const newUploadDateTime = `${formattedDate} ${formattedTime}`;
          Cypress.env('uploadDateTime', newUploadDateTime);
          cy.log(`Updated Upload DateTime after signing: ${newUploadDateTime}`);
        } else {
          cy.log('Save button is disabled. Ensure all signatures are signed.');
        }
      });

    cy.wait(4500);

    // Verify the success message
    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /We are processing in the background|Wir verarbeiten im Hintergrund/
        );
      });
    // //Wait 2 min 30 sec
    // cy.wait(250000);
    // Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url'
    cy.log('Test completed successfully.');
    cy.wait(2500);
  }); //end it

  // //Login to e-Box and Open Delivery
  it.only('Login to e-Box and Open Delivery', () => {
    // 1️⃣ Login to e-Box
    cy.loginToEgEbox();
    cy.wait(2000);

    // 2️⃣ Get upload datetime from environment
    const uploadRaw = Cypress.env('uploadDateTime');
    expect(uploadRaw, 'Upload (sending) datetime must exist').to.exist;
    cy.log(`Raw upload datetime: ${uploadRaw}`);

    // 3️⃣ Function to parse date safely
    const parseFlexibleDate = (input) => {
      if (!input) return null;

      // Try native Date
      const direct = new Date(input);
      if (!isNaN(direct.getTime())) return direct;

      // Try German-like "dd.mm.yyyy hh:mm[:ss]" format
      const match = input.match(
        /(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?/
      );
      if (match) {
        const [, dd, mm, yyyy, hh, min, ss] = match;
        return new Date(
          Number(yyyy),
          Number(mm) - 1,
          Number(dd),
          Number(hh),
          Number(min),
          Number(ss || 0)
        );
      }

      throw new Error(`Unsupported datetime format: ${input}`);
    };

    // 4️⃣ Function to format datetime as "dd/mm/yyyy - HH:mm"
    const formatToMinute = (date) => {
      const pad = (num) => num.toString().padStart(2, '0');
      return `${pad(date.getDate())}/${pad(
        date.getMonth() + 1
      )}/${date.getFullYear()} - ${pad(date.getHours())}:${pad(
        date.getMinutes()
      )}`;
    };

    // 5️⃣ Parse and format upload datetime
    const sendingDate = parseFlexibleDate(uploadRaw);
    const sendingFormatted = formatToMinute(sendingDate);
    cy.log(`Upload datetime (rounded to min): ${sendingFormatted}`);

    // 6️⃣ Get and compare datetime
    cy.get('.date-of-delivery-cell > .half-cell-text-content')
      .first()
      .should('be.visible')
      .invoke('text')
      .then((textRaw) => {
        // 7️⃣ Clean and parse datetime
        const clean = textRaw.replace(',', ' ').replace(/\s+/g, ' ').trim();
        const readDate = parseFlexibleDate(clean);
        const readFormatted = formatToMinute(readDate);
        cy.log(`read datetime (rounded to min): ${readFormatted}`);

        // 8️⃣ Compare formatted values
        if (readFormatted >= sendingFormatted) {
          //Open latest created deivery
          cy.intercept(
            'GET',
            '**/hybridsign/backend_t/document/v1/getDocument/**'
          ).as('getDocument');
          cy.intercept('GET', '**/getIdentifications?**').as(
            'getIdentifications'
          );
          cy.get('.mdc-data-table__content>tr>.subject-sender-cell')
            .eq(0)
            .click({ force: true });

          cy.wait(['@getIdentifications'], { timeout: 57000 }).then(
            (interception) => {
              // Log the intercepted response
              cy.log('Intercepted response:', interception.response);

              // Assert the response status code
              expect(interception.response.statusCode).to.eq(200);
            }
          );

          // Scroll to the bottom of the PDF viewer or page
          cy.get('.content-container>.scroll-container')
            .eq(1)
            .scrollTo('bottom', {
              duration: 500,
              ensureScrollable: false,
            });
          cy.wait(3500);
        } else {
          cy.log(
            `Error: Upload (${sendingFormatted}) and (${readFormatted}) are not correct.`
          );

          // // 9️⃣ Logout user if mismatch
          // cy.get('.user-title').click({ force: true });
          // cy.wait(1000);
          // cy.get('.logout-title > a').click();
          // cy.url().should('include', Cypress.env('baseUrl_egEbox'));

          throw new Error(
            `SupportView time (${readFormatted}) does not match Upload time (${sendingFormatted})`
          );
        }
      });

    // 🔟 Cleanup logout (in case test continues)
    cy.get('.user-title').click({ force: true });
    cy.wait(1000);
    cy.get('.logout-title > a').click();
    cy.url().should('include', Cypress.env('baseUrl_egEbox'));
    cy.log('Test completed successfully.');
  });

  //Login to e-Box and Open Delivery
  it.skip('Ebox user Open delivery', () => {
    cy.loginToEgEbox();
    cy.wait(2500);

    // Step 2: Get the stored uploadDateTime from E-Box signing test
    const uploadDateTime = Cypress.env('uploadDateTime');
    expect(uploadDateTime, 'Upload DateTime must exist').to.not.be.empty;
    cy.log(`Comparing with Upload DateTime: ${uploadDateTime}`);

    // Extract DateTime (Datum column from first row of results)

    // cy.get('.date-of-delivery-cell > .half-cell-text-content')
    //   .first() // take the first match
    //   .should('be.visible') // ensure it's visible
    //   .invoke('text') // extract text content
    //   .then((docText) => {
    //     const extracted = docText.trim(); // remove extra spaces/newlines
    //     cy.log(`Extracted DateTime: ${extracted}`);

    //     cy.pause();

    // Step 8: Extract DateTime (Datum column from first row of results)
    cy.get('.date-of-delivery-cell > .half-cell-text-content')
      .first() // take the first match
      .should('not.be.empty') // Must not be empty
      .invoke('text')
      .then((docText) => {
        cy.log(`Extracted DateTime from SupportView: ${docText}`);

        // Step 9: Normalize helper (remove commas/spaces)
        const normalize = (val) => val.replace(',', ' ').trim();

        // Step 10: Parse date string (dd.mm.yyyy HH:mm:ss → Date object, +2h)
        const parseDateTime = (dateTimeStr) => {
          const [datePart, timePart] = dateTimeStr.split(' ');
          const [day, month, year] = datePart.split('.').map(Number);
          const [hour, minute] = timePart.split(':').map(Number);

          // Add +2h to match expected local time
          return new Date(year, month - 1, day, hour + 2, minute || 0);
        };

        // Step 11: Normalize both timestamps (E-Box & SupportView)
        const normalizedUpload = normalize(uploadDateTime);
        const normalizedDoc = normalize(docText);

        // Step 12: Convert both into Date objects
        const uploadedTime = parseDateTime(normalizedUpload);
        const extractedTime = parseDateTime(normalizedDoc);

        // Step 13: Allow time drift of up to +1 min
        const minAllowedTime = new Date(uploadedTime);
        const maxAllowedTime = new Date(uploadedTime);
        maxAllowedTime.setMinutes(uploadedTime.getMinutes() + 1);

        // Step 14: Assert SupportView time is >= E-Box upload time
        expect(
          extractedTime,
          'Extracted SupportView time should be >= upload time'
        ).to.be.at.least(minAllowedTime);

        // Step 15: Assert SupportView time is <= E-Box upload time + 1 min
        expect(
          extractedTime,
          'Extracted SupportView time should be <= upload time + 1 min'
        ).to.be.at.most(maxAllowedTime);

        // Step 16: Log success validation
        cy.log(
          `SupportView DateTime (${normalizedDoc}) is within 1 min of UploadDateTime (${normalizedUpload}).`
        );

        cy.wait(4000);
      });

    cy.pause();

    //Open latest created deivery
    cy.intercept(
      'GET',
      '**/hybridsign/backend_t/document/v1/getDocument/**'
    ).as('getDocument');
    cy.intercept('GET', '**/getIdentifications?**').as('getIdentifications');
    cy.get('.mdc-data-table__content>tr>.subject-sender-cell')
      .eq(0)
      .click({ force: true });

    cy.wait(['@getIdentifications'], { timeout: 57000 }).then(
      (interception) => {
        // Log the intercepted response
        cy.log('Intercepted response:', interception.response);

        // Assert the response status code
        expect(interception.response.statusCode).to.eq(200);
      }
    );

    // Scroll to the bottom of the PDF viewer or page
    // cy.get('.content-container>.scroll-container').eq(1).scrollTo('bottom', {
    //   duration: 500,
    //   ensureScrollable: false,
    // });
    cy.wait(3500);

    // Logout
    cy.get('.user-title').click();
    cy.wait(1500);
    cy.get('.logout-title > a').click();
    cy.url().should('include', Cypress.env('baseUrl_egEbox')); // Validate url
    cy.log('Test completed successfully.');
  });

  //New

  // Simple, robust version: Compare sending vs SupportView datetime
  it.skip('Compare SupportView (read) time with Upload (sending) time', () => {
    // 1️⃣ Login to e-Box
    cy.loginToEgEbox();
    cy.wait(2000);

    // 2️⃣ Get the stored upload datetime
    const uploadRaw = Cypress.env('uploadDateTime');
    expect(uploadRaw, 'Upload (sending) datetime must exist').to.exist;
    cy.log(`📤 Raw upload datetime from env: ${uploadRaw}`);

    // 3️⃣ Normalize and parse upload datetime
    const parseFlexibleDate = (input) => {
      if (!input) return null;

      // Try if it’s already a valid Date (like ISO string)
      const direct = new Date(input);
      if (!isNaN(direct.getTime())) return direct;

      // Try parsing "dd.mm.yyyy HH:mm[:ss]"
      const match = input.match(
        /(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?/
      );
      if (match) {
        const [, dd, mm, yyyy, hh, min, ss] = match;
        return new Date(
          Number(yyyy),
          Number(mm) - 1,
          Number(dd),
          Number(hh),
          Number(min),
          Number(ss || 0)
        );
      }

      throw new Error(`❌ Unsupported datetime format: ${input}`);
    };

    const sendingDate = parseFlexibleDate(uploadRaw);
    cy.log(`✅ Parsed upload datetime: ${sendingDate.toISOString()}`);

    // 4️⃣ Extract the SupportView time (first delivery row)
    cy.get('.date-of-delivery-cell > .half-cell-text-content')
      .first()
      .should('be.visible')
      .invoke('text')
      .then((textRaw) => {
        const clean = textRaw.replace(',', ' ').replace(/\s+/g, ' ').trim();
        cy.log(`📥 Extracted SupportView datetime (raw): "${clean}"`);

        const readDate = parseFlexibleDate(clean);
        cy.log(`✅ Parsed SupportView datetime: ${readDate.toISOString()}`);

        // 5️⃣ Calculate difference in minutes
        const diffMs = Math.abs(readDate - sendingDate);
        const diffMin = diffMs / 60000;
        cy.log(
          `⏱️ Difference between upload and SupportView: ${diffMin.toFixed(
            2
          )} minutes`
        );

        // 6️⃣ Assertion: must be within ±3 min
        expect(
          diffMin,
          `SupportView time should be within ±3 min of upload time (difference: ${diffMin.toFixed(
            2
          )} min)`
        ).to.be.lessThan(3);

        cy.log('✅ Time difference within ±3 minutes — validation successful.');
      });

    // 7️⃣ Logout
    cy.get('.user-title').click();
    cy.wait(1000);
    cy.get('.logout-title > a').click();
    cy.url().should('include', Cypress.env('baseUrl_egEbox'));
    cy.log('✅ Test completed successfully.');
  });

  //Admin user check Reporting email
  it('Yopmail - Get Reporting email', () => {
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
        .should('include.text', 'Versandreport e-Gehaltszettel Portal');
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
          'Sie haben 1 Sendung(en) erfolgreich digital in das e-Gehaltszettel Portal Ihrer Benutzer*innen eingeliefert'
        );
        expect(normalizedText).to.include(
          'Zusätzlich haben Sie 0 Sendung(en) erfolgreich über den postalischen Weg als Brief versendet. Das Dokument wird von uns über das „Einfach Brief“-Portal gedruckt, kurvertiert und an die Adresse des Benutzers versendet.'
        );
        expect(normalizedText).to.include('Ihr e-Gehaltszettel Team');
      });

    cy.wait(4500);

    // Switch to the second email
    //cy.iframe('#ifinbox').find('.mctn > .m > button > .lms').eq(1).click();

    // emailSubject(1); // Validate subject of second email
    // cy.wait(1500);
    // emailBody(); // Validate second email body

    //cy.wait(4500);
  });

  //Enable hrManagement flag on Company
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
      // cy.url().should('include', payslipJson.baseUrl); // Validate url'
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
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(1)
      .type(Cypress.env('company')); // Use the company name from the cypress.config.js
    cy.wait(1500);
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

  //Send elivery to Specific user, when HR role is enabled
  it('Send Delivery to selected-specific user', () => {
    cy.loginToSupportViewAdmin(); // Login as a master user
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
    cy.wait(2500);

    // Click the "User" button within the action buttons
    cy.get('.action-buttons > button > .mdc-button__label')
      .last() // Select the last matched element
      .click(); // Click the matched "User" button
    cy.wait(2500);

    //Click on Select users to deliver documents button
    cy.get('.button-wraper>button>.mdc-button__label')
      .contains(
        /Select users to deliver documents|Benutzer für die Zustellung von Dokumenten auswählen/i
      )
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    // Search for the specific user by name
    cy.get('.dictionary-xml__search-container-input>input').type(
      Cypress.env('username_egEbox')
    );
    cy.wait(3500);

    // Find and check the checkbox in the row if it's not already checked
    cy.get('input[type="checkbox"]').eq(1).click();

    cy.wait(2500);
    //Click on Next buton
    cy.get('button>.title')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Next' || text === 'Nächste';
      })
      .click();
    cy.wait(1500);

    // //Upload Document
    // cy.get('.create_user_dialog_content>.buttons-wrapper>button>.title')
    //   .filter((index, el) => {
    //     const text = Cypress.$(el).text().trim();
    //     return text === 'Upload Document' || text === 'Dokument hochladen';
    //   })
    //   .click();

    //Click on Upload Document button
    cy.get('body').then(($body) => {
      if ($body.find('.buttons-wrapper>button').length > 0) {
        cy.get('.buttons-wrapper>button>.title')
          .filter((index, el) => {
            const text = Cypress.$(el).text().trim();
            return text === 'Upload Document' || text === 'Dokument hochladen';
          })
          .click();
        cy.wait(1500);
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(1500);

    //Uplad valid document (x1 A4 pdf file)
    cy.massUpload();
    cy.wait(2000);
    //Add Title
    // Capture the current date and time in the specified format
    const now = new Date();
    const formattedDate = now.toLocaleDateString('de-DE'); // Format as dd.mm.yyyy
    const formattedTime = now.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    uploadDateTime = `${formattedDate} ${formattedTime}`;
    cy.log(`Upload DateTime: ${uploadDateTime}`);

    cy.wait(2500);
    //Add Delivery Title
    const title = `Delivery For Specific User (pdf) - ${uploadDateTime}`;

    cy.get('input[formcontrolname="subject"]').clear().type(title);
    cy.wait(1500);

    cy.get('.dialog-actions>button>.title')
      .contains(/Upload|hochladen/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    //Click on Send delivery
    cy.get('.dialog-actions>button>.title')
      .contains(/Send|Senden/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    //Confirm Sending dialog
    cy.get('.dialog-container>.dialog-footer>.dialog-actions>button>.title')
      .contains(/ Confirm |Bestätigen/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    // Verify the success message
    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /We are processing in the background|Wir verarbeiten im Hintergrund/
        );
      });

    // Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url'
    cy.log('Test completed successfully.');
    cy.wait(2500);
  }); //end it

  //Login to e-Box and Open Delivery
  it('Ebox user Open delivery', () => {
    cy.loginToEgEbox();
    cy.wait(2500);

    //Open latest created deivery
    cy.intercept(
      'GET',
      '**/hybridsign/backend_t/document/v1/getDocument/**'
    ).as('getDocument');
    cy.intercept('GET', '**/getIdentifications?**').as('getIdentifications');
    cy.get('.mdc-data-table__content>tr>.subject-sender-cell')
      .eq(0)
      .click({ force: true });

    cy.wait(['@getIdentifications'], { timeout: 57000 }).then(
      (interception) => {
        // Log the intercepted response
        cy.log('Intercepted response:', interception.response);

        // Assert the response status code
        expect(interception.response.statusCode).to.eq(200);
      }
    );

    // Scroll to the bottom of the PDF viewer or page
    // cy.get('.content-container>.scroll-container').eq(1).scrollTo('bottom', {
    //   duration: 500,
    //   ensureScrollable: false,
    // });
    cy.wait(3500);

    // Logout
    cy.get('.user-title').click();
    cy.wait(1500);
    cy.get('.logout-title > a').click();
    cy.url().should('include', Cypress.env('baseUrl_egEbox')); // Validate url
    cy.log('Test completed successfully.');
  });

  //Admin user check Reporting email and delte all emails
  it('Yopmail - Get Reporting email and delte all emails', () => {
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
        .should('include.text', 'Versandreport e-Gehaltszettel Portal');
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
          'Sie haben 1 Sendung(en) erfolgreich digital in das e-Gehaltszettel Portal Ihrer Benutzer*innen eingeliefert'
        );
        expect(normalizedText).to.include(
          'Zusätzlich haben Sie 0 Sendung(en) erfolgreich über den postalischen Weg als Brief versendet. Das Dokument wird von uns über das „Einfach Brief“-Portal gedruckt, kurvertiert und an die Adresse des Benutzers versendet.'
        );
        expect(normalizedText).to.include('Ihr e-Gehaltszettel Team');
      });

    cy.wait(4500);

    // Delete all emails
    cy.get('.menu>div>#delall')
      .should('not.be.disabled')
      .click({ force: true });
    cy.wait(2500);
  });

  //Enable All Roles
  it('Enable All Roles', () => {
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
}); //end describe
