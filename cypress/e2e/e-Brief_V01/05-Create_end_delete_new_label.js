/// <reference types="cypress" />

describe('Create end delete new label', () => {
  beforeEach(() => {
    cy.loginToEBrief();
  });

  const randomString = Math.random().toString(15).substring(2); //Generating random string

  it('Create new labels', () => {
    cy.get('app-create-label').click();
    cy.get('input[name="labelName"]')
      .click()
      .type('Label - ' + randomString);

    // Click on the dropdown to open it
    cy.get('.mat-mdc-select-trigger').click();

    // Wait for the dropdown options to appear
    cy.get('.mat-mdc-select-panel').should('be.visible');

    // Get all the dropdown options
    cy.get('.ng-trigger')
      .find('.mdc-list-item')
      .then(($options) => {
        // Get the total number of options
        const totalOptions = $options.length;
        cy.log('Total numbers of items:', totalOptions);
        // Generate a random index between 0 and totalOptions - 1
        const randomIndex = Math.floor(Math.random() * totalOptions);

        // Click on the random option from the dropdown
        cy.get('.ng-trigger').find('.mdc-list-item').eq(randomIndex).click();
      });
    cy.get('.button--primary>.ng-star-inserted').click();
    cy.get('.mat-mdc-simple-snack-bar>.mdc-snackbar__label').should(
      'include.text',
      'Label gespeichert'
    );
    // Completion message at the end of the test
    cy.log('Test completed successfully.');
  });
  //Label name is alreay exist
  it('Should fail if label already exists', () => {
    cy.visit('/deliveries');
    cy.get('app-create-label').click();
    cy.get('input[name="labelName"]').type('Label - ' + randomString);
    cy.wait(1000);
    cy.get('.error-message').should(
      'include.text',
      'Label mit dieser Bezeichnung bereits vorhanden'
    );
    // Completion message at the end of the test
    cy.log('Test completed successfully.');
  });

  //Delete alredy created label
  it('Delete already created label', () => {
    // Assertion for labels page details
    cy.get('[routerlink="/settings/labels"]').click();
    cy.url().should('include', '/settings/labels');
    cy.get('.header-separator-title').should('contain', ' EINSTELLUNGEN ');
    cy.get(
      '.mat-mdc-tab-links>#mat-tab-link-4>.mdc-tab__content>.mdc-tab__text-label'
    ).should('have.text', ' Labels ');
    cy.get('.settings-section-title').should(
      'have.text',
      ' Persönliche Labels '
    );
    //Get total number of labels
    cy.get('.mdc-list-item__content').then(($items) => {
      const totalItems = $items.length;
      cy.log('Total number of items:', totalItems);

      // Find the appropriate row containing the label to delete
      cy.get('.mdc-list-item__content')
        .contains('Label - ' + randomString)
        .closest('.mdc-list-item__content')
        .as('labelRow');

      // Click on the delete button associated with the identified row
      cy.get('@labelRow').find('.mat-mdc-button-touch-target').eq(1).click();
      //Confirm action
      cy.get(
        '.dialog-actions>.mat-mdc-dialog-actions>sc-button>.button--primary>div>.button__subline'
      ).click();
      //Check validation message
      cy.get('.mat-mdc-simple-snack-bar>.mdc-snackbar__label').should(
        'include.text',
        'Label gelöscht'
      );
      // Completion message at the end of the test
      cy.log('Test completed successfully.');
      // });
    });
  }); //end it
});
