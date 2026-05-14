# AI Prompts & Roles — Folder Structure

## Purpose

This folder contains all AI assistant context files, role definitions, prompt templates, and test documentation.
Load the relevant files before asking an AI to generate, migrate, or review tests.

---

## Folder Structure

```
ai/
├── context/                         # Core framework rules (load always)
│   ├── framework-context.md         # Stack, patterns, custom commands
│   └── migration-rules.md           # PRESERVE / REPLACE / NEVER DO rules
│
├── html/                            # FE HTML snapshots (for selector extraction)
│   └── dh-registration-page.html
│
├── prompts/                         # Task-specific AI prompt templates
│   ├── AI_WORKFLOW_GUIDE.md         # Step-by-step AI workflow
│   ├── CHAT_START_INTAKE.md         # Mandatory start-of-chat role + mode intake
│   ├── creation/
│   │   └── create-new-test.md       # Prompt for creating new test suites
│   └── migration/
│       └── migrate-registration-test.md   # ← MAIN PROMPT (start here)
│
└── roles/                           # Role definitions — load based on task
    ├── senior-cypress-engineer.md         # General Cypress / DH automation
    ├── senior-cypress-responsive.md       # Responsive + cross-browser testing
    └── frontend-developer.md              # HTML structure, data-testid, API contracts

docs/
└── test-docs/                       # Per-suite test documentation (IT-level)
    └── DH_EG_03_Create_EBox_User_Manually.md

prompts/                             # Human-readable context (legacy, keep for reference)
├── automation-context.md
├── migration-guide.md
└── SETUP_GUIDE.md
```

---

## Which Role to Load — Decision Guide

| Task                             | Role to Load                                       |
| -------------------------------- | -------------------------------------------------- |
| Write or migrate a Cypress test  | `ai/roles/senior-cypress-engineer.md`              |
| Test at different screen sizes   | `ai/roles/senior-cypress-responsive.md`            |
| Understand HTML selectors or API | `ai/roles/frontend-developer.md`                   |
| All test creation tasks          | Always also load `ai/context/framework-context.md` |

---

## Quick Start for AI Assistants

0. Run chat intake first (mandatory):
   - Ask user to choose role:
     - ai/roles/senior-cypress-engineer.md
     - ai/roles/senior-cypress-responsive.md
     - ai/roles/frontend-developer.md
   - Ask user to choose task mode:
     - Create new test
     - Migrate existing test
   - Ask for target IT/suite ID and target files.

1. Read `ai/context/framework-context.md` — understand the project stack
2. Read `ai/context/migration-rules.md` — know what to preserve vs. replace
3. Read the relevant role from `ai/roles/`
4. Load prompt by mode:
   - Create new test: `ai/prompts/creation/create-new-test.md`
   - Migrate existing test: `ai/prompts/migration/migrate-registration-test.md`
5. Read relevant test docs from `docs/test-docs/` if modifying an existing suite
6. Check `ai/html/` for FE HTML structure

---

## Mandatory Start-of-Chat Questions

Use this exact intake at the beginning of every new chat:

1. Which role should I use for this task?
2. Which mode do you want?
   - Create new test
   - Migrate existing test
3. What is the target suite ID and name (example: DH_EG_04 Self Registration)?
4. Which files are in scope for this task?
5. Should I produce or update QA documentation in docs/test-docs as part of this run?

---

## Test Documentation Template (per IT block)

Every `it` block in every test suite should be documented in `docs/test-docs/<suite>.md`.

Required sections per IT:

```markdown
### IT <N> — <Title>

**Purpose:** One sentence.
**Preconditions:** What must be true before this test runs.
**Login:** Which login method is used.

**Steps:**
| Step | Action | Expected Result |

**Environment Variables Used:**

- Cypress.env('...')

**API Intercepts:**

- METHOD pattern → asserted status

**Assertions:**

- List all cy assertions made
```

See [DH_EG_03 docs](docs/test-docs/DH_EG_03_Create_EBox_User_Manually.md) as the reference example.
