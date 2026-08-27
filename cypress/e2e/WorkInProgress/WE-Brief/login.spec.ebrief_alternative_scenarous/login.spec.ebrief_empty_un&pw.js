/// <reference types="cypress" />

describe("Login/Logout to E-Brief_base scenario", () => {

    //Switch to KIAM
    it('Login/Logout to kiam_base scenario', function(){
        cy.visit('https://www.e-brief.at/fe_t')
        cy.url().should("include", "https://www.e-brief.at/fe_t"); // => validate url
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
        cy.wait(3000)
        cy.get('.login-form > sc-button > .button').click();
        //Switching to Kiam
        cy.origin("https://kiamabn.b2clogin.com/kiamabn.onmicrosoft.com/oauth2/v2.0/", ()=>{
        cy.url().should("include", "https://kiamabn.b2clogin.com/kiamabn.onmicrosoft.com"); // => 
        cy.wait(3000)
        cy.get('.buttons').click().then(function name(validationText) {
          console.log('display Error validation message in the console:  ' + validationText.text())
        })
        })
        // cy.contains('Bitte E-Mail Adresse eingeben.').should('be.visible')
        // cy.contains('Bitte Passwort eingeben.').should('be.visible')
        cy.get('.entry > :nth-child(1) > .error > p').should('have.text', 'Bitte E-Mail Adresse eingeben.'); 
        cy.get(':nth-child(2) > .error > p').should('have.text', 'Bitte Passwort eingeben.')
        })
      });
      
    
    
    
      
     
    