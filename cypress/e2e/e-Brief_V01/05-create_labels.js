/// <reference types="Cypress" />

describe("Create new labels", () => {
  beforeEach(() => {
    cy.loginToEBrief();
  });
  //   let label = "This is a label from cypress4";
  let randomString = Math.random().toString(15).substring(2); //Generating random string

  it("Should be able to create new labels", () => {
    cy.get("app-create-label").click();
    cy.get(".desktop-dialog-wrapper");
    cy.get(
      ".create-label-wraper > :nth-child(1) > :nth-child(1) > .mat-menu-trigger"
    ).click();
    cy.get(".mat-menu-content");
    cy.get(".row-items").first().get(".label-wrapper").first().click();
    cy.get(".desktop-dialog-wrapper input")
      .click()
      .type("Label Name Name- " + randomString);
    cy.wait(1000);
    cy.get(
      ":nth-child(2) > :nth-child(1) > .mat-form-field > .mat-form-field-wrapper > .mat-form-field-flex > .mat-form-field-infix"
    ).click();
    cy.get("#mat-option-0 > .mat-option-text").click();
    cy.get("sc-button.ng-star-inserted > .button").click();
    cy.wait(2000);
    cy.get(".mat-snack-bar-container").should("contain", "Label");
  });

  it("Should fail because label already exists", () => {
    cy.visit("/deliveries");
    cy.get("app-create-label").click();
    cy.get(".desktop-dialog-wrapper");
    cy.get(
      ".create-label-wraper > :nth-child(1) > :nth-child(1) > .mat-menu-trigger"
    ).click();
    cy.get(".mat-menu-content");
    cy.get(".row-items").first().get(".label-wrapper").first().click();
    cy.get(".desktop-dialog-wrapper input")
      .click()
      .type("Label Name Name- " + randomString);
    cy.get(".error-message").should("include.text", "Label");
    cy.wait(2000);
  });
  it("Should create random label text", () => {
    cy.visit("/deliveries");
    // const labelName = "Label Name - " + randomString;
    cy.get("app-create-label").click();
    cy.get(".desktop-dialog-wrapper");
    cy.get(
      ".create-label-wraper > :nth-child(1) > :nth-child(1) > .mat-menu-trigger"
    ).click();
    cy.get(".mat-menu-content");
    cy.get(".row-items").first().get(".label-wrapper").first().click();
    cy.get(".desktop-dialog-wrapper input")
      .click()
      .type("Label Name - " + randomString);
    cy.get(
      ":nth-child(2) > :nth-child(1) > .mat-form-field > .mat-form-field-wrapper > .mat-form-field-flex > .mat-form-field-infix"
    ).click();
    cy.get("#mat-option-0 > .mat-option-text").click();
    cy.get("sc-button.ng-star-inserted > .button").click();
    cy.get("app-inbox-filter-custom-labels.ng-star-inserted");
    cy.wait(2000);
    cy.get(".mat-snack-bar-container").should("contain", "Label");
  });
});
