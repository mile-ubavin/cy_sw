/// <reference types="cypress-xpath" />

describe('Login, Crete_delivery-Upload_doc(pdf), Logout', () => {
  beforeEach(() => {
    cy.session('login_data', () => {
      cy.loginToEBrief();
    });
  });

  //Crete delivery
  it.only('Crete_delivery-Upload_doc(pdf)', function () {
    cy.visit('/deliveries');
    cy.get('#toolbar-toggle_upload').click();
    cy.upload_attachment(); //upload pdf documents from fixtures folder - custom command
    cy.wait(2000);

    let randomString = Math.random().toString(15).substring(2); //Generating random string
    const title = 'Upload pdf - ' + randomString;
    //cy.get('input[name="deliveryTitle"]').type(title); //Generate Delivery title using random string method
    cy.get('#mat-input-5').type(title);
    //cy.get('.list-item-status>.success').should('have.text', 'Dokument erfolgreich hochgeladen: ')
    cy.wait(2000);
    cy.contains(' Speichern ').click({ force: true });

    //select first delivery fron the deliveries table
    cy.get(':nth-child(1) > .subject-sender-cell').click();
    cy.get('.subject-sender-cell').eq(0).click(); //select first (last created) delivery from the deliveries table

    // cy.get('.content-header>.ng-star-inserted').eq(2).click()//Click on add new label to document
    cy.get(
      '.even-row.details > .labels-cell > .labels-list > .assign-label-wrap > app-custom-icon-button.ng-star-inserted > #undefined > .mat-mdc-button-touch-target'
    ).click();
    cy.get('h2.dialog-title').should(
      'have.text',
      'Label zur Sendung hinzufügen'
    ); //Validate Label dialog title
    cy.get('.labels-list-wrapper > ul>li').eq(0).invoke('text').as('labelName'); //Select 1st label
    cy.get('@labelName').should('include', 'Wichtig'); //Validate label name
    cy.get('.labels-list-wrapper > ul>li').eq(0).click();
    //cy.get('[color="secondary"] > .button >.button__title').should('have.text', ' Abbrechen ');
    cy.get('[color="secondary"] > .button')
      .should('be.visible')
      .and('be.enabled');
    cy.get('[color="primary"] > .button')
      .should('be.visible')
      .and('be.enabled');
    //.should('have.text', ' Anwenden ');
    cy.wait(1000);
    cy.get('[color="primary"] > .button').click();
  }); //end it
  //Logout and clear session
  it('Logout & Clear saved session', function () {
    cy.visit('/deliveries');
    cy.url().should('include', '/deliveries'); //Validate URL /on deliveries page
    cy.get('.user-title').click();
    cy.wait(2000);
    cy.contains('Logout').click();
    Cypress.session.clearAllSavedSessions(); //Clear all session
    cy.url().should('include', '/'); // Validate url
    cy.log('Test completed successfully.');
  }); //end it
});
