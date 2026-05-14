# DH Self-Registration Test Suite

## Feature Overview

**Feature Name:** User Self-Registration on DocumentHub Portal  
**Feature ID:** DH_EG_04  
**Migration Source:** E-gehaltszettel R14_Register_New_User_From_XML_file.js  
**Target Platform:** DocumentHub (DH)  
**Created:** 2026-05-11  
**AI-Generated:** Yes  

---

## Feature Scope

This test suite covers the complete self-registration workflow for new users on the DocumentHub platform, including:

- User registration form submission
- Email confirmation via Yopmail
- Credential extraction from confirmation email  
- First-time login with extracted credentials
- Form validation (password strength, required fields, email format)

---

## Preconditions

### Environment Setup
- **DH Base URL:** Configured in `cypress.config.js` as `dh_baseUrl`
- **Test Environment:** Development/Test environment
- **Browser:** Chrome/Edge (recommended)

### Test Data Requirements
- Valid company information (Company Name, UID Number)
- Austrian address (street, postal code, city)
- Yopmail email address (@yopmail.com domain)
- Strong password meeting DH requirements

### System Requirements
- DH registration page accessible
- Yopmail service available
- Email delivery functional
- No captcha restrictions for automated tests

---

## Test Data References

### Primary Test Data
**File:** `cypress/fixtures/registration-data.json`

```json
{
  "testUser1": {
    "company": {
      "companyName": "KLM GmbH",
      "uidNumber": "ATU-KLM-CO-001"
    },
    "address": {
      "street": "Main Strasse",
      "doorNumber": "17",
      "postalCode": "8010",
      "city": "Graz"
    },
    "personal": {
      "firstName": "Klm",
      "lastName": "Testuser"
    },
    "user": {
      "email": "klm.gmbh@yopmail.com",
      "username": "klmAdmin"
    },
    "password": "Test1234!"
  }
}
```

### Invalid Data (For Negative Testing)
- **Weak Passwords:** `test`, `12345678`, `password`, `Test1234`
- **Invalid Emails:** `notanemail`, `@nodomain.com`, `missing@`
- **Invalid Postal Codes:** `ABC`, `12`, `999999`

---

## Scenario Coverage Plan

| Test ID | Scenario | Type | Priority | Status |
|---------|----------|------|----------|--------|
| DH_01 | Complete self-registration with valid data | Happy Path | Critical | ✅ Automated |
| DH_02 | Verify confirmation email in Yopmail | Happy Path | Critical | ✅ Automated |
| DH_03 | First-time login with extracted credentials | Happy Path | Critical | ✅ Automated |
| DH_04 | Logout from DH portal | Happy Path | High | ✅ Automated |
| DH_05 | Weak password rejection | Validation | Medium | ⏸️ Skipped |
| DH_06 | Invalid email format rejection | Validation | Medium | ⏸️ Skipped |
| DH_07 | Required fields validation | Validation | High | ⏸️ Skipped |
| DH_08 | Duplicate username rejection | Error Handling | Medium | ❌ Not Automated |
| DH_09 | Already registered email | Error Handling | Medium | ❌ Not Automated |
| DH_10 | Captcha verification | Security | Low | ❌ Not Automated |

---

## Detailed Scenarios

### DH_01: Complete Self-Registration with Valid Data

**Precondition:**
- User not registered in system
- Registration page accessible

**Steps:**
1. Navigate to DH registration page
2. Fill "Firmendaten" section:
   - Company Name: `KLM GmbH`
   - UID Number: `ATU-KLM-CO-001`
3. Fill "Adresse" section:
   - Street: `Main Strasse`
   - Door Number: `17`
   - Postal Code: `8010`
   - City: `Graz`
4. Fill "Persönliche Daten" section:
   - First Name: `Klm`
   - Last Name: `Testuser`
5. Fill "Benutzerdaten" section:
   - Email: `klm.gmbh@yopmail.com`
   - Confirm Email: `klm.gmbh@yopmail.com`
   - Username: `klmAdmin`
6. Fill "Passwort" section:
   - Password: `Test1234!`
   - Confirm Password: `Test1234!`
7. Verify password strength indicators (5 green checkmarks)
8. Check "AGB Terms" checkbox
9. Handle captcha (if present)
10. Click "Registrieren" button

**Expected Result:**
- Form submits successfully
- User redirected away from registration page
- Success message displayed (optional)
- Confirmation email sent to provided email address

**Sources:**
- Screenshot: `ai/screenshots/dh-registration-form.png`
- HTML: `ai/html/dh-registration-page.html`
- Page Object: `cypress/support/pages/RegistrationPage.js`

---

### DH_02: Verify Confirmation Email in Yopmail

**Precondition:**
- Registration completed in DH_01
- Email sent to Yopmail inbox

**Steps:**
1. Navigate to Yopmail (`https://yopmail.com/en/`)
2. Enter email username: `klm.gmbh`
3. Click refresh to load inbox
4. Verify email subject contains: `Neuer Benutzer DocuHub Portal`
5. Open email
6. Extract username from email body (regex: `Benutzername:\s*([\S]+)`)
7. Extract password from email body (regex: `Passwort:\s*([\S]+)`)
8. Store extracted credentials for next test

**Expected Result:**
- Email received in Yopmail inbox
- Email subject correct
- Email body contains:
  - Username
  - Password
  - Activation/confirmation link (optional)
- Credentials successfully extracted

**Sources:**
- Screenshot: `ai/screenshots/yopmail-confirmation.png`
- Page Object: `cypress/support/pages/YopmailPage.js`

---

### DH_03: First-Time Login with Extracted Credentials

**Precondition:**
- Credentials extracted from email in DH_02
- User account activated (if activation required)

**Steps:**
1. Navigate to DH login page
2. Remove cookie banner (if present)
3. Enter extracted username in username field
4. Enter extracted password in password field
5. Click login button
6. Wait for API request: `GET **/user/info**`
7. Verify successful API response (status 200)
8. Verify URL changes to dashboard
9. Verify user menu visible

**Expected Result:**
- Login successful
- User redirected to dashboard/homepage
- User menu displays username
- No error messages shown

**Sources:**
- Selector: `cypress/support/selectors/dh-registration.selectors.js#dhLoginSelectors`
- Command: `cy.loginToDH()` (can be created as custom command)

---

### DH_04: Logout from DH Portal

**Precondition:**
- User logged in from DH_03

**Steps:**
1. Click user menu in top right
2. Click logout button
3. Wait for redirect
4. Verify URL contains `/login`

**Expected Result:**
- User logged out successfully
- Redirected to login page
- Session cleared

---

## Automation Notes

### Page Object Model (POM)

**RegistrationPage.js** - Main registration form interactions
```javascript
import RegistrationPage from '../../support/pages/RegistrationPage';

// Usage:
RegistrationPage
  .visit()
  .completeRegistration(registrationData)
  .verifySuccessMessage();
```

**YopmailPage.js** - Email confirmation handling
```javascript
import YopmailPage from '../../support/pages/YopmailPage';

// Usage:
YopmailPage
  .visitInbox('klm.gmbh@yopmail.com')
  .extractCredentials()
  .then((creds) => { ... });
```

### Selectors Strategy

**Preferred Selector Priority:**
1. `name` attribute (e.g., `input[name="companyName"]`)
2. `aria-label` attribute
3. `id` attribute
4. Class names (MUI-specific, stable)
5. XPath (avoid if possible)

**Bilingual Support:**
All selectors support both English and German text patterns using regex:
```javascript
/Registrieren|Register/i
/Benutzername|Username/i
```

### Custom Commands

**Recommended Custom Commands to Create:**

```javascript
// cypress/support/commands.js

Cypress.Commands.add('loginToDH', (username, password) => {
  cy.visit(Cypress.env('dh_baseUrl'));
  cy.get('input[name="userName"]').type(username);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.wait('@userInfoRequest');
});

Cypress.Commands.add('removeCookieBanner', () => {
  cy.get('body').then(($body) => {
    if ($body.find('#onetrust-accept-btn-handler').length > 0) {
      cy.get('#onetrust-accept-btn-handler').click();
    }
  });
});
```

### Test Data Management

**Dynamic Test Data Generation:**
```javascript
const timestamp = Cypress.dayjs().format('DDMMHHmm');
const uniqueUsername = `testUser_${timestamp}`;
const uniqueEmail = `test.${timestamp}@yopmail.com`;
```

### Known Issues & Workarounds

#### 1. Captcha Handling
**Issue:** Friendly Captcha may block automation  
**Workaround:** 
- Use test environment with captcha disabled
- Or implement captcha restart mechanism:
```javascript
cy.get('.frc-button').click();
cy.wait(3000); // Wait for auto-solve
```

#### 2. Email Delivery Delay
**Issue:** Yopmail email may take 5-10 seconds to arrive  
**Workaround:**
```javascript
cy.wait(5000); // Wait before checking inbox
// Or implement retry mechanism
```

#### 3. Password Strength Timing
**Issue:** Password strength indicators update with delay  
**Workaround:**
```javascript
cy.get('input[name="password"]').type(password);
cy.wait(500); // Wait for validation
```

---

## Open Questions and Gaps

### Questions
1. ❓ **Email Activation Link Required?**  
   - Does user need to click activation link before first login?
   - Or is account immediately active?

2. ❓ **Duplicate Username Handling**  
   - What error message shows for duplicate username?
   - Is validation client-side or server-side?

3. ❓ **Session Timeout**  
   - How long does registration session remain valid?
   - Can user resume partially filled form?

4. ❓ **Password Requirements**  
   - Are there additional password rules (e.g., no common words)?
   - Maximum password length?

### Gaps
- ⚠️ **No automated test for:**
  - Duplicate username scenario
  - Already registered email
  - Special characters in company name
  - Non-Austrian addresses (if supported)

- ⚠️ **Missing validation tests:**
  - SQL injection attempts
  - XSS in text fields
  - Maximum length validation

---

## Source Mapping Appendix

| Output Section | Source Page | Source Section | Evidence Snippet |
|---------------|-------------|----------------|------------------|
| Company Data Fields | Registration Page HTML | `<section aria-label="user company data section">` | `<input name="companyName">`, `<input name="uidNumber">` |
| Address Fields | Registration Page HTML | `<section aria-label="user address section">` | `<input name="street">`, `<input name="postalCode">` |
| Password Strength | Registration Page HTML | `<section aria-label="password strength indicator section">` | 5 validation indicators with SVG checkmarks |
| Yopmail Email Subject | Screenshot | Yopmail inbox | "Neuer Benutzer DocuHub Portal" |
| Login Fields | DH Login Page | Login form | `input[name="userName"]`, `input[type="password"]` |
| Success Message | E-gehaltszettel Pattern | R14 test | `.mat-mdc-snack-bar-label` pattern |

---

## Execution Instructions

### Run Full Suite
```bash
npx cypress run --spec "cypress/e2e/DH/EG/DH_EG_04_Self_Registration_TS.js"
```

### Run Specific Test
```bash
npx cypress run --spec "cypress/e2e/DH/EG/DH_EG_04_Self_Registration_TS.js" --grep "DH_01"
```

### Run in Headed Mode (for debugging)
```bash
npx cypress open
# Then select: DH_EG_04_Self_Registration_TS.js
```

### Environment Variables Required
```javascript
// cypress.config.js
{
  dh_baseUrl: 'https://docuhub-test.post.at',
  // Add other required env vars
}
```

---

## Maintenance Notes

**Last Updated:** 2026-05-11  
**Maintainer:** QA Automation Team  
**Review Frequency:** After each DH platform update  

**Change Log:**
- 2026-05-11: Initial creation (AI-generated from screenshots + HTML)
- Future: Add duplicate username test
- Future: Add email activation link click test

---

**Document Status:** ✅ Ready for Review  
**AI Confidence:** High (based on screenshots, HTML, and existing patterns)