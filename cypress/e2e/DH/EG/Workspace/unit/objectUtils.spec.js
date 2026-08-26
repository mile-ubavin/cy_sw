/// <reference types="cypress" />
import { collectValues } from '../../../../../support/utils/objectUtils';

describe('collectValues', () => {
  it('returns empty array for empty object', () => {
    expect(collectValues({})).to.deep.eq([]);
  });

  it('collects primitive values from a flat object', () => {
    const input = { name: 'Mile', age: 35, active: true };
    const result = collectValues(input);
    expect(result).to.have.members(['mile', '35', 'true']);
    expect(result).to.have.length(3);
  });

  it('lowercases all string values', () => {
    const input = { status: 'AKTIV', channel: 'Elektronisch' };
    expect(collectValues(input)).to.have.members(['aktiv', 'elektronisch']);
  });

  it('ignores null and undefined values', () => {
    const input = { a: 'x', b: null, c: undefined, d: 'y' };
    expect(collectValues(input)).to.have.members(['x', 'y']);
  });

  it('recurses into nested objects', () => {
    const input = {
      user: { name: 'Mile', meta: { role: 'admin' } },
      flag: 'on',
    };
    const result = collectValues(input);
    expect(result).to.have.members(['mile', 'admin', 'on']);
  });

  it('recurses into arrays', () => {
    const input = { tags: ['Aktiv', 'Elektronisch', 'Digital'] };
    expect(collectValues(input)).to.have.members(['aktiv', 'elektronisch', 'digital']);
  });

  it('handles nested arrays of objects (paginated API shape)', () => {
    const input = {
      content: [
        { status: 'Aktiv', deliveryType: 'Digital' },
        { status: 'Inaktiv', deliveryType: 'Postal' },
      ],
      totalElements: 2,
    };
    const result = collectValues(input);
    expect(result).to.include.members(['aktiv', 'digital', 'inaktiv', 'postal', '2']);
  });

  it('matches the value-scan pattern used by MassUpload counter', () => {
    // Same shape as the real API response for a single employee
    const employee = {
      personalNumber: 'ABBA0001',
      userName: 'cy-test',
      email: 'a@b.com',
      status: 'Aktiv',
      deliveryType: 'Elektronisch',
      nested: { extraStatus: 'NotApplicable' },
    };
    const values = collectValues(employee);
    const has = (...needles) =>
      values.some((v) => needles.some((n) => v === n || v.includes(n)));

    expect(has('aktiv', 'active')).to.be.true;
    expect(has('elektronisch', 'electronic', 'digital')).to.be.true;
    expect(has('druck', 'print', 'postal')).to.be.false;
  });

  it('preserves duplicate values', () => {
    const input = { a: 'x', b: 'x', c: { d: 'x' } };
    expect(collectValues(input)).to.deep.eq(['x', 'x', 'x']);
  });

  it('coerces numbers and booleans to strings', () => {
    const input = { count: 0, ratio: 3.14, isOn: false };
    expect(collectValues(input)).to.have.members(['0', '3.14', 'false']);
  });

  it('handles top-level array input', () => {
    const input = ['Aktiv', { status: 'Inaktiv' }, 42];
    expect(collectValues(input)).to.have.members(['aktiv', 'inaktiv', '42']);
  });

  it('handles deeply nested structures', () => {
    const input = { a: { b: { c: { d: { e: 'deep' } } } } };
    expect(collectValues(input)).to.deep.eq(['deep']);
  });

  it('returns empty array for null/undefined input', () => {
    expect(collectValues(null)).to.deep.eq([]);
    expect(collectValues(undefined)).to.deep.eq([]);
  });
});
