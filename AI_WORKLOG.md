# AI Worklog

How I used an AI coding agent on this task: the instructions it worked by, the prompts that shaped the result, and where it went wrong.

## Setup

- An AI coding agent working in the repository: reading the sites, writing code, running tests and git commands.
- I set the direction, the test ideas and the scope; the agent proposed implementations and executed them.
- Every step went through me: plan → my approval → code → test runs → my OK to commit → my OK to push → pull request → my review and merge.

## Agent instructions

The rules are in [`AGENTS.md`](AGENTS.md). Most of them were added during the work, after a mistake (see below). In short:

- plan first, act only after an explicit approval of the whole plan;
- no commit or push without my OK; only feature branches and pull requests, I merge;
- Conventional Commits;
- Page Object Model, locators only in page classes, test data in `test-data/`, no comments in code;
- no hardcoded values the site can change;
- known bugs are asserted as correct behaviour with `test.fail()`, and the failure reason is verified.

## Key prompts

| # | Prompt | What it changed |
|---|---|---|
| 1 | "Let's discuss the plan first." / "Stop — only the plan for now, I haven't approved it." | Plan-first workflow; the agent stopped acting on partial answers. |
| 2 | "We work with Page Object Model." | Structure of the whole UI suite. |
| 3 | "How do we know there are exactly 6 products? What if more are added?" | No hardcoded product count anywhere. |
| 4 | "Maybe just the first and the last product?" | Cart tests check the first and the last product of the catalog instead of fixed names. |
| 5 | Login cases: non-existing user, valid login + wrong password, wrong login + valid password, upper case, length limits. | 10 parametrized negative login cases. |
| 6 | "These are two different projects — separate them." / "API goes to the next PR." | `ui/` and `api/` folders, separate Playwright projects, CI jobs and PRs. |

## Where the agent was wrong

### 1. Vague and incomplete test cases
**What happened.** The first suite covered the happy paths and a few negative cases. Test cases were not precise and missed whole areas: login edge cases, checkout validation and navigation, product details in the cart. The agent also stated that the site has no lazy loading, spinner or slider — it had checked only the main catalog page and never opened the burger menu.

**How I noticed.** I went through the site myself and compared it with the test list; I pointed the agent to the Dynamic Catalog section in the menu.

**Fix.** I listed the cases to cover; 

### 2. Tests that will break in the future
**What happened.** The catalog and sorting tests expected exactly 6 products — a number the site can change at any time.

**How I noticed.** Code review: "How do we know there are exactly 6?"

**Fix.** The count is taken from the page, with a guard that the list is not empty. Cart tests pick the first and the last product of the catalog instead of a fixed list.

### 3. Weak tests that stay green on a broken site
**What happened.** On `problem_user` / `error_user` (users with intentional bugs) several tests still passed:
- the cart test used two products whose buttons happen to work;
- A→Z sorting was checked on a list that is already A→Z by default;
- product images were not checked at all;
- list checks read a one-off snapshot, so an empty list counted as "sorted".

**How I noticed.** I asked the agent to run the suite as the broken users, and insisted that the tests must fail there.

**Fix.** Images must be unique and loaded; cart tests use the first and the last product and remove them on the catalog page; A→Z first sorts Z→A; list checks are auto-retrying. Now these tests fail on the broken users.

