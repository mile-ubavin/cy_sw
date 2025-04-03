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

// import '@4tw/cypress-drag-drop';

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
//Login to e-Brief (c)2025
Cypress.Commands.add('loginToEBrief', () => {
  // Visit E-Brief login page
  cy.visit(Cypress.env('baseUrl'), { failOnStatusCode: false });
  cy.wait(1000);

  // Accept Cookies if present
  cy.get('body').then(($body) => {
    if ($body.find('#onetrust-accept-btn-handler').length > 0) {
      cy.get('#onetrust-accept-btn-handler').click();
      cy.wait(1000);
    }
  });

  // Click on "Jetzt Anmelden" to switch to Kiam login page
  cy.contains('button', 'Jetzt Anmelden')
    .should('be.visible')
    .and('be.enabled')
    .click();

  // Handle cross-origin authentication
  cy.origin('https://kiamabn.b2clogin.com', () => {
    // Suppress known exceptions
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('Cannot set properties of null')) {
        return false; // Ignore and continue test
      }
    });

    // Wait for input fields to exist before interacting
    cy.get('body').then(($body) => {
      if ($body.find('#signInName').length === 0) {
        cy.log('Login page not fully loaded, reloading...');
        cy.reload();
      }
    });

    // Wait for input fields to be visible
    cy.get('#signInName', { timeout: 15000 })
      .should('exist')
      .should('be.visible')
      .focus()
      .clear()
      .type(Cypress.env('username_kiam'), { delay: 50 });

    cy.get('#password', { timeout: 15000 })
      .should('exist')
      .should('be.visible')
      .focus()
      .clear()
      .type(Cypress.env('password_kiam'), { delay: 50 });

    // Click login button
    cy.get('button[type="submit"]').should('be.visible').click();
  });

  // Ensure redirect back to E-Brief
  cy.url({ timeout: 10000 }).should('include', '/deliveries');
});

//Custom commands: Taken data from json file and login to E-Brief
Cypress.Commands.add('loginToEBrief_depricate', () => {
  cy.visit('/'); //Taken from base url
  cy.url().should('include', '/'); //Validating url on the dashboard page
  cy.wait(1000);
  cy.get('#onetrust-accept-btn-handler').click(); //Remove Cookie bar
  cy.wait(1000);
  cy.get('button[type="submit"]').should('be.visible').and('be.enabled'); //3 Buttons should be visible and enabled in the landing page (Validation) - optional
  cy.get('.login-form > sc-button > .button')
    .contains('Jetzt Anmelden')
    .click({ force: true });
  //Redirection to Kiam login page
  //cy.url().should("include", "https://login.post.at/kiamprod.onmicrosoft.com"); //Validating KiamProd url
  //cy.url().should('include', 'https://kiamabn.b2clogin.com/'); //Validating KiamTest url
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
  cy.wait(4500);
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

//Login to EG SW as a Master user
Cypress.Commands.add('loginToSupportViewMaster', () => {
  //Import credentials (un/pw) from json file
  cy.visit(Cypress.env('baseUrl'), {
    failOnStatusCode: false,
  });
  cy.url().should('include', '/login'); //Validating url on the login page
  cy.get('.username').type(Cypress.env('username_supportViewMaster'));
  cy.get('.password').type(Cypress.env('password_supportViewMaster'));
  cy.wait(1000);
  cy.get('.login-button').click(); //Trigger Login to SW
  cy.url().should('include', '/dashboard/groups'); // => validate url
  cy.wait(1000);
}); //end

//Login to EG SW as a Admin user
Cypress.Commands.add('loginToSupportViewAdmin', () => {
  cy.visit(Cypress.env('baseUrl'), {
    failOnStatusCode: false,
  });
  cy.url().should('include', '/login'); //Validating url on the login page
  cy.get('.username').type(Cypress.env('username_supportViewAdmin'));
  cy.get('.password').type(Cypress.env('password_supportViewAdmin'));
  cy.wait(1000);
  cy.get('.login-button').click(); //Trigger Login to SW
  cy.url().should('include', '/dashboard/groups'); // => validate url
  // });
  cy.wait(1000);
}); //end

//Login to E-Box
Cypress.Commands.add('loginToEgEbox', () => {
  cy.visit(Cypress.env('baseUrl_egEbox'), {
    failOnStatusCode: false,
  });
  cy.wait(4500);
  // Validate URL on the login page
  cy.url().should('include', Cypress.env('baseUrl_egEbox'));

  //Remove Cookie
  cy.get('body').then(($body) => {
    if ($body.find('#onetrust-policy-title').is(':visible')) {
      // If the cookie bar is visible, click on it and remove it
      cy.get('#onetrust-accept-btn-handler').click();
    } else {
      // Log that the cookie bar was not visible
      cy.log('Cookie bar not visible');
    }
  }); //End Remove Cookie
  cy.wait(1500);
  //Import credentials (un/pw) from 'cypress config' file
  cy.get('input[placeholder="Benutzername"]').type(
    Cypress.env('username_egEbox')
  );
  cy.wait(1000);
  cy.get('input[type="password"]').type(Cypress.env('password_egEbox'));

  cy.wait(1000);

  cy.intercept('POST', '**/rest/v2/deliveries**').as('getDeliveries');
  cy.get('button[type="submit"]').click(); //Login

  cy.wait(['@getDeliveries'], { timeout: 57000 }).then((interception) => {
    // Log the intercepted response
    cy.log('Intercepted response:', interception.response);

    // Assert the response status code
    expect(interception.response.statusCode).to.eq(200);
  });
  cy.url().should('include', '/deliveries'); // => validate url (/deliveries page)
  cy.wait(2000);
}); //end login

// Upload XML file
Cypress.Commands.add('uploadXMLfile', function () {
  cy.fixture('XML_1receiver__(AQUA_ABBA000100279311_ISS BBcare).xml', 'binary')
    .then(Cypress.Blob.binaryStringToBlob)
    .then((fileContent) => {
      cy.get('#input-file').attachFile({
        mimeType: 'text/xml',
        fileContent,
        filePath: 'XML_1receiver__(AQUA_ABBA000100279311_ISS BBcare).xml',
        fileName: 'XML_1receiver__(AQUA_ABBA000100279311_ISS BBcare).xml',
      });
    });
});

// Create new user from XML file
Cypress.Commands.add('createNewUserFromXMLfile', function () {
  cy.fixture('JAT-XML_1receiver__(ISS BBcare).xml', 'binary')
    .then(Cypress.Blob.binaryStringToBlob)
    .then((fileContent) => {
      cy.get('#input-file').attachFile({
        mimeType: 'text/xml',
        fileContent,
        filePath: 'JAT-XML_1receiver__(ISS BBcare).xml',
        fileName: 'JAT-XML_1receiver__(ISS BBcare).xml',
      });
    });
});

// Upload TXT file
Cypress.Commands.add('uploadTXTfile', function () {
  cy.fixture('TXT_1receiver__(AQUA_ABBA000100279311_ISS BBcare).txt', 'binary')
    .then(Cypress.Blob.binaryStringToBlob)
    .then((fileContent) => {
      cy.get('#input-file').attachFile({
        mimeType: 'text/plain',
        fileContent,
        filePath: 'TXT_1receiver__(AQUA_ABBA000100279311_ISS BBcare).txt',
        fileName: 'TXT_1receiver__(AQUA_ABBA000100279311_ISS BBcare).txt',
      });
    });
});

//Upload serviceLIne for ABBA000100279311
Cypress.Commands.add('uploadServiceLine', function () {
  cy.fixture('Serviceline-tid=AQUA_gid=ABBA000100279311.pdf', 'binary')
    .then(Cypress.Blob.binaryStringToBlob)
    .then((fileContent) => {
      cy.get('#input-file').attachFile({
        mimeType: 'application/pdf',
        fileContent,
        filePath: 'Serviceline-tid=AQUA_gid=ABBA000100279311.pdf',
        fileName: 'Serviceline-tid=AQUA_gid=ABBA000100279311.pdf',
      });
    });
});

//UploadServiceLineFile_WithValidAndInvalidTid
Cypress.Commands.add('uploadServiceLineFile_WithValidAndInvalidTid', () => {
  cy.fixture(
    'Serviceline- 2Receivers_VALID_AND_INVALID_TID_(tid=AQUA_gid=ABBA000100279311).pdf',
    'binary'
  )
    .then(Cypress.Blob.binaryStringToBlob)
    .then((fileContent) => {
      cy.get('#input-file').attachFile({
        mimeType: 'application/pdf',
        fileContent,
        filePath:
          'Serviceline- 2Receivers_VALID_AND_INVALID_TID_(tid=AQUA_gid=ABBA000100279311).pdf',
        fileName:
          'Serviceline- 2Receivers_VALID_AND_INVALID_TID_(tid=AQUA_gid=ABBA000100279311).pdf',
      });
    });
});

//Upload pdfDictionary 305_Dictionary_(AQUA_ABBA000100279311)
Cypress.Commands.add('uploadPDFdictionary305', () => {
  cy.fixture('305_Dictionary_(AQUA_ABBA000100279311).pdf', 'binary')
    .then(Cypress.Blob.binaryStringToBlob)
    .then((fileContent) => {
      cy.get('#input-file').attachFile({
        mimeType: 'application/pdf',
        fileContent,
        filePath: '305_Dictionary_(AQUA_ABBA000100279311).pdf',
        fileName: '305_Dictionary_(AQUA_ABBA000100279311).pdf',
      });
    });
});

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

//*Custom commands: Taken data from json file
// Cypress.Commands.add('loginToPayslipSupportViewMaster', () => {
//   //Import credentials (un/pw) from 'supportView.json' file
//   cy.fixture('payslip.json').as('payslip');
//   cy.get('@payslip').then((payslipJson) => {
//     cy.visit(usersJson.baseUrl + '/login'); //Taken from base url
//     cy.url().should('include', '/login'); //Validating url on the login page
//     cy.get('.username').type(payslipJson.username_supportViewMaster);
//     cy.get('.password').type(payslipJson.password_supportViewMaster);
//     cy.wait(1000);
//     cy.get('.login-button').click(); //Trigger Login to SW
//     cy.url().should('include', '/dashboard/groups'); // => validate url
//   });
//   cy.wait(1000);
// }); //end

//getCredentialsFromYopmail
Cypress.Commands.add('getCredentialsFromYopmail', () => {
  const adminUser = Cypress.env('createAdminUser')[0];

  cy.visit('https://yopmail.com/en/');
  cy.get('#login').type(adminUser.email);
  cy.get('#refreshbut > .md > .material-icons-outlined').click();

  cy.iframe('#ifinbox')
    .find('.mctn > .m > button > .lms')
    .then((emails) => {
      const emailSubjects = [...emails].map((email) =>
        email.textContent.trim()
      );
      let usernameEmailIndex = emailSubjects.findIndex((subject) =>
        subject.includes('Neuer Benutzer e-Gehaltszettel Portal – Benutzername')
      );
      let passwordEmailIndex = emailSubjects.findIndex((subject) =>
        subject.includes('Neuer Benutzer e-Gehaltszettel Portal – Passwort')
      );

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
            const username = innerText
              .split('Hier ist Ihr Benutzername:')[1]
              .trim();
            Cypress.env('capturedUsername', username); // Save the username
            cy.log('Captured Username:', username); // Log for verification
            expect(username).not.to.be.undefined; // Assert username is not undefined
          });
      }

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
            const password = innerText
              .split('hier ist Ihr Passwort:')[1]
              .trim();
            Cypress.env('capturedPassword', password); // Save the password
            cy.log('Captured Password:', password); // Log for verification
            expect(password).not.to.be.undefined; // Assert password is not undefined
          });
      }
    });
  cy.wait(4000);
});

// ***************** EG-E-Box *****************

//Custom commands: Taken data from json file

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

//Upload A4 PDF - Mass Upload
Cypress.Commands.add('massUpload', function () {
  cy.fixture('Mass_A4.pdf', 'binary')
    .then(Cypress.Blob.binaryStringToBlob)
    .then((fileContent) => {
      cy.get('#input-file').attachFile({
        fileContent,
        filePath: 'Mass_A4.pdf',
        fileName: 'Mass_A4.pdf',
      });
    });
});

//Upload 305 Dictionary PDF - For AQUA ABBA000100279311
Cypress.Commands.add('upload305Dictionary', function () {
  cy.fixture('305_Dictionary_(AQUA_ABBA000100279311).pdf', 'binary')
    .then(Cypress.Blob.binaryStringToBlob)
    .then((fileContent) => {
      cy.get('#input-file').attachFile({
        fileContent,
        filePath: '305_Dictionary_(AQUA_ABBA000100279311).pdf',
        fileName: '305_Dictionary_(AQUA_ABBA000100279311).pdf',
      });
    });
});

//Upload JPG file to a Quill editor using the attachFile command

Cypress.Commands.add('uploadValidImage', function () {
  cy.fixture('SampleJPGImage_under_1mb.jpg', 'base64').then((fileContent) => {
    // Click on the image button to open file input
    cy.wait(500); // Wait for 500 milliseconds
    cy.get('.ql-image').trigger('mouseover').click({ force: true });

    cy.get('input[type="file"]', { timeout: 20000 }).should('exist'); // Wait for the file input to appear
    cy.pause();

    // Wait for the input field to appear and then upload the file
    cy.get('input[type="file"]', { timeout: 10000 }) // Ensure that the file input field is rendered
      .should('exist')
      .attachFile({
        fileContent: Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg'),
        fileName: 'SampleJPGImage_under_1mb.jpg',
        mimeType: 'image/jpeg',
        encoding: 'utf-8',
      });

    // Optionally, you can add assertions here to confirm the image was uploaded.
  });
});

//Upload CSV file

// Cypress.Commands.add('upload_csv', function () {
//   cy.fixture('SendCredentialsToPrint(2persons).csv', 'binary')
//     .then(Cypress.Blob.binaryStringToBlob)
//     .then((fileContent) => {
//       cy.get('.dialog-content>.upload-section>div>form>input').attachFile({
//         fileContent: Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg'),
//         fileName: 'SampleJPGImage_under_1mb.jpg',
//         mimeType: 'image/jpeg',
//         encoding: 'utf-8',
//       });
//     });
// });

//Upload CSV file

Cypress.Commands.add('upload_csv', function () {
  cy.fixture('SendCredentialsToPrint(2persons).csv', 'binary')
    .then(Cypress.Blob.binaryStringToBlob)
    .then((fileContent) => {
      cy.get('.dialog-content>.upload-section>div>form>input').attachFile({
        fileContent,
        filePath: 'SendCredentialsToPrint(2persons).csv',
        fileName: 'SendCredentialsToPrint(2persons).csv',
        mimeType: 'text/csv',
      });
    });
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

//*******************************  DATAPART  *************************/

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

//Custom commands: Taken data from config file
Cypress.Commands.add('loginToEgEboxAsStudent', () => {
  //Import credentials (un/pw) from json file
  cy.visit(Cypress.env('baseUrl'), {
    failOnStatusCode: false,
  });
  cy.url().should('include', Cypress.env('baseUrl'));

  // Enter username and password

  cy.get('#mat-input-0').type(Cypress.env('username_student'));
  // .type(datapartJson.username_student);
  cy.get('#mat-input-1').type(Cypress.env('password_student'));
  //.type(datapartJson.password_student);

  cy.wait(1000);

  // Click login button
  cy.get('app-custom-icon-button').click();

  // Wait for dashboard page to load
  cy.url().should('include', '/deliveries');
  cy.wait(2000);
}); //end login

//dowload doc
require('cypress-downloadfile/lib/downloadFileCommand');

Cypress.Commands.add('openDownloadedFile', (fileName) => {
  const filePath = `cypress/downloads/${fileName}`;
  const openCommand = Cypress.platform === 'win32' ? 'start' : 'open'; // Windows or Mac

  // cy.exec(`${openCommand} ${filePath}`).then((result) => {
  //   // Optional: Check for successful execution
  //   if (result.code !== 0) {
  //     throw new Error(`Failed to open file: ${result.stderr}`);
  //   }
  // });

  cy.readFile(filePath).then((fileContent) => {
    const pdfBlob = new Blob([fileContent], { type: 'application/pdf' });
    const pdfURL = URL.createObjectURL(pdfBlob);
    cy.window().then((win) => {
      win.location.href = pdfURL; // Opens the PDF in the same tab
    });
  });
});

//Drag and Drop
// import 'cypress-drag-drop';
