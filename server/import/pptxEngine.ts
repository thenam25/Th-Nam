import JSZip from 'jszip';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from '../db.js';
import { ImportJob, ImportItem, PPTXShapeObject, PPTXSlideData } from '../../src/types/index.js';
import {
  normalizeMediaPath,
  extractSpatialShapesFromXml,
  getSpatialTextForImages,
  computeImageCandidateScores,
  findBestAssignment,
} from '../../shared/pptParser.js';
import {
  detectColorsInText,
  isValidProductName,
  isValidBrand,
  cleanProductName,
  smartExtractName,
  smartExtractModel,
  smartExtractBrand,
  smartExtractCategory,
} from '../../shared/nameUtils.js';
import {
  normalizePriceNumber,
  smartExtractPrice,
  resolveExtractedPrice,
} from '../../shared/priceUtils.js';

import { config } from '../config.js';

// Server side Gemini client setup - lazy initialized to avoid crashing on missing key
let aiClientInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = config.geminiApiKey;
  if (!apiKey) {
    return null;
  }
  if (!aiClientInstance) {
    try {
      aiClientInstance = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.error('Lỗi khởi tạo GoogleGenAI:', err);
      return null;
    }
  }
  return aiClientInstance;
}

async function generateContentWithRetry(params: any, maxRetries = 1, initialDelayMs = 1000) {
  const ai = getGeminiClient();
  if (!ai) {
    console.warn('[PPTX Import] GEMINI_API_KEY chưa được cấu hình. Sử dụng bóc tách XML thủ công (không AI).');
    return null;
  }
  let delay = initialDelayMs;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      const errStr = String(err?.message || err);
      const isQuota = err?.status === 429 || errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('quota');
      if (isQuota && attempt < maxRetries) {
        console.warn(`[PPTX Import] Gemini quota exceeded, retrying in ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
      } else {
        // Return null on quota/network error so caller falls back to local parsing
        console.warn(`[PPTX Import] Gemini API error (attempt ${attempt + 1}):`, errStr.substring(0, 200));
        return null;
      }
    }
  }
  return null;
}

/** Check if Gemini AI is available */
export function isGeminiAvailable(): boolean {
  return getGeminiClient() !== null;
}

async function extractProductsFromSlideWithAI(
  slide: PPTXSlideData,
  knownCategories: string[],
  knownBrands: string[],
  slideMode: 'MULTI_PRODUCT' | 'SINGLE_PRODUCT' = 'MULTI_PRODUCT'
): Promise<ImportItem[]> {
  const spatialPairs = getSpatialTextForImages(slide);
  const numImages = Math.max(slide.images.length, spatialPairs.length);

  // === CHẾ ĐỘ 1 SLIDE = 1 SẢN PHẨM (Nhiều hình chi tiết gộp vào 1 sản phẩm) ===
  if (slideMode === 'SINGLE_PRODUCT' && (numImages > 0 || slide.extractedText)) {
    const allImages = spatialPairs.map((p) => p.imgUrl).filter(Boolean);
    const finalImages = allImages.length > 0 ? allImages : slide.images;

    const slideLines = (slide.extractedText || '')
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    const primaryCandidate =
      slideLines.map((l) => cleanProductName(l)).find((l) => isValidProductName(l)) ||
      `Sản phẩm Slide ${slide.slideNumber}`;

    const contentsParts: any[] = [];
    const prompt = `Bạn là hệ thống AI bóc tách catalog sản phẩm PowerPoint chuyên nghiệp.
Slide ${slide.slideNumber} này CHỈ CHỨA 1 SẢN PHẨM DUY NHẤT (có ${finalImages.length} hình ảnh chi tiết/góc chụp).

DỮ LIỆU NỘI DUNG VĂN BẢN TRÊN SLIDE ${slide.slideNumber}:
${slideLines.length > 0 ? slideLines.map((l, i) => `${i + 1}. "${l}"`).join('\n') : '(Không có văn bản)'}

Nhiệm vụ: Hãy bóc tách thông tin sản phẩm duy nhất này thành JSON:
- 'productName': Tên sản phẩm chính đầy đủ (TUYỆT ĐỐI KHÔNG chứa "giá:", "sỉ:").
- 'model': Mã model sản phẩm.
- 'brand': Thương hiệu.
- 'category': Danh mục sản phẩm.
- 'priceText': Chuỗi chữ/con số ghi giá tiền tìm thấy (Ví dụ: '15.5tr', '15.000.000đ', '850k', 'Sỉ 12.5', '12500', 'Giá 15tr5').
- 'price': Số tiền nguyên VNĐ đã quy đổi (Ví dụ: 15.5tr -> 15500000, 850k -> 850000, 15.000.000 -> 15000000). Nếu không thấy giá thì để 0.
- 'description': Mô tả chi tiết từ slide.

CỰC KỲ QUAN TRỌNG VỀ ĐỌC GIÁ TIỀN (PRICE):
1. BẮT BUỘC SỬ DỤNG TƯ DUY THỊ GIÁC VÀ ĐỌC OCR CẢ TRÊN TẤT CẢ CÁC HÌNH ẢNH CỦA SLIDE (đọc nhãn dán giá, chữ in trên ảnh, khung bảng giá) VÀ TRONG NỘI DUNG VĂN BẢN.
2. Nhận diện mọi kiểu ghi giá: "Sỉ:...", "Giá:...", "Giá sỉ:...", "Bán:...", "Lẻ:...", "15.5tr", "15tr5", "850k", "15.000.000", hoặc chữ số đi kèm nhãn giá.
3. Quy đổi chính xác về số nguyên VNĐ đầy đủ.`;

    contentsParts.push({ text: prompt });

    for (let imgIdx = 0; imgIdx < Math.min(finalImages.length, 6); imgIdx++) {
      const dataUri = finalImages[imgIdx];
      const match = dataUri.match(/^data:(image\/[a-z\+\-]+);base64,(.+)$/);
      if (match) {
        contentsParts.push({
          inlineData: {
            mimeType: match[1].includes('jpeg') || match[1].includes('jpg') ? 'image/jpeg' : 'image/png',
            data: match[2],
          },
        });
      }
    }

    try {
      const response = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: { parts: contentsParts },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productName: { type: Type.STRING },
              model: { type: Type.STRING },
              brand: { type: Type.STRING },
              category: { type: Type.STRING },
              priceText: { type: Type.STRING },
              price: { type: Type.NUMBER },
              description: { type: Type.STRING },
            },
            required: ['productName'],
          },
        },
      });

      if (response?.text) {
        const p = JSON.parse(response.text.trim());
        const cleanName = cleanProductName(p.productName || primaryCandidate);

        const finalPrice = resolveExtractedPrice(p.price, p.priceText, [
          p.description,
          slide.extractedText,
          ...slideLines,
          ...spatialPairs.map((s) => s.matchedText),
        ]);

        return [
          {
            id: `item-${Date.now()}-s${slide.slideNumber}`,
            importJobId: 'job-default',
            slideNumber: slide.slideNumber,
            sourceObjectIds: slide.objects ? slide.objects.map((o) => o.id) : [],
            imageUrl: finalImages[0] || 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?w=800&auto=format&fit=crop&q=80',
            images: finalImages,
            rawText: slide.extractedText,
            extractedName: isValidProductName(cleanName) ? cleanName : `Sản phẩm Slide ${slide.slideNumber}`,
            extractedPrice: finalPrice,
            priceType: finalPrice && finalPrice > 0 ? 'FIXED' : 'CONTACT',
            extractedModel: p.model || smartExtractModel(slide.extractedText),
            extractedSku: `SKU-SL${slide.slideNumber}-${Date.now()}`,
            extractedBrand: smartExtractBrand(p.brand || slide.extractedText, knownBrands),
            extractedCategory: smartExtractCategory(p.category || slide.extractedText, knownCategories),
            extractedDescription: p.description || slide.extractedText,
            confidence: { productName: 0.95, model: 0.95, brand: 0.95, price: 0.95, category: 0.95, overall: 0.95 },
            status: 'AUTO_APPROVED',
            reviewReason: 'Bóc tách tự động (Chế độ 1 Slide = 1 Sản phẩm gộp nhiều ảnh)',
            isEditedByAdmin: false,
          },
        ];
      }
    } catch (err) {
      console.warn('Single product AI parse failed, using rule-based fallback:', err);
    }

    return [
      {
        id: `item-${Date.now()}-s${slide.slideNumber}`,
        importJobId: 'job-default',
        slideNumber: slide.slideNumber,
        sourceObjectIds: slide.objects ? slide.objects.map(o => o.id) : [],
        imageUrl: finalImages[0] || 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?w=800&auto=format&fit=crop&q=80',
        images: finalImages,
        rawText: slide.extractedText,
        extractedName: primaryCandidate,
        extractedPrice: smartExtractPrice(slide.extractedText),
        priceType: smartExtractPrice(slide.extractedText) ? 'FIXED' : 'CONTACT',
        extractedModel: smartExtractModel(slide.extractedText),
        extractedSku: `SKU-SL${slide.slideNumber}`,
        extractedBrand: smartExtractBrand(slide.extractedText, knownBrands),
        extractedCategory: smartExtractCategory(slide.extractedText, knownCategories),
        extractedDescription: slide.extractedText,
        confidence: { productName: 0.9, model: 0.9, brand: 0.9, price: 0.9, category: 0.9, overall: 0.9 },
        status: 'AUTO_APPROVED',
        reviewReason: 'Bóc tách tự động gộp ảnh Slide',
        isEditedByAdmin: false,
      },
    ];
  }

  if (numImages > 0) {
    const items: ImportItem[] = [];
    const maxImgs = Math.min(numImages, 6);

    const slideLines = (slide.extractedText || '')
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    const candidateTitleLines = slideLines
      .map((l) => cleanProductName(l))
      .filter((l) => isValidProductName(l));

    // Deduplicate candidate title lines preserving order
    const uniqueCandidateLines = candidateTitleLines.filter(
      (c, idx) => candidateTitleLines.findIndex((x) => x.toLowerCase() === c.toLowerCase()) === idx
    );

    const contentsParts: any[] = [];
    const prompt = `Bạn là hệ thống AI bóc tách catalog sản phẩm PowerPoint thông minh với khả năng TƯ DUY THỊ GIÁC VÀ LÝ TRÍ CHÍNH XÁC.
Slide ${slide.slideNumber} có ${maxImgs} sản phẩm.

DANH SÁCH TẤT CẢ DÒNG VĂN BẢN TRÊN SLIDE ${slide.slideNumber}:
${slideLines.length > 0 ? slideLines.map((l, i) => `${i + 1}. "${l}"`).join('\n') : '(Không có văn bản)'}

DANH SÁCH TÊN SẢN PHẨM ỨNG VIÊN PHÁT HIỆN TRÊN SLIDE (${uniqueCandidateLines.length} mẫu mã):
${uniqueCandidateLines.length > 0 ? uniqueCandidateLines.map((c, i) => `Candidate [${i}]: "${c}"`).join('\n') : '(Không tìm thấy dòng tiêu đề rõ ràng, đọc từ nội dung slide)'}

QUY TRÌNH THỊ GIÁC (COMPUTER VISION) VÀ KHỚP TÊN SẢN PHẨM:
1. ĐẶC BIỆT CHÚ Ý: Slide này chứa ${maxImgs} hình ảnh sản phẩm tương ứng với imageIndex = 0, 1, ..., ${maxImgs - 1}.
2. QUAN SÁT TRỰC TIẾP TỪNG BỨC ÁNH imageIndex:
   - Nhận diện MÀU SẮC THỊ GIÁC nổi bật của sản phẩm (VD: "VÀNG", "XANH", "ĐỎ", "CAM", "TRẮNG", "ĐEN"...).
3. KHỚP ẢNH imageIndex VỚI ĐÚNG CANDIDATE:
   - Nhìn vào Danh Sách Candidate ở trên. Tìm Candidate nào chứa từ ngữ màu sắc / mẫu mã KHỚP CHÍNH XÁC VỚI BỨC ÁNH ĐÓ!
   - Ví dụ: Ảnh có màu VÀNG -> Chọn Candidate chứa từ "VÀNG". TUYỆT ĐỐI KHÔNG chọn Candidate chứa chữ "ĐỎ" hay "XANH".
   - Điền \`matchedCandidateIndex\` = chỉ số Candidate (0, 1, 2...) được chọn.
   - Điền \`visualColor\` = tên màu sắc quan sát thấy (VÀNG, XANH, ĐỎ, ...).
4. QUY TẮC DỮ LIỆU CÁC TRƯỜNG:
   - 'productName': Tên sản phẩm chuẩn chỉnh, TUYỆT ĐỐI KHÔNG chứa "sỉ:", "giá sỉ", "giá:", "85 Đ", "720.000đ".
   - 'priceText': Chuỗi chữ/số ghi giá tìm thấy trên văn bản hoặc hình ảnh (OCR), ví dụ '15.5tr', '850k', '15.000.000', 'Sỉ 12.5'.
   - 'price': Số tiền nguyên VNĐ đằng sau "sỉ:", "giá sỉ:", "giá lẻ:", "giá:" hoặc ghi trên ảnh (Ví dụ 15.5tr -> 15500000).`;

    contentsParts.push({ text: prompt });

    for (let imgIdx = 0; imgIdx < maxImgs; imgIdx++) {
      contentsParts.push({
        text: `\n=== [HÌNH ÁNH imageIndex = ${imgIdx}] ===`,
      });

      const dataUri = spatialPairs[imgIdx]?.imgUrl || slide.images[imgIdx] || '';
      const match = dataUri.match(/^data:(image\/[a-z\+\-]+);base64,(.+)$/);
      if (match) {
        contentsParts.push({
          inlineData: {
            mimeType: match[1].includes('jpeg') || match[1].includes('jpg') ? 'image/jpeg' : 'image/png',
            data: match[2],
          },
        });
      }
    }

    try {
      const response = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: { parts: contentsParts },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                imageIndex: { type: Type.NUMBER },
                visualColor: { type: Type.STRING, description: 'Màu sắc thị giác quan sát thấy của sản phẩm trong ảnh' },
                matchedCandidateIndex: { type: Type.NUMBER, description: 'Chỉ số Candidate (0, 1, 2...) có tên khớp đúng màu sắc với ảnh này' },
                thinkingProcess: {
                  type: Type.STRING,
                  description: 'Phân tích thị giác: 1) Màu sắc/mẫu mã của ảnh. 2) Khớp đúng candidate. 3) Giá bán & Model.',
                },
                productName: { type: Type.STRING },
                model: { type: Type.STRING },
                brand: { type: Type.STRING },
                category: { type: Type.STRING },
                priceText: { type: Type.STRING },
                price: { type: Type.NUMBER },
                priceType: { type: Type.STRING },
                sku: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ['imageIndex', 'productName'],
            },
          },
        },
      });

      if (response?.text) {
        const parsedArray = JSON.parse(response.text.trim());
        if (Array.isArray(parsedArray) && parsedArray.length > 0) {
          let mainSlideTitle = uniqueCandidateLines[0] || '';

          // 1. Raw extraction pass
          const extractedList: {
            imgIdx: number;
            dataUri: string;
            p: any;
            spatialText: string;
            visualColor: string;
            cleanName: string;
          }[] = [];

          for (let imgIdx = 0; imgIdx < maxImgs; imgIdx++) {
            const dataUri = spatialPairs[imgIdx]?.imgUrl || slide.images[imgIdx] || '';
            const p = parsedArray.find((item: any) => item.imageIndex === imgIdx) || parsedArray[imgIdx] || {};
            const spatialText = spatialPairs[imgIdx]?.matchedText || '';
            const visualColor = p.visualColor || '';

            let cleanName = p.productName ? cleanProductName(p.productName) : '';

            if (!isValidProductName(cleanName)) {
              cleanName = cleanProductName(spatialText);
            }

            extractedList.push({
              imgIdx,
              dataUri,
              p,
              spatialText,
              visualColor,
              cleanName,
            });
          }

          // 2. Compute Optimal Color & Bipartite Candidate Matching
          const scores = computeImageCandidateScores(extractedList, uniqueCandidateLines);
          const bestAssignment = findBestAssignment(scores, extractedList.length, uniqueCandidateLines.length);

          for (let i = 0; i < extractedList.length; i++) {
            const assignedCandIdx = bestAssignment[i];
            const item = extractedList[i];

            if (assignedCandIdx !== -1 && uniqueCandidateLines[assignedCandIdx]) {
              item.cleanName = uniqueCandidateLines[assignedCandIdx];
            } else if (!isValidProductName(item.cleanName)) {
              item.cleanName = mainSlideTitle || `Sản phẩm ${item.imgIdx + 1} Slide ${slide.slideNumber}`;
            }
          }

          // 3. Smart Deduplication with Color or Variant suffix
          const nameCounts = new Map<string, number>();
          for (const item of extractedList) {
            const key = item.cleanName.toLowerCase();
            nameCounts.set(key, (nameCounts.get(key) || 0) + 1);
          }

          const nameOccurrences = new Map<string, number>();
          for (const item of extractedList) {
            const key = item.cleanName.toLowerCase();
            const total = nameCounts.get(key) || 1;
            if (total > 1) {
              const current = (nameOccurrences.get(key) || 0) + 1;
              nameOccurrences.set(key, current);
              const suffix = item.visualColor ? ` (${item.visualColor})` : ` (Mẫu ${current})`;
              if (!/\(Mẫu\s*\d+\)$/i.test(item.cleanName) && !/\(Biến\s*thể\s*\d+\)$/i.test(item.cleanName)) {
                item.cleanName = `${item.cleanName}${suffix}`;
              }
            }
          }

          // 4. Construct final ImportItem objects
          for (const item of extractedList) {
            const { imgIdx, dataUri, p, spatialText, cleanName } = item;

            // Resolve Price
            const extractedPrice = resolveExtractedPrice(p.price, p.priceText, [
              spatialText,
              p.description,
              slideLines[imgIdx],
              slide.extractedText,
            ]);

            const priceType = p.priceType === 'CONTACT' || !extractedPrice ? 'CONTACT' : 'FIXED';

            // Resolve Brand
            let extractedBrand = isValidBrand(p.brand) ? p.brand : '';
            if (!extractedBrand) {
              extractedBrand = smartExtractBrand(`${cleanName} ${spatialText} ${slide.extractedText}`, knownBrands);
            }

            // Resolve Model
            const extractedModel =
              p.model && p.model !== 'N/A' && p.model.length >= 2
                ? p.model
                : smartExtractModel(`${cleanName} ${spatialText}`);

            // Resolve Category
            let extractedCategory = p.category && knownCategories.includes(p.category) ? p.category : '';
            if (!extractedCategory) {
              extractedCategory = smartExtractCategory(
                `${cleanName} ${spatialText} ${slide.extractedText}`,
                knownCategories
              );
            }

            items.push({
              id: `item-${slide.slideNumber}-${imgIdx + 1}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              importJobId: '',
              slideNumber: slide.slideNumber,
              sourceObjectIds: slide.objects.map((o) => o.id),
              imageUrl: dataUri,
              images: [dataUri],
              rawText: spatialText || p.description || slide.extractedText,
              extractedName: cleanName,
              extractedModel: extractedModel,
              extractedBrand: extractedBrand,
              extractedCategory: extractedCategory,
              extractedPrice: extractedPrice,
              priceType: priceType,
              extractedSku: p.sku || `SKU-SL${slide.slideNumber}-${imgIdx + 1}`,
              extractedDescription: p.description || spatialText || `Sản phẩm #${imgIdx + 1} bóc tách từ slide ${slide.slideNumber}.`,
              extractedSpecifications: {},
              confidence: {
                productName: 0.95,
                model: 0.90,
                brand: 0.90,
                price: 0.95,
                category: 0.90,
                overall: 0.92,
              },
              status: 'AUTO_APPROVED',
              reviewReason: '',
            });
          }
          return items;
        }
      }
    } catch {
      // Quiet fallback when AI is unavailable or rate-limited
    }
  }

  // Fallback
  return createFallbackImportItems(slide, slide.slideNumber - 1, '', knownCategories, knownBrands);
}

function createFallbackImportItems(
  slide: PPTXSlideData,
  slideIndex: number,
  jobId: string,
  knownCategories: string[],
  knownBrands: string[]
): ImportItem[] {
  const spatialPairs = getSpatialTextForImages(slide);
  const slideLines = (slide.extractedText || '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const candidateTitleLines = slideLines
    .map((l) => cleanProductName(l))
    .filter((l) => isValidProductName(l));

  const uniqueCandidateLines = candidateTitleLines.filter(
    (c, idx) => candidateTitleLines.findIndex((x) => x.toLowerCase() === c.toLowerCase()) === idx
  );

  const mainSlideTitle = uniqueCandidateLines[0] || '';

  if (spatialPairs.length > 0) {
    const items: ImportItem[] = [];

    const extractedList = spatialPairs.map((pair, imgIdx) => {
      const textToUse = pair.matchedText || slide.extractedText || '';
      return {
        imgIdx,
        visualColor: '',
        p: null,
        spatialText: textToUse,
        cleanName: cleanProductName(textToUse),
      };
    });

    const scores = computeImageCandidateScores(extractedList, uniqueCandidateLines);
    const bestAssignment = findBestAssignment(scores, extractedList.length, uniqueCandidateLines.length);

    for (let imgIdx = 0; imgIdx < spatialPairs.length; imgIdx++) {
      const { imgUrl, matchedText, imgObj } = spatialPairs[imgIdx];
      const textToUse = matchedText || slide.extractedText || '';
      const price = resolveExtractedPrice(null, undefined, [
        textToUse,
        slideLines[imgIdx],
        slide.extractedText,
      ]);

      let name = cleanProductName(textToUse);
      const assignedCandIdx = bestAssignment[imgIdx];

      if (assignedCandIdx !== -1 && uniqueCandidateLines[assignedCandIdx]) {
        name = uniqueCandidateLines[assignedCandIdx];
      } else if (!isValidProductName(name)) {
        name = mainSlideTitle || `Sản phẩm ${imgIdx + 1} Slide ${slide.slideNumber}`;
      }

      const model = smartExtractModel(textToUse + ' ' + name);
      const brand = smartExtractBrand(textToUse + ' ' + name + ' ' + slide.extractedText, knownBrands);
      const category = smartExtractCategory(textToUse + ' ' + name + ' ' + slide.extractedText, knownCategories);

      items.push({
        id: `item-fb-${slide.slideNumber}-${imgIdx + 1}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        importJobId: jobId,
        slideNumber: slide.slideNumber,
        sourceObjectIds: [imgObj.id],
        imageUrl: imgUrl,
        images: [imgUrl],
        rawText: textToUse,
        extractedName: name,
        extractedModel: model,
        extractedBrand: brand,
        extractedCategory: category,
        extractedPrice: price,
        priceType: price ? 'FIXED' : 'CONTACT',
        extractedDescription: textToUse || `Sản phẩm #${imgIdx + 1} bóc tách từ Slide ${slide.slideNumber}`,
        extractedSpecifications: {},
        confidence: {
          productName: 0.85,
          model: 0.8,
          brand: 0.8,
          price: price ? 0.9 : 0.7,
          category: 0.8,
          overall: 0.83,
        },
        status: 'AUTO_APPROVED',
        reviewReason: '',
      });
    }

    // Ensure non-empty and unique product names in fallback
    const nameCounts = new Map<string, number>();
    for (const item of items) {
      const key = item.extractedName.toLowerCase();
      nameCounts.set(key, (nameCounts.get(key) || 0) + 1);
    }

    const nameOccurrences = new Map<string, number>();
    for (const item of items) {
      const key = item.extractedName.toLowerCase();
      const total = nameCounts.get(key) || 1;
      if (total > 1) {
        const current = (nameOccurrences.get(key) || 0) + 1;
        nameOccurrences.set(key, current);
        if (!/\(Mẫu\s*\d+\)$/i.test(item.extractedName) && !/\(Biến\s*thể\s*\d+\)$/i.test(item.extractedName)) {
          item.extractedName = `${item.extractedName} (Mẫu ${current})`;
        }
      }
    }

    return items;
  }

  // Text-only fallback (no images)
  const items: ImportItem[] = [];

  for (let idx = 0; idx < Math.max(1, slideLines.length); idx++) {
    const line = slideLines[idx] || slide.extractedText;
    let name = cleanProductName(line);
    if (!isValidProductName(name)) {
      name = `Sản phẩm Slide ${slide.slideNumber}`;
    }
    const price = smartExtractPrice(line);

    items.push({
      id: `item-txt-${slide.slideNumber}-${idx + 1}-${Date.now()}`,
      importJobId: jobId,
      slideNumber: slide.slideNumber,
      sourceObjectIds: slide.objects.map((o) => o.id),
      imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?w=600&auto=format&fit=crop&q=80',
      images: [],
      rawText: line,
      extractedName: name,
      extractedModel: smartExtractModel(line),
      extractedBrand: smartExtractBrand(line, knownBrands),
      extractedCategory: smartExtractCategory(line, knownCategories),
      extractedPrice: price,
      priceType: price ? 'FIXED' : 'CONTACT',
      extractedDescription: line,
      extractedSpecifications: {},
      confidence: {
        productName: 0.8,
        model: 0.8,
        brand: 0.7,
        price: price ? 0.9 : 0.7,
        category: 0.7,
        overall: 0.76,
      },
      status: 'AUTO_APPROVED',
      reviewReason: '',
    });
  }

  return items;
}


/**
 * Main PPTX processing orchestrator.
 * Opens a PPTX file, extracts slides, runs AI extraction (with fallback),
 * and returns a complete ImportJob.
 */
export async function processPPTXFile(
  fileBuffer: Buffer,
  fileName: string,
  fileSize: number,
  slideMode: 'MULTI_PRODUCT' | 'SINGLE_PRODUCT' = 'MULTI_PRODUCT'
): Promise<ImportJob> {
  const zip = await JSZip.loadAsync(fileBuffer);
  const jobId = `job-${Date.now()}`;

  // 1. Read media image files
  const allMediaImagesMap: Record<string, string> = {};
  const mediaFiles = Object.keys(zip.files).filter((f) => f.startsWith('ppt/media/'));

  for (const mPath of mediaFiles) {
    try {
      const base64 = await zip.file(mPath)!.async('base64');
      const ext = mPath.split('.').pop()?.toLowerCase() || 'png';
      const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png';
      const dataUri = `data:${mime};base64,${base64}`;
      allMediaImagesMap[mPath] = dataUri;
      allMediaImagesMap[mPath.replace('ppt/', '')] = dataUri;
      const fileNameOnly = mPath.split('/').pop() || '';
      if (fileNameOnly) {
        allMediaImagesMap[fileNameOnly] = dataUri;
      }
    } catch (e) {
      console.warn('Failed reading media file:', mPath, e);
    }
  }

  // 2. Find all slide files
  const slideFileNames = Object.keys(zip.files)
    .filter((f) => /^ppt\/slides\/slide\d+\.xml$/i.test(f))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)![0], 10);
      const numB = parseInt(b.match(/\d+/)![0], 10);
      return numA - numB;
    });

  // 3. Get global known categories & brands
  const knownCategories: string[] = [];
  const knownBrands: string[] = [];
  try {
    const cats = await db.getCategories();
    cats.forEach((c: any) => { if (c?.name) knownCategories.push(c.name); });
    const brs = await db.getBrands();
    brs.forEach((b: any) => { if (b?.name) knownBrands.push(b.name); });
  } catch (e) {
    console.warn('Could not load categories/brands from DB for AI extraction:', e);
  }

  // 4. Process each slide
  const allItems: ImportItem[] = [];
  const parsedSlides: PPTXSlideData[] = [];

  for (let idx = 0; idx < slideFileNames.length; idx++) {
    const sPath = slideFileNames[idx];
    const slideNum = parseInt(sPath.match(/\d+/)![0], 10);
    const slideXmlStr = await zip.file(sPath)!.async('string');

    // Read rels
    const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
    const relsMap: Record<string, string> = {};
    if (zip.files[relsPath]) {
      const relsXml = await zip.file(relsPath)!.async('string');
      const relMatches = [...relsXml.matchAll(/<Relationship\s+[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g)];
      for (const m of relMatches) {
        relsMap[m[1]] = normalizeMediaPath(m[2]);
      }
    }

    // Extract spatial shapes and text
    const { shapes, slideText, imageUrls } = extractSpatialShapesFromXml(
      slideXmlStr,
      relsMap,
      allMediaImagesMap,
      slideNum
    );

    const slideData: PPTXSlideData = {
      slideNumber: slideNum,
      objects: shapes,
      extractedText: slideText,
      images: imageUrls,
    };
    parsedSlides.push(slideData);

    // Try AI extraction first, fall back to spatial matching
    try {
      const aiItems = await extractProductsFromSlideWithAI(slideData, knownCategories, knownBrands, slideMode);
      if (aiItems && aiItems.length > 0) {
        allItems.push(...aiItems);
        continue;
      }
    } catch (e) {
      console.warn(`AI extraction failed for slide ${slideNum}, using fallback:`, e);
    }

    // Fallback extraction
    const fallbackItems = createFallbackImportItems(slideData, idx, jobId, knownCategories, knownBrands);
    allItems.push(...fallbackItems);
  }

  // 5. Build and return ImportJob
  const importJob: ImportJob = {
    id: jobId,
    fileName,
    fileSize,
    status: 'READY_FOR_REVIEW',
    progressPercent: 100,
    currentStepMessage: `Đã bóc tách thành công ${allItems.length} sản phẩm từ file PPTX!`,
    totalSlides: slideFileNames.length,
    totalProductsDetected: allItems.length,
    totalProductsImported: 0,
    totalProductsNeedReview: allItems.filter((it) => it.status === 'NEEDS_REVIEW' || it.status === 'DUPLICATE').length,
    createdAt: new Date().toISOString(),
    items: allItems,
  };

  return importJob;
}

// Re-export shared utilities from this module for backward compatibility
export {
  normalizeMediaPath,
  extractSpatialShapesFromXml,
  getSpatialTextForImages,
  computeImageCandidateScores,
  findBestAssignment,
} from '../../shared/pptParser.js';

export {
  detectColorsInText,
  isValidProductName,
  isValidBrand,
  cleanProductName,
  smartExtractName,
  smartExtractModel,
  smartExtractBrand,
  smartExtractCategory,
} from '../../shared/nameUtils.js';

export {
  normalizePriceNumber,
  smartExtractPrice,
  resolveExtractedPrice,
} from '../../shared/priceUtils.js';
