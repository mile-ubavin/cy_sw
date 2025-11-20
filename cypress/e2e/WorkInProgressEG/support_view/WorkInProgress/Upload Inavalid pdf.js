// Import test that alredy exixts
//PRECONDIION:
import "./Enable xml teplate by Masteruser";
import "./Disable xml teplate by Masteruser";
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

  //Upload Invalid documets
  it(`Upload Invalid documets by Admn User`, function () {
    cy.loginToSupportViewAdmin() //SupportView - using custom commands
      //Optional
      .wait(2000);
    cy.get(".lagnuage-menu")
      .invoke("text")
      .then((selectedLanguage) => {
        const oppositeLanguage = getOppositeLanguage(selectedLanguage.trim());
        cy.log(`Selected Languages: ${selectedLanguage}`);
        cy.log(`Switching to Opposite Language: ${oppositeLanguage}`);

        // Select the opposite language
        cy.selectLanguage(oppositeLanguage);
        cy.wait(1500);

        // Load t based on the opposite language
        cy.loadTranslate(oppositeLanguage);
        cy.wait(1500);
      });

    cy.get("@t").then((t) => {
      //**********Upload pdf************
      //Upload document button
      cy.get(".upload__document>.mdc-button__label>.upload__document__text")
        .invoke("text")
        .then((uploadButtonTxt) => {
          // cy.log(`Button Text: ${uploadButtonTxt}`);
          expect(uploadButtonTxt).to.include(t["Upload Document"]);
          // cy.log("uploadButtonTxt :", uploadButtonTxt);
        }); // end Upload document button
      //Click on button with txt taken from translate (Upload Documents)
      const uploadButton = t["Upload Document"];
      cy.get(".upload__document").contains(uploadButton).click();

      //cy.uploadDocument(); //upload invalid document from fixtures folder - custom command

      cy.uploadMultipleDocuments([
        "T101___G_OVJ11_BB_Care.xml",
        "example.json",
      ]);
      cy.wait(2000);
      //Check translate title of Upload document dialog
      cy.get(".dialog-header>.dialog-title")
        .invoke("text")
        .then((dialogTitle) => {
          expect(dialogTitle, "Upload document dialog title :").to.include(
            t["Upload Documents"]
          );
        });
      cy.get(".ng-star-inserted > .button__footer > .button__icon").click();
      // //Spinner txt
      // cy.get(".loading-container-temporary>p")
      //   .invoke("text")
      //   .then((spinnerTxt) => {
      //     expect(spinnerTxt, "Spinner Txt:").to.include(t["Please be patient"]);
      //   }); //end
      cy.get(".danger")
        .invoke("text")
        .then((dangerTxt) => {
          expect(dangerTxt, "Message:").to.include(
            t["XML template not supported for current tenant"]
          );
          //Cancel Button
          cy.get(".dialog-actions>button>.title")
            .eq(0)
            .invoke("text")
            .then((cancelButton) => {
              expect(cancelButton, "Cancel button title :").to.include(
                t.Cancel
              );
            }); //end
          //Confirm button
          cy.get(".dialog-actions>button>.title")
            .eq(1)
            .invoke("text")
            .then((cancelButton) => {
              expect(cancelButton, "Send buton title :").to.include(t.Send);
            }); //end

          cy.wait(3000);

          //Click on button with txt taken from translate (Cancel)
          const cancelButton = t.Cancel;
          cy.get(".dialog-actions>button").contains(cancelButton).click();

          // cy.get(".close").click(); //Close upload dialog
        }); // end upload
      //Help page

      //Sidebar label
      cy.get(".side-menu>ul>li>a").then((elements) => {
        const liTotal = elements.length;
        const labelValues = [];

        for (let i = 0; i < liTotal; i++) {
          cy.get(".side-menu>ul>li>a")
            .eq(i)
            .invoke("text")
            .then((text) => {
              const awrap = text.trim();
              // cy.log(`Element ${i + 1} - Value: ${awrap}`);
              labelValues.push(awrap);
              if (labelValues.length === liTotal) {
                // All labels have been processed
                // cy.log(
                //   "Accessing headerwrap values outside the loop:",
                //   labelValues
                // );
                // cy.log(`Total Number of Elements: ${liTotal}`);

                // // Display label values in the Cypress test runner
                // cy.log("label Values:", labelValues.join(", "));

                // Assertions for Sidebar label values
                expect(labelValues).to.include(t["Companies"]);
                expect(labelValues).to.include("av_timer" + t["Activity Log"]);
                expect(labelValues).to.include(t.Help);
              }
              //Click on button with txt taken from translate (Cancel)
              const helpButton = t.Help;
              cy.get(".side-menu>ul>li>a").contains(helpButton).click();
            });
          cy.get(
            "tp-accordion-group.ng-tns-c3556106344-2 > .inner-header > strong"
          ).click();
        }
      }); //end label
    }); //END TRANSLATE
    cy.wait(3000);

    //Logout;
    // cy.get(".logout-icon ").click();
    // cy.wait(2000);
    // cy.get(".confirm-buttons > :nth-child(2)").click();
    // cy.url();
    // cy.should("include", "https://supportviewpayslip.edeja.com/fe/login"); // Validate url
  }); //end it
});
