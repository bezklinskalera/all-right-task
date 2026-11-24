import { Page } from '@playwright/test';
import { HeaderComponent } from './header.component';

export class CartPage {

    constructor(private page: Page) {}

    public get header() {
        return new HeaderComponent(this.page);
    }

    public get items() {
        return this.page.getByTestId('inventory-item');
    }

    public get itemNames() {
        return this.page.getByTestId('inventory-item-name');
    }

    public get checkoutButton() {
        return this.page.getByTestId('checkout');
    }

    public getRemoveButtonByName(name: string) {
        return this.items.filter({ hasText: name }).getByRole('button', { name: 'Remove' });
    }

    public async removeItem(name: string) {
        await this.getRemoveButtonByName(name).click();
    }

    public async checkout() {
        await this.checkoutButton.click();
    }
}
