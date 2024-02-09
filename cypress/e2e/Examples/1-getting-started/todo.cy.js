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
        cy.wait(1000);
        // Load t based on the opposite language
        cy.loadTranslate(oppositeLanguage);
        cy.wait(1000);
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

      cy.get(".pdf_dictionary__table > table > tbody > tr").each(
        ($el, index, $list) => {
          cy.log(`Element ${index + 1}: ${$el.text()}`);
        }
      );

      let searchCriteria; // Declare searchCriteria in a higher scope

      // Load search criteria from the 'supportWiev.json' file
      cy.fixture("supportView.json").then((data) => {
        // Log searchCriteria
        searchCriteria = data.disableXML.map((item) => item.name);
        cy.log(searchCriteria);

        // Start the process by finding elements based on search criteria
        // OPTIONAL
        // Verify message from response
        cy.wait("@apiRequest").then((interception) => {
          // Log the status code to the Cypress console
          cy.log(`Status Code: ${interception.response.statusCode}`);

          // Log or assert on the response body
          const responseBody = interception.response.body;
          cy.log("Response Body:", responseBody);

          responseBody.sort((a, b) => {
            if (a.assigned && !b.assigned) {
              return -1; // a comes before b
            } else if (!a.assigned && b.assigned) {
              return 1; // b comes before a
            } else {
              return 0; // Keep the same order
            }
          });

          // Log only the elements with assigned: true
          const assignedTrueElements = [];
          for (let i = 0; i < searchCriteria.length; i++) {
            const criteria = searchCriteria[i];
            const matchedElement = responseBody.find(
              (item) => item.name === criteria && item.assigned
            );
            if (matchedElement) {
              assignedTrueElements.push(matchedElement);
              cy.log("YES ELEMENTS");
            } else {
              cy.log("NO ELEMENTS");
            }
          }

          // Uncheck elements with assigned: true
          cy.log("Elements with assigned: true after search:");
          cy.wrap(assignedTrueElements).each((item) => {
            cy.log(
              `ID: ${item.id}, Name: ${item.name}, Assigned: ${item.assigned}`
            );
            cy.contains(
              ".pdf_dictionary__table > table > tbody > tr > td",
              item.name
            )
              .parent()
              .find('td:first-child input[type="checkbox"]')
              .should("be.visible")
              .uncheck({ force: true }); // Use force if needed
          });
        });
      });

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
    cy.logoutFromSW();
    // cy.get(".logout-icon ").click();
    // cy.wait(2000);
    // cy.get(".confirm-buttons > :nth-child(2)").click();
    // cy.url();
    // cy.should("include", "https://supportviewpayslip.edeja.com/fe/login"); // Validate url
  }); //end it
}); //end describe

// /// <reference types="Cypress" />

// describe("Disable XML template by Masteruser", () => {
//   // Custom command to load translation based on the selected language
//   Cypress.Commands.add("loadTranslate", (language) => {
//     cy.fixture(`${language}.json`).as("t");
//   });

//   // Custom command to get the opposite language
//   Cypress.Commands.add("getOppositeLanguage", (currentLanguage) => {
//     return currentLanguage === "English" ? "German" : "English";
//   });

//   // Custom command to perform logout
//   Cypress.Commands.add("logout", () => {
//     cy.get(".logout-icon ").click();
//     cy.wait(2000);
//     cy.get(".confirm-buttons > :nth-child(2)").click();
//     cy.url().should("include", "https://supportviewpayslip.edeja.com/fe/login"); // Validate url
//   });

//   it("Disable XML template by Masteruser", () => {
//     cy.loginToSupportViewMaster(); //login as a masteruser

//     cy.intercept(
//       "GET",
//       "https://supportviewpayslip.edeja.com/be/supportView/v1/group/template/tenant/AQUA"
//     ).as("apiRequest");

//     //get language and switch to opposite language
//     cy.get("#mat-select-value-1")
//       .invoke("text")
//       .then((selectedLanguage) => {
//         const oppositeLanguage = cy.getOppositeLanguage(
//           selectedLanguage.trim()
//         );
//         cy.log(`Selected Language: ${selectedLanguage}`);
//         cy.log(`Switching to Opposite Language: ${oppositeLanguage}`);

//         cy.selectLanguage(oppositeLanguage); // Select the opposite language
//         cy.loadTranslate(oppositeLanguage); // Load translation based on the opposite language
//       });

//     cy.get("@t").then((t) => {
//       // Search for Group section
//       cy.contains("#searchButton>span", t["Search"]).click();

//       // Verify search form labels
//       cy.get(".search-dialog>form>.form-fields>.searchText-wrap>.label").each(
//         ($label, index) => {
//           const expectedLabel = [
//             t["Account Number"],
//             t["Display Name"],
//             t["Description"],
//           ][index];
//           expect($label.text()).to.include(expectedLabel);
//         }
//       );

//       // Verify search form action buttons
//       cy.get(
//         ".search-dialog>form>.form-actions>button>.mdc-button__label"
//       ).each(($button, index) => {
//         const expectedButton = [t["resetUserSearch"], t["searchUser"]][index];
//         expect($button.text()).to.include(expectedButton);
//       });

//       // Search for Group by Display Name
//       cy.fixture("supportView.json").then((data) => {
//         const companyName = data.company;
//         cy.get(".search-dialog>form>.form-fields>.searchText-wrap")
//           .eq(1)
//           .type(companyName);
//       });

//       // Click on the Search button
//       cy.get(".search-dialog>form>.form-actions>button")
//         .contains(t["searchUser"])
//         .click();

//       // Verify action buttons labels
//       const actionButtonsLabels = [
//         t["Edit"],
//         t["Assign XML Template"],
//         t["Assign PDF Dictionary"],
//         t["Admin User"],
//         t["User"],
//       ];
//       cy.get(".action-buttons>button>.mdc-button__label").each(
//         ($button, index) => {
//           expect($button.text()).to.include(actionButtonsLabels[index]);
//         }
//       );

//       // Click on the button to assign XML template
//       cy.contains(".action-buttons button", t["Assign XML Template"]).click();

//       // Log elements in the PDF dictionary table
//       cy.get(".pdf_dictionary__table > table > tbody > tr").each(
//         ($el, index) => {
//           cy.log(`Element ${index + 1}: ${$el.text()}`);
//         }
//       );

//       // Load search criteria and handle API response
//       cy.fixture("supportView.json").then((data) => {
//         const searchCriteria = data.disableXML.map((item) => item.name);
//         cy.log(searchCriteria);

//         cy.waitForApiResponse(searchCriteria);
//       });

//       // Click on the Save button and check validation message
//       cy.get(".pdf_dictionary>.pdf_dictionary__actions>button")
//         .contains(t["Save"])
//         .click();
//       cy.get(
//         "#mat-snack-bar-container-live-0>div>.mat-mdc-simple-snack-bar>.mat-mdc-snack-bar-label"
//       )
//         .invoke("text")
//         .then((message) => {
//           expect(message).to.include(
//             t["XML template was assigned successfully"]
//           );
//         });

//       // Logout
//       cy.logout();
//     });
//   });
// });
