/// <reference types="Cypress" />

describe("Activate/Deactivate user from SW", () => {
  it("Activate/Deactivate user from SW", () => {
    cy.loginToSupportViewAdmin(); //SupportView - using custom commands
    //Optional
    // .wait(1000);
    cy.get(".mat-mdc-select-placeholder")
      .invoke("text")
      .then((selectedLanguage) => {
        if (selectedLanguage === "English" || selectedLanguage === "Deutsch") {
          // Code to execute depending on the selected language
          cy.log(selectedLanguage);
          //Verify button title depending on transalte (Users/Eng)
          cy.get(":nth-child(8) > .mdc-button > .mdc-button__label")
            .invoke("text")
            .then((buttonText) => {
              if (
                buttonText.includes("View person") ||
                buttonText.includes("Benutzer")
              ) {
                cy.log("Button title is 'View person' or 'Benutzer'");
                // Add additional assertions or actions if needed
              } else {
              }
            }); //Verify button title depending on transalte
          cy.get(":nth-child(8) > .mdc-button > .mdc-button__label").click(); //Click on Users button
          cy.get(
            ":nth-child(2) > .cdk-column-actions > .cell-content-wrap > .ng-star-inserted > div > .action-buttons > .mdc-button"
          )
            .invoke("text")
            .then((buttonText) => {
              // Perform actions or assertions based on the button text
              cy.log(`Button Text: ${buttonText}`); //log action buttons text
              if (
                buttonText.includes("Activate") ||
                buttonText.includes(" Aktivieren ")
              ) {
                // Clicking on the Activate button
                cy.get(
                  ":nth-child(4) > .mdc-button > .mdc-button__label"
                ).click();
                cy.get(".messages > .success")
                  .invoke("text")
                  .then((successMessage) => {
                    if (
                      successMessage.includes("Successfully activated") ||
                      successMessage.includes("Erfolgreich aktiviert")
                    ) {
                      cy.log("Success message is as expected");
                      // Add additional assertions or actions if needed
                    } else {
                      throw new Error(
                        `Unexpected success message: ${successMessage}`
                      );
                    }
                  });
              } else if (
                buttonText.includes("Deactivate") ||
                buttonText.includes(" Deaktivieren ")
              ) {
                // Clicking on the Deactivate button
                cy.get(
                  ":nth-child(2) > .cdk-column-actions > .cell-content-wrap > mat-button.ng-star-inserted > :nth-child(1) > :nth-child(3) > .mdc-button > .mdc-button__label"
                ).click();
                cy.get(".messages > .success")
                  .invoke("text")
                  .then((successMessage) => {
                    if (
                      successMessage.includes("Successfully deactivated") ||
                      successMessage.includes("Erfolgreich deaktiviert")
                    ) {
                      cy.log("Success message is as expected");
                      // Add additional assertions or actions if needed
                    } else {
                      throw new Error(
                        `Unexpected success message: ${successMessage}`
                      );
                    }
                  });
              }
            });
          // } else {
          //   // When the selected language is German, perform actions:
          //   cy.log("Selected language is German"); //lang is German
          //   cy.get(":nth-child(8) > .mdc-button > .mdc-button__label").should(
          //     "have.text",
          //     " Benutzer "
          //   ); //Verify button title depending on transalte (German)

          //   cy.get(":nth-child(8) > .mdc-button > .mdc-button__label").click(); //Click on Users button
          //   cy.get(
          //     ":nth-child(2) > .cdk-column-actions > .cell-content-wrap > .ng-star-inserted > div > .action-buttons > .mdc-button"
          //   )
          //     .invoke("text")
          //     .then((buttonText) => {
          //       // Perform actions or assertions based on the button text
          //       cy.log(`Button Text: ${buttonText}`);
          //       // if (buttonText.includes(" Aktivieren ")) {
          //         if (buttonText.includes(" Aktivieren ") || buttonText.includes("Activate")) {
          //         // Clicking on the Activate button
          //         cy.get(
          //           ":nth-child(4) > .mdc-button > .mdc-button__label"
          //         ).click();
          //         cy.get(".messages>.success").should(
          //           "have.text",
          //           " Erfolgreich aktiviert "
          //         ); //Validate text of success message
          //       } else if (buttonText.includes(" Deaktivieren ")) {
          //         // Clicking on the Deactivate button
          //         cy.get(
          //           ":nth-child(2) > .cdk-column-actions > .cell-content-wrap > mat-button.ng-star-inserted > :nth-child(1) > :nth-child(3) > .mdc-button > .mdc-button__label"
          //         ).click();
          //         cy.get(".messages>.success").should(
          //           "have.text",
          //           " Erfolgreich deaktiviert "
          //         ); //Validate text of success message
          //       }
          //     });
        }
      });
  });
});
