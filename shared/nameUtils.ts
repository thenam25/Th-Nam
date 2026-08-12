/**
 * Shared product name/brand/model extraction utilities.
 * Used by both server (pptxEngine.ts) and client (clientPptxParser.ts).
 */

export function detectColorsInText(text: string): Set<string> {
  const colors = new Set<string>();
  if (!text) return colors;
  const lower = text.toLowerCase();

  if (/\b(vàng|yellow|chanh)\b/i.test(lower)) colors.add('yellow');
  if (/\b(xanh|blue|green|dương|lá|cốm|ngọc)\b/i.test(lower)) colors.add('blue');
  if (/\b(đỏ|red|hồng|pink)\b/i.test(lower)) colors.add('red');
  if (/\b(cam|orange)\b/i.test(lower)) colors.add('orange');
  if (/\b(trắng|white|bạc|silver)\b/i.test(lower)) colors.add('white');
  if (/\b(đen|black|xám|grey|gray)\b/i.test(lower)) colors.add('black');
  if (/\b(tím|purple)\b/i.test(lower)) colors.add('purple');
  if (/\b(nâu|brown)\b/i.test(lower)) colors.add('brown');

  return colors;
}

export function isValidProductName(name: string): boolean {
  if (!name) return false;
  const trimmed = name.trim();
  if (trimmed.length < 3) return false;

  const lower = trimmed.toLowerCase();
  const pureText = lower
    .replace(/^(?:giá\s*(?:sỉ|lẻ|bán|bán\s*sỉ)?|sỉ|lẻ|bán\s*sỉ)\s*:?\s*/gi, '')
    .trim();

  if (pureText.length < 3) return false;
  if (/^[\d\.,\s]+(?:đ|vnd|vnđ|k|tr|triệu|ngàn|vn)?$/i.test(pureText)) return false;
  if (/^(vnđ|vnd|000\s*vn|000\s*vnđ|000|giá|giá\s*sỉ|giá\s*lẻ|giá\s*bán|sỉ|lẻ|bán\s*sỉ|sỉ\s*:|lẻ\s*:|đồ|cái|bình|bộ|đ|trang\s*\d+|slide\s*\d+|phần\s*\d+|hình\s*\d+)$/i.test(pureText)) return false;
  if (!/[a-zàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/i.test(pureText)) return false;

  return true;
}

export function isValidBrand(brand: string): boolean {
  if (!brand) return false;
  const trimmed = brand.trim();
  if (trimmed.length < 2) return false;
  if (/^(000|000\s*vn|vnđ|vnd|giá|giá\s*sỉ|sỉ|n\/a|null|undefined)$/i.test(trimmed)) return false;
  return true;
}

export function cleanProductName(text: string): string {
  if (!text) return '';
  let cleaned = text;

  // Rule 1: Strip leading price prefixes e.g. "sỉ:", "giá sỉ:", "giá lẻ:", "bán sỉ:"
  cleaned = cleaned.replace(/^(?:giá\s*(?:sỉ|lẻ|bán|bán\s*sỉ)?|sỉ|lẻ|bán\s*sỉ)\s*:?\s*/gi, '').trim();

  // Rule 2: Strip any embedded or trailing price expressions
  cleaned = cleaned
    .replace(/(?:\+84|0)\s*\d{2,3}[\.\s\-]?\d{3,4}[\.\s\-]?\d{3,4}\b/g, '')
    .replace(/(?:SĐT|LH|Liên\s*hệ)\s*:?\s*[\d\s\.\-]+/gi, '')
    .replace(/(?:Giá\s*(?:sỉ|lẻ|bán|bán\s*sỉ)?:?\s*)?[\d\.,]+\s*(?:đ|vnd|vnđ|triệu|tr|ngàn|k|vn)\b/gi, '')
    .replace(/\b\d{1,3}(?:[\.,]\d{3}){1,3}\b/g, '')
    .replace(/\b\d*\s*000\s*(?:vn|vnđ|vnd|đ)?\b/gi, '')
    .replace(/\b(?:Slide|Trang)\s*\d+\b/gi, '')
    .replace(/^(?:\d+[\.\)]\s*)?(?:Tên\s*(?:sản\s*phẩm|SP)?:?|Sản\s*phẩm:?)\s*/gi, '')
    .trim();

  // Clean trailing punctuation, colons, dashes or commas
  cleaned = cleaned.replace(/^[-:,\s]+|[-:,\s]+$/g, '').trim();
  return cleaned;
}

export function smartExtractName(text: string, slideNum: number): string {
  if (!text) return `Máy nông cơ Slide ${slideNum}`;
  const lines = text.split(/\r?\n|\.\s+/).map((s) => s.trim()).filter(Boolean);
  for (const line of lines) {
    const cleaned = cleanProductName(line);
    if (isValidProductName(cleaned) && cleaned.length < 80) {
      return cleaned;
    }
  }
  const fallback = cleanProductName(lines[0] || '');
  return isValidProductName(fallback) ? fallback.substring(0, 60) : `Máy nông cơ Slide ${slideNum}`;
}

/**
 * Attempts to extract a model number from text (e.g., "FJ500", "DC-70", "YM357A").
 */
export function smartExtractModel(text: string): string {
  if (!text) return 'N/A';
  const clean = text.replace(/(?:giá\s*(?:sỉ|lẻ|bán|bán\s*sỉ)?|000\s*vn|vnđ|vnd|850k|100k|sđt|lh).*$/gi, '');
  const match = clean.match(/\b([A-Z0-9]{2,10}[-\s]?[A-Z0-9]{2,10})\b/);
  if (match) {
    const candidate = match[1].trim();
    if (!/^(000|000\s*VN|VND|VNĐ|GIÁ|SỈ|LẺ|BÁN|SĐT|SLIDE|TRANG)$/i.test(candidate)) {
      return candidate;
    }
  }
  return 'N/A';
}

/**
 * Attempts to extract a brand name from text.
 * Checks against a provided list of known brands and a built-in list of popular
 * agricultural machinery brands in Vietnam.
 */
export function smartExtractBrand(text: string, brands: string[] = []): string {
  if (!text) return 'Nông Cơ';

  // 1. Check known brands from DB or parameter
  for (const b of brands) {
    if (b && new RegExp(`\\b${b.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(text)) {
      return b;
    }
  }

  // 2. Popular machinery brands in Vietnam
  const popularBrands = [
    'Honda', 'Kubota', 'Yanmar', 'Kaito', 'Dewoo', 'Hyundai', 'Oshima', 'Kasei', 'Husqvarna',
    'Stihl', 'Makita', 'Bosch', 'Daewoo', 'Mitsubishi', 'Robin', 'Shindaiwa', 'Maruyama',
    'Vicno', 'Vinafarm', 'Tohatsu', 'Bambata', 'Mitsuyama', 'Koshin', 'Tsurumi', 'Elemax',
  ];
  for (const b of popularBrands) {
    if (new RegExp(`\\b${b}\\b`, 'i').test(text)) return b;
  }

  // 3. Look for ALL-CAPS brand names (e.g., KAITO, DEWOO)
  const capsMatch = text.match(/\b([A-Z]{3,15})\b/g);
  if (capsMatch) {
    for (const word of capsMatch) {
      if (!/^(BÌNH|XỊT|ĐIỆN|BƠM|MÁY|NÔNG|CƠ|SLIDE|TRANG|VNĐ|VND|MODEL|THUỐC|CÓ|ĐẢO|HÀNG|GIÁ|BÁN|NHẬP|KHẨU)$/i.test(word)) {
        return word;
      }
    }
  }

  return 'Nông Cơ';
}

/**
 * Attempts to categorize a product based on keywords in the text.
 */
export function smartExtractCategory(text: string, categories: string[] = []): string {
  for (const c of categories) {
    if (c && new RegExp(c, 'i').test(text)) return c;
  }
  if (/cày/i.test(text)) return 'MÁY CÀY';
  if (/xới/i.test(text)) return 'MÁY XỚI ĐẤT';
  if (/gặt/i.test(text)) return 'MÁY GẶT ĐẬP';
  if (/bơm/i.test(text)) return 'MÁY BƠM NƯỚC';
  if (/phát điện/i.test(text)) return 'MÁY PHÁT ĐIỆN';
  if (/cắt cỏ/i.test(text)) return 'MÁY CẮT CỎ';
  return 'MÁY NÔNG CƠ';
}
