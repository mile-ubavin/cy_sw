/// <reference types="Cypress" />

describe("Enable XML template by Masteruser", () => {
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
      cy.get(".search-dialog>form>.form-fields>.searchText-wrap")
        .eq(1)
        .type("aqua");

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
      //OPTIONAL
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
          cy.log(
            `ID: ${item.id}, Name: ${item.name}, Assigned: ${item.assigned}`
          );
          // Add additional assertions as needed
        });
      });

      //DISABLE XML TEMPLATES (from json file)

      //DISABLE XML TEMPLATES (from json file)

      // let searchCriteria; // Declare searchCriteria in a higher scope

      // // Load search criteria from the 'supportWiev.json' file
      // cy.fixture("supportView.json").then((data) => {
      //   // Check if data.enabledXML is an array
      //   if (Array.isArray(data.enabledXML)) {
      //     searchCriteria = data.enabledXML.map((item) => item.name);

      //     // Start the process by finding and unchecking elements based on search criteria
      //     findAndUncheckElement();
      //   } else {
      //     // Handle the case where data.enabledXML is not an array
      //     cy.log("Error: 'data.enabledXML' is not an array.");
      //   }
      // });

      //   const findAndUncheckElement = () => {
      //     // Check if all elements from search criteria are unchecked
      //     const allElementsUnchecked = searchCriteria.every((criteria) => {
      //       let found = false;
      //       cy.get(".pdf_dictionary__table > table > tbody > tr > td").each(
      //         ($td) => {
      //           const elementText = $td.text().trim();
      //           if (elementText.includes(criteria)) {
      //             found = true;
      //             // Log the found element information
      //             cy.log(`Found element with text: ${elementText}`);

      //             // Found the specified element, uncheck if it's visible
      //             const $checkbox = $td.find(
      //               'td:first-child input[type="checkbox"]'
      //             );
      //             if ($checkbox.prop("checked")) {
      //               cy.wrap($checkbox).uncheck({ force: true }); // Use force if needed
      //               cy.log("Checkbox is successfully unchecked ");
      //             } else {
      //               cy.log("Checkbox is already checked ");

      //             }
      //           }
      //         }
      //       );
      //       return found;
      //     });
      //   };
      // }); //end

      //************************************************************************************************************************* */
      let searchCriteria; // Declare searchCriteria in a higher scope

      // Load search criteria from the 'supportWiev.json' file
      cy.fixture("supportView.json").then((data) => {
        // Check if data.enabledXML is an array
        if (Array.isArray(data.enabledXML)) {
          searchCriteria = data.enabledXML.map((item) => item.name);

          // Start the process by finding and unchecking elements based on search criteria
          findAndUncheckElements();
        } else {
          // Handle the case where data.enabledXML is not an array
          cy.log("Error: 'data.enabledXML' is not an array.");
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

          //----------------------------------------

          if (!allElementsUnchecked) {
            cy.get(".pdf_dictionary__table > table > tbody > tr > td")
              .should("exist") // Ensure there are elements on the page
              .each(($element, index) => {
                const elementText = $element.text();
                cy.log(`Element ${index + 1}: ${elementText}`);

                // Check if the element matches the specified criteria
                if (
                  searchCriteria.some((criteria) =>
                    elementText.includes(criteria)
                  )
                ) {
                  // Log the found element information
                  cy.log(`Found element with text: ${elementText}`);

                  // Found the specified element, check if it's visible
                  cy.wrap($element)
                    .parent()
                    .find('td:first-child input[type="checkbox"]')
                    .should("be.visible")
                    .uncheck({ force: true }); // Use force if needed

                  cy.log(
                    "Checkbox is successfully checked for the specified element."
                  );
                }
              })
              .then(() => {
                // Log information about the pagination button
                cy.log(
                  "Clicking on pagination button to navigate to the next page"
                );

                // Click on pagination button to navigate to the next page
                cy.get(
                  ".pdf_dictionary__table > .additional-elements > .mat-mdc-paginator > div > div > .mat-mdc-paginator-range-actions > .mat-mdc-paginator-navigation-next"
                ).then(($nextButton) => {
                  const isNextButtonEnabled = !$nextButton.prop("disabled");

                  if (isNextButtonEnabled) {
                    // Log information about the pagination button
                    cy.log(
                      "Clicking on pagination button to navigate to the next page"
                    );

                    // Click on pagination button to navigate to the next page
                    cy.get(
                      ".pdf_dictionary__table > .additional-elements > .mat-mdc-paginator > div > div > .mat-mdc-paginator-range-actions > .mat-mdc-paginator-navigation-next"
                    )
                      .should("be.visible") // Ensure the next button is visible
                      .click();

                    // Log that the next page is being loaded
                    cy.log("Waiting for the next page to load...");

                    // Wait for the next page to load and then recursively call findAndCheckElement
                    findAndCheckElement();
                  } else {
                    // Log that the pagination button is disabled
                    cy.log(
                      "Pagination button is disabled. Stopping the process."
                    );
                  }
                });
              });
          } else {
            cy.log(
              "All elements from the search criteria are checked. Stopping the process."
            );
          }
        }
      };
    });

    //   //Find the Send button by txt
    //   const buttonTxt = t["Save"];
    //   cy.get(".pdf_dictionary>.pdf_dictionary__actions>button")
    //     .contains(buttonTxt)
    //     .click();
    //   //Uncheck validation message
    //   cy.get(
    //     "#mat-snack-bar-container-live-0>div>.mat-mdc-simple-snack-bar>.mat-mdc-snack-bar-label"
    //   )
    //     .invoke("text")
    //     .then((message) => {
    //       expect(message, "Success Message ").to.include(
    //         t["XML template was assigned successfully"]
    //       );
    //     }); //end
    // }); //end TRANSLATE
    // cy.wait(2500);
    // // Logout;
    // cy.get(".logout-icon ").click();
    // cy.wait(2000);
    // cy.get(".confirm-buttons > :nth-child(2)").click();
    // cy.url();
    // cy.should("include", "https://supportviewpayslip.edeja.com/fe/login"); // Validate url
  }); //end it
}); //end describe
