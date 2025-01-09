describe('Disable XML template by Masteruser', () => {
  // Custom command to load t (translate) based on the selected language
  Cypress.Commands.add('loadTranslate', (language) => {
    cy.fixture(`${language}.json`).as('t');
  });
  //getOppositeLanguage
  function getOppositeLanguage(currentLanguage) {
    return currentLanguage === 'English' ? 'German' : 'English';
  }
  //IT TEST
  it('Diasable xml teplate by Masteruser', () => {
    cy.loginToSupportViewMaster(); //login as a masteruser
    cy.intercept(
      'GET',
      'https://supportviewpayslip.edeja.com/be/supportView/v1/group/template/tenant/AQUA'
    ).as('apiRequest');
    //get language
    cy.get('#mat-select-value-1')
      .invoke('text')
      .then((selectedLanguage) => {
        const oppositeLanguage = getOppositeLanguage(selectedLanguage.trim());
        cy.log(`Selected Languages: ${selectedLanguage}`);
        cy.log(`Switching to Opposite Language: ${oppositeLanguage}`);

        // Select the opposite language
        cy.selectLanguage(oppositeLanguage);
        cy.wait(1000);
        // Load t based on the opposite language
        cy.loadTranslate(oppositeLanguage);
        cy.wait(1000);
      });
    cy.get('@t').then((t) => {
      //Search for Group section
      // cy.get('#searchButton>span')
      //   .invoke('text')
      //   .then((search) => {
      //     expect(search, 'Search:').to.include(t['Search']);
      //   });
      cy.get('#searchButton>span').click(); //Click on search button
      //Check translate labels on Search dialog
      // cy.get('.search-dialog>form>.form-fields>.searchText-wrap>.label')
      //   .eq(0)
      //   .invoke('text')
      //   .then((searchLabel) => {
      //     expect(searchLabel, 'Account Number').to.include(t['Account Number']);
      //   }); //end
      // cy.get('.search-dialog>form>.form-fields>.searchText-wrap>.label')
      //   .eq(0)
      //   .invoke('text')
      //   .then((searchLabel) => {
      //     expect(searchLabel, 'Display Name').to.include(t['Display Name']);
      //   }); //end
      // cy.get('.search-dialog>form>.form-fields>.searchText-wrap>.label')
      //   .eq(2)
      //   .invoke('text')
      //   .then((searchLabel) => {
      //     expect(searchLabel, 'Description').to.include(t['Description']);
      //   }); //end

      //Check Action buttons translate
      // cy.get('.search-dialog>form>.form-actions>button>.mdc-button__label')
      //   .eq(0)
      //   .invoke('text')
      //   .then((searchButton) => {
      //     expect(searchButton, 'resetUserSearch:').to.include(
      //       t['resetUserSearch']
      //     );
      //   }); //end
      // cy.get('.search-dialog>form>.form-actions>button>.mdc-button__label')
      //   .eq(1)
      //   .invoke('text')
      //   .then((searchButton) => {
      //     expect(searchButton, 'searchUse').to.include(t['searchUser']);
      //   }); //end

      //Search for Group by Display Name
      cy.fixture('supportView.json').then((data) => {
        // Use the company name from the JSON file
        const companyName = data.company;
        // Search for Group by Display Name using the company name
        cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
          .eq(1)
          .type(companyName);
      }); //end fixture

      //Find the Search button by button name and click on it
      const search = t['searchUser'];
      cy.get('.search-dialog>form>.form-actions>button')
        .contains(search)
        .click();

      //Action buttons labels
      cy.get('.action-buttons>button>.mdc-button__label')
        .eq(0)
        .invoke('text')
        .then((actionButton) => {
          expect(actionButton, 'Edit button').to.include(t['Edit']);
        }); //end

      cy.get('.action-buttons>button>.mdc-button__label')
        .eq(1)
        .invoke('text')
        .then((actionButton) => {
          expect(actionButton, 'Assign XML Template').to.include(
            t['Assign XML Template']
          );
        }); //end

      cy.get('.action-buttons>button>.mdc-button__label')
        .eq(2)
        .invoke('text')
        .then((actionButton) => {
          expect(actionButton, 'Assign PDF Dictionary').to.include(
            t['Assign PDF Dictionary']
          );
        }); //end

      cy.get('.action-buttons>button>.mdc-button__label')
        .eq(3)
        .invoke('text')
        .then((actionButton) => {
          expect(actionButton, 'Admin User').to.include(t['Admin User']);
        }); //end

      cy.get('.action-buttons>button>.mdc-button__label')
        .eq(4)
        .invoke('text')
        .then((actionButton) => {
          expect(actionButton, 'User').to.include(t['User']);
        }); //end
      //Search for XML Template button by name - using translate
      const assignXmlTemplateButtonText = t['Assign XML Template'];
      cy.get('.action-buttons button')
        .contains(assignXmlTemplateButtonText)
        .click(); //Click on button
      cy.get('table > tbody > tr').each(($el, index, $list) => {
        cy.log(`Element ${index + 1}: ${$el.text()}`);
      });

      let searchCriteria; // Declare searchCriteria

      // Load search criteria from the 'supportWiev.json' file
      cy.fixture('supportView.json').then((data) => {
        // Log searchCriteria from json'
        searchCriteria = data.disableXML.map((item) => item.name);
        cy.log(searchCriteria);

        // Start the process by finding elements based on search criteria
        // Verify message from response
        cy.wait('@apiRequest').then((interception) => {
          // Log the status code (200)
          cy.log(`Status Code: ${interception.response.statusCode}`);
          // Log response body
          const responseBody = interception.response.body;
          cy.log('Response Body:', responseBody);
          //Sort by assigne - assigned xml templates move at the top
          responseBody.sort((a, b) => {
            if (a.assigned && !b.assigned) {
              return -1; // a comes before b
            } else if (!a.assigned && b.assigned) {
              return 1; // b comes before a
            } else {
              return 0; // Keep the same order
            }
          });
          // Log only the elements with assigned: true
          const assignedTrueElements = [];
          for (let i = 0; i < searchCriteria.length; i++) {
            const criteria = searchCriteria[i];
            const matchedElement = responseBody.find(
              (item) => item.name === criteria && item.assigned
            );
            if (matchedElement) {
              assignedTrueElements.push(matchedElement);
              cy.log(
                'YES UNCHECKED ELEMENT FROM SEARCH CITERIA IS SUCCESFULLY FOUNDED'
              );
            } else {
              cy.log(
                'NO ELEMENTS - ALL ELEMENTS FROM SEARCH CITERIA ARE UNCHECKED'
              );
            }
          }
          // Uncheck elements with assigned: true
          cy.log('Elements with assigned: true after search:');
          cy.wrap(assignedTrueElements).each((item) => {
            cy.log(
              `ID: ${item.id}, Name: ${item.name}, Assigned: ${item.assigned}`
            );
            cy.contains('table > tbody > tr > td', item.name)
              .parent()
              .find('td:first-child input[type="checkbox"]')
              .should('be.visible')
              .uncheck({ force: true }); // Use force if needed
          });
        });
      });
      //Find the Send button by txt
      const buttonTxt = t['Save'];
      cy.get('.dictionary-xml__actions>button>.title')
        .contains(buttonTxt)
        .click();
      //Check validation message
      cy.get(
        '#mat-snack-bar-container-live-0>div>.mat-mdc-simple-snack-bar>.mat-mdc-snack-bar-label'
      )
        .invoke('text')
        .then((message) => {
          expect(message, 'Success Message ').to.include(
            t['XML template was assigned successfully']
          );
        }); //end
    }); //end TRANSLATE
    cy.wait(2500);
    // Logout;
    cy.logoutFromSW();
  }); //end it

  //********************************************************************************* */

  //IT TEST
  it.only('Diasable xml teplate by Masteruser', () => {
    cy.loginToSupportViewMaster(); //login as a masteruser
    cy.intercept(
      'GET',
      'https://supportviewpayslip.edeja.com/be/supportView/v1/group/template/tenant/AQUA'
    ).as('apiRequest');
    //get language
    cy.get('#mat-select-value-1')
      .invoke('text')
      .then((selectedLanguage) => {
        const oppositeLanguage = getOppositeLanguage(selectedLanguage.trim());
        cy.log(`Selected Languages: ${selectedLanguage}`);
        cy.log(`Switching to Opposite Language: ${oppositeLanguage}`);

        // Select the opposite language
        cy.selectLanguage(oppositeLanguage);
        cy.wait(1000);
        // Load t based on the opposite language
        cy.loadTranslate(oppositeLanguage);
        cy.wait(1000);
      });
    cy.get('@t').then((t) => {
      //Search for Group section
      // cy.get('#searchButton>span')
      //   .invoke('text')
      //   .then((search) => {
      //     expect(search, 'Search:').to.include(t['Search']);
      //   });
      cy.get('#searchButton>span').click(); //Click on search button

      // Search for Group by Display Name using the company name
      cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
        .eq(1)
        .type(Cypress.env('company')); // Use the company name from the cypress.config.js
      cy.wait(1500);
      //Find the Search button by button name and click on it
      cy.get('.search-dialog>form>div>.mat-primary').click();
      cy.wait(1500);

      //Search for XML Template button by name - using translate
      cy.get('.mdc-button__label')
        .contains(/Assign XML Template|XML Template zuweisen/i)
        .should('be.visible')
        .click();

      // const assignXmlTemplateButtonText = t['Assign XML Template'];
      // cy.get('.action-buttons button')
      //   .contains(assignXmlTemplateButtonText)
      //   .click(); //Click on button
      cy.get('table > tbody > tr').each(($el, index, $list) => {
        cy.log(`Element ${index + 1}: ${$el.text()}`);
      });
      cy.pause();

      let searchCriteria; // Declare searchCriteria

      // Load search criteria from the 'supportWiev.json' file
      cy.fixture('supportView.json').then((data) => {
        // Log searchCriteria from json'
        searchCriteria = data.disableXML.map((item) => item.name);
        //  const searchCriteria = Cypress.env('disableXML')[0].name;

        cy.log(searchCriteria);

        // Start the process by finding elements based on search criteria
        // Verify message from response
        cy.wait('@apiRequest').then((interception) => {
          // Log the status code (200)
          cy.log(`Status Code: ${interception.response.statusCode}`);
          // Log response body
          const responseBody = interception.response.body;
          cy.log('Response Body:', responseBody);
          //Sort by assigne - assigned xml templates move at the top
          responseBody.sort((a, b) => {
            if (a.assigned && !b.assigned) {
              return -1; // a comes before b
            } else if (!a.assigned && b.assigned) {
              return 1; // b comes before a
            } else {
              return 0; // Keep the same order
            }
          });
          // Log only the elements with assigned: true
          const assignedTrueElements = [];
          for (let i = 0; i < searchCriteria.length; i++) {
            const criteria = searchCriteria[i];
            const matchedElement = responseBody.find(
              (item) => item.name === criteria && item.assigned
            );
            if (matchedElement) {
              assignedTrueElements.push(matchedElement);
              cy.log(
                'YES UNCHECKED ELEMENT FROM SEARCH CITERIA IS SUCCESFULLY FOUNDED'
              );
            } else {
              cy.log(
                'NO ELEMENTS - ALL ELEMENTS FROM SEARCH CITERIA ARE UNCHECKED'
              );
            }
          }
          // Uncheck elements with assigned: true
          cy.log('Elements with assigned: true after search:');
          cy.wrap(assignedTrueElements).each((item) => {
            cy.log(
              `ID: ${item.id}, Name: ${item.name}, Assigned: ${item.assigned}`
            );
            cy.contains('table > tbody > tr > td', item.name)
              .parent()
              .find('td:first-child input[type="checkbox"]')
              .should('be.visible')
              .uncheck({ force: true }); // Use force if needed
          });
        });
      });
      //Find the Send button by txt
      const buttonTxt = t['Save'];
      cy.get('.dictionary-xml__actions>button>.title')
        .contains(buttonTxt)
        .click();
      //Check validation message
      cy.get(
        '#mat-snack-bar-container-live-0>div>.mat-mdc-simple-snack-bar>.mat-mdc-snack-bar-label'
      )
        .invoke('text')
        .then((message) => {
          expect(message, 'Success Message ').to.include(
            t['XML template was assigned successfully']
          );
        }); //end
    }); //end TRANSLATE
    cy.wait(2500);
    // Logout;
    cy.logoutFromSW();
  }); //end it

  //********************************************************************************* */

  it('Enable xml teplate by Masteruser', () => {
    cy.loginToSupportViewMaster(); //login as a masteruser

    cy.intercept(
      'GET',
      'https://supportviewpayslip.edeja.com/be/supportView/v1/group/template/tenant/AQUA'
    ).as('apiRequest');
    //get language
    cy.get('#mat-select-value-1')
      .invoke('text')
      .then((selectedLanguage) => {
        const oppositeLanguage = getOppositeLanguage(selectedLanguage.trim());
        cy.log(`Selected Languages: ${selectedLanguage}`);
        cy.log(`Switching to Opposite Language: ${oppositeLanguage}`);

        // Select the opposite language
        cy.selectLanguage(oppositeLanguage);
        cy.wait(1500);
        // Load t based on the opposite language
        cy.loadTranslate(oppositeLanguage);
        cy.wait(1500);
      });
    cy.get('@t').then((t) => {
      //Search for Group section
      cy.get('#searchButton>span')
        .invoke('text')
        .then((search) => {
          expect(search, 'Search:').to.include(t['Search']);
        });
      cy.get('#searchButton>span').click(); //Click on search button
      //Search form label

      // cy.get('.search-dialog>form>.form-fields>.searchText-wrap>.label')
      //   .eq(0)
      //   .invoke('text')
      //   .then((searchLabel) => {
      //     expect(searchLabel, 'Account Number').to.include(t['Account Number']);
      //   }); //end
      cy.get('.search-dialog>form>.form-fields>.searchText-wrap>.label')
        .eq(0)
        .invoke('text')
        .then((searchLabel) => {
          expect(searchLabel, 'Display Name').to.include(t['Display Name']);
        }); //end

      //Search form Action buttons
      cy.get('.search-dialog>form>.form-actions>button>.mdc-button__label')
        .eq(0)
        .invoke('text')
        .then((searchButton) => {
          expect(searchButton, 'resetUserSearch:').to.include(
            t['resetUserSearch']
          );
        }); //end
      cy.get('.search-dialog>form>.form-actions>button>.mdc-button__label')
        .eq(1)
        .invoke('text')
        .then((searchButton) => {
          expect(searchButton, 'searchUse').to.include(t['searchUser']);
        }); //end

      //Search for Group by Display Name
      cy.fixture('supportView.json').then((data) => {
        // Use the company name from the JSON file
        const companyName = data.company;
        // Search for Group by Display Name using the company name
        cy.get('.search-dialog>form>.form-fields>.searchText-wrap')
          .eq(1)
          .type(companyName);
      });

      //Find the Search button by button name and click on it
      const search = t['searchUser'];
      cy.get('.search-dialog>form>.form-actions>button')
        .contains(search)
        .click();

      //Action buttons labels

      cy.get('.action-buttons>button>.mdc-button__label')
        .eq(0)
        .invoke('text')
        .then((actionButton) => {
          expect(actionButton, 'Edit button').to.include(t['Edit']);
        }); //end

      cy.get('.action-buttons>button>.mdc-button__label')
        .eq(1)
        .invoke('text')
        .then((actionButton) => {
          expect(actionButton, 'Assign XML Template').to.include(
            t['Assign XML Template']
          );
        }); //end

      cy.get('.action-buttons>button>.mdc-button__label')
        .eq(2)
        .invoke('text')
        .then((actionButton) => {
          expect(actionButton, 'Assign PDF Dictionary').to.include(
            t['Assign PDF Dictionary']
          );
        }); //end

      cy.get('.action-buttons>button>.mdc-button__label')
        .eq(3)
        .invoke('text')
        .then((actionButton) => {
          expect(actionButton, 'Admin User').to.include(t['Admin User']);
        }); //end

      cy.get('.action-buttons>button>.mdc-button__label')
        .eq(4)
        .invoke('text')
        .then((actionButton) => {
          expect(actionButton, 'User').to.include(t['User']);
        }); //end
      //Click on button with txt XmlTemplate... taken from translate
      const assignXmlTemplateButtonText = t['Assign XML Template'];

      cy.get('.action-buttons button')
        .contains(assignXmlTemplateButtonText)
        .click();

      // XML template TABLE

      cy.get('table > tbody > tr').each(($el, index, $list) => {
        cy.log(`Element ${index + 1}: ${$el.text()}`);
      });
      //OPTIONAL
      // Verify message from response
      cy.wait('@apiRequest').then((interception) => {
        // Log the status code to the Cypress console
        cy.log(`Status Code: ${interception.response.statusCode}`);

        // Log or assert on the response body
        const responseBody = interception.response.body;
        cy.log('Response Body:', responseBody);

        // Assuming responseBody is the array you provided
        cy.wrap(responseBody).each((item) => {
          // Perform assertions or log information about each item
          cy.log(`ID: ${item.id}, Name: ${item.name}`);
          // Add additional assertions as needed
        });
      });

      //ENABLE XML TEMPLATES (from json file)

      let searchCriteria; // Declare searchCriteria in a higher scope

      // Load search criteria from the 'supportWiev.json' file
      cy.fixture('supportView.json').then((data) => {
        // Check if data.enableXML is an array
        if (Array.isArray(data.enableXML)) {
          searchCriteria = data.enableXML.map((item) => item.name);

          // Start the process by finding and checking elements based on search criteria
          findAndCheckElement();
        } else {
          // Handle the case where data.enableXML is not an array
          cy.log("Error: 'data.enableXML' is not an array.");
        } //end IF
      });

      const findAndCheckElement = () => {
        // Check if all elements from search criteria are checked
        const allElementsChecked = searchCriteria.every((criteria) =>
          Cypress.$(`:contains("${criteria}")`)
            .parent()
            .find('td:first-child input[type="checkbox"]')
            .is(':checked')
        );

        if (!allElementsChecked) {
          cy.get('table > tbody > tr > td')
            .should('exist') // Ensure there are elements on the page
            .each(($element, index) => {
              const elementText = $element.text();
              cy.log(`Element ${index + 1}: ${elementText}`);

              // Check if the element matches the specified criteria
              if (
                searchCriteria.some((criteria) =>
                  elementText.includes(criteria)
                )
              ) {
                // Log the found element information
                cy.log(`Found element with text: ${elementText}`);

                // Found the specified element, check if it's visible
                cy.wrap($element)
                  .parent()
                  .find('td:first-child input[type="checkbox"]')
                  .should('be.visible')
                  .check({ force: true }); // Use force if needed

                cy.log(
                  'Checkbox is successfully checked for the specified element.'
                );
              }
            })
            .then(() => {
              // Log information about the pagination button
              cy.log(
                'Clicking on pagination button to navigate to the next page'
              );

              // Click on pagination button to navigate to the next page
              cy.get(
                '.additional-elements > .mat-mdc-paginator > div > div > .mat-mdc-paginator-range-actions > .mat-mdc-paginator-navigation-next'
              ).then(($nextButton) => {
                const isNextButtonEnabled = !$nextButton.prop('disabled');

                if (isNextButtonEnabled) {
                  // Log information about the pagination button
                  cy.log(
                    'Clicking on pagination button to navigate to the next page'
                  );

                  // Click on pagination button to navigate to the next page
                  cy.get(
                    '.additional-elements > .mat-mdc-paginator > div > div > .mat-mdc-paginator-range-actions > .mat-mdc-paginator-navigation-next'
                  )
                    .should('be.visible') // Ensure the next button is visible
                    .click();

                  // Log that the next page is being loaded
                  cy.log('Waiting for the next page to load...');

                  // Wait for the next page to load and then recursively call findAndCheckElement
                  findAndCheckElement();
                } else {
                  // Log that the pagination button is disabled
                  cy.log(
                    'Pagination button is disabled. Stopping the process.'
                  );
                }
              });
            });
        } else {
          cy.log(
            'All elements from the search criteria are checked. Stopping the process.'
          );
        } //end !allElementsChecked
      };

      //Find the Send button by txt
      const buttonTxt = t['Save'];
      cy.get('.dictionary-xml__actions>button>.title')
        .contains(buttonTxt)
        .click();
      //Check validation message
      cy.get(
        '#mat-snack-bar-container-live-0>div>.mat-mdc-simple-snack-bar>.mat-mdc-snack-bar-label'
      )
        .invoke('text')
        .then((message) => {
          expect(message, 'Success Message ').to.include(
            t['XML template was assigned successfully']
          );
        }); //end
    }); //end TRANSLATE
    cy.wait(2500);
    // Logout;
    cy.get('.logout-icon ').click();
    cy.wait(2000);
    cy.get('.confirm-buttons > :nth-child(2)').click();
    // cy.url();
    // cy.should('include', 'https://supportviewpayslip.edeja.com/fe/login'); // Validate url
  }); //end it
}); //end describe
