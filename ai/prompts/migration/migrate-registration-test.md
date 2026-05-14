# AI Prompt: Migrate & Create Tests — DocumentHub Platform

> **Active Role:** Load from `ai/roles/senior-cypress-engineer.md` before proceeding.
> **FE Reference:** Load from `ai/roles/frontend-developer.md` for HTML/selector details.
> **Responsive Testing:** Load from `ai/roles/senior-cypress-responsive.md` if viewport testing needed.

---

## Context

You are working inside the `cypress-automatison-framework` for the **DocumentHub (DH)** platform.
This project migrates E-gehaltszettel legacy tests to DH, and also creates new DH-native test suites.

### Available Test Suites

- `DH_EG_03` — Create E-Box User Manually → docs: `docs/test-docs/DH_EG_03_Create_EBox_User_Manually.md`
- `DH_EG_04` — Self-Registration → `cypress/e2e/DH/EG/DH_EG_04_Self_Registration_TS.js`

---

## How to Fetch Environment Variables

```javascript
// ─── URLs ─────────────────────────────────────────────────
Cypress.env('dh_baseUrl'); // DocumentHub frontend URL
Cypress.env('baseUrl'); // Support View URL
Cypress.env('baseUrl_egEbox'); // E-Box portal URL

// ─── Auth ─────────────────────────────────────────────────
Cypress.env('password_egEbox'); // E-Box user password
Cypress.env('companyPrefix'); // Account prefix (e.g. "AQUA-")

// ─── Test Data ────────────────────────────────────────────
Cypress.env('createUser')[0]; // First user in config array
Cypress.env('company'); // Company display name

// ─── createUser object shape ──────────────────────────────
// {
//   prefixedTitle, firstName, lastName, prefixedTitle2,
//   username, email,
//   streetName, streetNumber, doorNumber, zipCode, city
// }
```

---

## Login Patterns

### Login to DocumentHub

```javascript
cy.visit(Cypress.env('dh_baseUrl'));
cy.loginToDH(); // custom command
cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`);
```

### Login to Support View as Master User

```javascript
cy.loginToSupportViewMaster(); // DO NOT MIGRATE to DH tests
```

### Login to Yopmail

```javascript
cy.visit('https://yopmail.com/en/');
const user = Cypress.env('createUser')[0];
cy.get('#login').type(user.email);
cy.get('#refreshbut > .md > .material-icons-outlined').click();
// Inbox content:
cy.iframe('#ifinbox').find('.mctn > .m > button > .lms').eq(0);
// Email body:
cy.iframe('#ifmail').find('#mail > div > div:nth-child(2) > ...');
```

### Login to E-Box (First Time)

```javascript
cy.visit(Cypress.env('baseUrl_egEbox'));
cy.get(':nth-child(1) > .ng-invalid > .input > .input__field-input').type(
  Cypress.env('companyPrefix') + user.username,
);
cy.get('.ng-invalid > .input > .input__field-input').type(
  Cypress.env('password_egEbox'),
);
cy.intercept('POST', '**/rest/v2/deliveries**').as('openDeliveriesPage');
cy.get('button[type="submit"]').click();
cy.wait('@openDeliveriesPage', { timeout: 37000 })
  .its('response.statusCode')
  .should('eq', 200);
```

---

## FriendlyCaptcha Bypass

> ⚠️ Call `bypassCaptcha()` **BEFORE** `cy.visit()`. Intercepts must be registered first.

```javascript
const bypassCaptcha = () => {
  // Stub the FriendlyCaptcha script — prevents browser check failure
  cy.intercept('GET', '**/friendly-challenge**', {
    statusCode: 200,
    headers: { 'Content-Type': 'application/javascript' },
    body: `(function(){
      function mockCaptcha() {
        var i = document.querySelector('input[name="frc-captcha-solution"]');
        if (i) { i.value = 'MOCK_SOLUTION'; i.dispatchEvent(new Event('input',{bubbles:true})); }
        var b = document.querySelector('button[type="submit"]');
        if (b) b.removeAttribute('disabled');
      }
      document.readyState==='loading'
        ? document.addEventListener('DOMContentLoaded', mockCaptcha) : mockCaptcha();
    })();`,
  }).as('captchaScript');

  // Mock backend verification
  cy.intercept('POST', '**/siteverify', {
    statusCode: 200,
    body: { success: true },
  }).as('captchaVerification');
};

// Also inject solution directly after page load:
const injectCaptchaSolution = () => {
  cy.window().then((win) => {
    const input = win.document.querySelector(
      'input[name="frc-captcha-solution"]',
    );
    if (input) {
      const setter = Object.getOwnPropertyDescriptor(
        win.HTMLInputElement.prototype,
        'value',
      ).set;
      setter.call(input, 'MOCK_SOLUTION');
      input.dispatchEvent(new win.Event('input', { bubbles: true }));
    }
    const btn = win.document.querySelector('button[type="submit"]');
    if (btn) btn.removeAttribute('disabled');
  });
};
```

---

## Analyze FE Code

### When FE HTML is Available

1. Load `ai/html/dh-registration-page.html`
2. Extract all `name`, `id`, `aria-*` attributes
3. Map to selectors grouped by section
4. Check for disabled states (CAPTCHA submit button, dropdowns)
5. Identify validation error patterns: `div[role="alert"]`

### When Screenshots Are Available

1. Load from `cypress/screenshots/<suite>/` or `ai/html/`
2. Identify form layout sections
3. Note error states, disabled buttons, visible dialogs
4. Cross-reference with HTML selectors

---

## Migration Rules

### PRESERVE (Do Not Change)

- ✅ Business logic flow
- ✅ Assertions and validations
- ✅ Email confirmation workflow (Yopmail)
- ✅ Credential extraction logic
- ✅ First-time login validation
- ✅ Master user login flows (`loginToSupportViewMaster`)

### REPLACE (Must Update)

- ❌ E-gehaltszettel selectors → DH selectors (`input[name="..."]`, `#create-user-*`)
- ❌ `cy.loginToSupportViewAdmin()` → `cy.loginToDH()`
- ❌ XML upload → Form filling
- ❌ Support View navigation → Direct DH page navigation

### NEVER DO

- ❌ Use `cy.wait(N)` without a comment explaining why
- ❌ Set up `cy.intercept()` after `cy.visit()`
- ❌ Skip bilingual matchers (always use `/EN text|DE text/i`)
- ❌ Remove cleanup or precondition `it` blocks

---

## Output Format

For every test suite migration or creation, generate:

### 1. Test Suite File

**Path:** `cypress/e2e/DH/EG/DH_EG_<NN>_<FeatureName>_TS.js`

```javascript
///<reference types="cypress" />
/**
 * DH_EG_<NN>_<FeatureName>_TS
 * Migration Source: <original file>
 * AI-Generated: <date>
 */
describe('DH_EG_<NN>_<FeatureName>_TS', () => {
  // ...
});
```

### 2. Test Documentation

**Path:** `docs/test-docs/DH_EG_<NN>_<FeatureName>.md`

Use the format in `docs/test-docs/DH_EG_03_Create_EBox_User_Manually.md` as template.
Each `it` block must have: Purpose, Preconditions, Login, Steps table, Env vars, Assertions.

### 3. Selectors File (if new selectors needed)

**Path:** `cypress/support/selectors/<feature>.selectors.js`

### 4. Page Object (if new page needed)

**Path:** `cypress/support/pages/<Feature>Page.js`

### 5. Fixture Data (if new data needed)

**Path:** `cypress/fixtures/<feature>-data.json`

### 6. TODO / Risk List

- Missing selectors needing `data-testid`
- CAPTCHA status (enabled/disabled in env)
- Unresolved bilingual text
- Assumptions made

---

## Example Transformation

### Before (E-gehaltszettel)

```javascript
cy.loginToSupportViewAdmin();
cy.get('.upload__document__text').click();
cy.createNewUserFromXMLfile();
```

### After (DH)

```javascript
// Bypass captcha BEFORE navigation
bypassCaptcha();
cy.visit(`${Cypress.env('dh_baseUrl')}/register`);
injectCaptchaSolution();
fillRegistrationForm(registrationData);
submitRegistration();
YopmailPage.extractCredentials();
```

## Validation Checklist

Before submitting output, verify:

- [ ] All business validations preserved
- [ ] DH selectors used (not E-gehaltszettel)
- [ ] Page Objects used (not direct cy.get)
- [ ] Fixture data loaded
- [ ] Bilingual support (EN/DE)
- [ ] Error handling present
- [ ] Waits are justified
- [ ] Documentation complete
- [ ] TODO items noted

## Success Criteria

1. ✅ Test runs without errors
2. ✅ All assertions pass
3. ✅ Uses DH HTML structure
4. ✅ Reusable and maintainable
5. ✅ Well-documented
6. ✅ Follows framework conventions

## Notes

- If HTML structure unclear, use similar patterns from existing DH tests
- If selector unstable, note in TODO
- If business logic unclear, mark as ASSUMPTION in docs
- Always prefer Page Object methods over direct cy.get()
- Use descriptive test names: `DH_[ID] - [Clear description]`

## Response Format

Please provide:

1. **Summary:** What was migrated and key changes
2. **Files Created:** List of all generated files
3. **Assumptions Made:** Any unclear points
4. **TODO Items:** What needs manual review or completion
5. **Risk Assessment:** Flaky selectors, timing issues, etc.
