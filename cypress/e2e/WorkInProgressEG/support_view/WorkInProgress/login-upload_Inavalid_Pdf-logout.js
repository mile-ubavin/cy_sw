/// <reference types="Cypress" />
describe("Login/Logout to SupportView base scenario", () => {
  //Login as Admin User to sw, Logout
  it(`login`, function () {
    cy.loginToSupportViewAdmin() //SupportView - using custom commands
      //Optional
      .wait(2000);
    cy.get(".lagnuage-menu")
      .invoke("text")
      .then((selectedLanguage) => {
        if (selectedLanguage === "English" || selectedLanguage === "Deutch") {
          // Your code to execute when the selected language is either English or German
          cy.log("Selected language is English ");
          //Upload pdf
          cy.get(".upload__document").click();
          cy.uploadDocument(); //upload invalid document from fixtures folder - custom command
          cy.wait(2000);
          cy.get(".ng-star-inserted > .button__footer > .button__icon").click();
          // cy.get(".mat-select-placeholder");
          cy.get(
            ".list-item>.list-item-header>.list-item-status>span.danger"
          ).should(
            "include.text",
            "XML template not supported for current tenant"
          );
          cy.wait(5000);
          cy.get(".close").click(); //Close upload dialog
        } else {
          // Your code to execute when the selected language is neither English nor German
          cy.log("Selected language is German");
          //Upload pdf
          cy.get(".upload__document").click();
          cy.uploadDocument(); //upload invalid document from fixtures folder - custom command
          cy.wait(2000);
          cy.get(".ng-star-inserted > .button__footer > .button__icon").click();
          //cy.get(".mat-select-placeholder");
          cy.get("span.danger.ng-star-inserted").should(
            "include.text",
            "Dieses XML Format ist für diese Firma nicht konfiguriert"
          );
          cy.wait(5000);
          cy.get(".close").click(); //Close upload dialog
        }
      });

    //Upload pdf
    // cy.get(".upload__document").click();
    // cy.uploadDocument(); //upload invalid document from fixtures folder - custom command
    // cy.wait(2000);
    // cy.get(".ng-star-inserted > .button__footer > .button__icon").click();
    // cy.get('.mat-select-placeholder')
    // cy.get(".danger").should(
    //   "include.text",
    //   "XML template not supported for current tenant"
    // );

    // cy.wait(1000);
    // cy.get("button>.title").contains("Send").click();
    // cy.wait(1000);
    //Logout;
    cy.get(".logout-icon ").click();
    cy.wait(2000);
    cy.get(".confirm-buttons > :nth-child(2)").click();
    cy.url();
    cy.should("include", "https://supportviewpayslip.edeja.com/fe/login"); // Validate url
  }); //end it
});
