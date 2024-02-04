// Import test that alredy exixts
//import "./account-Lock-Test";

describe("Translate - SupportView", () => {
  // Custom command to select language
  Cypress.Commands.add("selectLanguage", (language) => {
    cy.get(".lagnuage-menu").click();
    cy.wait(1000);
    cy.get(`#mat-select-0-panel`).contains(language).click();
  });

  // Custom command to load t based on the selected language
  Cypress.Commands.add("loadt", (language) => {
    cy.fixture(`${language}.json`).as("t");
  });
  //getOppositeLanguage
  function getOppositeLanguage(currentLanguage) {
    return currentLanguage === "English" ? "German" : "English";
  }

  // beforeEach(() => {
  //   cy.log("Starting beforeEach hook");
  //   cy.log("Completed beforeEach hook");
  // });

  // Login as Admin User to sw, Logout
  it(`Translate - Company Page`, function () {
    // cy.selectLanguage();
    //     cy.loadt();

    cy.loginToSupportViewAdmin().wait(1000);
    // Get the current language and switch to the opposite
    cy.get(".lagnuage-menu")
      .invoke("text")
      .then((selectedLanguage) => {
        const oppositeLanguage = getOppositeLanguage(selectedLanguage.trim());
        cy.log(`Selected Language: ${selectedLanguage}`);
        cy.log(`Switching to Opposite Language: ${oppositeLanguage}`);

        // Select the opposite language
        cy.selectLanguage(oppositeLanguage);

        // Load t based on the opposite language
        cy.loadt(oppositeLanguage);
      });

    // Your test code using t
    cy.get("@t").then((t) => {
      cy.log(`Welcome text: ${t.Welcome}`);
      cy.log(`Companies text: ${t["Companies"]}`);
      cy.log(`Upload Document button: ${t["Upload Document"]}`);
      cy.log(`Welcome - top Right: ${t.Welcome}`);
      cy.log(`Sidebar label text: ${t["Companies"]}`);
      cy.log(`Sidebar label text: ${t["Activity Log"]}`);
      cy.log(`Sidebar label text: ${t.Help}`);
      //Table
      cy.log(`Table Header: ${t["Account Number"]}`);
      // cy.log(`Table Header: ${t.displayName}`);
      cy.log(`Table Header: ${t["Display Name"]}`);
      cy.log(`Table Header: ${t.Description}`);
      cy.log(`Table Header: ${t.Help}`);
      cy.log(`Table Header: ${t.Administrators}`);
      cy.log(`Table Header: ${t.Dictionaries}`);
      cy.log(`Table Header: ${t.Active}`);
      cy.log(`Table Header: ${t.Actions}`);

      // Assertions using t

      //H1 Company
      cy.get("h1.ng-star-inserted")
        .invoke("text")
        .then((company) => {
          // cy.log(`Button Text: ${company}`);
          expect(company).to.include(t["Companies"]);
        }); //end H1

      //Upload document button
      cy.get(".upload__document>.mdc-button__label>.upload__document__text")
        .invoke("text")
        .then((uploadButtonTxt) => {
          // cy.log(`Button Text: ${uploadButtonTxt}`);
          expect(uploadButtonTxt).to.include(t["Upload Document"]);
        }); // end Upload document button

      // Welcome
      cy.get(".mat-mdc-menu-trigger")
        .invoke("text")
        .then((welcome) => {
          // cy.log(`Button Text: ${welcome}`);
          expect(welcome).to.include(t.Welcome);
        }); //end Welcome

      //Search
      cy.get("#searchButton>span")
        .invoke("text")
        .then((search) => {
          expect(search, "Message:").to.include(t["Search"]);
        }); //end Search

      //Hide Sidebar
      cy.get(".triger-navigation")
        .invoke("text")
        .then((sidebar) => {
          // cy.log(`Button Text: ${company}`);
          expect(sidebar).to.include(t["Close navigation"]);
        }); //Hide Sidebar

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
            });
        }
      }); //end label

      // Table Header
      cy.get(".header-wrap").then((elements) => {
        const totalElements = elements.length;
        const headerValues = [];

        for (let i = 0; i < totalElements; i++) {
          cy.get(".header-wrap")
            .eq(i)
            .invoke("text")
            .then((text) => {
              const headerwrap = text.trim();
              // cy.log(`Element ${i + 1} - Value: ${headerwrap}`);
              headerValues.push(headerwrap);
              // Adjust with your specific assertions if needed
              if (headerValues.length === totalElements) {
                // All headers have been processed
                // cy.log(
                //   "Accessing headerwrap values outside the loop:",
                //   headerValues
                // );
                // cy.log(`Total Number of Elements: ${totalElements}`);

                // // Display headerwrap values in the Cypress test runner
                // cy.log("Header Values:", headerValues.join(", "));

                // Add assertions for specific header values
                expect(headerValues).to.include(t["Account Number"]);
                expect(headerValues).to.include(t["Display Name"]);
                expect(headerValues).to.include(t["Description"]);
                expect(headerValues).to.include(t.Users);
                expect(headerValues).to.include(t.Administrators);
                expect(headerValues).to.include(t.Dictionaries);
                expect(headerValues).to.include(t.Active);
                expect(headerValues).to.include(t.Actions);
              }
            });
        }
      }); //end Table Headers

      //Table Buttons
      cy.get(
        ".cell-content-wrap>.ng-star-inserted>div>.action-buttons>.mdc-button>.mdc-button__label"
      ).then((elements) => {
        const totalButtons = elements.length;
        const buttonTXT = [];

        for (let i = 0; i < totalButtons; i++) {
          cy.get(
            ".cell-content-wrap>.ng-star-inserted>div>.action-buttons>.mdc-button>.mdc-button__label"
          )
            .eq(i)
            .invoke("text")
            .then((text) => {
              const button = text.trim();
              // cy.log(`Element ${i + 1} - Value: ${button}`);
              buttonTXT.push(button);

              // Add assertions based on specific button values

              if (buttonTXT.length === totalButtons) {
                // All headers have been processed
                // cy.log(
                //   "Accessing buttonTXT values outside the loop:",
                //   buttonTXT
                // );
                // cy.log(`Total Number of Buttons: ${totalButtons}`);

                // // Display buttonTXT values in the Cypress test runner
                // cy.log("Buttons Values:", buttonTXT.join(", "));

                // Add assertions for specific button values
                expect(buttonTXT).to.include(t.Edit);
                expect(buttonTXT).to.include(t["Admin User"]);
                expect(buttonTXT).to.include(t.User);
              }
            });
        }
      }); //end buttons

      // Pagination
      cy.get("#mat-paginator-page-size-label-0")
        .invoke("text")
        .then((paginationTxt) => {
          // cy.log(`pagination Text: ${paginationTxt}`);
          expect(paginationTxt, "pagination txt is:").to.include(
            t["Items per page:"]
          );
        }); // end pagination

      // Footer
      cy.get("footer>ul>li>a").then((elements) => {
        const totalElements = elements.length;
        const footerValues = [];

        for (let i = 0; i < totalElements; i++) {
          cy.get("footer>ul>li>a")
            .eq(i)
            .invoke("text")
            .then((text) => {
              const footerwrap = text.trim();
              // cy.log(`Element ${i + 1} - Value: ${footerwrap}`);
              footerValues.push(footerwrap);
              // Adjust with your specific assertions if needed
              if (footerValues.length === totalElements) {
                // All footers have been processed
                // cy.log(
                //   "Accessing footerwrap values outside the loop:",
                //   footerValues
                // );
                // cy.log(`Total Number of Elements: ${totalElements}`);

                // // Display footerwrap values in the Cypress test runner
                // cy.log("footer Values:", footerValues.join(", "));
                // Add assertions for specific footer values
                expect(footerValues).to.include(t.Imprint);
                expect(footerValues).to.include(
                  t["Legal Information & Data Protection Policy"]
                );
                expect(footerValues).to.include(
                  t["Alternative Dispute Resolution"]
                );
                expect(footerValues).to.include(
                  t["General Terms & Conditions"]
                );
              }
            });
        }
      }); //end footer

      //Upload pdf
      //Upload document button
      cy.get(".upload__document>.mdc-button__label>.upload__document__text")
        .invoke("text")
        .then((uploadButtonTxt) => {
          // cy.log(`Button Text: ${uploadButtonTxt}`);
          expect(uploadButtonTxt).to.include(t["Upload Document"]);
        }); // end Upload document button

      cy.get(".upload__document").click();
      cy.uploadDocument(); //upload invalid document from fixtures folder - custom command
      cy.wait(2000);
      //Check translate title of Upload document dialog
      cy.get(".dialog-header>.dialog-title")
        .invoke("text")
        .then((dialogTitle) => {
          expect(dialogTitle, "Upload document dialog title").to.include(
            t["Upload Documents"]
          );
        });
      cy.get(".ng-star-inserted > .button__footer > .button__icon").click();
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
              expect(cancelButton, "Cancel button title").to.include(t.Cancel);
            }); //end
          //Confirm button
          cy.get(".dialog-actions>button>.title")
            .eq(1)
            .invoke("text")
            .then((cancelButton) => {
              expect(cancelButton, "Upload document dialog title").to.include(
                t.Send
              );
            }); //end

          cy.wait(5000);
          cy.get(".dialog-actions>button>.title").eq(0).click();
          // cy.get(".close").click(); //Close upload dialog
        }); // end upload
    }); //END TRANSLATE
  }); //end it

  // You can add more test cases here, and the beforeEach hook will run before each of them.

  // Logout after all tests are complete
  after(() => {
    //Logout;
    // cy.get(".logout-icon ").click();
    // cy.wait(2000);
    // cy.get(".confirm-buttons > :nth-child(2)").click();
    // cy.url();
    // cy.should("include", "https://supportviewpayslip.edeja.com/fe/login"); // Validate url
  });
});
