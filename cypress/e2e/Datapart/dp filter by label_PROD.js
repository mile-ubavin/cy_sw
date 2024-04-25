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
    cy.url().should(
      'include',
      'https://datapart.post-business-solutions.at/pf.datapart/'
    ); // url validation
  });
});
