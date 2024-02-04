/// <reference types="cypress" />
/// <reference types="cypress-xpath" />
// NOTE: install: npm install dayjs --save

describe("Login, Update personal data, Logout", () => {
  beforeEach(() => {
    cy.session("login_data", () => {
      cy.loginToEBrief();
      Cypress.Commands.add("switchToPersonalDataPage", () => {
        // cy.visit("https://www.e-brief.at/fe_t/deliveries");
        // cy.get(".user-title").click(); //switch to Persons tab
        // cy.get('[color="primary"] > .button').click();
        // cy.get('[href="/fe_t/settings/personal"]').click();
      });

      Cypress.Commands.add("errorValidation", () => {
        cy.get(".input__field-error").should(
          "have.css",
          "color",
          "rgb(212, 2, 26)"
        );
        cy.get("button>.button__footer>.button__icon")
          .should("be.visible")
          .and("not.be.enabled");
      });
    });
  });

  //Empty FirstName - update personal data
  it("Empty FirstName", function () {
    cy.switchToPersonalDataPage();
    cy.get('[formcontrolname="firstName"]').clear();
    cy.errorValidation();
  });
  //Invalid FirstName
  it("Invalid FirstName", () => {
    cy.switchToPersonalDataPage();
    const randomNumber = Math.floor(Math.random() * 100000000 + 1);
    cy.get('[formcontrolname="firstName"]').clear().type(randomNumber);
    cy.errorValidation();
  });
  //Empty LastName - update personal data
  it("Empty LastName", function () {
    cy.switchToPersonalDataPage();
    cy.get('[formcontrolname="lastName"]').clear();
    cy.errorValidation();
  });
  //Invalid LastName
  it("Invalid lastName", () => {
    cy.switchToPersonalDataPage();
    const randomNumber = Math.floor(Math.random() * 100000000 + 1);
    cy.get('[formcontrolname="lastName"]').clear().type(randomNumber);
    cy.errorValidation();
  });
  //Birthday
  it("Birthday Popover", () => {
    // cy.switchToPersonalDataPage();
    cy.visit("https://www.e-brief.at/fe_t/deliveries");
    cy.get(".user-title").click(); //switch to Persons tab
    cy.get('[color="primary"] > .button').click();
    cy.get('[href="/fe_t/settings/personal"]').click();
    cy.get(".birthday-title").should("have.text", "Geburtstag ");
    cy.get(".birthday-title>.popover-icon").click();
    cy.get("#popover_birthday>div>header").should(
      "have.text",
      "Warum muss ich meinen Geburtstag angeben? "
    );
    cy.get("#popover_birthday>div>.popover__content").should(
      "have.text",
      "Ihr Geburtstag hilft uns dabei festzustellen, ob Sie unsere Services nutzen dürfen."
    );
  });

  it.only("Validate Birthday", () => {
    cy.visit("https://www.e-brief.at/fe_t/deliveries");
    cy.get(".user-title").click(); //switch to Persons tab
    cy.get('[color="primary"] > .button').click();
    cy.get('[href="/fe_t/settings/personal"]').click();

    cy.get(".autocomplete-input").then((dropDown) => {
      const countdropDownElements = Cypress.$(dropDown).length;
      expect(dropDown).to.have.length(countdropDownElements);
      cy.log("number of inputfields labels: ", countdropDownElements); //Optional
      //  for (let index = 4; index < countdropDownElements; index++) {
      cy.get(".autocomplete-input").eq(4).clear().type("2");

      //Select value from the dropdown
      cy.get(".mat-option-text>span").each(($el, index, $list) => {
        const item = $el.text();
        const itemToSelect = "2009";
        if (item === itemToSelect) {
          $el.trigger("click");
        }
        let day;
        let month;
        let year;
        //Get Day of Birthday
        cy.get("#mat-input-7")
          .invoke("val")
          .then((val) => {
            const day = val;
            cy.log("DAY------------>", day); //log day taken from input field
          });
        //Get Month of Birthday
        cy.get("#mat-input-8")
          .invoke("val")
          .then((val) => {
            const month = val;
            cy.log("MONTH------------>", month); //log month taken from input field
          });
        //Get Year of Birthday
        cy.get("#mat-input-9")
          .invoke("val")
          .then((val) => {
            const year = val;
            cy.log("YEAR------------>", year); //log year taken from input field
          });
        //cy.log(dayOfBirthday.toISOString());
        const dateOfBirthday = (day + month + year).toDate; //Set dateOfBirthday using dd,mm,yyyy taken from Birthday
        const dateOfB = "12.02." + itemToSelect;
        cy.log("dateOfBirthday--------------->", dateOfB);
        cy.log("dateOfBirthday--------------->", dateOfBirthday);
        cy.wrap(dateOfBirthday).as("dateTo"); //set itemToSelecy as a alias using get.wrap()
        cy.get("@dateTo").then((birthdayText) => {
          const dayjs = require("dayjs"); //day.js library
          //const todaysDate = dayjs().format("dd, mm, YYYY");
          let todaysDate = new Date(); //set current date
          cy.log("CURRENT DATE ----->", todaysDate.toISOString()); //get log of current date using toISOString()
          const birthday = dayjs(birthdayText).toDate(); //transform itemToSelect(alias @dateTo) parameter  birthdayText to date and set as a  const birthday
          cy.log("BIRTHDAY ----->", birthday);
          // expect(birthday).to.be.lte(todaysDate);
          var diff_times = Math.abs(todaysDate - dateOfB); //Count diff_times
          var diff_days = Math.ceil(diff_times / (1000 * 3600 * 24)); //Convert and round diff_times to diff_days
          cy.log("DIFF------------>", diff_days);
          var years = Math.ceil(diff_days * 0.002738 - 1); //Convert and round diff_days to years
          cy.log("DIFFYYYYYYYYY------------>", years);
          if (years < 15) {
            cy.get(".ebox-error-notification").should(
              "have.text",
              " Um das e-Brief Service nutzen zu können, müssen Sie mindestens 14 Jahre oder älter sein. "
            );
          }
          cy.log("ADULT PERSON");
        });
      }); //end each
      //     }//end for
    });
  });

  it("Logout & Clear saved session", function () {
    cy.visit("/deliveries");
    cy.url().should("include", "https://www.e-brief.at/fe_t/deliveries"); //Validate URL /on deliveries page
    cy.get(".user-title").click();
    cy.wait(2000);
    cy.contains("Logout").click();
    Cypress.session.clearAllSavedSessions(); //Clear all session
    cy.url().should("include", "/fe_t"); // Validate url
  }); //end it
});
