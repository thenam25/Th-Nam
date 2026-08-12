import { describe, it, expect } from 'vitest';
import {
  normalizePriceNumber,
  smartExtractPrice,
  resolveExtractedPrice,
} from '../priceUtils.js';

describe('normalizePriceNumber', () => {
  it('treats decimal < 100 as millions', () => {
    expect(normalizePriceNumber(15.5)).toBe(15_500_000);
    expect(normalizePriceNumber(3.2)).toBe(3_200_000);
  });

  it('treats integer < 100 as thousands', () => {
    expect(normalizePriceNumber(85)).toBe(85_000);
    expect(normalizePriceNumber(12)).toBe(12_000);
    expect(normalizePriceNumber(1)).toBe(1_000);
  });

  it('treats 100-999 as thousands', () => {
    expect(normalizePriceNumber(850)).toBe(850_000);
    expect(normalizePriceNumber(150)).toBe(150_000);
    expect(normalizePriceNumber(999)).toBe(999_000);
  });

  it('treats 1000-99999 as thousands (→ millions)', () => {
    expect(normalizePriceNumber(12_500)).toBe(12_500_000);
    expect(normalizePriceNumber(50_000)).toBe(50_000_000);
  });

  it('returns 0 for invalid inputs', () => {
    expect(normalizePriceNumber(0)).toBe(0);
    expect(normalizePriceNumber(NaN)).toBe(0);
    expect(normalizePriceNumber(-500)).toBe(0);
  });

  it('passes through already-large numbers', () => {
    // >= 100,000 passes through unchanged (already in VNĐ)
    expect(normalizePriceNumber(15_500_000)).toBe(15_500_000);
    expect(normalizePriceNumber(150_000)).toBe(150_000);
  });
});

describe('smartExtractPrice', () => {
  it('extracts price with "giá:" prefix', () => {
    const price = smartExtractPrice('Giá: 15.500.000đ');
    expect(price).toBe(15_500_000);
  });

  it('extracts price with "giá sỉ:" prefix', () => {
    const price = smartExtractPrice('Giá sỉ: 850.000đ');
    expect(price).toBe(850_000);
  });

  it('extracts price with "sỉ:" prefix', () => {
    const price = smartExtractPrice('Sỉ: 12.500.000');
    expect(price).toBe(12_500_000);
  });

  it('extracts "triệu" shorthand', () => {
    const price = smartExtractPrice('Giá: 15 triệu');
    expect(price).toBe(15_000_000);
  });

  it('extracts "tr" shorthand', () => {
    const price = smartExtractPrice('Giá: 15tr5');
    expect(price).toBe(15_500_000);
  });

  it('extracts "k" shorthand', () => {
    const price = smartExtractPrice('Giá: 850k');
    expect(price).toBe(850_000);
  });

  it('extracts "ngàn" shorthand', () => {
    const price = smartExtractPrice('Giá: 150 ngàn');
    expect(price).toBe(150_000);
  });

  it('extracts VNĐ formatted number anywhere in text', () => {
    const price = smartExtractPrice('Máy cày Yanmar 420.000.000đ');
    expect(price).toBe(420_000_000);
  });

  it('returns null for text without price', () => {
    expect(smartExtractPrice('Máy cày nông nghiệp')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(smartExtractPrice('')).toBeNull();
  });
});

describe('resolveExtractedPrice', () => {
  it('uses raw AI numeric price directly', () => {
    expect(resolveExtractedPrice(15_500_000)).toBe(15_500_000);
  });

  it('normalizes small AI numbers', () => {
    const result = resolveExtractedPrice(850);
    expect(result).toBe(850_000);
  });

  it('parses AI price string', () => {
    expect(resolveExtractedPrice('15.500.000đ')).toBe(15_500_000);
  });

  it('falls back to priceTextFromAI', () => {
    expect(resolveExtractedPrice(undefined, 'Giá sỉ: 12 triệu')).toBe(12_000_000);
  });

  it('falls back to extraTexts', () => {
    expect(resolveExtractedPrice(undefined, undefined, ['Giá: 850k'])).toBe(850_000);
  });

  it('returns first valid price from multiple extraTexts', () => {
    expect(
      resolveExtractedPrice(undefined, undefined, ['Không có giá', 'Giá: 20 triệu', 'Giá: 15 triệu'])
    ).toBe(20_000_000);
  });

  it('returns null when no price found anywhere', () => {
    expect(resolveExtractedPrice(undefined, undefined, ['Máy cày', 'Nông nghiệp'])).toBeNull();
  });

  it('normalizes small numbers up to thousands', () => {
    // 500 as raw AI number → normalizePriceNumber(500): 500 < 100, integer → 500*1000 = 500,000
    // 500,000 >= 1,000 → returns 500,000
    expect(resolveExtractedPrice(500)).toBe(500_000);
  });

  it('returns null for zero price', () => {
    expect(resolveExtractedPrice(0)).toBeNull();
  });
});
