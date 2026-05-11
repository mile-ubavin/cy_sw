# Test Migration Rules: E-gehaltszettel → DocumentHub

## Migration Philosophy

**PRESERVE business logic, REPLACE infrastructure**

The goal is to run the same tests on a different platform, NOT to rewrite tests.

---

## Core Principles

### 1. PRESERVE: Business Logic

- All test scenarios
- All assertions and validations
- Test data patterns
- Expected results
- Error conditions
- Edge cases

### 2. REPLACE: Infrastructure

- Login mechanisms
- Page selectors
- Navigation flows
- DOM structure references

### 3. ENHANCE: Quality

- Add data-testid selectors where possible
- Remove hardcoded waits
- Extract reusable components
- Improve selector stability

---

## Specific Migration Rules

### Rule 1: Authentication Changes

#### ❌ OLD (E-gehaltszettel)

```javascript
cy.visit(Cypress.env('sw_baseUrl'));
cy.loginToSupportViewAdmin();
cy.get('#username').type('admin');
cy.get('#password').type('password');
cy.get('button[type="submit"]').click();
```

#### ✅ NEW (DocumentHub)

```javascript
cy.loginToDH(); // Use existing custom command
cy.visit(Cypress.env('dh_baseUrl'));
```

**Exception**: Master user tests using `cy.loginToSupportViewMaster()` should NOT be migrated.

---

### Rule 2: Selector Replacement

#### Process

1. Find HTML element in DH HTML snapshot
2. Identify best selector (prefer data-testid)
3. Replace legacy selector
4. Verify selector is unique and stable

#### Example

```javascript
// OLD
cy.get('.employee-table > tbody > tr:nth-child(2) > td:nth-child(3)');

// NEW (from DH HTML)
cy.get('[data-testid="employee-table"]')
  .find('tbody tr')
  .eq(1) // Same row index
  .find('[data-testid="email-cell"]'); // New stable selector
```

---

### Rule 3: Fixture Data Reuse

**Always use existing fixtures when available**

```javascript
// ✅ CORRECT: Use existing fixture
const user = Cypress.env('createUser')[0];

// ❌ WRONG: Create new hardcoded data
const user = {
  firstName: 'John',
  lastName: 'Doe',
};
```

---

### Rule 4: Page Navigation

#### ❌ OLD

```javascript
cy.visit('/supportview/employees');
```

#### ✅ NEW

```javascript
cy.visit(Cypress.env('dh_baseUrl') + '/employees');
```

---

### Rule 5: Bilingual Selectors

Always maintain bilingual support:

```javascript
// ✅ CORRECT: Supports EN and DE
cy.contains('button', /Login|Anmelden/i).click();

// ❌ WRONG: English only
cy.contains('button', 'Login').click();
```

---

### Rule 6: Table Validations

**Account for actions column at index 0**

```javascript
// Table structure: Actions | Name | Email | Phone | Status
cy.get('tbody tr')
  .first()
  .find('td')
  .eq(0) // Actions column
  .find('td')
  .eq(1) // Name
  .find('td')
  .eq(2) // Email
  .find('td')
  .eq(3) // Phone
  .find('td')
  .eq(4); // Status
```

---

### Rule 7: Waiting Strategy

#### ❌ AVOID

```javascript
cy.wait(3000); // Hardcoded wait
```

#### ✅ PREFER

```javascript
cy.get('[data-testid="loader"]').should('not.exist');
cy.get('[data-testid="table"]').should('be.visible');
cy.get('tbody tr').should('have.length.greaterThan', 0);
```

---

### Rule 8: Yopmail Integration

**Preserve existing Yopmail patterns**

```javascript
// Email confirmation flow (DO NOT CHANGE)
cy.visit(`https://yopmail.com/?login=${emailAddress.split('@')[0]}`);
cy.iframe('#ifinbox').find('.m').first().click();
cy.iframe('#ifmail').find('a:contains("Confirm")').click();
```

---

### Rule 9: Custom Commands Usage

**Always prefer existing custom commands**

```javascript
// ✅ CORRECT: Use existing command
cy.loginToDH();

// ❌ WRONG: Reimplement login
cy.visit('/login');
cy.get('#username').type('user');
// ... etc
```

---

### Rule 10: Test Documentation

**Add metadata to every migrated test**

```javascript
/**
 * @feature Employee Management - Create User
 * @source E-gehaltszettel/R03_Create_E-box_User_Manually-MasterUser.js
 * @migrated 2026-05-11 (AI-assisted)
 * @target DocumentHub Employee Management Module
 * @owner QA Automation
 * @risk Low - Straightforward CRUD operation
 * @dependencies cy.loginToDH(), fixtures/users.json
 */
describe('DH_EG_03_Employees_TS_Create_User', () => {
  // Test cases...
});
```

---

## Migration Checklist

Before marking a test as "migrated," verify:

- [ ] Business logic unchanged
- [ ] All assertions present
- [ ] DH selectors used (from HTML/screenshots)
- [ ] Login changed to `cy.loginToDH()`
- [ ] Base URL uses `dh_baseUrl`
- [ ] Fixtures reused (not duplicated)
- [ ] No hardcoded waits
- [ ] Bilingual selectors maintained
- [ ] Test metadata added
- [ ] Code linted (no syntax errors)
- [ ] Test runs successfully in Cypress
- [ ] Documentation generated

---

## Risk Categories

### Low Risk

- Simple CRUD operations
- Standard form interactions
- Basic validations

### Medium Risk

- Multi-step workflows
- Complex table interactions
- Conditional logic

### High Risk

- Integration with external systems (Yopmail)
- File upload/download
- Real-time validations
- Cross-platform features

---

## Common Pitfalls

### ❌ Pitfall 1: Changing Test Intent

```javascript
// OLD: Test verifies user creation fails without email
it('should show error when email is missing', () => {
  // create user without email
  // expect error
});

// ❌ WRONG: Changed test intent
it('should create user with email', () => {
  // create user with email
  // expect success
});
```

### ❌ Pitfall 2: Hardcoding Data

```javascript
// ❌ WRONG
const companyName = 'Aqua';

// ✅ CORRECT
const companyName = Cypress.env('company');
```

### ❌ Pitfall 3: Breaking Existing Utilities

```javascript
// ❌ WRONG: Reimplementing existing function
function createUser(data) {
  cy.get('#firstName').type(data.firstName);
  // ... etc
}

// ✅ CORRECT: Use or extend existing command
cy.createUserViaDH(userData); // Assuming this exists
```

---

## Special Cases

### Master User Tests (DO NOT MIGRATE)

Tests using `cy.loginToSupportViewMaster()` remain in E-gehaltszettel folder.

### E-box Specific Features (PRESERVE)

E-box functionality tests remain unchanged.

### Cross-Platform Tests (EVALUATE)

Tests that verify integration between platforms require manual review.

---

## Output Format

Every migration must produce:

1. **Migrated Test File**
   - Filename: `DH_EG_[Module]_TS_[Feature].js`
   - Full working code
   - Metadata header

2. **Selector Mapping Document**

   ```
   | Old Selector | New Selector | Risk | Notes |
   |--------------|--------------|------|-------|
   | .employee-name | [data-testid="employee-name"] | Low | Stable |
   ```

3. **Risk Assessment**
   - Overall risk level
   - Specific concerns
   - Manual review items

4. **TODO List**
   - Missing fixtures
   - Unverified selectors
   - Edge cases to test

---

## Review Criteria

### Code Review

- [ ] Follows existing code style
- [ ] No console.log() statements
- [ ] Proper error handling
- [ ] Comments for complex logic

### Functional Review

- [ ] Test passes locally
- [ ] Covers same scenarios as original
- [ ] Handles edge cases
- [ ] Error messages are clear

### Documentation Review

- [ ] Metadata complete
- [ ] Feature documentation generated
- [ ] Migration notes clear
- [ ] Known issues documented
