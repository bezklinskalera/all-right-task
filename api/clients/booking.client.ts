import { APIRequestContext } from '@playwright/test';
import { Booking, Credentials } from '../types/booking';

export class BookingClient {

    constructor(private request: APIRequestContext) {}

    public async createToken(credentials: Credentials) {
        return this.request.post('/auth', { data: credentials });
    }

    public async getToken(credentials: Credentials): Promise<string> {
        const response = await this.createToken(credentials);
        const body = await response.json();

        if (!response.ok() || !body.token) {
            throw new Error(`Could not get token: ${response.status()} ${JSON.stringify(body)}`);
        }

        return body.token;
    }

    public async createBooking(booking: Booking) {
        return this.request.post('/booking', { data: booking });
    }

    public async getBooking(id: number) {
        return this.request.get(`/booking/${id}`);
    }

    public async updateBooking(id: number, booking: Booking, token?: string) {
        return this.request.put(`/booking/${id}`, {
            data: booking,
            headers: authHeader(token),
        });
    }

    public async deleteBooking(id: number, token?: string) {
        return this.request.delete(`/booking/${id}`, {
            headers: authHeader(token),
        });
    }
}

function authHeader(token?: string): Record<string, string> {
    return token ? { Cookie: `token=${token}` } : {};
}
