/// <reference types="Cypress" />

describe("Email assertion:", () => {
  it("Using gmail_tester.get_messages(), look for an email with specific subject and link in email body", function () {
    // debugger; //Uncomment for debugger to work...
    cy.task("gmail:get-messages", {
      options: {
        from: "sendhybridedeja@gmail.com",
        subject: "Ubisoft Password Change Request",//SET subject
        include_body: true,
        before: new Date(2022, 12, 24, 12, 31, 13), // Before September 24rd, 2019 12:31:13
        after: new Date(2022, 12, 24), // After August 23, 2019
      },
    }).then((emails) => {
      assert.isAtLeast(
        emails.length,
        1,
        "Expected to find at least one email, but none were found!"
      );
      const body = emails[0].body.html;
      assert.isTrue(
        body.indexOf(
          //"https://account-uplay.ubi.com/en-GB/action/change-password?genomeid="
          "email@emai.com"
        ) >= 0,
        "Found reset link!"
      );
    });
  });
});
