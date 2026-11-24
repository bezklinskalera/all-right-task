import { Booking } from '../types/booking';

export function daysFromToday(days: number): string {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
}

function uniqueId(): string {
    return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export function buildBooking(overrides: Partial<Booking> = {}): Booking {
    return {
        firstname: `Test${uniqueId()}`,
        lastname: 'Autotest',
        totalprice: 150,
        depositpaid: true,
        bookingdates: {
            checkin: daysFromToday(30),
            checkout: daysFromToday(35),
        },
        additionalneeds: 'Breakfast',
        ...overrides,
    };
}

export function getUnchangedFields(original: Booking, updated: Booking): string[] {
    const { bookingdates: originalDates, ...originalFields } = original;
    const { bookingdates: updatedDates, ...updatedFields } = updated;
    const before: Record<string, unknown> = { ...originalFields, ...originalDates };
    const after: Record<string, unknown> = { ...updatedFields, ...updatedDates };

    return Object.keys(before).filter(field => before[field] === after[field]);
}

export function buildUpdatedBooking(original: Booking): Booking {
    return {
        firstname: `Updated${uniqueId()}`,
        lastname: `${original.lastname}Updated`,
        totalprice: original.totalprice + 100,
        depositpaid: !original.depositpaid,
        bookingdates: {
            checkin: daysFromToday(60),
            checkout: daysFromToday(67),
        },
        additionalneeds: `${original.additionalneeds ?? ''} and late checkout`.trim(),
    };
}
