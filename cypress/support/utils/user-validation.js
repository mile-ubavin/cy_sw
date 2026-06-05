// Pure validation functions for EBox user form fields.
// These are tested in unit/user-validation.spec.js and used by form helpers.

export const isValidEmail = (email) =>
  typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const isValidPhone = (phone) =>
  typeof phone === 'string' && /^\+\d{1,3}\s?\d{6,15}$/.test(phone.trim());

// accountNumber must be a non-empty alphanumeric string, min 3 chars
export const isValidAccountNumber = (value) =>
  typeof value === 'string' && /^[a-zA-Z0-9_-]{3,}$/.test(value.trim());

export const isNonEmpty = (value) =>
  typeof value === 'string' && value.trim().length > 0;

// Phone number builder from env parts: '+43' + '64' + '706360' → '+43 64706360'
export const buildPhoneNumber = ({ countryCodePhoneNum, netNumberPhoneNum, subscriberNumberPhoneNum }) =>
  `${countryCodePhoneNum} ${netNumberPhoneNum}${subscriberNumberPhoneNum}`;
