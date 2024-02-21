/// <reference types="cypress" />
/// <reference types="cypress-xpath" />

describe("Login, Update personal data, Logout", () => {
  beforeEach(() => {
    cy.session("login_data", () => {
      cy.loginToEBrief();
    });
  });
  //update personal data
  it.only("Update personal data - all fields", function () {
    cy.visit("/deliveries");
    cy.get(".user-title").click(); //switch to Persons tab
    cy.get('[color="primary"] > .button').click();
    //cy.get('[href="/settings/personal"]').click();
    cy.get(
      "app-personal-data-settings > app-settings-outlet-wrapper > .outlet-wrap > .settings-section-wrapper > .settings-section-buttons > sc-button > .button"
    ).click();

    //Get total number of inputfields labels, and his validate txt
    cy.get(".chameleon-form")
      .find(".two-col-grid-label")
      .then((inputFieldLabel) => {
        //Get total number of inputfields labels
        const listingCount = Cypress.$(inputFieldLabel).length;
        expect(inputFieldLabel).to.have.length(listingCount);
        cy.log("number of inputfields labels: ", listingCount); //Optional
        //Get txt of inputfields labels, and validate it
        let labeName = [];
        cy.get("form.chameleon-form>div>.two-col-grid-label")
          .each(($el, index, $list) => {
            labeName[index] = $el.text(); //Get labele text for each element
            cy.log("inputFields Label title", labeName[index]); //Optional
          })
          //Validating name of input field labels
          .then(() => {
            for (let index = 0; index < listingCount; index++) {
              cy.get("form.chameleon-form>div>.two-col-grid-label")
                .eq(index)
                .invoke("text")
                .as("labels");
              cy.get("@labels").should("include", labeName[index]); //Validate name of input field label
              cy.log("inputfields label", labeName[index]);
            }
          });
      });
    //Getting total number of dropdown elements visible in te Personal data page
    cy.get(".chameleon-form>div")
      .find(".select-input")
      .then((a) => {
        const countDropdowns = Cypress.$(a).length;
        expect(a).to.have.length(countDropdowns);
        cy.log("LISTING COUNT - DROPDOWN", countDropdowns);
      });
    //Iterating true all DropDownLists
    for (let i = 0; i < 6; i++) {
      cy.get(".chameleon-form>div>.select-input").eq(i).click();
      let tag = ".mat-mdc-autocomplete-visible"; // Dropdown list container (no 1st element)
      if (i == 0) {
        tag = ".mdc-menu-surface"; // Dropdown list container for 1st element
      }
      cy.get(tag)
        .find(".mdc-list-item")
        .then((matOptionItems) => {
          const count = Cypress.$(matOptionItems).length; //Total number of items visible in dropdown
          expect(matOptionItems).to.have.length(count);
          const itemToSelect = matOptionItems //Random selected item from dropdown
            .eq(Math.floor(Math.random() * count))
            .text();
          cy.get(tag + " > *").each(($el, index, $list) => {
            if ($el.text() === itemToSelect) {
              $el.trigger("click"); //Choose random selected item
            }
          });
        });
    } //end for

    //Random select dropdown value Country - using autocomplete
    let itemToSelect1; //Random selected Country from dropdown
    for (let i = 0; i < 2; i++) {
      cy.get(".iti__selected-flag").eq(i).click({ force: true }); //Click on inpit field to show drop-down list
      cy.get(".iti__country-list")
        .find(".iti__country")
        .then((matOptionItems1) => {
          const count1 = Cypress.$(matOptionItems1).length; //Total number of items visible in dropdown
          expect(matOptionItems1).to.have.length(count1);
          itemToSelect1 = matOptionItems1
            .eq(Math.floor(Math.random() * count1))
            .text(); //Random selected item from dropdown
          cy.get(".iti__country-list > *").each(($el, index, $list) => {
            if ($el.text() === itemToSelect1) {
              $el.trigger("click");
              cy.log("COUNTRY------------------->", itemToSelect1);
            }
          });
        });
    }

    //Get total numbers of input fields
    cy.get(".chameleon-form>.two-col-grid-row>.two-col-grid-controls")
      .find(".form-field")
      .then((a) => {
        const inputCount = Cypress.$(a).length;
        expect(a).to.have.length(inputCount);
        //Firstname & lastname -  inputfields
        for (let index = 0; index < inputCount - 1; index++) {
          if (index == 0 || index == 1) {
            cy.get(
              ".chameleon-form>.two-col-grid-row>.two-col-grid-controls>.form-field"
            )
              .eq(index)
              .clear()
              .type("Testuser");
          }
          // Telephone nuumbers (mobile/landline) aria codes - 4 digits
          if (index == 2 || index == 4) {
            cy.log("Display random selected country - ", itemToSelect1);
            //Set randomTelephoneAriaCode depending Austrian/Non-Austian (random selected country)
            cy.log("itemToSelect1", itemToSelect1);
            if (index === 4) {
              cy.get(
                ".chameleon-form>.two-col-grid-row>.two-col-grid-controls>.form-field"
              )
                .eq(index)
                .clear()
                .type("667"); //Austrian
            } else {
              const randomTelephoneAriaCode = Math.floor(
                Math.random() * 10000 + 1
              ); //Generate randomTelephoneAriaCode 4 digits
              cy.get(
                ".chameleon-form>.two-col-grid-row>.two-col-grid-controls>.form-field"
              )
                .eq(index)
                .clear()
                .type(randomTelephoneAriaCode); //non-Austrian
            }
          }
          //Mobile/landline telephone numbers - input fields
          if (index == 3 || index == 5) {
            const randomTelephoneNumber = Math.floor(
              Math.random() * 100000000 + 1
            ); //Generate randomTelephoneAriaCode 8 digits
            cy.get(
              ".chameleon-form>.two-col-grid-row>.two-col-grid-controls>.form-field"
            )
              .eq(index)
              .clear()
              .type(randomTelephoneNumber);
          }
        }
      }); //end then

    //Click on Save button to SAVE changes
    // cy.get(
    //   "app-personal-data-settings > app-settings-outlet-wrapper > .outlet-wrap > .settings-section-wrapper > .settings-section-buttons > sc-button > .button"
    // ).click();
    cy.wait(2000);
    cy.log("Test completed successfully.");
  }); //end it

  //Logout  & Clear saved session
  it("Logout & Clear saved session", function () {
    cy.visit("/deliveries");
    cy.get(".user-title").click();
    cy.wait(3000);
    cy.get('[color="primary-reverse"] > .button').click();
    Cypress.session.clearAllSavedSessions(); //Clear saved session
    cy.url().should("include", "/"); // => validate url after logout
  }); //end it
});
