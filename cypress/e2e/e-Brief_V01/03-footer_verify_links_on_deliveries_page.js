/// <reference types="Cypress" />
describe("Login, Footer - Verfy redirection from links (using remove atribute), Logout", () => {
  //Login to E-Brief via Kiam

  beforeEach(() => {
    cy.session("todos", () => {
      cy.loginToEBrief();
    });
  });
  it("Switch to footer and Clicks on AGB link, validate URL", () => {
    cy.visit("/deliveries");
    cy.url().should("include", "https://www.e-brief.at/fe_t/deliveries");

    //switch to element simply
    // cy.get('.left-ref-group>a[href="https://www.post.at/co/c/agb"]').invoke('removeAttr', 'target').click({ force: true });
    // cy.url().should('include', 'https://www.post.at/i/c/agb')
    // cy.get('#onetrust-accept-btn-handler').click({ force: true });//remove cookie bar
    // cy.wait(1000);

    //switch to first element, using alias
    cy.get(".left-ref-group>a").eq(0).invoke("text").as("footerElemets");
    cy.get("@footerElemets").should("include", "AGB");
    cy.get(".left-ref-group>a")
      .eq(0)
      .invoke("removeAttr", "target")
      .click({ force: true }); //removeAttr to open page in the same tab
    cy.url().should("include", "https://www.post.at/i/c/agb"); //validate url
    //cy.get("#onetrust-accept-btn-handler").click({ force: true }); //remove cookie bar
    cy.wait(1000);
    cy.go("back"); //Trigger Back button on browser
    cy.url().should("include", "/deliveries"); //Validate url
    cy.wait(1000);
  });
  it("Switch to footer and Clicks on Impressum link, validate URL", () => {
    cy.visit("https://www.e-brief.at/fe_t/deliveries");
    //switch to second element, using alias
    cy.get(".left-ref-group>a").eq(1).invoke("text").as("footerElemets");
    cy.get("@footerElemets").should("include", "Impressum");
    cy.get(".left-ref-group>a")
      .eq(1)
      .invoke("removeAttr", "target")
      .click({ force: true }); //removeAttr to open page in the same tab
    cy.url().should("include", "https://www.post.at/en/i/c/imprint"); //validate url
    //cy.get("#onetrust-accept-btn-handler").click({ force: true }); //remove cookie bar
    cy.wait(1000);
    cy.go("back"); //Trigger Back button on browser
    cy.url().should("include", "/deliveries"); //Validate url
    cy.wait(2000);
  });
  it("Switch to footer and Clicks on Kontakt link, validate URL", () => {
    cy.visit("https://www.e-brief.at/fe_t/deliveries");
    //switch to 3th element, using alias
    cy.get(".left-ref-group>a").eq(2).invoke("text").as("footerElemets");
    cy.get("@footerElemets").should("include", "Kontakt");
    cy.get(".left-ref-group>a")
      .eq(2)
      .invoke("removeAttr", "target")
      .click({ force: true }); //removeAttr to open page in the same tab
    cy.url().should("include", "https://www.post.at/en/p/c/e-letter"); //validate url
    //cy.get("#onetrust-accept-btn-handler").click({ force: true }); //remove cookie bar
    cy.wait(1000);
    cy.go("back"); //Trigger Back button on browser
    cy.url().should("include", "/deliveries"); //Validate url
    cy.wait(1000);
  });
  it("Switch to footer and Clicks on Hilfe / FAQ link, validate URL", () => {
    cy.visit("https://www.e-brief.at/fe_t/deliveries");
    //switch to 4th element, using alias
    cy.get(".left-ref-group>a").eq(3).invoke("text").as("footerElemets");
    cy.get("@footerElemets").should("include", "Hilfe / FAQ");
    cy.get(".left-ref-group>a")
      .eq(3)
      .invoke("removeAttr", "target")
      .click({ force: true }); //removeAttr to open page in the same tab
    cy.url().should("include", "https://www.post.at/en/p/c/e-letter"); //validate url
    //cy.get("#onetrust-accept-btn-handler").click({ force: true }); //remove cookie bar
    cy.wait(1000);
    cy.go("back"); //Trigger Back button on browser
    cy.url().should("include", "/deliveries"); //Validate url
    cy.wait(1000);
  });
  it("Switch to footer and Clicks on Rechtliche Hinweise/Datenschutzhinweise link, validate URL", () => {
    cy.visit("https://www.e-brief.at/fe_t/deliveries");
    //switch to 5th element, using alias
    cy.get(".left-ref-group>a").eq(4).invoke("text").as("footerElemets");
    cy.get("@footerElemets").should(
      "include",
      "Rechtliche Hinweise / Datenschutzhinweise"
    );
    cy.get(".left-ref-group>a")
      .eq(4)
      .invoke("removeAttr", "target")
      .click({ force: true }); //removeAttr to open page in the same tab
    cy.url().should(
      "include",
      "https://www.post.at/i/c/datenschutz-postonline-services"
    ); //validate url
    cy.wait(3000);
    //cy.get('#onetrust-accept-btn-handler').click({ force: true });//remove cookie bar
    cy.wait(1000);
    cy.go("back"); //Trigger Back button on browser
    cy.url().should("include", "/deliveries"); //Validate url
    cy.wait(1000);
  });
  it("Switch to footer and Clicks on Cookie-Einstellungen bearbeiten link, validate URL", () => {
    cy.visit("https://www.e-brief.at/fe_t/deliveries");
    //switch to 6th element, using alias
    cy.get(".left-ref-group>a").eq(5).invoke("text").as("footerElemets");
    cy.get("@footerElemets").should(
      "include",
      "Cookie-Einstellungen bearbeiten"
    );
    cy.get("#pc-title").should("have.text", "Datenschutz-Präferenz-Center"); //Verify Error message
    cy.get(".left-ref-group>a").eq(5).click({ force: true }); //Click on 'Cookie-Einstellungen bearbeiten' link
    cy.wait(1000);
    cy.get("#close-pc-btn-handler").click({ force: true }); //remove cookie bar
    cy.wait(1000);
  });
  it("Switch to footer and Clicks on post.at link, validate URL", () => {
    cy.visit("https://www.e-brief.at/fe_t/deliveries");
    //switch to 7th element, using alias
    cy.get(".right-ref-group>a").eq(0).invoke("text").as("footerElemets");
    cy.get("@footerElemets").should("include", "post.at");
    cy.get(".right-ref-group>a")
      .eq(0)
      .invoke("removeAttr", "target")
      .click({ force: true }); //removeAttr to open page in the same tab
    cy.url().should("include", "https://www.post.at/en"); //validate url
    cy.wait(3000);
    // cy.get("#onetrust-accept-btn-handler").click({ force: true }); //remove cookie bar
    cy.wait(1000);
    cy.go("back"); //Trigger Back button on browser
    cy.url().should("include", "/deliveries"); //Validate url
    cy.wait(1000);
  });
  //Redirection to E-Brief, Logout & Clear saved session
  it("Redirection to E-Brief, Logout & Clear saved session", function () {
    cy.visit("https://www.e-brief.at/fe_t/deliveries"); //Redirection to E-Brief
    cy.get(".user-title").click();
    cy.wait(2000);
    cy.get('[color="primary-reverse"] > .button').click();
    Cypress.session.clearAllSavedSessions(); //Clear all session
    cy.url().should("include", "https://www.e-brief.at/fe_t"); // => validate url
  }); //end it
});
