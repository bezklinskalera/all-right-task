import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { PASSWORD, USERS } from '../test-data/users';
import { INVALID_LOGIN_CASES, LOGIN_ERRORS } from '../test-data/login-cases';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {

    test.beforeEach(async ({ page }) => {
        await new LoginPage(page).goto();
    });

    test('should log in as standard_user and open the catalog', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const inventoryPage = new InventoryPage(page);

        await loginPage.login(USERS.standard, PASSWORD);

        await expect(page).toHaveURL(/inventory\.html/);
        await expect(inventoryPage.title).toHaveText('Products');
    });

    test('should log out and return to the login page', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const inventoryPage = new InventoryPage(page);

        await loginPage.login(USERS.standard, PASSWORD);
        await inventoryPage.header.logout();

        await expect(loginPage.loginButton).toBeVisible();

        await inventoryPage.goto();
        await expect(loginPage.errorMessage).toContainText(
            "You can only access '/inventory.html' when you are logged in",
        );
    });

    test('should not log in a locked out user', async ({ page }) => {
        const loginPage = new LoginPage(page);

        await loginPage.login(USERS.lockedOut, PASSWORD);

        await expect(loginPage.errorMessage).toHaveText(LOGIN_ERRORS.lockedOut);
        await expect(page).not.toHaveURL(/inventory\.html/);
    });

    for (const { name, username, password, error } of INVALID_LOGIN_CASES) {
        test(`should show an error for ${name}`, async ({ page }) => {
            const loginPage = new LoginPage(page);

            await loginPage.login(username, password);

            await expect(loginPage.errorMessage).toHaveText(error);
            await expect(page).not.toHaveURL(/inventory\.html/);
        });
    }
});
