import { Page } from '@playwright/test';
import { HeaderComponent } from '../header.component';

export class LazyLoadPage {

    constructor(private page: Page) {}

    public get header() {
        return new HeaderComponent(this.page);
    }

    public get container() {
        return this.page.getByTestId('dynamic-catalog-lazy-load-container');
    }

    public get cards() {
        return this.container.locator(':scope > [data-test^="lazy-load-item-"]');
    }

    public get itemNames() {
        return this.container.locator('[data-test^="lazy-load-item-"][data-test$="-name"]');
    }

    public get itemPrices() {
        return this.container.locator('[data-test^="lazy-load-item-"][data-test$="-price"]');
    }

    public get itemImages() {
        return this.container.locator('[data-test^="lazy-load-item-"][data-test$="-img"]');
    }

    public get sentinel() {
        return this.page.getByTestId('dynamic-catalog-lazy-load-sentinel');
    }

    public getCard(index: number) {
        return this.page.getByTestId(`lazy-load-item-${index}`);
    }

    public getCardName(index: number) {
        return this.page.getByTestId(`lazy-load-item-${index}-name`);
    }

    public getCardPlaceholder(index: number) {
        return this.page.getByTestId(`lazy-load-item-${index}-placeholder`);
    }

    public async goto() {
        await this.page.goto('/dynamic-catalog-lazy-load.html');
    }

    public async scrollToEnd() {
        await this.sentinel.scrollIntoViewIfNeeded();
    }

    public async readNames(count: number): Promise<string[]> {
        const names: string[] = [];

        for (let index = 0; index < count; index++) {
            await this.getCard(index).scrollIntoViewIfNeeded();
            names.push(await this.getCardName(index).innerText());
        }

        return names;
    }
}
