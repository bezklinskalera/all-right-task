import { defineConfig, devices } from '@playwright/test';
import { UI_AUTH_FILE } from './ui/utils/auth';

const SAUCEDEMO_URL = 'https://www.saucedemo.com';

export default defineConfig({
  fullyParallel: true,
  /* Fail the build on CI if test.only was left in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only. */
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    trace: 'on-first-retry',
  },

  /* ui-chromium goes first so Playwright UI mode selects it by default;
     ui-setup still runs before it via `dependencies`. */
  projects: [
    /* ---------- UI: saucedemo ---------- */
    {
      name: 'ui-chromium',
      testDir: './ui/tests',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: SAUCEDEMO_URL,
        storageState: UI_AUTH_FILE,
        screenshot: 'only-on-failure',
        /* saucedemo marks elements with data-test="..." — lets us use getByTestId(). */
        testIdAttribute: 'data-test',
      },
      dependencies: ['ui-setup'],
    },
    {
      name: 'ui-setup',
      testDir: './ui/tests',
      testMatch: /.*\.setup\.ts/,
      use: {
        baseURL: SAUCEDEMO_URL,
        testIdAttribute: 'data-test',
      },
    },
  ],
});
