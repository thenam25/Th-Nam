/**
 * Shared price normalization and extraction utilities.
 * Used by both server (pptxEngine.ts) and client (clientPptxParser.ts).
 */

/**
 * Normalizes a raw price number to VNĐ.
 * Handles various shorthand formats used in Vietnamese price notation:
 * - Decimal numbers < 100 represent millions (e.g., 15.5 → 15,500,000)
 * - Integers < 100 represent thousands (e.g., 85 → 85,000)
 * - Numbers 100–999 represent thousands (e.g., 850 → 850,000)
 * - Numbers 1000–99999 represent thousands (e.g., 12500 → 12,500,000)
 */
export function normalizePriceNumber(val: number): number {
  if (!val || isNaN(val) || val <= 0) return 0;

  // Decimal numbers < 100 represent millions (e.g., 15.5 -> 15,500,000 VNĐ)
  if (val < 100) {
    if (val % 1 !== 0) {
      return Math.round(val * 1_000_000);
    }
    // Integer < 100 represents thousands (e.g. 85 -> 85,000 VNĐ)
    return Math.round(val * 1_000);
  }

  // Numbers between 100 and 999 represent thousands (e.g. 850 -> 850,000 VNĐ)
  if (val >= 100 && val < 1_000) {
    return Math.round(val * 1_000);
  }

  // Numbers between 1000 and 99999 represent thousands (e.g. 12500 -> 12,500,000 VNĐ)
  if (val >= 1_000 && val < 100_000) {
    return Math.round(val * 1_000);
  }

  return Math.round(val);
}

/**
 * Parses a price from a text segment, handling Vietnamese shorthand formats:
 * - "15.5 triệu", "15tr5", "15tr500"
 * - "850k", "850 ngàn"
 * - "850.000đ", "15.500.000 VNĐ"
 * - Standalone formatted numbers like "15.500.000"
 */
function parsePriceFromSegment(text: string, isAfterPricePrefix = false): number | null {
  if (!text) return null;

  // Clean noise: phone numbers, dimensions, RPMs, years, voltages
  const cleanText = text
    .replace(/(?:\+84|0)\s*\d{2,3}[\.\s\-]?\d{3,4}[\.\s\-]?\d{3,4}\b/g, '')
    .replace(/\b\d+\s*x\s*\d+(?:\s*x\s*\d+)?\b/gi, '')
    .replace(/\b\d+\s*(?:rpm|v|w|hp|kw|kg|mm|cm|m|l|lit)\b/gi, '')
    .replace(/\b20[12]\d\b/g, '');

  // 1. Compound million formats e.g. "15tr5", "15tr500", "15 triệu 500"
  const compoundMatch = cleanText.match(/([\d\.,]+)\s*(?:triệu|tr)\s*([\d]{1,3})\b/i);
  if (compoundMatch) {
    const mainVal = parseFloat(compoundMatch[1].replace(',', '.'));
    const subStr = compoundMatch[2];
    let subVal = parseInt(subStr, 10);
    if (subStr.length === 1) subVal *= 100_000;
    else if (subStr.length === 2) subVal *= 10_000;
    else if (subStr.length === 3) subVal *= 1_000;
    if (!isNaN(mainVal) && mainVal > 0 && mainVal < 10_000) {
      return Math.round(mainVal * 1_000_000) + subVal;
    }
  }

  // 2. Million formats e.g. "15.5 triệu", "15,5 triệu", "15tr", "15.5tr"
  const millionMatch = cleanText.match(/([\d\.,]+)\s*(?:triệu|tr)\b/i);
  if (millionMatch) {
    const rawVal = millionMatch[1].replace(/,/g, '.');
    const val = parseFloat(rawVal);
    if (!isNaN(val) && val > 0 && val < 10_000) {
      return Math.round(val * 1_000_000);
    }
  }

  // 3. Thousand formats e.g. "150k", "150 ngàn", "150k đ", "15.5k"
  const thousandMatch = cleanText.match(/([\d\.,]+)\s*(?:k|ngàn)\b/i);
  if (thousandMatch) {
    const rawVal = thousandMatch[1].replace(/,/g, '.');
    const val = parseFloat(rawVal);
    if (!isNaN(val) && val > 0 && val < 100_000) {
      return Math.round(val * 1_000);
    }
  }

  // 4. Currency symbols e.g. "850.000đ", "15.500.000 VNĐ", "15.000.000"
  const explicitPriceMatch =
    cleanText.match(/([\d\.,\s]{3,15})\s*(?:đ|vnd|vnđ)\b/i) ||
    cleanText.match(/(?:giá|sỉ|lẻ|bán)?\s*:?\s*([\d\.,\s]{3,15})\s*(?:đ|vnd|vnđ)?/i);

  if (explicitPriceMatch && explicitPriceMatch[1]) {
    const rawDigits = explicitPriceMatch[1].replace(/[\.,\s]/g, '');
    const num = parseInt(rawDigits, 10);
    if (!isNaN(num) && num > 0) {
      return normalizePriceNumber(num);
    }
  }

  // 5. Standalone formatted VNĐ number e.g. "15.500.000" or "15,500,000"
  const standaloneMatch = cleanText.match(/\b(\d{1,3}(?:[\.,]\d{3}){1,3})\b/);
  if (standaloneMatch) {
    const rawDigits = standaloneMatch[1].replace(/[\.,]/g, '');
    const num = parseInt(rawDigits, 10);
    if (!isNaN(num) && num >= 10_000) {
      return normalizePriceNumber(num);
    }
  }

  // 6. Segment after price prefix e.g. "Giá sỉ: 850" or "Sỉ: 12.5" or "Sỉ: 12500"
  if (isAfterPricePrefix) {
    const numMatch = cleanText.match(/\b([\d\.,]+)\b/);
    if (numMatch) {
      const rawStr = numMatch[1].replace(/,/g, '.');
      const val = parseFloat(rawStr);
      if (!isNaN(val) && val > 0) {
        return normalizePriceNumber(val);
      }
    }
  }

  return null;
}

/**
 * Extracts a price from free-form text.
 * Scans for explicit price markers ("giá:", "sỉ:", "lẻ:") first,
 * then falls back to scanning the entire text.
 */
export function smartExtractPrice(text: string): number | null {
  if (!text) return null;

  // 1. Line-by-line check for explicit price prefixes
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const giaMatch = line.match(/(?:(?:giá\s*(?:sỉ|lẻ|bán|bán\s*sỉ)?|sỉ|lẻ|bán\s*sỉ)\s*:?\s*)([^\r\n]+)/i);
    if (giaMatch && giaMatch[1]) {
      const priceFromGia = parsePriceFromSegment(giaMatch[1].trim(), true);
      if (priceFromGia !== null) {
        return priceFromGia;
      }
    }
  }

  // 2. Full text segment parsing
  return parsePriceFromSegment(text, false);
}

/**
 * Resolves an extracted price from multiple sources (AI output, raw text, fallback texts).
 * Applies normalization and returns the first valid price >= 1000 VNĐ.
 */
export function resolveExtractedPrice(
  rawPriceFromAI: unknown,
  priceTextFromAI?: string,
  extraTexts: (string | null | undefined)[] = []
): number | null {
  // Try AI-parsed numeric price
  if (typeof rawPriceFromAI === 'number' && rawPriceFromAI > 0) {
    const norm = normalizePriceNumber(rawPriceFromAI);
    if (norm >= 1_000) return norm;
  }

  // Try AI-parsed price string
  if (typeof rawPriceFromAI === 'string' && rawPriceFromAI.trim()) {
    const parsed = smartExtractPrice(rawPriceFromAI);
    if (parsed) {
      const norm = normalizePriceNumber(parsed);
      if (norm >= 1_000) return norm;
    }
  }

  // Try explicit price text from AI
  if (priceTextFromAI && priceTextFromAI.trim()) {
    const parsed = smartExtractPrice(priceTextFromAI);
    if (parsed) {
      const norm = normalizePriceNumber(parsed);
      if (norm >= 1_000) return norm;
    }
  }

  // Try each fallback text source
  for (const text of extraTexts) {
    if (!text) continue;
    const parsed = smartExtractPrice(text);
    if (parsed) {
      const norm = normalizePriceNumber(parsed);
      if (norm >= 1_000) return norm;
    }
  }

  return null;
}
