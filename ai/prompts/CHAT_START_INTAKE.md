# Chat Start Intake (Mandatory)

Use this at the beginning of every new chat.

## Ask These Questions First

1. Which role should I use?

- ai/roles/senior-cypress-engineer.md
- ai/roles/senior-cypress-responsive.md
- ai/roles/frontend-developer.md

2. What is the task mode?

- Create new test
- Migrate existing test

3. What is the exact target suite?

- Example: DH_EG_04 Self Registration

4. Which files are in scope?

- Test files
- Selectors/page objects
- Fixtures
- docs/test-docs

5. Should QA documentation be created or updated in this run?

- Yes / No

## Routing Rules

- If mode is Create new test, load ai/prompts/creation/create-new-test.md
- If mode is Migrate existing test, load ai/prompts/migration/migrate-registration-test.md

## Output Format for Intake Confirmation

- Role: <selected role>
- Mode: <create or migrate>
- Target Suite: <suite>
- In-Scope Files: <files>
- Update Docs: <yes/no>

Do not start implementation before this intake is confirmed.
