/// <reference types="Cypress" />
describe("Sidebar assertion", () => {
  beforeEach(() => {
    cy.session("login_data", () => {
      cy.loginToEBrief();
    });
  });
  it("Should verify sidebar items", () => {
    cy.visit("https://www.e-brief.at/fe_t/deliveries");
    cy.get("app-inbox-filter-general")
      .find(".label-list-wrapper")
      .then((a) => {
        const listingCount = Cypress.$(a).length;
        expect(a).to.have.length(listingCount);
        for (let index = 0; index < listingCount; index++) {
          let currentLabelName = ["Alle", "Gelesen", "Ungelesen"]; //HardCoded values
          cy.get("app-inbox-filter-general>.label-list-wrapper")
            .eq(index)
            .invoke("text")
            .as("title");
          cy.get("@title").should("include", currentLabelName[index]); //Validate footerTitles
        } //end for
      });
  });
});
