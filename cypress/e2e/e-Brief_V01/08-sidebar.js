/// <reference types="cypress" />

describe('Sidebar assertion', () => {
  beforeEach(() => {
    cy.loginToEBrief();
  });
  it('Should verify sidebar items', () => {
    // cy.visit("https://www.e-brief.at/fe_t/deliveries");
    cy.get('app-inbox-filter-general')
      .find('.label-list-wrapper')
      .then((a) => {
        const listingCount = Cypress.$(a).length;
        expect(a).to.have.length(listingCount);
        for (let index = 0; index < listingCount; index++) {
          let currentLabelName = ['Alle', 'Gelesen', 'Ungelesen']; //HardCoded values
          cy.get('app-inbox-filter-general>.label-list-wrapper')
            .eq(index)
            .invoke('text')
            .as('title');
          cy.get('@title').should('include', currentLabelName[index]); //Validate footerTitles
          cy.get('app-inbox-filter-general')
            .contains('Alle')
            .should('have.class', 'active'); // Validate if class is active
        } //end for
      });

    ///////////
    cy.get('app-inbox-filter-system-labels')
      .find('.ng-star-inserted')
      .then((a) => {
        const listingCount = Cypress.$(a).length;
        expect(a).to.have.length(listingCount);
        for (let index = 0; index < listingCount; index++) {
          let currentLabelName = ['Hochgeladen', 'Unterschrift', 'Zahlung']; //HardCoded values
          cy.get('app-inbox-filter-system-labels>.ng-star-inserted')
            .eq(index)
            .invoke('text')
            .as('title');
          cy.get('@title').should('include', currentLabelName[index]);
        }
      });

    cy.get('app-inbox-filter-custom-labels.ng-star-inserted').should(
      'contain',
      'LABELS'
    ); // Validate if label title is matching

    // check how many labels there is
    // if more then 11 button should appear
    // ....
    // ...
    // if less then 11 button should not be shown
    // ....
    // ...

    cy.get('app-generic-labels > ul > li').as('genericLabels');
    cy.get('@genericLabels').then((labels) => {
      const numberOfLabels = Cypress.$(labels).length;
      if (numberOfLabels <= 10) {
        cy.contains('mehr anzeigen').should('not.exist');
        return;
      }

      cy.contains('mehr anzeigen').should('exist').click();
      cy.get('@genericLabels').then((labels) => {
        const numberOfLabelsExpended = Cypress.$(labels).length;
        expect(numberOfLabelsExpended).to.be.greaterThan(10);
      });
    });
    // Completion message at the end of the test
    cy.log('Test completed successfully.');
  });
});
