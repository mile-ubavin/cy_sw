/// <reference types="Cypress" />

describe("Invalid Login Attempts and Account Lock Test", () => {
  // Generate a 5-character random string
  function generateRandomString(length) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
    return randomString;
  }

  // Generate a 5-character random string
  let randomString = generateRandomString(5);
  console.log(randomString);
  const username = "TestUser - " + randomString;
  const invalidPassword = "Invalid-password - " + randomString;

  it("should lock the user after 5 invalid login attempts", () => {
    cy.visit("https://supportviewpayslip.edeja.com/fe/login");
    cy.url().should("include", "/login");

    cy.intercept(
      "POST",
      "https://supportviewpayslip.edeja.com/be/supportView/v1/login/user"
    ).as("apiRequest");

    // Simulate 4 invalid login attempts
    cy.get(".username").type(username);
    for (let attempt = 1; attempt <= 4; attempt++) {
      // Fill in the login form using invalid password
      cy.get(".password").type(invalidPassword);
      cy.wait(2000);

      // Click the login button
      cy.get(".btn").click();

      //Validating error message is temporaly disabled...
      // cy.wait(3000);
      // cy.get(".error-text").should(
      //   "include.text",
      //   "Username and password are incorrect."
      // );

      cy.wait("@apiRequest").then((interception) => {
        // Log the status code to the Cypress console
        //cy.log(`Status Code: ${interception.response.statusCode}`);

        // Checking Status Code from response
        expect(interception.response.statusCode).to.eq(404);

        // Read and assert against the response JSON
        const responseBody = interception.response.body;
        expect(responseBody)
          .to.have.property("message")
          .and.equal("Account is locked!"); //Verify message from response

        cy.get(".password").clear();
      });
    }

    // Now, attempt a login after 4 invalid attempts
    // Fill in the login form - using invalid pass
    cy.get(".password").type(invalidPassword);
    cy.wait(2000);

    // Click the login button
    cy.get(".btn").click();
    //Verify Error message from response, after locking account
    cy.get("form>.error-text").should(
      "include.text",
      " This account is locked, please try again in 5 minutes. "
    );
    cy.get("form > .error-text")
      .invoke("text")
      .then((text) => {
        cy.log("Text content: " + text);
      });
    //Verify message from response
    cy.wait("@apiRequest").then((interception) => {
      // Log the status code to the Cypress console
      //cy.log(`Status Code: ${interception.response.statusCode}`);

      // Checking Status Code from response
      expect(interception.response.statusCode).to.eq(403);
      cy.wait(2000);

      // Read and assert against the response JSON
      const responseBody = interception.response.body;
      expect(responseBody).to.have.property("message").and.equal("5"); //Verify message from response
      cy.wait(5000);
    });
  });
});
