/// <reference types="cypress" />
describe("Login/Logout to kiam base scenario", () => {
  //Login to E-Brief via Kiam
  beforeEach(() => {
    cy.session("todos", () => {
      cy.loginToEBrief();
    });
  });
  it.only("Switch to Personal data", () => {
    cy.visit("https://www.e-brief.at/fe_t/settings/address");
    cy.url().should("include", "/settings/address"); // => validate url
    cy.get("#mat-input-0").clear().type("Österreich");
    cy.get(".zip-input").clear().type("Invalid_zip");
    cy.get(".settings-section-buttons").click();
    cy.get(".form__error-text > span").contains(
      "Eine PLZ darf keine Sonderzeichen haben."
    );
    cy.get(
      ":nth-child(1) > app-address-form > :nth-child(1) > .address-grid > .address-section > :nth-child(2) > .zip-code > .addresse-form-input > .zip-input"
    )
      .clear()
      .type("1234");
  });
  //Logout & Clear saved session
  it("Logout & Clear saved session", function () {
    cy.visit("https://www.e-brief.at/fe_t/settings/activation");
    cy.get(".user-title").click();
    cy.wait(3000);
    cy.get('[color="primary-reverse"] > .button').click();
    Cypress.session.clearAllSavedSessions(); //Clear saved session
    cy.url().should("include", "https://www.e-brief.at/fe_t"); // => validate url after logout
  }); //end it
});
