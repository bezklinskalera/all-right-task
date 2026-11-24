import { Page } from '@playwright/test';

export class LoginPage {

    constructor(private page: Page) {}

    public get usernameInput() {
        return this.page.getByTestId('username');
    }

    public get passwordInput() {
        return this.page.getByTestId('password');
    }

    public get loginButton() {
        return this.page.getByTestId('login-button');
    }

    public get errorMessage() {
        return this.page.getByTestId('error');
    }

    public async goto() {
        await this.page.goto('/');
    }

    public async login(username: string, password: string) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }
}
