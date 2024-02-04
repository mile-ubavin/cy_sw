/// <reference types="Cypress" />

describe("Disable XML template by Masteruser", () => {
  // Custom command to load t based on the selected language
  Cypress.Commands.add("loadTranslate", (language) => {
    cy.fixture(`${language}.json`).as("t");
  });
  //getOppositeLanguage
  function getOppositeLanguage(currentLanguage) {
    return currentLanguage === "English" ? "German" : "English";
  }

  it("Diasable xml teplate by Masteruser", () => {
    cy.loginToSupportViewMaster(); //login as a masteruser

    cy.intercept(
      "GET",
      "https://supportviewpayslip.edeja.com/be/supportView/v1/group/template/tenant/AQUA"
    ).as("apiRequest");
    //get language
    cy.get("#mat-select-value-1")
      .invoke("text")
      .then((selectedLanguage) => {
        const oppositeLanguage = getOppositeLanguage(selectedLanguage.trim());
        cy.log(`Selected Languages: ${selectedLanguage}`);
        cy.log(`Switching to Opposite Language: ${oppositeLanguage}`);

        // Select the opposite language
        cy.selectLanguage(oppositeLanguage);

        // Load t based on the opposite language
        cy.loadTranslate(oppositeLanguage);
      });
    cy.get("@t").then((t) => {
      //Search for Group section
      cy.get("#searchButton>span")
        .invoke("text")
        .then((search) => {
          expect(search, "Search:").to.include(t["Search"]);
        });
      cy.get("#searchButton>span").click(); //Click on search button
      //Search form label

      cy.get(".search-dialog>form>.form-fields>.searchText-wrap>.label")
        .eq(0)
        .invoke("text")
        .then((searchLabel) => {
          expect(searchLabel, "Account Number").to.include(t["Account Number"]);
        }); //end
      cy.get(".search-dialog>form>.form-fields>.searchText-wrap>.label")
        .eq(1)
        .invoke("text")
        .then((searchLabel) => {
          expect(searchLabel, "Display Name").to.include(t["Display Name"]);
        }); //end
      cy.get(".search-dialog>form>.form-fields>.searchText-wrap>.label")
        .eq(2)
        .invoke("text")
        .then((searchLabel) => {
          expect(searchLabel, "Description").to.include(t["Description"]);
        }); //end

      //Search form Action buttons
      cy.get(".search-dialog>form>.form-actions>button>.mdc-button__label")
        .eq(0)
        .invoke("text")
        .then((searchButton) => {
          expect(searchButton, "resetUserSearch:").to.include(
            t["resetUserSearch"]
          );
        }); //end
      cy.get(".search-dialog>form>.form-actions>button>.mdc-button__label")
        .eq(1)
        .invoke("text")
        .then((searchButton) => {
          expect(searchButton, "searchUse").to.include(t["searchUser"]);
        }); //end

      //Search for Group by Display Name
      cy.fixture("supportView.json").then((data) => {
        // Use the company name from the JSON file
        const companyName = data.company;
        // Search for Group by Display Name using the company name
        cy.get(".search-dialog>form>.form-fields>.searchText-wrap")
          .eq(1)
          .type(companyName);
      });

      //Find the Search button by button name and click on it
      const search = t["searchUser"];
      cy.get(".search-dialog>form>.form-actions>button")
        .contains(search)
        .click();

      //Action buttons labels

      cy.get(".action-buttons>button>.mdc-button__label")
        .eq(0)
        .invoke("text")
        .then((actionButton) => {
          expect(actionButton, "Edit button").to.include(t["Edit"]);
        }); //end

      cy.get(".action-buttons>button>.mdc-button__label")
        .eq(1)
        .invoke("text")
        .then((actionButton) => {
          expect(actionButton, "Assign XML Template").to.include(
            t["Assign XML Template"]
          );
        }); //end

      cy.get(".action-buttons>button>.mdc-button__label")
        .eq(2)
        .invoke("text")
        .then((actionButton) => {
          expect(actionButton, "Assign PDF Dictionary").to.include(
            t["Assign PDF Dictionary"]
          );
        }); //end

      cy.get(".action-buttons>button>.mdc-button__label")
        .eq(3)
        .invoke("text")
        .then((actionButton) => {
          expect(actionButton, "Admin User").to.include(t["Admin User"]);
        }); //end

      cy.get(".action-buttons>button>.mdc-button__label")
        .eq(4)
        .invoke("text")
        .then((actionButton) => {
          expect(actionButton, "User").to.include(t["User"]);
        }); //end
      //Click on button with txt XmlTemplate... taken from translate
      const assignXmlTemplateButtonText = t["Assign XML Template"];

      cy.get(".action-buttons button")
        .contains(assignXmlTemplateButtonText)
        .click();

      // XML template TABLE

      cy.get(".pdf_dictionary__table > table > tbody > tr").each(
        ($el, index, $list) => {
          cy.log(`Element ${index + 1}: ${$el.text()}`);
        }
      );

      // Verify message from response
      cy.wait("@apiRequest").then((interception) => {
        // Log the status code to the Cypress console
        cy.log(`Status Code: ${interception.response.statusCode}`);

        // Log or assert on the response body
        const responseBody = interception.response.body;
        cy.log("Response Body:", responseBody);

        // Assuming responseBody is the array you provided
        cy.wrap(responseBody).each((item) => {
          // Perform assertions or log information about each item
          cy.log(`ID: ${item.id}, Name: ${item.name}`);
          // Add additional assertions as needed
        });
      });

      //DISABLE XML TEMPLATES (from json file)

      let searchCriteria; // Declare searchCriteria in a higher scope

      // Load search criteria from the 'supportWiev.json' file
      cy.fixture("supportView.json").then((data) => {
        // Check if data.disableXML is an array
        if (Array.isArray(data.disableXML)) {
          searchCriteria = data.disableXML.map((item) => item.name);

          // Start the process by finding and unchecking elements based on search criteria
          findAndUncheckElements();
        } else {
          // Handle the case where data.disabeXML is not an array
          cy.log("Error: 'data.disableXML' is not an array.");
        }
      });

      const findAndUncheckElements = () => {
        // Use a loop to iterate through the elements
        for (let i = 0; i < searchCriteria.length; i++) {
          const criteria = searchCriteria[i];

          // Find the element based on the criteria
          cy.contains(
            ".pdf_dictionary__table > table > tbody > tr > td",
            criteria
          )
            .parent()
            .find('td:first-child input[type="checkbox"]')
            .should("be.visible")
            .uncheck({ force: true }); // Use force if needed

          // Log the information about the unchecked element
          cy.log(`Unchecked element with text: ${criteria}`);
        }

        // Log that all elements from the search criteria are unchecked
        cy.log(
          "All elements from the search criteria are unchecked. Stopping the process."
        );
      };

      //Find the Send button by txt
      const buttonTxt = t["Save"];
      cy.get(".pdf_dictionary>.pdf_dictionary__actions>button")
        .contains(buttonTxt)
        .click();
      //Check validation message
      cy.get(
        "#mat-snack-bar-container-live-0>div>.mat-mdc-simple-snack-bar>.mat-mdc-snack-bar-label"
      )
        .invoke("text")
        .then((message) => {
          expect(message, "Success Message ").to.include(
            t["XML template was assigned successfully"]
          );
        }); //end
    }); //end TRANSLATE
    cy.wait(2500);
    // Logout;
    cy.get(".logout-icon ").click();
    cy.wait(2000);
    cy.get(".confirm-buttons > :nth-child(2)").click();
    cy.url();
    cy.should("include", "https://supportviewpayslip.edeja.com/fe/login"); // Validate url
  }); //end it
}); //end describe
