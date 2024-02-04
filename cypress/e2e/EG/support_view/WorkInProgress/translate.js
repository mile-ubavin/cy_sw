/// <reference types="Cypress" />
describe("Login/Logout to SupportView base scenario", () => {
  //Login as Admin User to sw, Logout
  it(`login`, function () {
    cy.loginToSupportViewAdmin() //SupportView - using custom commands
      //Optional
      .wait(2000);
    cy.get(".lagnuage-menu").click();
    cy.wait(1000);
    cy.get(
      "#mat-select-0-panel > .mdc-list-item > .mdc-list-item__primary-text"
    )
      .eq(0) // Select the first element (index 0)
      .click();
    cy.get(".lagnuage-menu")
      .invoke("text")
      .then((selectedLanguage) => {
        if (selectedLanguage === "English" || selectedLanguage === "Deutch") {
          // ****************ENGLISH*************************

          cy.log("Selected language is English");
          cy.get(".lagnuage-menu").click();
          cy.get(".mdc-list-item__primary-text > span")
            .eq(0)
            .invoke("text")
            .then((buttonText) => {
              // Perform actions or assertions based on the button text
              cy.log(`Button Text: ${buttonText}`);
              expect(
                buttonText.includes("German") || buttonText.includes("English")
              ).to.be.true;
            });

          cy.get(".mdc-list-item__primary-text > span")
            .eq(1)
            .invoke("text")
            .then((buttonText) => {
              // Perform actions or assertions based on the button text
              cy.log(`Button Text: ${buttonText}`);
              expect(
                buttonText.includes("German") || buttonText.includes("English")
              ).to.be.true;
            });

          // Welcome
          cy.get(".mat-mdc-menu-trigger")
            .invoke("text")
            .then((welcome) => {
              cy.log(`Button Text: ${welcome}`);
              expect(welcome).to.include("Welcome");
            });
          //H1 Company
          cy.get("h1.ng-star-inserted")
            .invoke("text")
            .then((company) => {
              cy.log(`Button Text: ${company}`);
              expect(company).to.include("Companies");
            });

          //Upload document button
          cy.get(
            ".button-wraper>.upload__document>.mdc-button__label>.upload__document__text"
          )
            .invoke("text")
            .then((uploadButtonTxt) => {
              cy.log(`Button Text: ${uploadButtonTxt}`);
              expect(uploadButtonTxt, "Button txt is:").to.include(
                "Upload Document"
              );
            }); // end Upload document button

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
                  cy.log(`Element ${i + 1} - Value: ${headerwrap}`);
                  headerValues.push(headerwrap);

                  // Add assertions based on specific header values
                  // Adjust with your specific assertions if needed
                  if (headerValues.length === totalElements) {
                    // All headers have been processed
                    cy.log(
                      "Accessing headerwrap values outside the loop:",
                      headerValues
                    );
                    cy.log(`Total Number of Elements: ${totalElements}`);

                    // Display headerwrap values in the Cypress test runner
                    cy.log("Header Values:", headerValues.join(", "));

                    // Add assertions for specific header values
                    expect(headerValues).to.include("Account Number");
                    expect(headerValues).to.include("Display Name");
                    expect(headerValues).to.include("Description");
                    expect(headerValues).to.include("Users");
                    expect(headerValues).to.include("Administrators");
                    expect(headerValues).to.include("Dictionaries");
                    expect(headerValues).to.include("Active");
                    expect(headerValues).to.include("Actions");
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
                  cy.log(`Element ${i + 1} - Value: ${button}`);
                  buttonTXT.push(button);

                  // Add assertions based on specific button values

                  if (buttonTXT.length === totalButtons) {
                    // All headers have been processed
                    cy.log(
                      "Accessing buttonTXT values outside the loop:",
                      buttonTXT
                    );
                    cy.log(`Total Number of Buttons: ${totalButtons}`);

                    // Display buttonTXT values in the Cypress test runner
                    cy.log("Buttons Values:", buttonTXT.join(", "));

                    // Add assertions for specific button values
                    expect(buttonTXT).to.include("Edit");
                    expect(buttonTXT).to.include("Admin User");
                    expect(buttonTXT).to.include("User");
                  }
                });
            }
          }); //end buttons

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
                  cy.log(`Element ${i + 1} - Value: ${awrap}`);
                  labelValues.push(awrap);

                  if (labelValues.length === liTotal) {
                    // All labels have been processed
                    cy.log(
                      "Accessing headerwrap values outside the loop:",
                      labelValues
                    );
                    cy.log(`Total Number of Elements: ${liTotal}`);

                    // Display label values in the Cypress test runner
                    cy.log("label Values:", labelValues.join(", "));

                    // Add assertions for specific label values
                    expect(labelValues).to.include("Companies");
                    expect(labelValues).to.include("av_timerActivity Log");
                    expect(labelValues).to.include("Help");
                  }
                });
            }
          }); //end label

          // Pagination
          cy.get("#mat-paginator-page-size-label-0")
            .invoke("text")
            .then((paginationTxt) => {
              cy.log(`pagination Text: ${paginationTxt}`);
              expect(paginationTxt, "pagination txt is:").to.include(
                "Items per page:"
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
                  cy.log(`Element ${i + 1} - Value: ${footerwrap}`);
                  footerValues.push(footerwrap);

                  // Add assertions based on specific footer values
                  // Adjust with your specific assertions if needed
                  if (footerValues.length === totalElements) {
                    // All footers have been processed
                    cy.log(
                      "Accessing footerwrap values outside the loop:",
                      footerValues
                    );
                    cy.log(`Total Number of Elements: ${totalElements}`);

                    // Display footerwrap values in the Cypress test runner
                    cy.log("footer Values:", footerValues.join(", "));

                    // Add assertions for specific footer values
                    expect(footerValues).to.include("Imprint");
                    expect(footerValues).to.include(
                      "Legal Information & Data Protection Policy"
                    );
                    expect(footerValues).to.include(
                      "Alternative Dispute Resolution"
                    );
                    expect(footerValues).to.include(
                      "General Terms & Conditions"
                    );
                  }
                });
            }
          }); //end footer
        } else {
          // ****************GERMAN*************************

          cy.log("Selected language is German");
          cy.get(".lagnuage-menu").click(); //
          cy.get(".mdc-list-item__primary-text > span")
            .eq(0)
            .invoke("text")
            .then((buttonText) => {
              // Perform actions or assertions based on the button text
              cy.log(`Button Text: ${buttonText}`);
              expect(
                buttonText.includes("Deutsch") || buttonText.includes("English")
              ).to.be.true;
            });

          cy.get(".mdc-list-item__primary-text > span")
            .eq(1)
            .invoke("text")
            .then((buttonText) => {
              // Perform actions or assertions based on the button text
              cy.log(`Button Text: ${buttonText}`);
              expect(
                buttonText.includes("Deutsch") || buttonText.includes("English")
              ).to.be.true;
              // Willkommen
              cy.get(".mat-mdc-menu-trigger")
                .invoke("text")
                .then((welcome) => {
                  cy.log(`Button Text: ${welcome}`);
                  expect(welcome).to.include("Willkommen");
                });

              //H1 Company
              cy.get("h1.ng-star-inserted")
                .invoke("text")
                .then((company) => {
                  cy.log(`Button Text: ${company}`);
                  expect(company).to.include("Firmen");
                });

              //Upload document button
              cy.get(
                ".button-wraper>.upload__document>.mdc-button__label>.upload__document__text"
              )
                .invoke("text")
                .then((uploadButtonTxt) => {
                  cy.log(`Button Text: ${uploadButtonTxt}`);
                  expect(uploadButtonTxt).to.include("Dokument hochladen");
                }); // end Upload document button

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
                      cy.log(`Element ${i + 1} - Value: ${headerwrap}`);
                      headerValues.push(headerwrap);

                      // Add assertions based on specific header values
                      // Adjust with your specific assertions if needed
                      if (headerValues.length === totalElements) {
                        // All headers have been processed
                        cy.log(
                          "Accessing headerwrap values outside the loop:",
                          headerValues
                        );
                        cy.log(`Total Number of Elements: ${totalElements}`);

                        // Display headerwrap values in the Cypress test runner
                        cy.log("Header Values:", headerValues.join(", "));

                        // Add assertions for specific header values
                        expect(headerValues).to.include("Personalnummer");
                        expect(headerValues).to.include("Anzeigename");
                        expect(headerValues).to.include("Beschreibungen");
                        expect(headerValues).to.include("Benutzer");
                        expect(headerValues).to.include("Administratoren");
                        expect(headerValues).to.include("Dictionaries");
                        expect(headerValues).to.include("Aktiv");
                        expect(headerValues).to.include("Aktionen");
                      }
                    });
                }
              }); //end table

              //Buttons

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
                    .then((text1) => {
                      const button = text1.trim();
                      cy.log(`Element ${i + 1} - Value: ${button}`);
                      buttonTXT.push(button);

                      // Add assertions based on specific button values

                      if (buttonTXT.length === totalButtons) {
                        // All headers have been processed
                        cy.log(
                          "Accessing buttonTXT values outside the loop:",
                          buttonTXT
                        );
                        cy.log(`Total Number of Buttons: ${totalButtons}`);

                        // Display buttonTXT values in the Cypress test runner
                        cy.log("Buttons Values:", buttonTXT.join(", "));

                        // Add assertions for specific button values
                        expect(buttonTXT).to.include("Bearbeiten");
                        expect(buttonTXT).to.include("Admin Benutzer");
                        expect(buttonTXT).to.include("Benutzer");
                      }
                    });
                }
              }); //end buttons

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
                      cy.log(`Element ${i + 1} - Value: ${awrap}`);
                      labelValues.push(awrap);

                      if (labelValues.length === liTotal) {
                        // All labels have been processed
                        cy.log(
                          "Accessing headerwrap values outside the loop:",
                          labelValues
                        );
                        cy.log(`Total Number of Elements: ${liTotal}`);

                        // Display label values in the Cypress test runner
                        cy.log("label Values:", labelValues.join(", "));

                        // Add assertions for specific label values
                        expect(labelValues).to.include("Firmen");
                        expect(labelValues).to.include(
                          "av_timerAktivitäten Log"
                        );
                        expect(labelValues).to.include("Hilfe");
                      }
                    });
                }
              }); //end label

              // Pagination
              cy.get("#mat-paginator-page-size-label-0")
                .invoke("text")
                .then((paginationTxt) => {
                  cy.log(`pagination Text: ${paginationTxt}`);
                  expect(paginationTxt, "pagination txt is:").to.include(
                    "Einträge pro Seite:"
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
                      cy.log(`Element ${i + 1} - Value: ${footerwrap}`);
                      footerValues.push(footerwrap);

                      // Add assertions based on specific footer values
                      // Adjust with your specific assertions if needed
                      if (footerValues.length === totalElements) {
                        // All footers have been processed
                        cy.log(
                          "Accessing footerwrap values outside the loop:",
                          footerValues
                        );
                        cy.log(`Total Number of Elements: ${totalElements}`);

                        // Display footerwrap values in the Cypress test runner
                        cy.log("footer Values:", footerValues.join(", "));

                        // Add assertions for specific footer values
                        expect(footerValues).to.include("Impressum");
                        expect(footerValues).to.include(
                          "Rechtliche Hinweise / Datenschutzhinweise"
                        );
                        expect(footerValues).to.include(
                          "Alternative Streitbeilegung"
                        );
                        expect(footerValues).to.include(
                          "Allgemeine Geschäftsbedingungen"
                        );
                      }
                    });
                }
              }); //end footer
            });
        }
      });

    // //Upload pdf
    // cy.get(".upload__document").click();
    // cy.uploadDocument(); //upload invalid document from fixtures folder - custom command
    // cy.wait(2000);
    // cy.get(".ng-star-inserted > .button__footer > .button__icon").click();
    // //cy.get(".mat-select-placeholder");
    // cy.get("span.danger.ng-star-inserted").should(
    //   "include.text",
    //   "Dieses XML Format ist für diese Firma nicht konfiguriert"
    // );
    // cy.wait(5000);
    // cy.get(".close").click(); //Close upload dialog

    //Upload pdf
    // cy.get(".upload__document").click();
    // cy.uploadDocument(); //upload invalid document from fixtures folder - custom command
    // cy.wait(2000);
    // cy.get(".ng-star-inserted > .button__footer > .button__icon").click();
    // cy.get('.mat-select-placeholder')
    // cy.get(".danger").should(
    //   "include.text",
    //   "XML template not supported for current tenant"
    // );

    // cy.wait(1000);
    // cy.get("button>.title").contains("Send").click();
    // cy.wait(1000);
    //Logout;
    // cy.get(".logout-icon ").click();
    // cy.wait(2000);
    // cy.get(".confirm-buttons > :nth-child(2)").click();
    // cy.url();
    // cy.should("include", "https://supportviewpayslip.edeja.com/fe/login"); // Validate url
  }); //end it
});
