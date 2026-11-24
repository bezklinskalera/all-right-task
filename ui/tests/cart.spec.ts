import { test, expect } from '@playwright/test';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';

const BACKPACK = 'Sauce Labs Backpack';
const BIKE_LIGHT = 'Sauce Labs Bike Light';

test.describe('Cart', () => {

    test.beforeEach(async ({ page }) => {
        await new InventoryPage(page).goto();
    });

    test('should add the first and the last product to the cart', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        const cartPage = new CartPage(page);

        const names = await inventoryPage.getFirstAndLastNames();

        await inventoryPage.addToCart(...names);

        await expect(inventoryPage.header.cartBadge).toHaveText(String(names.length));

        await inventoryPage.header.openCart();
        await expect(cartPage.itemNames).toHaveText(names);
    });

    test('should remove the first and the last product on the catalog page', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);

        const names = await inventoryPage.getFirstAndLastNames();

        await inventoryPage.addToCart(...names);
        await expect(inventoryPage.header.cartBadge).toHaveText(String(names.length));

        await inventoryPage.removeFromCart(...names);

        await expect(inventoryPage.header.cartBadge).toBeHidden();
        for (const name of names) {
            await expect(inventoryPage.getAddToCartButtonByName(name)).toBeVisible();
        }
    });

    test('should remove a product on the cart page', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        const cartPage = new CartPage(page);

        await inventoryPage.addToCart(BACKPACK, BIKE_LIGHT);
        await inventoryPage.header.openCart();
        await expect(cartPage.itemNames).toHaveText([BACKPACK, BIKE_LIGHT]);

        await cartPage.removeItem(BACKPACK);

        await expect(cartPage.itemNames).toHaveText([BIKE_LIGHT]);
        await expect(cartPage.header.cartBadge).toHaveText('1');
    });
});
