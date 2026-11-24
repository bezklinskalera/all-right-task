import { Page } from '@playwright/test';

export class HeaderComponent {

    constructor(private page: Page) {}

    public get cartLink() {
        return this.page.getByTestId('shopping-cart-link');
    }

    public get cartBadge() {
        return this.page.getByTestId('shopping-cart-badge');
    }

    public get menuButton() {
        return this.page.getByRole('button', { name: 'Open Menu' });
    }

    public get logoutLink() {
        return this.page.getByTestId('logout-sidebar-link');
    }

    public async openCart() {
        await this.cartLink.click();
    }

    public async logout() {
        await this.menuButton.click();
        await this.logoutLink.click();
    }
}
