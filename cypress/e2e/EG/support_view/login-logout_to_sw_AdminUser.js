/// <reference types="cypress" />
describe('Login/Logout to SupportView as a Admin user - base scenario', () => {
  //Login via Kiam, Logout
  it('Login, Logout', function () {
    cy.loginToSupportViewAdmin(); //Login custom commands
    //Optional
    cy.wait(3000);
    //Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url();
    cy.should('include', 'https://supportviewpayslip.edeja.com/fe/login'); // Validate url
  }); //end it
});
