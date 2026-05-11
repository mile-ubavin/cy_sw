# Automation Context

## Project Overview

Cypress E2E test automation framework for DocumentHub (DH) platform testing.

**Migration Status**: Converting E-gehaltszettel (E-G) tests to DocumentHub (DH)

- Original platform: E-gehaltszettel (Payslip system)
- Target platform: DocumentHub (DH)
- Strategy: Migrate admin/employee tests, preserve master user/ebox/Yopmail flows

## Test Suites

### Active DH Suites

- **DH_EG_03_Employees_TS_Notifications**: User creation and notification scenarios covering 6 user types with email/phone/confirmation validation
- **DH_EG_03_Employees_TS_Create_EBox_User_Manually**: E-box user creation with Yopmail confirmation
- Employee management workflows
- Document delivery and activity logging

### Preserved Test Types (DO NOT MIGRATE)

- Master user login tests (`cy.loginToSupportViewMaster()`)
- E-box specific functionality
- Yopmail email confirmation flows
- Cross-platform integration tests

## Key Technologies

- **Framework**: Cypress 15.14.2
- **Language**: JavaScript
- **Pattern**: Page Object Model with custom commands

## Environment Configuration

- Base URLs configured via `Cypress.env('dh_baseUrl')`
- Test data from `Cypress.env('createUser')`, `Cypress.env('company')`
- Bilingual support: English (EN) + German (DE)

## Common Patterns

### Custom Commands

- `cy.loginToDH()`: DH authentication
- `cy.loginToSupportViewMaster()`: Master user login
- `cy.iframe()`: Iframe content access (e.g., Yopmail)

### Selectors

- Bilingual placeholders: `input[placeholder*="Username"], input[placeholder*="Benutzername"]`
- Material-UI components: `ul[role="listbox"]`, `div[role="combobox"]`
- ID-based: `#employee-select-company`, `#create-user-*`

## Test Data Conventions

- Usernames: Descriptive scenario-based (e.g., `NoEmailNoPhone`, `EmailConfirmedPhone`)
- Timestamps: `ddmm_hhmm` format for uniqueness
- Yopmail: `@yopmail.com` for email confirmation testing

## Validation Patterns

- Table cell validation with `.eq()` indexing (accounts for actions column at index 0)
- Empty cell detection: `-`, `--`, `n/a`, `null`
- Confirmation status: `yes|ja|confirmed|bestätigt|active|aktiv`

## Known Issues & Fixes

- Inbox cleanup requires iframe-aware message count validation
- Pagination dropdowns need flexible text-based filtering
- Cookie dialogs handled conditionally on page load
- Email Active column is at `td.eq(6)` (after actions, name, personal numbers, username, email, phone)

## Test Migration Strategy (E-G → DH)

### Files to Migrate

```
e2e/E-gehaltszettel/ → e2e/DH/EG/
├── Workspace tests → DH_EG_01_Workspace_*
├── AdminUser tests → DH_EG_02_AdminUser_*
└── Employees tests → DH_EG_03_Employees_*
```

### Migration Patterns

#### 1. Login Command Updates

```javascript
// OLD (E-gehaltszettel)
cy.loginToSW();
cy.visit(Cypress.env('sw_baseUrl'));

// NEW (DocumentHub)
cy.loginToDH();
cy.visit(Cypress.env('dh_baseUrl'));
```

#### 2. Keep Unchanged

```javascript
// ✅ DO NOT CHANGE - These stay the same
cy.loginToSupportViewMaster(); // Master user login
cy.visit('https://yopmail.com/en/'); // Yopmail flows
Cypress.env('createUser'); // Test data structure
```

#### 3. Selector Updates (if needed)

- Verify DH uses same Material-UI components
- Update platform-specific IDs if different
- Keep bilingual EN/DE patterns

### Migration Checklist per IT Block

- [ ] Does this IT use `cy.loginToSW()`? → Change to `cy.loginToDH()`
- [ ] Does this IT use `cy.loginToSupportViewMaster()`? → Keep as-is
- [ ] Does this IT test E-box features? → Keep as-is
- [ ] Does this IT use Yopmail? → Keep validation logic as-is
- [ ] Update base URL env variable references
- [ ] Test and verify migrated IT works

## AI Assistant Integration

### Using with Claude/OpenCode

When asking AI for help, provide this context:

```
"I'm migrating Cypress tests from E-gehaltszettel to DocumentHub.

Keep unchanged:
- cy.loginToSupportViewMaster() (master user)
- Yopmail confirmation flows
- E-box specific tests
- Test data structures

Change:
- cy.loginToSW() → cy.loginToDH()
- sw_baseUrl → dh_baseUrl
- Update selectors IF they differ between platforms

Help me refactor this test:
[paste your test code]
"
```

### Recommended Prompts

**For Migration:**

- "Convert this E-gehaltszettel test to DocumentHub while preserving master user flows"
- "Identify which parts of this test need to change for DH migration"
- "Generate migration diff for this test suite"

**For Development:**

- "Add bilingual EN/DE support to this selector"
- "Create Page Object for DH Employees page"
- "Extract this validation into reusable helper"

## Folder Structure

```
cypress/e2e/
├── DH/                      # DocumentHub tests (migrated)
│   └── EG/                  # E-Gehaltszettel origin
│       ├── 01_Workspace/
│       ├── 02_AdminUser/
│       └── 03_Employees/
│           └── DH_EG_03_Employees_TS_Notifications.js
│
├── Legacy/                  # Archived original tests
│   └── E-gehaltszettel/
│
prompts/                     # AI context files
├── automation-context.md    # This file
├── SETUP_GUIDE.md          # Development setup
├── migration-guide.md       # Detailed migration examples
└── test-patterns.md         # Reusable patterns
```
