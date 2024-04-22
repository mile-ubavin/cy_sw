describe("Login/OPen delivery", () => {
  // Login and Logout
  it("Login and Logout", function () {
    cy.loginToEgEboxAsStudent()

// Open document in HS from document details
// cy.get(".delivery-document").first().click({ force: true });

// Get text of .delivery-label>.label-wrap>.label-name-wrap elements and click on the first element if text is "konto"

cy.get("ul>li")
  .find(".label-list-link")
  .then((inputFieldLabel) => {
    // Get total number of input fields labels
    const listingCount = Cypress.$(inputFieldLabel).length;
    cy.log("number of labels: ", listingCount);

    // Array to store labels that don't match "Sepa" or "Raten"
    const filteredLabels = [];

    // Iterate through each label and filter out those that don't match
    cy.get('ul>li>.label-list-link>a').each(($el) => {
      const labelText = $el.text().trim();
      if (labelText !== "Sepa" && labelText !== "Ratenvereinbarung") {
        filteredLabels.push(labelText);
      }
    }).then(() => {
      // Randomly select a label from the filtered array
      const randomIndex = Math.floor(Math.random() * filteredLabels.length);
      const selectedLabel = filteredLabels[randomIndex];
      cy.log("Randomly selected label: ", selectedLabel);

      // Optionally, you can do something with the selected label, like click on it
      cy.contains('ul>li>.label-list-link>a', selectedLabel).click();
    });
  });

  cy.get('.odd-row-cell').first().click({ force: true })
    // cy.get(":nth-child(1) > .documents-cell > .full-cell-text-content").click({
    //   force: true,
    // }); //select first delivery, open document details
    // cy.get(".delivery-document").first().click({ force: true }); //open document in hs (from doc. details)
    // cy.wait(4000);

//     cy.get(".signatures-container>.signature-actions>a").click({ force: true }); //open add new signature dialog
//     cy.get("#mat-input-6").clear().type("Change position of signature dialog"); //Clear Input field & Enter signee name
//     cy.get(".mat-mdc-dialog-actions > .mat-accent").click({ force: true }); //Confirm Signee name

// //Change position of siganture dialog
//     cy.get(".signature-methods")
//       .trigger("mouseover")
//       .trigger("mousedown", { which: 1, eventConstructor: "MouseEvent" })
//       .trigger("mousemove", {
//         which: 1,
//         screenX: 920,
//         screenY: 220,
//         clientX: 920,
//         clientY: 220,
//         pageX: 920,
//         pageY: 220,
//         eventConstructor: "MouseEvent",
//       });
//     //.trigger('mouseup', { force: true })
//     //Scroll to the top
//     cy.get(".scrollbar-thumb")
//       .trigger("mouseover")
//       .trigger("mousedown", { which: 1, eventConstructor: "MouseEvent" })
//       .trigger("mousemove", {
//         which: 1,
//         screenY: 220,
//         clientY: 220,
//         pageY: 220,
//         eventConstructor: "MouseEvent",
//       })
//       .trigger("mouseup", { force: true }); //End scroll
//     cy.wait(2000);
//     cy.get(
//       ".placer-actions > .mat-accent > .mat-mdc-button-touch-target"
//     ).click({
//       force: true,
//     });
//     //Sign documet using Touch-Signature
//     cy.get('.sign-methods-container>button[title="Touch-Signatur"]').click({
//       force: true,
//     });
//     cy.get(".sign-canvas").then((res) =>
//       console.log(res[0].getBoundingClientRect())
//     );
//     cy.get(".sign-canvas")
//     .trigger("mouseover")
//     .trigger("mousedown", { which: 1, eventConstructor: "MouseEvent" });

//   // Simulate movement to draw a wave shape without lines
//   // Adjust the parameters to customize the wave
//   for (let i = 0; i <= 360; i += 10) {
//     const x = 520 + i; // Adjust X-coordinate
//     const y = 620 + Math.sin((i * Math.PI) / 180) * 50; // Adjust amplitude and frequency
//     cy.get(".sign-canvas").trigger("mousemove", {
//       which: 1,
//       screenX: x,
//       screenY: y,
//       clientX: x,
//       clientY: y,
//       pageX: x,
//       pageY: y,
//       eventConstructor: "MouseEvent",
//     });
//   }
//   cy.get(".sign-canvas").trigger("mouseup", { force: true });
//   cy.wait(2000);
//   cy.get(
//     ".mat-sign-actions-desktop > .mat-accent > .mat-mdc-button-touch-target"
//   ).click({ force: true }); //Click on confirm button
//   //Click on Save button
//   // cy.get(".saveSessionTemp").click(); //Select signed placeholder
//   // //Validate notification-message
//   cy.get(".success-notification>.notification-message")
//     .should("be.visible")
//     .should("have.text", " Signatur wurde erfolgreich erstellt. ");
// cy.wait(2000)
//   //Cancel signture doc
//   // Click on the "Cancel" button
//   // Get label text from buttons and click if it equals "SCHLIESSEN"
//   cy.get('.save-and-exit>button>.mdc-button__label').each(($button) => {
//     const labelText = $button.text().trim();
//     cy.log(labelText)
//     if (labelText === "SCHLIESSEN") {
//       cy.wrap($button).click();
//     }
//   });

//   // //Logout
//         cy.get('.side-menu-section-desktop>.arrow-icon>button[aria-label="Benutzereinstellungen öffnen"]').click()
//         cy.wait(3000)
//         cy.get('.logout-title > a').click({ force: true });
//         cy.url().should("include", "https://datapart.post-business-solutions.at/pf.datapart/"); // => true
  })
});

