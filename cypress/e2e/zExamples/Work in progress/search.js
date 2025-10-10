/// <reference types="Cypress" />

describe("Search should work", () => {
  beforeEach(() => {
    cy.session("login_data", () => {
      cy.loginToEBrief();
    });
  });
  it("Verify search", () => {
    cy.get("#mat-input-0").click().type("hh{enter}"); // enter search word
    cy.wait(2000);
    cy.get(".clear-search-padding > #undefined").click(); // clear search filter
    cy.wait(1000);
  });


});
