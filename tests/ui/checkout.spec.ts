import { test, expect } from '@playwright/test';
import { InventoryPage } from '../../pages/inventory.page';
import { CartPage } from '../../pages/cart.page';
import { CheckoutPage, CustomerInfo } from '../../pages/checkout.page';

const BACKPACK = 'Sauce Labs Backpack';
const BOLT_TSHIRT = 'Sauce Labs Bolt T-Shirt';

const CUSTOMER: CustomerInfo = {
    firstName: 'Test',
    lastName: 'User',
    postalCode: '01001',
};

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

    test('should not continue checkout without postal code', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);

        await checkoutPage.fillCustomerInfo({ ...CUSTOMER, postalCode: '' });

        await expect(checkoutPage.errorMessage).toHaveText('Error: Postal Code is required');
        await expect(page).toHaveURL(/checkout-step-one\.html/);
    });
});
