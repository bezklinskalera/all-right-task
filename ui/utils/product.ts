import { Locator } from '@playwright/test';

export interface ProductDetails {
    id: string;
    name: string;
    description: string;
    price: string;
}

export async function readProductDetails(card: Locator): Promise<ProductDetails> {
    const titleLinkTestId = await card.locator('[data-test$="-title-link"]').getAttribute('data-test');
    const id = titleLinkTestId?.match(/^item-(\d+)-title-link$/)?.[1];

    if (!id) {
        throw new Error(`Product id not found, title link data-test: ${titleLinkTestId}`);
    }

    return {
        id,
        name: await card.getByTestId('inventory-item-name').innerText(),
        description: await card.getByTestId('inventory-item-desc').innerText(),
        price: await card.getByTestId('inventory-item-price').innerText(),
    };
}
