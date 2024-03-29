/// <reference types="cypress" />

describe("Login/Logout to kiam base scenario", () => {

    //Switch to KIAM
    it('Login/Logout to kiam_base scenario', function(){
        cy.visit('https://www.e-brief.at/fe_t')
        cy.url().should("include", "https://www.e-brief.at/fe_t"); // => true
        cy.wait(3000)
        cy.get('#onetrust-accept-btn-handler').click({ force: true });
        cy.wait(3000)
        cy.get('.login-form > sc-button > .button').click();
        //Enter valid un/pw
        cy.url().should("include", "https://kiamabn.b2clogin.com/kiamabn.onmicrosoft.com"); // => true
        const username = "kiam.t.mile@yopmail.com";
        const password = "Test1234!";
        cy.get('#signInName').type(username)
        cy.get('#password').type(password)
        cy.wait(3000)
        cy.get('.buttons').click()
        //Remove cookie
        cy.url().should("include", "https://www.e-brief.at/fe_t/deliveries"); // => true
        //Logout
        cy.get('.user-title').click()
        cy.wait(3000)
        cy.get('[color="primary-reverse"] > .button').click({ force: true });
        })
      });
      
    
    
    
      
     
    