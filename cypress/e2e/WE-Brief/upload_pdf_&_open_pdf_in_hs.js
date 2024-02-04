/// <reference types="cypress" />
/// <reference types="cypress-xpath" />

describe("Login, Crete_delivery-Upload_doc(pdf), Logout", () => {
  beforeEach(() => {
    cy.session("login_data", () => {
      cy.loginToEBrief();
    });
  });

  // Creating delivery
  it("Crete_delivery-Upload_doc(pdf)", function () {
    cy.visit("/deliveries");
    cy.get(
      '[iconafter="custom:post-icon-upload"] > #toolbar-toggle_upload'
    ).click();
    cy.upload_attachment(); //upload pdf documents from fixtures folder - custom command
    cy.wait(2000);
    //cy.get('.list-item-status>.success').should('have.text', 'Dokument erfolgreich hochgeladen: ')
    cy.wait(2000);
    cy.contains(" Speichern ").click({ force: true });
    cy.wait(2000);
  }); //end it

  //Open doc in hs and sign pdf using Touch-Signatur sign. method
  // it("Open doc in hs and sign pdf using Touch-Signatur sign. method", () => {
  //   cy.visit("/deliveries");
  //   cy.get(":nth-child(1) > .documents-cell > .full-cell-text-content").click({
  //     force: true,
  //   }); //select first delivery, open document details
  //   cy.get(".delivery-document").first().click({ force: true }); //open document in hs (from doc. details)
  //   cy.wait(2000);
  //   cy.get(
  //     ".signature-actions > .mat-focus-indicator > .mat-button-wrapper"
  //   ).click({ force: true }); //open add new signature dialog
  //   cy.get("#mat-input-5").clear().type("Cypress-Test"); //Clear Input field & Enter signee name
  //   cy.get(".mat-dialog-actions > .mat-accent").click({ force: true }); //Confirm position of siganture dialog
  //   cy.get(".placer-actions > .mat-accent > .mat-button-wrapper").click({
  //     force: true,
  //   });
  //   //Sign documet using Touch-Signatur
  //   cy.get('.sign-methods-container>button[title="Touch-Signatur"]').click({
  //     force: true,
  //   });
  //   cy.get(".sign-canvas").then((res) =>
  //     console.log(res[0].getBoundingClientRect())
  //   );
  //   cy.get(".sign-canvas")
  //     .trigger("mouseover")
  //     .trigger("mousedown", { which: 1, eventConstructor: "MouseEvent" })
  //     .trigger("mousemove", {
  //       which: 1,
  //       screenX: 720,
  //       screenY: 920,
  //       clientX: 720,
  //       clientY: 920,
  //       pageX: 720,
  //       pageY: 920,
  //       eventConstructor: "MouseEvent",
  //     })
  //     .trigger("mouseup", { force: true });
  //   cy.wait(2000);
  //   cy.get(".mat-dialog-actions > .mat-accent").click({ force: true }); //Click on confirm button
  // });

  //Change position of signature dilog
  it("Open doc in hs, Change position of signature dilog, Sign pdf using Touch-Signatur sign. method", () => {
    cy.visit("/deliveries");
    cy.get(":nth-child(1) > .documents-cell > .full-cell-text-content").click({
      force: true,
    }); //select first delivery, open document details
    cy.get(".delivery-document").first().click({ force: true }); //open document in hs (from doc. details)
    cy.wait(2000);
    cy.get(
      ".signature-actions > .mat-focus-indicator > .mat-button-wrapper"
    ).click({ force: true }); //open add new signature dialog
    cy.get("#mat-input-5").clear().type("Change position of signature dialog"); //Clear Input field & Enter signee name
    cy.get(".mat-dialog-actions > .mat-accent").click({ force: true }); //Confirm Signee name

    //Change position of siganture dialog
    cy.get(".signature-methods")
      .trigger("mouseover")
      .trigger("mousedown", { which: 1, eventConstructor: "MouseEvent" })
      .trigger("mousemove", {
        which: 1,
        screenX: 920,
        screenY: 220,
        clientX: 920,
        clientY: 220,
        pageX: 920,
        pageY: 220,
        eventConstructor: "MouseEvent",
      });
    //.trigger('mouseup', { force: true })
    //Scroll to the top
    cy.get(".scrollbar-thumb")
      .trigger("mouseover")
      .trigger("mousedown", { which: 1, eventConstructor: "MouseEvent" })
      .trigger("mousemove", {
        which: 1,
        screenY: 220,
        clientY: 220,
        pageY: 220,
        eventConstructor: "MouseEvent",
      })
      .trigger("mouseup", { force: true }); //End scroll
    cy.wait(2000);
    cy.get(".placer-actions > .mat-accent > .mat-button-wrapper").click({
      force: true,
    });
    //Sign documet using Touch-Signatur
    cy.get('.sign-methods-container>button[title="Touch-Signatur"]').click({
      force: true,
    });
    cy.get(".sign-canvas").then((res) =>
      console.log(res[0].getBoundingClientRect())
    );
    cy.get(".sign-canvas")
      .trigger("mouseover")
      .trigger("mousedown", { which: 1, eventConstructor: "MouseEvent" })
      .trigger("mousemove", {
        which: 1,
        screenX: 720,
        screenY: 920,
        clientX: 720,
        clientY: 920,
        pageX: 720,
        pageY: 920,
        eventConstructor: "MouseEvent",
      })
      .trigger("mouseup", { force: true });
    cy.wait(2000);
    cy.get(".mat-dialog-actions > .mat-accent").click({ force: true }); //Click on confirm button
    cy.get(".signed").click(); //Select signed placeholder
    cy.get(".signature-text").should(
      "have.text",
      "Change position of signature dialog"
    ); //Validation
    cy.get(".session-save-section > .mat-accent").click();
    cy.url().should("include", "/deliveries");
  });

  // it('Open doc in hs and sign pdf using Externe-Signatur sign. method', () => {
  //   cy.visit('/deliveries')
  //   cy.get(':nth-child(1) > .documents-cell > .full-cell-text-content').click({ force: true })//select first delivery, open document details
  //   cy.get('.delivery-document').first().click({ force: true })//open document in hs (from doc. details)
  //   cy.wait(2000)
  //   cy.get('.signature-actions > .mat-focus-indicator > .mat-button-wrapper').click({ force: true })//open add new signature dialog
  //   cy.get('#mat-input-5').clear().type('Cypress-Test')//Clear Input field & Enter signee name
  //   cy.get('.mat-dialog-actions > .mat-accent').click({ force: true })//Confirm position of siganture dialog
  //   cy.get('.placer-actions > .mat-accent > .mat-button-wrapper').click({ force: true })
  //   //cy.get('.placer-actions > .mat-accent > .mat-button-wrapper>button["title="Externe Signatur"]').click({ force: true })
  //   //Sign documet using Touch-Signatur
  //   cy.get('#icon-open-in-new').click()
  // });

  //Logout  & Clear saved session
  it("Logout & Clear saved session", function () {
    cy.visit("/deliveries");
    cy.get(".user-title").click();
    cy.wait(3000);
    cy.get('[color="primary-reverse"] > .button').click();
    Cypress.session.clearAllSavedSessions(); //Clear saved session
    cy.url().should("include", "/"); // => validate url after logout
  }); //end it
});
