/// <reference types="Cypress" />
describe("Login/Logout to ebrief base scenario", () => {
  
  //Login to E-Brief via Kiam
  beforeEach(() => {
    cy.loginToEBrief();
  }); 
  
  //Logout & Clear saved session
  it("Logout & Clear saved session", function () {
    cy.url().should("include", "https://www.e-brief.at/fe_t/deliveries");//Validate URL /on deliveries page
    cy.get(".user-title").click();
    cy.wait(2000);
    cy.contains('Logout').click()
    //Cypress.session.clearAllSavedSessions();//Clear all session
    cy.url().should("include", "/fe_t"); // Validate url 
  }); //end it
});
