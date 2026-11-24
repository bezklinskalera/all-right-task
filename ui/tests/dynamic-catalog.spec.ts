import { test, expect } from '@playwright/test';
import { InventoryPage } from '../pages/inventory.page';
import { DynamicCatalogView } from '../pages/header.component';
import { LazyLoadPage } from '../pages/dynamic-catalog/lazy-load.page';
import { SpinnerPage } from '../pages/dynamic-catalog/spinner.page';
import { SliderPage } from '../pages/dynamic-catalog/slider.page';

const PRICE = /^\$\d+\.\d{2}$/;

test.describe('Dynamic Catalog: menu', () => {

    const views: { view: DynamicCatalogView; url: RegExp; container: (page: import('@playwright/test').Page) => import('@playwright/test').Locator }[] = [
        { view: 'lazy-load', url: /dynamic-catalog-lazy-load\.html/, container: page => new LazyLoadPage(page).container },
        { view: 'spinner', url: /dynamic-catalog-spinner\.html/, container: page => new SpinnerPage(page).container },
        { view: 'slider', url: /dynamic-catalog-slider\.html/, container: page => new SliderPage(page).container },
    ];

    for (const { view, url, container } of views) {
        test(`should open ${view} page from the menu`, async ({ page }) => {
            const inventoryPage = new InventoryPage(page);

            await inventoryPage.goto();
            await inventoryPage.header.openDynamicCatalog(view);

            await expect(page).toHaveURL(url);
            await expect(container(page)).toBeVisible();
        });
    }
});

test.describe('Dynamic Catalog: lazy load', () => {

    test.beforeEach(async ({ page }) => {
        await new LazyLoadPage(page).goto();
    });

    test('should show visible products with name, price and image', async ({ page }) => {
        const lazyLoadPage = new LazyLoadPage(page);

        await expect(lazyLoadPage.renderedCards.first()).toBeVisible();

        for (const card of await lazyLoadPage.renderedCards.all()) {
            await expect(lazyLoadPage.getNameIn(card)).toHaveText(/\S/);
            await expect(lazyLoadPage.getPriceIn(card)).toHaveText(PRICE);
            await expect(lazyLoadPage.getImageIn(card)).toBeVisible();
        }
    });

    test('should render product content when a card is scrolled into view', async ({ page }) => {
        const lazyLoadPage = new LazyLoadPage(page);

        await expect(lazyLoadPage.cards.first()).toBeVisible();
        const lastIndex = (await lazyLoadPage.cards.count()) - 1;

        await expect(lazyLoadPage.getCardPlaceholder(lastIndex)).toHaveText('Loading…');

        await lazyLoadPage.getCard(lastIndex).scrollIntoViewIfNeeded();

        await expect(lazyLoadPage.getCardPlaceholder(lastIndex)).toBeHidden();
        await expect(lazyLoadPage.getCardName(lastIndex)).toHaveText(/\S/);
    });

    test('should load more products when scrolled to the end', async ({ page }) => {
        const lazyLoadPage = new LazyLoadPage(page);

        await expect(lazyLoadPage.cards.first()).toBeVisible();
        const initialCount = await lazyLoadPage.cards.count();

        await lazyLoadPage.scrollToEnd();

        await expect.poll(() => lazyLoadPage.cards.count()).toBeGreaterThan(initialCount);
    });
});

test.describe('Dynamic Catalog: spinner', () => {

    test('should show a spinner and then the products', async ({ page }) => {
        const spinnerPage = new SpinnerPage(page);

        await spinnerPage.goto();

        await expect(spinnerPage.spinner).toBeVisible();
        await expect(spinnerPage.spinner).toHaveAttribute('role', 'status');

        await expect(spinnerPage.spinner).toBeHidden({ timeout: 10_000 });
        await expect(spinnerPage.grid).toBeVisible();

        const count = await spinnerPage.itemNames.count();
        expect(count).toBeGreaterThan(0);
        await expect(spinnerPage.itemNames).toHaveText(Array(count).fill(/\S/));
        await expect(spinnerPage.itemPrices).toHaveText(Array(count).fill(PRICE));
    });
});

test.describe('Dynamic Catalog: slider', () => {

    test.beforeEach(async ({ page }) => {
        await page.clock.install();
        await new SliderPage(page).goto();
    });

    test('should show the selected product when a dot is clicked', async ({ page }) => {
        const sliderPage = new SliderPage(page);
        const lastIndex = (await sliderPage.dots.count()) - 1;
        const expectedName = await sliderPage.getDotProductName(lastIndex);

        await sliderPage.getDot(lastIndex).click();

        await expect(sliderPage.itemName).toHaveText(expectedName);
        await expect(sliderPage.getDot(lastIndex)).toHaveAttribute('aria-current', 'true');
        await expect(sliderPage.getDot(0)).toHaveAttribute('aria-current', 'false');
    });

    test('should switch to the next product automatically', async ({ page }) => {
        const sliderPage = new SliderPage(page);

        await expect(sliderPage.getDot(0)).toHaveAttribute('aria-current', 'true');
        await expect(sliderPage.itemName).toHaveText(await sliderPage.getDotProductName(0));

        await page.clock.runFor(2_500);

        await expect(sliderPage.itemName).toHaveText(await sliderPage.getDotProductName(1));
        await expect(sliderPage.getDot(1)).toHaveAttribute('aria-current', 'true');
    });
});
