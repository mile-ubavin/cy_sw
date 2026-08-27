// /// <reference types="Cypress" />
// describe("Login/Logout to ebrief base scenario", () => {
  
//   //Login to E-Brief via Kiam
//   beforeEach(() => {
//     cy.loginToEBrief();
//   }); 
  
//   //Logout & Clear saved session
//   it("Logout & Clear saved session", function () {
//     cy.go('back')//Click on Back button on Browser
//     cy.url().should("include", "https://www.e-brief.at/fe_t/deliveries");//Vrigy URL /on deliveries page
//     cy.get(".user-title").click();
//     cy.wait(2000);
//     cy.get('[color="primary-reverse"] > .button').click();
//     //Cypress.session.clearAllSavedSessions();//Clear all session
//     cy.url().should("include", "https://www.e-brief.at/fe_t"); // => validate url
//   }); //end it
// });


/// <reference types="Cypress" />
describe("Login/Logout to ebrief base scenario", () => {
  
  //Login via Kiam, Logout
  it("Login network, Logout", function () {
    cy
      .loginToEBrief()//Login to E-brief - using custom commands
      //Optional
      .wait(2000)
      //Listening any GET request which contain login (and have status 200)
    cy.intercept({
      method: "GET",
      url: "https://www.e-brief.at/backend_t/rest/v2/users"
    }).as("getLogin");

    //cy.get('button[type="submit"]').contains('Jetzt Anmelden').click();//Click on Login button
    cy.wait("@getLogin").its("response.statusCode").should("eq", 200);//Validate response (from the network request), when user clicks on Login button
      // .get('.content-table-wrap').scrollTo("bottom", { duration: 500 })
      // .get('.content-table-wrap').scrollTo("top", { duration: 500 })
      // //Logout
      // .get(".user-title").click()
      // .get('[color="primary-reverse"] > .button').click()//Click on Logout button
      // .url().should("include", "/fe_t"); // Validate url 
  }); //end it
});

// describe("Login API test", () => {


// });