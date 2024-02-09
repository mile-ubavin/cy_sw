/// <reference types="Cypress" />

describe("Upload serviceLine file", () => {
  const yopmailURL = "https://yopmail.com/en/";
  const userEmail = "aqua.admin@yopmail.com";
  const refreshButtonSelector = "#refresh";
  const inboxRefreshButtonSelector = ".mctn > .m > button > .lms";
  const iframeInboxSelector = "#ifinbox";
  const iframeMailSelector = "#ifmail";
  const expectedEmailTexts = [
    "Guten Tag,Sie haben 0 Sendungen erfolgreich in des e-Gehaltszettel Portal eingeliefert.0 Sendungen konnten nicht zugestellt werden.1 Sendungen sind in der Warteschlange und werden demnächst verarbeitet.mit freundlichen Grüßen,Ihr e-Gehaltszettel Team",
    "Guten Tag,Sie haben 0 ServiceLine Sendungen erfolgreich in des e-Gehaltszettel Portal eingeliefert.3 Sendungen konnten nicht zugestellt werden.Folgende Personalnummern sind betroffen:ABBA000100279311ABBA234500123mit freundlichen Grüßen,Ihr e-Gehaltszettel Team",
  ];

  before(() => {});

  Cypress.Commands.add("loadTranslate", (language) => {
    cy.fixture(`${language}.json`).as("t");
  });
  function refreshInbox() {
    // cy.get(inboxRefreshButtonSelector).click();
    // cy.wait(3000);
    cy.get(refreshButtonSelector).click(); //Click on Refresh inbox icon
    cy.wait(1000);
  }
  function getOppositeLanguage(currentLanguage) {
    return currentLanguage === "English" ? "German" : "English";
  }

  it(`Upload serviceLine pdf by Admn User`, function () {
    cy.loginToSupportViewAdmin().wait(2000);

    cy.get(".lagnuage-menu")
      .invoke("text")
      .then((selectedLanguage) => {
        const oppositeLanguage = getOppositeLanguage(selectedLanguage.trim());
        cy.log(`Selected Languages: ${selectedLanguage}`);
        cy.log(`Switching to Opposite Language: ${oppositeLanguage}`);

        cy.selectLanguage(oppositeLanguage);
        cy.wait(1500);
        cy.loadTranslate(oppositeLanguage);
        cy.wait(1500);
      });

    cy.get("@t").then((t) => {
      cy.get(".upload__document>.mdc-button__label>.upload__document__text")
        .invoke("text")
        .then((uploadButtonTxt) => {
          expect(uploadButtonTxt).to.include(t["Upload Document"]);
        });

      const uploadButton = t["Upload Document"];
      cy.get(".upload__document").contains(uploadButton).click();

      cy.uploadValidMultipleDocuments([
        "Serviceline-Demo - 4pages, 3Receivers,1Fail.pdf",
      ]);
      cy.wait(2000);

      cy.get(
        ".mat-mdc-text-field-wrapper>div>.mat-mdc-form-field-infix>.mat-mdc-select"
      ).click();

      cy.get(
        ".cdk-overlay-connected-position-bounding-box>#cdk-overlay-2>div>.mat-mdc-option>.mdc-list-item__primary-text"
      ).each(($option, index, $list) => {
        const itemName = $option.text().trim();
        cy.log(`Dropdown item ${index + 1}: ${itemName}`);
        const listLength = $list.length;
        if (index === listLength - 1) {
          cy.wrap($option).click();
        }
      });

      cy.get(".dialog-header>.dialog-title")
        .invoke("text")
        .then((dialogTitle) => {
          expect(dialogTitle, "Upload document dialog title :").to.include(
            t["Upload Documents"]
          );
        });
      cy.get(".ng-star-inserted > .button__footer > .button__icon").click();

      cy.get(".success")
        .invoke("text")
        .then((successfullyUploaded) => {
          expect(
            successfullyUploaded,
            "Document successfully uploaded"
          ).to.include(t["Document successfully uploaded"]);
        });

      cy.get(".dialog-actions>button>.title")
        .eq(1)
        .invoke("text")
        .then((sendButton) => {
          expect(sendButton, "Send buton title :").to.include(t.Send);
        });

      const sendButton = t.Send;
      cy.get(".dialog-actions>button").contains(sendButton).click();

      cy.get(".mdc-snackbar__label")
        .invoke("text")
        .then((message) => {
          expect(message, "Message:").to.include(
            t["We are processing in the background"]
          );
        });
    });
    cy.visit(yopmailURL);
    cy.get("#login").type(userEmail);

    const validateEmail = (expectedText) => {
      refreshInbox();
      cy.iframe(iframeInboxSelector)
        .find(".mctn > .m > button > .lms")
        .eq(0)
        .should("include.text", "Versandreport e-Gehaltszettel Portal");

      cy.iframe(iframeMailSelector)
        .find("#mail>div")
        .invoke("text")
        .then((emailText) => {
          console.log("Email Content:", emailText);
          expect(emailText).to.contain(expectedText);
        });
    };

    validateEmail(expectedEmailTexts[0]);

    cy.wait(9700);
    cy.get(refreshButtonSelector).click(); //Click on Refresh inbox icon
    cy.wait(1000);
    validateEmail(expectedEmailTexts[1]);
  });

  function refreshInbox() {
    cy.get(inboxRefreshButtonSelector).click();
    cy.wait(3000);
    cy.get(refreshButtonSelector).click();
    cy.wait(1000);
  }
});
