import { test, expect } from '@playwright/test';
import { BookingClient } from '../clients/booking.client';
import { buildBooking } from '../test-data/booking';
import { ADMIN } from '../test-data/credentials';
import { Booking, CreatedBooking } from '../types/booking';

test.describe('Auth: negative', () => {

    test('should reject wrong credentials with 401', async ({ request }) => {
        test.fail(true, 'Bug: API answers 200 with {"reason":"Bad credentials"} instead of 401');

        const client = new BookingClient(request);
        const response = await client.createToken({ ...ADMIN, password: 'wrong_password' });
        const body = await response.json();

        expect(body.token).toBeUndefined();
        expect(response.status()).toBe(401);
    });
});

test.describe('Booking: negative', () => {
    let client: BookingClient;
    let booking: Booking;
    let bookingId: number;

    test.beforeEach(async ({ request }) => {
        client = new BookingClient(request);
        booking = buildBooking();

        const response = await client.createBooking(booking);

        expect(response.status()).toBe(200);
        bookingId = ((await response.json()) as CreatedBooking).bookingid;
    });

    test.afterEach(async () => {
        const token = await client.getToken(ADMIN);
        await client.deleteBooking(bookingId, token);
    });

    test('should not update a booking without a token', async () => {
        const response = await client.updateBooking(bookingId, buildBooking({ lastname: 'Hacked' }));

        expect(response.status()).toBe(403);

        const current = await client.getBooking(bookingId);

        expect(await current.json()).toEqual(booking);
    });

    test('should not delete a booking with an invalid token', async () => {
        const response = await client.deleteBooking(bookingId, 'invalid_token');

        expect(response.status()).toBe(403);

        const current = await client.getBooking(bookingId);

        expect(current.status()).toBe(200);
    });
});

test.describe('Booking: not found', () => {

    test('should return 404 for a non-existing booking', async ({ request }) => {
        const client = new BookingClient(request);

        const response = await client.getBooking(999_999_999);

        expect(response.status()).toBe(404);
    });
});
