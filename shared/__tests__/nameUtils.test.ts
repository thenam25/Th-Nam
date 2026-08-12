import { describe, it, expect } from 'vitest';
import {
  detectColorsInText,
  isValidProductName,
  cleanProductName,
  smartExtractModel,
  smartExtractBrand,
  smartExtractCategory,
} from '../nameUtils.js';

describe('detectColorsInText', () => {
  it('detects Vietnamese color words', () => {
    const colors = detectColorsInText('Máy cày Yanmar VÀNG');
    expect(colors.has('yellow')).toBe(true);
  });

  it('detects English color words', () => {
    const colors = detectColorsInText('Honda red generator');
    expect(colors.has('red')).toBe(true);
  });

  it('returns empty set for no colors', () => {
    const colors = detectColorsInText('Máy cày công suất 55HP');
    expect(colors.size).toBe(0);
  });

  it('handles empty input', () => {
    expect(detectColorsInText('').size).toBe(0);
  });
});

describe('isValidProductName', () => {
  it('accepts valid product names', () => {
    expect(isValidProductName('Máy cày John Deere 5055E')).toBe(true);
    expect(isValidProductName('Máy xới đất Honda FJ 500')).toBe(true);
  });

  it('rejects price-only strings', () => {
    expect(isValidProductName('15.500.000')).toBe(false);
    expect(isValidProductName('850k')).toBe(false);
  });

  it('rejects short strings', () => {
    expect(isValidProductName('AB')).toBe(false);
  });

  it('rejects empty input', () => {
    expect(isValidProductName('')).toBe(false);
  });

  it('rejects pure number strings', () => {
    expect(isValidProductName('12345')).toBe(false);
  });

  it('rejects price prefix strings', () => {
    expect(isValidProductName('Giá sỉ: 850')).toBe(false);
  });
});

describe('cleanProductName', () => {
  it('strips leading price prefixes', () => {
    expect(cleanProductName('Giá sỉ: Máy cày Yanmar')).toBe('Máy cày Yanmar');
    // "Sỉ:" is stripped, leaving "15.5 Máy cày" — the number "15.5" is not
    // a grouped-thousands format so the number-stripping regex skips it
    expect(cleanProductName('Sỉ: 15.5 Máy cày')).toBe('15.5 Máy cày');
  });

  it('strips embedded prices', () => {
    const cleaned = cleanProductName('Máy cày Yanmar 420.000.000đ');
    expect(cleaned).not.toContain('420');
  });

  it('trims whitespace and punctuation', () => {
    expect(cleanProductName('  Máy cày:  ')).toBe('Máy cày');
  });

  it('handles empty input', () => {
    expect(cleanProductName('')).toBe('');
  });
});

describe('smartExtractModel', () => {
  it('extracts uppercase alphanumeric model codes', () => {
    // "EF393T 39HP" matches [A-Z0-9]{2,10}[-\s]?[A-Z0-9]{2,10} as one token
    expect(smartExtractModel('Máy cày Yanmar EF393T 39HP')).toBe('EF393T 39HP');
    expect(smartExtractModel('Honda FJ500 máy xới')).toBe('FJ500');
  });

  it('returns N/A when no model found', () => {
    expect(smartExtractModel('Máy cày nông nghiệp')).toBe('N/A');
  });

  it('filters out price-like tokens', () => {
    const result = smartExtractModel('Giá 850 VND');
    expect(result).toBe('N/A');
  });
});

describe('smartExtractBrand', () => {
  const knownBrands = ['Yanmar', 'Kubota'];

  it('matches known brands from the list', () => {
    expect(smartExtractBrand('Máy cày Yanmar EF393T', knownBrands)).toBe('Yanmar');
    expect(smartExtractBrand('Máy gặt Kubota DC-70', knownBrands)).toBe('Kubota');
  });

  it('matches popular brands without a list', () => {
    expect(smartExtractBrand('Máy bơm Honda WB30XT', [])).toBe('Honda');
  });

  it('falls back to ALL-CAPS detection', () => {
    const result = smartExtractBrand('Máy cày DEWOO 2000', []);
    expect(result).toBe('Dewoo');
  });

  it('defaults to Nông Cơ when nothing matches', () => {
    expect(smartExtractBrand('Máy cày thông thường', [])).toBe('Nông Cơ');
  });
});

describe('smartExtractCategory', () => {
  it('detects categories by keyword', () => {
    expect(smartExtractCategory('Máy cày ruộng')).toBe('MÁY CÀY');
    expect(smartExtractCategory('Máy xới đất vườn')).toBe('MÁY XỚI ĐẤT');
    expect(smartExtractCategory('Máy gặt lúa')).toBe('MÁY GẶT ĐẬP');
    expect(smartExtractCategory('Máy bơm nước')).toBe('MÁY BƠM NƯỚC');
    expect(smartExtractCategory('Máy phát điện')).toBe('MÁY PHÁT ĐIỆN');
    expect(smartExtractCategory('Máy cắt cỏ')).toBe('MÁY CẮT CỎ');
  });

  it('defaults to MÁY NÔNG CƠ when no keyword matches', () => {
    expect(smartExtractCategory('Thiết bị khác')).toBe('MÁY NÔNG CƠ');
  });
});
