/// <reference types="cypress" />
describe("Login/Logout to kiam base scenario", () => {
  
  //Login to E-Brief via Kiam
  beforeEach(() => {
    cy.session('login_data', () => {
      cy.loginToEBrief();
    });

  }); 
it('Switch to Personal data', () => {
  cy.visit("https://www.e-brief.at/fe_t/deliveries")
  cy.get(".user-title").click();
  cy.wait(2000);
  cy.get('[color="primary"] > .button').click()
  cy.wait(2000);
  cy.get('[href="/fe_t/settings/personal"]').click()
  cy.wait(2000)
  cy.get('[href="/fe_t/settings/password"]').click()
  cy.wait(2000)
  cy.get('[href="/fe_t/settings/address"]').click()
  cy.wait(2000)
  cy.get('[href="/fe_t/settings/labels"]').click()
  cy.wait(2000)
  cy.get('[href="/fe_t/settings/security"]').click()
  cy.wait(2000)
  cy.get('.mat-tab-links > [href="/fe_t/settings/activation"]').click()
  cy.wait(2000)
});
//Logout & Clear saved session
it("Logout & Clear saved session", function () {
  cy.visit("https://www.e-brief.at/fe_t/settings/activation") 
  cy.get(".user-title").click();
  cy.wait(3000);
  cy.get('[color="primary-reverse"] > .button').click();
  Cypress.session.clearAllSavedSessions();//Clear saved session
  cy.url().should("include", "https://www.e-brief.at/fe_t"); // => validate url after logout
}); //end it
});
