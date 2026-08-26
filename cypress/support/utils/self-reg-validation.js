// Pure validation functions for the DocuHub self-registration form.
// Tested in SelfRegistration/unit/self-reg-validation.spec.js

import { isValidEmail, isNonEmpty } from './user-validation';

export { isValidEmail, isNonEmpty };

// Austrian UID must be exactly ATU followed by 8 digits (11 chars total).
export const isValidUid = (uid) =>
  typeof uid === 'string' && /^ATU\d{8}$/.test(uid);

// Password must be ≥8 chars with uppercase, lowercase, digit, and special char.
export const isValidPassword = (pwd) =>
  typeof pwd === 'string' &&
  pwd.length >= 8 &&
  /[A-Z]/.test(pwd) &&
  /[a-z]/.test(pwd) &&
  /\d/.test(pwd) &&
  /[!@#$%^&*()\-_=+[\]{}|;:'",.<>?/\\`~]/.test(pwd);

export const passwordsMatch = (a, b) =>
  typeof a === 'string' && a.length > 0 && a === b;

export const isValidCompanyName = (name) =>
  typeof name === 'string' && name.trim().length >= 3;

// Postal code: 4–10 digits (covers AT 4-digit + DE 5-digit formats).
export const isValidPostalCode = (code) =>
  typeof code === 'string' && /^\d{4,10}$/.test(code.trim());

// FriendlyCaptcha: value is valid when non-empty string longer than 20 chars
// and not one of the known pending state sentinels.
const FRC_PENDING = ['.UNSTARTED', '.FETCHING', '.UNFINISHED', '.ERROR', '.HEADLESS_ERROR', ''];
export const hasCaptchaSolution = (val) =>
  typeof val === 'string' && val.length > 20 && !FRC_PENDING.includes(val);

export const isRegistrationFormValid = ({
  companyName, uid, street, city, postalCode,
  firstName, lastName, email, confirmEmail, password, confirmPassword,
}) =>
  isValidCompanyName(companyName) &&
  isValidUid(uid) &&
  isNonEmpty(street) &&
  isNonEmpty(city) &&
  isValidPostalCode(postalCode) &&
  isNonEmpty(firstName) &&
  isNonEmpty(lastName) &&
  isValidEmail(email) &&
  email === confirmEmail &&
  isValidPassword(password) &&
  passwordsMatch(password, confirmPassword);
