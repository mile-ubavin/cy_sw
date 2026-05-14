# AI Prompt: Create New Cypress Test — DocumentHub Platform

> Active role must be selected first via ai/prompts/CHAT_START_INTAKE.md.

## Purpose

Use this prompt when the user chooses: Create new test.

## Input Required

- Feature name and suite ID (example: DH_EG_05)
- Business flow and expected outcomes
- Existing suite to mirror for coding style (if any)
- HTML/screenshots/selectors source
- Environment and test data constraints

## Required Output

1. Test Suite File

- Path: cypress/e2e/DH/EG/DH*EG*<NN>\_<FeatureName>\_TS.js

2. Optional Selectors

- Path: cypress/support/selectors/<feature>.selectors.js

3. Optional Page Object

- Path: cypress/support/pages/<Feature>Page.js

4. Fixture Data (if needed)

- Path: cypress/fixtures/<feature>-data.json

5. QA Test Documentation

- Path: docs/test-docs/QA*AUTOMATION_TESTSPEC_DH_EG*<NN>\_<FEATURE_NAME>\_v1.md

## Quality Rules

- Keep business logic explicit and readable.
- Prefer stable selectors: name, aria-label, id.
- Use Cypress.env for URLs and credentials.
- Add intercepts before actions that trigger network calls.
- Avoid fixed waits without reason.
- Cover happy path plus negative/edge cases.

## Minimum Test Coverage

1. Page load and critical UI checks
2. Field validation checks
3. Primary business rule checks
4. Happy path submit and API assertion
5. At least one resilience or edge test

## Completion Checklist

- No it.only committed
- No hardcoded production URL
- Unique test data strategy present
- Assertions are meaningful and deterministic
- QA documentation is updated
