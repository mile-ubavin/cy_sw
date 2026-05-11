// spec: specs/create-employee.plan.md

// seed: tests/seed.spec.ts

function uniqueAccNum() {
  return Math.floor(10000000 + Math.random() * 89999999).toString();
}

describe('4. Address Confirmation Dialog', () => {
  // beforeEach(() => {
  //   cy.visit('https://documenthub.edeja.com/');

  //   cy.findByRole('textbox', { name: 'USERNAME' }).type('aquaAdmin');

  //   cy.pause();

  //   // password inputs are excluded from role="textbox" by ARIA spec - use get() instead
  //   cy.get('input[type="password"]').type('Test1234!');

  //   cy.findByRole('button', { name: 'Login now' }).click();

  //   // Wait for login redirect to complete before each test navigates further
  // });

  it('should show address confirmation dialog for non-AT countries', () => {
    cy.visit('https://documenthub.edeja.com/');

    cy.findByRole('textbox', { name: 'USERNAME' }).type('aquaAdmin');

    // password inputs are excluded from role="textbox" by ARIA spec - use get() instead
    cy.get('input[type="password"]').type('Test1234!');

    cy.findByRole('button', { name: 'Login now' }).click();
    cy.wait(5000); // wait for login redirect to complete
    const acct = uniqueAccNum();
    cy.get('#nav-employees')
      .should('be.visible')
      .invoke('attr', 'style', 'border: 2px solid black; padding: 2px;')
      .click();

    cy.findByRole('button', { name: 'Create New Contact' }).click();

    cy.findByRole('textbox', { name: 'First Name' }).type('Address');

    cy.findByRole('textbox', { name: 'Last Name' }).type('Confirmation');

    cy.findByRole('textbox', { name: 'Account Number' }).type(acct);

    cy.findByRole('button', { name: 'Open' }).click();

    cy.findByRole('option', { name: 'ABBA GmbH - ABBA - AbbaPrefix' }).click();

    cy.findByRole('button', { name: 'Next' }).click();

    cy.findByRole('textbox', { name: 'Phone Number' }).type('+49 30 12345');

    cy.findByRole('textbox', { name: 'Email Address' }).type(
      'address.conf@example.com',
    );

    cy.findByRole('textbox', { name: 'Street' }).type('Unter den Linden');

    cy.findByRole('textbox', { name: 'House No.' }).type('1');

    cy.findByRole('textbox', { name: 'ZIP Code' }).type('3321');

    cy.findByRole('textbox', { name: 'City' }).type('Berlin');

    cy.findByRole('combobox', { name: 'Country' }).click();

    cy.findByRole('option', { name: 'Deutschland' }).click();

    cy.findByRole('button', { name: 'Next' }).click();
    cy.pause();

    // MUI combobox accessible name = label + current value (via aria-labelledby)
    // Default value is "Digital", so full accessible name is "Delivery Type Digital"
    cy.findByRole('combobox', { name: 'Delivery Type Digital' }).click();

    cy.findByRole('option', { name: 'Mail' }).click();

    cy.findByRole('button', { name: 'Create' }).click();

    cy.findByRole('dialog', { name: 'Send to Print Channel Selected' }).should(
      'be.visible',
    );

    cy.contains('Unter den Linden').should('be.visible');

    cy.contains('Berlin').should('be.visible');

    cy.findByRole('button', { name: 'Confirm' }).click();

    cy.findByRole('dialog', { name: 'New User Access Data' }).should(
      'be.visible',
    );

    cy.findByRole('button', { name: 'Close' }).click();
  });

  it('should handle address correction in confirmation dialog', () => {
    // cy.visit('https://documenthub.edeja.com/home/persons');

    cy.findByRole('button', { name: 'Create New Contact' }).click();

    cy.findByRole('textbox', { name: 'First Name' }).type('Address');

    cy.findByRole('textbox', { name: 'Last Name' }).type('Correction');

    cy.findByRole('textbox', { name: 'Account Number' }).type(uniqueAccNum());

    cy.findByRole('button', { name: 'Open' }).click();

    cy.findByRole('option', { name: 'ABBA GmbH - ABBA - AbbaPrefix' }).click();

    cy.findByRole('button', { name: 'Next' }).click();

    cy.findByRole('textbox', { name: 'Phone Number' }).type('+41 44 1234567');

    cy.findByRole('textbox', { name: 'Email' }).type('addr.corr@example.ch');

    cy.findByRole('textbox', { name: 'Street' }).type('Bahnhofstrasse');

    cy.findByRole('textbox', { name: 'House No.' }).type('1');

    cy.findByRole('textbox', { name: 'ZIP' }).type('8001');

    cy.findByRole('textbox', { name: 'City' }).type('Zurich');

    cy.findByRole('combobox', { name: 'Country' }).click();

    cy.findByRole('option', { name: 'Schweiz' }).click();

    cy.findByRole('button', { name: 'Next' }).click();

    cy.findByRole('combobox', { name: 'Delivery Type Digital' }).click();

    cy.findByRole('option', { name: 'Mail' }).click();

    cy.findByRole('button', { name: 'Create' }).click();

    cy.findByRole('dialog', { name: 'Send to Print Channel Selected' }).should(
      'be.visible',
    );

    cy.findByRole('button').filter(':empty').click(); // close dialog

    cy.findByRole('button', { name: 'Back' }).click();

    cy.findByRole('textbox', { name: 'Street' })
      .should('be.visible')
      .and('have.value', 'Bahnhofstrasse');

    cy.findByRole('textbox', { name: 'Street' })
      .clear()
      .type('Bahnhofstrasse Corrected');

    cy.findByRole('button', { name: 'Next' }).click();

    cy.findByRole('button', { name: 'Create' }).click();

    cy.findByRole('dialog', { name: 'Send to Print Channel Selected' }).should(
      'be.visible',
    );

    cy.contains('Bahnhofstrasse Corrected').should('be.visible');

    cy.findByRole('button', { name: 'Confirm' }).click();

    cy.findByRole('dialog', { name: 'Create New Contact' }).should('not.exist');
  });

  it('should skip address confirmation for AT addresses', () => {
    // cy.visit('https://documenthub.edeja.com/home/persons');

    cy.findByRole('button', { name: 'Create New Contact' }).click();

    cy.findByRole('textbox', { name: 'First Name' }).type('Austrian');

    cy.findByRole('textbox', { name: 'Last Name' }).type('Address');

    cy.findByRole('textbox', { name: 'Account Number' }).type(uniqueAccNum());

    cy.findByRole('button', { name: 'Open' }).click();

    cy.findByRole('option', { name: 'ABBA GmbH - ABBA - AbbaPrefix' }).click();

    cy.findByRole('button', { name: 'Next' }).click();

    cy.findByRole('textbox', { name: 'Phone Number' }).type('0664 1234567');

    cy.findByRole('textbox', { name: 'Email' }).type('austrian@example.at');

    cy.findByRole('textbox', { name: 'Street' }).type('Graben');

    cy.findByRole('textbox', { name: 'House No.' }).type('21');

    cy.findByRole('textbox', { name: 'ZIP Code' }).type('1010');

    cy.findByRole('textbox', { name: 'City' }).type('Wien');

    cy.findByRole('combobox', { name: 'Country' }).should(
      'contain.text',
      'Österreich',
    );

    cy.findByRole('button', { name: 'Next' }).click();

    cy.findByRole('combobox', { name: 'Delivery Type Digital' }).click();

    cy.findByRole('option', { name: 'Digital' }).click();

    cy.findByRole('button', { name: 'Create' }).click();

    cy.findByRole('dialog', { name: 'New User Access Data' }).should(
      'be.visible',
    );

    cy.findByRole('button', { name: 'Close' }).click();

    cy.findByRole('dialog', { name: 'Create New Contact' }).should('not.exist');

    cy.contains('Austrian').should('be.visible');

    cy.contains('austrian@example.at').should('be.visible');
  });
});
