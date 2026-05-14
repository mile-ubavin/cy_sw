# QA Automation Test Specification

## 1. Document Metadata

- Document ID: QA-AUTO-TS-DH-EG-04-REG-V1
- Feature ID: DH_EG_04
- Feature Name: DocuHub Self-Registration
- Source Test File: cypress/e2e/DH/EG/DH_EG_04_Self_Registration_TS_IVANA.js
- Document Owner: QA Automation
- Status: Active
- Last Updated: 2026-05-14

## 2. Purpose and Audience

This document explains exactly what is tested in DocuHub self-registration automation and how it is tested.

Target audience:

- QA engineers onboarding to the project
- Developers who need to understand expected registration behavior
- Test maintainers and release engineers

Main goal:

- Provide full traceability from business behavior to automated tests, including negative and edge-case coverage.

## 3. Feature Overview

Feature under test: public user self-registration in DocuHub.

Entry point:

- Registration URL is built dynamically from Cypress.env('dh_baseUrl') and /register.

Critical business rule for enabling Register button:

1. All mandatory fields are valid.
2. Terms and Conditions checkbox is checked.
3. FriendlyCaptcha is solved (human verification state).

## 4. In Scope and Out of Scope

In scope:

- Registration page rendering and required section visibility
- Field validation behavior (email mismatch, password mismatch, password strength)
- Register button state machine (enabled/disabled conditions)
- FriendlyCaptcha integration in automation
- Successful registration submit call and accepted response codes

Out of scope:

- Email inbox confirmation flow
- Activation link click and activation lifecycle
- Post-registration login journey

## 5. System Under Test (SUT)

UI areas tested:

- Company data section
- Address section
- Personal data section
- User data section
- Password section
- Terms checkbox
- FriendlyCaptcha widget
- Register submit button

API behavior tested:

- POST request matching **/register**
- Accepted status codes for happy path: 200, 201, 202

## 6. Prerequisites and Technical Dependencies

Required framework prerequisites:

1. Cypress project configured and runnable.
2. Environment variable dh_baseUrl configured.
3. Custom Node task solveFriendlyCaptcha added in cypress.config.js.
4. Custom Cypress command solveFriendlyCaptcha added in cypress/support/commands.js.

FriendlyCaptcha automation dependencies from source test:

1. Puzzle is fetched from FriendlyCaptcha API.
2. Proof-of-work solution is calculated in Node task.
3. Hidden input input[name="frc-captcha-solution"] is populated.
4. Widget DOM state is patched to complete state in UI.

Browser hardening used in beforeEach:

1. onBeforeLoad overrides navigator.webdriver to undefined.
2. failOnStatusCode false is used on registration page visit for environment resilience.

## 7. Test Data Strategy

Data generation approach:

- Runtime timestamp (Date.now()) is used to create unique data per execution.

Default generated data pattern:

- companyName: Test AG <timestamp>
- street: Test - Mariahilferstrasse <timestamp>
- email: cypress+<timestamp>@example.com
- confirmEmail: cypress+<timestamp>@example.com
- username: cypressuser<timestamp>

Static defaults:

- uidNumber: ATU12345678
- postalCode: 1060
- city: Vienna
- password: Cypress@1234

Rationale:

- Prevent collisions in uniqueness-constrained fields.
- Keep tests rerunnable and independent.

## 8. Test Suite Structure

Test suite name:

- DocuHub Registration

Reusable helpers in test file:

1. fillForm(overrides)
2. acceptTerms()
3. cy.solveFriendlyCaptcha() command

Test organization groups:

1. Page Load
2. Validation
3. Register Button Rules
4. Captcha + Submit

## 9. Detailed Automated Test Cases (Implemented)

### 9.1 Page Load and Static UI

TC-DH-EG04-PL-001

- Title: Registration form is visible
- Preconditions: User opens /register page
- Steps: Locate element with aria-label registration form
- Expected: Form is visible

TC-DH-EG04-PL-002

- Title: All required sections are present
- Preconditions: User opens /register page
- Steps: Assert section containers by aria-label
- Expected: Company, Address, Personal, User, Email, and Password sections exist

TC-DH-EG04-PL-003

- Title: Register button is disabled on initial load
- Preconditions: Fresh page load, no data entered
- Steps: Read button[type="submit"] state
- Expected: Button is disabled

TC-DH-EG04-PL-004

- Title: Country field is prefilled and disabled
- Preconditions: Fresh page load
- Steps: Check input[name="state"]
- Expected: Value is Austria and field is disabled

TC-DH-EG04-PL-005

- Title: UID field pre-fills with ATU
- Preconditions: Fresh page load
- Steps: Check input[name="uidNumber"] initial value
- Expected: Value starts as ATU

### 9.2 Field Validation

TC-DH-EG04-VAL-001

- Title: Email mismatch shows validation error
- Preconditions: Registration page is open
- Steps:

1. Enter user@example.com in email
2. Enter other@example.com in confirm email
3. Blur field

- Expected: confirmEmail helper error is shown (non-empty)

TC-DH-EG04-VAL-002

- Title: Password mismatch shows validation error
- Preconditions: Registration page is open
- Steps:

1. Enter Cypress@1234 in password
2. Enter Wrong@9999 in confirm password
3. Blur field

- Expected: confirmPassword helper error is shown (non-empty)

TC-DH-EG04-VAL-003

- Title: Password strength indicators react to valid password
- Preconditions: Registration page is open
- Steps: Type Cypress@1234 in password
- Expected: Disabled strength icons count is zero

### 9.3 Register Button Rule Validation

TC-DH-EG04-RULE-001

- Title: Register stays disabled without terms checkbox
- Preconditions:

1. Full form valid
2. Captcha solved by automation command
3. Terms not checked

- Steps: Evaluate submit button state
- Expected: Button remains disabled

TC-DH-EG04-RULE-002

- Title: Register stays disabled without captcha
- Preconditions:

1. Full form valid
2. Terms checked
3. Captcha not solved

- Steps:

1. Assert captcha container exists
2. Read hidden captcha solution value
3. If not solved, assert button disabled

- Expected: Button disabled until captcha is solved
- Note: Test contains a guard branch when captcha auto-verifies in environment

TC-DH-EG04-RULE-003

- Title: Register stays disabled without valid form data
- Preconditions:

1. Terms checked
2. Captcha solved
3. Required fields not filled

- Steps: Evaluate submit button state
- Expected: Button remains disabled

TC-DH-EG04-RULE-004

- Title: Register enables only when all three conditions are met
- Preconditions:

1. Full form valid
2. Terms checked
3. Captcha solved

- Steps: Evaluate submit button state
- Expected: Button is enabled

### 9.4 End-to-End Submit

TC-DH-EG04-E2E-001

- Title: Happy path submits registration successfully
- Preconditions:

1. /register page loaded
2. Valid unique data available
3. Terms checked
4. Captcha solved

- Steps:

1. Intercept POST **/register** as registerRequest
2. Fill valid form
3. Check terms
4. Solve captcha
5. Click submit
6. Wait for intercepted request

- Expected:

1. Response status code in [200, 201, 202]
2. Browser URL no longer includes /register

## 10. Edge Case Catalog

The following edge cases are required for complete registration confidence. They are not all implemented yet in the current source file.

Critical edge cases:

1. Duplicate email registration rejected
2. Duplicate username rejected
3. Duplicate company rejected when tenant uniqueness applies
4. Captcha API timeout or provider outage handling
5. Captcha solved UI state but backend rejects token

Validation edge cases:

1. Invalid UID formats beyond prefix ATU
2. Postal code non-numeric values
3. Postal code wrong length values
4. Leading/trailing whitespace in mandatory fields
5. Maximum length boundaries for company, username, email
6. Special characters and Unicode handling in name fields
7. Empty-string values with spaces only

UX and localization edge cases:

1. EN/DE language label stability
2. Error messages present and understandable in active locale
3. Submit button accessibility state changes are announced correctly

Resilience edge cases:

1. 502/503 during initial page load
2. Slow network for register endpoint
3. Retry behavior after failed registration attempt

## 11. Traceability Matrix

| Requirement                                  | Automated Test Case IDs                                                            |
| -------------------------------------------- | ---------------------------------------------------------------------------------- |
| Registration page renders correctly          | TC-DH-EG04-PL-001, TC-DH-EG04-PL-002                                               |
| Initial state prevents accidental submission | TC-DH-EG04-PL-003                                                                  |
| Correct defaults are preloaded               | TC-DH-EG04-PL-004, TC-DH-EG04-PL-005                                               |
| Email/password confirmation validation       | TC-DH-EG04-VAL-001, TC-DH-EG04-VAL-002                                             |
| Password quality feedback                    | TC-DH-EG04-VAL-003                                                                 |
| Register button rule enforcement             | TC-DH-EG04-RULE-001, TC-DH-EG04-RULE-002, TC-DH-EG04-RULE-003, TC-DH-EG04-RULE-004 |
| Successful registration transaction          | TC-DH-EG04-E2E-001                                                                 |

## 12. Execution Guide

Recommended run command:

```bash
npx cypress run --spec "cypress/e2e/DH/EG/DH_EG_04_Self_Registration_TS_IVANA.js" --headed --browser chrome
```

Execution notes:

1. Remove it.only before full-suite CI execution.
2. Keep all uniqueness fields dynamic for reruns.
3. If captcha provider behavior changes, first verify solveFriendlyCaptcha task.

## 13. Known Risks and Mitigations

Risk: Third-party captcha changes break deterministic behavior.

- Mitigation: Keep solver in Node task and monitor puzzle payload shape.

Risk: Environment instability causes false negatives.

- Mitigation: Use environment health checks and retry policy outside test logic.

Risk: UI selectors drift.

- Mitigation: Prefer stable selectors (name and aria-label), avoid style selectors.

## 14. Definition of Done for This Feature

Feature automation is considered done when:

1. All implemented test cases pass consistently in target environment.
2. Happy path validates both UI navigation and API response.
3. Captcha handling is stable in CI with documented fallback strategy.
4. Critical edge cases are either automated or explicitly accepted as backlog with owner.

## 15. File References

- Primary automated suite: cypress/e2e/DH/EG/DH_EG_04_Self_Registration_TS_IVANA.js
- Cypress command extensions: cypress/support/commands.js
- Node tasks and environment merge: cypress.config.js
