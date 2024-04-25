describe("Invalid Login to DP", () => {
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
      cy.visit("https://datapart.post-business-solutions.at/pf.datapart/");
      cy.url().should("include", "https://datapart.post-business-solutions.at/pf.datapart/"); // => true
      cy.get("#mat-input-0").type(TestEmail);
      cy.get("#mat-input-1")
        .type(invalid_password)
        .get(".mat-mdc-form-field-icon-suffix")
        .click() //Show/Hide pass
        
        cy.get('.button-content-wrap')
        .invoke("text")
        .as("buttonTitle");
        cy.get("@buttonTitle").should("include", " Anmelden "); //Validate Button title
        cy.get('app-custom-icon-button').click(); //Click on login button
        cy.wait(1000)
        
      if (!EmailState) {
        cy.get('#mat-mdc-error-4').should("be.visible");
        cy.get('#mat-mdc-error-5').should("be.visible");
      } else {
        cy.get('#mat-mdc-error-4').should("not.be.visible");
      }
    });
  }
});
