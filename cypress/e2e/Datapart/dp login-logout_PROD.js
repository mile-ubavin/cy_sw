describe('Login/Logout to DATAPART E-Box', () => {
  // Login and Logout
  it('Login and Logout', function () {
    cy.loginToEgEboxAsStudent();

    //Logout
    cy.get(
      '.side-menu-section-desktop>.arrow-icon>button[aria-label="Benutzereinstellungen öffnen"]'
    ).click();
    cy.wait(3000);
    cy.get('.logout-title > a').click({ force: true });
    cy.url().should('include', Cypress.env('baseUrl')); // Validate URL
    cy.log('Test completed successfully.');
    cy.wait(2500);
  });
});

// describe("Login/Logout to kiam base scenario", () => {

//     //Datapart PROD

// describe('MongoDB Test', () => {
//   it('Login/Logout to dp_base scenario', function () {
//     cy.visit('https://datapart.post-business-solutions.at/pf.datapart/');
//     cy.url().should(
//       'include',
//       'https://datapart.post-business-solutions.at/pf.datapart/'
//     ); // => true

//     //Enter valid un/pw

//     const password = 'Test1234!';
//     // Query MongoDB to get user data
//     cy.queryMongoDB({ 'account.username': 'smile' }).then((userData) => {
//       // Extract username and password from userData
//       const username = userData.account.username;

//       cy.get('#mat-input-0').type(username);
//       cy.get('#mat-input-1').type(password);
//       cy.get('app-custom-icon-button').click();
//       cy.wait(2000);

//       //Remove cookie
//       //cy.get('app-custom-icon-button > #login_with_username-login').click()
//       cy.url().should(
//         'include',
//         'https://datapart.post-business-solutions.at/pf.datapart/deliveries'
//       ); // => true

//       //Logout
//       cy.get(
//         '.side-menu-section-desktop>.arrow-icon>button[aria-label="Benutzereinstellungen öffnen"]'
//       ).click();
//       cy.wait(3000);
//       cy.get('.logout-title > a').click({ force: true });
//       cy.url().should(
//         'include',
//         'https://datapart.post-business-solutions.at/pf.datapart/'
//       ); // => true
//     });
//   });
// });
