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

        // Fill out the "Create Company" form using companyData from JSON
        const companyData = payslipJson.companyData[0];
        cy.get('input[formcontrolname="name"]').type(
          companyData.companyDispayName
        );

        cy.get('input[formcontrolname="description"]').type(
          companyData.companyDispayName
        );

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
