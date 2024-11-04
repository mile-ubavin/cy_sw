/// <reference types="cypress" />

describe('Search by date picker should work', () => {
  beforeEach(() => {
    cy.loginToEBrief();
  });
  it('Test current date in date picker', () => {
    cy.get('.adv-menu>.mat-mdc-icon-button').click();
    cy.get('.mat-mdc-form-field-icon-suffix>mat-datepicker-toggle>button')
      .eq(0)
      .as('startDate')
      .click()
      .should('not.have.value'); // set alias for start date field and verify if it's empty

    cy.get(
      ':nth-child(1) > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-icon-suffix > .mat-datepicker-toggle > .mdc-icon-button > .mat-mdc-button-touch-target'
    ).as('startDatePicker');
    cy.get('@startDatePicker').click({ force: true }); // alias for date picker button

    cy.get('.mat-calendar-body-today').as('currentDay'); // alias for current day

    cy.get('@currentDay').then(($el) => {
      const currentDayValue = $el.text().trim(); // trimming the space before the date

      cy.get('@currentDay').click({ force: true }); //clicking on the current date that is preselected

      // cy.get("@startDate")
      //   .invoke("val")
      //   .should("not.be.empty")
      //   .should("contain", currentDayValue); // assertion for selected day

      cy.get('[color="primary"] > .button').click();
    });

    cy.get('@startDatePicker').click();
    cy.get('.mat-calendar-period-button').click();
    cy.get('.mat-calendar-body-cell-content').contains('2021').click();
    cy.get('.mat-calendar-body-cell-content').contains('FEB').click();
    cy.get('.mat-calendar-body-cell-content').contains('3').click();
    // cy.get("@startDate").should("have.value", "03.02.2021");
    cy.get('.mat-datepicker-input').should('have.value', '03.02.2021');

    cy.get('[name="endDate"]').as('endDate').click().should('not.have.value');

    cy.get(
      ':nth-child(2) > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-icon-suffix > .mat-datepicker-toggle > .mdc-icon-button > .mat-mdc-button-touch-target'
    ).as('endDatePicker');
    cy.get('@endDatePicker').click({ force: true });

    cy.get('@currentDay').then(($el) => {
      const currentDayValue = $el.text().trim(); // trimming the space before the date

      cy.get('@currentDay').click(); //clicking on the current date that is preselected

      cy.get('@endDate')
        .invoke('val')
        .should('not.be.empty')
        .should('contain', currentDayValue); // assertion for selected day

      cy.get('[color="primary"] > .button').click({ force: true });
    });

    cy.get('[name="sender"]').click().type('e-brief upload');
    cy.get('[name="subject"]').click().type('multiple');
    cy.get('[color="primary"] > .button').click();
    cy.get('[name="subject"]').click().clear().type('not exist');
    cy.get('[color="primary"] > .button').click();
    cy.get('div.no-results').should(
      'have.text',
      ' Keine Übereinstimmungen gefunden '
    );
    cy.get('[color="secondary"] > .button').click();

    cy.get(
      '.filter-results-wrap>.filter-results>.mat-mdc-chip-listbox>.mdc-evolution-chip-set__chips'
    )
      .find('.mat-mdc-option')
      .should('have.length', 4);
    // cy.get(".mat-mdc-chip-list-wrapper > .mat-chip").each(() => {
    //   cy.get(".mat-mdc-chip-list-wrapper > .mat-chip")
    //     .first()
    //     .click()
    //     .find(
    //       '.slug-remove-wrap [data-mat-icon-name="deliveries_inbox_remove-label"]'
    //     )
    //     .click({ force: true })
    //     .wait(1000);
    // });
    cy.log('Test completed successfully.');

    // cy.get(".filter-title").should("not.exist");

    // function selectMonthAndYear() {
    //   const randomNumber = Math.floor(Math.random() * (24 - 1) + 1);

    //   for (let index = 0; index < randomNumber; index++) {
    //     cy.get(".mat-calendar-previous-button").click();
    //   }
    //   cy.get(".mat-calendar-body-cell-content").each((el, index) => {
    //     if (index === randomNumber) {
    //       cy.log("TEST CASE ENTER ");
    //       el.trigger("click");
    //     }
    //   });
    // }
    // selectMonthAndYear();
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
