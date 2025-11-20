/// <reference types="Cypress" />
describe("Verifying Socila medial links on Login page", () => {
  //Define baseUrl
  const baseUrl = "https://eboxpayslip.edeja.com/fe.e-box_t/";
  //Verify Facebook link, from the footer
  it("Facebook", () => {
    cy.visit(baseUrl);
    cy.url().should("include", baseUrl); //Validating url on the dashboard page
    cy.wait(1000);
    cy.get("#onetrust-accept-btn-handler").click(); //Remove Cookie bar
    cy.get(".footer__social-media>a")
      .eq(0)
      .invoke("removeAttr", "target")
      .click({ force: true }); //Remove taarget att
    cy.origin("https://www.facebook.com/unserepost", () => {
      cy.wait(3000);
      cy.url().should("include", "https://www.facebook.com/unserepost"); // => true
      cy.contains("Reload Page").click({ force: true });
      cy.wait(3000);
    });
    cy.go("back");
    //Trigger Back button on browser
    cy.url().should("include", baseUrl); //Validate url
    cy.wait(1000);
  });

  //Verify YouTube link, from the footer
  it("YouTube", () => {
    cy.visit(baseUrl);
    cy.url().should("include", baseUrl); //Validating url on the dashboard page
    cy.wait(1000);
    cy.get("#onetrust-accept-btn-handler").click(); //Remove Cookie bar
    cy.get(".footer__social-media>a")
      .eq(1)
      .invoke("removeAttr", "target")
      .click({ force: true }); //Remove target att
    cy.origin("https://www.youtube.com/user/unserepost", () => {
      cy.wait(2000);
      cy.url().should("include", "https://www.youtube.com/user/unserepost"); // => true
      cy.go("back");
    });

    //Trigger Back button on browser
    cy.url().should("include", baseUrl); //Validate url
    cy.wait(1000);
  });
  //Verify YouTube link, from the footer
  it("Linkedin", () => {
    cy.visit(baseUrl);
    cy.url().should("include", baseUrl); //Validating url on the dashboard page
    cy.wait(1000);
    cy.get("#onetrust-accept-btn-handler").click(); //Remove Cookie bar
    cy.get(".footer__social-media>a")
      .eq(2)
      .invoke("removeAttr", "target")
      .click({ force: true }); //Remove target att
    cy.origin("https://at.linkedin.com/", () => {
      cy.wait(4000);
      //cy.url().should("include", "https://www.linkedin.com"); // depricte
      cy.url().should("include", "https://at.linkedin.com/company/unserepost"); //Validate url
    });
    cy.go("back");
    //Trigger Back button on browser
    cy.url().should("include", baseUrl); //Validate url
    cy.wait(2000);
  });
  //Verify Instagram link, from the footer
  it("Instagram", () => {
    cy.visit(baseUrl);
    cy.url().should("include", baseUrl); //Validating url on the dashboard page
    cy.wait(1000);
    cy.get("#onetrust-accept-btn-handler").click(); //Remove Cookie bar
    cy.get(".footer__social-media>a")
      .eq(3)
      .invoke("removeAttr", "target")
      .click({ force: true }); //Remove target att
    cy.origin("https://www.instagram.com/", () => {
      cy.wait(5000);
      cy.url().should("include", "https://www.instagram.com/unserepost/"); // => true
    });
    cy.go("back");
    //Trigger Back button on browser
    cy.url().should("include", baseUrl); //Validate url
    cy.wait(1000);
  });
});
