/// <reference types="Cypress" />

describe("Search should work", () => {
  beforeEach(() => {
    cy.session("login_data", () => {
      cy.loginToEBrief();
    });
  });
  it("Verify search", () => {
    cy.visit("/deliveries");
    cy.get(".mat-mdc-form-field-infix>.mat-mdc-input-element")
      .click()
      .type("hh{enter}"); // enter search word
    cy.wait(2000);
    cy.get(".clear-search-padding > #undefined").click(); // clear search filter
    cy.wait(1000);
    cy.log("Test completed successfully.");
  }); //end it
  //Logout & Clear saved session
  it("Logout & Clear saved session", function () {
    cy.visit("/settings/overview");
    cy.get(".user-title").click();
    cy.wait(3000);
    cy.get('[color="primary-reverse"] > .button').click();
    Cypress.session.clearAllSavedSessions(); //Clear saved session
    cy.url().should("include", "/"); // => validate url after logout
  }); //end it
});
