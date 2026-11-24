import { Locator, Page } from '@playwright/test';
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

    public get renderedCards() {
        return this.cards.filter({ hasNot: this.page.locator('[data-test$="-placeholder"]') });
    }

    public getNameIn(card: Locator) {
        return card.locator('[data-test$="-name"]');
    }

    public getPriceIn(card: Locator) {
        return card.locator('[data-test$="-price"]');
    }

    public getImageIn(card: Locator) {
        return card.locator('[data-test$="-img"]');
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
