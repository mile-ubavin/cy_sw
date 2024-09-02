// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

//******************************  E-Brief / K I A M  ********************************/

//Custom commands: Take a data from json file
// Cypress.Commands.add("take_credentials_from_json", () => {
//   cy.fixture("ebrief.json").as("example_kiam");
//   cy.get("@example_kiam").then((usersJson) => {
//     cy.loginToEbrief(usersJson.username_kiam, usersJson.password_kiam);
//     cy.get("#signInName").type(usersJson.username_kiam);
//     cy.get("#password").type(usersJson.password_kiam);
//     cy.wait(3000);
//     cy.get(".buttons").click();
//   });
// });

// //Custom commands: Take a data from json file and login to E-Brief via Kiam
// Cypress.Commands.add("loginToEbrief", () => {
//   //cy.origin("https://kiamabn.b2clogin.com/kiamabn.onmicrosoft.com/oauth2/v2.0/", ()=>{
//   //Setup valid un/pw
//   //cy.url().should("include", "https://kiamabn.b2clogin.com/kiamabn.onmicrosoft.com"); // => true
//   cy.fixture("ebrief.json").as("example_kiam");
//   cy.get("@example_kiam").then((usersJson) => {
//     //  cy.loginToEbrief(usersJson.username_kiam, usersJson.password_kiam);
//     cy.get("#signInName").type(usersJson.username_kiam);
//     cy.get("#password").type(usersJson.password_kiam);
//     cy.get("#showPassword").click();
//     cy.wait(3000);
//     cy.get(".buttons").click();
//   });
//   // })
// });

// //Custom commands Origin
// Cypress.Commands.add("loginSession", (example_kiam, password_kiam) => {
//   cy.session([example_kiam, password_kiam], () => {
//     cy.visit("https://www.e-brief.at/fe_t"),
//       //cy.url().should("include", "/fe_t"); // => validate url
//       cy.get("#onetrust-accept-btn-handler").click({ force: true });
//     cy.wait(3000);
//     cy.get(".login-form > sc-button > .button").click();
//     cy.origin(
//       "https://kiamabn.b2clogin.com/kiamabn.onmicrosoft.com/oauth2/v2.0/",
//       { args: [example_kiam, password_kiam] },
//       ([example_kiam, password_kiam]) => {
//         cy.fixture("ebrief.json").as("example_kiam");
//         cy.get("@example_kiam").then((usersJson) => {
//           //  cy.loginToEbrief(usersJson.username_kiam, usersJson.password_kiam);
//           cy.get("#signInName").type(usersJson.username_kiam);
//           cy.get("#password").type(usersJson.password_kiam);
//           cy.get("#showPassword").click();
//           cy.wait(3000);
//           cy.get(".buttons").click();
//         });
//       }
//     );
//   });
// }); //end

import 'cypress-file-upload';
import 'cypress-keycloak-commands';
import 'cypress-iframe';

//Custom commands: Take a data from json file and login to E-Brief via Kiam
// Cypress.Commands.add("loginToEBrief_1", () => {
//     cy.visit("https://www.e-brief.at/fe_t");
//     cy.url().should("include", "https://www.e-brief.at/fe_t"); // => true
//     cy.wait(1000);
//     cy.get("#onetrust-accept-btn-handler").click({ force: true });//remove cookie
//     cy.wait(1000);
//     cy.get(".login-form > sc-button > .button").click();
//     cy.origin("https://kiamabn.b2clogin.com/kiamabn.onmicrosoft.com/oauth2/v2.0/",() => {
//         cy.url().should("include","https://kiamabn.b2clogin.com/kiamabn.onmicrosoft.com"); // => true
//      //import credentials from json
//         cy.fixture("ebrief.json").as("example_kiam");
//         cy.get("@example_kiam").then((usersJson) => {
//             cy.get("#signInName").type(usersJson.username_kiam);
//             cy.get("#password").type(usersJson.password_kiam);
//             cy.wait(1000);
//             cy.get('#showPassword').click()
//             cy.wait(1000);
//             cy.get(".buttons").click();
//         });
//     }
//   ); //end origin
//   cy.url().should("include", "https://www.e-brief.at/fe_t/deliveries"); // => validate ebrief url (/deliveries page)
//   cy.wait(1000);
// }); //end

//Gmail
// Cypress.Commands.add("Gmail", () => {
//     const { defineConfig } = require("cypress");
//     const gmailTester = require("gmail-tester");
//     const path = require("path");

//     module.exports = defineConfig({
//       e2e: {
//         setupNodeEvents(on, config) {
//           on("task", {
//             "gmail:get-messages": async (args) => {
//               const messages = await gmailTester.get_messages(
//                 path.resolve(fixture, "credentials.json"),
//                 path.resolve(fixture, "token.json"),
//                 args.options
//               );
//               return messages;
//             },
//           });
//         },
//       },
//     });
// })

//******************************************  E-Brief   ******************************/

//Custom commands: Taken data from json file and login to E-Brief
Cypress.Commands.add('loginToEBrief', () => {
  cy.visit('/'); //Taken from base url
  cy.url().should('include', '/'); //Validating url on the dashboard page
  cy.wait(1000);
  // cy.get("#onetrust-accept-btn-handler").click(); //Remove Cookie bar
  // cy.wait(1000);
  cy.get('button[type="submit"]').should('be.visible').and('be.enabled'); //3 Buttons should be visible and enabled in the landing page (Validation) - optional
  cy.get('button[type="submit"]').contains('Jetzt Anmelden').click();
  //Redirection to Kiam login page
  //cy.url().should("include", "https://login.post.at/kiamprod.onmicrosoft.com"); //Validating KiamProd url
  cy.url().should('include', 'https://kiamabn.b2clogin.com/'); //Validating KiamTest url
  //Import credentials (un/pw) from 'ebrief.json' file
  cy.fixture('ebrief.json').as('example_kiam');
  cy.get('@example_kiam').then((usersJson) => {
    cy.get('#signInName').type(usersJson.username_kiam);
    cy.get('#password').type(usersJson.password_kiam);
    cy.wait(1000);
    cy.get('#showPassword').click(); //Show/Hide pass
    cy.wait(1000);
    cy.get('#next').click(); //Login to E-Brief
  });
  cy.url().should('include', '/deliveries'); // => validate ebrief url (/deliveries page)
  cy.wait(1000);
}); //end

// Upload Attachment
Cypress.Commands.add('upload_attachment', function () {
  cy.fixture('Test.pdf', 'binary')
    .then(Cypress.Blob.binaryStringToBlob)
    .then((fileContent) => {
      cy.get('form.ng-untouched > .ng-untouched').attachFile({
        fileContent,
        filePath: 'Test.pdf',
        fileName: 'Test.pdf',
      });
    });
});

// Upload Attachment
Cypress.Commands.add('upload_attachment1', function () {
  cy.fixture('Test.pdf', 'binary')
    .then(Cypress.Blob.binaryStringToBlob)
    .then((fileContent) => {
      cy.get(
        '.upload>app-upload-deliveries>.upload-section>.modal-upload-box>form>input'
      ).attachFile({
        fileContent,
        filePath: 'Test.pdf',
        fileName: 'Test.pdf',
      });
    });
});

// ***************** EG ***********************

//EG-Login to SW (34)

//Custom commands: Taken data from json file, and login to SW as a AdminUser
Cypress.Commands.add('loginToSupportViewAdmin', () => {
  cy.visit('https://supportviewpayslip.edeja.com/fe/login'); //Taken from base url
  cy.url().should('include', '/login'); //Validating url on the Login page
  //Import credentials (un/pw) from 'supportView.json' file
  cy.fixture('supportView.json').as('example_supportView');
  cy.get('@example_supportView').then((usersJson) => {
    cy.get('.username').type(usersJson.username_supportViewAdmin);
    cy.get('.password').type(usersJson.username_supportViewAdmin);
    cy.wait(1000);
    cy.get('.login-button').click(); //Login to SW
  });
  cy.wait(1500);
  cy.url().should('include', '/dashboard/groups'); // => validate url
  cy.wait(1000);
}); //end

//Custom commands: Taken data from json file, and login to SW as a Master User
Cypress.Commands.add('loginToSupportViewMaster', () => {
  //Import credentials (un/pw) from 'supportView.json' file
  cy.fixture('supportView.json').as('example_supportView');
  cy.get('@example_supportView').then((usersJson) => {
    cy.visit(usersJson.baseUrl); //Taken from base url
    cy.url().should('include', '/login'); //Validating url on the login page
    cy.get('.username').type(usersJson.username_supportViewMaster);
    cy.get('.password').type(usersJson.password_supportViewMaster);
    cy.wait(1000);
    cy.get('.login-button').click(); //Trigger Login to SW
    cy.url().should('include', '/dashboard/groups'); // => validate url
  });
  cy.wait(1000);
}); //end

// Upload Attachment
Cypress.Commands.add('uploadDocument', function () {
  cy.get('@t').then((t) => {
    cy.fixture('_G_OVM8D.xml', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then((fileContent) => {
        cy.get('.dialog-content>.upload-section>div>form>input').attachFile({
          fileContent,
          filePath: '_G_OVM8D.xml',
          fileName: '_G_OVM8D.xml',
        });
        //Check translate
        cy.get('.upload-section>div>span')

          .invoke('text')
          .then((uploadAreaTxt) => {
            expect(uploadAreaTxt, 'upload Area Txt').to.include(
              t['Drag documents to this area or click here to upload']
            );
          }); //end
        cy.get('.dialog-actions>button>.title')
          .eq(0)
          .invoke('text')
          .then((cancelButton) => {
            expect(cancelButton, 'Cancel Upload document button').to.include(
              t.Cancel
            );
          }); //end
        //Upload button
        cy.get('.dialog-actions>button>.title')
          .eq(1)
          .invoke('text')
          .then((cancelButton) => {
            expect(cancelButton, 'Upload document button').to.include(
              t['Upload Documents']
            );
          }); //end
      });
  });
});

//Custom commands: Taken data from json file
Cypress.Commands.add('loginToPayslipSupportViewMaster', () => {
  //Import credentials (un/pw) from 'supportView.json' file
  cy.fixture('payslip.json').as('payslip');
  cy.get('@payslip').then((payslipJson) => {
    cy.visit(payslipJson.baseUrl); //Taken from base url
    cy.url().should('include', '/login'); //Validating url on the login page
    cy.get('.username').type(payslipJson.username_supportViewMaster);
    cy.get('.password').type(payslipJson.password_supportViewMaster);
    cy.wait(1000);
    cy.get('.login-button').click(); //Trigger Login to SW
    cy.url().should('include', '/dashboard/groups'); // => validate url
  });
  cy.wait(1000);
}); //end

// ***************** EG-E-Box *****************

//Custom commands: Taken data from json file
Cypress.Commands.add('loginToEgEbox', () => {
  //Import credentials (un/pw) from 'json' file
  cy.fixture('payslip.json').as('example_supportView');
  cy.get('@example_supportView').then((usersJson) => {
    cy.get(':nth-child(1) > .ng-invalid > .input > .input__field-input').type(
      usersJson.username_egEbox
    );
    cy.get('.ng-invalid > .input > .input__field-input').type(
      usersJson.password_egEbox
    );
    cy.wait(1000);
    cy.get('button[type="submit"]').click(); //Login to E-Brief
  });
  cy.url().should('include', '/deliveries'); // => validate ebrief url (/deliveries page)
  cy.wait(1000);
}); //end login

// generateRandomUsername
Cypress.Commands.add('generateRandomUsername', () => {
  const randomValue = Math.random().toString(36).substring(7); // Generate a random string
  return `username_${randomValue}`;
});

// Custom command to select language

Cypress.Commands.add('selectLanguage', (language) => {
  cy.get('.lagnuage-menu').click();
  cy.wait(1000);
  cy.get(`#mat-select-0-panel`).contains(language).click();
});

Cypress.Commands.add('getOppositeLanguage', (currentLanguage) => {
  return currentLanguage === 'English' ? 'German' : 'English';
});

//CC TEST
Cypress.Commands.add('loadTranslate', (language) => {
  cy.fixture(`${language}.json`).as('t');
});

// Upload Multiple Attachments
Cypress.Commands.add('uploadMultipleDocuments', function (fileNames) {
  cy.get('@t').then((t) => {
    cy.wrap(fileNames).each((fileName) => {
      cy.fixture(fileName, 'binary')
        .then(Cypress.Blob.binaryStringToBlob)
        .then((fileContent) => {
          cy.get(
            '.mat-mdc-dialog-content>.upload-section>div>form>input'
          ).attachFile({
            fileContent,
            filePath: fileName,
            fileName,
          });
        });
    });
    // Additional assertions for each uploaded file
    cy.get('.upload-section>div>span')
      .invoke('text')
      .then((uploadAreaTxt) => {
        expect(uploadAreaTxt, 'upload Area Txt').to.include(
          t['Drag documents to this area or click here to upload']
        );
      });

    cy.get('.dialog-actions>button>.title')
      .eq(0)
      .invoke('text')
      .then((cancelButton) => {
        expect(cancelButton, 'Cancel Upload document button').to.include(
          t.Cancel
        );
      });

    cy.get('.dialog-actions>button>.title')
      .eq(1)
      .invoke('text')
      .then((uploadButton) => {
        expect(uploadButton, 'Upload document button').to.include(
          t['Upload Documents']
        );
      });

    //OPTIONAL:
    //Upload invalid format valdation - The fileformat will not be supported
    cy.get('.list-item-header>.list-item-status>span')
      .invoke('text')
      .then((errorStatus) => {
        expect(errorStatus, 'Error').to.include(
          t['The fileformat will not be supported']
        );
      });
    cy.wait(1500);

    //Remove invalid file which contains t["The fileformat will not be supported"]
    cy.get('.list-item-status>span');
    cy.contains('.list-item', t['The fileformat will not be supported'])
      .find('.list-item-header>.list-item-actions [data-mat-icon-name="close"]')
      .click();
  });
});

// Upload Multiple Attachments
Cypress.Commands.add('uploadValidMultipleDocuments', function (fileNames) {
  cy.get('@t').then((t) => {
    cy.wrap(fileNames).each((fileName) => {
      cy.fixture(fileName, 'binary')
        .then(Cypress.Blob.binaryStringToBlob)
        .then((fileContent) => {
          cy.get('.dialog-content>.upload-section>div>form>input').attachFile({
            fileContent,
            filePath: fileName,
            fileName,
          });
        });
    });
    cy.wait(1500);
    // Additional assertions for each uploaded file
    cy.get('.upload-section>div>span')
      .invoke('text')
      .then((uploadAreaTxt) => {
        expect(uploadAreaTxt, 'upload Area Txt').to.include(
          t['Drag documents to this area or click here to upload']
        );
      });

    cy.get('.dialog-actions>button>.title')
      .eq(0)
      .invoke('text')
      .then((cancelButton) => {
        expect(cancelButton, 'Cancel Upload document button').to.include(
          t.Cancel
        );
      });

    // cy.get('.dialog-actions>button>.title')
    //   .eq(1)
    //   .invoke('text')
    //   .then((uploadButton) => {
    //     expect(uploadButton, 'Upload document button').to.include(
    //       t['Upload Documents']
    //     );
    //   });
  });
});
//Logout from SW
Cypress.Commands.add('logoutFromSW', () => {
  cy.get('.logout-icon ').click();
  cy.wait(2000);
  cy.get('.confirm-buttons > :nth-child(2)').click();
  cy.url().should('include', 'https://supportviewpayslip.edeja.com/fe/login'); // Validate url
});

// Delete all emails from Admin user's inbox
Cypress.Commands.add('deleteAllEmails', () => {
  cy.visit('https://yopmail.com/en/');
  cy.get('#login').type('aqua.admin@yopmail.com');
  cy.get('#refreshbut > .md > .material-icons-outlined').click();
  cy.get(
    '.wminboxheader > :nth-child(1) > .textu > .material-icons-outlined'
  ).click();

  // Check if the "Delete all" button is enabled
  cy.get('.menu>div>#delall').then(($button) => {
    if (!$button.prop('disabled')) {
      //$button.click(); // Click and delete all emails
      cy.wait(1000);
      cy.wrap($button).click({ force: true }); // Click and delete all emails
      cy.get('.bl').click(); // Back to home page
    } else {
      // If the button is disabled, navigate back to the home page
      cy.get('.bl').click(); // Back to home page
    }
  });

  cy.wait(1500);
});

//*******************************  DTAPART  *************************/

//Custom commands: Taken data from json file
Cypress.Commands.add('loginToDatatpartEbox', () => {
  //Import credentials (un/pw) from 'json' file
  cy.fixture('datapart.json').as('datapart_json');
  cy.get('datapart_json').then((usersJson) => {
    cy.get('#mat-input-0').type(usersJson.username_student);
    cy.get('#mat-input-1').type(usersJson.password_student);
    cy.wait(1000);
    cy.get('app-custom-icon-button').click(); //Click on Login button
  });
  cy.url().should('include', '/deliveries'); // => validate ebrief url (/deliveries page)
  cy.wait(1000);
}); //end

//Custom commands: Taken data from json file
Cypress.Commands.add('loginToDatapart', () => {
  //Import credentials (un/pw) from 'supportView.json' file
  cy.fixture('datapart.json').as('datapart');
  cy.get('@datapart').then((datapartJson) => {
    cy.visit(datapartJson.baseUrl); //Taken from base url
    cy.url().should('include', datapartJson.baseUrl); //Validating url on the login page
    cy.get('#mat-input-0').type(datapart.username_student);
    cy.get('#mat-input-1').type(datapart.password_student);
    cy.wait(1000);
    cy.get('app-custom-icon-button').click();
    cy.url().should('include', '/dashboard/groups'); // => validate url
    cy.wait(2000);
  });
  cy.wait(1000);
}); //end

//Custom commands: Taken data from json file
Cypress.Commands.add('loginToEgEboxAsStudent', () => {
  // Load credentials from JSON file
  cy.fixture('datapart.json').as('datapart');

  // Visit the base URL
  cy.get('@datapart').then((datapartJson) => {
    cy.visit(datapartJson.baseUrl);
    cy.url().should('include', datapartJson.baseUrl);

    // Enter username and password
    cy.get('#mat-input-0').type(datapartJson.username_student);
    cy.get('#mat-input-1').type(datapartJson.password_student);

    cy.wait(1000);

    // Click login button
    cy.get('app-custom-icon-button').click();

    // Wait for dashboard page to load
    cy.url().should('include', '/deliveries');
    cy.wait(2000);
  });
}); //end login
