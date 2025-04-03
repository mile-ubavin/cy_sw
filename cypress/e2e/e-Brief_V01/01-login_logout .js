/// <reference types="cypress" />
describe('Login/Logout to ebrief base scenario', () => {
  //Login via Kiam, Logout
  it('Login, Logout', function () {
    cy.loginToEBrief() //Login to E-brief - using custom commands
      //Optional
      .wait(2000);
    // .get('.content-table-wrap').scrollTo("bottom", { duration: 500 })
    // .get('.content-table-wrap').scrollTo("top", { duration: 500 })
    //Logout

    //Hamburger button
    // cy.get(
    //   ".side-menu-section-mobile > .mat-tooltip-trigger > #undefined > .mat-button-wrapper > .button-content-wrap > .mat-icon"
    // )
    //Desktop view
    cy.get('.user-title')
      .click()
      .get('[color="primary-reverse"] > .button')
      .click(); //Click on Logout button
    //.url()
    //.should('include', '/fe_t'); // Validate url

    cy.wait(1000);

    cy.get('button[type="submit"]').contains('Jetzt Anmelden');
    cy.log('Test completed successfully.');
    //Redirection to login page
  }); //end it
});
