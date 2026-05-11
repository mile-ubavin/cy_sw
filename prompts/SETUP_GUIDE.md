# Development Setup Guide

## Based on Your Screenshots

### 1. Claude CLI Setup (Image 1)

You've installed Anthropic's Claude CLI - excellent for AI-assisted coding!

**Installation Verified:**

```bash
# npm (svuda)
npm i -g @anthropic-ai/claude-code

# native installer
curl -fsSL claude.ai/install.sh | bash
```

**Next Steps:**

1. Authenticate: `claude auth login`
2. Set your API key in environment variables
3. Use in terminal: `claude "your coding question"`

### 2. OpenCode Setup (Image 2)

You have OpenCode AI assistant running in VS Code.

**Commands Visible:**

- `⌘ K` or `I` - Open Chat
- `⌘ ⇧ P` - Show All Commands
- `F5` - Start Debugging

**Recommended VS Code Extensions:**

1. **Anthropic Claude Code** - AI pair programming
2. **Cypress Helper** - Cypress test snippets
3. **ESLint** - Code quality
4. **Prettier** - Code formatting
5. **GitLens** - Git integration

---

## Recommended Folder Structure for Your Project

```
cypress-automatison-framework/
├── .vscode/
│   ├── settings.json          # Workspace settings
│   ├── extensions.json        # Recommended extensions
│   └── tasks.json             # Build/test tasks
│
├── prompts/                    # AI Assistant Context
│   ├── automation-context.md  # Current project context
│   ├── migration-guide.md     # E-gehaltszettel → DH migration
│   ├── test-patterns.md       # Reusable test patterns
│   └── dh-selectors.md        # DH platform selectors
│
├── cypress/
│   ├── e2e/
│   │   ├── DH/                # DocumentHub tests
│   │   │   ├── EG/           # E-Gehaltszettel (migrated)
│   │   │   │   ├── 01_Workspace/
│   │   │   │   ├── 02_AdminUser/
│   │   │   │   └── 03_Employees/
│   │   │   │       ├── DH_EG_03_Employees_TS_Notifications.js
│   │   │   │       ├── DH_EG_03_Employees_TS_Create_User.js
│   │   │   │       └── ...
│   │   │   └── shared/        # Shared DH tests
│   │   │
│   │   └── Legacy/            # Original tests (keep for reference)
│   │       └── E-gehaltszettel/
│   │
│   ├── support/
│   │   ├── commands.js        # Custom commands
│   │   ├── e2e.js            # Global config
│   │   └── page-objects/     # Page Object Models
│   │       ├── DH/
│   │       │   ├── LoginPage.js
│   │       │   ├── EmployeesPage.js
│   │       │   └── WorkspacePage.js
│   │       └── common/
│   │           └── YopmailPage.js
│   │
│   ├── fixtures/              # Test data
│   │   ├── users/
│   │   ├── documents/
│   │   └── config/
│   │
│   └── downloads/             # Downloaded files
│
├── docs/                      # Documentation
│   ├── MIGRATION.md          # Migration strategy
│   ├── TEST_CONVENTIONS.md   # Testing standards
│   └── TROUBLESHOOTING.md    # Common issues
│
├── scripts/                   # Utility scripts
│   ├── migrate-test.js       # Auto-migration helper
│   └── cleanup.js            # Test cleanup
│
├── .gitignore
├── cypress.config.js
├── package.json
└── README.md
```

---

## Step-by-Step: Using OpenCode with Your Project

### Step 1: Configure .vscode/settings.json

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.js": "javascript"
  },
  "prettier.singleQuote": true,
  "prettier.trailingComma": "all",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Step 2: Create .vscode/extensions.json

```json
{
  "recommendations": [
    "anthropic.claude-code",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "eamodio.gitlens",
    "shelex.vscode-cy-helper",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Step 3: AI Assistant Workflow

**Using OpenCode:**

1. Select code → `⌘ K` → Ask question
2. "Refactor this test to use DH login instead of SW login"
3. "Add bilingual EN/DE support to this selector"
4. "Extract this into a reusable helper function"

**Using Claude CLI:**

```bash
# In terminal
claude "How do I convert cy.loginToSW() to cy.loginToDH()?"
claude "Generate Page Object for DH Employees page"
```

**Best Practice:**

- Feed `prompts/automation-context.md` to AI assistants
- Keep migration patterns documented
- Use AI for repetitive refactoring

---

## Migration Strategy: E-gehaltszettel → DH

### What to Keep (DO NOT CHANGE):

✅ Tests using `cy.loginToSupportViewMaster()` (Master User)
✅ E-box specific tests
✅ Yopmail confirmation flows
✅ Test data and fixtures

### What to Change:

🔄 `cy.loginToSW()` → `cy.loginToDH()`
🔄 SW-specific selectors → DH selectors
🔄 `Cypress.env('sw_baseUrl')` → `Cypress.env('dh_baseUrl')`
🔄 Navigation paths (if different between SW/DH)

### Migration Checklist per Test Suite:

- [ ] Review all `it()` blocks
- [ ] Identify which tests are platform-specific
- [ ] Update login commands
- [ ] Update base URL references
- [ ] Verify selectors work in DH
- [ ] Update test data paths
- [ ] Run tests to verify
- [ ] Update documentation

---

## Quick Start Commands

### Terminal Setup:

```bash
# Install dependencies
npm install

# Run specific suite
npx cypress run --spec "cypress/e2e/DH/EG/**/*.js"

# Run with OpenCode assistance
# 1. Open test file
# 2. Press ⌘ K
# 3. Ask: "Help me migrate this test to DH"

# Use Claude CLI for migration help
claude "Show me the pattern to convert E-gehaltszettel test to DH test"
```

### Testing Flow:

1. **Before Migration**: Run original test to confirm it works
2. **During Migration**: Use AI assistant for refactoring
3. **After Migration**: Compare behavior, validate results
4. **Documentation**: Update test comments and docs

---

## Using OpenCode for Test Migration

### Example Workflow:

**Step 1:** Open E-gehaltszettel test file

**Step 2:** Select the `it()` block → Press `⌘ K`

**Step 3:** Ask OpenCode:

```
"Refactor this test to work with DocumentHub (DH) instead of E-gehaltszettel.
Keep:
- Master user login flows
- Yopmail confirmations
- E-box specific logic
Change:
- cy.loginToSW() → cy.loginToDH()
- sw_baseUrl → dh_baseUrl
- Update selectors for DH platform"
```

**Step 4:** Review and test the suggestion

**Step 5:** Document changes in migration log

---

## Tips for Efficient Migration

1. **Use AI Context Files**: Always reference `prompts/automation-context.md`
2. **Migrate in Batches**: Do one test suite at a time
3. **Keep Original**: Move to `Legacy/` folder, don't delete
4. **Verify Incrementally**: Run tests after each migration
5. **Document Patterns**: Add new patterns to context files
6. **Use Git**: Commit after each successful migration

---

## Next Steps

1. ✅ You have Claude CLI installed
2. ✅ You have OpenCode running
3. 📝 Create folder structure above
4. 📝 Update `prompts/automation-context.md` with migration strategy
5. 📝 Create `prompts/migration-guide.md` with specific examples
6. 🔄 Start migrating one test suite at a time
7. 📊 Track progress in a migration checklist

---

## Getting Help

### In VS Code:

- `⌘ K` in any file → Ask OpenCode
- `⌘ ⇧ P` → "Show All Commands"

### In Terminal:

- `claude "your question about the test migration"`

### Documentation:

- Read `prompts/automation-context.md` for project context
- Check `docs/MIGRATION.md` for migration examples

---

**Remember**: AI assistants are helpers, not replacements. Always review and test their suggestions!
