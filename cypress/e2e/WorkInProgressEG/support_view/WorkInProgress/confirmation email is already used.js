/// <reference types="cypress" />

describe('Confirmation Email is already used', () => {
  it('Confirmation Email is already used', () => {
    // Visit yopmail application or login page
    cy.visit('https://yopmail.com/en/');
    cy.get('#login').type('csv-testuser@yopmail.com');
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    //Click on latest received email
    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .first()
      .should(
        'include.text',
        'Verifizierung E-Mail-Adresse e-Gehaltszettel Portal'
      ); //Validate subject of Verification email
    let initialUrl;
    cy.iframe('#ifmail')
      .find(
        '.yscrollbar>#mailctn>#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(3)>span>a'
      )
      .should('include.text', 'Jetzt bestätigen')
      .invoke('attr', 'href')
      .then((href) => {
        // Log link text
        cy.log(`The href attribute is: ${href}`);
      });
    cy.iframe('#ifmail')
      .find(
        '.yscrollbar>#mailctn>#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(3)>span>a'
      )
      .invoke('attr', 'target', '_self') //prevent opening in new tab
      .click();
    cy.wait(4000);
    cy.iframe('#ifmail')
      .find('#onetrust-accept-btn-handler')
      .should('exist')
      .click(); // if exist, Remove Cookie bar
    cy.iframe('#ifmail').find('.button').click();
    cy.wait(3000);
    //cy.visit("https://yopmail.com/en/");
  });
});
