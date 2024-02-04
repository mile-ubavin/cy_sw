/// <reference types="Cypress" />

describe("Upload Invalid file", () => {
  // Custom command to load t based on the selected language
  Cypress.Commands.add("loadTranslate", (language) => {
    cy.fixture(`${language}.json`).as("t");
  });
  //getOppositeLanguage
  function getOppositeLanguage(currentLanguage) {
    return currentLanguage === "English" ? "German" : "English";
  }

  it("Upload valid document", () => {
    cy.loginToSupportViewMaster();
    cy.get(".lagnuage-menu")
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
      //Search
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
          expect(searchLabel, "Search label 1:").to.include(
            t["Account Number"]
          );
        }); //end
      cy.get(".search-dialog>form>.form-fields>.searchText-wrap>.label")
        .eq(1)
        .invoke("text")
        .then((searchLabel) => {
          expect(searchLabel, "Search label 2:").to.include(t["Display Name"]);
        }); //end
      cy.get(".search-dialog>form>.form-fields>.searchText-wrap>.label")
        .eq(2)
        .invoke("text")
        .then((searchLabel) => {
          expect(searchLabel, "Search label 3:").to.include(t["Description"]);
        }); //end

      //Search form Action buttons

      cy.get(".search-dialog>form>.form-actions>button>.mdc-button__label")
        .eq(0)
        .invoke("text")
        .then((searchButton) => {
          expect(searchButton, "Search button 1:").to.include(
            t["resetUserSearch"]
          );
        }); //end
      cy.get(".search-dialog>form>.form-actions>button>.mdc-button__label")
        .eq(1)
        .invoke("text")
        .then((searchButton) => {
          expect(searchButton, "Search button 2:").to.include(t["searchUser"]);
        }); //end
      //Search placeholders
      ///Error
      // cy.get("#mat-input-1")
      //   .eq(0)
      //   .invoke("attr", "placeholder")
      //   .then((searchPlaceholder) => {
      //     expect(searchPlaceholder, "searchPlaceholder 1:").to.include(
      //       t["Enter the Account Number"]
      //     );
      //   }); //end

      // cy.get(
      //   ".searchText-wrap .mat-mdc-form-field .mdc-text-field .mat-mdc-form-field-flex > div > input"
      // )
      //   .eq(0)
      //   .invoke("attr", "placeholder")
      //   .then((placeholderText) => {
      //     cy.log(`Placeholder Text: ${placeholderText}`);
      //     expect(placeholderText).to.include(t["Enter the Account Number"]);
      //   });
      // cy.get("#mat-input-1")
      //   .invoke("text")
      //   .then((searchPlaceholder) => {
      //     expect(searchPlaceholder, "searchPlaceholder 2:").to.include(
      //       t["Enter the displayname..."]
      //     );
      //   }); //end
      // cy.get("#mat-input-2")
      //   .invoke("text")
      //   .then((searchPlaceholder) => {
      //     expect(searchPlaceholder, "searchPlaceholder 3:").to.include(
      //       t["Enter the description..."]
      //     );
      //   }); //end
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

      // TABLE

      cy.get(".pdf_dictionary__table>table>tbody>tr>td")
        .contains("BB Care")
        .parent() // Move up to the parent row
        .find('td:first-child input[type="checkbox"]')
        .uncheck(); //

      //  "BB Care" is in a specific <td> element
      cy.get(".pdf_dictionary__table>table>tbody>tr>td") //Get all td
        .contains("BB Care")
        .parent() // Move up to the parent row
        .find('td:first-child input[type="checkbox"]')
        .then(($checkbox) => {
          // Check if the checkbox is checked
          const isChecked = $checkbox.prop("checked");

          if (isChecked) {
            // If checkbox is checked, close the dialog or perform other actions
            cy.wrap($checkbox).invoke("click"); // or .click() to check the checkbox
            cy.log(
              "Checkbox is already selected. Closing the dialog or other actions..."
            );
            // Add your code to close the dialog or other actions
          } else {
            // If checkbox is not checked, select the checkbox
            cy.log("Checkbox is not selected. Selecting the checkbox...");
          }
        });
    }); //end TRANSLATE
  }); //end it

  //Upload Invalid documet
  // it(`Upload Invalid documet`, function () {
  //   cy.loginToSupportViewAdmin() //SupportView - using custom commands
  //     //Optional
  //     .wait(2000);
  //   cy.get(".lagnuage-menu")
  //     .invoke("text")
  //     .then((selectedLanguage) => {
  //       const oppositeLanguage = getOppositeLanguage(selectedLanguage.trim());
  //       cy.log(`Selected Languages: ${selectedLanguage}`);
  //       cy.log(`Switching to Opposite Language: ${oppositeLanguage}`);

  //       // Select the opposite language
  //       cy.selectLanguage(oppositeLanguage);

  //       // Load t based on the opposite language
  //       cy.loadTranslate(oppositeLanguage);
  //     });

  //   cy.get("@t").then((t) => {
  //     //**********Upload pdf************
  //     //Upload document button
  //     cy.get(".upload__document>.mdc-button__label>.upload__document__text")
  //       .invoke("text")
  //       .then((uploadButtonTxt) => {
  //         // cy.log(`Button Text: ${uploadButtonTxt}`);
  //         expect(uploadButtonTxt).to.include(t["Upload Document"]);
  //       }); // end Upload document button

  //     cy.get(".upload__document").click();
  //     cy.uploadDocument(); //upload invalid document from fixtures folder - custom command
  //     cy.wait(2000);
  //     //Check translate title of Upload document dialog
  //     cy.get(".dialog-header>.dialog-title")
  //       .invoke("text")
  //       .then((dialogTitle) => {
  //         expect(dialogTitle, "Upload document dialog title :").to.include(
  //           t["Upload Documents"]
  //         );
  //       });
  //     cy.get(".ng-star-inserted > .button__footer > .button__icon").click();
  //     // //Spinner txt
  //     // cy.get(".loading-container-temporary>p")
  //     //   .invoke("text")
  //     //   .then((spinnerTxt) => {
  //     //     expect(spinnerTxt, "Spinner Txt:").to.include(t["Please be patient"]);
  //     //   }); //end
  //     cy.get(".danger")
  //       .invoke("text")
  //       .then((dangerTxt) => {
  //         expect(dangerTxt, "Message:").to.include(
  //           t["XML template not supported for current tenant"]
  //         );
  //         //Cancel Button
  //         cy.get(".dialog-actions>button>.title")
  //           .eq(0)
  //           .invoke("text")
  //           .then((cancelButton) => {
  //             expect(cancelButton, "Cancel button title :").to.include(
  //               t.Cancel
  //             );
  //           }); //end
  //         //Confirm button
  //         cy.get(".dialog-actions>button>.title")
  //           .eq(1)
  //           .invoke("text")
  //           .then((cancelButton) => {
  //             expect(cancelButton, "Send buton title :").to.include(t.Send);
  //           }); //end

  //         cy.wait(5000);
  //         cy.get(".dialog-actions>button>.title").eq(0).click(); //Click on Cancel button
  //         // cy.get(".close").click(); //Close upload dialog
  //       }); // end upload
  //   }); //END TRANSLATE
  //   cy.wait(3000);

  //   //Logout;
  //   // cy.get(".logout-icon ").click();
  //   // cy.wait(2000);
  //   // cy.get(".confirm-buttons > :nth-child(2)").click();
  //   // cy.url();
  //   // cy.should("include", "https://supportviewpayslip.edeja.com/fe/login"); // Validate url
  // }); //end it
});
