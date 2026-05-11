///<reference types="cypress" />
// Helper function to parse German date/time format (dd.mm.yyyy hh:mm)
function parseGermanDateTime(dateTimeStr) {
  const [datePart, timePart] = dateTimeStr.split(' ');
  const [day, month, year] = datePart.split('.').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

let uploadDateTime = ''; // Variable to store upload date & time across tests
/**
 * DH_EG_03_Employees_TS_Notifications
 * Test suite covering email notification scenarios for 6 user types:
 * USER1: No email + No phone (email and phone columns empty)
 * USER2: No email + With phone (email shown by system, phone not shown)
 * USER3: Email unconfirmed + Phone
 * USER4: Email confirmed + Phone (Yopmail confirmation required)
 * USER5: Email confirmed + No phone (Yopmail confirmation required)
 * USER6: Email unconfirmed + No phone
 */
describe('DH_EG_03_Employees_TS_Notifications', () => {
  it.only('DH - Notifications - Create users and verify scenarios', () => {
    // Initialize test data: ddmm_hhmm seed for unique usernames, base user template, and company name

    const baseUser = Cypress.env('createUser')[0];
    const companyName = Cypress.env('company').toLowerCase();

    const users = {
      user1: {
        firstName: 'NoEmail-NoPhone',
        lastName: `USER1`,
        username: `NoEmailNoPhone`,
        email: '',
        phone: '',
        expected: {
          emailPresent: false,
          phonePresent: false,
        },
      },
      user2: {
        firstName: 'NoEmail-WithPhone',
        lastName: `USER2`,
        username: `NoEmailWithPhone`,
        email: '',
        phone: '+3811100000011',
        expected: {
          emailPresent: false,
          phonePresent: true,
        },
      },
      user3: {
        firstName: 'EmailUnconfirmed-Phone',
        lastName: `USER3`,
        username: `EmailUnconfirmedPhone`,
        email: `email.unconfirmed.phone@yopmail.com`,
        phone: '+3811100000012',
        expected: {
          emailPresent: true,
          phonePresent: true,
          emailConfirmed: false,
        },
      },
      user4: {
        firstName: 'EmailConfirmed-Phone',
        lastName: `USER4`,
        username: `EmailConfirmedPhone`,
        email: `email.confirmed.phone@yopmail.com`,
        phone: '+3811100000013',
        expected: {
          emailPresent: true,
          phonePresent: true,
          emailConfirmed: true,
        },
      },
      user5: {
        firstName: 'EmailConfirmed-NoPhone',
        lastName: `USER5`,
        username: `EmailConfirmedNoPhone`,
        email: `email.confirmed.no.phone@yopmail.com`,
        phone: '',
        expected: {
          emailPresent: true,
          phonePresent: false,
          emailConfirmed: true,
        },
      },
      user6: {
        firstName: 'EmailUnconfirmed-NoPhone',
        lastName: `USER6`,
        username: `EmailUnconfirmedNoPhone`,
        email: `email.unconfirmed.no.phone@yopmail.com`,
        phone: '',
        expected: {
          emailPresent: true,
          phonePresent: false,
          emailConfirmed: false,
        },
      },
    };

    // ====== UTILITY FUNCTIONS ======
    // Normalize cell text by removing extra whitespace and trimming
    const normalizeText = (value) => (value || '').replace(/\s+/g, ' ').trim();

    // Check if table cell is empty (handles EN/DE empty markers)
    const isCellEmpty = (value) => {
      const normalized = normalizeText(value).toLowerCase();
      return (
        normalized === '' ||
        normalized === '-' ||
        normalized === '--' ||
        normalized === 'n/a' ||
        normalized === 'na' ||
        normalized === 'null'
      );
    };

    // Check if email is confirmed (matches EN/DE confirmation indicators)
    const isConfirmedText = (value) =>
      /yes|ja|confirmed|bestatigt|bestätigt|active|aktiv/i.test(
        normalizeText(value),
      );

    // ====== NAVIGATION HELPERS ======
    // Open DH application, login, navigate to Employees, and select company
    const openDhEmployeesForCompany = () => {
      // Visit DH base URL and dismiss cookie dialog if present
      cy.visit(Cypress.env('dh_baseUrl'));
      cy.url().should('include', Cypress.env('dh_baseUrl'));

      cy.get('body').then(($body) => {
        if ($body.find('#onetrust-policy-title').is(':visible')) {
          cy.get('#onetrust-accept-btn-handler').click({ force: true });
        }
      });

      // Login using custom DH login command
      cy.loginToDH();
      cy.wait(2000);
      cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);

      // Navigate to Employees section and intercept API call
      cy.intercept('GET', '**/person/fromGroup/**').as('getEmployees');
      cy.get('#nav-employees').should('be.visible').click({ force: true });
      cy.wait('@getEmployees', { timeout: 35000 }).then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
      });

      // Open company dropdown and select matching company
      cy.get('#employee-select-company').click({ force: true });
      cy.wait(1000);

      cy.get('ul[role="listbox"] > li > span')
        .should('be.visible')
        .then(($options) => {
          const match = [...$options].find((el) =>
            el.textContent.trim().toLowerCase().includes(companyName),
          );

          if (match) {
            cy.wrap(match).click({ force: true });
          } else {
            throw new Error(`No dropdown option contains: ${companyName}`);
          }
        });

      cy.wait(1000);
    };

    // ====== FILTER & SEARCH HELPERS ======
    // Ensure username filter is visible, open if needed
    const ensureUsernameFilterVisible = () => {
      cy.get('body').then(($body) => {
        const filterInput =
          'input[placeholder*="Username"], input[placeholder*="Benutzername"]';

        if (!$body.find(filterInput).is(':visible')) {
          cy.get('button[aria-label="persons.toggleFilters"]').click({
            force: true,
          });
        }
      });

      cy.get(
        'input[placeholder*="Username"], input[placeholder*="Benutzername"]',
      ).should('be.visible');
    };

    // Search for user by username and return the table row
    const searchUserRow = (username) => {
      ensureUsernameFilterVisible();

      // Clear and type username in filter input
      cy.get(
        'input[placeholder*="Username"], input[placeholder*="Benutzername"]',
      )
        .clear()
        .type(username);

      cy.wait(1200);

      cy.contains('tbody > tr td:nth-child(4)', new RegExp(username, 'i'))
        .should('be.visible')
        .parents('tr')
        .first()
        .as('targetUserRow');
    };

    // ====== TABLE MANAGEMENT HELPERS ======
    // Set table pagination to show 50 rows per page
    const setPaginationTo50 = () => {
      cy.get('body').then(($body) => {
        const paginationSelect = $body
          .find('select')
          .filter((_, el) =>
            /10|25|50/i.test((el.textContent || '').replace(/\s+/g, ' ')),
          );

        if (paginationSelect.length > 0) {
          cy.wrap(paginationSelect.first()).select('50', { force: true });
          cy.wait(1000);
        } else {
          cy.log('Pagination dropdown not found, continuing with default size');
        }
      });
    };

    // Close user creation result dialogs (EN/DE support)
    const closeCreatedUserDialogIfPresent = () => {
      cy.get('body').then(($body) => {
        if ($body.find('#dialog-title').length > 0) {
          cy.contains(
            'div[role="dialog"] button, div[role="dialog"] div',
            /Close|Schließen/i,
          )
            .first()
            .click({ force: true });
        }
      });
    };

    // ====== USER CREATION & VERIFICATION HELPERS ======
    // Create user with profile data through multi-step form
    const createUserWithProfile = (profile) => {
      cy.get('#employee-add-employee')
        .should('be.visible')
        .contains(/Neuen Kontakt anlegen|Create New Contact/i)
        .click({ force: true });

      //   cy.get('#create-user-prefixed-title')
      //     .clear()
      //     .type(baseUser.prefixedTitle);
      cy.get('#create-user-firstName')
        .clear()
        .type(profile.firstName || baseUser.firstName);
      cy.get('#create-user-lastName')
        .clear()
        .type(profile.lastName || baseUser.lastName);
      //   cy.get('#create-user-suffixed-title')
      //     .clear()
      //     .type(baseUser.prefixedTitle2);

      cy.get('input[aria-autocomplete="list"]').click({ force: true });
      cy.wait(700);
      cy.get("ul[role='listbox'] > li")
        .should('be.visible')
        .first()
        .click({ force: true });

      // Fill Step 1: Username (account number)
      cy.get('#create-user-accountNumber').clear().type(profile.username);
      cy.get('#create-user-next').click({ force: true });

      // Step 2: Fill phone (conditional on profile)
      if (profile.phone) {
        cy.get('#create-user-mobileNumber').clear().type(profile.phone);
      } else {
        cy.get('#create-user-mobileNumber').clear();
      }

      // Step 2: Fill email (conditional on profile)
      if (profile.email) {
        cy.get('#create-user-email').clear().type(profile.email);
      } else {
        cy.get('#create-user-email').clear();
      }

      // Step 2: Fill address fields from base user template
      //   cy.get('#create-user-street').clear().type(baseUser.streetName);
      //   cy.get('#create-user-streetNumber').clear().type(baseUser.streetNumber);
      //   cy.get('#create-user-apartment').clear().type(baseUser.doorNumber);
      //   cy.get('#create-user-zipCode').clear().type(baseUser.zipCode);
      //   cy.get('#create-user-city').clear().type(baseUser.city);

      // Proceed to Step 3
      cy.get('#create-user-next').click({ force: true });
      cy.wait(800);

      //   cy.get('#create-user-deliveryType').then(($dropdown) => {
      //     const isDisabled =
      //       $dropdown.attr('aria-disabled') === 'true' ||
      //       $dropdown.hasClass('Mui-disabled') ||
      //       $dropdown.find('.Mui-disabled').length > 0;

      //     if (!isDisabled) {
      //       cy.wrap($dropdown).click({ force: true });
      //       cy.get("ul[role='listbox'] > li > span")
      //         .contains(/^digital$/i)
      //         .click({ force: true });
      //     }
      //   });

      //   cy.get('#create-user-sendCredentials').then(($dropdown) => {
      //     const isDisabled =
      //       $dropdown.attr('aria-disabled') === 'true' ||
      //       $dropdown.hasClass('Mui-disabled') ||
      //       $dropdown.find('.Mui-disabled').length > 0;

      //     if (!isDisabled) {
      //       cy.wrap($dropdown).click({ force: true });
      //       cy.get("ul[role='listbox'] > li > span")
      //         .contains(/^digital$/i)
      //         .click({ force: true });
      //     }
      //   });

      // Intercept save API and click Create button
      cy.intercept('POST', '**/editPerson').as('editPerson');
      cy.get('#create-user-create')
        .contains(/Create|Erstellen/i)
        .click({ force: true });

      // Wait for user creation to complete
      cy.wait('@editPerson', { timeout: 20000 }).then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 201]);
      });

      // Close New User Access Data download dialog
      cy.get('#create-user-close').should('be.visible').click({ force: true });
      cy.wait(1000);

      // Close any remaining dialogs and wait for page to stabilize
      closeCreatedUserDialogIfPresent();
      cy.wait(1500);
    };

    // Verify user was created correctly with expected email/phone/confirmation status
    const assertUserRow = (profile, scenarioLabel) => {
      searchUserRow(profile.username);

      // Verify table row data matches expectations
      cy.get('@targetUserRow').within(() => {
        // Verify email column (td:eq(4))
        cy.get('td')
          .eq(4)
          .invoke('html')
          .then((emailHtml) => {
            cy.log(`[EMAIL] Raw HTML: ${emailHtml}`);
          });
        cy.get('td')
          .eq(4)
          .invoke('text')
          .then((emailText) => {
            cy.log(`[EMAIL] Raw text: "${emailText}"`);
            const normalized = normalizeText(emailText);
            cy.log(`[EMAIL] Normalized: "${normalized}"`);
            const hasEmail = !isCellEmpty(emailText);
            cy.log(
              `[EMAIL] Has value: ${hasEmail} | Expected: ${profile.expected.emailPresent}`,
            );
            expect(hasEmail, `${scenarioLabel}: email presence mismatch`).to.eq(
              profile.expected.emailPresent,
            );
          });

        // Verify phone column (td:eq(5))
        cy.get('td')
          .eq(5)
          .invoke('html')
          .then((phoneHtml) => {
            cy.log(`[PHONE] Raw HTML: ${phoneHtml}`);
          });
        cy.get('td')
          .eq(5)
          .invoke('text')
          .then((phoneText) => {
            cy.log(`[PHONE] Raw text: "${phoneText}"`);
            const normalized = normalizeText(phoneText);
            cy.log(`[PHONE] Normalized: "${normalized}"`);
            const hasPhone = !isCellEmpty(phoneText);
            cy.log(
              `[PHONE] Has value: ${hasPhone} | Expected: ${profile.expected.phonePresent}`,
            );
            expect(hasPhone, `${scenarioLabel}: phone presence mismatch`).to.eq(
              profile.expected.phonePresent,
            );
          });

        // Verify email confirmation status (td:eq(6)) - Email Active column
        if (
          Object.prototype.hasOwnProperty.call(
            profile.expected,
            'emailConfirmed',
          )
        ) {
          cy.get('td')
            .eq(6)
            .invoke('html')
            .then((emailActiveHtml) => {
              cy.log(`[EMAIL_ACTIVE] Raw HTML: ${emailActiveHtml}`);
            });
          cy.get('td')
            .eq(6)
            .invoke('text')
            .then((emailActiveText) => {
              cy.log(`[EMAIL_ACTIVE] Raw text: "${emailActiveText}"`);
              const normalized = normalizeText(emailActiveText);
              cy.log(`[EMAIL_ACTIVE] Normalized: "${normalized}"`);
              const isConfirmed = isConfirmedText(emailActiveText);
              cy.log(
                `[EMAIL_ACTIVE] Is confirmed: ${isConfirmed} | Expected: ${profile.expected.emailConfirmed}`,
              );
              expect(
                isConfirmed,
                `${scenarioLabel}: email confirmation mismatch (actual="${emailActiveText}", expected=${profile.expected.emailConfirmed})`,
              ).to.eq(profile.expected.emailConfirmed);
            });
        }
      });
    };

    // ====== YOPMAIL EMAIL CONFIRMATION HELPER ======
    // Navigate to Yopmail inbox and confirm email (based on DH_EG_03_Employees_TS_Create_EBox_User_Manually)
    const confirmEmailInYopmail = (emailAddress) => {
      cy.visit('https://yopmail.com/en/');
      // Enter email address and refresh inbox
      cy.get('#login').clear().type(emailAddress);
      cy.get('#refreshbut > .md > .material-icons-outlined').click({
        force: true,
      });
      cy.wait(1500);

      // Click on first email in inbox using subject selector
      cy.iframe('#ifinbox')
        .find('.mctn > .m > button > .lms')
        .first()
        .click({ force: true });

      cy.wait(1500);

      // Find and validate confirmation link exists
      cy.iframe('#ifmail')
        .find(
          '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span>a',
        )
        .should('include.text', 'Jetzt E-Mail Adresse bestätigen')
        .invoke('attr', 'href')
        .then((href) => {
          cy.log(`Confirmation link: ${href}`);
        });

      // Click confirmation link with target='_self' to prevent new tab
      cy.iframe('#ifmail')
        .find(
          '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span>a',
        )
        .invoke('attr', 'target', '_self')
        .click({ force: true });

      // Wait for confirmation page to load and redirect
      cy.wait(15000);

      // Handle cookie dialog on confirmation page if present
      cy.iframe('#ifmail').then(($iframe) => {
        if ($iframe.find('#onetrust-policy-title').is(':visible')) {
          cy.wrap($iframe)
            .find('#onetrust-accept-btn-handler')
            .click({ force: true });
          cy.log('Cookie dialog closed.');
        } else {
          cy.log('Cookie dialog not visible.');
        }
      });

      cy.wait(1500);

      // Click confirmation button on success page
      cy.wait(8000);
      cy.iframe('#ifmail').find('.button').click({ force: true });

      // Refresh inbox and clear all emails for this mailbox
      cy.get('#refresh').click({ force: true });
      cy.wait(2000);

      const inboxMessageSelector = '.mctn .lm, .mctn .m';

      // Check inbox content first, then delete only if messages exist
      cy.get('iframe#ifinbox').then(($iframe) => {
        const $inboxBody = $iframe.contents().find('body');
        const initialCount = $inboxBody.find(inboxMessageSelector).length;
        cy.log(`Initial inbox message count: ${initialCount}`);

        if (initialCount > 0) {
          cy.get('#delall', { timeout: 10000 }).then(($btn) => {
            const isDisabled =
              $btn.is(':disabled') ||
              $btn.attr('disabled') !== undefined ||
              $btn.attr('aria-disabled') === 'true';

            if (!isDisabled) {
              cy.wrap($btn).click({ force: true });
              cy.log('Delete all clicked.');
            } else {
              cy.log('Delete all is disabled while messages exist.');
            }
          });
        } else {
          cy.log('Inbox already empty.');
        }
      });

      // Reload and retry delete one more time if anything remains
      cy.wait(1200);
      cy.get('#refresh').click({ force: true });
      cy.wait(1800);

      cy.get('iframe#ifinbox').then(($iframe) => {
        const $inboxBody = $iframe.contents().find('body');
        const remainingCount = $inboxBody.find(inboxMessageSelector).length;
        cy.log(
          `Remaining inbox message count after first delete: ${remainingCount}`,
        );

        if (remainingCount > 0) {
          cy.get('#delall', { timeout: 10000 }).click({ force: true });
          cy.wait(1000);
          cy.get('#refresh').click({ force: true });
          cy.wait(1800);
        }
      });

      // Final assertion: inbox must be empty
      cy.get('iframe#ifinbox').then(($iframe) => {
        const $inboxBody = $iframe.contents().find('body');
        const finalCount = $inboxBody.find(inboxMessageSelector).length;
        cy.log(`Final inbox message count: ${finalCount}`);
        expect(finalCount, `Inbox for ${emailAddress} should be empty`).to.eq(
          0,
        );
      });
    };

    // ====== MAIN FLOW ORCHESTRATOR ======
    // End-to-end flow: create user -> set pagination -> [optional: confirm email] -> verify
    const processUserScenario = (
      profile,
      scenarioLabel,
      shouldConfirmEmail,
    ) => {
      createUserWithProfile(profile);
      setPaginationTo50();

      // If user email requires confirmation, go through Yopmail flow
      if (shouldConfirmEmail) {
        confirmEmailInYopmail(profile.email);
        openDhEmployeesForCompany();
        setPaginationTo50();
      }

      // Verify user data in Employees table
      assertUserRow(profile, scenarioLabel);
    };

    // ====== TEST EXECUTION ======
    // Open DH Employees page and run through all 6 user scenarios sequentially
    openDhEmployeesForCompany();

    // USER1: No email + No phone (system auto-generates email)
    processUserScenario(
      users.user1,
      'USER1 - no email + no phone -> email only',
      false,
    );

    // USER2: No email + With phone (email shown by system, phone not shown)
    processUserScenario(users.user2, 'USER2 - no email + have phone', false);

    // USER3: Email unconfirmed + Phone
    processUserScenario(
      users.user3,
      'USER3 - email not confirmed + phone',
      false,
    );

    // USER4: Email confirmed + Phone (confirm via Yopmail first)
    processUserScenario(
      users.user4,
      'USER4 - email confirmed + have phone',
      true,
    );

    // USER5: Email confirmed + No phone (confirm via Yopmail first)
    processUserScenario(
      users.user5,
      'USER5 - email confirmed + no phone',
      true,
    );

    // USER6: Email unconfirmed + No phone
    processUserScenario(
      users.user6,
      'USER6 - email not confirmed + no phone',
      false,
    );
  });

  //DH Send Delivery to Specific users
  it.only('DH Send Delivery to selected-specific users', () => {
    // ===== STEP 1: Login to DocumentHub =====
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.url().should('include', Cypress.env('dh_baseUrl'));

    // Remove Cookie dialog if present
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      } else {
        cy.log('Cookie bar not visible');
      }
    });

    // Login to DocumentHub using custom command
    cy.loginToDH();
    cy.wait(2000);
    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);
    cy.wait(1500);

    // Click on Single Person Upload button
    cy.get('#workspace-single-person-upload')
      .should('be.visible') // Ensure the elements are visible
      .each(($el) => {
        // Iterate through each of the elements
        // Check if the text matches either "Single Person Upload" or "Einzelperson Hochladen"
        if ($el.text().match(/Single Perso|Einzelperson Hochladen/i)) {
          // Highlight the element for debugging (optional)
          cy.wrap($el).invoke(
            'attr',
            'style',
            'border: 2px solid black; padding: 2px;',
          );
          cy.wait(2000);
          // Click the element
          cy.wrap($el).click({ force: true });
        }
      });

    //Check dialog title
    cy.get('main>header>h1')
      .should('be.visible')
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Send Delivers To Select Users|Dokumente an ausgewählte Benutzer senden/i,
        );
      });

    cy.wait(1500);

    //Validate subtitle
    cy.get('main>p')
      .should('be.visible')
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Upload Document for selected users|Dokumente für ausgewählte Benutzer hochladen/i,
        );
      });

    //check Info message under upload area
    cy.get('#file-requirements')
      .should('be.visible') // Ensure the elements are visible
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Only .pdf files up to 13 pages allowed for printing|Nur .pdf bis zu 13 Seiten beim Druck zulässig/i,
        );
      });

    cy.wait(1500);
    //upload invalid PDF file
    cy.DHcreateNewUser_viaCSV();
    cy.wait(2000);

    //check Error message for upload invalid file
    cy.get('#file-list span')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Only pdf files are supported|Es werden nur PDF-Dateien unterstützt/i,
        );
      });
    cy.wait(1500);

    //Remove invalid uploaded file
    cy.get('button[aria-label="Remove 1_createUser.csv"]').click();
    cy.wait(1500);

    //Upload valid PDF file
    cy.DHmassUpload();
    cy.wait(2000);

    // Capture the current date and time in the specified format
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0'); // Ensure two digits
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = now.getFullYear();
    const formattedDate = `${day}.${month}.${year}`; // Ensures dd.mm.yyyy format

    const formattedTime = now
      .toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      .trim(); // Trim to remove leading spaces

    uploadDateTime = `${formattedDate} ${formattedTime}`; // Store the value in a variable
    cy.log(`Upload DateTime: ${uploadDateTime}`); // Log the stored uploadDateTime

    //// ===== VALIDATE "Select company" DROPDOWN =====

    // Validate label for company dropdown
    cy.get('section label')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();
        expect(trimmedText).to.match(/Select company|Firma auswählen/i);
      });
    cy.wait(1500);
    // Open Company dropdown
    cy.get('main >section div[role="combobox"]').click({ force: true });
    cy.wait(1000);

    // Define companies to select from dropdown
    const toCompanies = ['AQUA GmbH'];

    // Wait for dropdown options to appear and locate the list container
    cy.get('[role="listbox"], [role="menu"], ul[role="presentation"]')
      .should('be.visible') // Ensure dropdown is visible
      .find('li, [role="option"]') // Find all list items in the dropdown
      .each(($option) => {
        // Iterate through each dropdown option
        const text = $option.text().trim(); // Extract and trim the option text
        cy.log(`Found option: ${text}`); // Log each found option for debugging

        // Check if current option matches any company in toCompanies array
        if (toCompanies.includes(text)) {
          cy.log(`Matching company found: ${text}`); // Log when match is found

          // Find and select AQUA company from dropdown
          cy.wrap($option)
            .find('span') // Locate checkbox element
            .then(($checkbox) => {
              // Check if checkbox element exists
              if ($checkbox.length > 0) {
                // Determine if checkbox is already checked (multiple attribute checks)
                const isChecked =
                  $checkbox.is(':checked') || // Standard checked state
                  $checkbox.attr('aria-checked') === 'true' || // ARIA checked state
                  $checkbox.attr('data-checked') === 'true'; // Custom data attribute

                // Click checkbox only if not already checked
                if (!isChecked) {
                  cy.wrap($checkbox).click({ force: true }); // Force click to enable
                  cy.log(`Checkbox for "${text}" enabled`); // Log success
                } else {
                  cy.log(`Checkbox for "${text}" already enabled`); // Log already enabled
                }
              } else {
                // If no checkbox found, click the option itself (some dropdowns work this way)
                cy.wrap($option).click({ force: true }); // Click the entire option
                cy.log(`Clicked option "${text}"`); // Log option click
              }
            });
        }
      });

    cy.wait(1000); // Wait for selection to be processed
    // Close dropdown by pressing ESC key
    cy.get('body').type('{esc}'); // Send ESC key to body to close dropdown
    cy.wait(500); // Wait for dropdown to close

    // Validate label for Subject input field
    cy.get('section label')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();
        expect(trimmedText).to.match(/Subject|Betreff/i);
      });
    cy.wait(1500);

    //Check if Subject field is mandatory
    cy.get('input[placeholder="Enter the subject"]')
      .should('be.visible')
      .click()
      .clear() // Ensure field is empty
      .blur(); // Use blur() instead of focusOut()

    cy.wait(500);

    //Check validation message for Subject field
    cy.get('div[role="alert"]')
      .should('be.visible') // Ensure the elements are visible
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Subject field is mandatory|Betreff-Feld ist obligatorisch/i,
        );
      });

    cy.wait(1500);

    // Add Delivery Title/Subject
    const title = `Document To Specific Person (pdf) - ${uploadDateTime}`;
    cy.log(`Title for the document: ${title}`); // Log the title to check

    cy.get('input[placeholder="Enter the subject"]').clear().type(title);
    cy.wait(1500);

    cy.findByPlaceholderText(/select recipients/i).click({ force: true });

    // Select recipient(s) from visible dropdown list
    const recipientValue = [
      'USER1 NoEmail-NoPhone (NoEmailNoPhone)',
      'USER2 NoEmail-WithPhone (NoEmailWithPhone)',
      'USER3 EmailUnconfirmed-Phone (EmailUnconfirmedPhone)',
      'USER4 EmailConfirmed-Phone (EmailConfirmedPhone)',
      'USER5 EmailConfirmed-NoPhone (EmailConfirmedNoPhone)',
      'USER6 EmailUnconfirmed-NoPhone (EmailUnconfirmedNoPhone)',
    ];

    // normalize all recipients once
    const recipientNeedles = recipientValue.map((v) =>
      v.toLowerCase().replace(/\s+/g, ''),
    );

    cy.get('ul[role="listbox"], [role="listbox"], .MuiAutocomplete-popper')
      .filter(':visible')
      .first()
      .should('be.visible')
      .within(() => {
        cy.get('li, [role="option"]')
          .should('have.length.greaterThan', 0)
          .then(($options) => {
            recipientNeedles.forEach((needle, index) => {
              const originalText = recipientValue[index];

              const match = [...$options].find((el) => {
                const rawText = (el.textContent || '').trim();
                const normalized = rawText.toLowerCase().replace(/\s+/g, '');
                return normalized.includes(needle);
              });

              expect(match, `Recipient option "${originalText}" was not found`)
                .to.exist;

              cy.wrap(match)
                .scrollIntoView()
                .then(($row) => {
                  const $checkbox = $row.find(
                    'input[type="checkbox"], [role="checkbox"]',
                  );

                  if ($checkbox.length > 0) {
                    cy.wrap($checkbox).first().click({ force: true });
                  } else {
                    cy.wrap($row).click({ force: true });
                  }
                });
            });
          });
      });

    cy.log(`Upload DateTime to verify: ${uploadDateTime}`);

    cy.intercept('POST', '**/deliveryHandler/checkDocumentProcessingStatus').as(
      'processDocuments',
    );

    //Click on Mass Upload - Weiter button
    cy.get('#upload').should('be.enabled').click();

    cy.wait('@processDocuments', { timeout: 50000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('Documents processed successfully');
    });
    cy.wait(1500);
    //Check Success message after document processing
    cy.get('#document-uploaded')
      .should('be.visible')
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Document successfully uploaded|Dokument erfolgreich hochgeladen/i,
        );
      });

    cy.wait(1500);

    //Click on button to Send Mass delivery
    cy.get('#cancel').should('be.enabled').click();
    cy.wait(1500);

    // Verify confirm sending documents dialog title
    cy.get('#dialog-title')
      .should('be.visible')
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Confirm sending documents|Bestätigung des Versands/i,
        );
      });

    //Verify confirm sending documents dialog content
    cy.get('div[aria-labelledby="dialog-title"] .MuiTypography-body1')
      .should('be.visible')
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        const isEnglishText = trimmedText
          .toLowerCase()
          .includes(
            'by using this feature documents will be sent to all active users',
          );
        const isGermanText = trimmedText
          .toLowerCase()
          .includes(
            'durch die nutzung dieser funktion werden dokumente an alle aktiven benutzer gesendet',
          );
        expect(
          isEnglishText || isGermanText,
          'Dialog should show confirmation message in English or German',
        ).to.be.true;
      });

    //Comfirm sending documents by clicking on confirm button in dialog
    cy.get('div[aria-labelledby="dialog-title"] button')
      .should('be.visible')
      .each(($button) => {
        const buttonText = $button.text().trim();
        cy.log(`Found button: ${buttonText}`);

        // Check if button text matches Confirm (English) or Bestätigen (German)
        if (buttonText.match(/Confirm|Bestätigen/i)) {
          cy.log(`Clicking button: ${buttonText}`);
          cy.wrap($button).click({ force: true });
          return false; // Stop iteration after finding the match
        }
      });
    cy.wait(2000);

    //Close latest dialog - Click on Fertig button
    cy.get('button[type="button"]')
      .should('be.visible')
      .each(($button) => {
        const buttonText = $button.text().trim();
        cy.log(`Found button: ${buttonText}`);

        // Check if button text matches Fertig (German) or Done/Finish (English)
        if (buttonText.match(/Fertig|Done|Finish/i)) {
          cy.log(`Clicking button: ${buttonText}`);
          cy.wrap($button).click({ force: true });
          return false; // Stop iteration after finding the match
        }
      });

    cy.wait(1000);

    //Validate Home page url
    const baseUrl = Cypress.env('dh_baseUrl');
    cy.url().should('include', `${baseUrl}home`);

    // Logout from DH
    cy.get('.MuiButton-text').click();
    cy.wait(1000);
    cy.get('li[role="menuitem"]')
      .contains(/Abmelden|Logout/i)
      .click();
    cy.url().should('include', Cypress.env('dh_baseUrl'));
    cy.log('Upload finished successfully.');
    cy.wait(2500);
  }); //end it

  it.only('DH - Check Activity Notifications in activity logs', () => {
    // ===== STEP 1: Login to DocumentHub =====
    cy.visit(Cypress.env('dh_baseUrl'));
    cy.url().should('include', Cypress.env('dh_baseUrl'));
    // Remove Cookie dialog if present
    cy.get('body').then(($body) => {
      if ($body.find('#onetrust-policy-title').is(':visible')) {
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
      } else {
        cy.log('Cookie bar not visible');
      }
    });
    // Login to DocumentHub using custom command
    cy.loginToDH();
    cy.wait(2000);
    cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);
    cy.wait(1500);

    //Click on Search-Lens icon (EN/DE)
    cy.get(
      'button[aria-label="Toggle filters"], button[aria-label="Filter umschalten"]',
    )
      .first()
      .click({ force: true });
    cy.wait(500);

    //Filter by Activity type (placeholder depends on selected language)
    cy.get('input[placeholder*="Activity"], input[placeholder*="Aktivität"]')
      .filter(':visible')
      .first()
      .as('activityInput')
      .click({ force: true });
    cy.wait(500);

    //Select Notification activity (EN/DE)
    cy.get('body').then(($body) => {
      const popup = $body.find(
        '[role="listbox"], .MuiAutocomplete-popper, .MuiPaper-root',
      );

      if (popup.length > 0) {
        cy.get('[role="listbox"], .MuiAutocomplete-popper, .MuiPaper-root')
          .filter(':visible')
          .first()
          .within(() => {
            cy.contains(
              'li, [role="option"], span, div',
              /Notification|Benachrichtigung/i,
            )
              .first()
              .click({ force: true });
          });
      } else {
        cy.contains(
          'li, [role="option"], span, div',
          /Notification|Benachrichtigung/i,
        )
          .filter(':visible')
          .first()
          .click({ force: true });
      }
    });

    // Close dropdown to apply filter
    cy.get('body').type('{esc}');
    cy.wait(1000);

    // Verify Notification criterion is selected
    cy.get('@activityInput')
      .parents('div')
      .first()
      .parent()
      .should('contain.text', 'Notification');

    // Verify filtered results exist
    cy.get('tbody > tr').should('have.length.greaterThan', 0);

    // Verify each row log belongs to notification-related entries (EN/DE)
    cy.get('tbody > tr').each(($row) => {
      cy.wrap($row)
        .find('td')
        .eq(3)
        .invoke('text')
        .then((logText) => {
          const normalized = (logText || '')
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim();
          expect(
            normalized,
            `Unexpected log text for Notification filter: ${logText}`,
          ).to.match(/notification|benachrichtigung/);
        });
    });
  }); //end it

  //Delete Alredy created Users by Master User
  it('Login As Master User - Delete Alredy created Users', () => {
    // Login as Master User using a custom command
    const user = Cypress.env('createUser')[0];
    cy.loginToSupportViewMaster();
    cy.wait(3500);

    //Remove pop up
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(1500);

    //Search for Group by Display Name
    cy.get('#searchButton>span').click(); //Click on search button
    // Use the company name from the cypress.config.js
    const companyName = Cypress.env('company');
    // Search for Group by Display Name using the company name
    cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
      .eq(1)
      .type(companyName);
    //Find the Search button by button name and click on it
    cy.get('.search-dialog>form>div>.mat-primary').click();
    //Switch to user section
    cy.get('.action-buttons > .mdc-button').eq(4).click();

    // Array of users to delete
    const usersToDelete = [
      'aquaNoEmailNoPhone',
      'aquaNoEmailWithPhone',
      'aquaEmailUnconfirmedPhone',
      'aquaEmailConfirmedPhone',
      'aquaEmailConfirmedNoPhone',
      'aquaEmailUnconfirmedNoPhone',
    ];

    // usersToDelete.forEach((userName, index) => {
    //   // Function to search for and delete a user
    //   const searchAndDeleteUser = (userName) => {
    //     // Search for the user
    //     cy.get('.search-label').click();

    //     // Type the username as a search criterion
    //     cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
    //       .clear() // Clear any previous input
    //       .type(userName);

    //     // Click on the submit button to search
    //     cy.get('button[type="submit"]').click();

    //     // Wait for search results to load (adjust as needed for dynamic loading)
    //     cy.get('body').then(($body) => {
    //       if ($body.find('.no-results-message').length > 0) {
    //         // If the user doesn't exist or is already deleted
    //         cy.log(`User ${userName} not found or already deleted.`);

    //         // Reset the search by clicking on the reset button
    //         cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click();

    //         // Proceed with the next search criteria
    //         if (index < usersToDelete.length - 1) {
    //           cy.log(
    //             `Proceeding with the next user: ${usersToDelete[index + 1]}`
    //           );
    //         }
    //       } else {
    //         // If the user is found, proceed with the deletion
    //         cy.log(`User ${userName} found. Proceeding with deletion.`);

    //         // Click the delete button (adjust the selector as per your app)
    //         cy.get('button')
    //           .contains(/Delete|DSGVO-Löschung/)
    //           .click();
    //         cy.wait(2000);
    //         // Confirm delete in the confirmation dialog
    //         cy.get('.confirm-buttons > button')
    //           .filter((index, button) => {
    //             return (
    //               Cypress.$(button).text().trim() === 'YES' ||
    //               Cypress.$(button).text().trim() === 'JA'
    //             );
    //           })
    //           .click();
    //         cy.wait(2000);
    //         // Log the deletion
    //         cy.log(`User ${userName} has been deleted.`);

    // Array of users to delete
    //const usersToDelete = ['manualAddress', 'manualNoAddress'];

    usersToDelete.forEach((userName) => {
      const searchAndDeleteUser = (userName) => {
        cy.get('.search-label').click();

        // Search for the user
        cy.get('.mat-mdc-form-field-infix>input[formcontrolname="userName"]')
          .clear()
          .type(userName);
        cy.get('button[type="submit"]').click();

        // Wait for the search results
        cy.wait(2000);

        // Check if "No results" message exists (indicating user does not exist)
        cy.get('body').then(($body) => {
          if ($body.find('.cdk-row').length === 0) {
            cy.log(`User ${userName} not found or already deleted.`);
            cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click();
          } else {
            // If user exists, proceed with deletion
            cy.get('cdk-row').should('exist');
            cy.log(`User ${userName} found. Proceeding with deletion.`);

            cy.get('button')
              .contains(/Delete|DSGVO-Löschung/)
              .should('be.visible')
              .click();

            // Wait for confirmation dialog and confirm deletion
            cy.get('.confirm-buttons > button')
              .contains(/YES|JA/)
              .should('be.visible')
              .click();

            cy.log(`User ${userName} has been deleted.`);

            // Reset the search to clear out the search pill
            //  cy.get('.mdc-evolution-chip__cell--trailing > .mat-icon').click();
          }
        });
      };
      cy.wait(1500);
      searchAndDeleteUser(userName);

      // Optional wait between deletions (if needed)
      cy.wait(1000);
    });

    //Search for just deleted Admin user
    cy.get('#searchButton').click({ force: true });
    cy.wait(1500);

    cy.get('button[type="submit"]').click(); //Click on Search button
    cy.wait(2500);

    //Already deleted Admin user is not founded

    cy.get('.mat-mdc-paginator-range-actions>.mat-mdc-paginator-range-label')
      .invoke('css', 'border', '1px solid blue')
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(/0 of 0|0 von 0/);
        //    });

        cy.wait(2500);
        //     }
        //     });
        //    };
        // Call the function to search and delete user
        //  searchAndDeleteUser(userName);

        // Optional wait between deletions (if needed)
        cy.wait(1000);
      });

    //Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.url();
    cy.url().should('include', Cypress.env('baseUrl')); // Validate url
    cy.wait(1500);
    // Completion message at the end of the test
    cy.log('The tests have been completed successfully.');
    cy.wait(3000);
  }); //end it
});
