/// <reference types="Cypress" />

describe("Delete labels", () => {
  beforeEach(() => {
    cy.loginToEBrief();
  });
  let randomString = Math.random().toString(15).substring(2); //Generating random string

  it("Should be able to delete labels", () => {
    // Assertion for labels page details
    cy.get('[routerlink="/settings/labels"]').click();
    cy.url().should("include", "/settings/labels");
    cy.get(".header-separator-title").should("contain", " EINSTELLUNGEN ");
    cy.get(".mat-tab-label-active").should("have.text", " Labels ");
    cy.get(".label-list-title").should("have.text", " Persönliche Labels ");

    // Create new label
    cy.get(".button").click();
    cy.get(".dialog-title").should("have.text", "Label erstellen");
    cy.get(
      ":nth-child(1) > :nth-child(1) > .mat-form-field > .mat-form-field-wrapper > .mat-form-field-flex > .mat-form-field-infix"
    ).type("Label name - " + randomString);
    cy.wait(1000);
    cy.get(
      ":nth-child(2) > :nth-child(1) > .mat-form-field > .mat-form-field-wrapper > .mat-form-field-flex > .mat-form-field-infix"
    ).click();
    cy.wait(1000);

    cy.get("#mat-option-2 > .mat-option-text").click();
    cy.get("sc-button.ng-star-inserted > .button").click();
    cy.get(".mat-snack-bar-container").should("have.text", "Label gespeichert");
    cy.wait(1000);

    // Delete latest created label
    let firstCount = 0;
    cy.get("mat-list")
      .find("mat-list-item")
      .then((a) => {
        firstCount = Cypress.$(a).length;
        expect(a).to.have.length(firstCount);
        for (let index = 0; index < firstCount; index++) {
          cy.get(
            '[aria-label="Label löschenREADERS - INBOX DETAILS PAGE START"]'
          )
            .last()
            .click({
              force: true,
            });
          cy.get(
            "mat-dialog-container> app-user-action-dialog>.desktop-dialog-wrapper>.dialog-actions"
          )
            .find('[color="primary"]')
            .click({
              force: true,
            });
          cy.log(firstCount);
          return;
        }
        let secondCount = 0;
        cy.get("mat-list")
          .find("mat-list-item")
          .then((a) => {
            secondCount = Cypress.$(a).length;
          });

        // Edit labels
      });
  });
});
