import { test, expect } from '@playwright/test';
import { BookingClient } from '../clients/booking.client';
import { buildBooking, buildUpdatedBooking, getUnchangedFields } from '../test-data/booking';
import { ADMIN } from '../test-data/credentials';
import { CreatedBooking } from '../types/booking';

test.describe('Booking flow', () => {

    test('should create, update and delete a booking', async ({ request }) => {
        const client = new BookingClient(request);
        const booking = buildBooking();
        const updatedBooking = buildUpdatedBooking(booking);

        let token = '';
        let bookingId = 0;

        await test.step('auth: get a token', async () => {
            const response = await client.createToken(ADMIN);
            const body = await response.json();

            expect(response.status()).toBe(200);
            expect(body.token).toEqual(expect.any(String));
            token = body.token;
        });

        await test.step('create a booking', async () => {
            const response = await client.createBooking(booking);
            const body: CreatedBooking = await response.json();

            expect(response.status()).toBe(200);
            expect(body.bookingid).toEqual(expect.any(Number));
            expect(body.booking).toEqual(booking);
            bookingId = body.bookingid;
        });

        await test.step('get the created booking', async () => {
            const response = await client.getBooking(bookingId);

            expect(response.status()).toBe(200);
            expect(await response.json()).toEqual(booking);
        });

        await test.step('update the booking', async () => {
            expect(getUnchangedFields(booking, updatedBooking)).toEqual([]);

            const response = await client.updateBooking(bookingId, updatedBooking, token);

            expect(response.status()).toBe(200);
            expect(await response.json()).toEqual(updatedBooking);
        });

        await test.step('get the updated booking', async () => {
            const response = await client.getBooking(bookingId);

            expect(response.status()).toBe(200);
            expect(await response.json()).toEqual(updatedBooking);
        });

        await test.step('delete the booking', async () => {
            const response = await client.deleteBooking(bookingId, token);

            expect(response.status()).toBe(201);
        });

        await test.step('deleted booking is not found', async () => {
            const response = await client.getBooking(bookingId);

            expect(response.status()).toBe(404);
        });
    });
});
