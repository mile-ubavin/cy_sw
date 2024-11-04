/// <reference types="cypress-xpath" />

describe('Login, Crete_delivery-Upload_doc(pdf), Logout', () => {
  beforeEach(() => {
    cy.session('login_data', () => {
      cy.loginToEBrief();
    });
  });

  //Upload document, Crete delivery
  it('Crete_delivery-Upload_doc(pdf)', function () {
    cy.visit('/deliveries');
    //cy.get('[iconafter="custom:post-icon-upload"] > #toolbar-toggle_upload').click()
    cy.get('#toolbar-toggle_upload').click();
    cy.upload_attachment(); //upload pdf documents from fixtures folder - custom command
    cy.wait(2000);
    // cy.get('input[name="deliveryTitle"]').focus();
    // cy.get("#mat-dialog-5").focus();
    // cy.get('[role="alert"]').contains("Bitte geben Sie einen Sendungstitel an");
    // cy.wait(2000);

    let randomString = Math.random().toString(15).substring(2); //Generating random string
    const title = 'Upload pdf - ' + randomString;
    //cy.get('input[name="deliveryTitle"]').type(title); //Generate Delivery title using random string method
    cy.get('#mat-input-5').type(title);
    //cy.get('.list-item-status>.success').should('have.text', 'Dokument erfolgreich hochgeladen: ')
    cy.wait(2000);
    cy.contains(' Speichern ').click({ force: true });
    cy.log('Test completed successfully.');
  }); //end it

  it('Logout & Clear saved session', function () {
    cy.visit('/deliveries');
    cy.url().should('include', '/deliveries'); //Validate URL /on deliveries page
    cy.get('.user-title').click();
    cy.wait(2000);
    cy.contains('Logout').click();
    Cypress.session.clearAllSavedSessions(); //Clear all session
    // cy.url().should('include', '/fe_t'); // Validate url
  }); //end it
});

// /// <reference types="cypress" />
// /// <reference types="cypress-xpath" />

// describe("Login/Logout to kiam base scenario", () => {
// before(() => {
//   cy.loginToEBrief1()
// });
//   //Switch to KIAM
//   it('upload doc', function(){
//       cy.get('[iconafter="custom:post-icon-upload"] > #toolbar-toggle_upload').click()
//       cy.upload_attachment()
//       cy.wait(2000)
//       //cy.get('.list-item-status>.success').should('have.text', 'Dokument erfolgreich hochgeladen: ')
//       cy.wait(2000)
//       cy.contains(" Speichern ").click({ force: true });

//       //Logout
//       cy.get('.user-title').click()
//       cy.wait(3000)
//       cy.get('[color="primary-reverse"] > .button').click()
//       cy.url().should("include", "https://www.e-brief.at/fe_t"); // => true
//     })//end it

// });
