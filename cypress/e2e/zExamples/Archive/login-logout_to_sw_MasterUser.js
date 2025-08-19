describe('Login/Logout to SupportView as a Admin user - base scenario', () => {
  //Login via Kiam, Logout
  it('Login, Logout', function () {
    cy.loginToSupportViewMaster(); //SupportView - using custom commands
    //Optional
    cy.wait(3000);
    //Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.mat-button-wrapper>span')
      .invoke('text')
      .then((textContent) => {
        if (textContent.includes('YES') || textContent.includes('JA')) {
          // Your code to execute when the text contains either "YES" or "JA"
          cy.get('.confirm-buttons > :nth-child(2)').click();
        } else {
          // Your code to execute when the text contains neither "YES" nor "JA"
          cy.log('Text does not contain either "JA"');
        }
      });
    cy.url();
    cy.should('include', 'https://supportviewpayslip.edeja.com/fe/login'); // Validate url
  }); //end it
});
