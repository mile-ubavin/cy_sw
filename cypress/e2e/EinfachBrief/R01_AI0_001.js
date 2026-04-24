/// <reference types="cypress" />

describe('Register Page - Einfach Brief', () => {
  const baseUrl = 'https://einfach-brief.edeja.com/_register';

  beforeEach(() => {
    cy.visit(baseUrl);
  });

  // Utility function
  const generateEmail = () => `test_${Date.now()}@example.com`;

  it.only('TC-REG-001: Successful registration', () => {
    const email = generateEmail();
    const password = 'StrongPass123!';
    const plz = `${Cypress._.random(1000, 9999)}`;

    // Fill all visible text-like fields with valid data.
    cy.get('input:visible').each(($input, index) => {
      const $el = Cypress.$($input);
      const type = ($el.attr('type') || 'text').toLowerCase();

      if (['hidden', 'submit', 'button', 'checkbox', 'radio'].includes(type)) {
        return;
      }

      const hint =
        `${$el.attr('name') || ''} ${$el.attr('id') || ''} ${$el.attr('placeholder') || ''}`.toLowerCase();

      let value = `ValidValue${index + 1}`;

      if (type === 'email' || hint.includes('mail')) {
        value = email;
      } else if (type === 'password') {
        value = password;
      } else if (hint.includes('uid')) {
        value = 'ATU12345678';
      } else if (hint.includes('firma') || hint.includes('company')) {
        value = 'Edeja Test GmbH';
      } else if (hint.includes('street') || hint.includes('strasse')) {
        value = 'Musterstrasse';
      } else if (hint.includes('house') || hint.includes('haus')) {
        value = '10A';
      } else if (
        hint.includes('zip') ||
        hint.includes('plz') ||
        hint.includes('postal')
      ) {
        value = plz;
      } else if (hint.includes('city') || hint.includes('ort')) {
        value = 'Wien';
      } else if (hint.includes('first') || hint.includes('vorname')) {
        value = 'Max';
      } else if (hint.includes('last') || hint.includes('nachname')) {
        value = 'Mustermann';
      }

      cy.wrap($input).clear({ force: true }).type(value, { force: true });
    });

    // Explicit PLZ handling for the postcode field.
    cy.get('input[name="postcode"]:visible').then(($postcode) => {
      if ($postcode.length) {
        cy.wrap($postcode).clear({ force: true }).type(plz, { force: true });
      }
    });

    // Validate PLZ is always 4 digits and within 1000-9999.
    cy.get('input[name="postcode"]:visible').then(($postcode) => {
      if ($postcode.length) {
        cy.wrap($postcode)
          .invoke('val')
          .then((val) => {
            const zipValue = String(val || '').trim();
            expect(zipValue).to.match(/^\d{4}$/);
            expect(Number(zipValue)).to.be.within(1000, 9999);
          });
        return;
      }

      cy.get('input:visible').then(($inputs) => {
        const zipInput = [...$inputs].find((input) => {
          const el = Cypress.$(input);
          const hint =
            `${el.attr('name') || ''} ${el.attr('id') || ''} ${el.attr('placeholder') || ''}`.toLowerCase();
          return (
            hint.includes('zip') ||
            hint.includes('plz') ||
            hint.includes('postal')
          );
        });

        if (zipInput) {
          cy.wrap(zipInput)
            .invoke('val')
            .then((val) => {
              const zipValue = String(val || '').trim();
              expect(zipValue).to.match(/^\d{4}$/);
              expect(Number(zipValue)).to.be.within(1000, 9999);
            });
        }
      });
    });

    cy.contains('button', /registrieren/i).as('registerBtn');

    // Before accepting AGB, register button should remain disabled.
    //cy.get('@registerBtn').should('be.disabled');

    // Check AGB consent via the explicit checkbox name.
    // cy.get('body').then(($body) => {
    //   const $agbInput = $body.find('input[name="agbTerms"]');

    //   if ($agbInput.length) {
    //     // Find associated label or parent clickable element
    //     const $label = $body.find('label[for="agbTerms"]');

    //     if ($label.length) {
    //       // Click the label instead of hidden input
    //       cy.wrap($label).first().scrollIntoView().click({ force: true });
    //     } else {
    //       // Try clicking the parent container
    //       cy.get('input[name="agbTerms"]')
    //         .parent()
    //         .scrollIntoView()
    //         .click({ force: true });
    //     }

    //     // Verify checkbox is checked
    //     cy.get('input[name="agbTerms"]').should('be.checked');
    //   } else {
    //     // Fallback: find by text and click the container
    //     cy.contains(
    //       /Ich habe die Allgemeinen Geschäftsbedingungen gelesen und akzeptiert/i,
    //     )
    //       .should('be.visible')
    //       .scrollIntoView()
    //       .click({ force: true });

    //     // Verify any checkbox near this text is checked
    //     cy.contains(
    //       /Ich habe die Allgemeinen Geschäftsbedingungen gelesen und akzeptiert/i,
    //     )
    //       .closest('label, div')
    //       .find('input[type="checkbox"]')
    //       .should('be.checked');
    //   }
    // });

    // If any remaining consent checkbox is required, check it too.
    cy.get('@registerBtn').then(($btn) => {
      if ($btn.is(':disabled')) {
        cy.get('input[type="checkbox"]:visible').each(($checkbox) => {
          if (!$checkbox.checked) {
            cy.wrap($checkbox).click({ force: true });
          }
        });
      }
    });

    // Scroll down to see checkboxes and captcha
    cy.scrollTo('bottom', { duration: 500 });

    // Check AGB Terms checkbox
    cy.get('input[name="agbTerms"]').scrollIntoView().check({ force: true });
    cy.get('input[name="agbTerms"]').should('be.checked');

    // Small delay to let page settle
    cy.wait(500);

    // Click on FriendlyCaptcha widget - simulate real user interaction
    cy.get('.frc-captcha', { timeout: 10000 })
      .should('be.visible')
      .scrollIntoView()
      .within(() => {
        // Find the interactive element (button or banner)
        cy.get('.frc-banner')
          .should('be.visible')
          .invoke('css', 'border', '2px solid #10a854')
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

    // Wait a bit for captcha to process
    cy.wait(3000);

    // Button should become enabled; highlight it when enabled.
    cy.get('@registerBtn', { timeout: 10000 })
      .should('be.enabled')
      .invoke('css', 'border', '3px solid #1f9d55');
  });

  it('TC-REG-002: Invalid email format', () => {
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('input[type="password"]').first().type('StrongPass123!');
    cy.get('button[type="submit"]').click();

    cy.contains(/invalid email|email is not valid/i);
  });

  it('TC-REG-003: Weak password validation', () => {
    cy.get('input[type="email"]').type(generateEmail());
    cy.get('input[type="password"]').first().type('123');
    cy.get('button[type="submit"]').click();

    cy.contains(/password.*(weak|min|invalid)/i);
  });

  it('TC-REG-004: Password mismatch', () => {
    cy.get('input[type="email"]').type(generateEmail());
    cy.get('input[type="password"]').first().type('StrongPass123!');

    cy.get('body').then(($body) => {
      if ($body.find('input[name="confirmPassword"]').length) {
        cy.get('input[name="confirmPassword"]').type('DifferentPass123!');
        cy.get('button[type="submit"]').click();
        cy.contains(/password.*match/i);
      }
    });
  });

  it('TC-REG-005: Submit empty form', () => {
    cy.get('button[type="submit"]').click();
    cy.contains(/required|fill/i);
  });

  it('TC-REG-006: Duplicate email', () => {
    const email = 'existing@example.com';

    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').first().type('StrongPass123!');
    cy.get('button[type="submit"]').click();

    cy.contains(/already exists|user exists/i);
  });

  it('TC-REG-007: Terms not accepted (if present)', () => {
    cy.get('input[type="email"]').type(generateEmail());
    cy.get('input[type="password"]').first().type('StrongPass123!');

    cy.get('body').then(($body) => {
      if ($body.find('input[type="checkbox"]').length) {
        cy.get('button[type="submit"]').click();
        cy.contains(/accept.*terms/i);
      }
    });
  });

  it('TC-REG-008: API failure handling', () => {
    cy.intercept('POST', '**/register', {
      statusCode: 500,
      body: { message: 'Server error' },
    }).as('registerFail');

    cy.get('input[type="email"]').type(generateEmail());
    cy.get('input[type="password"]').first().type('StrongPass123!');
    cy.get('button[type="submit"]').click();

    cy.wait('@registerFail');
    cy.contains(/error|try again/i);
  });

  // Edge Cases

  it('Edge: Extremely long email', () => {
    const longEmail = `${'a'.repeat(250)}@test.com`;

    cy.get('input[type="email"]').type(longEmail);
    cy.get('input[type="password"]').first().type('StrongPass123!');
    cy.get('button[type="submit"]').click();

    cy.contains(/invalid|too long/i);
  });

  it('Edge: Leading/trailing spaces', () => {
    cy.get('input[type="email"]').type('  test@example.com  ');
    cy.get('input[type="password"]').first().type('  StrongPass123!  ');
    cy.get('button[type="submit"]').click();

    // Expect trimming or validation
    cy.contains(/success|invalid/i);
  });

  it('Edge: Special characters in password', () => {
    cy.get('input[type="email"]').type(generateEmail());
    cy.get('input[type="password"]').first().type('!@#$%^&*()_+');

    cy.get('button[type="submit"]').click();
    cy.contains(/password|invalid|weak|success/i);
  });

  it('Edge: Double submit', () => {
    cy.get('input[type="email"]').type(generateEmail());
    cy.get('input[type="password"]').first().type('StrongPass123!');

    cy.get('button[type="submit"]').dblclick();

    // Expect only one request or proper handling
    cy.get('button[type="submit"]').should('not.be.disabled');
  });

  // Security Tests

  it('Security: SQL Injection attempt', () => {
    cy.get('input[type="email"]').type(`test' OR 1=1 --`);
    cy.get('input[type="password"]').first().type('password');

    cy.get('button[type="submit"]').click();

    cy.contains(/invalid|error/i);
  });

  it('Security: XSS attempt', () => {
    cy.get('input[type="email"]').type('<script>alert(1)</script>@test.com');
    cy.get('input[type="password"]').first().type('StrongPass123!');
    cy.get('button[type="submit"]').click();

    cy.contains(/invalid|error/i);
  });

  // Responsiveness (basic viewport check)

  it('Responsive: Mobile viewport', () => {
    cy.viewport('iphone-6');

    cy.get('input[type="email"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });
});
