import { Page } from '@playwright/test';
import { HeaderComponent } from './header.component';
import { parsePrice } from '../utils/price';

export interface CustomerInfo {
    firstName: string;
    lastName: string;
    postalCode: string;
}

export class CheckoutPage {

    constructor(private page: Page) {}

    public get header() {
        return new HeaderComponent(this.page);
    }

    // Step one: customer information

    public get firstNameInput() {
        return this.page.getByTestId('firstName');
    }

    public get lastNameInput() {
        return this.page.getByTestId('lastName');
    }

    public get postalCodeInput() {
        return this.page.getByTestId('postalCode');
    }

    public get continueButton() {
        return this.page.getByTestId('continue');
    }

    public get errorMessage() {
        return this.page.getByTestId('error');
    }

    // Step two: overview

    public get itemNames() {
        return this.page.getByTestId('inventory-item-name');
    }

    public get itemPrices() {
        return this.page.getByTestId('inventory-item-price');
    }

    public get subtotalLabel() {
        return this.page.getByTestId('subtotal-label');
    }

    public get taxLabel() {
        return this.page.getByTestId('tax-label');
    }

    public get totalLabel() {
        return this.page.getByTestId('total-label');
    }

    public get finishButton() {
        return this.page.getByTestId('finish');
    }

    // Complete

    public get completeHeader() {
        return this.page.getByTestId('complete-header');
    }

    public async fillCustomerInfo({ firstName, lastName, postalCode }: CustomerInfo) {
        await this.firstNameInput.fill(firstName);
        await this.lastNameInput.fill(lastName);
        await this.postalCodeInput.fill(postalCode);
        await this.continueButton.click();
    }

    public async getItemPrices(): Promise<number[]> {
        const prices = await this.itemPrices.allTextContents();
        return prices.map(parsePrice);
    }

    public async getSubtotal(): Promise<number> {
        return parsePrice(await this.subtotalLabel.innerText());
    }

    public async getTax(): Promise<number> {
        return parsePrice(await this.taxLabel.innerText());
    }

    public async getTotal(): Promise<number> {
        return parsePrice(await this.totalLabel.innerText());
    }

    public async finish() {
        await this.finishButton.click();
    }
}
