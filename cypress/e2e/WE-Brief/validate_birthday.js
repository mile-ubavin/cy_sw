/// <reference types="cypress" />
/// <reference types="cypress-xpath" />
// NOTE: install: npm install dayjs --save

describe("Login, Update personal data, Logout", () => {
  beforeEach(() => {
    cy.session("login_data", () => {
      cy.loginToEBrief();
      //switchToPersonalDataPage Custom Command
      Cypress.Commands.add("switchToPersonalDataPage", () => {
        // cy.visit("https://www.e-brief.at/fe_t/deliveries");
        // cy.get(".user-title").click(); //switch to Persons tab
        // cy.get('[color="primary"] > .button').click();
        // cy.get('[href="/fe_t/settings/personal"]').click();
      });
      //errorValidation Custom Commands
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

    let year = "";
    let currYear = "";
    const dayjs = require("dayjs"); //day.js library
    currYear = dayjs().format("YYYY");
    //let todaysDate = new Date(); //set current date
    cy.log("#################CURRENT DATE/YEAR ----->", currYear); //get log of current date using toISOString()
    cy.get("#mat-input-9")
      .invoke("val")
      .then((val) => {
        year = currYear - 14;
        cy.get("#mat-input-9").clear().type(year);
      });
    cy.log("YEAR------------>", year); //prints hi@there.com

    let day = "";
    let month = "";
    const dateDay = {};
    const dateMonth = {};
    const dateYear = {};
    cy.get("#mat-input-7")
      .invoke("val")
      .then((val) => {
        day = val;
        dateDay.day = day;
        cy.log("DAY------------>", day); //prints hi@there.com
      });

    cy.get("#mat-input-8")
      .invoke("val")
      .then((val) => {
        month = val;
        dateMonth.month = month;
        cy.log("MONTH------------>", month); //prints hi@there.com
      });
    cy.get("#mat-input-9")
      .invoke("val")
      .then((val) => {
        year = val;
        dateYear.year = year;
        cy.log("YEAR------------>", year); //prints hi@there.com
      });
    cy.log("DATEEEE------------>", dateDay);
    cy.log("DATEEEE------------>", dateMonth);
    cy.log("DATEEEE------------>", dateYear);
    cy.log("****************DAY------------>", year); //prints hi@there.com

    let dateOfBirthday = "5.7." + year;
    cy.log("dateOfBirthday--------------->", dateOfBirthday);
    cy.wrap(dateOfBirthday).as("dateTo"); //set itemToSelecy as a alias using get.wrap()
    cy.get("@dateTo").then((birthdayText) => {
      const dayjs = require("dayjs"); //day.js library
      //const todaysDate = dayjs().format("dd, mm, YYYY");
      let todaysDate = new Date(); //set current date
      cy.log("CURRENT DATE ----->", todaysDate.toISOString()); //get log of current date using toISOString()
      const birthday = dayjs(birthdayText).toDate();
      //cy.log("BIRTHDAY ----->", birthday.toISOString());
      //dayjs().diff()
      var diff_times = Math.abs(todaysDate.getTime() - birthday.getTime()); //Count diff_times
      var diff_days = Math.ceil(diff_times / (1000 * 3600 * 24)); //Convert and round diff_times to diff_days
      cy.log("DIFF------------>", diff_days);
      var years = Math.ceil(diff_days * 0.002738); //Convert and round diff_days to years
      cy.log("DIFFYYYYYYYYY------------>", years);
      if (years < 16) {
        cy.get(".ebox-error-notification").should(
          "have.text",
          " Um das e-Brief Service nutzen zu können, müssen Sie mindestens 14 Jahre oder älter sein. "
        );
      }
      cy.log("ADULT PERSON");
    });
  });

  // it("Logout & Clear saved session", function () {
  //   cy.visit("/deliveries");
  //   cy.url().should("include", "https://www.e-brief.at/fe_t/deliveries"); //Validate URL /on deliveries page
  //   cy.get(".user-title").click();
  //   cy.wait(2000);
  //   cy.contains("Logout").click();
  //   Cypress.session.clearAllSavedSessions(); //Clear all session
  //   cy.url().should("include", "/fe_t"); // Validate url
  //}); //end it
});
