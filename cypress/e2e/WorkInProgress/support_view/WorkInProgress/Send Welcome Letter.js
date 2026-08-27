describe('Send Welcome Mail letter', () => {
  //When first time masteruser enable 'Activate Einfach Brief' flag (on creating or editing Company), Welcome e-mail is sent to company email

  it('Send Welcome Mail letter', () => {
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

        //Click on Create Company button

        cy.get('.button-wraper>button>.mdc-button__label')
          .filter((index, el) => {
            const text = Cypress.$(el).text().trim();
            return text === 'Create Company' || text === 'Firma Erstellen';
          })
          .click();
        cy.wait(1500);
        const companyData = payslipJson.companyData[0];
        // Generate a random two-character string (alphabet + number)
        const randomValue =
          String.fromCharCode(65 + Math.floor(Math.random() * 26)) + // Random uppercase letter
          Math.floor(Math.random() * 10); // Random digit (0-9)

        // Convert random Value to uppercase/lowercase
        const randomValueUpperCase = randomValue.toUpperCase();
        const randomValueLowerCase = randomValue.toLowerCase();
        //Add Company Prefix
        cy.get('.prefix-bttn').click();

        //User Prefix
        cy.get('.mat-mdc-form-field-infix>label')
          .filter((index, el) => {
            const text = Cypress.$(el).text().trim();
            return (
              text === 'User Prefix' || text === 'Präfix für Benutzernamen'
            );
          })
          .click()
          .type(`${companyData.userPrefix}-${randomValue}`); // Add the randomValue
        cy.wait(1500);
        // Subcompany Prefix
        cy.get('.mat-mdc-form-field-infix>label')
          .filter((index, el) => {
            const text = Cypress.$(el).text().trim();
            return (
              text === 'Subcompany Prefix' ||
              text === 'Präfix für Personalnummer'
            );
          })
          .click()
          .type(`${companyData.subcompanyPrefix}-${randomValue}`); // Add the randomValue
        cy.wait(1500);
        // Subcompany Name
        cy.get('.mat-mdc-form-field-infix>label')
          .filter((index, el) => {
            const text = Cypress.$(el).text().trim();
            return (
              text === 'Subcompany Name' ||
              text === 'Anzeigename der Unterfirma'
            );
          })
          .click()
          .type(`${companyData.subcompanyName}-${randomValue}`); // Add the randomValue
        cy.wait(1500);

        // Prefix Length
        cy.get('.mat-mdc-form-field-infix>label')
          .filter((index, el) => {
            const text = Cypress.$(el).text().trim();
            return (
              text === 'Prefix Length' ||
              text === 'Anz. Stellen, auf die Personalnummer aufgefüllt wird'
            );
          })
          .click()
          .type(`${companyData.prefixLength}-${randomValue}`); // Add the randomValue
        cy.wait(1500);

        //Save Prefixes
        cy.get('.mdc-button__label')
          .filter((index, el) => {
            const text = Cypress.$(el).text().trim();
            return text === 'Save' || text === 'Übernehmen';
          })
          .click();
        cy.wait(2500);

        // Ensure the "group-prefixes-dialog" is not visible before proceeding
        cy.get('.group-prefixes-dialog')
          .should('not.exist') // Wait until the dialog disappears
          .then(() => {
            // Fill out the "Create Company" form using companyData from JSON
            cy.get('input[formcontrolname="name"]').type('Gmbh' + randomValue); // Add the randomValue

            cy.get('input[formcontrolname="description"]').type(
              `${companyData.description}-${randomValue}`
            ); // Add the randomValue
            cy.get('input[formcontrolname="email"]').type(
              'gmbh-' + randomValueLowerCase + '@yopmail.com'
            );

            cy.get('input[formcontrolname="sapCustomerNumber"]').type(
              `${companyData.sapCustomerNumber}-${randomValue}`
            ); // Add the randomValue
            // Trigger opening the Material Number dropdown
            cy.get('.mat-mdc-form-field-infix>label>mat-label')
              .filter((index, el) => {
                const text = Cypress.$(el).text().trim();
                return text === 'Material Number' || text === 'Materialnummer';
              })
              .click({ force: true });
            cy.wait(1500);

            // Select a random option from the dropdown
            cy.get('#mat-select-2-panel>mat-option') // Target the dropdown options
              .then((options) => {
                const randomIndex = Math.floor(Math.random() * options.length); // Generate a random index
                cy.wrap(options[randomIndex]).click({ force: true }); // Select and click a random option
              });

            // Trigger opening the Accounting Model dropdown
            cy.get('.mat-mdc-form-field-infix>label>mat-label')
              .filter((index, el) => {
                const text = Cypress.$(el).text().trim();
                return (
                  text === 'Accounting Model' || text === 'Verrechnungsmodell'
                );
              })
              .click({ force: true });
            cy.wait(1500);

            // Select a random option from the dropdown
            cy.get('#mat-select-4-panel>mat-option') // Target the dropdown options
              .then((options) => {
                const randomIndex = Math.floor(Math.random() * options.length); // Generate a random index
                cy.wrap(options[randomIndex]).click({ force: true }); // Select and click a random option
              });

            cy.get('input[formcontrolname="streetName"]').type(
              companyData.streetName
            );

            cy.get('input[formcontrolname="doorNumber"]').type(
              `${companyData.doorNumber}-${randomValue}`
            ); // Add the randomValue

            cy.get('input[formcontrolname="zipCode"]').type(
              companyData.zipCode
            );

            cy.get('input[formcontrolname="city"]').type(
              `${companyData.city}-${randomValue}`
            ); // Add the randomValue
            //"einfachBriefEnabled"
            cy.get('#einfachBriefEnabled').click();

            // Generate a random 10-digit postSapNumber
            const postSapNumber =
              Math.floor(Math.random() * 9000000000) + 1000000000; // Ensures a 10-digit number

            // Fill the postSapNumber field with the generated value
            cy.get('input[formcontrolname="postSapNumber"]').type(
              postSapNumber.toString()
            );
            //Submit Company Dialog
            cy.get('.mdc-button__label')
              .filter((index, el) => {
                const text = Cypress.$(el).text().trim();
                return text === 'Submit' || text === 'Absenden';
              })
              .click();
            cy.wait(4500);
          });
        //Search for Company by Display Name
        cy.get('#searchButton>span').click(); //Click on search button
        cy.wait(1000);

        cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
          .eq(1)
          .type('Gmbh' + randomValue);

        //Find the Search button by button name and click on it
        cy.wait(1500);
        cy.get('.search-dialog>form>div>.mat-primary').click();
        cy.wait(1500);

        // const companyData = payslipJson.companyData[1];
        // cy.get('input[formcontrolname="description"]').type(
        //   companyData.companyDispayName
        // );

        //  cy.intercept(
        //   'GET',
        //   '**/hybridsign/backend_t/document/v1/getDocument/**'
        // ).as('getDocument');
        // cy.intercept('GET', '**/getIdentifications?**').as('getIdentifications');
        // cy.get('.controls > .ng-star-inserted').click({ force: true });
        // cy.wait(['@getDocument', '@getIdentifications'], { timeout: 13000 }).then(
        //   (interception) => {
        //     // Log the intercepted response
        //     cy.log('Intercepted response:', interception.response);

        //     // Optional: Assert the response status code
        //     // expect(interception.response.statusCode).to.eq(200);

        //     // Optional: Assert response body or other properties
        //     // Example: expect(interception.response.body).to.have.property('key', 'value');
        //     // cy.wait(1500);
        //   }
        // );

        // //Search for Group by Display Name
        // cy.get('#searchButton>span').click(); //Click on search button
        // cy.wait(1000);
        // cy.fixture('supportView.json').as('payslipSW');
        // cy.get('@payslipSW').then((payslipJson) => {
        //   // Use the company name from the JSON file
        //   const companyName = payslipJson.company;
        //   // Search for Group by Display Name using the company name
        //   cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
        //     .eq(1)
        //     .type(companyName);
        // });
        // //Find the Search button by button name and click on it
        // cy.wait(1500);
        // cy.get('.search-dialog>form>div>.mat-primary').click();
        // cy.wait(1500);

        // //Switch to user section
        // cy.get('.action-buttons > .mdc-button').eq(0).click();
        // cy.wait(1500);
        // //Scroll to the botton
        // cy.get('.mat-mdc-dialog-content').scrollTo('bottom');
        // cy.wait(2500);
        // //Check checkbox
        // cy.get('#hrManagementEnabled').then(($checkbox) => {
        //   if (!$checkbox.is(':checked')) {
        //     // If the checkbox is not checked, enable it
        //     cy.get('#hrManagementEnabled').check();
        //     cy.log('Checkbox was not enabled, now enabled.');
        //     //Save Edit Company dialog
        //     cy.get('button[type="submit"]').click();
        //   } else {
        //     // If the checkbox is already enabled
        //     cy.log('Checkbox is already enabled.');
        //     cy.get('.close[data-mat-icon-name="close"]').click();
        //   }
        //   //Close Edit Company dialog
        //   cy.wait(2500);
        //Logout
        // cy.get('.logout-icon ').click();
        // cy.wait(2000);
        // cy.get('.confirm-buttons > :nth-child(2)').click();
        // cy.url().should('include', payslipJson.baseUrl); // Validate url'
        // cy.log('Test completed successfully.');
        // cy.wait(2500);
        // }); //end
      });
    }); //end get data from json file
  }); //end it
});
