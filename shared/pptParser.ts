/**
 * Shared PPTX XML parsing & spatial matching utilities.
 * Used by both server (pptxEngine.ts) and client (clientPptxParser.ts).
 *
 * These functions parse raw PowerPoint Open XML to extract images, text shapes,
 * and their spatial positions, then match images to candidate product names
 * using color-aware bipartite assignment.
 */

import type { PPTXShapeObject, PPTXSlideData } from '../src/types/index.js';
import { detectColorsInText, isValidProductName, cleanProductName } from './nameUtils.js';

export function normalizeMediaPath(target: string): string {
  let cleaned = target.trim().replace(/\\/g, '/');
  if (cleaned.startsWith('../')) cleaned = cleaned.replace('../', '');
  if (cleaned.startsWith('/')) cleaned = cleaned.substring(1);
  if (cleaned.startsWith('ppt/')) return cleaned;
  if (cleaned.startsWith('media/')) return 'ppt/' + cleaned;
  return 'ppt/media/' + (cleaned.split('/').pop() || cleaned);
}

/** EMU (English Metric Units) to pixels conversion factor */
export const EMU_PER_PX = 9525;

/**
 * Extracts image and text shapes from a single slide's XML along with their
 * spatial coordinates.
 */
export function extractSpatialShapesFromXml(
  slideXmlStr: string,
  relsMap: Record<string, string>,
  allMediaImagesMap: Record<string, string>,
  slideNum: number
): { shapes: PPTXShapeObject[]; slideText: string; imageUrls: string[] } {
  const shapeObjects: PPTXShapeObject[] = [];
  const rawImageUrls: string[] = [];

  // 1. Extract Pictures (<p:pic>)
  const picMatches = [...slideXmlStr.matchAll(/<p:pic[\s\S]*?<\/p:pic>/g)];
  let picIdx = 0;

  for (const picMatch of picMatches) {
    const xml = picMatch[0];
    const offMatch = xml.match(/<a:off\s+x="(\d+)"\s+y="(\d+)"/);
    const extMatch = xml.match(/<a:ext\s+cx="(\d+)"\s+cy="(\d+)"/);
    const rIdMatch = xml.match(/r:(?:embed|link|blip)="([^"]+)"/);

    const x = offMatch ? parseInt(offMatch[1], 10) / EMU_PER_PX : 100 + picIdx * 200;
    const y = offMatch ? parseInt(offMatch[2], 10) / EMU_PER_PX : 100;
    const width = extMatch ? parseInt(extMatch[1], 10) / EMU_PER_PX : 200;
    const height = extMatch ? parseInt(extMatch[2], 10) / EMU_PER_PX : 200;

    const rId = rIdMatch ? rIdMatch[1] : '';
    const targetPath = relsMap[rId] || '';
    const dataUri = allMediaImagesMap[targetPath] || allMediaImagesMap[rId] || '';

    if (dataUri) {
      if (!rawImageUrls.includes(dataUri)) {
        rawImageUrls.push(dataUri);
      }
      shapeObjects.push({
        id: `obj-img-${slideNum}-${picIdx}`,
        type: 'image',
        x,
        y,
        width,
        height,
        imageRef: targetPath,
        imageUrl: dataUri,
      });
      picIdx++;
    }
  }

  // Fallback for images not inside <p:pic> tags directly (e.g. blip fill or shapes)
  if (shapeObjects.filter((o) => o.type === 'image').length === 0) {
    const rIdMatches = [...slideXmlStr.matchAll(/r:(?:embed|link|blip)="([^"]+)"/g)];
    for (const m of rIdMatches) {
      const rId = m[1];
      const targetPath = relsMap[rId] || '';
      const dataUri = allMediaImagesMap[targetPath] || allMediaImagesMap[rId] || '';
      if (dataUri && !rawImageUrls.includes(dataUri)) {
        rawImageUrls.push(dataUri);
        shapeObjects.push({
          id: `obj-img-${slideNum}-${picIdx}`,
          type: 'image',
          x: 100 + picIdx * 220,
          y: 100,
          width: 200,
          height: 200,
          imageRef: targetPath,
          imageUrl: dataUri,
        });
        picIdx++;
      }
    }
  }

  // Sort image shapes spatially (top-to-bottom, left-to-right)
  const imageShapes = shapeObjects.filter((o) => o.type === 'image' && o.imageUrl);
  imageShapes.sort((a, b) => {
    if (Math.abs(a.y - b.y) > 40) {
      return a.y - b.y;
    }
    return a.x - b.x;
  });

  const sortedImageUrls: string[] = imageShapes.map((s) => s.imageUrl!).filter(Boolean);
  for (const url of rawImageUrls) {
    if (!sortedImageUrls.includes(url)) {
      sortedImageUrls.push(url);
    }
  }

  // 2. Extract Text Shapes (<p:sp>, <p:graphicFrame>)
  const spMatches = [...slideXmlStr.matchAll(/(?:<p:sp[\s\S]*?<\/p:sp>|<p:graphicFrame[\s\S]*?<\/p:graphicFrame>)/g)];
  let txtIdx = 0;
  const allTexts: string[] = [];

  for (const spMatch of spMatches) {
    const xml = spMatch[0];
    const offMatch = xml.match(/<a:off\s+x="(\d+)"\s+y="(\d+)"/);
    const extMatch = xml.match(/<a:ext\s+cx="(\d+)"\s+cy="(\d+)"/);

    const x = offMatch ? parseInt(offMatch[1], 10) / EMU_PER_PX : 100;
    const y = offMatch ? parseInt(offMatch[2], 10) / EMU_PER_PX : 300 + txtIdx * 80;
    const width = extMatch ? parseInt(extMatch[1], 10) / EMU_PER_PX : 400;
    const height = extMatch ? parseInt(extMatch[2], 10) / EMU_PER_PX : 100;

    const pMatches = [...xml.matchAll(/<a:p[\s\S]*?<\/a:p>/g)];
    const pTexts: string[] = [];
    for (const p of pMatches) {
      const tMatches = [...p[0].matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)];
      const line = tMatches.map((m) => m[1].trim()).filter(Boolean).join(' ');
      if (line) pTexts.push(line);
    }

    const shapeText = pTexts.join('\n').trim();
    if (shapeText) {
      allTexts.push(shapeText);
      shapeObjects.push({
        id: `obj-txt-${slideNum}-${txtIdx}`,
        type: 'text',
        x,
        y,
        width,
        height,
        text: shapeText,
      });
      txtIdx++;
    }
  }

  // Fallback if no shape matched text directly
  if (allTexts.length === 0) {
    const textMatches = [...slideXmlStr.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)];
    const slideTextList = textMatches.map((m) => m[1].trim()).filter((t) => t.length > 0);
    if (slideTextList.length > 0) {
      const fallbackText = slideTextList.join('\n');
      allTexts.push(fallbackText);
      shapeObjects.push({
        id: `obj-txt-${slideNum}-fb`,
        type: 'text',
        x: 100,
        y: 400,
        width: 500,
        height: 150,
        text: fallbackText,
      });
    }
  }

  const slideText = allTexts.join('\n');
  return { shapes: shapeObjects, slideText, imageUrls: sortedImageUrls };
}

/**
 * For each image on a slide, finds the spatially closest text and returns
 * (imageUrl, matchedText) pairs sorted by position.
 */
export function getSpatialTextForImages(
  slide: PPTXSlideData
): { imgUrl: string; matchedText: string; imgObj: PPTXShapeObject }[] {
  const imageObjs = slide.objects.filter((o) => o.type === 'image' && o.imageUrl);
  const textObjs = slide.objects.filter((o) => o.type === 'text' && o.text);

  const sortedImageObjs = [...imageObjs].sort((a, b) => {
    if (Math.abs(a.y - b.y) > 40) {
      return a.y - b.y;
    }
    return a.x - b.x;
  });

  const slideLines = (slide.extractedText || '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const results: { imgUrl: string; matchedText: string; imgObj: PPTXShapeObject }[] = [];
  const targetCount = Math.max(slide.images.length, sortedImageObjs.length);

  for (let imgIdx = 0; imgIdx < targetCount; imgIdx++) {
    const imgObj = sortedImageObjs[imgIdx] || {
      id: `fb-${imgIdx}`,
      type: 'image' as const,
      x: 100 + imgIdx * 100,
      y: 100,
      width: 200,
      height: 200,
      imageUrl: slide.images[imgIdx] || '',
    };

    const imgCx = imgObj.x + imgObj.width / 2;
    const imgCy = imgObj.y + imgObj.height / 2;

    // Find closest text shape by Euclidean distance
    let bestText = '';
    let minDistance = Infinity;

    for (const txt of textObjs) {
      if (!txt.text) continue;
      const txtCx = txt.x + txt.width / 2;
      const txtCy = txt.y + txt.height / 2;
      const dist = Math.hypot(imgCx - txtCx, imgCy - txtCy);
      if (dist < minDistance) {
        minDistance = dist;
        bestText = txt.text;
      }
    }

    const titleLine = slideLines.find((l) => isValidProductName(cleanProductName(l))) || slideLines[0] || '';

    if (!bestText || bestText.trim().length === 0) {
      bestText = slideLines[imgIdx] || titleLine || '';
    } else if (!isValidProductName(cleanProductName(bestText)) && titleLine) {
      bestText = `${titleLine}\n${bestText}`;
    }

    results.push({
      imgUrl: imgObj.imageUrl || slide.images[imgIdx] || '',
      matchedText: bestText,
      imgObj,
    });
  }

  return results;
}

/**
 * Computes an N×M score matrix for assigning N images (extractedList)
 * to M candidate product names (candidateLines).
 *
 * Scoring factors:
 *   - Color match (+250) / conflict (-600)
 *   - Gemini explicit candidate choice (+120)
 *   - Exact name match (+150)
 *   - Substring match (+40, color-neutral)
 *   - Spatial text color match (+100)
 *   - Spatial text substring match (+50)
 *   - Index proximity (+10)
 */
export function computeImageCandidateScores(
  extractedList: {
    imgIdx: number;
    visualColor: string;
    p: any;
    spatialText: string;
    cleanName: string;
  }[],
  candidateLines: string[]
): number[][] {
  const N = extractedList.length;
  const M = candidateLines.length;
  const scores: number[][] = Array.from({ length: N }, () => Array(M).fill(0));

  for (let i = 0; i < N; i++) {
    const item = extractedList[i];
    const imgColors = new Set<string>([
      ...detectColorsInText(item.visualColor),
      ...detectColorsInText(item.p?.thinkingProcess || ''),
      ...detectColorsInText(item.p?.productName || ''),
      ...detectColorsInText(item.spatialText),
    ]);

    for (let j = 0; j < M; j++) {
      const cand = candidateLines[j];
      const candColors = detectColorsInText(cand);
      let s = 0;

      // Color matching & conflict penalty
      if (imgColors.size > 0 && candColors.size > 0) {
        let hasMatch = false;
        let hasConflict = false;

        for (const col of imgColors) {
          if (candColors.has(col)) {
            hasMatch = true;
          } else {
            hasConflict = true;
          }
        }

        if (hasMatch) {
          s += 250;
        } else if (hasConflict) {
          s -= 600;
        }
      }

      // Gemini explicit candidate choice
      if (typeof item.p?.matchedCandidateIndex === 'number' && item.p.matchedCandidateIndex === j) {
        s += 120;
      }

      // Exact candidate name match
      if (item.cleanName && cand.toLowerCase().trim() === item.cleanName.toLowerCase().trim()) {
        s += 150;
      } else if (
        item.cleanName &&
        candColors.size === 0 &&
        (cand.toLowerCase().includes(item.cleanName.toLowerCase()) || item.cleanName.toLowerCase().includes(cand.toLowerCase()))
      ) {
        s += 40;
      }

      // Spatial text match
      if (item.spatialText) {
        const spatColors = detectColorsInText(item.spatialText);
        if (spatColors.size > 0 && candColors.size > 0) {
          if ([...spatColors].some((c) => candColors.has(c))) {
            s += 100;
          }
        } else if (
          cand.toLowerCase().includes(item.spatialText.toLowerCase()) ||
          item.spatialText.toLowerCase().includes(cand.toLowerCase())
        ) {
          s += 50;
        }
      }

      // Index proximity heuristic
      if (i === j) {
        s += 10;
      }

      scores[i][j] = s;
    }
  }

  return scores;
}

/**
 * Greedy bipartite matching: assigns each image to at most one candidate,
 * selecting the highest-scoring pairs first.
 * Returns an array where result[imageIdx] = candidateIdx (or -1 if unmatched).
 */
export function findBestAssignment(scores: number[][], N: number, M: number): number[] {
  if (N === 0) return [];
  if (M === 0) return Array(N).fill(-1);

  const result: number[] = Array(N).fill(-1);
  const usedImages = new Set<number>();
  const usedCandidates = new Set<number>();

  const pairs: { imgIdx: number; candIdx: number; score: number }[] = [];
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      pairs.push({ imgIdx: i, candIdx: j, score: scores[i][j] });
    }
  }

  // Sort pairs by score in descending order
  pairs.sort((a, b) => b.score - a.score);

  for (const p of pairs) {
    if (!usedImages.has(p.imgIdx) && !usedCandidates.has(p.candIdx)) {
      usedImages.add(p.imgIdx);
      usedCandidates.add(p.candIdx);
      result[p.imgIdx] = p.candIdx;
    }
  }

  return result;
}
