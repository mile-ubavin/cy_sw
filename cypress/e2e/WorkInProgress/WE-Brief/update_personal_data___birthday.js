/// <reference types="cypress" />
/// <reference types="cypress-xpath" />

describe("Login, Update birthday, Logout", () => {
  beforeEach(() => {
    cy.session("login_data", () => {
      cy.loginToEBrief();
    });
  });

  it("Update personal data - birthday only", function () {
    //update personal data
    cy.visit("https://www.e-brief.at/fe_t/deliveries");
    cy.get(".user-title").click(); //switch to persons tab
    cy.wait(1000);
    cy.get('[color="primary"] > .button').click();
    cy.wait(1000);
    cy.get('[href="/fe_t/settings/personal"]').click();
    //cy.url('https://www.e-brief.at/backend_t/rest/v2/labels/listDeliveryCategory').should("include","/listDeliveryCategory")
    cy.wait(1000);
    cy.get(
      "app-personal-data-settings > app-settings-outlet-wrapper > .outlet-wrap > .settings-section-wrapper > .settings-section-buttons > sc-button > .button"
    ).click;
    cy.scrollTo("bottom", { duration: 500 });
    cy.get("#mat-input-7").clear().type("12");
    cy.wait(1000);
    cy.get("#mat-input-8").clear().type("j"); //Verify Case insesitive
    cy.wait(1000);
    //Select dropdown value Month - using autocomplete
    cy.get(".mat-autocomplete-panel > *").each(($el, index, $list) => {
      const item = $el.text();
      const itemToSelect = "Juli";
      if (item === itemToSelect) {
        $el.trigger("click");
      }
    });
    //Select dropdown value Year - using autocomplete
    cy.get("#mat-input-9").clear().type("197");
    cy.wait(1000);
    //Select value from the dropdown
    cy.get(".mat-autocomplete-panel > *").each(($el, index, $list) => {
      const item = $el.text();
      const itemToSelect = "1972";
      if (item === itemToSelect) {
        $el.trigger("click");
      }
    });
    cy.get(".settings-section-title").click();
    cy.wait(1000);
    cy.get(".button").click();
    cy.wait(3000);
    cy.url("https://www.e-brief.at/fe_t/settings/overview").should(
      "include",
      "https://www.e-brief.at/fe_t/settings/overview"
    );
    // => validate url after saving
    //cy.get('.error-notification').should('have.text','Die persönlichen Daten konnten nicht gespeichert werden ')
    //cy.get('.mat-simple-snackbar > span').should('have.text','Die persönlichen Daten wurden erfolgreich gespeichert')//Validting Success message
    cy.wait(2000);
  });
  //Logout  & Clear saved session
  it("Logout & Clear saved session", function () {
    cy.visit("https://www.e-brief.at/fe_t/deliveries");
    cy.get(".user-title").click();
    cy.wait(3000);
    cy.get('[color="primary-reverse"] > .button').click();
    Cypress.session.clearAllSavedSessions(); //Clear saved session
    cy.url().should("include", "https://www.e-brief.at/fe_t"); // => validate url after logout
  }); //end it
});
