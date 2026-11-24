import { test, expect } from '@playwright/test';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { CUSTOMER, INVALID_CUSTOMER_CASES } from '../test-data/checkout-cases';

const BACKPACK = 'Sauce Labs Backpack';
const BOLT_TSHIRT = 'Sauce Labs Bolt T-Shirt';

test.describe('Checkout', () => {

    test.beforeEach(async ({ page }) => {
        const inventoryPage = new InventoryPage(page);

        await inventoryPage.goto();
        await inventoryPage.addToCart(BACKPACK, BOLT_TSHIRT);
        await inventoryPage.header.openCart();
        await new CartPage(page).checkout();
    });

    test('should complete an order with correct totals', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);

        await checkoutPage.fillCustomerInfo(CUSTOMER);

        await expect(checkoutPage.itemNames).toHaveText([BACKPACK, BOLT_TSHIRT]);

        const itemPrices = await checkoutPage.getItemPrices();
        const subtotal = await checkoutPage.getSubtotal();
        const tax = await checkoutPage.getTax();
        const total = await checkoutPage.getTotal();

        const expectedSubtotal = itemPrices.reduce((sum, price) => sum + price, 0);
        expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
        expect(total).toBeCloseTo(subtotal + tax, 2);

        await checkoutPage.finish();

        await expect(page).toHaveURL(/checkout-complete\.html/);
        await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
        await expect(checkoutPage.header.cartBadge).toBeHidden();
    });

    test('should charge 8% tax on the item total', async ({ page }) => {
        const TAX_RATE = 0.08;
        const checkoutPage = new CheckoutPage(page);

        await checkoutPage.fillCustomerInfo(CUSTOMER);

        const subtotal = await checkoutPage.getSubtotal();
        const tax = await checkoutPage.getTax();

        expect(tax).toBeCloseTo(Math.round(subtotal * TAX_RATE * 100) / 100, 2);
    });

    for (const { name, customer, error } of INVALID_CUSTOMER_CASES) {
        test(`should show an error for ${name}`, async ({ page }) => {
            const checkoutPage = new CheckoutPage(page);

            await checkoutPage.fillCustomerInfo(customer);

            await expect(checkoutPage.errorMessage).toHaveText(error);
            await expect(page).toHaveURL(/checkout-step-one\.html/);
        });
    }

    test('should close the error message', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);

        await checkoutPage.fillCustomerInfo({ ...CUSTOMER, firstName: '' });
        await expect(checkoutPage.errorMessage).toBeVisible();

        await checkoutPage.errorCloseButton.click();

        await expect(checkoutPage.errorMessage).toBeHidden();
    });

    test('should return to the cart on Cancel and keep the products', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);
        const cartPage = new CartPage(page);

        await checkoutPage.cancelButton.click();

        await expect(page).toHaveURL(/cart\.html/);
        await expect(cartPage.itemNames).toHaveText([BACKPACK, BOLT_TSHIRT]);
    });

    test('should return to the catalog on Cancel in overview and keep the cart', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);
        const inventoryPage = new InventoryPage(page);

        await checkoutPage.fillCustomerInfo(CUSTOMER);
        await checkoutPage.cancelButton.click();

        await expect(page).toHaveURL(/inventory\.html/);
        await expect(inventoryPage.header.cartBadge).toHaveText('2');
    });

    test('should return to the catalog with an empty cart after the order', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);
        const inventoryPage = new InventoryPage(page);

        await checkoutPage.fillCustomerInfo(CUSTOMER);
        await checkoutPage.finish();
        await checkoutPage.backHomeButton.click();

        await expect(page).toHaveURL(/inventory\.html/);
        await expect(inventoryPage.header.cartBadge).toBeHidden();
    });

    test('should not accept customer info made of spaces only', async ({ page }) => {
        test.fail(true, 'Bug: First Name, Last Name and Postal Code of only spaces pass validation');

        const checkoutPage = new CheckoutPage(page);

        await checkoutPage.fillCustomerInfo({ firstName: '   ', lastName: '   ', postalCode: '   ' });

        await expect(page).toHaveURL(/checkout-step-one\.html/);
        await expect(checkoutPage.errorMessage).toBeVisible();
    });
});

test.describe('Checkout with an empty cart', () => {

    test('should not start checkout with an empty cart', async ({ page }) => {
        test.fail(true, 'Bug: an empty cart goes through checkout and an order for $0.00 is completed');

        const inventoryPage = new InventoryPage(page);

        await inventoryPage.goto();
        await inventoryPage.header.openCart();
        await new CartPage(page).checkout();

        await expect(page).toHaveURL(/cart\.html/);
    });
});
