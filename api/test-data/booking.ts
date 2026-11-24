import { Booking } from '../types/booking';

export function buildBooking(overrides: Partial<Booking> = {}): Booking {
    const uniqueId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;

    return {
        firstname: `Test${uniqueId}`,
        lastname: 'Autotest',
        totalprice: 150,
        depositpaid: true,
        bookingdates: {
            checkin: '2027-01-10',
            checkout: '2027-01-15',
        },
        additionalneeds: 'Breakfast',
        ...overrides,
    };
}
