describe('R19_Download CSV report', () => {
  it('Login as Master User - Create User Manually', () => {
    // Login as Master User using a custom command
    cy.loginToSupportViewMaster();
    cy.wait(3500);

    // Close release note pop-up if it appears
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Release note close icon is NOT present');
      }
    });
    cy.wait(1500);

    // Click on Export CSV button
    cy.get('button[color="primary"] > .mdc-button__label')
      .filter((index, el) => {
        const text = Cypress.$(el).text().trim();
        return text === 'Export CSV';
      })
      .click({ force: true });

    // Open Month dropdown and select a random option
    cy.get('form > mat-form-field > div').eq(0).click({ force: true });
    cy.get('#cdk-overlay-1 > div > mat-option').then(($options) => {
      const count = $options.length;
      cy.log(`Number of items in the month dropdown: ${count}`);
      const randomIndex = Math.floor(Math.random() * count);
      cy.wrap($options[randomIndex]).click();
    });
    cy.wait(1500);

    // Open Type dropdown and select a random option
    cy.get('form > mat-form-field > div').eq(2).click({ force: true });
    cy.wait(1500);
    cy.get('mat-option').then(($options) => {
      const count = $options.length;
      cy.log(`Number of items in the type dropdown: ${count}`);
      const randomIndex = Math.floor(Math.random() * count);
      cy.wrap($options[randomIndex]).click();
    });
    cy.wait(1500);

    // Click on Download CSV button
    cy.get('button[type="submit"]').click();
    cy.wait(1000);

    const downloadsDir = `${Cypress.config('downloadsFolder')}`;

    // Get the latest downloaded CSV file
    cy.task('getDownloadedCSV', Cypress.config('downloadsFolder')).then(
      (filePath) => {
        cy.readFile(filePath).then((csvText) => {
          expect(filePath, 'CSV file path should not be null').to.not.be.null;
          cy.log(`Latest CSV File Path: ${filePath}`);

          // cy.readFile(filePath).then((csvText) => {
          //   cy.log('CSV Content:\n' + csvText);

          //   // Optionally, assert expected values are included
          //   // expect(csvText)
          //   //   .to.include(
          //   //     '2;430;sap-android;;;;;e-Gehaltszettel / EBPP;;20250331;;;;;;;60107012;1;;;;;;;;;49;Add-On Digitale Signatur und Mitarbeiter upload;;X'
          //   //   )
          //   //   .or.to.include(
          //   //     '2;430;sap-android;;;;;e-Gehaltszettel / EBPP;;20250430;;;;;;;60107012;1;;;;;;;;;49;Add-On Digitale Signatur und Mitarbeiter upload;;X'
          //   //   );

          //   expect(csvText).to.match(
          //     /2;430;sap-android;;;;;e-Gehaltszettel \/ EBPP;;2025\d{4};;;;;;;60107012;1;;;;;;;;;49;Add-On Digitale Signatur und Mitarbeiter upload;;X/
          //   );
          // });

          // cy.readFile(filePath).then((csvText) => {
          //   const regex =
          //     /^2;430;sap-android;;;;;e-Gehaltszettel \/ EBPP;;2025\d{4};;;;;;;60107012;1;;;;;;;;;49;Add-On Digitale Signatur und Mitarbeiter upload;;X$/gm;
          //   const matches = csvText.match(regex) || [];
          //   expect(matches.length, 'Number of matching rows').to.eq(1);
          // });

          cy.readFile(filePath).then((csvText) => {
            // Define both regex patterns
            const regex1 =
              /^2;430;sap-android;;;;;e-Gehaltszettel \/ EBPP;;2025\d{4};;;;;;;60107012;1;;;;;;;;;49;Add-On Digitale Signatur und Mitarbeiter upload;;X$/gm;

            const regex2 =
              /^2;430;SAP Abba 7774;;;;;e-Gehaltszettel \/ EBPP;ABBA;20250531;;;;;;;60107012;1;;;;;;;;;49;Add-On Digitale Signatur und Mitarbeiter upload;;X$/gm;

            const match1 = csvText.match(regex1) || [];
            const match2 = csvText.match(regex2) || [];

            expect(
              match1.length > 0 || match2.length > 0,
              'Additional material number is shown'
            ).to.be.true;
          });
        });
        cy.pause();
        cy.wait(3500);
        // Automatically open the CSV file
        cy.task('openCSV', filePath);
      }
    );

    // cy.task('getDownloadedCSV', downloadsDir).then((filePath) => {
    //   expect(filePath, 'CSV file path should not be null').to.not.be.null;
    //   cy.log(`Latest CSV File Path: ${filePath}`);

    //   cy.readFile(filePath).then((csvText) => {
    //     const regex1 =
    //       /^2;430;sap-android;;;;;e-Gehaltszettel \/ EBPP;;2025\d{4};;;;;;;60107012;1;;;;;;;;;49;Add-On Digitale Signatur und Mitarbeiter upload;;X$/gm;

    //     const regex2 =
    //       /^2;430;SAP Abba 7774;;;;;e-Gehaltszettel \/ EBPP;ABBA;20250531;;;;;;;60107012;1;;;;;;;;;49;Add-On Digitale Signatur und Mitarbeiter upload;;X$/gm;

    //     const match1 = csvText.match(regex1) || [];
    //     const match2 = csvText.match(regex2) || [];

    //     expect(
    //       match1.length > 0 || match2.length > 0,
    //       'Additional material number is shown'
    //     ).to.be.true;
    //   });
  });
}); //end describe
