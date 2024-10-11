/// <reference types="cypress-xpath" />

describe('Login, Change password, Logout', () => {
  beforeEach(() => {
    cy.session('login_data', () => {
      cy.loginToEBrief();
    });
  });
  //update personal data
  it.only('Change password, check validation', function () {
    cy.visit('/deliveries');
    cy.wait(2500);
    cy.get('.user-title').click(); //switch to Persons tab
    cy.get('[color="primary"] > .button').click();
    //cy.get('[href="/settings/personal"]').click();
    cy.get(
      'app-personal-data-settings > app-settings-outlet-wrapper > .outlet-wrap > .settings-section-wrapper > .settings-section-buttons > sc-button > .button'
    ).click();
    //Switch to Password page
    cy.get('#mat-tab-link-2').click();
    //Change password - Current pass
    // Focus in on the password input field, then focus out, and check for validation error
    cy.get(
      '.password-form>.input-and-error>app-input>div>input[placeholder="Aktuelles Passwort *"]'
    )
      .focus() // Focus in on the input field
      .blur(); // Focus out (triggering blur event)

    cy.get('.form-position > .input-and-error > .form__error-text > span')
      .should('be.visible') // Check if the validation message is visible
      .and('contain', 'Bitte geben Sie ein gültiges Passwort ein'); // Validate the specific error message text

    //Change password - New pass
    // Focus in on the password input field, then focus out, and check for validation error
    cy.get(
      '.password-form>.input-and-error>app-input>div>input[placeholder="Passwort"]'
    )
      .focus() // Focus in on the input field
      .blur(); // Focus out (triggering blur event)

    cy.get('.form-position > .input-and-error > .form__error-text > span')
      .should('be.visible') // Check if the validation message is visible
      .and('contain', 'Bitte geben Sie ein gültiges Passwort ein'); // Validate the specific error message text

    //Change password - Confirm New pass
    // Focus in on the password input field, then focus out, and check for validation error
    cy.get(
      '.password-form>.input-and-error>app-input>div>input[placeholder="Password bestätigen" ]'
    )
      .focus() // Focus in on the input field
      .blur(); // Focus out (triggering blur event)

    cy.get('.form-position > .input-and-error > .form__error-text > span')
      .should('be.visible') // Check if the validation message is visible
      .and('contain', 'Bitte geben Sie ein gültiges Passwort ein'); // Validate the specific error message text

    cy.wait(2500);
    //--------------->Validation 2: NewPass does not match ConfirmPass
    var currentPass = 'Test1234!';
    var newPass = 'Test1234!';
    var invalidNewPass = 'inavalid_value';
    //Change password - Current pass
    // Focus in on the password input field, then focus out, and check for validation error
    cy.get(
      '.password-form>.input-and-error>app-input>div>input[placeholder="Aktuelles Passwort *"]'
    ).type(currentPass);
    cy.get(
      '.form-position > .input-eye-icon > app-custom-icon-button > #undefined > .mat-mdc-button-touch-target'
    ).click(); //Show-Hide icon
    //Change password - New pass
    // Focus in on the password input field, then focus out, and check for validation error
    cy.get(
      '.password-form>.input-and-error>app-input>div>input[placeholder="Passwort"]'
    ).type(currentPass);
    cy.get(
      '.password-controls-wrapper-one > :nth-child(1) > .password-form > .input-eye-icon > app-custom-icon-button > #undefined > .mat-mdc-button-touch-target'
    ).click(); //Show-Hide icon
    //Change password - Confirm New pass
    // Focus in on the password input field, then focus out, and check for validation error
    cy.get(
      '.password-form>.input-and-error>app-input>div>input[placeholder="Password bestätigen" ]'
    ).type(invalidNewPass);
    cy.get(
      ':nth-child(2) > .password-form > .input-eye-icon > app-custom-icon-button > #undefined > .mat-mdc-button-touch-target'
    ).click(); //Show-Hide icon
    cy.wait(1500);

    // cy.get('.button').click(); //Submit Form
    cy.wait(1500);

    cy.get(
      ':nth-child(2) > .password-form > .input-and-error > .form__error-text > span'
    )
      .should('be.visible') // Check if the validation message is visible
      .and('contain', 'Die Passwörter stimmen nicht überein'); // Validate the specific error message text

    //--------------->Validation 3: CurrentPass is incorrect

    //Change password - Current pass
    // Focus in on the password input field, then focus out, and check for validation error
    cy.get(
      '.password-form>.input-and-error>app-input>div>input[placeholder="Aktuelles Passwort *"]'
    )
      .clear()
      .type(invalidNewPass);

    //Change password - New pass
    // Focus in on the password input field, then focus out, and check for validation error
    cy.get(
      '.password-form>.input-and-error>app-input>div>input[placeholder="Passwort"]'
    )
      .clear()
      .type(currentPass);

    //Change password - Confirm New pass
    // Focus in on the password input field, then focus out, and check for validation error
    cy.get(
      '.password-form>.input-and-error>app-input>div>input[placeholder="Password bestätigen" ]'
    )
      .clear()
      .type(currentPass);

    cy.wait(1500);

    cy.get('.button').click(); //Submit Form
    cy.wait(1500);

    cy.get('.form__error-text > span')
      .should('be.visible') // Check if the validation message is visible
      .and('contain', 'Das eingegebene Passwort ist nich korrekt'); // Validate the specific error message text

    // //Save Changes
    // cy.get('.settings-section-buttons > sc-button > .button').click();
    // cy.wait(1500);
    // cy.get('#mat-mdc-error-0')
    //   .should('be.visible')
    //   .and('include.text', 'Pflichtfeld'); // Validate the error text

    cy.wait(1500);

    //Enter valid values
    cy.get(
      '.password-form>.input-and-error>app-input>div>input[placeholder="Aktuelles Passwort *"]'
    )
      .clear()
      .wait(1000)
      .type(currentPass);
    cy.wait(1500);
    cy.get('.button').click(); //Submit Form
    cy.wait(1500);
    //Save Changes
    //cy.get('.settings-section-buttons > sc-button > .button').click();
    // cy.get('button > .button__title--icon')
    //   .invoke('text') // Extract the text from the button
    //   .then((buttonTitle) => {
    //     if (buttonTitle.trim() === 'Speichern') {
    //       // Check if the button title is 'Speichern'
    //       cy.wrap(buttonTitle).click(); // Click the button if the condition is true
    //     }
    //   });

    //Add new address
    //cy.get('.add-button > .button').click();
  }); //end it

  //Logout  & Clear saved session
  it('Logout & Clear saved session', function () {
    cy.visit('/deliveries');
    cy.get('.user-title').click();
    cy.wait(3000);
    cy.get('[color="primary-reverse"] > .button').click();
    Cypress.session.clearAllSavedSessions(); //Clear saved session
    cy.url().should('include', '/'); // => validate url after logout
  }); //end it
});
