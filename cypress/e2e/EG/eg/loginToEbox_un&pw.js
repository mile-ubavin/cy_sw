/// <reference types="Cypress" />

describe("Login/Logout to EG E-Ebox, base scenario", () => {
  // Login and Logout
  it("Login and Logout", function () {
    cy.visit("https://eboxpayslip.edeja.com/fe.e-box_t/"); //Visit EG E-box login page
    // Wait for the cookie bar to appear
    cy.wait(1000).then(() => {
      cy.get("#onetrust-policy-title").should("be.visible");
      cy.get("#onetrust-accept-btn-handler").click(); //Remove Cookie bar
    });
    // Login
    cy.loginToEgEbox(); // Custom command from 'command.js' file
    cy.wait(2000);

    // Logout
    cy.get(
      ".mat-menu-trigger > .mat-tooltip-trigger > #undefined > .mat-button-wrapper > .button-content-wrap"
    ).click();
    cy.get(".logout-title > a").click();

    // Validate URL after logout
    cy.url().should("eq", "https://eboxpayslip.edeja.com/fe.e-box_t/");
  });
});
