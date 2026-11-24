import { Page } from '@playwright/test';
import { HeaderComponent } from './header.component';
import { ProductDetails, readProductDetails } from '../utils/product';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage {

    constructor(private page: Page) {}

    public get header() {
        return new HeaderComponent(this.page);
    }

    public get title() {
        return this.page.getByTestId('title');
    }

    public get items() {
        return this.page.getByTestId('inventory-item');
    }

    public get itemNames() {
        return this.page.getByTestId('inventory-item-name');
    }

    public get itemPrices() {
        return this.page.getByTestId('inventory-item-price');
    }

    public get itemImages() {
        return this.items.locator('img');
    }

    public get addToCartButtons() {
        return this.items.getByRole('button', { name: 'Add to cart' });
    }

    public get sortDropdown() {
        return this.page.getByTestId('product-sort-container');
    }

    public getItemByName(name: string) {
        return this.items.filter({ hasText: name });
    }

    public async getProductDetails(name: string): Promise<ProductDetails> {
        return readProductDetails(this.getItemByName(name));
    }

    public getAddToCartButtonByName(name: string) {
        return this.getItemByName(name).getByRole('button', { name: 'Add to cart' });
    }

    public getRemoveButtonByName(name: string) {
        return this.getItemByName(name).getByRole('button', { name: 'Remove' });
    }

    public async goto() {
        await this.page.goto('/inventory.html');
    }

    public async sortBy(option: SortOption) {
        await this.sortDropdown.selectOption(option);
    }

    public async getFirstAndLastNames(): Promise<string[]> {
        await this.itemNames.first().waitFor();
        const names = await this.itemNames.allTextContents();
        return [...new Set([names[0], names[names.length - 1]])];
    }

    public async getImageSources(): Promise<(string | null)[]> {
        return this.itemImages.evaluateAll(images => images.map(image => image.getAttribute('src')));
    }

    public async getNotLoadedImages(): Promise<(string | null)[]> {
        return this.itemImages.evaluateAll(images =>
            (images as HTMLImageElement[])
                .filter(image => !image.complete || image.naturalWidth === 0)
                .map(image => image.getAttribute('src')),
        );
    }

    public async addToCart(...names: string[]) {
        for (const name of names) {
            await this.getAddToCartButtonByName(name).click();
        }
    }

    public async removeFromCart(...names: string[]) {
        for (const name of names) {
            await this.getRemoveButtonByName(name).click();
        }
    }
}
