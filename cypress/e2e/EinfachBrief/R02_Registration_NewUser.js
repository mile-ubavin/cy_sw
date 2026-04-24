/// <reference types="cypress" />

describe('EinfachBrief - Registration New User', () => {
  const baseUrl = 'https://einfach-brief.edeja.com/_register';
  const generateEmail = () => `test_${Date.now()}@yopmail.com`;

  beforeEach(() => {
    cy.visit(baseUrl);
  });

  it.only('should display validation messages for all required fields', () => {
    // Scroll to register button
    cy.scrollTo('bottom', { duration: 500 });

    // Focus and blur each field to trigger validation messages

    // Firmenname - trigger validation
    cy.get('input[name="legalName"]').focus().blur();
    cy.contains(/Firmenname/i);
    //Validate the validation message for Firmenname
    cy.get('#legalName-helper>div')
      .should('be.visible')
      .invoke('text')
      .should(
        'match',
        /Pflichtfeld|Bitte geben Sie einen gültigen Firmennamen ein|Required|erforderlich/i,
      );

    cy.wait(500); // Short wait to ensure validation message is rendered before moving to the next field

    // UID - Nummer - trigger validation
    cy.get('input[name="uidNumber"]').type('invalid-uid-value').blur();
    cy.contains(/UID-Nummer/i);
    //Validate the validation message for UID-Nummer
    cy.get('#uidNumber-helper>div')
      .should('be.visible')
      .invoke('text')
      .should(
        'match',
        /Pflichtfeld|Die minimale Länge ist 11|Required|erforderlich/i,
      );

    cy.wait(500); // Short wait to ensure validation message is rendered before moving to the next field

    // Straße - trigger validation
    cy.get('input[name="street"]').focus().blur();
    cy.contains(/Straße/i);

    //Validate the validation message for Straße
    cy.get('#street-helper>div')
      .should('be.visible')
      .invoke('text')
      .should(
        'match',
        /Pflichtfeld|Bitte geben Sie eine gültige Straße ein|Required|erforderlich/i,
      );

    cy.wait(500); // Short wait to ensure validation message is rendered before moving to the next field

    // Hausnummer - trigger validation
    cy.get('input[name="houseNumber"]').focus().blur();
    cy.contains(/Hausnummer/i);
    //Validate the validation message for Hausnummer
    cy.get('#houseNumber-helper>div')
      .should('be.visible')
      .invoke('text')
      .should(
        'match',
        /Pflichtfeld|Bitte geben Sie eine gültige Hausnummer ein|Required|erforderlich/i,
      );

    cy.wait(500); // Short wait to ensure validation message is rendered before moving to the next field
    // PLZ - trigger validation
    cy.get('input[name="postcode"]').focus().blur();
    cy.contains(/^PLZ/i);

    //validate the validation message for PLZ
    cy.get('#postcode-helper>div')
      .should('be.visible')
      .invoke('text')
      .should(
        'match',
        /Pflichtfeld|Es werden 4 Zahlen benötigt|Required|erforderlich/i,
      );

    cy.wait(500); // Short wait to ensure validation message is rendered before moving to the next field

    // Ort - trigger validation
    cy.get('input[aria-describedby="place-helper"]').focus().blur();
    cy.contains(/^Ort/i);

    //validate the validation message for Ort
    cy.get('#place-helper>div')
      .should('be.visible')
      .invoke('text')
      .should(
        'match',
        /Pflichtfeld|Bitte geben Sie einen gültigen Wert ein|Required|erforderlich/i,
      );

    cy.wait(500); // Short wait to ensure validation message is rendered before moving to the next field

    // Vorname - trigger validation
    cy.get('input[aria-describedby="firstName-helper"]').focus().blur();
    cy.contains(/Vorname/i);

    //validate the validation message for Vorname
    cy.get('#firstName-helper>div')
      .should('be.visible')
      .invoke('text')
      .should(
        'match',
        /Pflichtfeld|Bitte geben Sie einen gültigen Vornamen ein|Required|erforderlich/i,
      );

    cy.wait(500); // Short wait to ensure validation message is rendered before moving to the next field
    // Nachname - trigger validation
    cy.get('input[name="lastName"]').focus().blur();
    cy.contains(/Nachname/i);

    //validate the validation message for Nachname
    cy.get('#lastName-helper>div')
      .should('be.visible')
      .invoke('text')
      .should(
        'match',
        /Pflichtfeld|Bitte geben Sie einen gültigen Nachnamen ein|Required|erforderlich/i,
      );

    cy.wait(500); // Short wait to ensure validation message is rendered before moving to the next field

    // E-Mail field is mandatory - trigger validation
    cy.get('input[name="email"]').focus().blur();
    cy.contains(/^E-Mail Adresse/i);

    //validate the validation message for E-Mail
    cy.get('#email-helper>div')
      .should('be.visible')
      .invoke('text')
      .should(
        'match',
        /Pflichtfeld|Bitte geben Sie eine gültige Email ein|Required|erforderlich/i,
      );

    //E-Mail invalid email format - trigger validation
    cy.get('input[name="email"]').clear().type('invalid-email-format').blur();
    cy.contains(/^E-Mail Adresse/i);

    //validate the validation message for invalid email format
    cy.get('#email-helper>div')
      .should('be.visible')
      .invoke('text')
      .should(
        'match',
        /Bitte geben Sie eine gültige E-Mail-Adresse ein|ungültig|invalid|E-Mail/i,
      );

    cy.wait(500); // Short wait to ensure validation message is rendered before moving to the next field

    //Comfirmation E-Mail - trigger validation
    cy.get('input[name="confirmEmail"]').focus().blur();
    cy.contains(/E-Mail Adresse wiederholen/i);

    //validate if confirmation field is mandatory - validation message for E-Mail wiederholen
    cy.get('#confirmEmail-helper>div')
      .should('be.visible')
      .invoke('text')
      .should(
        'match',
        /Pflichtfeld|Bitte geben Sie eine gültige Email ein|Required|erforderlich/i,
      );
    cy.wait(500); // Short wait to ensure validation message is rendered before moving to the next field

    //Comfirmation E-Mail invalid email format - trigger validation
    cy.get('input[name="confirmEmail"]')
      .clear()
      .type('invalid-confirmation-email-format')
      .blur();
    cy.contains(/E-Mail Adresse wiederholen/i);

    //validate the validation message for invalid email format
    cy.get('#confirmEmail-helper>div')
      .should('be.visible')
      .invoke('text')
      .should(
        'match',
        /Bitte geben Sie eine gültige E-Mail-Adresse ein|ungültig|invalid|E-Mail/i,
      );
    cy.wait(500); // Short wait to ensure validation message is rendered before moving to the next field

    //Validate if E-Mail and E-Mail wiederholen mismatch - trigger validation
    const email = generateEmail();

    cy.get('input[name="email"]').clear().type(email);
    cy.get('input[name="confirmEmail"]')
      .clear()
      .type('mismatch-' + email)
      .blur();
    cy.contains(/E-Mail Adresse wiederholen/i);
    cy.get('#confirmEmail-helper>div')
      .should('be.visible')
      .invoke('text')
      .should(
        'match',
        /E-Mail-Adressen stimmen nicht überein|stimmen nicht überein|match|übereinstimmen/i,
      );

    cy.wait(500); // Short wait to ensure validation message is rendered before moving to the next field

    // Passwort - trigger validation

    // Validate if password field is mandatory - trigger validation

    cy.get('input[aria-describedby="password-helper"]').focus().blur();
    cy.contains(/^Passwort/i);

    //validate the validation message for Passwort
    cy.get('#password-helper>div')
      .should('be.visible')
      .invoke('text')
      .should(
        'match',
        /Pflichtfeld|Bitte geben Sie ein gültiges Passwort ein|Required|erforderlich/i,
      );

    cy.wait(500); // Short wait to ensure validation message is rendered before moving to the next field

    // Validate password strength requirements - trigger validation
    cy.get('input[name="password"]').clear().type('1234').blur();
    cy.contains(/^Passwort/i);
    //validate the validation message for weak password
    cy.get('#password-helper>div')
      .should('be.visible')
      .invoke('text')
      .should(
        'match',
        /Mind. 8 Zeichen, 3 von 4 Kriterien|mindestens 8 Zeichen|Großbuchstabe|Kleinbuchstabe|Zahl|Sonderzeichen/i,
      );

    //Validate the password strength indicators for case when pass is longer than 64 chaeracters
    cy.get('input[name="password"]')
      .clear()
      .type(
        'ThisIsAVeryLongPasswordThatExceedsTheMaximumAllowedLengthOfSixtyFourCharacters1234!',
      )
      .blur();
    cy.contains(/^Passwort/i);
    //validate the validation message for password exceeding max length
    cy.get('#password-helper>div')
      .should('be.visible')
      .invoke('text')
      .should(
        'match',
        /Das Passwort darf maximal 64 Zeichen lang sein|maximal 64 Zeichen/i,
      );

    cy.pause(); // Debug pause to inspect the state after password validation

    // Passwort wiederholen - trigger validation
    cy.get('input[aria-describedby="confirmPassword-helper"').focus().blur();
    cy.contains(/Passwort wiederholen/i);

    //validate the validation message for Passwort wiederholen
    cy.get('#confirmPassword-helper>div')
      .should('be.visible')
      .invoke('text')
      .should(
        'match',
        /Pflichtfeld|Dieses Feld ist erforderlich|Required|erforderlich/i,
      );

    cy.pause(); // Debug pause to inspect the state after confirm password validation
  });

  it('should successfully register a new user with valid data', () => {
    const email = generateEmail();
    const password = 'Test1234!';
    const plz = String(Cypress._.random(1000, 9999));

    // Fill Firmendaten section
    cy.get('input[name="legalName"]').clear().type('Test Company GmbH');
    cy.wait(500);

    cy.get('input[name="uidNumber"]').clear().type('ATU12345678');
    cy.wait(500);

    // Fill Adresse section
    cy.get('input[name="street"]').clear().type('Mariahilferstraße');
    cy.wait(500);

    cy.get('input[name="houseNumber"]').clear().type('101/4/5');
    cy.wait(500);

    // Land is disabled and pre-filled with "Österreich"
    cy.get('input[name="state"]')
      .should('be.disabled')
      .should('have.value', 'Österreich');

    // Fill PLZ (must be 4 digits, 1000-9999)
    cy.get('input[name="postcode"]').clear().type(plz);
    cy.wait(500);

    // Validate PLZ is 4 digits and within valid range
    cy.get('input[name="postcode"]')
      .invoke('val')
      .then((val) => {
        const zipValue = String(val || '').trim();
        expect(zipValue).to.match(/^\d{4}$/);
        expect(Number(zipValue)).to.be.within(1000, 9999);
      });

    cy.get('input[name="place"]').clear().type('Wien');
    cy.wait(500);

    // Fill Persönliche Daten section
    cy.get('input[name="firstName"]').clear().type('Max');
    cy.wait(500);

    cy.get('input[name="lastName"]').clear().type('Mustermann');
    cy.wait(500);

    // Fill Benutzerdaten section
    cy.get('input[name="email"]').clear().type(email);
    cy.wait(500);

    cy.get('input[name="confirmEmail"]').clear().type(email);
    cy.wait(500);

    // Fill Passwort section
    cy.get('input[name="password"]').clear().type(password);
    cy.wait(500);

    cy.get('input[name="confirmPassword"]').clear().type(password);
    cy.wait(500);

    // Verify password strength indicators
    cy.contains('1 Großbuchstabe').should('be.visible');
    cy.contains('1 Kleinbuchstabe').should('be.visible');
    cy.contains('1 Sonderzeichen').should('be.visible');
    cy.contains('1 Zahl').should('be.visible');

    // Scroll down to see AGB and captcha
    cy.scrollTo('bottom', { duration: 500 });

    // Check AGB Terms checkbox
    cy.get('input[name="agbTerms"]')
      .scrollIntoView()
      .should('be.visible')
      .check({ force: true });

    // Verify checkbox is checked
    cy.get('input[name="agbTerms"]').should('be.checked');

    // Click on FriendlyCaptcha - simulate real user interaction
    cy.get('.frc-captcha', { timeout: 10000 })
      .should('be.visible')
      .scrollIntoView()
      .within(() => {
        cy.get('.frc-button')
          .should('be.visible')
          .should('contain', 'Click to start verification')
          .invoke('css', 'border', '2px solid #3810a8')
          .trigger('mouseenter')
          .wait(100)
          .trigger('mouseover')
          .wait(100)
          .trigger('mousedown')
          .wait(50)
          .trigger('mouseup')
          .wait(50)
          .click();
      });

    // Wait for captcha to process
    cy.wait(3000);

    // Verify Register button becomes enabled and click it
    cy.contains('button', /registrieren/i, { timeout: 10000 })
      .should('be.enabled')
      .invoke('css', 'border', '3px solid #1f9d55')
      .invoke('css', 'background-color', '#e7f9ee')
      .click();

    // Verify successful registration (email verification message should appear)
    cy.url({ timeout: 15000 }).should('not.include', '/register');
  });

  it('should validate invalid email format with specific message', () => {
    cy.get('input[name="email"]').clear().type('invalid-email').blur();
    cy.contains(/^E-Mail Adresse/i);

    // Validation message should appear with specific text
    cy.get('#email-helper>div')
      .should('be.visible')
      .invoke('text')
      .should(
        'match',
        /Bitte geben Sie eine gültige E-Mail-Adresse ein|ungültig|invalid|E-Mail/i,
      );

    cy.wait(500);
  });

  it('should validate password mismatch with specific message', () => {
    cy.get('input[name="password"]').clear().type('Test1234!');
    cy.get('input[name="confirmPassword"]')
      .clear()
      .type('Different1234!')
      .blur();
    cy.contains(/Passwort wiederholen/i);

    // Validation message should appear with specific text
    cy.get('#confirmPassword-helper>div')
      .should('be.visible')
      .invoke('text')
      .should(
        'match',
        /Passwörter stimmen nicht überein|stimmen nicht überein|match|übereinstimmen/i,
      );

    cy.wait(500);
  });

  it('should validate email mismatch with specific message', () => {
    const email1 = generateEmail();
    const email2 = generateEmail();

    cy.get('input[name="email"]').clear().type(email1);
    cy.get('input[name="confirmEmail"]').clear().type(email2).blur();
    cy.contains(/E-Mail Adresse wiederholen/i);

    // Validation message should appear with specific text
    cy.get('#confirmEmail-helper>div')
      .should('be.visible')
      .invoke('text')
      .should(
        'match',
        /E-Mail-Adressen stimmen nicht überein|stimmen nicht überein|match|übereinstimmen/i,
      );

    cy.wait(500);
  });

  it('should validate PLZ input with specific messages (must be 4 digits between 1000-9999)', () => {
    // Test invalid PLZ (too short) - trigger validation
    cy.get('input[name="postcode"]').clear().type('100').blur();
    cy.contains(/^PLZ/i);

    cy.get('#postcode-helper>div')
      .should('be.visible')
      .invoke('text')
      .should('match', /Es werden 4 Zahlen benötigt|4.*Ziffern|Postleitzahl/i);

    cy.wait(500);

    // Test invalid PLZ (out of range) - trigger validation
    cy.get('input[name="postcode"]').clear().type('0999').blur();
    cy.contains(/^PLZ/i);

    cy.get('#postcode-helper>div')
      .should('be.visible')
      .invoke('text')
      .should(
        'match',
        /Es werden 4 Zahlen benötigt|ungültig|1000.*9999|Postleitzahl/i,
      );

    cy.wait(500);

    // Test invalid PLZ (too long)
    cy.get('input[name="postcode"]').clear().type('12345').blur();
    cy.contains(/^PLZ/i);

    cy.get('#postcode-helper>div')
      .should('be.visible')
      .invoke('text')
      .should('match', /Es werden 4 Zahlen benötigt|4.*Ziffern/i);

    cy.wait(500);

    // Test valid PLZ - should have no error
    cy.get('input[name="postcode"]').clear().type('1060').blur();
    cy.get('input[name="postcode"]')
      .invoke('val')
      .then((val) => {
        const zipValue = String(val || '').trim();
        expect(zipValue).to.match(/^\d{4}$/);
        expect(Number(zipValue)).to.be.within(1000, 9999);
      });

    cy.wait(500);
  });

  it('should validate password strength requirements with specific indicators', () => {
    // Verify all password strength indicators are visible
    cy.get('input[name="password"]').scrollIntoView().focus();

    // Initially all requirements should show as not met (with X icon)
    cy.contains('1 Großbuchstabe').should('be.visible');
    cy.contains('1 Kleinbuchstabe').should('be.visible');
    cy.contains('1 Sonderzeichen').should('be.visible');
    cy.contains('1 Zahl').should('be.visible');

    cy.wait(500);

    // Test weak password (only lowercase)
    cy.get('input[name="password"]').clear().type('weakpassword');
    // Großbuchstabe should still show as requirement
    cy.contains('1 Großbuchstabe').should('be.visible');

    cy.wait(500);

    // Test password missing special character
    cy.get('input[name="password"]').clear().type('WeakPass123');
    // Sonderzeichen should show as requirement
    cy.contains('1 Sonderzeichen').should('be.visible');

    cy.wait(500);

    // Test valid password that meets all requirements
    cy.get('input[name="password"]').clear().type('Test1234!');
    // All requirements should be satisfied (check marks should appear)
    cy.contains('Passwortsicherheit').should('be.visible');

    cy.wait(500);
  });

  it('should keep Register button disabled until AGB is checked', () => {
    const email = generateEmail();

    // Fill all required fields
    cy.get('input[name="legalName"]').type('Test Company');
    cy.wait(500);

    cy.get('input[name="street"]').type('Test Street');
    cy.wait(500);

    cy.get('input[name="houseNumber"]').type('1');
    cy.wait(500);

    cy.get('input[name="postcode"]').type('1060');
    cy.wait(500);

    cy.get('input[name="place"]').type('Wien');
    cy.wait(500);

    cy.get('input[name="firstName"]').type('Max');
    cy.wait(500);

    cy.get('input[name="lastName"]').type('Mustermann');
    cy.wait(500);

    cy.get('input[name="email"]').type(email);
    cy.wait(500);

    cy.get('input[name="confirmEmail"]').type(email);
    cy.wait(500);

    cy.get('input[name="password"]').type('Test1234!');
    cy.wait(500);

    cy.get('input[name="confirmPassword"]').type('Test1234!');
    cy.wait(500);

    cy.scrollTo('bottom');

    // Register button should be disabled
    cy.contains('button', /registrieren/i).should('be.disabled');

    // Check AGB
    cy.get('input[name="agbTerms"]').check({ force: true });
    cy.wait(500);

    // Button might still be disabled until captcha is solved
    // (In real scenario, captcha needs to be completed)
  });
});
