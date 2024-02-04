/// <reference types="cypress" />
/// <reference types="cypress-xpath" />

describe("Login, Update birthday, Upload doc, Logout", () => {
    beforeEach(() => {
      cy.session('demo', () => {
        cy.loginToEBrief();
      });
    }); 

    it('Update birthday', function(){
      //update persinal data
      cy.visit('https://www.e-brief.at/fe_t/deliveries')
      cy.get(".user-title").click();//switch to perso
        cy.wait(1000);
        cy.get('[color="primary"] > .button').click()
        cy.wait(1000);
        cy.get('[href="/fe_t/settings/personal"]').click()
        //cy.url('https://www.e-brief.at/backend_t/rest/v2/labels/listDeliveryCategory').should("include","/listDeliveryCategory")
        cy.wait(1000)
        cy.get('app-personal-data-settings > app-settings-outlet-wrapper > .outlet-wrap > .settings-section-wrapper > .settings-section-buttons > sc-button > .button').click
        cy.scrollTo("bottom", { duration: 500 });
        cy.get('#mat-input-7').clear().type('12')
        cy.wait(1000)
        cy.get('#mat-input-9').clear().type('1972')
        cy.get('.settings-section-title').click()
        cy.wait(1000)
        cy.get('.button').click()
        cy.wait(3000)
        cy.url('https://www.e-brief.at/fe_t/settings/overview').should("include","https://www.e-brief.at/fe_t/settings/overview")// => validate url after saving
       // cy.get('.mat-snack-bar-container').should('have.text','Die persönlichen Daten wurden erfolgreich gespeichert')
        cy.wait(2000)
    })
  
    //Crete delivery
    it('Upload doc', function(){
      cy.visit('https://www.e-brief.at/fe_t/deliveries')
      cy.get('[iconafter="custom:post-icon-upload"] > #toolbar-toggle_upload').click()
      cy.upload_attachment()
      cy.wait(2000)
      //cy.get('.list-item-status>.success').should('have.text', 'Dokument erfolgreich hochgeladen: ')
      cy.wait(2000)
      cy.contains(" Speichern ").click({ force: true });
    })//end it
      
    //Logout  & Clear saved session
    it("Logout & Clear saved session", function () {
      cy.visit("https://www.e-brief.at/fe_t/deliveries") 
      cy.get(".user-title").click();
      cy.wait(3000);
      cy.get('[color="primary-reverse"] > .button').click();
      Cypress.session.clearAllSavedSessions();//Clear saved session
      cy.url().should("include", "https://www.e-brief.at/fe_t"); // => validate url after logout
    }); //end it
});