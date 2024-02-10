/// <reference types="Cypress" />

describe("Upload serviceLine pdf file and check emails", () => {
  before(() => {
    cy.deleteAllEmails();
  });

  it(`Upload serviceLine pdf by Admin User and check emails`, function () {
    cy.loginAndUploadServiceLinePDF();
    cy.checkEmails();
    cy.log("Test completed successfully.");
  });

  // Define custom commands
  Cypress.Commands.add("loginAndUploadServiceLinePDF", () => {
    // Login and upload PDF logic
    cy.loginToSupportViewAdmin() //Login custom commands
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
      //Click on button with txt taken from translate (Cancel)
      const uploadButton = t["Upload Document"];
      cy.get(".upload__document").contains(uploadButton).click();
      //Upload muliple doc. using custom command
      cy.uploadValidMultipleDocuments([
        "Serviceline-Demo - 4pages, 3Receivers,1Fail.pdf",
      ]);
      cy.wait(2000);

      //Select last item from Dictionary dropdown
      cy.get(
        ".mat-mdc-text-field-wrapper>div>.mat-mdc-form-field-infix>.mat-mdc-select"
      ).click();
      // Iterate through all dropdown items
      cy.get(
        ".cdk-overlay-connected-position-bounding-box>#cdk-overlay-2>div>.mat-mdc-option>.mdc-list-item__primary-text"
      ).each(($option, index, $list) => {
        // Get the name of the dropdown item
        const itemName = $option.text().trim();
        // Log the name of the dropdown item
        cy.log(`Dropdown item ${index + 1}: ${itemName}`);
        // Get the length of the list of dropdown items
        const listLength = $list.length;
        // If it's the last item, click on it
        if (index === listLength - 1) {
          cy.wrap($option).click(); // Click on the last dropdown item
        }
      });
      //Check translate title of Upload document dialog
      cy.get(".dialog-header>.dialog-title")
        .invoke("text")
        .then((dialogTitle) => {
          expect(dialogTitle, "Upload document dialog title :").to.include(
            t["Upload Documents"]
          );
        });
      cy.get(".ng-star-inserted > .button__footer > .button__icon").click();

      //Check message after Document is successfully uploaded
      cy.get(".success")
        .invoke("text")
        .then((successfullyUploaded) => {
          expect(
            successfullyUploaded,
            "Document successfully uploaded"
          ).to.include(t["Document successfully uploaded"]);
        });

      // Send successfuly uploaded doc
      cy.get(".dialog-actions>button>.title")
        .eq(1)
        .invoke("text")
        .then((sendButton) => {
          expect(sendButton, "Send buton title :").to.include(t.Send);
        }); //end

      //Click on button with txt taken from translate (Cancel)
      const sendButton = t.Send;
      cy.get(".dialog-actions>button").contains(sendButton).click();

      //Check message (success)
      cy.get(".mdc-snackbar__label")
        .invoke("text")
        .then((message) => {
          expect(message, "Message:").to.include(
            t["We are processing in the background"]
          );
        }); //end
    }); //END TRANSLATE
  });

  Cypress.Commands.add("checkEmails", () => {
    const expectedEmailTexts = [
      "Guten Tag,Sie haben 0 Sendungen erfolgreich in des e-Gehaltszettel Portal eingeliefert.0 Sendungen konnten nicht zugestellt werden.1 Sendungen sind in der Warteschlange und werden demnächst verarbeitet.mit freundlichen Grüßen,Ihr e-Gehaltszettel Team",
      "Guten Tag,Sie haben 0 ServiceLine Sendungen erfolgreich in des e-Gehaltszettel Portal eingeliefert.3 Sendungen konnten nicht zugestellt werden.Folgende Personalnummern sind betroffen:ABBA000100279311ABBA234500123mit freundlichen Grüßen,Ihr e-Gehaltszettel Team",
    ];

    cy.visit("https://yopmail.com/en/");
    cy.get("#login").clear().type("aqua.admin@yopmail.com");
    cy.get("#refreshbut > .md > .material-icons-outlined").click();
    cy.wait(3000);
    cy.get("#refresh").click();
    cy.wait(1000);

    cy.iframe("#ifinbox")
      .find(".mctn > .m > button > .lms")
      .eq(0)
      .should("include.text", "Versandreport e-Gehaltszettel Portal");

    cy.iframe("#ifmail")
      .find("#mail>div")
      .invoke("text")
      .then((emailText) => {
        expect(emailText).to.contain(expectedEmailTexts[0]);
      });

    cy.wait(20000);

    cy.get("#refresh").click();
    cy.wait(1000);

    cy.iframe("#ifinbox")
      .find(".mctn > .m > button > .lms")
      .eq(0)
      .should("include.text", "Versandreport e-Gehaltszettel Portal");

    cy.iframe("#ifmail")
      .find("#mail>div")
      .invoke("text")
      .then((emailText) => {
        expect(emailText).to.contain(expectedEmailTexts[1]);
      });
  });
});
