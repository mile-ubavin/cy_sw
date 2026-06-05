/// <reference types="cypress" />

// =============================================================================
// Unit tests — User form validation logic
// Coverage: Pure functions from cypress/support/utils/user-validation.js
//           No browser, no API, no DOM — pure input/output assertions.
//
// WHY unit tests here alongside E2E:
//   The E2E test verifies the UI shows a validation message.
//   The unit test verifies the validation LOGIC is correct for all edge cases.
//   If the logic breaks, unit tests catch it in milliseconds — before E2E runs.
//
// How to run only these tests:
//   npx cypress run --spec "cypress/e2e/DH/EG/Employees/unit/user-validation.spec.js"
// =============================================================================

import {
  isValidEmail,
  isValidPhone,
  isValidAccountNumber,
  isNonEmpty,
  buildPhoneNumber,
} from '../../../../../support/utils/user-validation';

describe('User Validation — Unit Tests [no browser required]', () => {

  // ---------------------------------------------------------------------------
  // Email validation
  // ---------------------------------------------------------------------------
  context('isValidEmail()', () => {
    it('accepts standard email format', () => {
      expect(isValidEmail('user@yopmail.com')).to.be.true;
      expect(isValidEmail('manual.addres-data@yopmail.com')).to.be.true;
      expect(isValidEmail('max-mustermann@yopmail.com')).to.be.true;
    });

    it('rejects email without @', () => {
      expect(isValidEmail('invalidemail.com')).to.be.false;
    });

    it('rejects email without domain', () => {
      expect(isValidEmail('user@')).to.be.false;
    });

    it('rejects email without local part', () => {
      expect(isValidEmail('@domain.com')).to.be.false;
    });

    it('rejects empty string', () => {
      expect(isValidEmail('')).to.be.false;
    });

    it('rejects null and undefined', () => {
      expect(isValidEmail(null)).to.be.false;
      expect(isValidEmail(undefined)).to.be.false;
    });

    it('rejects email with spaces', () => {
      expect(isValidEmail('user @yopmail.com')).to.be.false;
    });
  });

  // ---------------------------------------------------------------------------
  // Phone validation
  // ---------------------------------------------------------------------------
  context('isValidPhone()', () => {
    it('accepts phone with country code and 10+ digits', () => {
      expect(isValidPhone('+43 1234567890')).to.be.true;
      expect(isValidPhone('+43 64706360')).to.be.true;
      expect(isValidPhone('+49123456789')).to.be.true;
    });

    it('rejects phone without country code (+)', () => {
      expect(isValidPhone('0664123456')).to.be.false;
      expect(isValidPhone('1234567890')).to.be.false;
    });

    it('rejects phone that is too short', () => {
      expect(isValidPhone('+43 123')).to.be.false;
    });

    it('rejects empty string', () => {
      expect(isValidPhone('')).to.be.false;
    });

    it('rejects null and undefined', () => {
      expect(isValidPhone(null)).to.be.false;
      expect(isValidPhone(undefined)).to.be.false;
    });

    it('rejects plain text', () => {
      expect(isValidPhone('invalid_phone_number')).to.be.false;
    });
  });

  // ---------------------------------------------------------------------------
  // Account number validation
  // ---------------------------------------------------------------------------
  context('isValidAccountNumber()', () => {
    it('accepts alphanumeric values min 3 chars', () => {
      expect(isValidAccountNumber('manualAddress')).to.be.true;
      expect(isValidAccountNumber('manualNoAddress')).to.be.true;
      expect(isValidAccountNumber('ABC')).to.be.true;
      expect(isValidAccountNumber('user_123')).to.be.true;
    });

    it('rejects strings shorter than 3 characters', () => {
      expect(isValidAccountNumber('ab')).to.be.false;
      expect(isValidAccountNumber('a')).to.be.false;
    });

    it('rejects empty string', () => {
      expect(isValidAccountNumber('')).to.be.false;
    });

    it('rejects null and undefined', () => {
      expect(isValidAccountNumber(null)).to.be.false;
      expect(isValidAccountNumber(undefined)).to.be.false;
    });

    it('rejects strings with special characters (space, @)', () => {
      expect(isValidAccountNumber('user name')).to.be.false;
      expect(isValidAccountNumber('user@123')).to.be.false;
    });
  });

  // ---------------------------------------------------------------------------
  // Non-empty validation (required fields)
  // ---------------------------------------------------------------------------
  context('isNonEmpty()', () => {
    it('accepts non-empty strings', () => {
      expect(isNonEmpty('Manual')).to.be.true;
      expect(isNonEmpty('No Address Data - Title')).to.be.true;
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
  // Phone number builder from env parts
  // ---------------------------------------------------------------------------
  context('buildPhoneNumber()', () => {
    it('builds correct phone from createUser env parts', () => {
      const result = buildPhoneNumber({
        countryCodePhoneNum: '+43',
        netNumberPhoneNum: '64',
        subscriberNumberPhoneNum: '707777',
      });
      expect(result).to.eq('+43 64707777');
    });

    it('builds correct phone from createUserNoAddress env parts', () => {
      const result = buildPhoneNumber({
        countryCodePhoneNum: '+43',
        netNumberPhoneNum: '64',
        subscriberNumberPhoneNum: '706360',
      });
      expect(result).to.eq('+43 64706360');
    });

    it('built phone passes isValidPhone check', () => {
      const phone = buildPhoneNumber({
        countryCodePhoneNum: '+43',
        netNumberPhoneNum: '64',
        subscriberNumberPhoneNum: '706360',
      });
      expect(isValidPhone(phone)).to.be.true;
    });
  });
});
