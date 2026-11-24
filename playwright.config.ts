import { defineConfig, devices } from '@playwright/test';
import { UI_AUTH_FILE } from './utils/auth';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  /* Fail the build on CI if test.only was left in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only. */
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    /* saucedemo marks elements with data-test="..." — lets us use getByTestId(). */
    testIdAttribute: 'data-test',
  },

  /* ui-chromium goes first so Playwright UI mode selects it by default;
     setup still runs before it via `dependencies`. */
  projects: [
    {
      name: 'ui-chromium',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://www.saucedemo.com',
        storageState: UI_AUTH_FILE,
      },
      dependencies: ['setup'],
    },
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: { baseURL: 'https://www.saucedemo.com' },
    },
  ],
});
