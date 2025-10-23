/// <reference types="cypress" />
describe('Verifying Socila medial links on Login page', () => {
  //Verify Facebook link, from the footer
  it('Facebook', () => {
    cy.visit('/');
    // cy.url().should('include', '/'); //Validating url on the dashboard page
    cy.wait(1000);
    //cy.get("#onetrust-accept-btn-handler").click(); //Remove Cookie bar
    cy.get('.footer__social-media>a')
      .eq(0)
      .invoke('removeAttr', 'target')
      .click({ force: true }); //Remove taarget att
    cy.origin('https://www.facebook.com/unserepost', () => {
      cy.wait(3000);
      cy.url().should('include', 'https://www.facebook.com/unserepost'); // => true
      // cy.contains('Reload Page').click({ force: true });
      // cy.wait(3000);
    });
    cy.go('back');
    //Trigger Back button on browser
    cy.url().should('include', '/'); //Validate url
    cy.wait(1000);
  });

  //Verify YouTube link, from the footer
  it('YouTube', () => {
    cy.visit('/');
    cy.url().should('include', '/'); //Validating url on the dashboard page
    cy.wait(1000);
    // cy.get('#onetrust-accept-btn-handler').click(); //Remove Cookie bar
    cy.get('.footer__social-media>a')
      .eq(1)
      .invoke('removeAttr', 'target')
      .click({ force: true }); //Remove target att
    cy.wait(3500);
    cy.origin('https://www.youtube.com/user/unserepost', () => {
      cy.wait(2000);
      cy.url().should('include', 'https://www.youtube.com/user/unserepost'); // => true
      cy.go('back');
    });

    //Trigger Back button on browser
    cy.url().should('include', '/'); //Validate url
    cy.wait(2000);
  });
  //Verify YouTube link, from the footer

  // Ignore InvalidStateError specifically for `getInstalledRelatedApps`
  Cypress.on('uncaught:exception', (err) => {
    if (
      err.message.includes(
        "Failed to execute 'getInstalledRelatedApps' on 'Navigator'"
      )
    ) {
      return false; // Prevent Cypress from failing the test
    }
  });

  // it.only('Linkedin', () => {
  //   cy.visit('/');
  //   cy.url().should('include', '/'); // Validate URL on the dashboard page
  //   cy.wait(1000);

  //   // Remove 'target' attribute and click the LinkedIn link
  //   cy.get('.footer__social-media > a')
  //     .eq(2)
  //     .invoke('removeAttr', 'target')
  //     .click({ force: true }); // Remove target attribute and force click

  //   // Validate the URL of the LinkedIn page
  //   cy.wait(2000);
  //   cy.url().should('include', 'https://at.linkedin.com/company/unserepost'); // Validate URL

  //   // Check if the modal dismiss button is present and close it if found
  //   cy.get('body').then((body) => {
  //     if (body.find('.contextual-sign-in-modal__modal-dismiss').length > 0) {
  //       cy.get('.contextual-sign-in-modal__modal-dismiss')
  //         .click({ force: true })
  //         .should('not.exist'); // Dismiss modal if it exists
  //     } else {
  //       cy.log('No modal found');
  //     }
  //   });

  //   // Go back to the previous page and validate the URL
  //   cy.go('back');
  //   cy.url().should('include', '/'); // Validate URL
  //   cy.wait(2000);
  // });

  it.skip('Linkedin', () => {
    cy.visit('/');
    cy.url().should('include', '/'); //Validating url on the dashboard page
    cy.wait(1000);
    //cy.get("#onetrust-accept-btn-handler").click(); //Remove Cookie bar

    cy.get('.footer__social-media>a')
      .eq(2)
      .invoke('removeAttr', 'target')
      .click({ force: true }); //Remove target att
    cy.origin('https://at.linkedin.com/', () => {
      cy.wait(2000);
      cy.url().should('include', 'https://at.linkedin.com/company/unserepost'); //Validate url

      // cy.get('.contextual-sign-in-modal__modal-dismiss').click({
      //   force: true,
      // });
      cy.wait(1000);
      //cy.url().should("include", "https://www.linkedin.com"); // depricte
    });
    cy.go('back');
    //Trigger Back button on browser
    cy.url().should('include', '/'); //Validate url
    cy.wait(2000);
  });
  //Verify Instagram link, from the footer
  it('Instagram', () => {
    cy.visit('/');
    // cy.url().should('include', 'https://www.e-brief.at/fe_t'); //Validating url on the dashboard page
    cy.wait(1000);
    // cy.get('#onetrust-accept-btn-handler').click(); //Remove Cookie bar
    cy.get('.footer__social-media>a')
      .eq(3)
      .invoke('removeAttr', 'target')
      .click({ force: true }); //Remove target att
    cy.origin('https://www.instagram.com/', () => {
      cy.wait(5000);
      cy.url().should('include', 'https://www.instagram.com/unserepost/'); // => true
    });
    cy.go('back');
    //Trigger Back button on browser
    cy.url().should('include', '/'); //Validate url
    cy.wait(1000);
  });
});
