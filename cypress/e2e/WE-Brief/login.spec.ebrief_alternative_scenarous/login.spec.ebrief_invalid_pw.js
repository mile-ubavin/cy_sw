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
        const username = "kiam.t.mile@yopmail.com";
        const password1 = "INVALID_Test1234!"
        const password2 = "test1234!"
        //const password3 = "    Test1234!    "
        //Enter valid credentials
        cy.get('#signInName').type(username)
        cy.get('#password').type(password1)
        cy.get('#showPassword').click()
        cy.wait(3000)
        cy.get('.buttons').click()
        cy.get('#password').clear()
        //invalid pass 2 (case sensitive)
        cy.get('#password').type(password2)
        cy.wait(3000)
        cy.get('.buttons').click()
        cy.get('#password').clear()
         //invalid pass 2 (trim)
        //  cy.get('#password').type(password3)
        //  cy.wait(3000)
        //  cy.get('.buttons').click()
        })
        cy.get('#kiam-login-failed > .userlogin__headline').should('have.text','Login fehlgeschlagen')
        cy.wait(2000)
        cy.get('.buttons').click()
        cy.get('.entry-item--error > .error > p').should('have.text','Bitte Passwort eingeben.')
        cy.end()
        })
      });
      
    
    
    
      
     
    