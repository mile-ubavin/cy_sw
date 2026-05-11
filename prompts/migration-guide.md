# Test Migration Guide: E-gehaltszettel → DocumentHub

## Overview

This guide shows how to migrate E-gehaltszettel (E-G) tests to DocumentHub (DH) platform while preserving shared functionality.

---

## Migration Decision Tree

```
For each IT block, ask:
┌───────────────────────────────────────┐
│ Does it use loginToSupportViewMaster? │
└────────────┬──────────────────────────┘
             │
        YES  │  NO
             │
      ┌──────▼──────┐
      │  KEEP AS-IS │
      └─────────────┘
             │
        ┌────▼────────────────────────┐
        │ Does it test E-box features?│
        └────┬────────────────────────┘
             │
        YES  │  NO
             │
       ┌─────▼──────┐
       │ KEEP AS-IS │
       └────────────┘
             │
        ┌────▼──────────────────────┐
        │ Does it use Yopmail flows?│
        └────┬──────────────────────┘
             │
        YES  │  NO
             │
    ┌───────▼───────────┐
    │ MIGRATE (keep     │
    │ Yopmail validation│
    │ logic unchanged)  │
    └───────────────────┘
             │
        NO   │
             │
    ┌────────▼─────────┐
    │ MIGRATE FULLY    │
    │ (update login,   │
    │ URLs, selectors) │
    └──────────────────┘
```

---

## Example 1: Admin User Login Test (MIGRATE)

### Before (E-gehaltszettel):

```javascript
it('SW - Login as Admin User', () => {
  cy.visit(Cypress.env('sw_baseUrl'));

  cy.get('body').then(($body) => {
    if ($body.find('#onetrust-policy-title').is(':visible')) {
      cy.get('#onetrust-accept-btn-handler').click({ force: true });
    }
  });

  cy.loginToSW();
  cy.wait(2000);
  cy.url().should('include', `${Cypress.env('sw_baseUrl')}home`);
});
```

### After (DocumentHub):

```javascript
it('DH - Login as Admin User', () => {
  cy.visit(Cypress.env('dh_baseUrl'));

  cy.get('body').then(($body) => {
    if ($body.find('#onetrust-policy-title').is(':visible')) {
      cy.get('#onetrust-accept-btn-handler').click({ force: true });
    }
  });

  cy.loginToDH(); // ✅ Changed
  cy.wait(2000);
  cy.url().should('include', `${Cypress.env('dh_baseUrl')}home`); // ✅ Changed
});
```

**Changes:**

- `cy.loginToSW()` → `cy.loginToDH()`
- `sw_baseUrl` → `dh_baseUrl`
- Cookie handling: UNCHANGED ✓

---

## Example 2: Master User Test (KEEP AS-IS)

### Before & After (NO CHANGES):

```javascript
it('Login As Master User - Delete Users', () => {
  cy.loginToSupportViewMaster(); // ✅ KEEP - Master user login
  cy.wait(3500);

  cy.get('body').then(($body) => {
    if ($body.find('.release-note-dialog__close-icon').length > 0) {
      cy.get('.release-note-dialog__close-icon').click();
    }
  });

  // ... rest of test unchanged
  const companyName = Cypress.env('company'); // ✅ KEEP
  // ... deletion logic
});
```

**Rationale:**

- Master user login is platform-agnostic
- Deletion happens in backend/admin portal
- No DH-specific changes needed

---

## Example 3: Yopmail Confirmation (MIGRATE with preserved logic)

### Before (E-gehaltszettel):

```javascript
it('SW - Create User and Confirm Email', () => {
  cy.visit(Cypress.env('sw_baseUrl'));
  cy.loginToSW();

  // Create user in SW
  cy.get('#sw-create-user').click();
  cy.get('#user-email').type('test@yopmail.com');
  // ... user creation steps

  // ✅ Yopmail flow - KEEP THIS UNCHANGED
  cy.visit('https://yopmail.com/en/');
  cy.get('#login').type('test@yopmail.com');
  cy.get('#refreshbut').click();

  cy.iframe('#ifinbox')
    .find('.mctn > .m > button > .lms')
    .first()
    .click({ force: true });

  // ... confirmation logic unchanged
});
```

### After (DocumentHub):

```javascript
it('DH - Create User and Confirm Email', () => {
  cy.visit(Cypress.env('dh_baseUrl')); // ✅ Changed
  cy.loginToDH(); // ✅ Changed

  // Create user in DH
  cy.get('#employee-add-employee').click(); // ✅ Selector might differ
  cy.get('#create-user-email').type('test@yopmail.com');
  // ... user creation steps

  // ✅ Yopmail flow - KEEP THIS UNCHANGED
  cy.visit('https://yopmail.com/en/');
  cy.get('#login').type('test@yopmail.com');
  cy.get('#refreshbut').click();

  cy.iframe('#ifinbox')
    .find('.mctn > .m > button > .lms')
    .first()
    .click({ force: true });

  // ... confirmation logic unchanged
});
```

**Changes:**

- Platform login/URLs updated
- User creation selectors updated (if different in DH)
- Yopmail validation: UNCHANGED ✓

---

## Example 4: E-box Specific Test (KEEP AS-IS)

### No Migration Needed:

```javascript
it('E-box - Login and verify deliveries', () => {
  cy.visit(Cypress.env('baseUrl_egEbox')); // ✅ KEEP - E-box URL

  cy.get('body').then(($body) => {
    if ($body.find('#onetrust-policy-title').is(':visible')) {
      cy.get('#onetrust-accept-btn-handler').click({ force: true });
    }
  });

  const user = Cypress.env('createUser')[0];
  cy.get('.input__field-input')
    .eq(0)
    .type(Cypress.env('companyPrefix') + user.username);

  // ... E-box specific logic - all stays the same
});
```

**Rationale:**

- E-box is separate platform
- No DH migration needed
- Keep in original suite

---

## Selector Migration Guide

### Common Selector Changes

| Component          | E-gehaltszettel   | DocumentHub                | Notes            |
| ------------------ | ----------------- | -------------------------- | ---------------- |
| Create User Button | `#sw-create-user` | `#employee-add-employee`   | Verify in DH     |
| User Email Input   | `#user-email`     | `#create-user-email`       | Different wizard |
| Company Dropdown   | `#company-select` | `#employee-select-company` | Same pattern     |
| Pagination         | Generic `select`  | Generic `select`           | No change        |

### Pattern to Verify Selectors:

```javascript
// In browser DevTools on DH page:
// 1. Inspect element
// 2. Copy selector
// 3. Test in Cypress with:
cy.get('YOUR_SELECTOR').should('exist');
```

---

## Migration Workflow

### Step 1: Identify Test Type

```bash
# Search for login patterns
grep -r "loginToSW" cypress/e2e/E-gehaltszettel/
grep -r "loginToSupportViewMaster" cypress/e2e/E-gehaltszettel/
grep -r "baseUrl_egEbox" cypress/e2e/E-gehaltszettel/
```

### Step 2: Create Migration Branch

```bash
git checkout -b migrate/e-gehaltszettel-to-dh
```

### Step 3: Migrate One File at a Time

```bash
# Copy original to Legacy
cp cypress/e2e/E-gehaltszettel/AdminUser.js cypress/e2e/Legacy/E-gehaltszettel/

# Create migrated version
# Edit: cypress/e2e/DH/EG/DH_EG_02_AdminUser.js
```

### Step 4: Test Migration

```bash
# Run original (should still work)
npx cypress run --spec "cypress/e2e/Legacy/E-gehaltszettel/AdminUser.js"

# Run migrated
npx cypress run --spec "cypress/e2e/DH/EG/DH_EG_02_AdminUser.js"
```

### Step 5: Document Changes

Create migration log in test file:

```javascript
/**
 * MIGRATION LOG
 * Original: E-gehaltszettel/AdminUser.js
 * Migrated: 2026-05-07
 * Changes:
 * - cy.loginToSW() → cy.loginToDH()
 * - sw_baseUrl → dh_baseUrl
 * - Updated user creation selectors
 * Preserved:
 * - Master user deletion tests (unchanged)
 * - Yopmail confirmation flows
 */
```

---

## AI-Assisted Migration

### Using Claude/OpenCode:

**Prompt Template:**

```
I need to migrate this Cypress test from E-gehaltszettel to DocumentHub.

Context:
- Keep: cy.loginToSupportViewMaster(), Yopmail flows, E-box tests
- Change: cy.loginToSW() → cy.loginToDH(), sw_baseUrl → dh_baseUrl
- Verify selectors work in DH (Material-UI components)

Test to migrate:
[paste test code]

Please:
1. Identify what needs to change
2. Show the migrated version
3. List any selectors that need verification in DH
```

**Example Response Analysis:**

```javascript
// AI will highlight:
✅ Changed: cy.loginToSW() → cy.loginToDH()
✅ Changed: Cypress.env('sw_baseUrl') → Cypress.env('dh_baseUrl')
⚠️  Verify: #create-user-button (check if DH uses same ID)
✓ Kept: cy.loginToSupportViewMaster() (unchanged)
✓ Kept: Yopmail iframe logic (unchanged)
```

---

## Common Pitfalls

### ❌ Don't Do This:

```javascript
// Changing master user login
cy.loginToSupportViewMasterDH(); // ❌ Wrong! No DH variant needed

// Changing Yopmail URLs
cy.visit('https://yopmail-dh.com/en/'); // ❌ Wrong! Yopmail is external

// Removing E-box tests
// ❌ Wrong! E-box tests stay as-is
```

### ✅ Do This Instead:

```javascript
// Keep master user login unchanged
cy.loginToSupportViewMaster(); // ✅ Correct

// Keep Yopmail URLs unchanged
cy.visit('https://yopmail.com/en/'); // ✅ Correct

// Preserve E-box tests in original location
// ✅ Correct - don't migrate E-box tests
```

---

## Migration Checklist Template

Use this for each test file:

```markdown
## Migration: [FileName].js

### Analysis

- [ ] Reviewed all IT blocks
- [ ] Identified login types used
- [ ] Identified E-box specific tests
- [ ] Identified Yopmail flows
- [ ] Documented selector changes needed

### Changes Made

- [ ] Updated cy.loginToSW() → cy.loginToDH() (X blocks)
- [ ] Updated sw_baseUrl → dh_baseUrl (X occurrences)
- [ ] Verified/updated selectors: [list]
- [ ] Kept unchanged: Master user login (X blocks)
- [ ] Kept unchanged: Yopmail flows (X blocks)
- [ ] Kept unchanged: E-box tests (X blocks)

### Testing

- [ ] Original test passes (in Legacy folder)
- [ ] Migrated test passes (in DH folder)
- [ ] No regressions observed
- [ ] Documented in migration log

### Documentation

- [ ] Added migration log to file header
- [ ] Updated README if needed
- [ ] Committed with descriptive message
```

---

## Quick Reference

| Aspect        | Keep Unchanged               | Migrate/Update                |
| ------------- | ---------------------------- | ----------------------------- |
| **Logins**    | `loginToSupportViewMaster()` | `loginToSW()` → `loginToDH()` |
| **URLs**      | E-box URLs, Yopmail          | `sw_baseUrl` → `dh_baseUrl`   |
| **Selectors** | Generic Material-UI          | Platform-specific IDs         |
| **Test Data** | `Cypress.env('createUser')`  | (verify structure matches)    |
| **Platform**  | E-box tests                  | Admin/Workspace tests         |

---

## Getting Help

**Ask AI:**

- "Show me what needs to change in this E-G test for DH"
- "Is this test E-box specific or should I migrate it?"
- "Generate migration diff for this suite"

**Manual Check:**

- Run test in both platforms
- Compare selector availability
- Validate data flow

**Documentation:**

- Read `automation-context.md` for patterns
- Check this guide for examples
- Reference existing migrated tests

---

## Summary

**Golden Rules:**

1. **Master user tests** → No changes
2. **E-box tests** → No migration (keep as-is)
3. **Yopmail flows** → Keep validation logic unchanged
4. **Admin/Employee tests** → Migrate login and URLs
5. **Always test** before committing

**When in doubt:** Keep it unchanged and ask for review!
