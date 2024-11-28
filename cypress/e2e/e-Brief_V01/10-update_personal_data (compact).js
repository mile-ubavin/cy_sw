/// <reference types="Cypress" />
describe('Login/Logout to ebrief base scenario', () => {
  it('Login, Logout', function () {
    // Visit the e-brief website
    cy.visit('https://www.e-brief.at/fe_t');
    cy.url().should('include', 'fe_t'); // Validate URL contains 'fe_t'

    // Check if the login button is visible and enabled
    cy.get('button[type="submit"]').should('be.visible').and('be.enabled');
    cy.contains('Jetzt Anmelden').click(); // Click 'Jetzt Anmelden' button

    // Validate redirection to Kiam login page
    cy.url().should('include', 'https://kiamabn.b2clogin.com/');

    // User credentials
    const username_kiam = 'kiam.t.mile@yopmail.com';
    const password_kiam = 'Test1234!';

    // Fill in the login form
    cy.get('#signInName').type(username_kiam);
    cy.get('#password').type(password_kiam);
    cy.get('#showPassword').click(); // Optionally show/hide password

    // Submit login form
    cy.get('#next').click();

    // Validate that the user is redirected to the deliveries page after login
    cy.url().should('include', '/deliveries');

    // Navigate to the Persons tab
    cy.visit('/deliveries');
    cy.get('.user-title').click();
    cy.get('[color="primary"] > .button').click();
    cy.get(
      'app-personal-data-settings > app-settings-outlet-wrapper > .outlet-wrap > .settings-section-wrapper > .settings-section-buttons > sc-button > .button'
    ).click();

    // Get total number of input field labels and validate their text
    cy.get('.chameleon-form')
      .find('.two-col-grid-label')
      .then((inputFieldLabel) => {
        const listingCount = Cypress.$(inputFieldLabel).length;
        expect(inputFieldLabel).to.have.length(listingCount);
        cy.log('Number of input field labels: ', listingCount); // Optional
        let labelNames = [];
        cy.get('form.chameleon-form>div>.two-col-grid-label')
          .each(($el, index) => {
            labelNames[index] = $el.text(); // Get label text for each element
            cy.log('Input field label:', labelNames[index]); // Optional
          })
          .then(() => {
            for (let index = 0; index < listingCount; index++) {
              cy.get('form.chameleon-form>div>.two-col-grid-label')
                .eq(index)
                .invoke('text')
                .as('labels');
              cy.get('@labels').should('include', labelNames[index]); // Validate label name
              cy.log('Input field label:', labelNames[index]);
            }
          });
      });

    // Count the total number of dropdown elements visible on the Personal Data page
    cy.get('.chameleon-form>div')
      .find('.select-input')
      .then((dropdowns) => {
        const countDropdowns = Cypress.$(dropdowns).length;
        expect(dropdowns).to.have.length(countDropdowns);
        cy.log('Dropdown count:', countDropdowns);
      });

    // Iterating through all dropdown lists
    for (let i = 0; i < 5; i++) {
      cy.get('.chameleon-form>div>.select-input').eq(i).click();
      let dropdownContainer = '.mat-mdc-autocomplete-visible';
      if (i === 0) dropdownContainer = '.mdc-menu-surface'; // Special container for 1st element

      cy.get(dropdownContainer)
        .find('.mdc-list-item')
        .then((options) => {
          const optionCount = Cypress.$(options).length;
          expect(options).to.have.length(optionCount);
          const itemToSelect = options
            .eq(Math.floor(Math.random() * optionCount))
            .text();
          cy.get(dropdownContainer + ' > *').each(($el) => {
            if ($el.text() === itemToSelect) $el.trigger('click');
          });
        });
    }

    // Randomly select a dropdown value for Country using autocomplete
    for (let i = 0; i < 2; i++) {
      cy.get('.iti__selected-flag').eq(i).click({ force: true });
      cy.get('.iti__country-list')
        .find('.iti__country')
        .then((countries) => {
          const countryCount = Cypress.$(countries).length;
          expect(countries).to.have.length(countryCount);
          const countryToSelect = countries
            .eq(Math.floor(Math.random() * countryCount))
            .text();
          cy.get('.iti__country-list > *').each(($el) => {
            if ($el.text() === countryToSelect) {
              $el.trigger('click');
              cy.log('Selected country:', countryToSelect);
            }
          });
        });
    }

    // Get the total number of input fields
    cy.get('.chameleon-form>.two-col-grid-row>.two-col-grid-controls')
      .find('.form-field')
      .then((inputs) => {
        const inputCount = Cypress.$(inputs).length;
        expect(inputs).to.have.length(inputCount);

        // Populate specific input fields with sample data
        for (let index = 0; index < inputCount - 1; index++) {
          if (index === 0 || index === 1) {
            cy.get(
              '.chameleon-form>.two-col-grid-row>.two-col-grid-controls>.form-field'
            )
              .eq(index)
              .clear()
              .type('Testuser');
          } else if (index === 2 || index === 4) {
            if (index === 4) {
              cy.get(
                '.chameleon-form>.two-col-grid-row>.two-col-grid-controls>.form-field'
              )
                .eq(index)
                .clear()
                .type('667');
            } else {
              const randomAriaCode = Math.floor(Math.random() * 10000 + 1);
              cy.get(
                '.chameleon-form>.two-col-grid-row>.two-col-grid-controls>.form-field'
              )
                .eq(index)
                .clear()
                .type(randomAriaCode);
            }
          } else if (index === 3 || index === 5) {
            const randomPhoneNumber = Math.floor(Math.random() * 100000000 + 1);
            cy.get(
              '.chameleon-form>.two-col-grid-row>.two-col-grid-controls>.form-field'
            )
              .eq(index)
              .clear()
              .type(randomPhoneNumber);
          }
        }
      });

    // Click Save button to save changes
    cy.get(
      'app-personal-data-settings > app-settings-outlet-wrapper > .outlet-wrap > .settings-section-wrapper > .settings-section-buttons > sc-button > .button'
    ).click();
    cy.wait(2000);
    cy.log('Test completed successfully.');
    cy.wait(10000);
    // Verify page load and proceed with logout
    cy.get('.user-title').should('be.visible');
    cy.get('.user-title').click(); // Open dropdown
    cy.get('[color="primary-reverse"] > .button').click(); // Click on Logout button

    // Validate redirection back to the login page
    cy.url().should('include', '/fe_t');
    cy.log('Test completed successfully.');
  });
});
