import { describe, expect, it } from 'vitest';
import { banglaDate, bn, bnNumber, daysSince, formatPhone, greeting, latin, money, telHref, waHref } from '@/lib/utils';
import { phoneField } from '@/lib/validation';
import { safeReturnTo } from '@/features/auth/api/auth.api';

describe('Bangla numerals', () => {
  it('converts both ways', () => {
    expect(bn(2026)).toBe('২০২৬');
    expect(latin('০১৭০০-০০০১২৩')).toBe('01700-000123');
  });
  it('groups in lakh style', () => {
    expect(bnNumber(1248)).toBe('১,২৪৮');
    expect(bnNumber(165000)).toBe('১,৬৫,০০০');
    expect(money(28500, 'মাস')).toBe('৳ ২৮,৫০০/মাস');
  });
});

describe('phone links', () => {
  it('builds tel and WhatsApp links from Bangla digits', () => {
    expect(telHref('০১৭০০-০০০১২৩')).toBe('tel:01700000123');
    expect(waHref('01700000123')).toBe('https://wa.me/8801700000123');
    expect(formatPhone('01700000123')).toBe('০১৭০০-০০০১২৩');
  });
});

describe('revised Bangladesh calendar', () => {
  it.each([
    [new Date(2026, 3, 14), '১ বৈশাখ ১৪৩৩'],
    [new Date(2026, 10, 13), '২৮ কার্তিক ১৪৩৩'],
    [new Date(2027, 1, 14), '১ ফাল্গুন ১৪৩৩'],
    [new Date(2027, 3, 13), '৩০ চৈত্র ১৪৩৩'],
  ])('%s → %s', (d, text) => expect(banglaDate(d).text).toBe(text));
});

describe('greeting and days', () => {
  it('follows the clock', () => {
    expect(greeting(7)).toBe('শুভ সকাল');
    expect(greeting(13)).toBe('শুভ দুপুর');
    expect(greeting(23)).toBe('শুভ রাত্রি');
  });
  it('counts whole days', () => {
    expect(daysSince('2026-07-12T00:00:00Z', new Date('2026-11-13T00:00:00Z'))).toBe(124);
  });
});

describe('form fields', () => {
  it('accepts Bangla-digit phones and normalises them', () => {
    expect(phoneField.parse('০১৭১২৩৪৫৬৭৮')).toBe('01712345678');
    expect(phoneField.safeParse('12345').success).toBe(false);
  });
});

describe('sign-in return path', () => {
  it('only returns to paths on this site', () => {
    expect(safeReturnTo('/jobs/new')).toBe('/jobs/new');
    expect(safeReturnTo('/to-let/new?step=2')).toBe('/to-let/new?step=2');
    expect(safeReturnTo('//evil.example')).toBe('/');
    expect(safeReturnTo('https://evil.example')).toBe('/');
  });
});
