/// <reference types="cypress-xpath" />

describe('Login, Update Primary Address, Logout', () => {
  beforeEach(() => {
    cy.session('login_data', () => {
      cy.loginToEBrief();
    });
  });
  //update personal data
  it.only('Update primary address, check validation of data - all fields', function () {
    cy.visit('/deliveries');
    cy.get('.user-title').click(); // Switch to Persons tab
    cy.get('[color="primary"] > .button').click();

    // Navigate to Personal Data Settings
    cy.get(
      'app-personal-data-settings > app-settings-outlet-wrapper > .outlet-wrap > .settings-section-wrapper > .settings-section-buttons > sc-button > .button'
    ).click();

    // Switch to Address page
    cy.get('#mat-tab-link-3').click();

    //Count number of the addresses
    cy.get('app-address-form-wrapper>.ng-star-inserted>.ng-star-inserted').then(
      (elements) => {
        const count = elements.length;
        if (count > 2) {
          cy.log(`${count}, 3th address should be delete`);
          cy.pause();
        } else {
          cy.log('${count}, add 3th address');
          cy.wait(1500);
          //Click on add new address button
          cy.get('.add-button > .button > .button__title--icon').click();
          //Fill the address data
          cy.get('input[placeholder="Land"]').last().clear().type('Österreich');
          cy.get('input[formcontrolname="zipCode"]').last().type('1010');
          cy.get('input[placeholder="z.B. Wien"]').last().click();
          cy.wait(1500);
          //count number of items
          cy.get('.mdc-list-item>.mdc-list-item__primary-text').then((item) => {
            const numberOfItems = item.length;
            cy.log(`Number of items inside dropdown is: ${numberOfItems}`);
            //Random select item from the dropdown
            const randomIndex = Math.floor(Math.random() * numberOfItems); // Generate random index
            cy.wrap(item).eq(randomIndex).click();
          }); //end dropdown
          //Street
          cy.get('input[placeholder="z.B. Mariahilferstraße"]').last().click();
          cy.wait(1500);
          //count number of items
          cy.get('.mdc-list-item>.mdc-list-item__primary-text').then((item) => {
            const numberOfItems = item.length;
            cy.log(`nuber of streets are: ${numberOfItems}`);
            //Random select item from the dropdown
            const randomIndex = Math.floor(Math.random() * numberOfItems); // Generate random index
            cy.wrap(item).eq(randomIndex).click();
            cy.wait(2500);
          }); //end dropdown

          //Housnumber
          cy.get('input[placeholder="z.B. 101 - Stiege 4"]')
            .last()
            .clear()
            .type('0');

          cy.wait(2500);
          //Tur
          cy.get('input[placeholder="z.B. 5"]').last().clear().type('0');
          cy.wait(3500);
          //Click on Save button
          cy.get('.settings-section-buttons > sc-button > .button').click();
          // cy.get('.mdc-list-item>.mdc-list-item__primary-text').then((item) => {
          //   const numberOfItems = item.length;
          //   cy.log(`Number of items inside dropdown is: ${numberOfItems}`);
          //   //Random select item from the dropdown
          //   const randomIndex = Math.floor(Math.random() * numberOfItems); // Generate random index
          //   cy.wrap(item).eq(randomIndex).click();
          // }); //end dropdown
        } //end else
      }
    );

    // // Clear House number field
    // cy.get('input[placeholder="z.B. 101 - Stiege 4"]')
    //   .first() // Select the first matching element
    //   .invoke('val', '') // Set the value to an empty string
    //   .trigger('input'); // Trigger input event to notify any listeners

    // // Save Changes
    // cy.get('.settings-section-buttons > sc-button > .button').click();
    // cy.wait(1500);

    // // Validate error message
    // cy.get('#mat-mdc-error-0')
    //   .should('be.visible')
    //   .and('include.text', 'Pflichtfeld'); // Validate the error text

    // cy.get('.mat-mdc-snack-bar-label')
    //   .should('be.visible')
    //   .and('include.text', 'Das Speichern der Adresse ist fehlgeschlagen'); // Validate the error text
    // cy.wait(1500);

    // // Enter door number
    // cy.get('input[placeholder="z.B. 101 - Stiege 4"]')
    //   .first() // Ensure we're only selecting one element
    //   .invoke('val', '7') // Set the value to '7'
    //   .trigger('input'); // Trigger input event to notify any listeners

    // cy.wait(1500);

    // // Save Changes again
    // cy.get('.settings-section-buttons > sc-button > .button').click();

    // // Add new address if necessary
    // // cy.get('.add-button > .button').click();
  }); // End it

  //Logout  & Clear saved session
  it('Logout & Clear saved session', function () {
    cy.visit('/deliveries');
    cy.get('.user-title').click();
    cy.wait(3000);
    cy.get('[color="primary-reverse"] > .button').click();
    Cypress.session.clearAllSavedSessions(); //Clear saved session
    cy.url().should('include', '/'); // => validate url after logout
  }); //end it
});
