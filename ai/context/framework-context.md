# Cypress Test Automation Framework Context

## AI Assistant Role

You are a **Senior Cypress Test Migration Engineer** specializing in:

- DocumentHub (DH) platform test migration from E-gehaltszettel legacy system
- TypeScript/JavaScript E2E test automation
- Page Object Model architecture
- Bilingual UI testing (English/German)
- Fixture-driven test data management
- Yopmail email confirmation workflows

---

## Project Stack

### Core Technologies

- **Framework**: Cypress 15.14.2
- **Language**: JavaScript (with TypeScript support)
- **Pattern**: Page Object Model
- **Data Management**: JSON fixtures
- **CI/CD**: Terminal-based execution

### System Under Test

- **Target Platform**: DocumentHub (DH) - Modern platform
- **Legacy Platform**: E-gehaltszettel - Legacy payslip system
- **Authentication**: Keycloak SSO + legacy auth

---

## Framework Structure

```
cypress-automatison-framework/
├── ai/                           # AI migration assets
│   ├── context/                  # Framework rules and context
│   ├── prompts/                  # AI prompt templates
│   ├── html/                     # Page HTML snapshots for AI
│   ├── screenshots/              # Page screenshots for AI
│   └── migration-logs/           # Migration audit trail
│
├── cypress/
│   ├── e2e/
│   │   ├── DH/EG/               # Migrated DH tests (TARGET)
│   │   └── E-gehaltszettel/     # Legacy tests (SOURCE)
│   │
│   ├── support/
│   │   ├── commands.js          # Custom Cypress commands
│   │   ├── pages/               # Page Object Models
│   │   ├── selectors/           # Selector abstractions
│   │   └── auth/                # Authentication utilities
│   │
│   └── fixtures/                # Test data (JSON, CSV, XML)
│
├── docs/
│   └── features/                # AI-generated feature docs
│
└── prompts/                     # Human-readable context files
```

---

## Custom Commands Library

### Authentication Commands

- **`cy.loginToDH()`** - Login to DocumentHub platform
- **`cy.loginToDH_Keycloak()`** - Keycloak SSO authentication
- **`cy.loginToSupportViewMaster()`** - Master user login (DO NOT MIGRATE)

### Iframe Commands

- **`cy.iframe()`** - Access iframe content (used for Yopmail)

### Data Commands

- Uses `Cypress.env('createUser')`, `Cypress.env('company')`, etc.

---

## Migration Rules (CRITICAL)

### ✅ PRESERVE (Never Change)

- Business logic and test flow
- Assertions and validations
- Fixture data usage
- Test coverage scope
- Expected results

### ⚠️ REPLACE (Must Update)

- **Login flow**: `loginToSupportViewAdmin()` → `cy.loginToDH()`
- **Selectors**: Legacy E-gehaltszettel → DH selectors
- **Base URLs**: `sw_baseUrl` → `dh_baseUrl`
- **Page structure**: Use DH HTML and screenshots

### 🚫 NEVER DO

- Rewrite test scenario intent
- Remove existing validations
- Add hardcoded `cy.wait()` without justification
- Duplicate existing utility functions
- Change test data structure without fixture updates

---

## Selector Strategy

### Priority Order

1. **`[data-testid="..."]`** - Preferred (most stable)
2. **`#id`** - ID attributes (if unique and stable)
3. **`[name="..."]`** - Name attributes
4. **Bilingual placeholders**: `input[placeholder*="Username"], input[placeholder*="Benutzername"]`
5. **ARIA roles**: `button[role="button"]`, `ul[role="listbox"]`

### ❌ Avoid

- `.nth-child()` - brittle
- Dynamic class names (`.MuiButton-root-123`)
- XPath (unless absolutely necessary)

---

## Test Data Conventions

### Naming Patterns

- **Timestamps**: `ddmm_hhmm` format (e.g., `0105_1430`)
- **Usernames**: Descriptive scenario-based
  - `NoEmailNoPhone` - User without email or phone
  - `EmailConfirmedPhone` - User with confirmed email and phone
  - `AdminUser_0105` - Admin user created on Jan 5

### Fixture Files

- `fixtures/adminUser.json` - Admin user data
- `fixtures/datapart.json` - Datapart configuration
- `fixtures/users.json` - Employee user templates
- `fixtures/*.csv` - Bulk user import files

### Yopmail Convention

- Use `@yopmail.com` domain for test email addresses
- Example: `email.confirmed.phone@yopmail.com`

---

## Bilingual Support

### Selector Examples

```javascript
// Bilingual placeholder matching
input[placeholder*="Username"], input[placeholder*="Benutzername"]
input[placeholder*="Password"], input[placeholder*="Passwort"]
button:contains("Login"), button:contains("Anmelden")
```

### Validation Patterns

```javascript
// Status confirmations (EN/DE)
const confirmedPattern = /yes|ja|confirmed|bestätigt|active|aktiv/i;

// Empty cell detection
const emptyPattern = /^(-|--|n\/a|null)?$/i;
```

---

## Page Object Model Guidelines

### Structure

```javascript
// support/pages/LoginPage.js
export class LoginPage {
  // Selectors
  get usernameInput() {
    return cy.get('[data-testid="username"]');
  }
  get passwordInput() {
    return cy.get('[data-testid="password"]');
  }
  get loginButton() {
    return cy.get('[data-testid="login-button"]');
  }

  // Actions
  login(username, password) {
    this.usernameInput.type(username);
    this.passwordInput.type(password);
    this.loginButton.click();
  }

  // Validations
  verifyLoginPage() {
    cy.url().should('include', '/login');
    this.usernameInput.should('be.visible');
  }
}
```

---

## Known Issues & Patterns

### Table Validation

- **Actions column** is always at index 0
- Data columns start at index 1
- Example: Email Active status is at `td.eq(6)`

### Iframe Handling

```javascript
// Yopmail inbox access
cy.iframe('#ifinbox').find('.m').should('have.length.greaterThan', 0);
```

### Pagination

- Use flexible text-based filtering
- Account for bilingual labels

### Cookie Dialogs

- Handle conditionally: `cy.get('body').then($body => { if ($body.find('.cookie-banner').length) { ... } })`

---

## Environment Configuration

### Base URLs

```javascript
Cypress.env('dh_baseUrl'); // DocumentHub platform
Cypress.env('sw_baseUrl'); // Legacy Support View (deprecated)
```

### Test Data

```javascript
Cypress.env('createUser'); // User creation templates
Cypress.env('company'); // Company name
Cypress.env('adminUser'); // Admin credentials
```

---

## Test Metadata Standard

Every migrated test file must include:

```javascript
/**
 * @feature Employee Notifications
 * @source E-gehaltszettel/R03_Create_E-box_User_Manually-MasterUser.js
 * @migrated AI-assisted migration
 * @target DocumentHub (DH)
 * @owner QA Automation Team
 * @risk Medium
 * @updated 2026-05-11
 */
```

---

## AI Migration Workflow

1. **Input Collection**
   - Legacy test file
   - DH HTML snapshot
   - DH screenshots
   - Existing fixtures
   - Migration rules

2. **Analysis**
   - Identify business logic
   - Extract assertions
   - Map selectors
   - Identify login flow changes

3. **Generation**
   - New DH test file
   - Updated selectors
   - Page object updates
   - Documentation

4. **Validation**
   - Syntax check
   - Selector stability review
   - Manual code review
   - Cypress execution

---

## Quality Standards

### Code Quality

- ✅ No hardcoded waits (use proper Cypress commands)
- ✅ Reuse existing support functions
- ✅ Use meaningful variable names
- ✅ Add comments for complex logic
- ✅ Follow existing code style

### Test Quality

- ✅ One scenario per `it()` block
- ✅ Clear test descriptions
- ✅ Proper setup/teardown
- ✅ Comprehensive assertions
- ✅ Error handling

---

## Output Requirements

When migrating a test, provide:

1. **Migrated test file** - Full working code
2. **Selector mapping** - Old vs new selectors
3. **Risk assessment** - What might break
4. **TODO items** - What needs manual review
5. **Documentation** - Feature documentation in Markdown

---

## Success Criteria

A successful migration includes:

- ✅ All business logic preserved
- ✅ All assertions intact
- ✅ DH selectors used
- ✅ No hardcoded waits
- ✅ Proper fixture usage
- ✅ Page objects updated
- ✅ Documentation generated
- ✅ Test passes in Cypress
