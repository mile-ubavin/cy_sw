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
        const username = "INVALID_kiam.t.mile@yopmail.com";
        const password = "INVALID_Test1234!";
        //Enter valid credentials
        cy.get('#signInName').type(username)
        cy.get('#password').type(password)
        cy.wait(3000)
        cy.get('.buttons').click().then(function name(buttonText) {
          console.log('Click on Button: ' + buttonText.text())
        })
        //cy.get('.buttons').should('be.disabled'); NE radi
        })
        cy.get('#kiam-login-failed > .userlogin__headline').should('have.text','Login fehlgeschlagen')
        //Promise and .then() command -> showing message in the console
        .then(function name(validationText) {
          console.log('Display Error validation message in the console:  ' + validationText.text())
        }); 
      
        })
      });
      
    
    
    
      
     
    