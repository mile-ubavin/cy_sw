describe("Login/Logout to kiam base scenario", () => {
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
    var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; //set regex
    return regex.test(email);
  };
  //Test Cases (I have added 7 loops so it will create 7 test cases)
  //Change the test case count as much as you need
  for (let index = 0; index < 7; index++) {
    const TestEmail = emails(7);
    const EmailState = validateEmail(TestEmail);
    it("EmailTest -" + TestEmail + " - " + EmailState, () => {
      cy.visit("http://ebox-datapart.edeja.com/datapart/");
      cy.url().should("include", "http://ebox-datapart.edeja.com/datapart/"); // => true
      cy.get("#mat-input-0").type(TestEmail);
      cy.get("#mat-input-1")
        .type(invalid_password)
        .get(".mat-form-field-suffix")
        .click() //Show/Hide pass
        .wait(1000);
        cy.get('.button-content-wrap')
        .invoke("text")
        .as("buttonTitle");
      cy.get("@buttonTitle").should("include", " Anmelden "); //Validate Button title
      cy.get('.button-content-wrap').click(); //Click on login button
      if (!EmailState) {
        cy.get('#mat-error-4').should("be.visible");
        cy.get('#mat-error-5').should("be.visible");
      } else {
        cy.get('#mat-error-4').should("not.be.visible");
      }
    });
  }


   //Switch to KIAM
  //  it("Login/Logout to dp_base scenario", function () {
  //   cy.visit("http://ebox-datapart.edeja.com/datapart/");
  //   cy.url().should("include", "http://ebox-datapart.edeja.com/datapart/"); // => true

  //   //Enter valid un/pw
  //   const username = "smile";
  //   const password = "Test1234!";
  //   cy.get("#mat-input-0").type(username);
  //   cy.get("#mat-input-1").type(password);
  //   cy.get(".mat-form-field-suffix").click();
  //   cy.wait(2000);
  //   cy.get("app-custom-icon-button > #login_with_username-login").click();
  //   //Remove cookie
  //   cy.url().should(
  //     "include",
  //     "http://ebox-datapart.edeja.com/datapart/deliveries"
  //   ); // => true
  //   //Logout
  //   cy.get(".user-title").click();
  //   cy.wait(3000);
  //   cy.get(".logout-title > a").click({ force: true });
  //   cy.url().should("include", "http://ebox-datapart.edeja.com/datapart/"); // => true
  // });
});
