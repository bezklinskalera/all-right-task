import { CustomerInfo } from '../pages/checkout.page';

export const CUSTOMER: CustomerInfo = {
    firstName: 'Test',
    lastName: 'User',
    postalCode: '01001',
};

export const CHECKOUT_ERRORS = {
    firstNameRequired: 'Error: First Name is required',
    lastNameRequired: 'Error: Last Name is required',
    postalCodeRequired: 'Error: Postal Code is required',
} as const;

export interface InvalidCustomerCase {
    name: string;
    customer: CustomerInfo;
    error: string;
}

export const INVALID_CUSTOMER_CASES: InvalidCustomerCase[] = [
    { name: 'empty first name', customer: { ...CUSTOMER, firstName: '' }, error: CHECKOUT_ERRORS.firstNameRequired },
    { name: 'empty last name', customer: { ...CUSTOMER, lastName: '' }, error: CHECKOUT_ERRORS.lastNameRequired },
    { name: 'empty postal code', customer: { ...CUSTOMER, postalCode: '' }, error: CHECKOUT_ERRORS.postalCodeRequired },
    { name: 'all fields empty', customer: { firstName: '', lastName: '', postalCode: '' }, error: CHECKOUT_ERRORS.firstNameRequired },
];
