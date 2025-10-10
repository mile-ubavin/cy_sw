/// <reference types="cypress" />
/// <reference types="cypress-xpath" />

describe('Login, Crete_delivery-Upload_doc(pdf), Logout', () => {
  beforeEach(() => {
    cy.session('login_data', () => {
      cy.loginToEBrief();
    });
  });

  let uploadDateTime; // shared across tests

  before(() => {
    // prepare document and capture uploadDateTime
    const now = new Date();
    const formattedDate = now.toLocaleDateString('de-DE');
    const formattedTime = now.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    uploadDateTime = `${formattedDate} ${formattedTime}`;
    Cypress.env('uploadDateTime', uploadDateTime);
  });

  // Creating delivery
  it('Crete_delivery-Upload_doc(pdf)', function () {
    cy.visit('/deliveries');
    cy.get('#toolbar-toggle_upload').click();
    cy.upload_attachment(); //upload pdf documents from fixtures folder - custom command
    cy.wait(2000);

    let randomString = Math.random().toString(15).substring(2); //Generating random string
    const title = 'Upload pdf - ' + randomString;
    cy.get('#mat-input-5').type(title);
    cy.wait(2000);
    cy.contains(' Speichern ').click({ force: true });
    cy.wait(1500);
    cy.log('Test completed successfully.');
  }); //end it

  //Open doc in hs, change position of signature dilog, sign it and Save changes
  it('Open doc in hs, Change position of signature dilog, Sign pdf using Touch-Signatur sign. method and Save changes', () => {
    cy.visit('/deliveries');
    cy.get(':nth-child(1) > .documents-cell > .full-cell-text-content').click({
      force: true,
    }); //select first delivery, open document details
    cy.get('.delivery-document').first().click({ force: true }); //open document in hs (from doc. details)
    cy.wait(4000);
    cy.get('.signatures-container>.signature-actions>a').click({ force: true }); //open add new signature dialog
    cy.get('#mat-input-5').clear().type('Change position of signature dialog'); //Clear Input field & Enter signee name
    cy.get('.mat-mdc-dialog-actions > .mat-accent').click({ force: true }); //Confirm Signee name

    //Change position of siganture dialog
    cy.get('.signature-methods')
      .trigger('mouseover')
      .trigger('mousedown', { which: 1, eventConstructor: 'MouseEvent' })
      .trigger('mousemove', {
        which: 1,
        screenX: 920,
        screenY: 220,
        clientX: 920,
        clientY: 220,
        pageX: 920,
        pageY: 220,
        eventConstructor: 'MouseEvent',
      });

    cy.pause();
    //.trigger('mouseup', { force: true })
    // //Scroll to the top
    // cy.get('.scrollbar-thumb')
    //   .trigger('mouseover')
    //   .trigger('mousedown', { which: 1, eventConstructor: 'MouseEvent' })
    //   .trigger('mousemove', {
    //     which: 1,
    //     screenY: 220,
    //     clientY: 220,
    //     pageY: 220,
    //     eventConstructor: 'MouseEvent',
    //   })
    //   .trigger('mouseup', { force: true }); //End scroll
    cy.wait(2000);
    cy.get(
      '.placer-actions > .mat-accent > .mat-mdc-button-touch-target'
    ).click({
      force: true,
    });
    //Sign documet using Touch-Signature
    cy.get('.sign-methods-container>button[title="Touch-Signatur"]').click({
      force: true,
    });
    cy.get('.sign-canvas').then((res) =>
      console.log(res[0].getBoundingClientRect())
    );
    // cy.get(".sign-canvas")
    //   .trigger("mouseover")
    //   .trigger("mousedown", { which: 1, eventConstructor: "MouseEvent" })

    //   .trigger("mousemove", {
    //     which: 1, // Button code for left mouse button
    //     screenX: 520, // X-coordinate of the mouse pointer in screen coordinates
    //     screenY: 620, // Y-coordinate of the mouse pointer in screen coordinates
    //     clientX: 520, // X-coordinate of the mouse pointer in client coordinates (relative to the viewport)
    //     clientY: 620, // Y-coordinate of the mouse pointer in client coordinates (relative to the viewport)
    //     pageX: 520, // X-coordinate of the mouse pointer in page coordinates (relative to the whole document)
    //     pageY: 620, // Y-coordinate of the mouse pointer in page coordinates (relative to the whole document)
    //     eventConstructor: "MouseEvent", // Specify the event constructor (optional)
    //   })
    //   .trigger("mouseup", { force: true });
    // cy.wait(2000);
    // cy.get(".sign-canvas")
    //   .trigger("mouseover")
    //   .trigger("mousedown", { which: 1, eventConstructor: "MouseEvent" })
    //   //Draw line
    //   .trigger("mousemove", {
    //     which: 1,
    //     screenX: 520,
    //     screenY: 620,
    //     clientX: 520,
    //     clientY: 620,
    //     pageX: 520,
    //     pageY: 620,
    //     eventConstructor: "MouseEvent",
    //   });

    // // Draw line and  wave shape
    // // Adjust the coordinates and iteration count to create your desired shape
    // for (let i = 1; i <= 40; i++) {
    //   // Triple the number of iterations
    //   cy.get(".sign-canvas").trigger("mousemove", {
    //     which: 1,
    //     screenX: 520 + i * 15, // Adjust X-coordinate for wave shape
    //     screenY: 520 + Math.sin(i) * 15, // Adjust Y-coordinate for wave shape
    //     clientX: 520 + i * 15,
    //     clientY: 520 + Math.sin(i) * 15,
    //     pageX: 520 + i * 15,
    //     pageY: 520 + Math.sin(i) * 15,
    //     eventConstructor: "MouseEvent",
    //   });
    // }

    // cy.get(".sign-canvas").trigger("mouseup", { force: true });
    // cy.wait(2000);
    cy.get('.sign-canvas')
      .trigger('mouseover')
      .trigger('mousedown', { which: 1, eventConstructor: 'MouseEvent' });

    // Simulate movement to draw a wave shape without lines
    // Adjust the parameters to customize the wave
    for (let i = 0; i <= 360; i += 10) {
      const x = 520 + i; // Adjust X-coordinate
      const y = 620 + Math.sin((i * Math.PI) / 180) * 50; // Adjust amplitude and frequency
      cy.get('.sign-canvas').trigger('mousemove', {
        which: 1,
        screenX: x,
        screenY: y,
        clientX: x,
        clientY: y,
        pageX: x,
        pageY: y,
        eventConstructor: 'MouseEvent',
      });
    }

    cy.get('.sign-canvas').trigger('mouseup', { force: true });
    cy.wait(2000);
    cy.get(
      '.mat-sign-actions-desktop > .mat-accent > .mat-mdc-button-touch-target'
    ).click({ force: true }); //Click on confirm button
    //Click on Save button
    cy.get('.saveSessionTemp').click(); //Select signed placeholder
    //Validate notification-message
    cy.get('.success-notification>.notification-message')
      .should('be.visible')
      .should('have.text', ' Signatur wurde erfolgreich erstellt. ');
  });

  //'Sign the Document in hybridsign
  it.only('Sign the Document in hybridsign (c)2025', () => {
    cy.visit('/deliveries');
    cy.wait(2000);

    // Capture the current date and time in the specified format
    const now = new Date();
    const formattedDate = now.toLocaleDateString('de-DE'); // Format as dd.mm.yyyy
    const formattedTime = now.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    uploadDateTime = `${formattedDate} ${formattedTime}`;
    cy.log(`Upload DateTime: ${uploadDateTime}`);

    cy.wait(2500);

    //Open init session
    cy.intercept('POST', '**/rest/v2/hybridSign/initSession').as('initSession');

    cy.get(':nth-child(1) > .documents-cell > .full-cell-text-content').click({
      force: true,
    });
    cy.get('.delivery-document').first().click({ force: true });

    cy.wait('@initSession', { timeout: 17000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    //Click on Add New Signature button
    cy.wait(2500);
    cy.get('.signatures-container>.signature-actions>a').click({
      force: true,
    }); //open add new signature dialog
    cy.wait(2000);

    //Add Signee name
    const signee = `Signee - ${uploadDateTime}`;

    cy.get('input[formcontrolname="signee"]').clear().type(signee); // Enter signee name
    cy.wait(2500);

    //Confirm Signee name
    cy.get('.mat-mdc-dialog-actions>button>.mdc-button__label')
      .contains(/NEXT|WEITER/i)
      .should('be.visible') // Optional: Ensure the button is visible before interacting
      .click(); // Click the button
    cy.wait(4500);

    //Change position of siganture dialog
    cy.get('.signature-methods')
      .trigger('mouseover')
      .trigger('mousedown', { which: 1, eventConstructor: 'MouseEvent' })
      .trigger('mousemove', {
        which: 1,
        screenX: 750,
        screenY: 800,
        clientX: 750,
        clientY: 800,
        pageX: 750,
        pageY: 800,
        eventConstructor: 'MouseEvent',
      })
      .trigger('mouseup', { force: true });
    cy.get(
      '.placer-actions > .mat-accent > .mat-mdc-button-touch-target'
    ).click({
      force: true,
    });
    cy.wait(2500);

    //Click on Touch Signature

    cy.get('.touch-signature-button > .mat-mdc-button-touch-target').each(
      ($button, index, $list) => {
        cy.wrap($button).click({ force: true });

        // Simulate signing on the canvas
        cy.get('.sign-canvas')
          .trigger('mouseover')
          .trigger('mousedown', { which: 1, eventConstructor: 'MouseEvent' })
          .trigger('mousemove', {
            which: 1,
            screenX: 410,
            screenY: 530,
            clientX: 530,
            clientY: 560,
            pageX: 500,
            pageY: 600,
            eventConstructor: 'MouseEvent',
          })
          .trigger('mouseup', { force: true });

        cy.wait(2000);

        cy.intercept('GET', '**/getIdentifications?**').as(
          'getIdentifications'
        );

        // Confirm the signature
        cy.get(
          '.mat-sign-actions-desktop > .mat-accent > .mat-mdc-button-touch-target'
        ).click({ force: true });

        cy.wait('@getIdentifications', { timeout: 17000 }).then(
          (interception) => {
            expect(interception.response.statusCode).to.eq(200);
            cy.log(`Signature ${index + 1} of ${$list.length} completed.`);
            cy.wait(1500);

            //Validate Success message
            cy.get('.success-notification>.notification-message')
              .should('be.visible')
              .should('have.text', ' Signatur wurde erfolgreich erstellt. ');
          }
        );
      }
    );
  });

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
