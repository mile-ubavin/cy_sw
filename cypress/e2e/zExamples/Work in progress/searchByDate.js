/// <reference types="Cypress" />

describe("Search by date should work", () => {
  beforeEach(() => {
    cy.loginToEBrief();
  });

  it("Verify date", () => {
    cy.get(
      ".mat-form-field-suffix > .mat-tooltip-trigger > #undefined"
    ).click();

    var date = new Date();
    date.setDate(date.getDate() - 360);

    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    cy.log("Picked year: " + year);
    cy.log("Picked month: " + month);
    cy.log("Picked day: " + day);

    cy.get('[name="startDate"]').click().type(`${day}.${month}.${year}`);
    cy.wait(1000);
    cy.get('[name="endDate"]')
      .click()
      .type(
        `${new Date().getDate()}.${
          new Date().getMonth() + 1
        }.${new Date().getFullYear()}`
      );
    cy.wait(1000);
    cy.get('.button--primary[type="submit"]').click();
    cy.get('[color="secondary"] > .button').click();
    cy.wait(1000);
  });

  it("Verify invalid date format", () => {
    cy.get(
      ".mat-form-field-suffix > .mat-tooltip-trigger > #undefined"
    ).click();
    cy.get('[name="startDate"]').click().type("invalid date format");
    cy.get('[name="endDate"]').click().type("invalid date format");

    cy.get(
      ".datePicker-wrap > mat-form-field > .mat-form-field-wrapper > .mat-form-field-subscript-wrapper > .ng-trigger-transitionMessages > mat-error"
    ).should(
      "have.text",
      " Ungültiges Datumsformat. Bitte verwenden Sie dieses Format: TT.MM.JJJJ. "
    );
  });
});
