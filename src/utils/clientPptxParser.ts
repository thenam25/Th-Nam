import JSZip from 'jszip';
import { ImportJob, ImportItem, PPTXSlideData } from '../types/index.js';
import {
  normalizeMediaPath,
  extractSpatialShapesFromXml,
  getSpatialTextForImages,
  computeImageCandidateScores,
  findBestAssignment,
} from '../../shared/pptParser.js';
import {
  isValidProductName,
  cleanProductName,
  smartExtractName,
  smartExtractModel,
  smartExtractBrand,
  smartExtractCategory,
} from '../../shared/nameUtils.js';
import {
  resolveExtractedPrice,
  smartExtractPrice,
} from '../../shared/priceUtils.js';

/**
 * Parses PPTX file entirely in browser using JSZip with high precision spatial matching.
 * This is the client-side (no AI) fallback parser.
 */
export async function parsePPTXClientSide(
  file: File,
  slideMode: 'MULTI_PRODUCT' | 'SINGLE_PRODUCT' = 'MULTI_PRODUCT',
  onProgress?: (percent: number) => void
): Promise<ImportJob> {
  onProgress?.(10);
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  onProgress?.(25);

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

  const parsedSlides: PPTXSlideData[] = [];
  const jobId = `job-${Date.now()}`;

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

    parsedSlides.push({
      slideNumber: slideNum,
      objects: shapes,
      extractedText: slideText,
      images: imageUrls,
    });

    const progress = 25 + Math.round(((idx + 1) / slideFileNames.length) * 50);
    onProgress?.(progress);
  }

  // 3. Build ImportItems from parsed slides with Spatial Matching
  const items: ImportItem[] = [];

  for (const slide of parsedSlides) {
    if (slideMode === 'SINGLE_PRODUCT') {
      const primaryImage = slide.images[0] || 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?w=600&auto=format&fit=crop&q=80';

      const slideLines = (slide.extractedText || '')
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);

      const candidate = slideLines.map((l) => cleanProductName(l)).find((l) => isValidProductName(l));
      const name = candidate || smartExtractName(slide.extractedText, slide.slideNumber);

      const price = resolveExtractedPrice(null, undefined, [
        slide.extractedText,
        ...slideLines,
      ]);

      items.push({
        id: `item-single-${slide.slideNumber}-${Date.now()}`,
        importJobId: jobId,
        slideNumber: slide.slideNumber,
        sourceObjectIds: slide.objects.map((o) => o.id),
        imageUrl: primaryImage,
        images: slide.images,
        rawText: slide.extractedText,
        extractedName: name,
        extractedModel: smartExtractModel(slide.extractedText),
        extractedBrand: smartExtractBrand(slide.extractedText),
        extractedCategory: smartExtractCategory(slide.extractedText),
        extractedPrice: price,
        priceType: price ? 'FIXED' : 'CONTACT',
        extractedDescription: slide.extractedText,
        extractedSpecifications: {},
        confidence: {
          productName: 0.9,
          model: 0.9,
          brand: 0.85,
          price: price ? 0.95 : 0.8,
          category: 0.85,
          overall: 0.89,
        },
        status: 'AUTO_APPROVED',
        reviewReason: 'Chế độ 1 Slide = 1 Sản phẩm gộp nhiều ảnh',
      });
    } else {
      // MULTI_PRODUCT mode with spatial 2D proximity alignment & bipartite matching
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

        const slideItems: ImportItem[] = [];

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
            name = mainSlideTitle || smartExtractName(textToUse, slide.slideNumber);
          }

          const model = smartExtractModel(textToUse + ' ' + name);
          const brand = smartExtractBrand(textToUse + ' ' + name + ' ' + slide.extractedText);
          const category = smartExtractCategory(textToUse + ' ' + name + ' ' + slide.extractedText);

          slideItems.push({
            id: `item-multi-${slide.slideNumber}-${imgIdx + 1}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
              productName: 0.88,
              model: 0.85,
              brand: 0.85,
              price: price ? 0.95 : 0.8,
              category: 0.85,
              overall: 0.88,
            },
            status: 'AUTO_APPROVED',
            reviewReason: '',
          });
        }

        // Deduplicate names with variant suffixing
        const nameCounts = new Map<string, number>();
        for (const item of slideItems) {
          const key = item.extractedName.toLowerCase();
          nameCounts.set(key, (nameCounts.get(key) || 0) + 1);
        }

        const nameOccurrences = new Map<string, number>();
        for (const item of slideItems) {
          const key = item.extractedName.toLowerCase();
          const total = nameCounts.get(key) || 1;
          if (total > 1) {
            const current = (nameOccurrences.get(key) || 0) + 1;
            nameOccurrences.set(key, current);
            if (!/\(Mẫu\s*\d+\)$/i.test(item.extractedName) && !/\(Biến\s*thể\s*\d+\)$/i.test(item.extractedName)) {
              item.extractedName = `${item.extractedName} (Mẫu ${current})`;
            }
          }
          items.push(item);
        }
      } else {
        // Fallback for text-only slide or no images
        const name = candidateTitleLines[0] || smartExtractName(slide.extractedText, slide.slideNumber);
        const price = resolveExtractedPrice(null, undefined, [slide.extractedText]);

        items.push({
          id: `item-fallback-${slide.slideNumber}-${Date.now()}`,
          importJobId: jobId,
          slideNumber: slide.slideNumber,
          sourceObjectIds: slide.objects.map((o) => o.id),
          imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?w=600&auto=format&fit=crop&q=80',
          images: [],
          rawText: slide.extractedText,
          extractedName: name,
          extractedModel: smartExtractModel(slide.extractedText),
          extractedBrand: smartExtractBrand(slide.extractedText),
          extractedCategory: smartExtractCategory(slide.extractedText),
          extractedPrice: price,
          priceType: price ? 'FIXED' : 'CONTACT',
          extractedDescription: slide.extractedText,
          extractedSpecifications: {},
          confidence: {
            productName: 0.8,
            model: 0.8,
            brand: 0.75,
            price: price ? 0.9 : 0.7,
            category: 0.75,
            overall: 0.79,
          },
          status: 'AUTO_APPROVED',
          reviewReason: '',
        });
      }
    }
  }

  onProgress?.(90);

  const importJob: ImportJob = {
    id: jobId,
    fileName: file.name,
    fileSize: file.size,
    status: 'READY_FOR_REVIEW',
    progressPercent: 100,
    currentStepMessage: `Đã bóc tách thành công ${items.length} sản phẩm từ file PPTX!`,
    totalSlides: slideFileNames.length,
    totalProductsDetected: items.length,
    totalProductsImported: 0,
    totalProductsNeedReview: items.filter((it) => it.status === 'NEEDS_REVIEW' || it.status === 'DUPLICATE').length,
    createdAt: new Date().toISOString(),
    items,
  };

  onProgress?.(100);
  return importJob;
}
