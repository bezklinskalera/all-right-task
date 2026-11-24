import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { PASSWORD, USERS } from '../test-data/users';
import { UI_AUTH_FILE } from '../utils/auth';

setup('authenticate as standard_user', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(USERS.standard, PASSWORD);

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');

    await page.context().storageState({ path: UI_AUTH_FILE });
});
