/// <reference types="cypress" />
/// <reference types="cypress-xpath" />

describe("Login, Crete_delivery-Upload_doc(pdf), Logout", () => {
  beforeEach(() => {
    cy.session("demo", () => {
      cy.loginToEBrief();
    });
  });

  it("Switch to Labels page-from sidebar, creation/deletion child label", () => {
    cy.visit("/deliveries");
    cy.get(
      '[routerlink="/settings/labels"] > #undefined > .mat-button-wrapper > .button-content-wrap'
    ).click();
    cy.url().should("include", "/settings/labels");
    cy.get(".mat-tab-links>a").eq(4).invoke("text").as("pageTitle");
    cy.get("@pageTitle").should("include", "Labels");
    cy.get(".button").click();
    cy.get(".dialog-title").should("have.text", "Label erstellen");

    cy.get(
      ":nth-child(1) > :nth-child(1) > .mat-form-field > .mat-form-field-wrapper > .mat-form-field-flex > .mat-form-field-infix"
    ).type("New Custom Label");
    cy.get(
      ":nth-child(2) > :nth-child(1) > .mat-form-field > .mat-form-field-wrapper > .mat-form-field-flex > .mat-form-field-infix"
    ).click();
    cy.get("#mat-option-2 > .mat-option-text").click();
    cy.get("sc-button.ng-star-inserted > .button").click();
    cy.wait(3000);
    cy.get(
      ':nth-child(4) > .mat-list-item-content > .mat-list-text > .mat-line > .label-list-item-wrap > .label-action-bar > [aria-describedby="cdk-describedby-message-25"] > #undefined'
    ).click();
    cy.get('.mat-dialog-actions > [color="primary"] > .button').click();
    cy.wait(2000);
  });

  it("Create Labele with random text/name, get total number of labels, deletion latest created labele)", () => {
    cy.visit("/deliveries");
    let randomString = Math.random().toString(15).substring(2); //Generating random string
    const labelName = "Label Name - " + randomString;
    cy.get("app-create-label").click();
    cy.get(".desktop-dialog-wrapper");
    cy.get(
      ".create-label-wraper > :nth-child(1) > :nth-child(1) > .mat-menu-trigger"
    ).click();
    cy.get(".mat-menu-content");
    cy.get(".row-items").first().get(".label-wrapper").first().click();
    cy.get(".desktop-dialog-wrapper input").click().type(labelName);
    cy.get(
      ":nth-child(2) > :nth-child(1) > .mat-form-field > .mat-form-field-wrapper > .mat-form-field-flex > .mat-form-field-infix"
    ).click();
    cy.get("#mat-option-0 > .mat-option-text").click();
    cy.get("sc-button.ng-star-inserted > .button").click();
    //Try cration label using non unique label
    cy.get("app-create-label").click();
    cy.get(".desktop-dialog-wrapper");
    cy.get(
      ".create-label-wraper > :nth-child(1) > :nth-child(1) > .mat-menu-trigger"
    ).click();
    cy.get(".mat-menu-content");
    cy.get(".row-items").first().get(".label-wrapper").first().click();
    cy.get(".desktop-dialog-wrapper input").click().type(labelName);
    cy.get(".error-message").should("include.text", "Label");

    // Get the total number of items before deletion
    cy.visit("/settings/labels");
    let itemCountBeforeDeletion;
    cy.get(
      ".mat-list-item > .mat-list-item-content > .mat-list-text > .mat-line > .label-list-item-wrap"
    ).then(($updatedItems) => {
      itemCountBeforeDeletion = $updatedItems.length;
      cy.log("This is  a  itemCountAfterDeletion", itemCountBeforeDeletion);
      cy.log("*****Get listing count******", itemCountBeforeDeletion);
      let linkText = [];
      cy.get(
        ".mat-list-item > .mat-list-item-content > .mat-list-text > .mat-line > .label-list-item-wrap > .label-name"
      )
        .each(($el, index, $list) => {
          linkText[index] = $el.text();
          cy.log('Log "aria-disabled" attributes', linkText[index]);
        })
        //Label Deletion
        .then(() => {
          for (let index = 0; index < itemCountBeforeDeletion; index++) {
            if (linkText[index] === labelName) {
              cy.contains(linkText[index])
                .click({ force: true })
                .then(() => {
                  const nthChildIndex = index + 1;
                  cy.get(
                    `:nth-child(${nthChildIndex}) > .mat-list-item-content > .mat-list-text > .mat-line > .label-list-item-wrap > .label-action-bar > [aria-describedby="cdk-describedby-message-3"] > #undefined`
                  ).click();

                  // Perform other actions...
                  cy.get(
                    '.mat-dialog-actions > [color="primary"] > .button'
                  ).click();
                });
              cy.wait(3000);
            }
          }
        });

      //  Assert the total number of items before and after a deletion
      // Get the total number of items after deletion
      let itemCountAfterDeletion;
      cy.get(
        ".mat-list-item > .mat-list-item-content > .mat-list-text > .mat-line > .label-list-item-wrap"
      ).then(($updatedItems) => {
        itemCountAfterDeletion = $updatedItems.length;
        cy.log("This is  a  itemCountAfterDeletion", itemCountAfterDeletion);

        // Assert the counts
        expect(itemCountAfterDeletion).to.equal(itemCountBeforeDeletion - 1);
      });
    });
  });

  //Logout  & Clear saved session
  it("Logout & Clear saved session", function () {
    cy.visit("/deliveries");
    // Click on the user title and triggers the logout action
    cy.get(".user-title").click();
    cy.wait(3000);
    // Click on the logout button
    cy.get('[color="primary-reverse"] > .button').click();
    // Clear saved session
    Cypress.session.clearAllSavedSessions();
    cy.url().should("include", "/"); // validate URL after logout
  });
});
