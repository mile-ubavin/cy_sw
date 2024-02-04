/// <reference types="Cypress" />
describe("Verifying Footer links", () => {
  it("Verifying Footer links", () => {
    //Handling non CY errors
    Cypress.on("uncaught:exception", (err, runnable) => {
      // returning false here prevents Cypress from
      // failing the test
      return false;
    });
    cy.visit("/");
    cy.url().should("include", "https://www.e-brief.at/fe_t"); //Validating url on the dashboard page
    cy.wait(1000);
    cy.get("#onetrust-accept-btn-handler").click(); //Remove Cookie bar
    //***** Get a footet title items **********
    cy.get(".footer>.footer__item")
      .find(".footer__title")
      .then((footer__title) => {
        const footerItem = ".footer>.footer__item"; //Switch to .footer__item elements
        const listingCount = Cypress.$(footer__title).length;
        expect(footer__title).to.have.length(listingCount);
        let footerTitle = []; //linkText array
        cy.get(footerItem + ">.footer__title")
          .each(($el, index, $list) => {
            footerTitle[index] = $el.text();
            cy.log("Footer title", footerTitle[index]);
          })
          //Validating footer titles
          .then(() => {
            for (let index = 0; index < listingCount; index++) {
              cy.get(footerItem + ">.footer__title")
                .eq(index)
                .invoke("text")
                .as("footer__title");
              cy.get("@footer__title").should("include", footerTitle[index]); //Validate footerTitles
              //cy.log("then log", footerTitle[index]);
            }
            //Passing trough links (a elemets) from the footer and getting total numbers of footer links, linkText and link urls
            cy.get(footerItem + ">a").then((a) => {
              const numberOfFooterLinks = Cypress.$(a).length; //Getting total numbers of footer links (a elemets)
              expect(a).to.have.length(numberOfFooterLinks);
              //cy.log("Number of footer links", numberOfFooterLinks);
              let url = []; //url array
              let linkText = []; //linkText array
              cy.get(footerItem + ">a")
                .each(($el, index, $list) => {
                  linkText[index] = $el.text();
                  url[index] = $el.attr("href");
                  //Replacing url - exisiting Url is replaced with expected
                  cy.fixture("footer_url.json").as("footer_url_from_json");
                  //Getting url from the json
                  cy.get("@footer_url_from_json").then((arrayItems) => {
                    for (let i = 0; i < arrayItems.length; i++) {
                      //Get number of elements from the 'footer_url' array (json file)
                      if ($el.attr("href") === arrayItems[i]["href"]) {
                        // If href exist, replace it with url - taken from json
                        url[index] = arrayItems[i]["url"];
                        break; //When elelment is founded, skipp itereating true the rest of elements from json file
                      }
                    }
                  });
                  //Verify link(s) text and url(s)
                  cy.log("elements", linkText[index]);
                  cy.log("elements url", url[index]);
                })
                //iterating trough all links from the footer click on it
                .then(() => {
                  //Loop trough footer links, skipping latest 2 links and 10th link
                  for (
                    let index = 11;
                    index < numberOfFooterLinks - 1;
                    index++
                  ) {
                    //Skipping 10th element (pdf)
                    if (index === 9) {
                      //get index=9
                      index = index + 1; //increase index +1
                    }
                    cy.get(footerItem + ">a")
                      .eq(index)
                      .invoke("text")
                      .as("footerLinksText");
                    cy.get("@footerLinksText")
                      .should("include", linkText[index])
                      .then(() => {
                        if (index === 12) {
                          cy.contains(linkText[index]).click(); //get element using linkText, and click on it...
                          cy.wait(2000);
                          // cy.url().should("include", `${url[index]}`); // => validate url
                          cy.get("#pc-title").invoke("text").as("pc-title");
                          cy.get("@pc-title").should(
                            "include",
                            "Datenschutz-Präferenz-Center"
                          ); //Validate pc-title
                          // cy.get("#close-pc-btn-handler").click();
                          //
                          // });
                        } else {
                          cy.contains(linkText[index])
                            .invoke("removeAttr", "target")
                            .click(); //get element using linkText, and click on it...
                          cy.url().should("include", `${url[index]}`); // => validate url
                          cy.go("back"); //Trigger Back button on browser
                          cy.url().should("include", "/"); //Validate url
                        } //end if
                      });
                  }
                });
            }); //end clicking on a elements
          });
      });
  }); //end it
});
