import { PASSWORD, USERS } from './users';

export const LOGIN_ERRORS = {
    noMatch: 'Epic sadface: Username and password do not match any user in this service',
    usernameRequired: 'Epic sadface: Username is required',
    passwordRequired: 'Epic sadface: Password is required',
    lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
} as const;

export interface InvalidLoginCase {
    name: string;
    username: string;
    password: string;
    error: string;
}

export const INVALID_LOGIN_CASES: InvalidLoginCase[] = [
    { name: 'valid username and wrong password', username: USERS.standard, password: 'wrong_password', error: LOGIN_ERRORS.noMatch },
    { name: 'wrong username and valid password', username: 'standard_userx', password: PASSWORD, error: LOGIN_ERRORS.noMatch },
    { name: 'non-existing user', username: 'no_such_user', password: 'no_such_password', error: LOGIN_ERRORS.noMatch },
    { name: 'username in upper case', username: USERS.standard.toUpperCase(), password: PASSWORD, error: LOGIN_ERRORS.noMatch },
    { name: 'password in upper case', username: USERS.standard, password: PASSWORD.toUpperCase(), error: LOGIN_ERRORS.noMatch },
    { name: 'username with spaces around', username: ` ${USERS.standard} `, password: PASSWORD, error: LOGIN_ERRORS.noMatch },
    { name: '1-character username', username: 'a', password: PASSWORD, error: LOGIN_ERRORS.noMatch },
    { name: '1000-character username', username: 'a'.repeat(1000), password: PASSWORD, error: LOGIN_ERRORS.noMatch },
    { name: 'empty username', username: '', password: PASSWORD, error: LOGIN_ERRORS.usernameRequired },
    { name: 'empty password', username: USERS.standard, password: '', error: LOGIN_ERRORS.passwordRequired },
];
