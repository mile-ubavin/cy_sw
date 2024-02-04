/// <reference types="cypress" />
/// <reference types="cypress-xpath" />

describe("Login, Crete_delivery-Upload_doc(pdf), Logout", () => {
  beforeEach(() => {
    cy.session("login_data", () => {
      cy.loginToEBrief();
    });
  });

  //Upload document, Crete delivery
  it.only("Crete_delivery-Upload_doc(pdf)", function () {
    cy.visit("/deliveries");
    //cy.get('[iconafter="custom:post-icon-upload"] > #toolbar-toggle_upload').click()
    cy.get("#toolbar-toggle_upload").click();
    cy.upload_attachment(); //upload pdf documents from fixtures folder - custom command
    cy.wait(2000);
    for (let index1 = 0; index1 < 11; index1++) {
      cy.upload_attachment1();
      cy.get(
        ".dialog-list>.mat-list>.mat-list-item>.mat-list-item-content>.list-item>.list-item-header>.list-item-name"
      ).should("include", "Test");
    }
  }); //end it
  // cy.get(".list-item-status > span").each(($el, index, $list) => {
  //   $list[index] = $el.text(); //Get labele text for each element
  //   cy.log("inputFields Label title", $list[index]); //Optional
  //   // cy.get(
  //   //   ":nth-child(1) > .mat-list-item-content > .list-item > .list-item-header > .list-item-status > .success"
  //   // ).should("include", "Bitte");
  //   //cy.get($el).find()("have.class", ".danger");
  //   // if()
  // });
  //   cy.get('input[name="deliveryTitle"]').focus();
  //   cy.get("#mat-dialog-1").focus();
  //   cy.get('[role="alert"]').contains("Bitte geben Sie einen Sendungstitel an");
  //   cy.wait(2000);

  //   let randomString = Math.random().toString(15).substring(2); //Generating random string
  //   const title = "Upload pdf - " + randomString;
  //   cy.get('input[name="deliveryTitle"]').type(title); //Generate Delivery title using random string method
  //   //cy.get('.list-item-status>.success').should('have.text', 'Dokument erfolgreich hochgeladen: ')
  //   cy.wait(2000);
  //   cy.contains(" Speichern ").click({ force: true });
  // }); //end it

  // it("Logout & Clear saved session", function () {
  //   cy.visit("/deliveries");
  //   cy.url().should("include", "https://www.e-brief.at/fe_t/deliveries"); //Validate URL /on deliveries page
  //   cy.get(".user-title").click();
  //   cy.wait(2000);
  //   cy.contains("Logout").click();
  //   Cypress.session.clearAllSavedSessions(); //Clear all session
  //   cy.url().should("include", "/fe_t"); // Validate url
  //}); //end it
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
