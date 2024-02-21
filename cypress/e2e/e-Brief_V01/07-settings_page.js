/// <reference types="cypress" />
describe("Login, Validate header links from SettingsPasge, Logout", () => {
  //Login to E-Brief via Kiam
  beforeEach(() => {
    cy.session("login_data", () => {
      cy.loginToEBrief();
    });
  });
  it("Switch to Personal data", () => {
    cy.visit("/deliveries");
    cy.get(".user-title").click();
    cy.wait(2000);
    cy.get('[color="primary"] > .button').click();
  });

  //Count and validate number of links, linkText, linkUrl, and redirection from the every Header links visible in overview page - dynamic result"
  it("Count and Validate header links from SettingsPasge - dynamic result", () => {
    cy.visit("/settings/overview");
    cy.get(".mat-mdc-tab-links")
      .find("a")
      .then((a) => {
        const listingCount = Cypress.$(a).length;
        expect(a).to.have.length(listingCount);
        // const linkText = [' Zusammenfassung ',' Persönlich ',' Passwort ',' Adresse ',' Labels ',' Sicherheit ', ' Aktivierung ']
        // const url = ['overview','personal','password','address','labels','security', 'activation'];
        // cy.log("TEST",cy.get('.mat-tab-list > .mat-tab-links>a').each(($el, index, $list) => {
        //   userDetails[index] = $el.text())

        //Promise-Get linkText and attribute 'href' from the each links visible in ".mat-tab-list > .mat-tab-links>a" (header links from SettingsPasge)
        let url = []; //url array
        let linkText = []; //linkText array
        let att = [];
        cy.get(".mat-mdc-tab-list > .mat-mdc-tab-links>a")
          .each(($el, index, $list) => {
            //iterating trough each element visible as a link in settings page, e.g. el[1]->index[0]...
            linkText[index] = $el.text(); //store approprite linkText depending on the index: linkText of element 1 is set as a linkText[0], and stored to linkText array variabile
            url[index] = $el.attr("href"); //store approprite attribute ('href') depending on the index,
            att[index] = $el.attr("aria-disabled");
            cy.log('Log "aria-disabled" attributes', att[index]);
          })
          .then(() => {
            for (let index = 0; index < listingCount; index++) {
              cy.get(".mat-mdc-tab-list > .mat-mdc-tab-links>a")
                .eq(index)
                .invoke("text")
                .as("settingsOptions");
              cy.get("@settingsOptions").should("include", linkText[index]);
              //Verify is 'aria-disabled' attribute is set to false
              if (att[index] === "false") {
                //If 'aria-disabled' attribute is set to false click on link
                cy.contains(linkText[index]).click(); //get element using linkText, and click on it...
                cy.url().should("include", `${url[index]}`); // => validate url
              }
            }
          });
      });
  });

  //Logout & Clear saved session
  it("Logout & Clear saved session", function () {
    cy.visit("/settings/overview");
    cy.get(".user-title").click();
    cy.wait(3000);
    cy.get('[color="primary-reverse"] > .button').click();
    Cypress.session.clearAllSavedSessions(); //Clear saved session
    cy.url().should("include", "/"); // => validate url after logout
  }); //end it
});
