import { Page } from '@playwright/test';
import { HeaderComponent } from '../header.component';

export class SliderPage {

    constructor(private page: Page) {}

    public get header() {
        return new HeaderComponent(this.page);
    }

    public get container() {
        return this.page.getByTestId('dynamic-catalog-slider-container');
    }

    public get itemName() {
        return this.page.getByTestId('dynamic-catalog-slider-item-name');
    }

    public get itemPrice() {
        return this.page.getByTestId('dynamic-catalog-slider-item-price');
    }

    public get dots() {
        return this.page.getByTestId('dynamic-catalog-slider-dots').getByRole('button');
    }

    public getDot(index: number) {
        return this.dots.nth(index);
    }

    public async getDotProductName(index: number): Promise<string> {
        const label = await this.getDot(index).getAttribute('aria-label');
        return (label ?? '').replace(/^Show /, '');
    }

    public async goto() {
        await this.page.goto('/dynamic-catalog-slider.html');
    }
}
