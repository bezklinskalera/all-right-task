# Agent instructions

Rules for the AI coding agent working in this repository.

## Workflow
- Discuss the plan first. Start working only after an explicit approval of the whole plan — a "yes" to one detail is not an approval.
- If I ask a question ("is this a good idea?"), answer it. Do not start changing code.
- Never commit, push or force-push without my explicit OK. Ask separately before each of them.
- Never push to `main`. Every change goes through a feature branch and a pull request; I review and merge it myself.
- Keep pull requests small and focused: one topic per PR.
- Before every commit: `npx tsc --noEmit -p .` and `npm test` must pass. Run new tests several times (`--repeat-each=3`) to catch flaky ones.

## Commits and pull requests
- Conventional Commits in English: `test(ui): ...`, `test(api): ...`, `ci: ...`, `docs: ...`, `refactor: ...`, `fix: ...`.

## Code
- Playwright + TypeScript, strict mode, no `any`.
- UI: Page Object Model. Locators live only in page classes (`ui/pages`), exposed as getters; use `getByTestId` (`data-test`). Shared header is `HeaderComponent`.
- API: requests go through `BookingClient` (`api/clients`); tests do not know URLs or headers.
- Test data lives in `ui/test-data` / `api/test-data`; parametrized cases are tables, not copy-pasted tests.

## Writing tests
- Every test case must be precise: clear precondition, action and expected result.
- No hardcoded values that the site can change (number of products, list length). Derive them from the page and guard against an empty list.
- A test must fail when the feature is broken. 
- No `waitForTimeout`. Use auto-retrying assertions.
- Known bugs: assert the correct behaviour and mark the test with `test.fail(true, 'Bug: ...')`. Check that the test fails because of the bug, not for another reason.
- API tests create their own data with unique names and delete it afterwards (shared public API).
