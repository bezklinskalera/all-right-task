import { Page } from '@playwright/test';
import { HeaderComponent } from '../header.component';

const ITEM = '[data-test^="spinner-item-"]';

export class SpinnerPage {

    constructor(private page: Page) {}

    public get header() {
        return new HeaderComponent(this.page);
    }

    public get container() {
        return this.page.getByTestId('dynamic-catalog-spinner-container');
    }

    public get spinner() {
        return this.page.getByTestId('dynamic-catalog-spinner');
    }

    public get grid() {
        return this.page.getByTestId('dynamic-catalog-spinner-grid');
    }

    public get itemNames() {
        return this.page.locator(`${ITEM}[data-test$="-name"]`);
    }

    public get itemPrices() {
        return this.page.locator(`${ITEM}[data-test$="-price"]`);
    }

    public async goto() {
        await this.page.goto('/dynamic-catalog-spinner.html');
    }
}
