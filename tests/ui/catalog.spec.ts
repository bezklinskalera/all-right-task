import { test, expect } from '@playwright/test';
import { InventoryPage, SortOption } from '../../pages/inventory.page';
import { parsePrice } from '../../utils/price';

test.beforeEach(async ({ page }) => {
    await new InventoryPage(page).goto();
});

test.describe('Catalog', () => {

    test('should show every product with name, price and Add to cart button', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);

        await expect(inventoryPage.items.first()).toBeVisible();
        const count = await inventoryPage.items.count();

        await expect(inventoryPage.itemNames).toHaveText(Array(count).fill(/\S/));
        await expect(inventoryPage.itemPrices).toHaveText(Array(count).fill(/^\$\d+\.\d{2}$/));
        await expect(inventoryPage.addToCartButtons).toHaveCount(count);
    });

    test('should show a different image for every product', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);

        await expect(inventoryPage.itemImages.first()).toBeVisible();
        const sources = await inventoryPage.getImageSources();

        expect(sources).not.toContain(null);
        expect(new Set(sources).size).toBe(sources.length);
    });
});

test.describe('Sorting', () => {

    const sortCases: { option: SortOption; field: 'name' | 'price'; order: 'asc' | 'desc'; title: string }[] = [
        { option: 'az', field: 'name', order: 'asc', title: 'name (A to Z)' },
        { option: 'za', field: 'name', order: 'desc', title: 'name (Z to A)' },
        { option: 'lohi', field: 'price', order: 'asc', title: 'price (low to high)' },
        { option: 'hilo', field: 'price', order: 'desc', title: 'price (high to low)' },
    ];

    for (const { option, field, order, title } of sortCases) {
        test(`should sort products by ${title}`, async ({ page }) => {
            const inventoryPage = new InventoryPage(page);
            const column = field === 'name' ? inventoryPage.itemNames : inventoryPage.itemPrices;
            const direction = order === 'asc' ? 1 : -1;

            await expect(column.first()).toBeVisible();
            const expected = (await column.allTextContents()).sort((a, b) =>
                direction * (field === 'name' ? a.localeCompare(b) : parsePrice(a) - parsePrice(b)),
            );

            if (option === 'az') {
                await inventoryPage.sortBy('za');
                await expect(column).not.toHaveText(expected);
            }

            await inventoryPage.sortBy(option);

            await expect(inventoryPage.sortDropdown).toHaveValue(option);
            await expect(column).toHaveText(expected);
        });
    }
});
