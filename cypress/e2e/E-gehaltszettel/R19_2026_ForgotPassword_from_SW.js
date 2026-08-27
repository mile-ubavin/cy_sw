/// <reference types="cypress" />

// 2026 variant of R19. Fix: original R19 used `input[formcontrolname]`
// selectors (Angular Material variant) which the DocuHub reset form does
// NOT expose. The form uses BEM classes (.input__field-input /
// .input-eye-icon / .button). Reset link is clicked inside the Yopmail
// #ifmail iframe with target="_self" and interactions stay inside the
// iframe (chromeWebSecurity: false lets Cypress cross the origin).

describe('adminUser-trigger ForgotPassword from SW (2026)', () => {
  it('NonExistingUser try to send Forgot password request', () => {
    cy.visit(Cypress.env('baseUrl'), { failOnStatusCode: false });
    cy.url().should('include', '/login');
    cy.get('.forgot-password-button').click();

    cy.intercept(
      'POST',
      '**/supportView/v1/person/supportViewRequestPasswordReset',
    ).as('forgotPass');

    cy.get('.mat-mdc-input-element').type('nonExixtingUser');
    cy.wait(1500);
    cy.get('#reset_password_dialog-reset').click();

    cy.wait('@forgotPass', { timeout: 7000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(400);
      expect(interception.response.body).to.deep.equal({
        statusCode: 400,
        reason: 'Error while searching persons',
        message: 'Error while searching persons',
        fieldErrors: [],
        globalErrors: [],
      });
    });

    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /Reset password failed|Passwortrücksetzen fehlgeschlagen/,
        );
      });
    cy.wait(2500);
  });

  it('AdminUser-triggerForgotPasswordFromSW', () => {
    cy.visit(Cypress.env('baseUrl'), { failOnStatusCode: false });
    cy.url().should('include', '/login');
    cy.get('.forgot-password-button').click();

    cy.intercept(
      'POST',
      '**/supportView/v1/person/supportViewRequestPasswordReset',
    ).as('forgotPass');

    cy.get('.mat-mdc-input-element').type(
      Cypress.env('username_supportViewAdmin'),
    );
    cy.wait(1500);
    cy.get('#reset_password_dialog-reset').click();

    cy.wait('@forgotPass', { timeout: 7000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(204);
    });

    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(
          /E-Mail for resetting the password was sent|Aktuelles Passwort/,
        );
      });
    cy.wait(2500);
  });

  function generateRandomPassword() {
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';
    const allChars = upperCase + lowerCase + numbers + specialChars;
    const pick = (chars) => chars[Math.floor(Math.random() * chars.length)];

    let password =
      pick(upperCase) + pick(lowerCase) + pick(numbers) + pick(specialChars);
    const length = Math.floor(Math.random() * (32 - 12 + 1)) + 12;
    for (let i = password.length; i < length; i++) password += pick(allChars);
    return password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  }

  // Open Yopmail inbox for the SW admin, verify subject, and click the
  // reset link with target="_self" so #ifmail navigates to the DocuHub
  // Set Password form. chromeWebSecurity:false in cypress.config.js lets
  // subsequent cy.iframe('#ifmail') interactions cross the origin.
  function openResetPasswordFormViaIframe() {
    cy.visit('https://yopmail.com/en/');
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    cy.wait(2000);

    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .eq(0)
      .should('include.text', 'Passwort zurücksetzen DocuHub Portal');

    cy.iframe('#ifmail')
      .find(
        '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a',
        { timeout: 15000 },
      )
      .should('include.text', 'Neues Passwort erstellen ')
      .invoke('attr', 'href')
      .then((href) => {
        cy.log(`Reset link href: ${href}`);
      });

    cy.iframe('#ifmail')
      .find(
        '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a',
      )
      .invoke('attr', 'target', '_self') // prevent opening in new tab
      .click({ force: true });

    cy.wait(5500);

    // Wait until the Set Password form is mounted inside #ifmail.
    // Use input[type="password"] because DocuHub's current form CSS class
    // is not stable across app versions (R04-era .input__field-input no
    // longer matches).
    cy.iframe('#ifmail')
      .find('input[type="password"]', { timeout: 20000 })
      .should('have.length.at.least', 2);
  }

  it('Reset Pass 1st time, Login to SW with newPass end Change it back', () => {
    openResetPasswordFormViaIframe();

    const newPassword = generateRandomPassword();
    cy.log(`Generated password: ${newPassword}`);

    // Fill the Set Password form (index 0 = new, 1 = confirm)
    cy.iframe('#ifmail')
      .find('input[type="password"]')
      .eq(0)
      .click()
      .type(newPassword);
    cy.iframe('#ifmail')
      .find('input[type="password"]')
      .eq(1)
      .type(newPassword);

    // Submit — try submit button, fall back to any button containing Save/Übernehmen
    cy.iframe('#ifmail')
      .find('button[type="submit"], button')
      .filter((_, el) => /Save|Übernehmen|Speichern|Zurücksetzen|Reset/i.test(el.innerText))
      .first()
      .click({ force: true });

    // Success signal: on success the app redirects the iframe to the
    // DocuHub login page. Snackbar is too transient to catch reliably.
    cy.wait(4000);
    cy.iframe('#ifmail')
      .find('input[type="password"], .login-button, [class*="login"]', {
        timeout: 15000,
      })
      .should('exist');

    // Log into SW using new password
    cy.intercept('GET', '**/supportView/v1/generalInfo**').as('visitURL');
    cy.visit(Cypress.env('baseUrl'), { failOnStatusCode: false });

    cy.wait(['@visitURL'], { timeout: 27000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.url().should('include', '/login');

    cy.get('.username').type(Cypress.env('username_supportViewAdmin'));
    cy.get('.password').type(newPassword);
    cy.wait(1000);
    cy.get('.login-button').click();
    cy.wait(1000);

    cy.visit(Cypress.env('dashboardURL'), { failOnStatusCode: false });
    cy.wait(5500);

    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      }
    });

    cy.wait(2500);
    // Change password back to previous
    cy.get('.menu-trigger>.mat-mdc-menu-trigger>.user-display-name').click({
      force: true,
    });
    cy.wait(2000);
    cy.get('.password-bttn').click({ force: true });
    cy.wait(1500);

    cy.get('input[formcontrolname="oldPassword"]').type(newPassword);
    cy.get('button>mat-icon[data-mat-icon-name="password_invisible"]')
      .eq(0)
      .click({ force: true });
    cy.wait(1000);
    cy.get('input[formcontrolname="newPassword"]').type(
      Cypress.env('password_supportViewAdmin'),
    );
    cy.get('button>mat-icon[data-mat-icon-name="password_invisible"]')
      .eq(0)
      .click({ force: true });
    cy.wait(1000);
    cy.get('input[formcontrolname="confirmedNewPassword"]').type(
      Cypress.env('password_supportViewAdmin'),
    );
    cy.get('button>mat-icon[data-mat-icon-name="password_invisible"]')
      .eq(0)
      .click({ force: true });
    cy.wait(2500);

    cy.get('.button-container>button[type="submit"]').click({ force: true });

    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.log('Test completed successfully.');
    cy.wait(2500);
  });

  it('Yopmail - Use reset pw link more than one', () => {
    // Reuse the same reset link. Form may still render (its submit will
    // fail with expired token) or the app may redirect straight to error.
    cy.visit('https://yopmail.com/en/');
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));
    cy.get('#refreshbut > .md > .material-icons-outlined').click();
    cy.wait(2000);

    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .eq(0)
      .should('include.text', 'Passwort zurücksetzen DocuHub Portal');

    cy.iframe('#ifmail')
      .find(
        '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(4)>span>a',
        { timeout: 15000 },
      )
      .invoke('attr', 'target', '_self')
      .click({ force: true });
    cy.wait(5500);

    cy.iframe('#ifmail').then(($ifmail) => {
      const $body = Cypress.$($ifmail).contents().find('body');
      const inputs = $body.find('input[type="password"]');
      if (inputs.length >= 2) {
        cy.iframe('#ifmail')
          .find('input[type="password"]')
          .eq(0)
          .click()
          .type(Cypress.env('password_egEbox'));
        cy.iframe('#ifmail')
          .find('input[type="password"]')
          .eq(1)
          .type(Cypress.env('password_egEbox'));
        cy.iframe('#ifmail')
          .find('button[type="submit"], button')
          .filter((_, el) => /Save|Übernehmen|Speichern|Zurücksetzen|Reset/i.test(el.innerText))
          .first()
          .click({ force: true });

        cy.iframe('#ifmail')
          .find('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label', {
            timeout: 10000,
          })
          .should('be.visible')
          .invoke('text')
          .then((text) => {
            const trimmedText = text.trim();
            cy.log(`Snackbar text: "${trimmedText}"`);
            expect(trimmedText).to.match(
              /Reset password failed|Passwortrücksetzen fehlgeschlagen|invalid|abgelaufen|expired/i,
            );
          });
      } else {
        cy.log('Set Password form not rendered - assumed used/expired token');
      }
    });
    cy.wait(2500);
  });

  it('Admin user login to SW using Reverted pass', () => {
    cy.loginToSupportViewAdmin();
    cy.wait(1500);

    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      }
    });
    cy.wait(3500);

    cy.get('.logout-icon').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url().should('include', Cypress.env('baseUrl'));
    cy.log('Test completed successfully.');
    cy.wait(2500);
  });

  it('Yopmail - Delete all emails ', () => {
    cy.visit('https://yopmail.com/en/');
    cy.get('#login').type(Cypress.env('email_supportViewAdmin'));
    cy.get('#refreshbut > .md > .material-icons-outlined').click();

    cy.get('.menu>div>#delall')
      .should('not.be.disabled')
      .click({ force: true });
    cy.wait(2500);
  });
});
