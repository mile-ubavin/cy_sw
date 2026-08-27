import 'cypress-real-events';
import 'cypress-file-upload';

describe('masterFaq EN - Manage FAQ Pages - base scenario', () => {
  //Various Functions

  // Create Question and an Answer
  function createQuestionAndAnswer() {
    const generalInfoQA = [
      {
        question: 'TEST (1.0) - What is the purpose of this platform?',
        answer:
          'TEST (1.0) - ANSWER: The platform provides a comprehensive solution for managing online content and digital services.',
      },
      {
        question: 'TEST (2.0) - How can I reset my password?',
        answer:
          'TEST (2.0) - ANSWER: You can reset your password by clicking on "Forgot Password" at the login screen and following the instructions sent to your email.',
      },
    ];

    // Randomly select one question and answer
    const randomIndex = Math.floor(Math.random() * generalInfoQA.length);
    const selectedQA = generalInfoQA[randomIndex];

    // Create Question and Answer

    cy.get('.faq-list__create-cta').click({ force: true });

    // Create Question
    cy.wait(2500);
    cy.get('#mat-input-0')
      .click({ force: true })
      .clear()
      .type(selectedQA.question);

    // Create Answer

    //Enable bold text option
    cy.get('.ql-formats>.ql-bold').click();
    cy.get('.ql-header').eq(0).click();
    //click on align text dropdown
    cy.get('.ql-align>.ql-picker-label').click();
    cy.wait(1500);
    //align text to center
    cy.get('.ql-picker-item[data-value="center"]').click();
    //Type an answer
    cy.get('.ql-editor')
      .click({ force: true })
      .clear()
      .wait(500)
      .type('<<< TITLE OF THE ANSWER >>>');

    //<enter> for <br>
    cy.get('.ql-editor').type('{enter}');
    //click on align text dropdown
    cy.get('.ql-align>.ql-picker-label').click();
    //align text to right
    cy.get('#ql-picker-options-3>.ql-picker-item').eq(0).click();
    cy.wait(500);
    //<enter> for <br>
    cy.get('.ql-editor').type('{enter}');
    cy.get('.ql-editor').type('{enter}');

    cy.wait(1500);
    //Disable bold text option
    cy.get('.ql-formats>.ql-bold').click();
    cy.get('.ql-header').eq(0).click();
    //Type an answer
    cy.get('.ql-editor').click({ force: true }).type(selectedQA.answer);
    cy.wait(2000);
    cy.get('.ql-editor').type('{enter}');

    cy.wait(2500);

    // Confirm the created question/answer
    cy.get('button>.mdc-button__label>span')
      .filter((index, button) => {
        const buttonText = Cypress.$(button).text().trim();
        return buttonText === 'Save' || buttonText === 'Übernehmen';
      })
      .first()
      .click();

    cy.wait(2500);
  }

  // Edit Question and an Answer
  function editQuestionAndAnswer() {
    const generalInfoQA = [
      {
        question:
          'TEST (1.1) - Can we add this question to the FAQ pages visible to both Master Users and Admins?',
        answer:
          'TEST (1.1) - Answer: Yes, this question can be added to the FAQ pages and made visible to both Master Users and Admins. To ensure proper visibility, the FAQ configuration must include permissions for both user roles to access this specific content..',
      },
      {
        question:
          'TEST (2.1) - Can we add this question to the FAQ pages visible to both Master Users and Admins?',
        answer:
          'TEST (2.1) - Answer: Yes, this question can be added to the FAQ pages and made visible to both Master Users and Admins. To ensure proper visibility, the FAQ configuration must include permissions for both user roles to access this specific content.',
      },
    ];

    // Step 4: Randomly select one question and answer
    const randomIndex = Math.floor(Math.random() * generalInfoQA.length);
    const selectedQA = generalInfoQA[randomIndex];

    // Edit Question
    cy.wait(1500);
    cy.get('tp-accordion-header>mat-form-field>.mdc-text-field>div>div>input')
      .click({ force: true })
      .clear()
      .type(selectedQA.question);

    // Edit Answer

    // Enable bold text option
    // cy.get('.ql-formats>.ql-bold').click();

    // Set header to level 1 (assuming .ql-header is a dropdown)
    cy.get('.ql-header').eq(0).click();

    // Click on the align text dropdown
    cy.get('.ql-align>.ql-picker-label').click();
    cy.wait(1500); // Ensure dropdown is fully rendered

    // Align text to center (this should work if it's a custom Quill dropdown)
    cy.get(
      '.ql-align .ql-picker-options .ql-picker-item[data-value="center"]'
    ).click();

    // Type an answer in the Quill editor
    cy.get('.ql-editor')
      .click({ force: true })
      .clear()
      .wait(500)
      .type('*** Answer: Yes, this question can be added to the FAQ pages ***');

    // Press Enter for a line break
    cy.get('.ql-editor').type('{enter}');

    // Click on the align text dropdown again
    cy.get('.ql-align>.ql-picker-label').click({ multiple: true });
    cy.wait(1000); // Ensure the dropdown is ready

    // Align text to the right
    cy.get('.ql-align>.ql-picker-options>.ql-picker-item').eq(0).click(); // Use appropriate value for right align
    cy.wait(500);

    // Press Enter for a line break
    cy.get('.ql-editor').type('{enter}');
    cy.get('.ql-editor').type('{enter}');

    // Wait for any animation or render delay
    cy.wait(1500);

    // Disable bold text option if enabled
    // cy.get('.ql-formats>.ql-bold').click();

    // Type another answer in the Quill editor
    cy.get('.ql-editor').click({ force: true }).type(selectedQA.answer); // Ensure selectedQA.answer is defined
    cy.wait(2000);

    // Press Enter to finalize
    cy.get('.ql-editor').type('{enter}');

    // Confirm the created question/answer

    cy.get('button>.mdc-button__label>span')
      .filter((index, button) => {
        const buttonText = Cypress.$(button).text().trim();
        return buttonText === 'Save' || buttonText === 'Übernehmen';
      })
      .first()
      .click();

    cy.wait(2000);
  }

  // Select "masterFaq" EN and perform actions
  function selectMasterFaqEN() {
    cy.get(':nth-child(1) > .mat-mdc-card-header').click({ force: true });
    cy.wait(2000); // Wait for 2 seconds to ensure the page loads correctly
  }

  // Select "adminFaq - Administrator " EN and perform actions
  function selectAdminFaqEN() {
    cy.get(':nth-child(3) > .mat-mdc-card-header').click({ force: true });
    cy.wait(2000); // Wait for 2 seconds to ensure the page loads correctly
  }

  //Click to Manage FAQ Pages
  function clickToManageFAQpage() {
    cy.get('.faq-list__dash-separator').click({ force: true });
    cy.wait(2000); // Wait for 2 seconds to ensure the page loads correctly
  }

  //Import latest created question
  // function importLatestCreatedQuestion() {
  //   cy.get('#draggableList>sv-faq-item')
  //     .eq(0)
  //     .realMouseDown({ button: 'left', position: 'center' })
  //     .realMouseMove(0, 10, { position: 'center' });
  //   cy.wait(200); // In our case, we wait 200ms cause we have animations which we are sure that take this amount of time
  //   cy.get('.faq-page-edit>.faq-page-edit__questions>mat-list')
  //     .realMouseMove(0, 0, { position: 'center' })
  //     .realMouseUp();
  //   cy.wait(2500);
  // }

  function importLatestCreatedQuestion() {
    // Start drag on first item
    cy.get('#draggableList > sv-faq-item')
      .eq(0)
      .realMouseDown({ button: 'left', position: 'center' })
      .realMouseMove(0, 10, { position: 'center' });

    cy.wait(200); // Allow animations

    // Drop at top of target list
    cy.get('.faq-page-edit__questions > mat-list')
      .then(($targetList) => {
        const listRect = $targetList[0].getBoundingClientRect();

        // Move to top edge of the list (top + small offset)
        cy.wrap($targetList).realMouseMove(
          listRect.left + 10,
          listRect.top + 5
        );
      })
      .realMouseUp();

    cy.wait(2500); // Wait for UI to update
  }

  //Reorder Items (Questions)
  function reorderAndRemoveItems() {
    cy.get('#cdk-drop-list-1 > mat-list-item').then(($items) => {
      const itemCount = $items.length;

      cy.log('Number of items:', itemCount);
      cy.wait(1500);

      if (itemCount > 1) {
        for (let i = 0; i < 1; i++) {
          // Select the last item
          cy.get('#cdk-drop-list-1 > mat-list-item')
            .last()
            .realMouseDown({ button: 'left', position: 'center' })
            .realMouseMove(0, 10, { position: 'center' });

          cy.wait(700); // Adjust wait for animations

          // Define movement multiplier based on itemCount
          const movementMultiplier =
            itemCount >= 6
              ? 30
              : itemCount === 5
              ? 40
              : itemCount === 4
              ? 50
              : itemCount === 2
              ? 90
              : 70;

          // Perform drag and drop
          cy.get('#cdk-drop-list-1')
            .realMouseMove(0, -(itemCount * movementMultiplier), {
              position: 'center',
            })
            .realMouseUp();

          cy.wait(2500); // Adjust wait for animations
        }
      }
    });
  }

  //*********************NEW*****************

  function addAnddRemoveItems() {
    cy.get('#cdk-drop-list-1 > mat-list-item').then(($items) => {
      const itemCount = $items.length;
      cy.pause();
      cy.log(`Number of items: ${itemCount}`);
      cy.wait(1000);

      if (itemCount > 1) {
        // Remove the latest added item (assumed to be the last one)
        cy.get('#cdk-drop-list-1 > mat-list-item')
          .last()
          .within(() => {
            // Adjust selector based on the actual delete icon or button
            cy.get('[data-testid="delete-icon"], .delete-button, .mat-icon')
              .first()
              .click({ force: true });
          });

        cy.wait(1500); // Wait for the item to be removed
      } else {
        cy.log('Only one item left, skipping removal.');
      }
    });
  }

  // Select language
  function selectLanguage(language) {
    cy.get('.lagnuage-menu').click();
    cy.wait(1000);
    cy.get(`#mat-select-0-panel`).contains(language).click();
  }

  //getOppositeLanguage
  function getOppositeLanguage(currentLanguage) {
    return currentLanguage === 'English' ? 'German' : 'English';
  }

  //Check does exist any question and expand First
  function checkDoesExistAnyQuestionAndExpandLast() {
    // Get the body element to safely search for nested elements
    cy.get('body').then(($body) => {
      // Try to find the first accordion header inside the body
      const $accordion = $body
        .find('tp-accordion-group > .inner-header')
        .last();

      // Check if the accordion element exists in the DOM
      if ($accordion.length > 0) {
        // Check if the found accordion element is visible
        if ($accordion.is(':visible')) {
          // If it exists and is visible, click it to expand the accordion
          cy.wrap($accordion).click();

          // Wait for content inside the accordion to load/render
          cy.wait(3500);

          // Count the number of visible accordion items (questions/answers)
          cy.get('tp-accordion')
            .its('length') // Get the total number of tp-accordion elements
            .then((itemCount) => {
              // Log the count of items for debugging purposes
              cy.log(`Number of items: ${itemCount}`);
            });
        } else {
          // If the element exists but is not visible, skip expanding
          cy.log('Accordion is present but not visible. Skipping expansion.');
        }
      } else {
        // If the accordion element does not exist in the DOM, log and skip
        cy.log('Accordion not found. Skipping expansion.');
      }
    });
  }

  //End Functions

  it('masterFaq EN - Manage FAQ Pages', function () {
    // Login using custom command
    cy.loginToSupportViewMaster(); // Login custom commands
    cy.wait(3000);

    //Remove pop up
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(1500);

    cy.get(
      '[label="Modify FAQ"] > .navigation-item > .navigation-item__link > .user-label-wrap > .link'
    ).click();
    cy.wait(1500);

    // Create Question and an Answer
    createQuestionAndAnswer();

    // Navigate to FAQ Modify page
    cy.get('[label="Modify FAQ"] > .navigation-item').click();
    cy.wait(2500);
    // Select "masterFaq" EN and perform actions
    selectMasterFaqEN();

    //Click to Manage FAQ Pages
    clickToManageFAQpage();

    //Import lates created question
    importLatestCreatedQuestion();

    //Reorder and remove items, then reset
    reorderAndRemoveItems();

    // Delete the last item from the list
    cy.wait(2500);
    cy.get('.mat-mdc-card > .mat-mdc-card-content > .mat-mdc-tooltip-trigger')
      .last()
      .click({ force: true });
    cy.wait(1500);

    // Reset changes by clicking the Reset button
    cy.get('.mat-mdc-button > .mdc-button__label > span').click(); // Reset button
    cy.log('Changes reset');
    cy.wait(2500);

    //Import lates created question
    importLatestCreatedQuestion();
    cy.wait(2500);

    //Repeat the process (Reorder, remove items)
    addAnddRemoveItems();
    cy.wait(2500);

    //Save changes
    cy.get('.mat-primary > .mdc-button__label > span').click(); // Save button
    cy.log('Changes saved');
    cy.wait(4500);

    //Switch to Help page
    cy.get(
      'sv-sidebar-faq > [label="Help"] > .navigation-item > .navigation-item__link'
    ).click();
    cy.wait(3500);
    //Expand first question (accordion)
    // cy.get('tp-accordion-group > .inner-header').first().click();
    // cy.get('tp-accordion')
    //   .its('length') // Get the number of elements
    //   .then((itemCount) => {
    //     cy.log(`Number of items: ${itemCount}`); // Log the item count
    //   });

    //Expand first question (accordion)
    checkDoesExistAnyQuestionAndExpandLast;

    // Get the current language and switch to the opposite
    cy.get('.lagnuage-menu')
      .invoke('text')
      .then((selectedLanguage) => {
        const oppositeLanguage = getOppositeLanguage(selectedLanguage.trim());
        cy.log(`Selected Language: ${selectedLanguage}`);
        cy.log(`Switching to Opposite Language: ${oppositeLanguage}`);

        // Select the opposite language
        selectLanguage(oppositeLanguage);
      });
    cy.wait(1500);

    //Expand first question (accordion)
    checkDoesExistAnyQuestionAndExpandLast;

    // Navigate to FAQ Modify page
    cy.get('[label="Modify FAQ"] > .navigation-item').click();
    let question; // Declare a variable to store the question
    cy.wait(1500);
    cy.get('tp-accordion-group > .inner-header > strong')
      .first() // Select the first element matching the selector
      .invoke('text') // Get the text of the element
      .then((text) => {
        question = text.trim(); // Store the trimmed text in the 'question' variable
        cy.log(`First question is: ${question}`); // Log the question for debugging

        // Assert that the first element contains the correct text
        cy.get('tp-accordion-group > .inner-header > strong')
          .first()
          .should('include.text', question);
      });
    cy.wait(2500);
    //Copy Latest created Question
    cy.get('.inner-header')
      .eq(0) // Select the first '.inner-header' element
      .find('.faq-item_icon-group > mat-icon') // Find the first 'mat-icon' inside '.faq-item_icon-group'
      .eq(1) //  second 'mat-icon'
      .click(); // Perform the click action
    //Confim Copy Question dialog
    cy.get(
      '.dialog-container > .dialog-footer > .dialog-actions > button > .title'
    )
      .eq(1)
      .invoke('text') // Get the text of the button
      .then((title) => {
        const trimmedTitle = title.trim(); // Trim the text to remove any leading/trailing whitespace
        cy.log(`Button title: ${trimmedTitle}`); // Log the button title for debugging

        // Check if the title matches 'Confirm' or 'Bestätigen'
        if (trimmedTitle === 'Confirm' || trimmedTitle === 'Bestätigen') {
          // Click the button if it matches
          cy.get(
            '.dialog-container > .dialog-footer > .dialog-actions > button > .title'
          )
            .eq(1)
            .click({ multiple: true });
        }

        // Assert that the first element contains the correct text with '*' appended
        cy.get('tp-accordion-group > .inner-header > strong')
          .first()
          .should('include.text', question + '*');
      });
    cy.wait(1500);
    //Delete already copied question
    cy.get(
      'tp-accordion-group > .inner-header > .faq-item_icon-group > [svgicon="custom:delete"] > svg'
    )
      .first()
      .click();
    cy.wait(1500);
    //Confim Delete Question dialog
    cy.get('.dialog-container>.dialog-footer>.dialog-actions>button')
      .eq(1)
      .click({ multiple: true });
    cy.wait(2500);

    //Edit latest created Question

    cy.get('.inner-header')
      .eq(0) // Select the first '.inner-header' element
      .find('.faq-item_icon-group > mat-icon') // Find the first 'mat-icon' inside '.faq-item_icon-group'
      .first() // Make sure it's the first 'mat-icon' if there are multiple
      .click(); // Perform the click action

    // cy.get('tp-accordion-group ').eq(0).click({ force: true });
    cy.wait(2500);

    editQuestionAndAnswer();
    cy.wait(3000);

    //Add edited page to selectAdminFaqEN
    selectAdminFaqEN();
    cy.wait(2500);
    clickToManageFAQpage();
    cy.wait(2500);
    importLatestCreatedQuestion();
    cy.wait(2500);
    //Save changes
    cy.get('.mat-primary > .mdc-button__label > span').click(); // Save button
    cy.log('Changes saved');
    cy.wait(4500);

    //Switch to Help page
    cy.get(
      'sv-sidebar-faq > [label="Help"] > .navigation-item > .navigation-item__link'
    ).click();

    //Expand first question (accordion)
    checkDoesExistAnyQuestionAndExpandLast();

    // Get the current language and switch to the opposite
    cy.get('.lagnuage-menu')
      .invoke('text')
      .then((selectedLanguage) => {
        const oppositeLanguage = getOppositeLanguage(selectedLanguage.trim());
        cy.log(`Selected Language: ${selectedLanguage}`);
        cy.log(`Switching to Opposite Language: ${oppositeLanguage}`);

        // Select the opposite language
        selectLanguage(oppositeLanguage);
      });
    cy.wait(1500);

    //Expand last question (accordion)
    cy.wait(1500);
    cy.get('tp-accordion-group > .inner-header').last().click();
    cy.wait(3500);
    // Count the number of elements
    cy.get('tp-accordion')
      .its('length') // Get the number of elements
      .then((itemCount) => {
        cy.log(`Number of items: ${itemCount}`); // Log the item count
      });

    cy.wait(3500);

    // //Delete latest created question

    // // Navigate to FAQ Modify page
    // cy.get(
    //   '[label="Modify FAQ"] > .navigation-item > .navigation-item__link > .user-label-wrap > .link'
    // ).click();
    // cy.wait(2000);
    // //Delte latest created quesytion
    // cy.get('.inner-header')
    //   .eq(0) // Select the first '.inner-header' element
    //   .find('.faq-item_icon-group > mat-icon') // Find the first 'mat-icon' inside '.faq-item_icon-group'
    //   .eq(2) // select delete
    //   .click(); // Perform the click action

    // cy.wait(1500);
    // //Confim Delete Question dialog
    // cy.get('.dialog-container>.dialog-footer>.dialog-actions>button')
    //   .eq(1)
    //   .click({ multiple: true });
    // cy.wait(2500);
  }); //End iT

  it('adminHelpPage', () => {
    cy.loginToSupportViewAdmin();
    // Wait for a fixed time (if necessary, but try to avoid it)
    cy.wait(1500);

    //Remove pop up
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(1500);

    //Switch to Help page
    cy.get(
      'sv-sidebar-faq > [label="Help"] > .navigation-item > .navigation-item__link'
    ).click();
    cy.wait(1500);

    //Expand question (accordion)
    checkDoesExistAnyQuestionAndExpandLast();

    // Get the current language and switch to the opposite
    cy.get('.lagnuage-menu')
      .invoke('text')
      .then((selectedLanguage) => {
        const oppositeLanguage = getOppositeLanguage(selectedLanguage.trim());
        cy.log(`Selected Language: ${selectedLanguage}`);
        cy.log(`Switching to Opposite Language: ${oppositeLanguage}`);

        // Select the opposite language
        selectLanguage(oppositeLanguage);
      });
    cy.wait(1500);

    //Expand first question (accordion)
    checkDoesExistAnyQuestionAndExpandLast();
  });

  //Delte latest created Question
  it('deleteLatestCreatedQuestion', () => {
    // Login using custom command
    cy.loginToSupportViewMaster(); // Login custom commands
    cy.wait(3000);

    //Remove pop up
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(1500);
    //Delete latest created question

    // Navigate to FAQ Modify page
    cy.get(
      '[label="Modify FAQ"] > .navigation-item > .navigation-item__link > .user-label-wrap > .link'
    ).click();
    cy.wait(2000);
    //Delte latest created question
    cy.get('.inner-header')
      .eq(0)
      .invoke('attr', 'style', 'border: 1px solid red') // Apply red border
      .find('.faq-item_icon-group > mat-icon')
      .last()
      .invoke('attr', 'style', 'border: 1px solid red') // Apply red border

      .click(); // Click the button

    cy.wait(1500);
    //Confim Delete Question dialog
    cy.get('.dialog-container>.dialog-footer>.dialog-actions>button')
      .eq(1)
      .click({ multiple: true });
    cy.wait(2500);

    //Switch to Help page
    cy.get(
      'sv-sidebar-faq > [label="Help"] > .navigation-item > .navigation-item__link'
    ).click();
    //Expand first question (accordion)

    cy.wait(2500);

    checkDoesExistAnyQuestionAndExpandLast();

    // Get the current language and switch to the opposite
    cy.get('.lagnuage-menu')
      .invoke('text')
      .then((selectedLanguage) => {
        const oppositeLanguage = getOppositeLanguage(selectedLanguage.trim());
        cy.log(`Selected Language: ${selectedLanguage}`);
        cy.log(`Switching to Opposite Language: ${oppositeLanguage}`);

        // Select the opposite language
        selectLanguage(oppositeLanguage);
      });
    cy.wait(1500);

    //Expand first question (accordion)
    cy.wait(1500);

    checkDoesExistAnyQuestionAndExpandLast();
  }); //end it

  it('checkAdminHelpPage-afterDeletingQuestionFromFaq', () => {
    // Select language
    function selectLanguage(language) {
      cy.get('.lagnuage-menu').click();
      cy.wait(1000);
      cy.get(`#mat-select-0-panel`).contains(language).click();
    }

    //getOppositeLanguage
    function getOppositeLanguage(currentLanguage) {
      return currentLanguage === 'English' ? 'German' : 'English';
    }

    // Import credentials (username/password) from 'supportView.json'
    cy.loginToSupportViewAdmin();
    cy.wait(1500);

    //Remove pop up
    cy.get('body').then(($body) => {
      if ($body.find('.release-note-dialog__close-icon').length > 0) {
        cy.get('.release-note-dialog__close-icon').click();
      } else {
        cy.log('Close icon is NOT present');
      }
    });
    cy.wait(1500);

    //Switch to Help page
    cy.get(
      'sv-sidebar-faq > [label="Help"] > .navigation-item > .navigation-item__link'
    ).click();
    //Expand last question (accordion)
    cy.wait(1500);
    // cy.get('tp-accordion-group > .inner-header').last().click();
    // cy.wait(3500);
    checkDoesExistAnyQuestionAndExpandLast();

    // Get the current language and switch to the opposite
    cy.get('.lagnuage-menu')
      .invoke('text')
      .then((selectedLanguage) => {
        const oppositeLanguage = getOppositeLanguage(selectedLanguage.trim());
        cy.log(`Selected Language: ${selectedLanguage}`);
        cy.log(`Switching to Opposite Language: ${oppositeLanguage}`);

        // Select the opposite language
        selectLanguage(oppositeLanguage);
      });
    cy.wait(3500);

    //Expand first question (accordion)
    // cy.wait(1500);
    // cy.get('tp-accordion-group > .inner-header').last().click();
    // cy.wait(3500);
    // Count the number of elements
    // cy.get('tp-accordion')
    //   .its('length') // Get the number of elements
    //   .then((itemCount) => {
    //     cy.log(`Number of items: ${itemCount}`); // Log the item count
    //   });
    checkDoesExistAnyQuestionAndExpandLast();
  });
});
