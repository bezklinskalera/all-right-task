import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { PASSWORD, USERS } from '../test-data/users';

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

        await expect(loginPage.errorMessage).toHaveText(
            'Epic sadface: Sorry, this user has been locked out.',
        );
        await expect(page).not.toHaveURL(/inventory\.html/);
    });

    const invalidCredentials = [
        {
            name: 'wrong password',
            username: USERS.standard,
            password: 'wrong_password',
            error: 'Epic sadface: Username and password do not match any user in this service',
        },
        {
            name: 'empty username',
            username: '',
            password: PASSWORD,
            error: 'Epic sadface: Username is required',
        },
        {
            name: 'empty password',
            username: USERS.standard,
            password: '',
            error: 'Epic sadface: Password is required',
        },
    ];

    for (const { name, username, password, error } of invalidCredentials) {
        test(`should show an error for ${name}`, async ({ page }) => {
            const loginPage = new LoginPage(page);

            await loginPage.login(username, password);

            await expect(loginPage.errorMessage).toHaveText(error);
            await expect(page).not.toHaveURL(/inventory\.html/);
        });
    }
});
