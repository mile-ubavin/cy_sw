/// <reference types="cypress" />

// =============================================================================
// Unit tests — Self-registration form validation logic
// Coverage: Pure functions from cypress/support/utils/self-reg-validation.js
//           No browser, no API, no DOM — pure input/output assertions.
//
// WHY unit tests here alongside E2E:
//   E2E verifies the UI shows a validation message.
//   Unit tests verify the validation LOGIC is correct for all edge cases.
//   Logic failures are caught in milliseconds — before E2E runs.
//
// How to run only these tests:
//   npx cypress run --spec "cypress/e2e/DH/EG/SelfRegistration/unit/self-reg-validation.spec.js"
// =============================================================================

import {
  isValidUid,
  isValidPassword,
  passwordsMatch,
  isValidCompanyName,
  isValidPostalCode,
  isNonEmpty,
  hasCaptchaSolution,
  isRegistrationFormValid,
  isValidEmail,
} from '../../../../../support/utils/self-reg-validation';

describe('Self-Registration Validation — Unit Tests [no browser required]', () => {

  // ---------------------------------------------------------------------------
  // UID validation  /^ATU\d{8}$/
  // ---------------------------------------------------------------------------
  context('isValidUid()', () => {
    it('accepts valid UID — ATU12345678 (8 digits)', () => {
      expect(isValidUid('ATU12345678')).to.be.true;
      expect(isValidUid('ATU00000000')).to.be.true;
      expect(isValidUid('ATU99999999')).to.be.true;
    });

    it('rejects UID with 7 digits — ATU1234567', () => {
      expect(isValidUid('ATU1234567')).to.be.false;
    });

    it('rejects UID with 5 digits — ATU12345', () => {
      expect(isValidUid('ATU12345')).to.be.false;
    });

    it('rejects UID with 9 digits — ATU123456789', () => {
      expect(isValidUid('ATU123456789')).to.be.false;
    });

    it('rejects UID with letters in digit positions — ATU12AB5678', () => {
      expect(isValidUid('ATU12AB5678')).to.be.false;
    });

    it('rejects UID with only ATU prefix, no digits', () => {
      expect(isValidUid('ATU')).to.be.false;
    });

    it('rejects lowercase prefix — atu12345678', () => {
      expect(isValidUid('atu12345678')).to.be.false;
    });

    it('rejects empty string', () => {
      expect(isValidUid('')).to.be.false;
    });

    it('rejects null and undefined', () => {
      expect(isValidUid(null)).to.be.false;
      expect(isValidUid(undefined)).to.be.false;
    });
  });

  // ---------------------------------------------------------------------------
  // Password validation — min 8 chars, upper, lower, digit, special char
  // ---------------------------------------------------------------------------
  context('isValidPassword()', () => {
    it('accepts strong password — Test1234!', () => {
      expect(isValidPassword('Test1234!')).to.be.true;
      expect(isValidPassword('Cypress@1234')).to.be.true;
      expect(isValidPassword('P@ssw0rd')).to.be.true;
    });

    it('rejects password shorter than 8 chars', () => {
      expect(isValidPassword('Te1!')).to.be.false;
    });

    it('rejects password without uppercase letter', () => {
      expect(isValidPassword('test1234!')).to.be.false;
    });

    it('rejects password without lowercase letter', () => {
      expect(isValidPassword('TEST1234!')).to.be.false;
    });

    it('rejects password without digit', () => {
      expect(isValidPassword('TestTest!')).to.be.false;
    });

    it('rejects password without special character', () => {
      expect(isValidPassword('Test12345')).to.be.false;
    });

    it('rejects empty string', () => {
      expect(isValidPassword('')).to.be.false;
    });

    it('rejects null and undefined', () => {
      expect(isValidPassword(null)).to.be.false;
      expect(isValidPassword(undefined)).to.be.false;
    });
  });

  // ---------------------------------------------------------------------------
  // Password match
  // ---------------------------------------------------------------------------
  context('passwordsMatch()', () => {
    it('returns true when both passwords are identical', () => {
      expect(passwordsMatch('Test1234!', 'Test1234!')).to.be.true;
    });

    it('returns false when passwords differ', () => {
      expect(passwordsMatch('Test1234!', 'Wrong@9999')).to.be.false;
    });

    it('returns false when either password is empty string', () => {
      expect(passwordsMatch('', '')).to.be.false;
      expect(passwordsMatch('Test1234!', '')).to.be.false;
    });

    it('returns false for null / undefined', () => {
      expect(passwordsMatch(null, 'Test1234!')).to.be.false;
      expect(passwordsMatch(undefined, undefined)).to.be.false;
    });
  });

  // ---------------------------------------------------------------------------
  // Company name validation — min 3 non-empty chars
  // ---------------------------------------------------------------------------
  context('isValidCompanyName()', () => {
    it('accepts company names with 3+ chars', () => {
      expect(isValidCompanyName('CY SelfReg Company')).to.be.true;
      expect(isValidCompanyName('ABC')).to.be.true;
    });

    it('rejects names shorter than 3 chars', () => {
      expect(isValidCompanyName('AB')).to.be.false;
      expect(isValidCompanyName('A')).to.be.false;
    });

    it('rejects whitespace-only strings', () => {
      expect(isValidCompanyName('   ')).to.be.false;
    });

    it('rejects empty string', () => {
      expect(isValidCompanyName('')).to.be.false;
    });

    it('rejects null and undefined', () => {
      expect(isValidCompanyName(null)).to.be.false;
      expect(isValidCompanyName(undefined)).to.be.false;
    });
  });

  // ---------------------------------------------------------------------------
  // Postal code validation — 4–10 digits
  // ---------------------------------------------------------------------------
  context('isValidPostalCode()', () => {
    it('accepts 4-digit Austrian postal code — 1060', () => {
      expect(isValidPostalCode('1060')).to.be.true;
      expect(isValidPostalCode('1000')).to.be.true;
      expect(isValidPostalCode('9999')).to.be.true;
    });

    it('accepts 5-digit German postal code — 80331', () => {
      expect(isValidPostalCode('80331')).to.be.true;
    });

    it('rejects postal code with fewer than 4 digits', () => {
      expect(isValidPostalCode('123')).to.be.false;
      expect(isValidPostalCode('10')).to.be.false;
    });

    it('rejects postal code with letters', () => {
      expect(isValidPostalCode('A1060')).to.be.false;
      expect(isValidPostalCode('10AB')).to.be.false;
    });

    it('rejects empty string', () => {
      expect(isValidPostalCode('')).to.be.false;
    });

    it('rejects null and undefined', () => {
      expect(isValidPostalCode(null)).to.be.false;
      expect(isValidPostalCode(undefined)).to.be.false;
    });
  });

  // ---------------------------------------------------------------------------
  // Non-empty validation (required text fields)
  // ---------------------------------------------------------------------------
  context('isNonEmpty()', () => {
    it('accepts non-empty strings', () => {
      expect(isNonEmpty('Max')).to.be.true;
      expect(isNonEmpty('Mariahilferstraße')).to.be.true;
    });

    it('rejects empty string', () => {
      expect(isNonEmpty('')).to.be.false;
    });

    it('rejects whitespace-only string', () => {
      expect(isNonEmpty('   ')).to.be.false;
    });

    it('rejects null and undefined', () => {
      expect(isNonEmpty(null)).to.be.false;
      expect(isNonEmpty(undefined)).to.be.false;
    });
  });

  // ---------------------------------------------------------------------------
  // FriendlyCaptcha solution check
  // ---------------------------------------------------------------------------
  context('hasCaptchaSolution()', () => {
    it('accepts a long non-sentinel string', () => {
      expect(hasCaptchaSolution('a'.repeat(21))).to.be.true;
      expect(hasCaptchaSolution('eyJhbGciOiJIUzI1NiJ9.solved.ABCDEFG')).to.be.true;
    });

    it('rejects .UNSTARTED sentinel', () => {
      expect(hasCaptchaSolution('.UNSTARTED')).to.be.false;
    });

    it('rejects .FETCHING sentinel', () => {
      expect(hasCaptchaSolution('.FETCHING')).to.be.false;
    });

    it('rejects .UNFINISHED sentinel', () => {
      expect(hasCaptchaSolution('.UNFINISHED')).to.be.false;
    });

    it('rejects .ERROR sentinel', () => {
      expect(hasCaptchaSolution('.ERROR')).to.be.false;
    });

    it('rejects .HEADLESS_ERROR sentinel', () => {
      expect(hasCaptchaSolution('.HEADLESS_ERROR')).to.be.false;
    });

    it('rejects empty string', () => {
      expect(hasCaptchaSolution('')).to.be.false;
    });

    it('rejects string ≤20 chars', () => {
      expect(hasCaptchaSolution('short')).to.be.false;
      expect(hasCaptchaSolution('12345678901234567890')).to.be.false;
    });

    it('rejects null and undefined', () => {
      expect(hasCaptchaSolution(null)).to.be.false;
      expect(hasCaptchaSolution(undefined)).to.be.false;
    });
  });

  // ---------------------------------------------------------------------------
  // Email validation (re-exported from user-validation.js)
  // ---------------------------------------------------------------------------
  context('isValidEmail() — self-reg specific usage', () => {
    it('accepts yopmail test addresses used in self-reg tests', () => {
      expect(isValidEmail('cy-self_register_001@yopmail.com')).to.be.true;
      expect(isValidEmail('cy-self_register_999@yopmail.com')).to.be.true;
    });

    it('rejects email without @', () => {
      expect(isValidEmail('invalidemail.com')).to.be.false;
    });

    it('rejects empty string', () => {
      expect(isValidEmail('')).to.be.false;
    });
  });

  // ---------------------------------------------------------------------------
  // Full form validation
  // ---------------------------------------------------------------------------
  context('isRegistrationFormValid()', () => {
    const validForm = {
      companyName:     'CY SelfReg Company',
      uid:             'ATU12345678',
      street:          'Mariahilferstraße',
      city:            'Vienna',
      postalCode:      '1060',
      firstName:       'Max',
      lastName:        'Mustermann',
      email:           'cy-self_register_001@yopmail.com',
      confirmEmail:    'cy-self_register_001@yopmail.com',
      password:        'Test1234!',
      confirmPassword: 'Test1234!',
    };

    it('returns true for a fully valid form', () => {
      expect(isRegistrationFormValid(validForm)).to.be.true;
    });

    it('returns false when UID is invalid', () => {
      expect(isRegistrationFormValid({ ...validForm, uid: 'ATU1234567' })).to.be.false;
    });

    it('returns false when emails do not match', () => {
      expect(isRegistrationFormValid({ ...validForm, confirmEmail: 'other@yopmail.com' })).to.be.false;
    });

    it('returns false when passwords do not match', () => {
      expect(isRegistrationFormValid({ ...validForm, confirmPassword: 'Wrong@9999' })).to.be.false;
    });

    it('returns false when password is too weak', () => {
      expect(isRegistrationFormValid({ ...validForm, password: 'weakpass', confirmPassword: 'weakpass' })).to.be.false;
    });

    it('returns false when company name is too short', () => {
      expect(isRegistrationFormValid({ ...validForm, companyName: 'AB' })).to.be.false;
    });

    it('returns false when postal code is invalid', () => {
      expect(isRegistrationFormValid({ ...validForm, postalCode: '123' })).to.be.false;
    });

    it('returns false when required text field is empty', () => {
      expect(isRegistrationFormValid({ ...validForm, firstName: '' })).to.be.false;
      expect(isRegistrationFormValid({ ...validForm, street: '' })).to.be.false;
    });
  });
});
