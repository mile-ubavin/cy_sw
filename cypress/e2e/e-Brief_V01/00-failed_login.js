/// <reference types="cypress" />

describe("Failed Login to E-Brief", () => {
  // let randomString = Math.random().toString(36).substring(2);
  //   const email = "INVALID_USERNAME" + randomString + "@gmail.com";
  //   const password = "INVALID_PASSWORD" + randomString;
  //Failed Login - Login form is an empty
  it("Failed Login - Login form is an empty", function () {
    cy.visit("/");
    cy.url().should("include", "/"); // => validate url
    cy.get("#onetrust-accept-btn-handler").click(); //remove cookie bar
    cy.wait(1000);
    cy.get('button[type="submit"]').contains("Jetzt Anmelden").click();

    //Switching to Kiam page
    cy.url().should(
      "include",
      "https://kiamabn.b2clogin.com/kiamabn.onmicrosoft.com"
    ); // Validation kiam url
    cy.wait(1000);
    cy.get("#next").should("be.visible").and("be.enabled"); //Validate Login button
    cy.get("#next").click();
    cy.contains("Bitte E-Mail Adresse eingeben.").should("be.visible"); //Check validation message
    cy.contains("Bitte Passwort eingeben.").should("be.visible"); //Check validation message
    cy.wait(2000);
  });

  //Failed to login - invalid un/pw
  it("Failed to login - invalid un/pw", function () {
    cy.visit("/");
    cy.url().should("include", "/"); // => validate url
    cy.get("#onetrust-accept-btn-handler").click(); //remove cookie bar
    cy.wait(1000);
    cy.get('button[type="submit"]').contains("Jetzt Anmelden").click();

    //Switching to Kiam page
    cy.url().should(
      "include",
      "https://kiamabn.b2clogin.com/kiamabn.onmicrosoft.com"
    ); // Validation kiam url
    cy.wait(1000);
    let randomString = Math.random().toString(15).substring(2); //Generating random string
    const invalid_username =
      "INVALID_USERNAME___" + randomString + "@gmail.com";
    const invalid_password = "INVALID_PASSWORD___" + randomString;
    //Enter invalid credentials (un/pw)
    cy.get("#signInName")
      .type(invalid_username)
      .get("#password")
      .type(invalid_password)
      .get("#showPassword")
      .click() //Show/Hide pass
      .wait(1000);
    cy.get(".buttons").invoke("text").as("buttonTitle");
    cy.get("@buttonTitle").should("include", "Jetzt einloggen"); //Validate Button title
    cy.get("#next").click(); //Click on login button
    cy.get("#next").should("be.visible").and("be.disabled"); //Button should be disabled and visible (Validation)
    cy.get("#kiam-login-failed > .userlogin__headline").should(
      "have.text",
      "Login fehlgeschlagen"
    ); //Verify Error message
    cy.get("#kiam-login-failed-subline-1").should(
      "have.text",
      "Bitte versuchen Sie es nochmals!"
    );
  });
});
