# all-right-task

[![Playwright Tests](https://github.com/bezklinskalera/all-right-task/actions/workflows/build-and-push.yml/badge.svg)](https://github.com/bezklinskalera/all-right-task/actions/workflows/build-and-push.yml)

Automated tests with **Playwright + TypeScript**:

- **UI** — [saucedemo.com](https://www.saucedemo.com) (`standard_user`), Page Object Model
- **API** — [restful-booker](https://restful-booker.herokuapp.com/apidoc), Playwright `request`, no browser

## How to run

Requirements: Node.js 20+.

```bash
npm ci
npx playwright install chromium
```

| Command | What it does |
|---|---|
| `npm test` | all tests (UI + API) |
| `npm run test:saucedemo` | UI tests only |
| `npm run test:api` | API tests only |
| `npm run test:headed` | UI tests with a visible browser |
| `npm run test:ui` | Playwright UI mode (tick the `ui-chromium` and `api` projects) |
| `npm run report` | open the last HTML report |

### CI

GitHub Actions (`.github/workflows/build-and-push.yml`) runs on every push, in two parallel jobs:

- **Playwright UI tests** → artifact `playwright-report-ui`
- **API tests (restful-booker)** → artifact `playwright-report-api`

Reports are uploaded even when tests fail and kept for 30 days. On CI, failed tests are retried twice.

## Project structure

```
ui/
  pages/            Page Objects + HeaderComponent, pages/dynamic-catalog/
  tests/            auth.setup, login, catalog, cart, checkout, dynamic-catalog
  test-data/        users, login-cases, checkout-cases
  utils/            price, product, auth
api/
  clients/          BookingClient
  tests/            booking-flow, booking-negative
  test-data/        booking builder, credentials
  types/            Booking, CreatedBooking, Credentials
```

Login runs once in the `ui-setup` project; the session is reused via `storageState`. Every test gets a fresh browser context.

## What is covered

**UI — 44 tests**

| Area | Tests |
|---|---|
| Login (13) | valid login, logout (catalog not reachable after it), locked out user; 10 negative cases: valid username + wrong password, wrong username + valid password, non-existing user, username / password in upper case, username with spaces around, 1-character and 1000-character username, empty username, empty password |
| Catalog (3) | every product has name, price and Add to cart button; every product has its own image; every image is loaded |
| Sorting (4) | name A→Z, Z→A, price low→high, high→low |
| Cart (3) | add the first and the last product — same id, name, description and price as in the catalog, quantity 1; remove them on the catalog page; remove a product on the cart page |
| Checkout (12) | full order with correct totals; tax is 8% of the item total; validation: empty first name, last name, postal code, all fields empty; error can be closed; Cancel on step one → cart kept; Cancel on overview → catalog, cart kept; Back Home after the order → empty cart; known bugs: fields of spaces only, checkout with an empty cart |
| Dynamic Catalog (9) | menu opens Lazy Load, Spinner and Slider; Lazy Load: visible products have name, price, image, a "Loading…" placeholder renders when scrolled into view, more cards load at the end of the list; Spinner: spinner is shown, then products; Slider: a dot shows its product, autoplay moves to the next one (fake timers) |

**API — 5 tests**

| Area | Tests |
|---|---|
| Flow (1) | auth → create → get → update (PUT) → get → delete → get returns 404, each stage is a `test.step` |
| Negative (4) | wrong password must return 401 (known bug); PUT without a token → 403, booking unchanged; DELETE with an invalid token → 403, booking still exists; GET of a non-existing id → 404 |

Known bugs are tested as the **correct** behaviour and marked with `test.fail()`: they are expected to fail while the bug exists, and Playwright reports them if the bug gets fixed.

Tests were also checked against saucedemo's broken users (`problem_user`, `error_user`): sorting, images, cart and checkout tests fail there as they should.

## What is not covered (on purpose)

- **Other browsers and mobile** — Chromium only; the task is about functionality, not cross-browser rendering.
- **Visual, performance and accessibility testing** — out of scope for this task.
- **Product details page, About link, Reset App State, footer links.**
- **API: PATCH, `GET /booking` filters, XML / form-encoded payloads, Basic auth, `/ping`** — the task asks for the auth → create → update → delete flow and a few negative cases.
- **Dynamic Catalog → Slider: details beyond switching** — covered: a dot click shows its product and becomes active, autoplay moves to the next product. Not covered: that the slide's name, price and image match the catalog; that there is one dot per product; that autoplay wraps from the last product back to the first; pause, hover and keyboard behaviour (no requirements, see Observations). The slide has no link or button, so there is nothing to click on the card itself.
- **Login field length validation (min / max characters)** — there are no known requirements for the minimum and maximum length of the username and password, and the fields have no `maxlength` / `minlength`. Boundary values cannot be tested without them; the tests only check that a 1-character and a 1000-character username get the usual "do not match" error.

## Bugs found

### BUG-1. Checkout accepts customer info made of spaces only
- **Severity:** Medium
- **Priority:** Medium
- **Preconditions:**
  1. https://www.saucedemo.com is open, the user is logged in as `standard_user`.
  2. Sauce Labs Backpack is added to the cart (the cart icon shows `1`).
- **Steps:**
  1. Open the cart, click **Checkout**.
  2. Enter three spaces into First Name, Last Name and Zip/Postal Code.
  3. Click **Continue**.
- **Expected:** validation error, the user stays on the form.
- **Actual:** no error, the user goes to Checkout: Overview (`/checkout-step-two.html`).
- **Test:** `checkout.spec.ts` › should not accept customer info made of spaces only

### BUG-2. An order can be placed with an empty cart
- **Severity:** High
- **Priority:** High
- **Preconditions:**
  1. https://www.saucedemo.com is open, the user is logged in as `standard_user`.
  2. The cart is empty (the cart icon shows no counter).
- **Steps:**
  1. Open the cart, click **Checkout**.
  2. Fill in First Name, Last Name, Postal Code, click **Continue**.
  3. Click **Finish**.
- **Expected:** Checkout is not available for an empty cart (disabled button or a message).
- **Actual:** the overview shows no items and `Total: $0.00`; **Finish** shows "Thank you for your order!".
- **Test:** `checkout.spec.ts` › should not start checkout with an empty cart

### BUG-3. Lazy Load lists the same product twice
- **Severity:** Low
- **Priority:** Low
- **Preconditions:**
  1. https://www.saucedemo.com is open, the user is logged in as `standard_user`.
  2. The user is on the Products page.
- **Steps:**
  1. Open the menu → **Dynamic Catalog** → **Lazy Load**.
  2. Scroll down until about 18 cards are loaded.
  3. Compare product names.
- **Expected:** every product variant is listed once.
- **Actual:** "Test.allTheThings() T-Shirt (Red) (L)" is listed twice in a row (the 14th and 15th cards). Further down the list repeats the same 22 cards endlessly.
- **Test:** found manually, not automated.

### BUG-4. Wrong credentials return 200 instead of 401
- **Severity:** Medium
- **Priority:** Medium
- **Preconditions:**
  1. API base URL: https://restful-booker.herokuapp.com.
  2. Request header `Content-Type: application/json`.
- **Steps:**
  1. Send `POST /auth` with `{"username": "admin", "password": "wrong_password"}`.
- **Expected:** `401 Unauthorized`.
- **Actual:** `200 OK` with body `{"reason": "Bad credentials"}`. An empty body `{}` gives the same.
- **Test:** `booking-negative.spec.ts` › should reject wrong credentials with 401

### Intentional bugs of saucedemo test users
Not bug reports — these users are broken on purpose. Listed because the tests were checked against them.

| User | Bug | Caught by |
|---|---|---|
| `problem_user` | all products show the same image | catalog: different image for every product |
| `problem_user`, `error_user` | sorting does not work | sorting tests |
| `problem_user`, `error_user` | Add to cart does not work for Bolt T-Shirt, Fleece Jacket, Red T-Shirt | cart: add the first and the last product |
| `problem_user`, `error_user` | Remove on the catalog page does not work for Backpack, Bike Light, Onesie | cart: remove on the catalog page |
| `problem_user` | Last Name field cannot be filled | checkout tests |
| `error_user` | Finish does not complete the order | checkout: full order |

### Observations (not bugs without requirements)
- Zip/Postal Code accepts letters and symbols (`abc!@#`).
- `/checkout-step-two.html` can be opened directly, without customer info.
- The slider has no pause control, does not stop on hover and does not react to the keyboard.
- restful-booker: `GET /ping` returns `201 Created`; `DELETE /booking/:id` returns `201 Created` (documented, but `200`/`204` is usual for a delete).

## More

- [`AI_WORKLOG.md`](AI_WORKLOG.md) — how the AI agent was used, key prompts, where it was wrong
- [`AGENTS.md`](AGENTS.md) — instructions for the AI agent
