describe("Login/Logout to kiam base scenario", () => {

    //Switch to KIAM
    it('Login/Logout to dp_base scenario', function(){
        cy.visit('http://ebox-datapart.edeja.com/datapart/')
        cy.url().should("include", "http://ebox-datapart.edeja.com/datapart/"); // => true
        
        //Enter valid un/pw
        const username = "smile";
        const password = "Test1234!";
        cy.get('#mat-input-0').type(username)
        cy.get('#mat-input-1').type(password)
        cy.get('.mat-form-field-suffix').click()
        cy.wait(2000)
        cy.get('app-custom-icon-button > #login_with_username-login').click()
        //Remove cookie
        cy.url().should("include", "http://ebox-datapart.edeja.com/datapart/deliveries"); // => true
        //Logout
        cy.get('.user-title').click()
        cy.wait(3000)
        cy.get('.logout-title > a').click({ force: true });
        cy.url().should("include", "http://ebox-datapart.edeja.com/datapart/"); // => true
        })
      });