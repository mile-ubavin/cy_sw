/// <reference types="Cypress" />

describe("Search by date should work", () => {
  beforeEach(() => {
    cy.loginToEBrief();
  });
  //Filter by date
  it("Flter by date", () => {
    cy.get(".adv-menu>.mat-mdc-icon-button").click();

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
  }); //end it
  //Verify invalid date format
  it("Verify invalid date format", () => {
    cy.get(".adv-menu>.mat-mdc-icon-button").click();
    cy.get('[name="startDate"]').click().type("invalid date format");
    cy.get('[name="endDate"]').click();
    cy.get("#mat-mdc-error-0").should(
      "have.text",
      " Ungültiges Datumsformat. Bitte verwenden Sie dieses Format: TT.MM.JJJJ. "
    );
    cy.get('[name="startDate"]').clear();
    cy.wait(500);
    //End date
    cy.get('[name="endDate"]').click().type("invalid date format");
    cy.get('[name="startDate"]').click();
    cy.get("#mat-mdc-error-1").should(
      "have.text",
      " Ungültiges Datumsformat. Bitte verwenden Sie dieses Format: TT.MM.JJJJ. "
    );
    cy.log("Test completed successfully.");
  }); //end it
  //Logout and clear session
  it("Logout & Clear saved session", function () {
    cy.visit("/deliveries");
    cy.url().should("include", "/deliveries"); //Validate URL /on deliveries page
    cy.get(".user-title").click();
    cy.wait(2000);
    cy.contains("Logout").click();
    Cypress.session.clearAllSavedSessions(); //Clear all session
    cy.url().should("include", "/"); // Validate url
    // Completion message at the end of the test
    cy.log("Test completed successfully.");
  }); //end it
});
