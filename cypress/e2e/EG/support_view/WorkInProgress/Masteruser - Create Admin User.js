describe('Masteruser - Create Admin User', () => {
  // Click on Admin User button
  function clickOnAdminUserButton() {
    const collectedButtonTexts = []; // Array to store all link texts

    cy.get('.ng-star-inserted>.action-buttons>button')
      .find('.mdc-button__label')
      .each(($el) => {
        cy.wrap($el)
          .invoke('text')
          .then((text) => {
            collectedButtonTexts.push(text.trim()); // Collect each link text in the array
            cy.log('Collected Button Text:', text.trim());
          });
      })
      .then(() => {
        const isAdminUserButton = collectedButtonTexts.some((text) =>
          ['Admin User', 'Admin Benutzer'].includes(text)
        );
        //Check if Admin has access to HR page in SW
        if (isAdminUserButton) {
          // Find the specific elements and click on it
          cy.get('.ng-star-inserted>.action-buttons>button')
            .contains(/Admin User|Admin Benutzer/)
            .click({ force: true });
        }
      });
    cy.wait(1500);
  }

  // clickRoleRechteButtonForAquaUser
  function clickRoleRechteButtonForAquaUser() {
    // Locate the row that contains the user "Aqua"
    cy.wait(1500);
    cy.get('sv-table>cdk-table>cdk-row>.cdk-column-firstName') // Assumes each user is in a table row
      .contains('.cdk-column-firstName', 'Aqua') // Find the cell that contains "Aqua" in the Vorname column
      .parent() // Get the row containing this cell
      .within(() => {
        // Now, within this row, find the "Role | Rechte" button and click it
        cy.contains(/Rechte|Rights/i) // Find the button that contains the text "Rechte" or "Role"
          .click(); // Click the button
      });
  }

  // Enable HR-Manager and Disable DataSubmitter roles
  function enableHrAndDisableDataSubmitterRoles() {
    // Enable HR Role
    cy.get('#mat-mdc-checkbox-5-input').then(($checkboxInput) => {
      if (!$checkboxInput.is(':checked')) {
        // If the HR Role is not checked, enable it
        cy.get('#mat-mdc-checkbox-5-input').click({ force: true });
        cy.log('Checkbox was not enabled, now enabled.');
        cy.wait(1500);
      } else {
        // HR Role is enabled
        cy.log('Checkbox is already enabled.');
        cy.wait(1500);
      }
    });
    cy.wait(1500);
    //Disable Data Submitter Role
    cy.get('#mat-mdc-checkbox-3-input').then(($checkboxInput) => {
      if ($checkboxInput.is(':checked')) {
        // If the Data Submitter Role is checked, uncheck it
        cy.get('#mat-mdc-checkbox-3-input').click({ force: true });
        cy.log('Checkbox was enabled, now disabled.');
        cy.wait(2500);
        // Save changes in the Admin's Role dialog
        cy.get('button[type="submit"]').click();
      } else {
        // If the Data Submitter Role is disabled, close the Rights dialog
        cy.log('Checkbox is already disabled.');
        cy.wait(2500);
        cy.get('.close[data-mat-icon-name="close"]').click();
      }
    });
  }

  // Admin User has check New Delivery In HR Pag
  function checkNewDeliveryInHrPage() {
    const collectedLinkTexts = []; // Array to store all link texts

    cy.get('.side-menu>ul>navigation-item>.navigation-item>a')
      .find('.user-label-wrap')
      .each(($el) => {
        cy.wrap($el)
          .invoke('text')
          .then((text) => {
            collectedLinkTexts.push(text.trim()); // Collect each link text in the array
            cy.log('Collected Link Text:', text.trim());
          });
      })
      .wait(2500)
      .then(() => {
        // After collecting all link texts, perform a single check
        const hasAccessToHRPage = collectedLinkTexts.some((text) =>
          ['Erhaltene Sendungen', 'Received Shipments'].includes(text)
        );
        //Check if Admin has access to HR page in SW
        if (hasAccessToHRPage) {
          // Find the specific elements and check their visibility
          cy.get('.side-menu>ul>navigation-item>.navigation-item>a')
            .contains(/Erhaltene Sendungen|Received Shipments/)
            .should('be.visible')
            .click();
          cy.log('Confirmed: HR page link is visible to the Admin.'); // Log if HR page access is detected
          cy.wait(2500);
        } else {
          // Verify that elements with specified texts are not visible
          cy.get('.side-menu>ul>navigation-item>.navigation-item>a')
            .contains(/Erhaltene Sendungen|Received Shipments/)
            .should('not.exist');
          cy.log('Confirmed: HR page link is not visible to the Admin.'); // Log if HR page access is not detected
          cy.wait(2500);
        }
      });
  }

  function adminUserChecksNewDeliveryReceivedInHRpage() {
    cy.fixture('supportView.json').as('payslipSW');
    // cy.get('@payslipSW').then((payslipJson) => {
    //   cy.visit(payslipJson.baseUrl); // Visit base URL from fixture
    //   cy.url().should('include', payslipJson.baseUrl); // Validate the URL
    cy.fixture('supportView.json').as('payslipSW');

    cy.get('@payslipSW').then((payslipJson) => {
      cy.visit(payslipJson.baseUrl_04, {
        failOnStatusCode: false,
      });

      // Login to SW as Admin User
      cy.get('input[formcontrolname="username"]').type(
        payslipJson.username_supportViewAdmin
      );
      cy.get('input[formcontrolname="password"]').type(
        payslipJson.password_supportViewAdmin
      );
      cy.get('button[type="submit"]').click();
      // Wait for login to complete
      cy.wait(1500);

      //Switch to HR page
      checkNewDeliveryInHrPage();

      // Validate latest HR delivery
      cy.log('Checking for the latest HR delivery received date for AQUA GmbH');

      //   //Sort by Date-Desc
      //   cy.get('.cdk-header-cell>.header-wrap')
      //   .filter((index, el) => {
      //     const text = Cypress.$(el).text().trim();
      //     return text === 'Date' || text === 'Datum';
      //   })
      //   .click();
      // cy.wait(1500);

      // Identify the "Date" or "Datum" header
      cy.get('.cdk-header-cell>.header-wrap')
        .filter((index, el) => {
          const text = Cypress.$(el).text().trim();
          return text === 'Date' || text === 'Datum';
        })
        .first()
        .then(($header) => {
          // Check the arrow orientation
          cy.wrap($header)
            .find('mat-icon[data-mat-icon-name="sort"]')
            .invoke('attr', 'class')
            .then((arrowClass) => {
              const isArrowUp = arrowClass.includes('arrow-up'); // Adjust based on actual class
              if (isArrowUp) {
                // Click to sort in descending order
                cy.wrap($header).click();
                cy.log('Sorted by Date in descending order.');
                cy.wait(1500); // Wait for sorting to take effect
              } else {
                cy.log('Already sorted by Date in descending order.');
              }
            });
        });

      // Find the row with Company Name "AQUA GmbH" and get the corresponding Datum
      cy.get('cdk-table>cdk-row').each(($row) => {
        cy.wrap($row)
          .find('.cdk-column-companyName')
          .eq(0)
          .invoke('text')
          .then((companyName) => {
            if (companyName.trim() === 'AQUA GmbH') {
              // If companyName matches, get the date from the corresponding Datum cell
              cy.wrap($row)

                .find(
                  '.cdk-column-userDataUpdateDate .cell-content-wrap .inline-div > div'
                )

                .invoke('text')
                .then((receivedDateText) => {
                  // Log original received date text
                  cy.log(`Original Received Date Text: ${receivedDateText}`);

                  // Extract date and time parts
                  const datePart = receivedDateText.trim().split(' ')[0]; // "dd.mm.yyyy"
                  const timePart = receivedDateText
                    .trim()
                    .split(' ')[1]
                    .slice(0, 5); // "hh:mm" (removing seconds)

                  // Format to match "dd.mm.yyyy hh:mm" with leading zeros
                  const [day, month, year] = datePart
                    .split('.')
                    .map((v) => v.padStart(2, '0'));
                  const formattedReceivedDate = `${day}.${month}.${year} ${timePart}`;
                  cy.log(`Formatted Received Date: ${formattedReceivedDate}`);

                  // Parse uploadDateTime with consistent formatting
                  const [uploadDay, uploadMonth, uploadYear] = uploadDateTime
                    .split(' ')[0]
                    .split('.');
                  const [uploadHour, uploadMinute] = uploadDateTime
                    .split(' ')[1]
                    .split(':');
                  const formattedUploadDate = `${uploadDay.padStart(
                    2,
                    '0'
                  )}.${uploadMonth.padStart(
                    2,
                    '0'
                  )}.${uploadYear} ${uploadHour}:${uploadMinute}`;

                  // Create tolerance range by adding 1 minute
                  const uploadDate = new Date(
                    uploadYear,
                    uploadMonth - 1,
                    uploadDay,
                    uploadHour,
                    uploadMinute
                  );
                  const uploadDatePlusOneMinute = new Date(
                    uploadDate.getTime() + 60000
                  );

                  // Format uploadDatePlusOneMinute to match "dd.mm.yyyy hh:mm"
                  const formattedUploadDatePlusOneMinute = `${uploadDatePlusOneMinute
                    .getDate()
                    .toString()
                    .padStart(2, '0')}.${(
                    uploadDatePlusOneMinute.getMonth() + 1
                  )
                    .toString()
                    .padStart(
                      2,
                      '0'
                    )}.${uploadDatePlusOneMinute.getFullYear()} ${uploadDatePlusOneMinute
                    .getHours()
                    .toString()
                    .padStart(2, '0')}:${uploadDatePlusOneMinute
                    .getMinutes()
                    .toString()
                    .padStart(2, '0')}`;

                  cy.log(`Upload Date: ${formattedUploadDate}`);
                  cy.log(
                    `Upload Date + 1 Min: ${formattedUploadDatePlusOneMinute}`
                  );

                  // Compare the received date with both possible dates
                  expect([
                    formattedUploadDate,
                    formattedUploadDatePlusOneMinute,
                  ]).to.include(formattedReceivedDate);
                });
            }
          });
      });

      cy.wait(3000);
      // //Click on magic link button
      // cy.get('.action-buttons>button>.mdc-button__label').click({
      //   force: true,
      // });

      // // .filter((index, el) => {
      // //   const text = Cypress.$(el).text().trim();
      // //   return text === ' Open E-Box ' || text === 'Nächste';
      // // })
      // // cy.get('button[data-action="openEbox"]').click(); // Replace with the actual selector

      // cy.intercept(
      //   'POST',
      //   'https://supportviewpayslip.edeja.com/be/supportView/v1/person/magicLink/createByGroup',
      //   {
      //     statusCode: 200,
      //     body: {
      //       groupId: '654cb8556d84491d20c20525',
      //       personId: '665efbfcdd2ca31e8c083c8a',
      //       sourceType: 'HR_MANAGEMENT',
      //     },
      //   }
      // ).as('magicLinkRequest');
      // cy.window().then((win) => {
      //   cy.stub(win, 'open')
      //     .callsFake((url) => {
      //       // Simulate navigation in the same tab by changing the window location
      //       win.location.href = url;
      //     })
      //     .as('windowOpen');
      // });
      // cy.wait('@magicLinkRequest').then((interception) => {
      //   expect(interception.response.statusCode).to.eq(200);
      //   const { magicLink } = interception.response.body;

      //   // Verify that the stubbed window.open method was called with the correct magic link
      //   cy.get('@windowOpen').should('be.calledWith', magicLink, '_blank');

      //   // Assert that the current URL is the magic link
      //   cy.url().should('eq', magicLink);
      // });
      // cy.wait(3000);
      // cy.pause();
      // //Remove Cookie
      // cy.get('body').then(($body) => {
      //   if ($body.find('#onetrust-policy-title').is(':visible')) {
      //     // If the cookie bar is visible, click on it and remove it
      //     cy.get('#onetrust-accept-btn-handler').click();
      //   } else {
      //     // Log that the cookie bar was not visible
      //     cy.log('Cookie bar not visible');
      //   }
      // }); //End Remove Cookie
      //Logout

      cy.get('.logout-icon ').click();
      cy.wait(2000);
      cy.get('.confirm-buttons > :nth-child(2)').click();
      cy.log('Test completed successfully.');
      cy.wait(2500);
    }); //end
  }

  //-------------------End Custom Function-------------------

  // Define a variable to store the formatted date and time after document upload
  var uploadDateTime;

  // Generate a 3-characters random string
  function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
    return randomString;
  }

  // Admin users data
  let randomString = generateRandomString(2); // Setup the number of random chracters
  console.log(randomString);
  const firstName = 'Admin';
  const lastName = 'User_' + randomString;
  const username = 'AdminUser_' + randomString;
  const email = 'admin.user_' + randomString + '@yopmail.com';
  const password = 'Test1234!';

  it('MasterCreateAdminUser', () => {
    // Login as Master User using a custom command
    cy.loginToSupportViewMaster();
    cy.wait(3500);

    cy.get('#searchButton>span').click(); //Click on search button
    cy.wait(1000);
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      // Use the company name from the JSON file
      const companyName = payslipJson.company;
      // Search for Group by Display Name using the company name
      cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
        .eq(1)
        .type(companyName);
    });
    cy.wait(1500);
    //Find the Search button by button name and click on it
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    // Switch on Admin User page
    clickOnAdminUserButton();

    // Click on 'Create Admin User' button to open the dialog
    cy.get('.mat-primary>.mdc-button__label')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return (
          text === 'Create Admin User' || text === 'Admin Benutzer Anlegen'
        );
      })
      .click();
    cy.wait(1500);

    // Access supportView.json from the fixture folder
    cy.fixture('supportView.json').then((fixtureData) => {
      // const adminUser = fixtureData.createAdminUser[0]; // Access the first Admin User object

      // // Fill out the form fields with data from the fixture file
      // cy.get('input[formcontrolname="firstName"]').type(adminUser.firstName); // First Name
      // cy.get('input[formcontrolname="lastName"]').type(adminUser.lastName); // Last Name
      // cy.get('input[formcontrolname="username"]').type(adminUser.username); // Username
      // cy.get('input[formcontrolname="email"]').type(adminUser.email); // Email

      // Fill out the form const
      cy.get('input[formcontrolname="firstName"]').type(firstName); // First Name
      cy.get('input[formcontrolname="lastName"]').type(lastName); // Last Name
      cy.get('input[formcontrolname="username"]').type(username); // Username
      cy.get('input[formcontrolname="email"]').type(email); // Email
    });
    // Submit the form
    cy.get('button[type="submit"]').click();

    // Verify the success message
    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible') // Ensure it's visible first
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /Admin User created|Admin Benutzer angelegt/
        );
      });

    cy.wait(4000);

    //*****Masteruser try to create Admin which already exist

    // Click on 'Create Admin User' button to open the dialog
    cy.get('.mat-primary>.mdc-button__label')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return (
          text === 'Create Admin User' || text === 'Admin Benutzer Anlegen'
        );
      })
      .click();
    cy.wait(1500);
    // Fill out the form const
    cy.get('input[formcontrolname="firstName"]').type(firstName); // First Name
    cy.get('input[formcontrolname="lastName"]').type(lastName); // Last Name
    cy.get('input[formcontrolname="username"]').type(username); // Username
    cy.get('input[formcontrolname="email"]').type(email); // Email
    // Submit the form
    cy.get('button[type="submit"]').click();

    // Verify Error message
    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible') // Ensure it's visible first
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /User already exists|Benutzer existiert bereits/
        );
      });

    cy.wait(3500);
    //Close Create Admin user dialog
    cy.get('.close ').click();

    //Search for new Admin
    cy.get('#searchButton').click({ force: true });
    cy.wait(1500);
    cy.get('input[formcontrolname="userName"]').click().type(username); //Search for newly created user using username
    cy.get('button[type="submit"]').click(); //Click on Search button
    cy.wait(2500);

    //Add permition to Admin user by clicking on the Role button
    cy.get('.action-buttons>button>.mdc-button__label')
      .should('exist') // Ensure the element exists
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Rights' || text === 'Rechte'; // Find the "Rights | Rechte" button
      })
      .first() // Use the first matching element if multiple exist
      .should('be.visible') // Ensure it's visible
      .click({ force: true }); // Force the click to handle asynchronous rendering
    cy.wait(2500);

    // Select the "View E-Box" role
    cy.get('mat-checkbox .mdc-form-field .mdc-label')
      .contains(/View E-Box|E-Box ansehen/) // Match either of the two labels
      .click(); // Click to select

    // Select the "Customer Creator" role
    cy.get('mat-checkbox .mdc-form-field .mdc-label')
      .contains(/Customer Creator|Nutzeranlage/) // Match either of the two labels
      .click(); // Click to select
    cy.wait(1500);
    //Save Roles
    cy.get('button[type="submit"]').click({ force: true });
    cy.wait(1500);

    // Verify  Rights updated succesfully message
    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible') // Ensure it's visible first
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(/Rights updated|Rechte aktualisiert/);
      });
    cy.wait(2500);
    //Logout
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.log('Test completed successfully.');
    cy.wait(2500);

    // //********************* Yopmail *********************

    // Visit the Yopmail inbox
    cy.visit('https://yopmail.com/en/');
    cy.get('#login').type(email); // Use the same email generated earlier
    cy.get('#refreshbut > .md > .material-icons-outlined').click();

    // Retrieve all email subjects
    cy.iframe('#ifinbox')
      .find('.mctn > .m > button > .lms')
      .then((emails) => {
        // Create an array of email subjects
        const emailSubjects = [...emails].map((email) =>
          email.textContent.trim()
        );

        // Variables to store email indices
        let usernameEmailIndex = -1;
        let passwordEmailIndex = -1;

        // Identify the indices based on the subjects
        emailSubjects.forEach((subject, index) => {
          if (
            subject.includes(
              'Neuer Benutzer e-Gehaltszettel Portal – Benutzername'
            )
          ) {
            usernameEmailIndex = index;
          } else if (
            subject.includes('Neuer Benutzer e-Gehaltszettel Portal – Passwort')
          ) {
            passwordEmailIndex = index;
          }
        });

        // Validate the Username email
        if (usernameEmailIndex !== -1) {
          cy.iframe('#ifinbox')
            .find('.mctn > .m > button > .lms')
            .eq(usernameEmailIndex)
            .click()
            .wait(1500);

          cy.iframe('#ifmail')
            .find(
              '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span'
            )
            .invoke('text')
            .then((innerText) => {
              const startIndex =
                innerText.indexOf('Hier ist Ihr Benutzername:') +
                'Hier ist Ihr Benutzername:'.length;
              const usernameFromEmailBody = innerText
                .substring(startIndex)
                .trim();

              // Store the captured username globally
              cy.wrap(usernameFromEmailBody).as('capturedUsername');
              Cypress.env('usernameFromEmailBody', usernameFromEmailBody);

              // Assert the username matches the expected username
              expect(usernameFromEmailBody).to.equal(username);
              cy.wait(2500);

              // Log the username
              cy.log('Username:', usernameFromEmailBody);
            });
        }

        // Validate the Password email
        if (passwordEmailIndex !== -1) {
          cy.iframe('#ifinbox')
            .find('.mctn > .m > button > .lms')
            .eq(passwordEmailIndex)
            .click()
            .wait(1500);

          cy.iframe('#ifmail')
            .find(
              '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span'
            )
            .invoke('text')
            .then((innerText) => {
              const startIndex =
                innerText.indexOf('hier ist Ihr Passwort:') +
                'hier ist Ihr Passwort:'.length;
              const passwordFromEmailBody = innerText
                .substring(startIndex)
                .trim();

              // Store the captured password globally
              cy.wrap(passwordFromEmailBody).as('capturedPassword');
              Cypress.env('passwordFromEmailBody', passwordFromEmailBody);

              // Log the password
              cy.log('Password:', passwordFromEmailBody);
            });
        }
      });
    cy.wait(2500);

    // *************New Admin is Logging into SW using Credentials taken from emails
    cy.fixture('supportView.json').as('example_supportView');
    cy.get('@example_supportView').then((usersJson) => {
      // Visit the login page using the base URL from the fixture
      cy.visit(usersJson.baseUrl, {
        failOnStatusCode: false,
      });

      // Validate that the login page URL includes '/login'
      cy.url().should('include', '/login');
      // Use extracted username and password for login
      cy.get('@capturedUsername').then((username) => {
        cy.get('@capturedPassword').then((password) => {
          // Enter credentials and submit the form
          cy.get('input[formcontrolname="username"]').type(username);
          cy.get('input[formcontrolname="password"]').type(password);
          cy.wait(1500);
          cy.get('button[type="submit"]').click();

          // Wait for login to complete
          cy.wait(3500);

          // Check if the 'User | Benutzer' button is visible and click it
          cy.get('button > .mdc-button__label')
            .should('be.visible') // Ensure the button is visible
            .then(($button) => {
              const text = $button.text().trim(); // Extract and trim the text
              expect(text).to.match(/User|Benutzer/); // Validate the text matches either 'User' or 'Benutzer'

              // Click the button
              cy.wrap($button).click();
            });

          cy.wait(2500); // Optional wait, not recommended unless necessary

          //Check visibility of buttons depend of selected Roles
          const buttonLabels = [
            { en: 'Create User', de: 'Neuen Benutzer Anlegen' },
            { en: 'Edit', de: 'Bearbeiten' },
            { en: 'Password reset', de: 'Passwort wiederherstellen' },
            { en: 'Open E-Box', de: 'E-Box Öffnen' },
          ];

          cy.get('button > .mdc-button__label').each(($button) => {
            cy.wrap($button)
              .invoke('text')
              .then((text) => {
                const trimmedText = text.trim();
                const isValid = buttonLabels.some(
                  (label) =>
                    label.en === trimmedText || label.de === trimmedText
                );

                // Assert that the button text matches one of the expected labels
                expect(isValid, `Unexpected button label: "${trimmedText}"`).to
                  .be.true;
              });
          });

          //Logout
          cy.get('.logout-icon ').click();
          cy.wait(2000);
          cy.get('.confirm-buttons > :nth-child(2)').click();
          cy.log('Test completed successfully.');
          cy.wait(2500);
        });
      });
    });
    //*******************MASTERUSER DELETE NEW ADMIN USER */
    // Login as Master User using a custom command
    cy.loginToSupportViewMaster();
    cy.wait(3500);
    //Search for the Test Company
    cy.get('#searchButton>span').click(); //Click on search button
    cy.wait(1000);
    cy.fixture('supportView.json').as('payslipSW');
    cy.get('@payslipSW').then((payslipJson) => {
      // Use the company name from the JSON file
      const companyName = payslipJson.company;
      // Search for Group by Display Name using the company name
      cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
        .eq(1)
        .type(companyName);
    });
    cy.wait(1500);
    //Find the Search button by button name and click on it
    cy.get('.search-dialog>form>div>.mat-primary').click();
    cy.wait(1500);

    // Switch on Admin User page
    clickOnAdminUserButton();
    cy.wait(2500);
    //Search for Admin user
    cy.get('#searchButton').click({ force: true });
    cy.wait(1500);
    cy.get('input[formcontrolname="userName"]').click().type(username); //Search for newly created user using username
    cy.get('button[type="submit"]').click(); //Click on Search button
    cy.wait(2500);

    //Delete Admin
    cy.get('.action-buttons>button>.mdc-button__label')
      .should('exist') // Ensure the element exists
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'GDPR-Delete' || text === 'DSGVO-Löschung'; // Find the Delete button
      })
      .first() // Use the first matching element if multiple exist
      .should('be.visible') // Ensure it's visible
      .click({ force: true }); // Force the click to handle asynchronous rendering
    cy.wait(2500);

    //Confirm Admin delte action
    cy.get('button[color="primary"]>.mdc-button__label')
      .should('exist') // Ensure the element exists
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'YES' || text === 'JA'; // Find the Delete button
      })
      .click({ force: true }); // Force the click to handle asynchronous rendering
    cy.wait(2500);

    // Verify  User deleted succesfully message
    cy.get('.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label')
      .should('be.visible') // Ensure it's visible first
      .invoke('text') // Get the text of the element
      .then((text) => {
        // Trim the text and validate it
        const trimmedText = text.trim();
        expect(trimmedText).to.match(
          /User deleted succesfully|Benutzer erfolgreich gelöscht/
        );
      });

    //Search for just deleted Admin user
    cy.get('#searchButton').click({ force: true });
    cy.wait(1500);
    cy.get('input[formcontrolname="userName"]').click().type(username); //Search for newly created user using username
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
      });
    cy.wait(2500);
    //Logout from SW
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    cy.log('Test completed successfully.');
    cy.wait(2500);
  }); //end it

  //********************* Yopmail *********************

  // Test to check the email
  // it('Check Email', () => {
  //   // Visit the Yopmail inbox
  //   cy.visit('https://yopmail.com/en/');
  //   cy.get('#login').type(email); // Use the same email generated earlier
  //   cy.get('#refreshbut > .md > .material-icons-outlined').click();

  //   // Validate the subject of the email
  //   cy.iframe('#ifinbox')
  //     .find('.mctn > .m > button > .lms')
  //     .eq(1)
  //     .click()
  //     .should(
  //       'include.text',
  //       'Neuer Benutzer e-Gehaltszettel Portal – Benutzername'
  //     );
  //   cy.wait(1500);

  //   // Extract and validate the username from the email body
  //   cy.iframe('#ifmail')
  //     .find(
  //       '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span'
  //     )
  //     .invoke('text')
  //     .then((innerText) => {
  //       const startIndex =
  //         innerText.indexOf('Hier ist Ihr Benutzername:') +
  //         'Hier ist Ihr Benutzername:'.length;
  //       const usernameFromEmailBody = innerText.substring(startIndex).trim();

  //       // Store the captured username globally
  //       cy.wrap(usernameFromEmailBody).as('capturedUsername');
  //       Cypress.env('usernameFromEmailBody', usernameFromEmailBody);

  //       // Assert the username matches the expected username
  //       expect(usernameFromEmailBody).to.equal(username);
  //     });
  //   cy.wait(2500);
  // });

  //Validate subject of Neuer Benutzer e-Gehaltszettel Portal – Benutzername email
  // cy.iframe('#ifinbox')
  //   .find('.mctn > .m > button > .lms')
  //   .eq(0)
  //   .click()
  //   //.invoke('css', 'border', '1px solid yelow')
  //   .should(
  //     'include.text',
  //     'Neuer Benutzer e-Gehaltszettel Portal – Passwort'
  //   );
  // cy.wait(1500);
  // cy.iframe('#ifmail')
  //   .find(
  //     '#mail>div>div:nth-child(2)>div:nth-child(3)>table>tbody>tr>td>p:nth-child(2)>span'
  //   )
  //   .invoke('text')
  //   .then((innerText) => {
  //     const startIndex =
  //       innerText.indexOf('hier ist Ihr Passwort:') +
  //       'hier ist Ihr Passwort::'.length;
  //     const usernameFromEmailBody = innerText.substring(startIndex).trim();

  //     cy.log('Captured text:', passwordFromEmailBody);
  //   });
  //});

  //  Enable hrManagement' flag, on the Edit Company dialog
  // it.skip('Enable hrManagement flag on Company', () => {
  //   //Import credentials (un/pw) from 'supportView.json' file
  //   cy.fixture('supportView.json').as('payslipSW');
  //   cy.get('@payslipSW').then((payslipJson) => {
  //     // cy.visit(payslipJson.baseUrl); //Taken from base url
  //     // cy.url().should('include', payslipJson.baseUrl); //Validating url on the login page
  //     // //Login to sw
  //     // cy.fixture('supportView.json').as('payslipSW');
  //     // cy.get('@payslipSW').then((payslipJson) => {
  //     //   cy.get('input[formcontrolname="username"]').type(
  //     //     payslipJson.username_supportViewMaster
  //     //   );
  //     //   cy.get('input[formcontrolname="password"]').type(
  //     //     payslipJson.password_supportViewMaster
  //     //   );
  //     //   cy.get('button[type="submit"]').click();
  //     // });
  //     cy.loginToSupportViewMaster();

  //     //Search for Company by Display Name
  //     cy.get('#searchButton>span').click(); //Click on search button
  //     cy.wait(1000);
  //     cy.fixture('supportView.json').as('payslipSW');
  //     cy.get('@payslipSW').then((payslipJson) => {
  //       // Use the company name from the JSON file
  //       const companyName = payslipJson.company;
  //       // Search for Group by Display Name using the company name
  //       cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
  //         .eq(1)
  //         .type(companyName);
  //     });
  //     //Find the Search button by button name and click on it
  //     cy.wait(1500);
  //     cy.get('.search-dialog>form>div>.mat-primary').click();
  //     cy.wait(1500);

  //     //Switch to user section
  //     cy.get('.action-buttons > .mdc-button').eq(0).click();
  //     cy.wait(1500);
  //     //Scroll to the botton
  //     cy.get('.mat-mdc-dialog-content').scrollTo('bottom');
  //     cy.wait(2500);
  //     //Check checkbox
  //     cy.get('#hrManagementEnabled').then(($checkbox) => {
  //       if (!$checkbox.is(':checked')) {
  //         // If the checkbox is not checked, enable it
  //         cy.get('#hrManagementEnabled').check();
  //         cy.log('Checkbox was not enabled, now enabled.');
  //         //Save Edit Company dialog
  //         cy.get('button[type="submit"]').click();
  //       } else {
  //         // If the checkbox is already enabled
  //         cy.log('Checkbox is already enabled.');
  //         cy.get('.close[data-mat-icon-name="close"]').click();
  //       }
  //       //Close Edit Company dialog
  //       cy.wait(2500);
  //       //Logout
  //       cy.get('.logout-icon ').click();
  //       cy.wait(2000);
  //       cy.get('.confirm-buttons > :nth-child(2)').click();
  //       cy.url().should('include', payslipJson.baseUrl_04); // Validate url'
  //       cy.log('Test completed successfully.');
  //       cy.wait(2500);
  //     }); //end
  //   });
  // }); //end it

  // //Enable Hr And Disable DataSubmitter Roles
  // it.skip('enableHrAndDisableDataSubmitterRoles', () => {
  //   //Login as a Master-User
  //   cy.fixture('supportView.json').as('payslipSW');
  //   cy.get('@payslipSW').then((payslipJson) => {
  //     // cy.visit(payslipJson.baseUrl); //Taken from base url
  //     // cy.url().should('include', payslipJson.baseUrl); //Validating url on the login page
  //     // //Login to sw
  //     // cy.get('@payslipSW').then((payslipJson) => {
  //     //   cy.get('input[formcontrolname="username"]').type(
  //     //     payslipJson.username_supportViewMaster
  //     //   );
  //     //   cy.get('input[formcontrolname="password"]').type(
  //     //     payslipJson.password_supportViewMaster
  //     //   );
  //     //   cy.get('button[type="submit"]').click();
  //     // });
  //     cy.loginToSupportViewMaster();

  //     //Search for 'Aqua' Group, by Display Name
  //     cy.get('#searchButton>span').click(); //Click on search button
  //     cy.fixture('supportView.json').as('payslipSW');
  //     cy.get('@payslipSW').then((payslipJson) => {
  //       // Use the company name from the JSON file
  //       const companyName = payslipJson.company;
  //       // Search for Group by Display Name using the company name
  //       cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
  //         .eq(1)
  //         .type(companyName);
  //     });
  //     //Find the Search button by button name and click on it
  //     cy.get('.search-dialog>form>div>.mat-primary').click();
  //     cy.wait(1500);

  //     // Switch on Admin User page
  //     clickOnAdminUserButton();

  //     // Switch on Admin user's Role dilaog
  //     clickRoleRechteButtonForAquaUser();

  //     //Enable HR Role (Admin user)
  //     enableHrAndDisableDataSubmitterRoles();
  //     cy.wait(3000);

  //     //Logout
  //     cy.get('.logout-icon ').click();
  //     cy.wait(2000);
  //     cy.get('.confirm-buttons > :nth-child(2)').click();
  //     cy.url().should('include', payslipJson.baseUrl_04); // Validate url'
  //     cy.log('Test completed successfully.');
  //     cy.wait(2500);
  //   });
  // }); //end it

  // //Prepare document For Signing - For Specific user
  // it.skip('prepareDocumentForSpecificUser_2SiganturePlaceholders', () => {
  //   // Load credentials (un/pw) and user data from 'supportView.json'
  //   // cy.fixture('supportView.json').as('payslipSW');
  //   // cy.get('@payslipSW').then((payslipJson) => {
  //   //   cy.visit(payslipJson.baseUrl); // Visit base URL from fixture
  //   //   cy.url().should('include', payslipJson.baseUrl); // Validate the URL

  //   cy.fixture('supportView.json').as('payslipSW');
  //   cy.get('@payslipSW').then((payslipJson) => {
  //     cy.visit(payslipJson.baseUrl_04, {
  //       failOnStatusCode: false,
  //     });

  //     // Login to SW as Admin User
  //     cy.get('input[formcontrolname="username"]').type(
  //       payslipJson.username_supportViewAdmin
  //     );
  //     cy.get('input[formcontrolname="password"]').type(
  //       payslipJson.password_supportViewAdmin
  //     );
  //     cy.get('button[type="submit"]').click();

  //     // Wait for login to complete
  //     cy.wait(1500);

  //     // Search for 'Aqua' Group, by Display Name
  //     cy.get('#searchButton>span').click(); //Click on search button

  //     // Use the company name from the JSON file
  //     const companyName = payslipJson.company;
  //     const EBoxUser = payslipJson.username_egEbox;

  //     // Search for Group by Display Name using the company name
  //     cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
  //       .eq(1)
  //       .type(companyName);
  //     cy.get('.search-dialog>form>div>.mat-primary').click(); // Click Search
  //     cy.wait(1500);

  //     // Switch to User page
  //     cy.get('.ng-star-inserted .action-buttons button')
  //       .last()
  //       .click({ force: true });

  //     // Click on "Select user to deliver documents"
  //     cy.get('.select-users-dialog-btn').click();

  //     // Search for the specific user by name
  //     cy.get('.dictionary-xml__search-container-input>input').type(EBoxUser);
  //     cy.wait(3500);

  //     // Find and check the checkbox in the row if it's not already checked
  //     cy.get('input[type="checkbox"]').eq(1).click();

  //     cy.wait(2000);
  //     //Click on Next buton
  //     cy.get('button>.title')
  //       .filter((index, el) => {
  //         const text = Cypress.$(el).text().trim();
  //         return text === 'Next' || text === 'Nächste';
  //       })
  //       .click();
  //     cy.wait(1500);

  //     //Check number of Upload buttons
  //     cy.get('.buttons-wrapper > button:visible') // Select only visible buttons

  //       .then((buttons) => {
  //         const buttonCount = buttons.length; // Count the number of visible buttons
  //         if (buttonCount === 2) {
  //           cy.log('OK: The number of visible buttons is 2.');
  //           expect(buttonCount).to.equal(2); // Add assertion to confirm it's 2
  //         } else if (buttonCount === 1) {
  //           cy.log('INVALID: The number of visible buttons is 1.');
  //           expect(buttonCount).to.equal(
  //             2,
  //             'Expected 2 visible buttons but found only 1.'
  //           ); // Fail the test
  //         }
  //       });

  //     cy.get('.buttons-wrapper')
  //       .should('be.visible') // Validation check
  //       .then(($icon) => {
  //         // Apply green border to mark validation as successful
  //         cy.wrap($icon).invoke('css', 'border', '3px solid green');
  //         cy.log(
  //           'Validation passed: Unsigned icon is visible and marked in green.'
  //         );
  //       });
  //     cy.wait(3000);

  //     //Click on Prepare Document For Signing
  //     cy.get('.buttons-wrapper>button')
  //       .filter((index, el) => {
  //         const text = Cypress.$(el).text().trim();
  //         return (
  //           text === 'Prepare Document For Signing' ||
  //           text === 'Dokument zur Unterzeichnung vorbereiten'
  //         );
  //       })
  //       .then(($button) => {
  //         // Add red border to the button for visibility
  //         cy.wrap($button).invoke('css', 'border', '3px solid red');

  //         // Wait for 3 seconds
  //         cy.wait(3000);

  //         // Click the button
  //         cy.wrap($button).click();
  //       });

  //     cy.wait(3500);

  //     //Uplad valid document (x1 A4 pdf file)
  //     cy.massUpload();
  //     //Add Title
  //     cy.get('input[formcontrolname="subject"]')

  //       .clear()
  //       .type('HR-For Specific User');
  //     cy.wait(1500);

  //     //Prepare doc for signing
  //     //Add signature placeholder No.1
  //     cy.intercept(
  //       'GET',
  //       '**/hybridsign/backend_t/document/v1/getDocument/**'
  //     ).as('getDocument');
  //     cy.intercept('GET', '**/getIdentifications?**').as('getIdentifications');
  //     cy.get('.controls > .ng-star-inserted').click({ force: true });
  //     cy.wait(['@getDocument', '@getIdentifications'], { timeout: 15000 }).then(
  //       (interception) => {
  //         // Log the intercepted response
  //         cy.log('Intercepted response:', interception.response);

  //         // Optional: Assert the response status code
  //         // expect(interception.response.statusCode).to.eq(200);

  //         // Optional: Assert response body or other properties
  //         // Example: expect(interception.response.body).to.have.property('key', 'value');
  //         // cy.wait(1500);
  //       }
  //     );

  //     cy.get('.signatures-container>.signature-actions>a').click({
  //       force: true,
  //     }); //open add new signature dialog
  //     // cy.wait(1500);
  //     cy.get('input[formcontrolname="signee"]')
  //       .clear()
  //       .type('HR Document Signature Placeholder No1'); //Clear Input field & Enter signee name
  //     //Confirm Signee name

  //     cy.get('.mat-mdc-dialog-actions>button>.mdc-button__label')
  //       .filter((index, el) => {
  //         const text = Cypress.$(el).text().trim();
  //         return text === 'NEXT' || text === 'WEITER';
  //       })
  //       .click({ multiple: true, force: true });
  //     cy.wait(1500);

  //     //Change position of siganture dialog
  //     cy.get('.signature-methods')
  //       .trigger('mouseover')
  //       .trigger('mousedown', { which: 1, eventConstructor: 'MouseEvent' })
  //       .trigger('mousemove', {
  //         which: 1,
  //         screenX: 750,
  //         screenY: 800,
  //         clientX: 750,
  //         clientY: 800,
  //         pageX: 750,
  //         pageY: 800,
  //         eventConstructor: 'MouseEvent',
  //       })
  //       .trigger('mouseup', { force: true });
  //     cy.wait(1500);
  //     //Confirm position of Signature placholder
  //     cy.get(
  //       '.placer-actions > .mat-accent > .mat-mdc-button-touch-target'
  //     ).click({
  //       force: true,
  //     }); //Signature placehoder is added
  //     cy.wait(1500);

  //     //Add signature placeholder No.2
  //     cy.get('.signature-actions').click({ force: true });
  //     cy.wait(1500);

  //     cy.get('.signatures-container>.signature-actions>a').click({
  //       force: true,
  //     }); //open add new signature dialog
  //     cy.wait(1500);
  //     cy.get('input[formcontrolname="signee"]')
  //       .clear()
  //       .type('HR Document Signature Placeholder No2'); //Clear Input field & Enter signee name
  //     //Confirm Signee name

  //     cy.get('.mat-mdc-dialog-actions>button>.mdc-button__label')
  //       .filter((index, el) => {
  //         const text = Cypress.$(el).text().trim();
  //         return text === 'NEXT' || text === 'WEITER';
  //       })
  //       .click({ multiple: true, force: true });
  //     cy.wait(1500);

  //     //Change position of siganture dialog
  //     cy.get('.signature-methods')
  //       .trigger('mouseover')
  //       .trigger('mousedown', { which: 1, eventConstructor: 'MouseEvent' })
  //       .trigger('mousemove', {
  //         which: 1,
  //         screenX: 1080,
  //         screenY: 800,
  //         clientX: 1080,
  //         clientY: 800,
  //         pageX: 1080,
  //         pageY: 800,
  //         eventConstructor: 'MouseEvent',
  //       })
  //       .trigger('mouseup', { force: true });
  //     cy.wait(1500);
  //     cy.get(
  //       '.placer-actions > .mat-accent > .mat-mdc-button-touch-target'
  //     ).click({
  //       force: true,
  //     }); //Signature placehoder is added

  //     cy.wait(2000);
  //     //Click on Save button
  //     cy.get('.tempSave').click({ force: true });
  //     cy.wait(2500);

  //     //Confirm Save temporaly dialog
  //     // cy.get('.mat-mdc-dialog-actions > .mat-accent >.mdc-button__label')
  //     //   .filter((index, el) => {
  //     //     const text = Cypress.$(el).text().trim();
  //     //     return text === 'SAVE TEMPORARY' || text === 'VORLÄUFIG SPEICHERN';
  //     //   })
  //     //   .click({ force: true });

  //     cy.wait(7500);
  //     cy.get('.dialog-footer>.dialog-actions>button>.title')
  //       .filter((index, el) => {
  //         const text = Cypress.$(el).text().trim();
  //         return text === 'Send' || text === 'Senden';
  //       })
  //       .click();
  //     cy.wait(4500);

  //     cy.get(
  //       '.mat-mdc-dialog-component-host>.dialog-container>.dialog-footer>.controls>button>.title'
  //     )
  //       .filter((index, el) => {
  //         const text = Cypress.$(el).text().trim();
  //         return text === 'Confirm' || text === 'Bestätigen';
  //       })
  //       .click({ force: true });
  //     cy.wait(4500);

  //     //Logout
  //     cy.get('.logout-icon ').click();
  //     cy.wait(2000);
  //     cy.get('.confirm-buttons > :nth-child(2)').click();
  //     cy.url().should('include', payslipJson.baseUrl_04); // Validate url'
  //     cy.log('Test completed successfully.');
  //     cy.wait(2500);
  //   });
  // }); //end it

  //Sign HR Delivery
  // it.skip('Ebox user signing HR delivery_2 Signatures', () => {
  //   cy.fixture('supportView.json').as('payslipSW');
  //   cy.get('@payslipSW').then((payslipJson) => {
  //     cy.visit(payslipJson.baseUrl_04_egEbox); // Taken from base URL
  //     cy.url().should('include', payslipJson.baseUrl_04_egEbox); // Validate URL on the login page
  //     cy.wait(2000);

  //     //Remove Cookie
  //     cy.get('body').then(($body) => {
  //       if ($body.find('#onetrust-policy-title').is(':visible')) {
  //         // If the cookie bar is visible, click on it and remove it
  //         cy.get('#onetrust-accept-btn-handler').click();
  //       } else {
  //         // Log that the cookie bar was not visible
  //         cy.log('Cookie bar not visible');
  //       }
  //     }); //End Remove Cookie

  //     // Login to E-Box
  //     cy.get(':nth-child(1) > .ng-invalid > .input > .input__field-input').type(
  //       payslipJson.username_egEbox
  //     );
  //     cy.get('.ng-invalid > .input > .input__field-input').type(
  //       payslipJson.password_egEbox
  //     );
  //     cy.wait(1000);
  //     cy.get('button[type="submit"]').click();
  //     // Wait for login to complete
  //     cy.wait(7500);
  //     // Assert that the unsigned icon is visible
  //     cy.get('app-deliveries-signature-actions > .unsigned')
  //       .first()
  //       .should('be.visible') // Validation check
  //       .then(($icon) => {
  //         // Apply green border to mark validation as successful
  //         cy.wrap($icon).invoke('css', 'border', '3px solid green');
  //         cy.log(
  //           'Validation passed: Unsigned icon is visible and marked in green.'
  //         );
  //       });
  //     cy.wait(3500);
  //     //Click on latest created deivery

  //     cy.intercept(
  //       'GET',
  //       '**/hybridsign/backend_t/document/v1/getDocument/**'
  //     ).as('getDocument');
  //     cy.intercept('GET', '**/getIdentifications?**').as('getIdentifications');
  //     cy.get('.mdc-data-table__content>tr>.subject-sender-cell')
  //       .eq(0)
  //       .click({ force: true });

  //     cy.wait(['@getDocument', '@getIdentifications'], { timeout: 25000 }).then(
  //       (interception) => {
  //         // Log the intercepted response
  //         cy.log('Intercepted response:', interception.response);

  //         // Optional: Assert the response status code
  //         // expect(interception.response.statusCode).to.eq(200);

  //         // Optional: Assert response body or other properties
  //         // Example: expect(interception.response.body).to.have.property('key', 'value');
  //       }
  //     );
  //     // cy.wait(14000);

  //     // Scroll to the bottom of the PDF viewer or page
  //     cy.get('.content-container>.scroll-container').eq(1).scrollTo('bottom', {
  //       duration: 500,
  //       ensureScrollable: false,
  //     });

  //     // Capture the current date and time in the specified format
  //     const now = new Date();
  //     const formattedDate = now.toLocaleDateString('de-DE'); // Format as dd.mm.yyyy
  //     const formattedTime = now.toLocaleTimeString('de-DE', {
  //       hour: '2-digit',
  //       minute: '2-digit',
  //       hour12: false,
  //     });
  //     uploadDateTime = `${formattedDate} ${formattedTime}`;
  //     cy.log(`Upload DateTime: ${uploadDateTime}`);

  //     // Generate a random 4-digit number and use it in the title
  //     //let randomNumber = Math.floor(1000 + Math.random() * 9000);
  //     const title = `HR Delivery (pdf) - ${uploadDateTime}`; // Use formatted date and time in title

  //     // Loop through all signature buttons
  //     cy.get('.touch-signature-button').each(($button, index, $list) => {
  //       // Click the current signature button
  //       cy.wrap($button).click({ force: true });

  //       // Simulate signing on the canvas
  //       cy.get('.sign-canvas')
  //         .then((res) => console.log(res[0].getBoundingClientRect())) // Log canvas dimensions for debugging
  //         .trigger('mouseover') // Hover over the canvas
  //         .trigger('mousedown', { which: 1, eventConstructor: 'MouseEvent' }) // Simulate mouse press
  //         .trigger('mousemove', {
  //           which: 1,
  //           screenX: 410, // Adjust these coordinates as needed
  //           screenY: 530,
  //           clientX: 530,
  //           clientY: 560,
  //           pageX: 500,
  //           pageY: 600,
  //           eventConstructor: 'MouseEvent',
  //         }); // Simulate mouse drag to draw the signature

  //       cy.get('.sign-canvas').trigger('mouseup', { force: true }); // Simulate releasing the mouse
  //       cy.wait(2000); // Wait for the signing action to complete

  //       // Confirm the signature
  //       cy.get(
  //         '.mat-sign-actions-desktop > .mat-accent > .mat-mdc-button-touch-target'
  //       ).click({ force: true });

  //       // Wait for success notification
  //       cy.wait(7000);
  //       // cy.get('.success-notification>.notification-message')
  //       //   .should('be.visible') // Ensure the success message is visible
  //       //   .should('have.text', ' Signatur wurde erfolgreich erstellt. '); // Verify success message text

  //       // Log the progress of signature signing
  //       cy.log(`Signature ${index + 1} of ${$list.length} completed.`);
  //     });

  //     // Check if the Save button is enabled after all signatures are completed
  //     cy.get('.save > .mdc-button__label').then(($button) => {
  //       // If the Save button is enabled, click it
  //       if (!$button.is(':disabled')) {
  //         cy.log('All signatures are signed, clicking Save.');
  //         cy.wait(1500); // Wait before clicking the Save button
  //         cy.get('.save > .mdc-button__label').click({ force: true });
  //         cy.wait(4500);
  //       } else {
  //         // Log a message if the Save button is disabled
  //         cy.log('Save button is disabled. Ensure all signatures are signed.');
  //       }
  //     });
  //     cy.wait(4500);
  //     // Assert that the signed icon is visible
  //     cy.get('app-deliveries-signature-actions > .signed')
  //       .first()
  //       .should('be.visible') // Validation check
  //       .then(($icon) => {
  //         // Apply green border to mark validation as successful
  //         cy.wrap($icon).invoke('css', 'border', '3px solid green');
  //         cy.log(
  //           'Validation passed: Unsigned icon is visible and marked in green.'
  //         );
  //       });
  //     cy.wait(3500);
  //     //******************************************************************** */

  //     // Logout
  //     cy.get('.user-title').click();
  //     cy.wait(1500);
  //     cy.get('.logout-title > a').click();
  //     cy.url().should('include', payslipJson.baseUrl_04_egEbox); // Validate url
  //     cy.log('Test completed successfully.');
  //   });
  // });

  // Admin User is able to check new HR Delivery received in HR page
  // it.skip('Admin User checks new delivery received in the HR page in SW', () => {
  //   adminUserChecksNewDeliveryReceivedInHRpage();
  // });
}); //end describe
