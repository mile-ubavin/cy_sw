describe("Lock username - Login with Invalid Credentials 5 times", () => {
  it("Lock username - Login with Invalid Credentials (5 times)", () => {
    // Visit the login page
    cy.visit("https://eboxpayslip.edeja.com/fe.e-box_t/");
    // Wait for the cookie bar to appear
    cy.wait(1000).then(() => {
      cy.get("#onetrust-policy-title").should("be.visible");
      cy.get("#onetrust-accept-btn-handler").click(); //Remove Cookie bar
    });
    // Define the number of login attempts
    const loginAttempts = 5;

    // Generate a random string
    const randomValue = Math.random().toString(36).substring(7);

    // Perform invalid login attempts in a loop
    for (let i = 0; i < loginAttempts; i++) {
      // Enter the username and invalid password
      cy.get('input[placeholder="Benutzername"]').clear();
      cy.get('input[placeholder="Passwort"]').clear();
      cy.get('input[placeholder="Benutzername"]').type(
        "invalid Username - " + randomValue
      );
      cy.get('input[placeholder="Passwort"]').type("incorrect_password");

      // Click the login button
      cy.get('button[type="submit"]').click();
      cy.wait(1000);
      // Clear input fields
    }
    // Wait for the error message to appear
    cy.contains(
      " Dieses Konto ist gesperrt. Versuchen Sie es in 5 Minuten noch einmal "
    ).should("be.visible");
  });
});
