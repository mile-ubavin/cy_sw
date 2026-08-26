/// <reference types="cypress" />
import { parseGermanDateTime } from '../../../../../support/utils/dateUtils';

describe('parseGermanDateTime', () => {
  it('parses a standard German datetime string', () => {
    const result = parseGermanDateTime('10.06.2026 14:35');
    expect(result.getFullYear()).to.eq(2026);
    expect(result.getMonth()).to.eq(5); // 0-based
    expect(result.getDate()).to.eq(10);
    expect(result.getHours()).to.eq(14);
    expect(result.getMinutes()).to.eq(35);
  });

  it('parses midnight correctly', () => {
    const result = parseGermanDateTime('01.01.2025 00:00');
    expect(result.getHours()).to.eq(0);
    expect(result.getMinutes()).to.eq(0);
  });

  it('parses end-of-day correctly', () => {
    const result = parseGermanDateTime('31.12.2025 23:59');
    expect(result.getFullYear()).to.eq(2025);
    expect(result.getMonth()).to.eq(11);
    expect(result.getDate()).to.eq(31);
    expect(result.getHours()).to.eq(23);
    expect(result.getMinutes()).to.eq(59);
  });

  it('two identical datetimes have zero diff', () => {
    const a = parseGermanDateTime('15.03.2026 09:00');
    const b = parseGermanDateTime('15.03.2026 09:00');
    expect(Math.abs(b - a)).to.eq(0);
  });

  it('difference between two datetimes is calculated correctly', () => {
    const upload = parseGermanDateTime('10.06.2026 14:35');
    const delivery = parseGermanDateTime('10.06.2026 14:36');
    const diffMin = Math.abs(delivery - upload) / (1000 * 60);
    expect(diffMin).to.eq(1);
  });

  it('parses month boundary (last day of month → first of next)', () => {
    const a = parseGermanDateTime('31.01.2026 23:59');
    const b = parseGermanDateTime('01.02.2026 00:00');
    expect(b.getMonth()).to.eq(1);
    expect(b.getDate()).to.eq(1);
    expect((b - a) / (1000 * 60)).to.eq(1);
  });

  it('parses year boundary (Silvester → Neujahr)', () => {
    const oldYear = parseGermanDateTime('31.12.2025 23:59');
    const newYear = parseGermanDateTime('01.01.2026 00:00');
    expect(newYear.getFullYear()).to.eq(2026);
    expect(newYear.getMonth()).to.eq(0);
    expect(newYear.getDate()).to.eq(1);
    expect((newYear - oldYear) / (1000 * 60)).to.eq(1);
  });

  it('parses leap day (29.02.2024)', () => {
    const result = parseGermanDateTime('29.02.2024 12:00');
    expect(result.getFullYear()).to.eq(2024);
    expect(result.getMonth()).to.eq(1);
    expect(result.getDate()).to.eq(29);
  });

  it('date-only comparison matches when timestamps differ within same day', () => {
    // Matches the `datesMatch` logic used in MassUpload / Dictionary_305 e-Box tests
    const upload = parseGermanDateTime('10.06.2026 09:00');
    const delivery = parseGermanDateTime('10.06.2026 23:45');
    const sameDay =
      upload.getDate() === delivery.getDate() &&
      upload.getMonth() === delivery.getMonth() &&
      upload.getFullYear() === delivery.getFullYear();
    expect(sameDay).to.be.true;
  });

  it('date-only comparison fails when day differs', () => {
    const upload = parseGermanDateTime('10.06.2026 23:59');
    const delivery = parseGermanDateTime('11.06.2026 00:01');
    const sameDay =
      upload.getDate() === delivery.getDate() &&
      upload.getMonth() === delivery.getMonth() &&
      upload.getFullYear() === delivery.getFullYear();
    expect(sameDay).to.be.false;
  });

  it('round-trip date: returned Date object is mutable Date instance', () => {
    const result = parseGermanDateTime('10.06.2026 14:35');
    expect(result).to.be.instanceOf(Date);
    expect(result.getTime()).to.be.a('number');
    expect(Number.isNaN(result.getTime())).to.be.false;
  });
});
