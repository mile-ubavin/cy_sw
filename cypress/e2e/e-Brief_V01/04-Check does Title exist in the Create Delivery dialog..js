/// <reference types="cypress-xpath" />

describe('Login, Create_delivery-Upload_doc(pdf), Logout', () => {
  beforeEach(() => {
    cy.session('login_data', () => {
      cy.loginToEBrief();
    });
  });

  // Upload document, Create delivery
  it('Create_delivery-Upload_doc(pdf)', function () {
    cy.visit('/deliveries');
    cy.get('#toolbar-toggle_upload').click();
    cy.upload_attachment(); // Custom command to upload PDF documents from the fixtures folder
    cy.wait(2000);

    let randomString = Math.random().toString(15).substring(2); // Generate random string
    const title = 'Upload pdf - ' + randomString;

    // Case 1: Validate that the error message is visible when no title is entered
    cy.get(
      'mat-form-field>.mat-mdc-form-field-subscript-wrapper>.mat-mdc-form-field-error-wrapper>mat-error'
    )
      .should('be.visible') // Error should be visible when title is missing
      .and('include.text', 'Bitte geben Sie einen Sendungstitel an'); // Validate the error text

    cy.wait(2000);

    // Case 2: Enter the delivery title and verify the error message is no longer visible
    cy.get('#mat-input-5').type(title); // Enter title

    // Ensure error message disappears after title is entered
    cy.get(
      'mat-form-field>.mat-mdc-form-field-subscript-wrapper>.mat-mdc-form-field-error-wrapper>mat-error'
    ).should('not.exist'); // Error should no longer exist

    cy.wait(2000);
    cy.contains('Speichern').click({ force: true }); // Save the delivery
    cy.log('Test completed successfully.');
  });

  it('Logout & Clear saved session', function () {
    cy.visit('/deliveries');
    cy.url().should('include', '/deliveries'); // Validate URL /on deliveries page
    cy.get('.user-title').click();
    cy.wait(2000);
    cy.contains('Logout').click();
    Cypress.session.clearAllSavedSessions(); // Clear all session
    //cy.url().should('include', '/fe_t'); // Validate URL after logout
  });
});
