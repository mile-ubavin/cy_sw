/// <reference types="cypress-xpath" />

describe('Login, Update Primary Address, Logout', () => {
  beforeEach(() => {
    cy.session('login_data', () => {
      cy.loginToEBrief();
    });
  });
  //update personal data
  it('Update primary addres, check validation dn data - all fields', function () {
    cy.visit('/deliveries');
    cy.get('.user-title').click(); //switch to Persons tab
    cy.get('[color="primary"] > .button').click();
    //cy.get('[href="/settings/personal"]').click();
    cy.get(
      'app-personal-data-settings > app-settings-outlet-wrapper > .outlet-wrap > .settings-section-wrapper > .settings-section-buttons > sc-button > .button'
    ).click();
    //Switch to Address page
    cy.get('#mat-tab-link-3 ').click();
    //Clear House number field
    cy.get('input[placeholder="z.B. 101 - Stiege 4"]')
      .invoke('val', '') // Set the value to an empty string
      .trigger('input'); // Trigger input event to notify any listeners

    //Save Changes
    cy.get('.settings-section-buttons > sc-button > .button').click();
    cy.wait(1500);
    cy.get('#mat-mdc-error-0')
      .should('be.visible')
      .and('include.text', 'Pflichtfeld'); // Validate the error text

    cy.get('.mat-mdc-snack-bar-label')
      .should('be.visible')
      .and('include.text', 'Das Speichern der Adresse ist fehlgeschlagen'); // Validate the error text
    cy.wait(1500);

    //Enter door number
    cy.get('input[placeholder="z.B. 101 - Stiege 4"]')
      .invoke('val', '7') // Set the value to an empty string
      .trigger('input'); // Trigger input event to notify any listeners

    cy.wait(1500);
    //Save Changes
    cy.get('.settings-section-buttons > sc-button > .button').click();
    // cy.get('button > .button__title--icon')
    //   .invoke('text') // Extract the text from the button
    //   .then((buttonTitle) => {
    //     if (buttonTitle.trim() === 'Speichern') {
    //       // Check if the button title is 'Speichern'
    //       cy.wrap(buttonTitle).click(); // Click the button if the condition is true
    //     }
    //   });

    //Add new address
    //cy.get('.add-button > .button').click();
  }); //end it

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
