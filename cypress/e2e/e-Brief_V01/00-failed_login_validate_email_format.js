/// <reference types="cypress" />

describe("Failed Login to E-Brief using invalid email format", () => {
  //Failed Login to E-Brief using invalid email format/invalid pw

  const invalid_username = "INVALID_USERNAME@yopmail.com";
  const invalid_password = "INVALID_PASSWORD";
  //Enter invalid credentials (un/pw)
  //Create Emails
  //Decied the email length you need
  const emails = (val) => {
    var email = "";
    var possible = "abcd@.gh";
    for (var i = 0; i < val; i++) {
      email += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return email;
  };

  //validate emails
  //I have used a general Regex here, SET the regex you have used in your website insted

  const validateEmail = (email) => {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; //set regex
    return re.test(email);
  };

  //Test Cases (I have added 5 loops so it will create 7 test cases)
  //Set the test case count
  for (let index = 0; index < 5; index++) {
    const TestEmail = emails(5);
    const EmailState = validateEmail(TestEmail);
    it("EmailTest -" + TestEmail + " - " + EmailState, () => {
      cy.visit("/");
      cy.url().should("include", "https://www.e-brief.at/fe_t"); // => validate url
      cy.get("#onetrust-accept-btn-handler").click(); //remove cookie bar
      cy.wait(1000);
      cy.get('button[type="submit"]').contains("Jetzt Anmelden").click();
      //Switching to Kiam page
      cy.url().should(
        "include",
        "https://kiamabn.b2clogin.com/kiamabn.onmicrosoft.com/oauth2/v2.0/authorize?p=b2c_1a_signup_signin&response_type=code&client_id=47164ed5-692e-4f96-854d-f87b765c8af0&redirect_uri=https%3A%2F%2Fwww.e-brief.at%2Ffe_t%2Flogin-handling&scope=openid+profile+offline_access+https%3A%2F%2Fkiamabn.onmicrosoft.com%2Fkiam-api%2FKIAM.Service.UserContext.All&response_mode=query&state=ebrieflogin&lang=de&nonce=5fdc745f-c64e-4902-ac99-488525c75a9"
      ); // Validation kiam url
      cy.get("#signInName")
        .type(TestEmail)
        .get("#password")
        .type(invalid_password)
        .get("#showPassword")
        .click() //Show/Hide pass
        .wait(1000);
      cy.get(".buttons").invoke("text").as("buttonTitle");
      cy.get("@buttonTitle").should("include", "Jetzt einloggen"); //Validate Button title
      cy.get("#next").click(); //Click on login button
      if (!EmailState) {
        cy.get(".entry-item--error > .error > p").should("be.visible");
      } else {
        cy.get(".entry-item--error > .error > p").should("not.be.visible");
      }
      cy.wait(1000);
    });
  }
});
