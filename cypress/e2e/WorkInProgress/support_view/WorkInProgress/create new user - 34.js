describe('crate user from SW', () => {
  // Generate a 3-character random string
  function generateRandomString(length) {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
    return randomString;
  }

  // Generate a 5-character random string
  let randomString = generateRandomString(2); // Setup the number of random chracters
  console.log(randomString);
  const username = 'TestUser_' + randomString;
  const email = randomString + '-testuser@yopmail.com';
  const password = 'Test1234!';

  it('create user from SW', () => {
    //********************* SW *********************

    cy.loginToSupportViewAdmin(); //SupportView - using custom commands
    //Optional
    cy.wait(1000);
    cy.get('.mat-mdc-select-placeholder')
      .invoke('text')
      .then((selectedLanguage) => {
        if (selectedLanguage === 'English' || selectedLanguage === 'Deutsch') {
          // Code to execute depending on the selected language
          cy.log(selectedLanguage);
          //Verify button title depending on transalte (Users/Eng)
          cy.get(':nth-child(8) > .mdc-button > .mdc-button__label')
            .invoke('text')
            .then((buttonText) => {
              buttonText.includes('View person') ||
                buttonText.includes('Benutzer');

              cy.log("Button title is 'View person' or 'Benutzer'");
              // Add additional assertions or actions if needed
            }); //Verify button title depending on transalte
          cy.get(':nth-child(8) > .mdc-button > .mdc-button__label').click(); //Click on Users button
          cy.get('.button-wraper > .mdc-button > .mdc-button__label').click(); //Click on Create user button
          cy.get(':nth-child(1) > .button__footer > .button__icon').click();
          // Fill the Creation user form
          cy.get('[formControlName="salutation"]').click();
          cy.get('#mat-option-2').click();
          //FirstName label
          //cy.get("mat-mdc-form-field-label-0")
          cy.get('#mat-input-0').type('FirstName');
          cy.get('#mat-input-1').type('LastName');
          //acc number
          cy.get('#mat-input-12').type(username);
          cy.get('#mat-input-2').type(email);

          //prefix dropdown
          cy.get('#mat-select-value-7 > .mat-mdc-select-placeholder').click();
          cy.wait(500);
          cy.get('.mdc-list-item__primary-text').click();

          //tel
          // cy.get("#mat-input-3").type("43");
          // cy.get("#mat-input-4").type("64");
          // cy.get("#mat-input-5").type("7077777");

          //address
          cy.get('#mat-input-6').type('Main street');
          cy.get('#mat-input-7').type('17');
          cy.get('#mat-input-8').type('7');
          cy.get('#mat-input-9').type('8010');
          cy.get('#mat-input-10').type('Wien');
          //title
          cy.get('#mat-input-11').type('Test Title');

          //Click on Confirm button
          cy.get('button[type="submit"]').click();
          //Download credentials
          cy.get('.download-bttn').click();
          cy.wait(1000);

          //********************* Yopmail *********************

          // Visit yopmail application or login page
          cy.visit('https://yopmail.com/en/');
          cy.get('#login').type(email);
          cy.get('#refreshbut > .md > .material-icons-outlined').click();
          cy.iframe('#ifinbox')
            .find('.mctn > .m > button > .lms')
            .eq(0)
            .should(
              'include.text',
              'Ihr neuer Benutzer im e-Gehaltszettel Portal'
            ); //Validate subject of Verification email

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
              cy.wait(4000);
              // cy.iframe("#ifmail")
              //   .find("#onetrust-accept-btn-handler")
              //   .should("exist")
              //   .click(); // if exist, Remove Cookie bar
              cy.iframe('#ifmail').find('.button').click();
              cy.wait(3000);

              //Reload inbox

              cy.get('#refresh').click(); //Click on Refresh inbox icon
              cy.wait(2000);
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
              cy.wait(1500);
              // cy.iframe("#ifmail")
              //   .find("#onetrust-accept-btn-handler")
              //   .should("exist")
              //   .click(); // Remove Cookie bar

              //Fill the Set password form
              cy.iframe('#ifmail')
                .find('.input__field-input')
                .eq(0)
                .type(password); //fill the 1st input field
              cy.iframe('#ifmail').find('.input-eye-icon').eq(0).click(); //Click on Show password icon

              cy.iframe('#ifmail')
                .find('.input__field-input')
                .eq(1)
                .type(password); //fill the 2nd input field
              cy.iframe('#ifmail').find('.input-eye-icon').eq(1).click(); //Click on Show password icon
              cy.iframe('#ifmail').find('.button').click(); //Click on confirm button

              //********************* Login to ebox 1st time *********************

              cy.then(() => {
                cy.log('Captured text:', usernameFromEmailBody);
                // Use usernameFromEmailBody in subsequent Cypress commands
                // cy.iframe("#ifmail")
                //   .find('.input__field-input[placeholder="Benutzername"]')
                //   .type(usernameFromEmailBody);

                // // Fill in the login form using a password
                // cy.iframe("#ifmail")
                //   .find('.input__field-input[placeholder="Passwort"]')
                //   .type(password);

                // // Click the login button
                // cy.iframe("#ifmail").find('button[type="submit"]').click();

                // //logout
                // cy.iframe("#ifmail")
                //   .find(
                //     ".mat-menu-trigger > .mat-tooltip-trigger > #undefined > .mat-button-wrapper > .button-content-wrap"
                //   )
                //   .click();
                // cy.get(".logout-title > a").click();

                cy.visit('https://eboxpayslip.edeja.com/fe.e-box_t/'); //Visit EG E-box login page

                // Wait for the cookie bar to appear
                // cy.wait(1000).then(() => {
                //   cy.get("#onetrust-policy-title").should("be.visible");
                //   cy.get("#onetrust-accept-btn-handler").click(); //Remove Cookie bar
                // });

                cy.get('#onetrust-policy-title')
                  .should('be.visible')
                  .then(() => {
                    // If the cookie bar is visible, click on it and remove it
                    cy.get('#onetrust-accept-btn-handler').click();
                  })
                  .wrap(Promise.resolve())
                  .then(() => {
                    // Continue with Login
                    cy.get(
                      ':nth-child(1) > .ng-invalid > .input > .input__field-input'
                    ).type(usernameFromEmailBody);
                    cy.get('.ng-invalid > .input > .input__field-input').type(
                      password
                    );
                    cy.wait(1000);
                    cy.get('button[type="submit"]').click(); //Login to E-Brief

                    // Logout
                    cy.get(
                      '.mat-menu-trigger > .mat-tooltip-trigger > #undefined > .mat-button-wrapper > .button-content-wrap'
                    ).click();
                    cy.get('.logout-title > a').click();

                    // Validate URL after logout
                    cy.url().should(
                      'eq',
                      'https://eboxpayslip.edeja.com/fe.e-box_t/'
                    );
                    cy.log('Test completed successfully.');
                  });
              });
            });
        }
      });
  });
});
