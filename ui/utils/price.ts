/** "$29.99" or "Item total: $39.98" -> 29.99 / 39.98 */
export function parsePrice(text: string): number {
    return Number(text.replace(/[^0-9.]/g, ''));
}
