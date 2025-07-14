/// <reference types="cypress" />
/// <reference types="cypress-xpath" />

describe('Login, Sender-list - Filter by random character A-Z, Logout', () => {
  beforeEach(() => {
    cy.session('login_data', () => {
      cy.loginToEBrief();
    });
  });

  //Filter All - Get number of all senders
  it('Filter All - Get number of all senders', function () {
    cy.visit('/deliveries');

    cy.get('.navbar>ul>li>a')
      .contains(/Versenderliste|Versenderliste/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(1500);

    cy.url().should('include', '/sender-list'); // Validate url
    //Getting number of all senders in the ".item-middle-container - Filter by All"
    cy.get('.allowed-sender-list div')
      .find('.item-middle-container')
      .then((a) => {
        const listingCount = Cypress.$(a).length;
        expect(a).to.have.length(listingCount);
        cy.get('.allowed-sender-list > h5').invoke('text').as('Zustellung');
        cy.get('@Zustellung').should('include', `Zustellung (${listingCount})`);
        cy.log('all senders', listingCount);
      });
    cy.wait(2000);
  });

  //Filter by manualy selecting, desired 'A-Z'character (e.g. A)
  // it("Filter All - Get number of all senders", function () {
  //   cy.visit("/sender-list");
  //   cy.get("nav ul > li").eq(1).click({ force: true });
  //   cy.url().should("include", "/sender-list"); // Validate url
  //   cy.get(".mat-tab-links > div").eq(1).click(); //Manualy select, desired 'A-Z'character (e.g. A)
  //   cy.get(".allowed-sender-list div").find(".item-middle-container").then((a) => {
  //       const listingCount = Cypress.$(a).length;
  //       expect(a).to.have.length(listingCount);
  //       cy.get(".allowed-sender-list > h5").invoke("text").as("Zustellung");
  //       cy.get("@Zustellung").should("include", `Zustellung (${listingCount})`);
  //       cy.wait(2000);
  //     });
  // });

  //Filter by random character 'A-Z', multiple times (e.g. x3)
  it('Filter by random character A-Z, x3 times', function () {
    cy.visit('/sender-list');
    cy.get('nav ul>li').eq(1).click({ force: true });
    cy.url().should('include', '/sender-list'); // Validate url
    //Set a number of executing test (3)
    for (let index = 0; index < 3; index++) {
      cy.get('.mat-mdc-tab-links>div')
        .eq(Math.floor(Math.random() * (28 - 1) + 1))
        .click(); //Set a random letter A-Z as a filter criteria
      //Verify if results is null '.sender-list' does not exists
      cy.get('.allowed-sender-list').then(($body) => {
        const hasLength = $body.find('.sender-item').length > 0;
        if (!hasLength) {
          cy.log('Zustellung (0)'); //When search results is 0, display 'Zustellung (0)' in the console
          return;
        }
        //Compare number of items, visible after filtering
        cy.get('.allowed-sender-list .sender-item')
          .find('.item-middle-container')
          .then((a) => {
            const listingCount = Cypress.$(a).length;
            expect(a).to.have.length(listingCount);
            cy.get('.allowed-sender-list > h5').invoke('text').as('Zustellung');
            cy.get('@Zustellung').should(
              'include',
              `Zustellung (${listingCount})`
            ); //Validate Zustellung counter, by comparing number visible in 'Zustellung'-UI and 'listingCount'
            cy.wait(2000);
          });
      });
    }
    // Completion message at the end of the test
    cy.log('Test completed successfully.');
  });
  //Logout and clear session
  it('Logout & Clear saved session', function () {
    cy.visit('/deliveries');
    cy.url().should('include', '/deliveries'); //Validate URL /on deliveries page
    cy.get('.user-title').click();
    cy.wait(2000);
    cy.contains('Logout').click();
    Cypress.session.clearAllSavedSessions(); //Clear all session
    cy.url().should('include', '/'); // Validate url
    // Completion message at the end of the test
    cy.log('Test completed successfully.');
  }); //end it
});
